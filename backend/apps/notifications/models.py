from django.conf import settings
from django.db import models


class Notification(models.Model):
    TYPE_CHOICES = (
        ("info", "Info"),
        ("warning", "Warning"),
        ("success", "Success"),
        ("error", "Error"),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default="info")
    title = models.CharField(max_length=200)
    message = models.TextField()
    data = models.JSONField(blank=True, null=True)
    read_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self) -> str:
        return f"Notification<{self.user_id}:{self.title}>"


class NotificationChannel(models.Model):
    CHANNEL_CHOICES = (
        ("email", "Email"),
        ("webhook", "Webhook"),
    )
    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("sent", "Sent"),
        ("failed", "Failed"),
    )

    notification = models.ForeignKey(Notification, on_delete=models.CASCADE, related_name="channels")
    channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    target = models.CharField(max_length=255, blank=True)  # email ou URL webhook
    error = models.TextField(blank=True)
    sent_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self) -> str:
        return f"NotificationChannel<{self.notification_id}:{self.channel}:{self.status}>"
