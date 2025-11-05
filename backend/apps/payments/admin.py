"""
Admin pour l'application payments
"""
from django.contrib import admin
from .models import Payment, PaymentAttempt, WebhookEvent


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    """Admin pour les paiements"""
    list_display = [
        'payment_id', 'payment_type', 'get_transaction_reference', 'payer', 'provider', 'status',
        'amount', 'currency', 'created_at', 'paid_at'
    ]
    list_filter = ['payment_type', 'provider', 'status', 'currency', 'created_at']
    search_fields = ['payment_id', 'payer__email', 'provider_transaction_id']
    readonly_fields = ['payment_id', 'payment_type', 'get_transaction_reference', 'created_at', 'updated_at', 'paid_at', 'failed_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('payment_id', 'payment_type', 'content_type', 'object_id', 'get_transaction_reference', 'payer', 'provider', 'status')
        }),
        ('Montant', {
            'fields': ('amount', 'currency')
        }),
        ('Références Provider', {
            'fields': ('provider_reference', 'provider_transaction_id')
        }),
        ('Métadonnées', {
            'fields': ('metadata', 'failure_reason'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'paid_at', 'failed_at')
        }),
    )
    
    def get_transaction_reference(self, obj):
        """Affiche la référence de la transaction"""
        return obj.get_transaction_reference()
    get_transaction_reference.short_description = 'Référence Transaction'


@admin.register(PaymentAttempt)
class PaymentAttemptAdmin(admin.ModelAdmin):
    """Admin pour les tentatives de paiement"""
    list_display = ['id', 'payment', 'attempt_number', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['payment__payment_id']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'


@admin.register(WebhookEvent)
class WebhookEventAdmin(admin.ModelAdmin):
    """Admin pour les événements webhook"""
    list_display = [
        'event_id', 'provider', 'event_type', 'status',
        'payment', 'attempts', 'received_at', 'processed_at'
    ]
    list_filter = ['provider', 'event_type', 'status', 'received_at']
    search_fields = ['event_id', 'provider_transaction_id', 'payment__payment_id']
    readonly_fields = ['event_id', 'received_at', 'processed_at', 'last_attempt_at']
    date_hierarchy = 'received_at'
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('event_id', 'provider', 'event_type', 'status')
        }),
        ('Références', {
            'fields': ('payment', 'provider_transaction_id')
        }),
        ('Données', {
            'fields': ('payload', 'signature'),
            'classes': ('collapse',)
        }),
        ('Traitement', {
            'fields': ('attempts', 'error_message')
        }),
        ('Timestamps', {
            'fields': ('received_at', 'processed_at', 'last_attempt_at')
        }),
    )
