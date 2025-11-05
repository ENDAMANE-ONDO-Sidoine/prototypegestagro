from django.contrib import admin
from .models import Notification, NotificationChannel


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "type", "title", "created_at", "read_at")
    list_filter = ("type", "created_at", "read_at")
    search_fields = ("title", "message", "user__username", "user__email")


@admin.register(NotificationChannel)
class NotificationChannelAdmin(admin.ModelAdmin):
    list_display = ("id", "notification", "channel", "status", "sent_at")
    list_filter = ("channel", "status", "sent_at")
    search_fields = ("notification__title", "target")

from django.contrib import admin

# Register your models here.
