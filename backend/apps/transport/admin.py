from django.contrib import admin
from .models import (
    Vehicle, Driver, Route, Shipment, ShipmentTracking, TransportOffer
)


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = [
        'license_plate', 'make', 'model', 'vehicle_type', 'organization',
        'status', 'max_weight', 'max_volume', 'created_at'
    ]
    list_filter = ['vehicle_type', 'status', 'has_refrigeration', 'created_at']
    search_fields = ['license_plate', 'make', 'model', 'organization__name']
    ordering = ['-created_at']


@admin.register(Driver)
class DriverAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'license_number', 'license_type', 'organization',
        'status', 'years_experience', 'created_at'
    ]
    list_filter = ['license_type', 'status', 'has_hazmat_certification', 'created_at']
    search_fields = ['license_number', 'user__email', 'user__first_name', 'user__last_name']
    ordering = ['-created_at']


@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'origin_city', 'destination_city', 'organization',
        'distance_km', 'base_price', 'is_active', 'created_at'
    ]
    list_filter = ['is_active', 'requires_refrigeration', 'created_at']
    search_fields = ['name', 'origin_city', 'destination_city', 'organization__name']
    ordering = ['-created_at']


class ShipmentTrackingInline(admin.TabularInline):
    model = ShipmentTracking
    extra = 0


@admin.register(Shipment)
class ShipmentAdmin(admin.ModelAdmin):
    list_display = [
        'tracking_number', 'order', 'status', 'payment_status', 'priority', 'vehicle', 'driver',
        'scheduled_pickup_date', 'scheduled_delivery_date', 'transport_cost', 'created_at'
    ]
    list_filter = ['status', 'payment_status', 'priority', 'created_at']
    search_fields = ['tracking_number', 'order__order_number']
    ordering = ['-created_at']
    inlines = [ShipmentTrackingInline]


@admin.register(ShipmentTracking)
class ShipmentTrackingAdmin(admin.ModelAdmin):
    list_display = ['shipment', 'status', 'timestamp', 'created_by']
    list_filter = ['status', 'timestamp']
    ordering = ['-timestamp']


@admin.register(TransportOffer)
class TransportOfferAdmin(admin.ModelAdmin):
    list_display = [
        'transporter', 'shipment', 'vehicle', 'driver', 'offered_price',
        'status', 'created_at', 'expires_at'
    ]
    list_filter = ['status', 'created_at']
    search_fields = ['transporter__name', 'shipment__tracking_number']
    ordering = ['-created_at']
