from typing import Dict, Optional
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string


class EmailService:
    @staticmethod
    def send_template_email(
        *,
        to_email: str,
        subject: str,
        template_name: str,
        context: Optional[Dict] = None,
        from_email: Optional[str] = None,
        text_template_name: Optional[str] = None,
    ) -> None:
        context = context or {}
        from_email_final = from_email or getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@example.com')

        html_body = render_to_string(template_name, context)
        text_body = render_to_string(text_template_name, context) if text_template_name else None

        message = EmailMultiAlternatives(subject, text_body or '', from_email_final, [to_email])
        message.attach_alternative(html_body, 'text/html')
        message.send(fail_silently=False)


