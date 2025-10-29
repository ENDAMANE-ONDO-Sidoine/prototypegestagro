"""
URLs pour l'application core
"""
from django.urls import path
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .views import (
    AdminUserListView, AdminUserDetailView,
    AdminOrganizationListView, AdminOrganizationDetailView,
    AdminMembershipListView, AdminMembershipDetailView,
    admin_dashboard_stats, admin_analytics,
    admin_approve_organization, admin_approve_membership,
    admin_suspend_user, admin_activate_user
)
# views_admin supprimé - endpoints d'urgence supprimés

@api_view(['GET'])
def api_root(request):
    """
    Point d'entrée de l'API GestAgro
    """
    return Response({
        'message': 'Bienvenue sur l\'API GestAgro',
        'version': '1.0.0',
        'documentation': '/api/docs/',
               'endpoints': {
                   'auth': '/api/v1/auth/',
                   'organizations': '/api/v1/organizations/',
                   'farmers': '/api/v1/farmers/',
                   'buyers': '/api/v1/buyers/',
                   'transport': '/api/v1/transport/',
                   'agronomy': '/api/v1/agronomy/',
                   'admin': '/api/v1/admin/',
                   'health': '/health/',
               }
    })

urlpatterns = [
    path('', api_root, name='api-root'),
    
    # Administration - Utilisateurs
    path('admin/users/', AdminUserListView.as_view(), name='admin_user_list'),
    path('admin/users/<int:pk>/', AdminUserDetailView.as_view(), name='admin_user_detail'),
    path('admin/users/<int:user_id>/suspend/', admin_suspend_user, name='admin_suspend_user'),
    path('admin/users/<int:user_id>/activate/', admin_activate_user, name='admin_activate_user'),
    
    # Administration - Organisations
    path('admin/organizations/', AdminOrganizationListView.as_view(), name='admin_organization_list'),
    path('admin/organizations/<int:pk>/', AdminOrganizationDetailView.as_view(), name='admin_organization_detail'),
    path('admin/organizations/<int:organization_id>/approve/', admin_approve_organization, name='admin_approve_organization'),
    
    # Administration - Adhésions
    path('admin/memberships/', AdminMembershipListView.as_view(), name='admin_membership_list'),
    path('admin/memberships/<int:pk>/', AdminMembershipDetailView.as_view(), name='admin_membership_detail'),
    path('admin/memberships/<int:membership_id>/approve/', admin_approve_membership, name='admin_approve_membership'),
    
    # Administration - Statistiques et Analytics
    path('admin/dashboard/stats/', admin_dashboard_stats, name='admin_dashboard_stats'),
    path('admin/analytics/', admin_analytics, name='admin_analytics'),
    
]
