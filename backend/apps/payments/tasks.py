"""
Tâches Celery pour les paiements
"""
import logging
from celery import shared_task
from django.utils import timezone
from datetime import timedelta

from .models import Payment, WebhookEvent
from .services import PaymentService, PaymentProviderError

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def process_webhook_retry(self, webhook_event_id):
    """
    Retry le traitement d'un événement webhook qui a échoué
    
    Args:
        webhook_event_id: ID de l'événement webhook à retry
    """
    try:
        webhook_event = WebhookEvent.objects.get(id=webhook_event_id)
    except WebhookEvent.DoesNotExist:
        logger.error(f"WebhookEvent {webhook_event_id} introuvable")
        return
    
    # Limite de tentatives
    if webhook_event.attempts >= 5:
        logger.warning(f"Nombre maximum de tentatives atteint pour {webhook_event_id}")
        webhook_event.status = 'failed'
        webhook_event.error_message = "Nombre maximum de tentatives atteint"
        webhook_event.save()
        return
    
    try:
        # Retraitement de l'événement
        payment_provider = PaymentService.get_provider(webhook_event.provider)
        event_data = payment_provider.parse_webhook_event(webhook_event.payload)
        
        # Mise à jour du nombre de tentatives
        webhook_event.attempts += 1
        webhook_event.last_attempt_at = timezone.now()
        
        # Traitement
        PaymentService._handle_webhook_event(webhook_event, event_data, payment_provider)
        
        webhook_event.status = 'processed'
        webhook_event.processed_at = timezone.now()
        webhook_event.error_message = None
        webhook_event.save()
        
        logger.info(f"WebhookEvent {webhook_event_id} traité avec succès après retry")
        
    except Exception as e:
        logger.error(f"Erreur lors du retry du webhook {webhook_event_id}: {e}")
        webhook_event.status = 'failed'
        webhook_event.error_message = str(e)
        webhook_event.save()
        
        # Retry avec exponential backoff
        raise self.retry(exc=e, countdown=60 * (2 ** self.request.retries))


@shared_task
def verify_pending_payments():
    """
    Vérifie périodiquement le statut des paiements en attente
    (à exécuter via Celery Beat toutes les 5 minutes par exemple)
    """
    # Paiements en attente depuis plus de 5 minutes
    cutoff_time = timezone.now() - timedelta(minutes=5)
    
    pending_payments = Payment.objects.filter(
        status__in=['pending', 'processing'],
        created_at__lt=cutoff_time
    ).select_related('order')
    
    for payment in pending_payments:
        try:
            # Vérification du statut via le provider
            payment_provider = PaymentService.get_provider(payment.provider)
            provider_status = payment_provider.verify_payment(payment.provider_transaction_id)
            
            # Mise à jour si le statut a changé
            if provider_status.get('status') == 'succeeded' and payment.status != 'succeeded':
                payment.status = 'succeeded'
                payment.paid_at = timezone.now()
                payment.metadata.update({
                    'verified_at': timezone.now().isoformat(),
                    'verification_data': provider_status
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
                
                logger.info(f"Paiement {payment.payment_id} vérifié et confirmé")
                
            elif provider_status.get('status') == 'failed' and payment.status != 'failed':
                payment.status = 'failed'
                payment.failed_at = timezone.now()
                payment.failure_reason = provider_status.get('error_message', 'Paiement échoué')
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
                
                logger.warning(f"Paiement {payment.payment_id} vérifié et échoué")
                
        except PaymentProviderError as e:
            logger.error(f"Erreur lors de la vérification du paiement {payment.payment_id}: {e}")
        except Exception as e:
            logger.exception(f"Erreur inattendue lors de la vérification du paiement {payment.payment_id}: {e}")


@shared_task
def cleanup_old_webhook_events():
    """
    Nettoie les anciens événements webhook traités (plus de 90 jours)
    (à exécuter via Celery Beat quotidiennement)
    """
    cutoff_date = timezone.now() - timedelta(days=90)
    
    deleted_count, _ = WebhookEvent.objects.filter(
        status='processed',
        processed_at__lt=cutoff_date
    ).delete()
    
    logger.info(f"{deleted_count} anciens événements webhook supprimés")

