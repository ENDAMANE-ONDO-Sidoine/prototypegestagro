"""
Serializers pour l'application payments
"""
from rest_framework import serializers
from .models import Payment, PaymentAttempt, WebhookEvent
from apps.buyers.serializers import OrderSerializer


class PaymentAttemptSerializer(serializers.ModelSerializer):
    """Serializer pour les tentatives de paiement"""
    
    class Meta:
        model = PaymentAttempt
        fields = [
            'id', 'attempt_number', 'status', 'error_message',
            'provider_response', 'created_at', 'updated_at'
        ]
        read_only_fields = fields


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer pour les paiements"""
    transaction_details = serializers.SerializerMethodField()
    payer_name = serializers.CharField(source='payer.get_full_name', read_only=True)
    attempts = PaymentAttemptSerializer(many=True, read_only=True)
    payment_url = serializers.SerializerMethodField()
    transaction_reference = serializers.SerializerMethodField()
    
    class Meta:
        model = Payment
        fields = [
            'id', 'payment_id', 'payment_type', 'transaction_details', 'transaction_reference',
            'payer', 'payer_name', 'provider', 'status', 'amount', 'currency',
            'provider_reference', 'provider_transaction_id',
            'metadata', 'failure_reason', 'payment_url',
            'attempts', 'created_at', 'updated_at', 'paid_at', 'failed_at'
        ]
        read_only_fields = [
            'id', 'payment_id', 'payment_type', 'transaction_details', 'transaction_reference',
            'payer', 'status', 'provider_reference',
            'provider_transaction_id', 'metadata', 'failure_reason',
            'created_at', 'updated_at', 'paid_at', 'failed_at'
        ]
    
    def get_transaction_details(self, obj):
        """Retourne les détails de la transaction selon son type"""
        if not obj.transaction:
            return None
        
        if obj.payment_type == 'order':
            # Pour les commandes, retourner les infos essentielles
            return {
                'type': 'order',
                'id': obj.transaction.id,
                'order_number': obj.transaction.order_number,
                'buyer': obj.transaction.buyer.get_full_name() or obj.transaction.buyer.email,
                'seller': obj.transaction.seller.name,
                'total_amount': str(obj.transaction.total_amount),
            }
        elif obj.payment_type == 'shipment':
            # Pour les expéditions, retourner les infos essentielles
            return {
                'type': 'shipment',
                'id': obj.transaction.id,
                'tracking_number': obj.transaction.tracking_number,
                'transport_cost': str(obj.transaction.transport_cost),
                'order_number': obj.transaction.order.order_number if hasattr(obj.transaction, 'order') else None,
            }
        return None
    
    def get_transaction_reference(self, obj):
        """Retourne la référence de la transaction"""
        return obj.get_transaction_reference()
    
    def get_payment_url(self, obj):
        """Retourne l'URL de paiement depuis les métadonnées"""
        return obj.metadata.get('payment_url')


class CreatePaymentSerializer(serializers.Serializer):
    """Serializer pour créer un paiement (Order ou Shipment)"""
    payment_type = serializers.ChoiceField(
        choices=['order', 'shipment'],
        required=True,
        help_text="Type de paiement: 'order' (Acheteur→Agriculteur) ou 'shipment' (Agriculteur→Transporteur)"
    )
    transaction_id = serializers.IntegerField(
        required=True,
        help_text="ID de la transaction (order_id pour type=order, shipment_id pour type=shipment)"
    )
    provider = serializers.ChoiceField(
        choices=['airtel_money', 'moov_money'],
        required=True
    )
    payer_phone = serializers.CharField(
        required=True,
        help_text="Numéro de téléphone du payeur (format: +241XXXXXXXXX)"
    )
    payer_name = serializers.CharField(required=False, allow_blank=True)
    metadata = serializers.JSONField(required=False, default=dict)
    
    def validate(self, data):
        """Valide les données selon le type de paiement"""
        payment_type = data.get('payment_type')
        transaction_id = data.get('transaction_id')
        request = self.context.get('request')
        
        if not request:
            raise serializers.ValidationError("Contexte de requête manquant")
        
        if payment_type == 'order':
            # Validation pour paiement de commande
            from apps.buyers.models import Order
            try:
                order = Order.objects.get(id=transaction_id, buyer=request.user)
            except Order.DoesNotExist:
                raise serializers.ValidationError({
                    'transaction_id': "Commande introuvable ou non autorisée"
                })
            
            if order.payment_status == 'paid':
                raise serializers.ValidationError({
                    'transaction_id': "Cette commande est déjà payée"
                })
            
            # Stocker l'objet order dans validated_data
            data['_transaction_obj'] = order
            
        elif payment_type == 'shipment':
            # Validation pour paiement d'expédition
            from apps.transport.models import Shipment
            try:
                shipment = Shipment.objects.get(id=transaction_id, created_by=request.user)
            except Shipment.DoesNotExist:
                raise serializers.ValidationError({
                    'transaction_id': "Expédition introuvable ou non autorisée"
                })
            
            if shipment.payment_status == 'paid':
                raise serializers.ValidationError({
                    'transaction_id': "Cette expédition est déjà payée"
                })
            
            # Stocker l'objet shipment dans validated_data
            data['_transaction_obj'] = shipment
        
        return data
    
    def validate_payer_phone(self, value):
        """Valide le format du numéro de téléphone"""
        # Format basique: + suivi de 9-15 chiffres
        if not value.startswith('+'):
            raise serializers.ValidationError("Le numéro doit commencer par +")
        if len(value) < 10 or len(value) > 16:
            raise serializers.ValidationError("Format de numéro invalide")
        return value


class WebhookEventSerializer(serializers.ModelSerializer):
    """Serializer pour les événements webhook (lecture seule)"""
    payment = PaymentSerializer(read_only=True)
    
    class Meta:
        model = WebhookEvent
        fields = [
            'id', 'event_id', 'provider', 'event_type',
            'payment', 'provider_transaction_id',
            'status', 'attempts', 'error_message',
            'received_at', 'processed_at', 'last_attempt_at'
        ]
        read_only_fields = fields

