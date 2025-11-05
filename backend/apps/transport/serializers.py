"""
Serializers pour l'application transport
"""
from rest_framework import serializers
from django.core.validators import MinValueValidator
from .models import (
    Vehicle, Driver, Route, Shipment, ShipmentTracking, TransportOffer, TransporterProfile
)


class TransporterProfileSerializer(serializers.ModelSerializer):
    """
    Serializer pour le profil transporteur
    """
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    profile_photo_url = serializers.SerializerMethodField()
    
    class Meta:
        model = TransporterProfile
        fields = [
            'id', 'user', 'user_name', 'user_email', 'organization', 'organization_name',
            'license_number', 'license_expiry', 'years_experience',
            'specializations', 'service_areas',
            'has_hazmat_certification', 'has_refrigerated_certification', 'has_oversized_certification',
            'phone_emergency', 'current_location',
            'preferred_working_hours', 'max_distance_km',
            'profile_photo', 'profile_photo_url', 'license_documents', 'vehicle_photos',
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
        Créer un profil transporteur
        """
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['user'] = request.user
        return super().create(validated_data)


class VehicleSerializer(serializers.ModelSerializer):
    """
    Serializer pour les véhicules
    """
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    is_available = serializers.ReadOnlyField()
    current_location_str = serializers.ReadOnlyField()

    class Meta:
        model = Vehicle
        fields = [
            'id', 'organization', 'organization_name', 'license_plate', 'vehicle_type',
            'make', 'model', 'year', 'max_weight', 'max_volume', 'max_pallets',
            'has_refrigeration', 'has_tracking', 'has_loading_equipment',
            'status', 'current_location', 'current_location_str', 'is_available',
            'insurance_number', 'insurance_expiry', 'inspection_date', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class DriverSerializer(serializers.ModelSerializer):
    """
    Serializer pour les chauffeurs
    """
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    is_available = serializers.ReadOnlyField()

    class Meta:
        model = Driver
        fields = [
            'id', 'user', 'user_email', 'user_name', 'organization', 'organization_name',
            'license_number', 'license_type', 'license_expiry', 'status',
            'current_location', 'is_available', 'years_experience',
            'has_hazmat_certification', 'has_refrigerated_certification',
            'phone_emergency', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class RouteSerializer(serializers.ModelSerializer):
    """
    Serializer pour les routes
    """
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    origin_str = serializers.ReadOnlyField()
    destination_str = serializers.ReadOnlyField()

    class Meta:
        model = Route
        fields = [
            'id', 'organization', 'organization_name', 'name', 'description',
            'origin_city', 'origin_country', 'origin_coordinates', 'origin_str',
            'destination_city', 'destination_country', 'destination_coordinates', 'destination_str',
            'distance_km', 'estimated_duration_hours', 'base_price', 'currency',
            'required_vehicle_type', 'requires_refrigeration', 'requires_special_equipment',
            'is_active', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ShipmentTrackingSerializer(serializers.ModelSerializer):
    """
    Serializer pour le suivi des expéditions
    """
    class Meta:
        model = ShipmentTracking
        fields = [
            'id', 'status', 'location', 'description', 'timestamp', 'created_by'
        ]
        read_only_fields = ['id', 'timestamp']


class ShipmentListSerializer(serializers.ModelSerializer):
    """
    Serializer pour la liste des expéditions
    """
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    route_name = serializers.CharField(source='route.name', read_only=True)
    vehicle_plate = serializers.CharField(source='vehicle.license_plate', read_only=True)
    driver_name = serializers.CharField(source='driver.user.full_name', read_only=True)
    is_delayed = serializers.ReadOnlyField()
    progress_percentage = serializers.ReadOnlyField()

    class Meta:
        model = Shipment
        fields = [
            'id', 'tracking_number', 'order_number', 'status', 'payment_status', 'priority',
            'route_name', 'vehicle_plate', 'driver_name', 'scheduled_pickup_date',
            'scheduled_delivery_date', 'actual_pickup_date', 'actual_delivery_date',
            'transport_cost', 'currency', 'is_delayed', 'progress_percentage',
            'created_at', 'updated_at'
        ]


class ShipmentDetailSerializer(serializers.ModelSerializer):
    """
    Serializer pour les détails d'une expédition
    """
    order = serializers.SerializerMethodField()
    route = RouteSerializer(read_only=True)
    vehicle = VehicleSerializer(read_only=True)
    driver = DriverSerializer(read_only=True)
    tracking_events = ShipmentTrackingSerializer(many=True, read_only=True)
    is_delayed = serializers.ReadOnlyField()
    progress_percentage = serializers.ReadOnlyField()

    class Meta:
        model = Shipment
        fields = [
            'id', 'tracking_number', 'order', 'route', 'vehicle', 'driver',
            'status', 'payment_status', 'priority', 'scheduled_pickup_date', 'scheduled_delivery_date',
            'actual_pickup_date', 'actual_delivery_date', 'total_weight', 'total_volume',
            'transport_cost', 'currency', 'special_instructions', 'requires_signature',
            'requires_photo_proof', 'current_location', 'delivery_proof', 'notes',
            'is_delayed', 'progress_percentage', 'tracking_events',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'tracking_number', 'created_at', 'updated_at'
        ]

    def get_order(self, obj):
        return {
            'id': obj.order.id,
            'order_number': obj.order.order_number,
            'buyer_email': obj.order.buyer.email,
            'total_amount': obj.order.total_amount,
            'currency': obj.order.currency
        }


class ShipmentCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer pour créer/modifier une expédition
    """
    class Meta:
        model = Shipment
        fields = [
            'order', 'route', 'vehicle', 'driver', 'priority',
            'scheduled_pickup_date', 'scheduled_delivery_date',
            'total_weight', 'total_volume', 'transport_cost', 'currency',
            'special_instructions', 'requires_signature', 'requires_photo_proof',
            'notes'
        ]

    def validate_scheduled_pickup_date(self, value):
        from django.utils import timezone
        if value <= timezone.now():
            raise serializers.ValidationError("La date de ramassage doit être dans le futur.")
        return value

    def validate_scheduled_delivery_date(self, value):
        pickup_date = self.initial_data.get('scheduled_pickup_date')
        if pickup_date and value <= pickup_date:
            raise serializers.ValidationError("La date de livraison doit être après la date de ramassage.")
        return value


class TransportOfferSerializer(serializers.ModelSerializer):
    """
    Serializer pour les offres de transport
    """
    shipment_tracking = serializers.CharField(source='shipment.tracking_number', read_only=True)
    transporter_name = serializers.CharField(source='transporter.name', read_only=True)
    vehicle_plate = serializers.CharField(source='vehicle.license_plate', read_only=True)
    driver_name = serializers.CharField(source='driver.user.full_name', read_only=True)
    is_expired = serializers.ReadOnlyField()

    class Meta:
        model = TransportOffer
        fields = [
            'id', 'shipment', 'shipment_tracking', 'transporter', 'transporter_name',
            'vehicle', 'vehicle_plate', 'driver', 'driver_name', 'offered_price',
            'currency', 'estimated_pickup_date', 'estimated_delivery_date',
            'status', 'notes', 'is_expired', 'created_at', 'updated_at', 'expires_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TransportOfferCreateSerializer(serializers.ModelSerializer):
    """
    Serializer pour créer une offre de transport
    """
    class Meta:
        model = TransportOffer
        fields = [
            'shipment', 'vehicle', 'driver', 'offered_price', 'currency',
            'estimated_pickup_date', 'estimated_delivery_date', 'notes'
        ]

    def validate_offered_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Le prix proposé doit être positif.")
        return value

    def validate_estimated_pickup_date(self, value):
        from django.utils import timezone
        if value <= timezone.now():
            raise serializers.ValidationError("La date de ramassage estimée doit être dans le futur.")
        return value

    def validate_estimated_delivery_date(self, value):
        pickup_date = self.initial_data.get('estimated_pickup_date')
        if pickup_date and value <= pickup_date:
            raise serializers.ValidationError("La date de livraison estimée doit être après la date de ramassage.")
        return value
