"""
Serializers pour l'application agronomy
"""
from rest_framework import serializers
from .models import (
    Field, Crop, FieldVisit, Diagnostic, Recommendation, WeatherAlert, AgronomistProfile
)


class AgronomistProfileSerializer(serializers.ModelSerializer):
    """
    Serializer pour le profil agronome
    """
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    profile_photo_url = serializers.SerializerMethodField()
    
    class Meta:
        model = AgronomistProfile
        fields = [
            'id', 'user', 'user_name', 'user_email', 'organization', 'organization_name',
            'license_number', 'license_expiry', 'years_experience',
            'specializations', 'expertise_areas',
            'has_organic_certification', 'has_pest_control_certification', 'has_soil_analysis_certification',
            'phone_emergency', 'current_location',
            'preferred_working_hours', 'max_travel_distance_km',
            'profile_photo', 'profile_photo_url', 'certification_documents', 'field_photos',
            'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def get_profile_photo_url(self, obj):
        """Retourner l'URL de la photo de profil si disponible"""
        if obj.profile_photo:
            return obj.profile_photo.url
        return None
    
    def create(self, validated_data):
        """
        Créer un profil agronome
        """
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['user'] = request.user
        return super().create(validated_data)


class FieldSerializer(serializers.ModelSerializer):
    """
    Serializer pour les champs
    """
    organization_name = serializers.CharField(source='organization.name', read_only=True)

    class Meta:
        model = Field
        fields = [
            'id', 'organization', 'organization_name', 'name', 'description',
            'location', 'area_hectares', 'soil_type', 'ph_level',
            'organic_matter_percentage', 'irrigation_type', 'water_source',
            'is_active', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CropSerializer(serializers.ModelSerializer):
    """
    Serializer pour les cultures
    """
    field_name = serializers.CharField(source='field.name', read_only=True)
    yield_per_hectare = serializers.ReadOnlyField()

    class Meta:
        model = Crop
        fields = [
            'id', 'field', 'field_name', 'product', 'name', 'variety',
            'crop_type', 'planting_date', 'expected_harvest_date',
            'actual_harvest_date', 'planted_area_hectares', 'expected_yield_kg',
            'actual_yield_kg', 'yield_per_hectare', 'season', 'weather_conditions',
            'status', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class FieldVisitSerializer(serializers.ModelSerializer):
    """
    Serializer pour les visites de terrain
    """
    field_name = serializers.CharField(source='field.name', read_only=True)
    agronomist_name = serializers.CharField(source='agronomist.full_name', read_only=True)

    class Meta:
        model = FieldVisit
        fields = [
            'id', 'field', 'field_name', 'agronomist', 'agronomist_name',
            'visit_type', 'visit_date', 'duration_hours', 'weather_conditions',
            'soil_conditions', 'crop_conditions', 'pest_disease_observations',
            'recommendations', 'next_visit_date', 'photos', 'documents',
            'status', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class DiagnosticSerializer(serializers.ModelSerializer):
    """
    Serializer pour les diagnostics
    """
    field_name = serializers.CharField(source='field.name', read_only=True)
    crop_name = serializers.CharField(source='crop.name', read_only=True)
    agronomist_name = serializers.CharField(source='agronomist.full_name', read_only=True)

    class Meta:
        model = Diagnostic
        fields = [
            'id', 'field', 'field_name', 'crop', 'crop_name', 'agronomist',
            'agronomist_name', 'diagnostic_type', 'diagnosis_date', 'severity',
            'findings', 'causes', 'impact_assessment', 'recommended_treatment',
            'treatment_cost_xaf', 'treatment_duration_days', 'follow_up_required',
            'follow_up_date', 'photos', 'lab_results', 'status', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class RecommendationSerializer(serializers.ModelSerializer):
    """
    Serializer pour les recommandations
    """
    field_name = serializers.CharField(source='field.name', read_only=True)
    crop_name = serializers.CharField(source='crop.name', read_only=True)
    agronomist_name = serializers.CharField(source='agronomist.full_name', read_only=True)

    class Meta:
        model = Recommendation
        fields = [
            'id', 'field', 'field_name', 'crop', 'crop_name', 'diagnostic',
            'agronomist', 'agronomist_name', 'recommendation_type', 'title',
            'description', 'priority', 'implementation_steps', 'required_materials',
            'estimated_cost_xaf', 'estimated_duration_days', 'recommended_start_date',
            'recommended_end_date', 'follow_up_required', 'follow_up_date',
            'status', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class WeatherAlertSerializer(serializers.ModelSerializer):
    """
    Serializer pour les alertes météo
    """
    field_name = serializers.CharField(source='field.name', read_only=True)
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    is_active = serializers.ReadOnlyField()

    class Meta:
        model = WeatherAlert
        fields = [
            'id', 'field', 'field_name', 'organization', 'organization_name',
            'alert_type', 'severity', 'title', 'description', 'alert_date',
            'valid_until', 'affected_area', 'recommendations', 'status',
            'source', 'notes', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class FieldDetailSerializer(serializers.ModelSerializer):
    """
    Serializer détaillé pour les champs avec cultures et visites
    """
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    crops = CropSerializer(many=True, read_only=True)
    recent_visits = serializers.SerializerMethodField()
    active_recommendations = serializers.SerializerMethodField()

    class Meta:
        model = Field
        fields = [
            'id', 'organization', 'organization_name', 'name', 'description',
            'location', 'area_hectares', 'soil_type', 'ph_level',
            'organic_matter_percentage', 'irrigation_type', 'water_source',
            'is_active', 'notes', 'crops', 'recent_visits', 'active_recommendations',
            'created_at', 'updated_at'
        ]

    def get_recent_visits(self, obj):
        recent_visits = obj.visits.order_by('-visit_date')[:5]
        return FieldVisitSerializer(recent_visits, many=True).data

    def get_active_recommendations(self, obj):
        active_recommendations = obj.recommendations.filter(status__in=['pending', 'in_progress'])
        return RecommendationSerializer(active_recommendations, many=True).data


class CropDetailSerializer(serializers.ModelSerializer):
    """
    Serializer détaillé pour les cultures avec diagnostics et recommandations
    """
    field_name = serializers.CharField(source='field.name', read_only=True)
    yield_per_hectare = serializers.ReadOnlyField()
    diagnostics = DiagnosticSerializer(many=True, read_only=True)
    recommendations = RecommendationSerializer(many=True, read_only=True)

    class Meta:
        model = Crop
        fields = [
            'id', 'field', 'field_name', 'product', 'name', 'variety',
            'crop_type', 'planting_date', 'expected_harvest_date',
            'actual_harvest_date', 'planted_area_hectares', 'expected_yield_kg',
            'actual_yield_kg', 'yield_per_hectare', 'season', 'weather_conditions',
            'status', 'notes', 'diagnostics', 'recommendations',
            'created_at', 'updated_at'
        ]
