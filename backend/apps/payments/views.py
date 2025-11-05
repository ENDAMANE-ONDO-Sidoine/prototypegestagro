"""
Vues pour l'application payments
"""
import logging
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone

from .models import Payment, WebhookEvent
from .serializers import (
    PaymentSerializer,
    CreatePaymentSerializer,
    WebhookEventSerializer
)
from .services import PaymentService, PaymentProviderError
from apps.core.permissions import IsBuyerOrAdmin, IsFarmerOrAdmin
from .permissions import CanCreatePayment

logger = logging.getLogger(__name__)


class PaymentListView(generics.ListCreateAPIView):
    """
    Liste des paiements de l'utilisateur connecté
    Création d'un nouveau paiement (Order ou Shipment)
    """
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated, CanCreatePayment]
    
    def get_queryset(self):
        """Retourne les paiements de l'utilisateur connecté"""
        queryset = Payment.objects.filter(payer=self.request.user)
        
        # Filtres optionnels
        provider = self.request.query_params.get('provider')
        if provider:
            queryset = queryset.filter(provider=provider)
        
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        payment_type = self.request.query_params.get('payment_type')
        if payment_type:
            queryset = queryset.filter(payment_type=payment_type)
        
        transaction_id = self.request.query_params.get('transaction_id')
        if transaction_id:
            # Filtrer par transaction_id (peut être order_id ou shipment_id)
            queryset = queryset.filter(object_id=transaction_id)
        
        return queryset.select_related('payer', 'content_type').prefetch_related('attempts')
    
    def get_serializer_class(self):
        """Retourne le serializer approprié selon la méthode"""
        if self.request.method == 'POST':
            return CreatePaymentSerializer
        return PaymentSerializer
    
    def create(self, request, *args, **kwargs):
        """Crée un nouveau paiement (Order ou Shipment)"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Récupération des données validées
        transaction_obj = serializer.validated_data['_transaction_obj']
        payment_type = serializer.validated_data['payment_type']
        provider = serializer.validated_data['provider']
        payer_phone = serializer.validated_data['payer_phone']
        payer_name = serializer.validated_data.get('payer_name')
        metadata = serializer.validated_data.get('metadata', {})
        
        try:
            # Création du paiement via le service
            payment = PaymentService.create_payment_for_transaction(
                transaction_obj=transaction_obj,
                payment_type=payment_type,
                provider=provider,
                payer_phone=payer_phone,
                payer_name=payer_name,
                metadata=metadata
            )
            
            # Sérialisation de la réponse
            response_serializer = PaymentSerializer(payment, context={'request': request})
            return Response(
                response_serializer.data,
                status=status.HTTP_201_CREATED
            )
            
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except PaymentProviderError as e:
            logger.error(f"Erreur provider lors de la création du paiement: {e}")
            return Response(
                {'error': f'Erreur lors de la création du paiement: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            logger.exception(f"Erreur inattendue lors de la création du paiement: {e}")
            return Response(
                {'error': 'Une erreur est survenue lors de la création du paiement'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PaymentDetailView(generics.RetrieveAPIView):
    """
    Détails d'un paiement
    """
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated, CanCreatePayment]
    lookup_field = 'payment_id'
    
    def get_queryset(self):
        """Retourne les paiements de l'utilisateur connecté"""
        return Payment.objects.filter(
            payer=self.request.user
        ).select_related('payer', 'content_type').prefetch_related('attempts')


@api_view(['POST'])
@permission_classes([])  # Pas d'authentification requise (signature webhook)
def webhook_handler(request, provider):
    """
    Endpoint pour recevoir les webhooks des providers de paiement
    
    Args:
        provider: Nom du provider ('airtel_money', 'moov_money')
    """
    # Validation du provider
    if provider not in ['airtel_money', 'moov_money']:
        return Response(
            {'error': f'Provider "{provider}" non supporté'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Récupération du payload
    payload = request.data
    
    # Récupération de la signature depuis les headers
    # Les headers varient selon le provider
    signature = None
    if provider == 'airtel_money':
        signature = request.META.get('HTTP_X_AIRTEL_SIGNATURE') or request.META.get('HTTP_SIGNATURE')
    elif provider == 'moov_money':
        signature = request.META.get('HTTP_X_MOOV_SIGNATURE') or request.META.get('HTTP_SIGNATURE')
    
    try:
        # Traitement du webhook
        webhook_event = PaymentService.process_webhook_event(
            provider=provider,
            payload=payload,
            signature=signature
        )
        
        # Réponse au provider
        return Response(
            {'status': 'received', 'event_id': str(webhook_event.event_id)},
            status=status.HTTP_200_OK
        )
        
    except PaymentProviderError as e:
        logger.error(f"Erreur lors du traitement du webhook {provider}: {e}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        logger.exception(f"Erreur inattendue lors du traitement du webhook: {e}")
        return Response(
            {'error': 'Erreur lors du traitement du webhook'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


class WebhookEventListView(generics.ListAPIView):
    """
    Liste des événements webhook (pour debugging/admin)
    """
    serializer_class = WebhookEventSerializer
    permission_classes = [IsAuthenticated, CanCreatePayment]
    
    def get_queryset(self):
        """Retourne les événements webhook liés aux paiements de l'utilisateur"""
        return WebhookEvent.objects.filter(
            payment__payer=self.request.user
        ).select_related('payment').order_by('-received_at')
