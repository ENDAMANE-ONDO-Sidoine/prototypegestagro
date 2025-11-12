from rest_framework import serializers
from .models import Notification, NotificationChannel


class NotificationChannelSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationChannel
        fields = [
            "id",
            "channel",
            "status",
            "target",
            "error",
            "sent_at",
            "created_at",
        ]
        read_only_fields = ["status", "error", "sent_at", "created_at"]


class NotificationSerializer(serializers.ModelSerializer):
    channels = NotificationChannelSerializer(many=True, read_only=True)

    class Meta:
        model = Notification
        fields = [
            "id",
            "type",
            "title",
            "message",
            "data",
            "read_at",
            "created_at",
            "channels",
        ]
        read_only_fields = ["created_at", "channels", "read_at"]


class NotificationCreateSerializer(serializers.ModelSerializer):
    send_email_to = serializers.EmailField(required=False, allow_blank=True)
    webhook_url = serializers.URLField(required=False, allow_blank=True)

    class Meta:
        model = Notification
        fields = [
            "type",
            "title",
            "message",
            "data",
            "send_email_to",
            "webhook_url",
        ]

    def create(self, validated_data):
        validated_data.pop("user", None)
        send_email_to = validated_data.pop("send_email_to", None)
        webhook_url = validated_data.pop("webhook_url", None)
        user = self.context["request"].user
        notification = Notification.objects.create(user=user, **validated_data)
        channels_to_create = []
        if send_email_to:
            channels_to_create.append(
                NotificationChannel(notification=notification, channel="email", target=send_email_to)
            )
        if webhook_url:
            channels_to_create.append(
                NotificationChannel(notification=notification, channel="webhook", target=webhook_url)
            )
        if channels_to_create:
            NotificationChannel.objects.bulk_create(channels_to_create)
        # déclenche l'envoi async
        try:
            from .tasks import send_notification_async

            send_notification_async.delay(notification.id)
        except Exception:
            # en dev sans worker, ignorer
            pass
        return notification


