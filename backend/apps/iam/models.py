"""
Modèles pour l'application IAM (Identity & Access Management)
"""
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.core.storage import MinIOUserAvatarsStorage


class User(AbstractUser):
    """
    Modèle utilisateur personnalisé pour GestAgro
    """
    email = models.EmailField(_('email address'), unique=True)
    phone = models.CharField(_('phone number'), max_length=20, blank=True)
    avatar = models.ImageField(_('avatar'), upload_to='users/avatars/', storage=MinIOUserAvatarsStorage(), blank=True, null=True)
    is_verified = models.BooleanField(_('verified'), default=False)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    class Meta:
        db_table = 'iam_users'
        verbose_name = _('User')
        verbose_name_plural = _('Users')

    def __str__(self):
        return self.email

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()


# Le modèle Organization a été déplacé vers apps.organizations.models


class Membership(models.Model):
    """
    Modèle pour les adhésions des utilisateurs aux organisations
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='memberships')
    organization = models.ForeignKey('organizations.Organization', on_delete=models.CASCADE, related_name='memberships')
    role = models.CharField(_('role'), max_length=50, choices=[
        ('admin', _('Administrator')),
        ('manager', _('Manager')),
        ('farmer', _('Farmer')),
        ('buyer', _('Buyer')),
        ('transporter', _('Transporter')),
        ('agronomist', _('Agronomist')),
        ('supplier', _('Supplier')),
        ('member', _('Member')),
        ('viewer', _('Viewer')),
    ])
    status = models.CharField(_('status'), max_length=20, choices=[
        ('pending', _('Pending')),
        ('active', _('Active')),
        ('inactive', _('Inactive')),
        ('suspended', _('Suspended')),
    ], default='pending')
    invited_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='invitations_sent')
    joined_at = models.DateTimeField(_('joined at'), auto_now_add=True)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        db_table = 'iam_memberships'
        verbose_name = _('Membership')
        verbose_name_plural = _('Memberships')
        unique_together = ['user', 'organization']

    def __str__(self):
        return f"{self.user.email} - {self.organization.name} ({self.role})"


class Role(models.Model):
    """
    Modèle pour les rôles personnalisés
    """
    name = models.CharField(_('name'), max_length=100)
    organization = models.ForeignKey('organizations.Organization', on_delete=models.CASCADE, null=True, blank=True, related_name='roles')
    scope = models.CharField(_('scope'), max_length=50, choices=[
        ('global', _('Global')),
        ('organization', _('Organization')),
    ])
    description = models.TextField(_('description'), blank=True)
    is_default = models.BooleanField(_('default'), default=False)
    permissions = models.ManyToManyField('Permission', blank=True, related_name='roles')
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        db_table = 'iam_roles'
        verbose_name = _('Role')
        verbose_name_plural = _('Roles')

    def __str__(self):
        return self.name


class Permission(models.Model):
    """
    Modèle pour les permissions
    """
    code = models.CharField(_('code'), max_length=100, unique=True)
    description = models.CharField(_('description'), max_length=255)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)

    class Meta:
        db_table = 'iam_permissions'
        verbose_name = _('Permission')
        verbose_name_plural = _('Permissions')

    def __str__(self):
        return self.code