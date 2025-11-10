"""
URLs pour l'application agronomy
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    FieldListView, FieldDetailView,
    CropListView, CropDetailView,
    FieldVisitListView, FieldVisitDetailView,
    DiagnosticListView, DiagnosticDetailView,
    RecommendationListView, RecommendationDetailView,
    WeatherAlertListView, WeatherAlertDetailView,
    AgronomistProfileView,
    agronomist_dashboard_stats, field_yield_analysis, active_weather_alerts, agronomy_meta
)

router = DefaultRouter()

urlpatterns = [
    # Champs
    path('fields/', FieldListView.as_view(), name='field_list'),
    path('fields/<int:pk>/', FieldDetailView.as_view(), name='field_detail'),
    path('fields/<int:field_id>/yield-analysis/', field_yield_analysis, name='field_yield_analysis'),
    
    # Cultures
    path('crops/', CropListView.as_view(), name='crop_list'),
    path('crops/<int:pk>/', CropDetailView.as_view(), name='crop_detail'),
    
    # Visites de terrain
    path('visits/', FieldVisitListView.as_view(), name='field_visit_list'),
    path('visits/<int:pk>/', FieldVisitDetailView.as_view(), name='field_visit_detail'),
    
    # Diagnostics
    path('diagnostics/', DiagnosticListView.as_view(), name='diagnostic_list'),
    path('diagnostics/<int:pk>/', DiagnosticDetailView.as_view(), name='diagnostic_detail'),
    
    # Recommandations
    path('recommendations/', RecommendationListView.as_view(), name='recommendation_list'),
    path('recommendations/<int:pk>/', RecommendationDetailView.as_view(), name='recommendation_detail'),
    
    # Alertes météo
    path('weather-alerts/', WeatherAlertListView.as_view(), name='weather_alert_list'),
    path('weather-alerts/<int:pk>/', WeatherAlertDetailView.as_view(), name='weather_alert_detail'),
    path('weather-alerts/active/', active_weather_alerts, name='active_weather_alerts'),
    
    # Profil agronome
    path('profile/', AgronomistProfileView.as_view(), name='agronomist_profile'),
    
    # Statistiques
    path('dashboard/stats/', agronomist_dashboard_stats, name='agronomist_dashboard_stats'),
    
    # Métadonnées / listes de référence
    path('meta/', agronomy_meta, name='agronomy_meta'),
]
