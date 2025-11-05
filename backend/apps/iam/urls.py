"""
URLs pour l'application IAM (Identity & Access Management)
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView
from .views import (
    CustomTokenObtainPairView, UserRegistrationView, UserProfileView,
    UserLogoutView, MembershipListView, MembershipDetailView, RoleListView, PermissionListView,
    user_organizations, join_organization, PasswordResetRequestView, PasswordResetConfirmView,
    EmailVerificationRequestView, EmailVerificationConfirmView
)

router = DefaultRouter()

urlpatterns = [
    # Authentication
    path('register/', UserRegistrationView.as_view(), name='user_register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('logout/', UserLogoutView.as_view(), name='user_logout'),
    # Password reset
    path('password/reset/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('password/reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    # Email verification
    path('verify-email/request/', EmailVerificationRequestView.as_view(), name='email_verification_request'),
    path('verify-email/confirm/', EmailVerificationConfirmView.as_view(), name='email_verification_confirm'),
    
    # User Profile
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('my-organizations/', user_organizations, name='user_organizations'),
    path('join-organization/', join_organization, name='join_organization'),
    
    # Organizations (déplacées vers apps.organizations)
    # Les organisations sont maintenant gérées dans /api/v1/organizations/
    
    # Memberships
    path('memberships/', MembershipListView.as_view(), name='membership_list'),
    path('memberships/<int:pk>/', MembershipDetailView.as_view(), name='membership_detail'),
    
    # Roles & Permissions
    path('roles/', RoleListView.as_view(), name='role_list'),
    path('permissions/', PermissionListView.as_view(), name='permission_list'),
]
