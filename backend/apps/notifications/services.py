"""
Service pour créer et gérer les notifications
Utilisé par les autres modules (payments, orders, shipments, etc.)
"""
from typing import Optional, Dict, Any, List
from django.contrib.auth import get_user_model
from django.db import transaction

from .models import Notification, NotificationChannel
from .tasks import send_notification_async

User = get_user_model()


class NotificationService:
    """Service centralisé pour créer des notifications"""

    @staticmethod
    def create_notification(
        user: User,
        title: str,
        message: str,
        notification_type: str = "info",
        data: Optional[Dict[str, Any]] = None,
        send_email: bool = False,
        send_webhook: Optional[str] = None,
        auto_send: bool = True,
    ) -> Notification:
        """
        Créer une notification pour un utilisateur

        Args:
            user: Utilisateur destinataire
            title: Titre de la notification
            message: Message de la notification
            notification_type: Type (info, warning, success, error)
            data: Données JSON additionnelles
            send_email: Envoyer par email (utilise l'email de l'utilisateur)
            send_webhook: URL webhook optionnelle
            auto_send: Déclencher l'envoi asynchrone automatiquement

        Returns:
            Notification créée
        """
        notification = Notification.objects.create(
            user=user,
            type=notification_type,
            title=title,
            message=message,
            data=data or {},
        )

        channels_to_create = []
        if send_email:
            channels_to_create.append(
                NotificationChannel(
                    notification=notification,
                    channel="email",
                    target=user.email,
                )
            )
        if send_webhook:
            channels_to_create.append(
                NotificationChannel(
                    notification=notification,
                    channel="webhook",
                    target=send_webhook,
                )
            )

        if channels_to_create:
            NotificationChannel.objects.bulk_create(channels_to_create)

        # Déclencher l'envoi asynchrone si demandé
        if auto_send and channels_to_create:
            try:
                send_notification_async.delay(notification.id)
            except Exception:
                # En dev sans worker Celery, ignorer
                pass

        return notification

    @staticmethod
    def notify_order_created(buyer: User, order_id: int, order_total: float) -> Notification:
        """Notification pour une commande créée"""
        return NotificationService.create_notification(
            user=buyer,
            title="Commande créée",
            message=f"Votre commande #{order_id} a été créée avec succès.",
            notification_type="success",
            data={"order_id": order_id, "total": order_total},
            send_email=True,
        )

    @staticmethod
    def notify_payment_confirmed(payer: User, payment_id: int, amount: float, transaction_type: str) -> Notification:
        """Notification pour un paiement confirmé"""
        return NotificationService.create_notification(
            user=payer,
            title="Paiement confirmé",
            message=f"Votre paiement de {amount} XAF pour {transaction_type} a été confirmé.",
            notification_type="success",
            data={"payment_id": payment_id, "amount": amount, "transaction_type": transaction_type},
            send_email=True,
        )

    @staticmethod
    def notify_shipment_status_changed(
        farmer: User, shipment_id: int, tracking_number: str, status: str
    ) -> Notification:
        """Notification pour changement de statut d'expédition"""
        status_messages = {
            "pending": "en attente",
            "in_transit": "en transit",
            "delivered": "livrée",
            "cancelled": "annulée",
        }
        return NotificationService.create_notification(
            user=farmer,
            title="Statut d'expédition mis à jour",
            message=f"Votre expédition {tracking_number} est maintenant {status_messages.get(status, status)}.",
            notification_type="info",
            data={"shipment_id": shipment_id, "tracking_number": tracking_number, "status": status},
            send_email=True,
        )

    @staticmethod
    def notify_order_received(farmer: User, order_id: int, buyer_name: str) -> Notification:
        """Notification pour un agriculteur qui reçoit une commande"""
        return NotificationService.create_notification(
            user=farmer,
            title="Nouvelle commande reçue",
            message=f"Vous avez reçu une nouvelle commande #{order_id} de {buyer_name}.",
            notification_type="info",
            data={"order_id": order_id, "buyer_name": buyer_name},
            send_email=True,
        )

    @staticmethod
    def notify_agronomist_visit_scheduled(
        farmer: User, visit_id: int, agronomist_name: str, visit_date: str
    ) -> Notification:
        """Notification pour une visite d'agronome programmée"""
        return NotificationService.create_notification(
            user=farmer,
            title="Visite d'agronome programmée",
            message=f"{agronomist_name} vous rendra visite le {visit_date}.",
            notification_type="info",
            data={"visit_id": visit_id, "agronomist_name": agronomist_name, "visit_date": visit_date},
            send_email=True,
        )

