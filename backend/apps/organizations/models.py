from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.core.storage import MinIOOrganizationLogosStorage


class Organization(models.Model):
    """
    Modèle pour les organisations (coopératives, entreprises, ONG)
    """
    name = models.CharField(_('name'), max_length=255)
    type = models.CharField(_('type'), max_length=50, choices=[
        ('cooperative', _('Cooperative')),
        ('enterprise', _('Enterprise')),
        ('ngo', _('NGO')),
        ('government', _('Government')),
        ('other', _('Other')),
    ])
    country = models.CharField(_('country'), max_length=100, default='Gabon')
    industry = models.CharField(_('industry'), max_length=100, blank=True)
    plan = models.CharField(_('plan'), max_length=50, default='basic', choices=[
        ('basic', _('Basic')),
        ('premium', _('Premium')),
        ('enterprise', _('Enterprise')),
    ])
    settings = models.JSONField(_('settings'), default=dict, blank=True)
    logo = models.ImageField(_('logo'), upload_to='organizations/logos/', storage=MinIOOrganizationLogosStorage(), blank=True, null=True)
    is_active = models.BooleanField(_('active'), default=True)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        verbose_name = _('Organization')
        verbose_name_plural = _('Organizations')
        ordering = ['name']

    def __str__(self):
        return self.name

    @property
    def members_count(self):
        return self.memberships.filter(status='active').count()
