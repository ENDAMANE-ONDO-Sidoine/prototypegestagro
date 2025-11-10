"""
URLs pour l'application transport
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    VehicleListView, VehicleDetailView,
    DriverListView, DriverDetailView,
    RouteListView, RouteDetailView,
    ShipmentListView, ShipmentDetailView, ShipmentTrackingView,
    TransportOfferListView, TransportOfferDetailView,
    TransporterProfileView,
    transporter_dashboard_stats, available_vehicles, available_drivers, transport_meta
)

router = DefaultRouter()

urlpatterns = [
    # Véhicules
    path('vehicles/', VehicleListView.as_view(), name='vehicle_list'),
    path('vehicles/<int:pk>/', VehicleDetailView.as_view(), name='vehicle_detail'),
    path('vehicles/available/', available_vehicles, name='available_vehicles'),
    
    # Chauffeurs
    path('drivers/', DriverListView.as_view(), name='driver_list'),
    path('drivers/<int:pk>/', DriverDetailView.as_view(), name='driver_detail'),
    path('drivers/available/', available_drivers, name='available_drivers'),
    
    # Routes
    path('routes/', RouteListView.as_view(), name='route_list'),
    path('routes/<int:pk>/', RouteDetailView.as_view(), name='route_detail'),
    
    # Expéditions
    path('shipments/', ShipmentListView.as_view(), name='shipment_list'),
    path('shipments/<int:pk>/', ShipmentDetailView.as_view(), name='shipment_detail'),
    path('shipments/<int:shipment_id>/tracking/', ShipmentTrackingView.as_view(), name='shipment_tracking'),
    
    # Offres de transport
    path('offers/', TransportOfferListView.as_view(), name='transport_offer_list'),
    path('offers/<int:pk>/', TransportOfferDetailView.as_view(), name='transport_offer_detail'),
    
    # Profil transporteur
    path('profile/', TransporterProfileView.as_view(), name='transporter_profile'),
    
    # Statistiques
    path('dashboard/stats/', transporter_dashboard_stats, name='transporter_dashboard_stats'),
    
    # Métadonnées / listes de référence
    path('meta/', transport_meta, name='transport_meta'),
]
