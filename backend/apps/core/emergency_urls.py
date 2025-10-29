"""
URLs d'urgence pour diagnostic
⚠️ À SUPPRIMER après résolution des problèmes
"""
from django.urls import path
from . import emergency_views

urlpatterns = [
    path('check-db/', emergency_views.emergency_check_db, name='emergency_check_db'),
    path('migrate/', emergency_views.emergency_migrate, name='emergency_migrate'),
]
