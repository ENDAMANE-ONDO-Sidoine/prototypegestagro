"""
Services pour la gestion des paiements
"""
import logging
from typing import Dict, Optional, Any
from decimal import Decimal
from django.conf import settings
from django.utils import timezone
from django.db import transaction

from .models import Payment, PaymentAttempt, WebhookEvent
from .providers import AirtelMoneyProvider, MoovMoneyProvider, PaymentProviderError
from apps.buyers.models import Order
from apps.transport.models import Shipment
from django.contrib.contenttypes.models import ContentType

logger = logging.getLogger(__name__)


class PaymentService:
    """
    Service pour gérer les paiements
    """
    
    PROVIDER_CLASSES = {
        'airtel_money': AirtelMoneyProvider,
        'moov_money': MoovMoneyProvider,
    }
    
    @classmethod
    def get_provider(cls, provider_name: str) -> 'PaymentProvider':
        """
        Obtient une instance du provider de paiement
        
        Args:
            provider_name: Nom du provider ('airtel_money', 'moov_money')
            
        Returns:
            Instance du provider
            
        Raises:
            ValueError: Si le provider n'est pas supporté
        """
        if provider_name not in cls.PROVIDER_CLASSES:
            raise ValueError(f"Provider '{provider_name}' non supporté")
        
        provider_class = cls.PROVIDER_CLASSES[provider_name]
        
        # Récupération des credentials depuis les settings
        # Format attendu: AIRTEL_MONEY_API_KEY, AIRTEL_MONEY_API_SECRET, etc.
        api_key_setting = f"{provider_name.upper()}_API_KEY"
        api_secret_setting = f"{provider_name.upper()}_API_SECRET"
        sandbox_setting = f"{provider_name.upper()}_SANDBOX"
        
        api_key = getattr(settings, api_key_setting, None)
        api_secret = getattr(settings, api_secret_setting, None)
        sandbox = getattr(settings, sandbox_setting, True)
        
        if not api_key or not api_secret:
            logger.warning(
                f"Credentials manquants pour {provider_name}. "
                f"Utilisation des valeurs par défaut (mode développement)"
            )
            api_key = "dev_api_key"
            api_secret = "dev_api_secret"
        
        return provider_class(api_key=api_key, api_secret=api_secret, sandbox=sandbox)
    
    @classmethod
    @transaction.atomic
    def create_payment_for_transaction(
        cls,
        transaction_obj,
        payment_type: str,
        provider: str,
        payer_phone: str,
        payer_name: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Payment:
        """
        Crée un paiement générique pour une transaction (Order ou Shipment)
        
        Args:
            transaction_obj: Objet Order ou Shipment
            payment_type: Type de paiement ('order' ou 'shipment')
            provider: Nom du provider ('airtel_money', 'moov_money')
            payer_phone: Numéro de téléphone du payeur
            payer_name: Nom du payeur (optionnel)
            metadata: Métadonnées additionnelles
            
        Returns:
            Instance Payment créée
            
        Raises:
            PaymentProviderError: En cas d'erreur lors de la création du paiement
            ValueError: Si la transaction n'est pas éligible au paiement
        """
        # Validation du type de paiement
        if payment_type not in ['order', 'shipment']:
            raise ValueError(f"Type de paiement '{payment_type}' non supporté")
        
        # Vérifications spécifiques selon le type
        if payment_type == 'order':
            return cls._create_payment_for_order(transaction_obj, provider, payer_phone, payer_name, metadata)
        elif payment_type == 'shipment':
            return cls._create_payment_for_shipment(transaction_obj, provider, payer_phone, payer_name, metadata)
    
    @classmethod
    @transaction.atomic
    def _create_payment_for_order(
        cls,
        order: Order,
        provider: str,
        buyer_phone: str,
        buyer_name: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Payment:
        """
        Crée un paiement pour une commande
        
        Args:
            order: Commande à payer
            provider: Nom du provider ('airtel_money', 'moov_money')
            buyer_phone: Numéro de téléphone de l'acheteur
            buyer_name: Nom de l'acheteur (optionnel, utilise order.buyer si non fourni)
            metadata: Métadonnées additionnelles
            
        Returns:
            Instance Payment créée
            
        Raises:
            PaymentProviderError: En cas d'erreur lors de la création du paiement
            ValueError: Si la commande n'est pas éligible au paiement
        """
        # Vérifications préalables
        if order.payment_status == 'paid':
            raise ValueError("La commande est déjà payée")
        
        if order.total_amount <= 0:
            raise ValueError("Le montant de la commande doit être supérieur à 0")
        
        # Vérifier s'il existe déjà un paiement en cours pour cette commande
        content_type = ContentType.objects.get_for_model(Order)
        existing_payment = Payment.objects.filter(
            content_type=content_type,
            object_id=order.id,
            status__in=['pending', 'processing']
        ).first()
        
        if existing_payment:
            logger.info(f"Paiement existant trouvé pour la commande {order.order_number}: {existing_payment.payment_id}")
            return existing_payment
        
        # Récupération du provider
        payment_provider = cls.get_provider(provider)
        
        # Informations du client
        buyer_name = buyer_name or order.buyer.get_full_name() or order.buyer.email
        
        # Création du paiement via le provider
        try:
            provider_response = payment_provider.create_payment(
                amount=order.total_amount,
                currency=order.currency,
                order_reference=order.order_number,
                customer_phone=buyer_phone,
                customer_name=buyer_name,
                metadata=metadata or {}
            )
        except PaymentProviderError as e:
            logger.error(f"Erreur lors de la création du paiement via {provider}: {e}")
            raise
        
        # Création de l'objet Payment
        payment = Payment.objects.create(
            content_type=content_type,
            object_id=order.id,
            payer=order.buyer,
            payment_type='order',
            provider=provider,
            amount=order.total_amount,
            currency=order.currency,
            provider_reference=provider_response.get('reference'),
            provider_transaction_id=provider_response.get('transaction_id'),
            status='pending' if provider_response.get('status') == 'pending' else 'processing',
            metadata={
                **(metadata or {}),
                'provider_response': provider_response,
                'payment_url': provider_response.get('payment_url'),
            }
        )
        
        # Création de la première tentative
        PaymentAttempt.objects.create(
            payment=payment,
            attempt_number=1,
            status='succeeded' if provider_response.get('status') != 'failed' else 'failed',
            provider_response=provider_response
        )
        
        # Mise à jour du statut de paiement de la commande
        order.payment_status = 'pending'
        order.save(update_fields=['payment_status', 'updated_at'])
        
        logger.info(f"Paiement créé: {payment.payment_id} pour la commande {order.order_number}")
        
        return payment
    
    @classmethod
    @transaction.atomic
    def _create_payment_for_shipment(
        cls,
        shipment: Shipment,
        provider: str,
        payer_phone: str,
        payer_name: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Payment:
        """
        Crée un paiement pour un Shipment (Agriculteur → Transporteur)
        
        Args:
            shipment: Expédition à payer
            provider: Nom du provider ('airtel_money', 'moov_money')
            payer_phone: Numéro de téléphone du payeur (agriculteur)
            payer_name: Nom du payeur (optionnel)
            metadata: Métadonnées additionnelles
            
        Returns:
            Instance Payment créée
            
        Raises:
            PaymentProviderError: En cas d'erreur lors de la création du paiement
            ValueError: Si l'expédition n'est pas éligible au paiement
        """
        # Vérifications préalables
        if shipment.payment_status == 'paid':
            raise ValueError("Cette expédition est déjà payée")
        
        if shipment.transport_cost <= 0:
            raise ValueError("Le coût de transport doit être supérieur à 0")
        
        # Vérifier s'il existe déjà un paiement en cours pour cette expédition
        content_type = ContentType.objects.get_for_model(Shipment)
        existing_payment = Payment.objects.filter(
            content_type=content_type,
            object_id=shipment.id,
            status__in=['pending', 'processing']
        ).first()
        
        if existing_payment:
            logger.info(f"Paiement existant trouvé pour l'expédition {shipment.tracking_number}: {existing_payment.payment_id}")
            return existing_payment
        
        # Récupération du provider
        payment_provider = cls.get_provider(provider)
        
        # Récupération du payeur (agriculteur qui a créé l'expédition)
        payer = shipment.created_by
        payer_name = payer_name or payer.get_full_name() or payer.email
        
        # Création du paiement via le provider
        try:
            provider_response = payment_provider.create_payment(
                amount=shipment.transport_cost,
                currency=shipment.currency,
                order_reference=shipment.tracking_number,
                customer_phone=payer_phone,
                customer_name=payer_name,
                metadata=metadata or {}
            )
        except PaymentProviderError as e:
            logger.error(f"Erreur lors de la création du paiement via {provider}: {e}")
            raise
        
        # Création de l'objet Payment
        payment = Payment.objects.create(
            content_type=content_type,
            object_id=shipment.id,
            payer=payer,
            payment_type='shipment',
            provider=provider,
            amount=shipment.transport_cost,
            currency=shipment.currency,
            provider_reference=provider_response.get('reference'),
            provider_transaction_id=provider_response.get('transaction_id'),
            status='pending' if provider_response.get('status') == 'pending' else 'processing',
            metadata={
                **(metadata or {}),
                'provider_response': provider_response,
                'payment_url': provider_response.get('payment_url'),
            }
        )
        
        # Création de la première tentative
        PaymentAttempt.objects.create(
            payment=payment,
            attempt_number=1,
            status='succeeded' if provider_response.get('status') != 'failed' else 'failed',
            provider_response=provider_response
        )
        
        # Mise à jour du statut de paiement de l'expédition
        shipment.payment_status = 'pending'
        shipment.save(update_fields=['payment_status', 'updated_at'])
        
        logger.info(f"Paiement créé: {payment.payment_id} pour l'expédition {shipment.tracking_number}")
        
        return payment
    
    @classmethod
    @transaction.atomic
    def create_payment_for_order(
        cls,
        order: Order,
        provider: str,
        buyer_phone: str,
        buyer_name: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Payment:
        """
        Crée un paiement pour une commande (Acheteur → Agriculteur)
        Méthode de compatibilité - utilise create_payment_for_transaction en interne
        """
        return cls._create_payment_for_order(order, provider, buyer_phone, buyer_name, metadata)
    
    @classmethod
    @transaction.atomic
    def process_webhook_event(
        cls,
        provider: str,
        payload: Dict[str, Any],
        signature: Optional[str] = None
    ) -> WebhookEvent:
        """
        Traite un événement webhook du provider
        
        Args:
            provider: Nom du provider
            payload: Payload du webhook
            signature: Signature du webhook (pour vérification)
            
        Returns:
            WebhookEvent créé et traité
            
        Raises:
            PaymentProviderError: En cas d'erreur de traitement
        """
        # Récupération du provider
        payment_provider = cls.get_provider(provider)
        
        # Vérification de la signature si fournie
        if signature:
            payload_str = str(payload) if not isinstance(payload, str) else payload
            if not payment_provider.verify_webhook_signature(payload_str, signature):
                raise PaymentProviderError("Signature webhook invalide")
        
        # Parse de l'événement
        try:
            event_data = payment_provider.parse_webhook_event(payload)
        except Exception as e:
            logger.error(f"Erreur lors du parsing de l'événement webhook: {e}")
            raise PaymentProviderError(f"Erreur de parsing: {e}")
        
        # Création de l'événement webhook
        webhook_event = WebhookEvent.objects.create(
            provider=provider,
            event_type=event_data.get('event_type', 'unknown'),
            provider_transaction_id=event_data.get('transaction_id'),
            payload=payload,
            signature=signature or '',
            status='pending',
            attempts=1,
            last_attempt_at=timezone.now()
        )
        
        # Recherche du paiement correspondant
        payment = None
        if event_data.get('transaction_id'):
            payment = Payment.objects.filter(
                provider_transaction_id=event_data.get('transaction_id'),
                provider=provider
            ).first()
        
        # Si pas trouvé, essayer de trouver via order_reference
        if not payment and event_data.get('order_reference'):
            # Chercher dans Order ou Shipment
            from apps.buyers.models import Order
            from apps.transport.models import Shipment
            
            # Essayer Order
            order = Order.objects.filter(order_number=event_data.get('order_reference')).first()
            if order:
                content_type = ContentType.objects.get_for_model(Order)
                payment = Payment.objects.filter(
                    content_type=content_type,
                    object_id=order.id,
                    provider=provider
                ).first()
            
            # Si pas trouvé, essayer Shipment
            if not payment:
                shipment = Shipment.objects.filter(tracking_number=event_data.get('order_reference')).first()
                if shipment:
                    content_type = ContentType.objects.get_for_model(Shipment)
                    payment = Payment.objects.filter(
                        content_type=content_type,
                        object_id=shipment.id,
                        provider=provider
                    ).first()
        
        if payment:
            webhook_event.payment = payment
        
        # Traitement de l'événement selon son type
        try:
            cls._handle_webhook_event(webhook_event, event_data, payment_provider)
            webhook_event.status = 'processed'
            webhook_event.processed_at = timezone.now()
        except Exception as e:
            logger.error(f"Erreur lors du traitement de l'événement {webhook_event.event_id}: {e}")
            webhook_event.status = 'failed'
            webhook_event.error_message = str(e)
        
        webhook_event.save()
        
        return webhook_event
    
    @classmethod
    @transaction.atomic
    def _handle_webhook_event(
        cls,
        webhook_event: WebhookEvent,
        event_data: Dict[str, Any],
        payment_provider: 'PaymentProvider'
    ):
        """
        Traite un événement webhook selon son type
        
        Args:
            webhook_event: Événement webhook
            event_data: Données parsées de l'événement
            payment_provider: Provider de paiement
        """
        event_type = event_data.get('event_type', '')
        payment = webhook_event.payment
        
        if not payment:
            logger.warning(f"Aucun paiement trouvé pour l'événement {webhook_event.event_id}")
            return
        
        # Mapping des statuts selon le provider
        provider_status = event_data.get('status', '').lower()
        
        if 'success' in event_type.lower() or provider_status in ['success', 'succeeded', 'successful']:
            # Paiement réussi
            payment.status = 'succeeded'
            payment.paid_at = timezone.now()
            payment.metadata.update({
                'webhook_event_id': str(webhook_event.event_id),
                'webhook_data': event_data
            })
            payment.save()
            
            # Mise à jour de la transaction selon son type
            if payment.payment_type == 'order':
                order = payment.transaction
                order.payment_status = 'paid'
                order.status = 'confirmed'
                order.confirmed_at = timezone.now()
                order.save(update_fields=['payment_status', 'status', 'confirmed_at', 'updated_at'])
            elif payment.payment_type == 'shipment':
                shipment = payment.transaction
                shipment.payment_status = 'paid'
                shipment.save(update_fields=['payment_status', 'updated_at'])
            
            logger.info(f"Paiement {payment.payment_id} confirmé via webhook")
            
        elif 'fail' in event_type.lower() or provider_status in ['fail', 'failed', 'failure']:
            # Paiement échoué
            payment.status = 'failed'
            payment.failed_at = timezone.now()
            payment.failure_reason = event_data.get('error_message', 'Échec du paiement')
            payment.metadata.update({
                'webhook_event_id': str(webhook_event.event_id),
                'webhook_data': event_data
            })
            payment.save()
            
            # Mise à jour de la transaction selon son type
            if payment.payment_type == 'order':
                order = payment.transaction
                order.payment_status = 'failed'
                order.save(update_fields=['payment_status', 'updated_at'])
            elif payment.payment_type == 'shipment':
                shipment = payment.transaction
                shipment.payment_status = 'failed'
                shipment.save(update_fields=['payment_status', 'updated_at'])
            
            logger.warning(f"Paiement {payment.payment_id} échoué via webhook")
            
        else:
            logger.info(f"Événement webhook non traité: {event_type}")

