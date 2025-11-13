"""
Modèles de base pour l'application core
"""
from django.db import models
from django.utils.translation import gettext_lazy as _


class Province(models.Model):
    """
    Modèle pour les provinces du Gabon
    """
    name = models.CharField(_('name'), max_length=100, unique=True)
    chef_lieu = models.CharField(_('chef lieu'), max_length=100)
    is_active = models.BooleanField(_('active'), default=True)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        db_table = 'core_provinces'
        verbose_name = _('Province')
        verbose_name_plural = _('Provinces')
        ordering = ['name']

    def __str__(self):
        return self.name


class City(models.Model):
    """
    Modèle pour les villes du Gabon
    """
    name = models.CharField(_('name'), max_length=100)
    province = models.ForeignKey(Province, on_delete=models.CASCADE, related_name='cities')
    is_chef_lieu = models.BooleanField(_('is chef lieu'), default=False)
    is_active = models.BooleanField(_('active'), default=True)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        db_table = 'core_cities'
        verbose_name = _('City')
        verbose_name_plural = _('Cities')
        ordering = ['province', 'name']
        unique_together = ['name', 'province']

    def __str__(self):
        return f"{self.name}, {self.province.name}"
