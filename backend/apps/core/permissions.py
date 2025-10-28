"""
Permissions personnalisées pour GestAgro
"""
from rest_framework import permissions


class IsFarmer(permissions.BasePermission):
    """
    Permission pour les agriculteurs uniquement
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Vérifier si l'utilisateur a le rôle farmer dans au moins une organisation active
        return request.user.memberships.filter(
            role='farmer',
            status='active'
        ).exists()


class IsBuyer(permissions.BasePermission):
    """
    Permission pour les acheteurs uniquement
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        return request.user.memberships.filter(
            role='buyer',
            status='active'
        ).exists()


class IsTransporter(permissions.BasePermission):
    """
    Permission pour les transporteurs uniquement
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        return request.user.memberships.filter(
            role='transporter',
            status='active'
        ).exists()


class IsAgronomist(permissions.BasePermission):
    """
    Permission pour les agronomes uniquement
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        return request.user.memberships.filter(
            role='agronomist',
            status='active'
        ).exists()


class IsAdmin(permissions.BasePermission):
    """
    Permission pour les administrateurs uniquement
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        return request.user.memberships.filter(
            role='admin',
            status='active'
        ).exists()


class IsFarmerOrAdmin(permissions.BasePermission):
    """
    Permission pour les agriculteurs et administrateurs UNIQUEMENT
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Les superusers Django peuvent tout faire
        if request.user.is_superuser:
            return True
        
        # Vérifier si l'utilisateur a le rôle farmer ou admin UNIQUEMENT
        # NOTE: 'member' a été retiré car il était trop permissif
        return request.user.memberships.filter(
            role__in=['farmer', 'admin'],
            status='active'
        ).exists()


class IsBuyerOrAdmin(permissions.BasePermission):
    """
    Permission pour les acheteurs et administrateurs
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Les superusers Django peuvent tout faire
        if request.user.is_superuser:
            return True
        
        return request.user.memberships.filter(
            role__in=['buyer', 'admin'],
            status='active'
        ).exists()


class IsTransporterOrAdmin(permissions.BasePermission):
    """
    Permission pour les transporteurs et administrateurs
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Les superusers Django peuvent tout faire
        if request.user.is_superuser:
            return True
        
        return request.user.memberships.filter(
            role__in=['transporter', 'admin'],
            status='active'
        ).exists()


class IsAgronomistOrAdmin(permissions.BasePermission):
    """
    Permission pour les agronomes et administrateurs
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Les superusers Django peuvent tout faire
        if request.user.is_superuser:
            return True
        
        return request.user.memberships.filter(
            role__in=['agronomist', 'admin'],
            status='active'
        ).exists()


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Permission pour le propriétaire de l'objet ou un administrateur
    """
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Admin peut tout faire
        if request.user.memberships.filter(role='admin', status='active').exists():
            return True
        
        # Vérifier si l'utilisateur est le propriétaire
        if hasattr(obj, 'created_by'):
            return obj.created_by == request.user
        
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        return False
