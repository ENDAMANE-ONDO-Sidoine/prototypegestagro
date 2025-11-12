from rest_framework import viewsets, permissions, filters, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend

from .models import Notification, NotificationChannel
from .serializers import NotificationSerializer, NotificationCreateSerializer


class IsOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return getattr(obj, "user_id", None) == request.user.id


class NotificationViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ["type", "read_at"]  # Filtre par type et lu/non lu (read_at null = non lu)
    search_fields = ["title", "message"]
    ordering = ("-created_at",)
    ordering_fields = ["created_at", "read_at"]

    def get_queryset(self):
        queryset = Notification.objects.filter(user=self.request.user)
        # Filtre supplémentaire pour non lues uniquement
        unread_only = self.request.query_params.get("unread_only", "").lower() == "true"
        if unread_only:
            queryset = queryset.filter(read_at__isnull=True)
        return queryset

    def get_serializer_class(self):
        if self.action in ["create"]:
            return NotificationCreateSerializer
        return NotificationSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        notification = serializer.save(user=request.user)
        output = NotificationSerializer(notification, context={"request": request})
        headers = self.get_success_headers(output.data)
        return Response(output.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=True, methods=["post"])
    def mark_as_read(self, request, pk=None):
        """Marquer une notification comme lue"""
        notif = self.get_object()
        if notif.read_at is None:
            from django.utils import timezone
            notif.read_at = timezone.now()
            notif.save(update_fields=["read_at"])
        return Response({"status": "ok", "read_at": notif.read_at})

    @action(detail=False, methods=["post"])
    def mark_all_as_read(self, request):
        """Marquer toutes les notifications de l'utilisateur comme lues"""
        from django.utils import timezone
        updated = Notification.objects.filter(
            user=request.user, read_at__isnull=True
        ).update(read_at=timezone.now())
        return Response({"status": "ok", "updated_count": updated})

    @action(detail=False, methods=["get"])
    def unread_count(self, request):
        """Retourner le nombre de notifications non lues"""
        count = Notification.objects.filter(user=request.user, read_at__isnull=True).count()
        return Response({"unread_count": count})

    @action(
        detail=False,
        methods=["get"],
        permission_classes=[permissions.AllowAny],
        url_path="meta",
    )
    def meta(self, request):
        """Référentiels pour les formulaires de notification (type, canal, statut)"""

        def _choices_to_list(choices):
            return [
                {
                    "valeur": value,
                    "libelle": label,
                }
                for value, label in choices
            ]

        payload = {
            "typesNotification": _choices_to_list(Notification.TYPE_CHOICES),
            "canauxNotification": _choices_to_list(NotificationChannel.CHANNEL_CHOICES),
            "statutsCanal": _choices_to_list(NotificationChannel.STATUS_CHOICES),
            "message": "Référentiels notifications chargés avec succès.",
        }
        return Response(payload)
