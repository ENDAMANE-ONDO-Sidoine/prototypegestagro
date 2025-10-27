"""
Configuration admin pour l'application IAM
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User, Membership, Role, Permission
from apps.organizations.models import Organization


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Configuration admin pour le modèle User personnalisé
    """
    list_display = ('email', 'username', 'first_name', 'last_name', 'is_verified', 'is_staff', 'is_active', 'created_at')
    list_filter = ('is_verified', 'is_staff', 'is_active', 'created_at')
    search_fields = ('email', 'username', 'first_name', 'last_name')
    ordering = ('-created_at',)
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name', 'email', 'phone')}),
        (_('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser', 'is_verified', 'groups', 'user_permissions')}),
        (_('Important dates'), {'fields': ('last_login', 'date_joined', 'created_at', 'updated_at')}),
    )
    readonly_fields = ('created_at', 'updated_at', 'date_joined', 'last_login')
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'first_name', 'last_name', 'password1', 'password2'),
        }),
    )


# Le modèle Organization est maintenant géré dans apps.organizations.admin


@admin.register(Membership)
class MembershipAdmin(admin.ModelAdmin):
    """
    Configuration admin pour le modèle Membership
    """
    list_display = ('user', 'organization', 'role', 'status', 'joined_at')
    list_filter = ('role', 'status', 'joined_at', 'organization__type')
    search_fields = ('user__email', 'user__first_name', 'user__last_name', 'organization__name')
    ordering = ('-joined_at',)
    
    fieldsets = (
        (_('Membership'), {'fields': ('user', 'organization', 'role', 'status')}),
        (_('Invitation'), {'fields': ('invited_by',)}),
        (_('Timestamps'), {'fields': ('joined_at', 'created_at', 'updated_at')}),
    )
    readonly_fields = ('joined_at', 'created_at', 'updated_at')


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    """
    Configuration admin pour le modèle Role
    """
    list_display = ('name', 'organization', 'scope', 'is_default', 'created_at')
    list_filter = ('scope', 'is_default', 'organization', 'created_at')
    search_fields = ('name', 'description')
    ordering = ('-created_at',)
    filter_horizontal = ('permissions',)
    
    fieldsets = (
        (_('Role info'), {'fields': ('name', 'organization', 'scope', 'description', 'is_default')}),
        (_('Permissions'), {'fields': ('permissions',)}),
        (_('Timestamps'), {'fields': ('created_at', 'updated_at')}),
    )
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    """
    Configuration admin pour le modèle Permission
    """
    list_display = ('code', 'description', 'created_at')
    search_fields = ('code', 'description')
    ordering = ('code',)
    
    fieldsets = (
        (_('Permission info'), {'fields': ('code', 'description')}),
        (_('Timestamps'), {'fields': ('created_at',)}),
    )
    readonly_fields = ('created_at',)