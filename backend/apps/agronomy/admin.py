from django.contrib import admin
from .models import (
    Field, Crop, FieldVisit, Diagnostic, Recommendation, WeatherAlert
)


@admin.register(Field)
class FieldAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'organization', 'area_hectares', 'soil_type',
        'irrigation_type', 'is_active', 'created_at'
    ]
    list_filter = ['soil_type', 'irrigation_type', 'is_active', 'created_at']
    search_fields = ['name', 'description', 'organization__name']
    ordering = ['-created_at']


@admin.register(Crop)
class CropAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'field', 'crop_type', 'planting_date',
        'expected_harvest_date', 'status', 'planted_area_hectares'
    ]
    list_filter = ['crop_type', 'status', 'season', 'created_at']
    search_fields = ['name', 'variety', 'field__name']
    ordering = ['-created_at']


@admin.register(FieldVisit)
class FieldVisitAdmin(admin.ModelAdmin):
    list_display = [
        'field', 'agronomist', 'visit_type', 'visit_date',
        'status', 'duration_hours'
    ]
    list_filter = ['visit_type', 'status', 'visit_date']
    search_fields = ['field__name', 'agronomist__email']
    ordering = ['-visit_date']


@admin.register(Diagnostic)
class DiagnosticAdmin(admin.ModelAdmin):
    list_display = [
        'field', 'crop', 'agronomist', 'diagnostic_type',
        'severity', 'status', 'diagnosis_date'
    ]
    list_filter = ['diagnostic_type', 'severity', 'status', 'diagnosis_date']
    search_fields = ['field__name', 'crop__name', 'agronomist__email']
    ordering = ['-diagnosis_date']


@admin.register(Recommendation)
class RecommendationAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'field', 'crop', 'agronomist', 'recommendation_type',
        'priority', 'status', 'created_at'
    ]
    list_filter = ['recommendation_type', 'priority', 'status', 'created_at']
    search_fields = ['title', 'field__name', 'crop__name', 'agronomist__email']
    ordering = ['-created_at']


@admin.register(WeatherAlert)
class WeatherAlertAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'alert_type', 'severity', 'organization',
        'alert_date', 'valid_until', 'status'
    ]
    list_filter = ['alert_type', 'severity', 'status', 'alert_date']
    search_fields = ['title', 'description', 'organization__name']
    ordering = ['-alert_date']
