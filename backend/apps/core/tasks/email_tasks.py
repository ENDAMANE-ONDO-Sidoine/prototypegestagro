from celery import shared_task
from typing import Dict, Optional
from .services.email_service import EmailService


@shared_task(bind=True, max_retries=3, default_retry_delay=30)
def send_template_email_task(self, to_email: str, subject: str, template_name: str, context: Optional[Dict] = None, from_email: Optional[str] = None, text_template_name: Optional[str] = None):
    try:
        EmailService.send_template_email(
            to_email=to_email,
            subject=subject,
            template_name=template_name,
            context=context,
            from_email=from_email,
            text_template_name=text_template_name,
        )
    except Exception as exc:
        raise self.retry(exc=exc)


