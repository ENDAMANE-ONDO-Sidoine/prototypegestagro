"""
Permissions pour l'application payments
"""
from rest_framework import permissions


class CanCreatePayment(permissions.BasePermission):
    """
    Permission pour créer un paiement
    Autorise les buyers (pour payer des orders) et les farmers (pour payer des shipments)
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Les superusers peuvent tout faire
        if request.user.is_superuser:
            return True
        
        # Vérifier si l'utilisateur a au moins un rôle buyer, farmer ou admin
        return request.user.memberships.filter(
            role__in=['buyer', 'farmer', 'admin'],
            status='active'
        ).exists()

