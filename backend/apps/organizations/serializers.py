"""
Serializers pour l'application organizations
"""
from rest_framework import serializers
from .models import Organization


class OrganizationSerializer(serializers.ModelSerializer):
    """
    Serializer pour les organisations
    """
    members_count = serializers.SerializerMethodField()
    logo_url = serializers.SerializerMethodField()

    class Meta:
        model = Organization
        fields = [
            'id', 'name', 'type', 'country', 'industry', 'plan',
            'logo', 'logo_url', 'is_active', 'created_at', 'updated_at', 'members_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_members_count(self, obj):
        return obj.members_count
    
    def get_logo_url(self, obj):
        """Retourner l'URL du logo si disponible"""
        if obj.logo:
            return obj.logo.url
        return None
