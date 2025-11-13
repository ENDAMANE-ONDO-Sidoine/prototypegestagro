"""
Serializers pour l'application core
"""
from rest_framework import serializers
from .models import Province, City


class CitySerializer(serializers.ModelSerializer):
    """
    Serializer pour les villes
    """
    province_name = serializers.CharField(source='province.name', read_only=True)
    
    class Meta:
        model = City
        fields = ['id', 'name', 'province', 'province_name', 'is_chef_lieu', 'is_active']
        read_only_fields = ['id']


class ProvinceSerializer(serializers.ModelSerializer):
    """
    Serializer pour les provinces
    """
    cities = CitySerializer(many=True, read_only=True)
    cities_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Province
        fields = ['id', 'name', 'chef_lieu', 'is_active', 'cities', 'cities_count']
        read_only_fields = ['id']
    
    def get_cities_count(self, obj):
        """Retourner le nombre de villes dans la province"""
        return obj.cities.filter(is_active=True).count()

