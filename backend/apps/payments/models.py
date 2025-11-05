"""
Modèles pour l'application payments (paiements)
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from decimal import Decimal
import uuid

from apps.iam.models import User


class Payment(models.Model):
    """
    Paiement générique pour différents types de transactions
    Peut être lié à une Order (acheteur → agriculteur) ou un Shipment (agriculteur → transporteur)
    """
    STATUS_CHOICES = [
        ('pending', _('Pending')),
        ('processing', _('Processing')),
        ('succeeded', _('Succeeded')),
        ('failed', _('Failed')),
        ('cancelled', _('Cancelled')),
        ('refunded', _('Refunded')),
    ]

    PROVIDER_CHOICES = [
        ('airtel_money', _('Airtel Money')),
        ('moov_money', _('Moov Money')),
        ('stripe', _('Stripe')),
    ]
    
    PAYMENT_TYPE_CHOICES = [
        ('order', _('Order Payment')),  # Acheteur → Agriculteur
        ('shipment', _('Shipment Payment')),  # Agriculteur → Transporteur
    ]

    # Relations génériques (peut être Order ou Shipment)
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.PROTECT,
        verbose_name=_('content type'),
        help_text=_('Type de transaction (Order, Shipment, etc.)'),
        null=True,
        blank=True  # Temporairement nullable pour la migration
    )
    object_id = models.PositiveIntegerField(
        verbose_name=_('object id'),
        help_text=_('ID de la transaction (Order.id ou Shipment.id)'),
        null=True,
        blank=True  # Temporairement nullable pour la migration
    )
    transaction = GenericForeignKey('content_type', 'object_id')
    
    # Ancienne relation (à supprimer après migration)
    order = models.ForeignKey(
        'buyers.Order',
        on_delete=models.PROTECT,
        related_name='payments',
        verbose_name=_('order'),
        null=True,
        blank=True  # Temporairement nullable pour la migration
    )
    buyer = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='payments',
        verbose_name=_('buyer'),
        null=True,
        blank=True  # Temporairement nullable pour la migration
    )
    
    # Paiement par
    payer = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='payments_made',
        verbose_name=_('payer'),
        help_text=_('Utilisateur qui effectue le paiement'),
        null=True,
        blank=True  # Temporairement nullable pour la migration
    )
    
    # Type de paiement
    payment_type = models.CharField(
        _('payment type'),
        max_length=20,
        choices=PAYMENT_TYPE_CHOICES,
        help_text=_('Type de paiement (order, shipment, etc.)'),
        null=True,
        blank=True  # Temporairement nullable pour la migration
    )

    # Informations de paiement
    payment_id = models.UUIDField(
        _('payment ID'),
        default=uuid.uuid4,
        unique=True,
        editable=False
    )
    provider = models.CharField(
        _('provider'),
        max_length=20,
        choices=PROVIDER_CHOICES
    )
    status = models.CharField(
        _('status'),
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )

    # Montant
    amount = models.DecimalField(
        _('amount'),
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    currency = models.CharField(
        _('currency'),
        max_length=3,
        default='XAF'
    )

    # Références du provider
    provider_reference = models.CharField(
        _('provider reference'),
        max_length=255,
        blank=True,
        null=True,
        help_text=_('Référence retournée par le provider de paiement')
    )
    provider_transaction_id = models.CharField(
        _('provider transaction ID'),
        max_length=255,
        blank=True,
        null=True,
        unique=True,
        help_text=_('ID de transaction unique du provider')
    )

    # Métadonnées
    metadata = models.JSONField(
        _('metadata'),
        default=dict,
        blank=True,
        help_text=_('Métadonnées additionnelles du paiement')
    )
    failure_reason = models.TextField(
        _('failure reason'),
        blank=True,
        help_text=_('Raison de l\'échec du paiement')
    )

    # Timestamps
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    paid_at = models.DateTimeField(_('paid at'), null=True, blank=True)
    failed_at = models.DateTimeField(_('failed at'), null=True, blank=True)

    class Meta:
        db_table = 'payments_payments'
        verbose_name = _('Payment')
        verbose_name_plural = _('Payments')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['payment_id']),
            models.Index(fields=['content_type', 'object_id', 'status']),
            models.Index(fields=['payment_type', 'status']),
            models.Index(fields=['provider', 'status']),
            models.Index(fields=['provider_transaction_id']),
            models.Index(fields=['payer', 'status']),
        ]
    
    def get_transaction_reference(self):
        """Retourne la référence de la transaction (order_number, tracking_number, etc.)"""
        if self.transaction:
            if hasattr(self.transaction, 'order_number'):
                return self.transaction.order_number
            elif hasattr(self.transaction, 'tracking_number'):
                return self.transaction.tracking_number
        return f"{self.content_type.model}#{self.object_id}"

    def __str__(self):
        ref = self.get_transaction_reference()
        return f"Paiement {self.payment_id} - {ref} - {self.get_status_display()}"

    @property
    def is_pending(self):
        return self.status == 'pending'

    @property
    def is_processing(self):
        return self.status == 'processing'

    @property
    def is_succeeded(self):
        return self.status == 'succeeded'

    @property
    def is_failed(self):
        return self.status == 'failed'

    @property
    def is_refunded(self):
        return self.status == 'refunded'


class PaymentAttempt(models.Model):
    """
    Tentative de paiement (pour tracking des retries)
    """
    STATUS_CHOICES = [
        ('pending', _('Pending')),
        ('succeeded', _('Succeeded')),
        ('failed', _('Failed')),
    ]

    payment = models.ForeignKey(
        Payment,
        on_delete=models.CASCADE,
        related_name='attempts',
        verbose_name=_('payment')
    )
    attempt_number = models.PositiveIntegerField(
        _('attempt number'),
        default=1
    )
    status = models.CharField(
        _('status'),
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    error_message = models.TextField(
        _('error message'),
        blank=True,
        null=True
    )
    provider_response = models.JSONField(
        _('provider response'),
        default=dict,
        blank=True,
        help_text=_('Réponse complète du provider')
    )
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        db_table = 'payments_payment_attempts'
        verbose_name = _('Payment Attempt')
        verbose_name_plural = _('Payment Attempts')
        ordering = ['-created_at']
        unique_together = ['payment', 'attempt_number']

    def __str__(self):
        return f"Tentative {self.attempt_number} - {self.payment.payment_id} - {self.get_status_display()}"


class WebhookEvent(models.Model):
    """
    Événement webhook reçu du provider de paiement
    """
    STATUS_CHOICES = [
        ('pending', _('Pending')),
        ('processed', _('Processed')),
        ('failed', _('Failed')),
    ]

    # Identifiants
    event_id = models.UUIDField(
        _('event ID'),
        default=uuid.uuid4,
        unique=True,
        editable=False
    )
    provider = models.CharField(
        _('provider'),
        max_length=20,
        choices=Payment.PROVIDER_CHOICES
    )
    event_type = models.CharField(
        _('event type'),
        max_length=100,
        help_text=_('Type d\'événement (ex: payment.succeeded, payment.failed)')
    )

    # Référence au paiement
    payment = models.ForeignKey(
        Payment,
        on_delete=models.SET_NULL,
        related_name='webhook_events',
        null=True,
        blank=True,
        verbose_name=_('payment')
    )
    provider_transaction_id = models.CharField(
        _('provider transaction ID'),
        max_length=255,
        blank=True,
        null=True,
        help_text=_('ID de transaction du provider pour identifier le paiement')
    )

    # Données du webhook
    payload = models.JSONField(
        _('payload'),
        help_text=_('Payload complet du webhook')
    )
    signature = models.CharField(
        _('signature'),
        max_length=500,
        blank=True,
        null=True,
        help_text=_('Signature du webhook pour vérification')
    )

    # Traitement
    status = models.CharField(
        _('status'),
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    attempts = models.PositiveIntegerField(
        _('attempts'),
        default=0,
        help_text=_('Nombre de tentatives de traitement')
    )
    error_message = models.TextField(
        _('error message'),
        blank=True,
        null=True
    )

    # Timestamps
    received_at = models.DateTimeField(_('received at'), auto_now_add=True)
    processed_at = models.DateTimeField(_('processed at'), null=True, blank=True)
    last_attempt_at = models.DateTimeField(_('last attempt at'), null=True, blank=True)

    class Meta:
        db_table = 'payments_webhook_events'
        verbose_name = _('Webhook Event')
        verbose_name_plural = _('Webhook Events')
        ordering = ['-received_at']
        indexes = [
            models.Index(fields=['event_id']),
            models.Index(fields=['provider', 'status']),
            models.Index(fields=['provider_transaction_id']),
            models.Index(fields=['payment', 'status']),
        ]

    def __str__(self):
        return f"Webhook {self.event_id} - {self.provider} - {self.event_type} - {self.get_status_display()}"
