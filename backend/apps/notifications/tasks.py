from celery import shared_task
from django.utils import timezone
import requests

from .models import Notification, NotificationChannel
from apps.core.services.email_service import EmailService


@shared_task(bind=True, max_retries=3, default_retry_delay=30)
def send_notification_async(self, notification_id: int) -> None:
    notification = Notification.objects.get(id=notification_id)
    for channel in notification.channels.all():
        if channel.status == "sent":
            continue
        try:
            if channel.channel == "email":
                EmailService.send_template_email(
                    to_email=channel.target or notification.user.email,
                    subject=notification.title,
                    template_name="emails/base.html",  # peut être remplacé par templates dédiés
                    text_template_name="emails/base.txt",
                    context={"title": notification.title, "message": notification.message, "data": notification.data},
                )
                channel.status = "sent"
                channel.sent_at = timezone.now()
                channel.save(update_fields=["status", "sent_at"])
            elif channel.channel == "webhook":
                try:
                    requests.post(
                        channel.target,
                        json={
                            "id": notification.id,
                            "type": notification.type,
                            "title": notification.title,
                            "message": notification.message,
                            "data": notification.data,
                            "created_at": notification.created_at.isoformat(),
                        },
                        timeout=10,
                    )
                    channel.status = "sent"
                    channel.sent_at = timezone.now()
                    channel.save(update_fields=["status", "sent_at"])
                except Exception as exc:
                    channel.status = "failed"
                    channel.error = str(exc)
                    channel.save(update_fields=["status", "error"])
                    raise self.retry(exc=exc)
        except Exception as exc:  # email errors
            channel.status = "failed"
            channel.error = str(exc)
            channel.save(update_fields=["status", "error"])
            raise self.retry(exc=exc)


