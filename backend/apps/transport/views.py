"""
Vues pour l'application transport
"""
from rest_framework import status, generics, permissions, filters, serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Sum
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.translation import gettext as _
from apps.core.permissions import IsTransporterOrAdmin, IsOwnerOrAdmin
from .models import (
    Vehicle, Driver, Route, Shipment, ShipmentTracking, TransportOffer, TransporterProfile
)
from .serializers import (
    VehicleSerializer, DriverSerializer, RouteSerializer,
    ShipmentListSerializer, ShipmentDetailSerializer, ShipmentCreateUpdateSerializer,
    ShipmentTrackingSerializer, TransportOfferSerializer, TransportOfferCreateSerializer,
    TransporterProfileSerializer
)
from apps.organizations.models import Organization


# === VUES POUR LE PROFIL TRANSPORTEUR ===

class TransporterProfileView(generics.RetrieveUpdateAPIView):
    """
    Profil du transporteur
    """
    serializer_class = TransporterProfileSerializer
    permission_classes = [IsTransporterOrAdmin]

    def get_object(self):
        profile, created = TransporterProfile.objects.get_or_create(
            user=self.request.user,
            defaults={'organization': self.request.user.memberships.first().organization if self.request.user.memberships.exists() else None}
        )
        return profile
    
    def patch(self, request, *args, **kwargs):
        """
        Mise à jour du profil avec gestion de l'upload de photo
        """
        profile = self.get_object()
        
        # Si une photo est fournie, la traiter séparément
        if 'profile_photo' in request.FILES:
            photo_file = request.FILES['profile_photo']
            
            # Supprimer l'ancienne photo s'il existe
            if profile.profile_photo:
                profile.profile_photo.delete()
            
            # Sauvegarder la nouvelle photo
            profile.profile_photo = photo_file
            profile.save()
            
            return Response({
                'message': 'Photo de profil mise à jour avec succès',
                'profile_photo_url': profile.profile_photo.url,
                'profile_id': profile.id
            }, status=status.HTTP_200_OK)
        
        # Sinon, traitement normal du PATCH
        return super().patch(request, *args, **kwargs)


class VehicleListView(generics.ListCreateAPIView):
    """
    Vue pour lister et créer des véhicules
    """
    serializer_class = VehicleSerializer
    permission_classes = [IsTransporterOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['vehicle_type', 'status', 'has_refrigeration']
    search_fields = ['license_plate', 'make', 'model']
    ordering_fields = ['created_at', 'max_weight', 'max_volume']
    ordering = ['-created_at']

    def get_queryset(self):
        # Un transporteur ne peut voir que les véhicules de ses organisations
        user_orgs = self.request.user.memberships.filter(
            status='active',
            role__in=['admin', 'manager', 'member', 'transporter']
        ).values_list('organization_id', flat=True)
        
        return Vehicle.objects.filter(organization_id__in=user_orgs)

    def perform_create(self, serializer):
        # Déterminer l'organisation de l'utilisateur
        user_orgs = self.request.user.memberships.filter(
            status='active',
            role__in=['admin', 'manager', 'member', 'transporter']
        ).values_list('organization_id', flat=True)
        
        if not user_orgs:
            raise serializers.ValidationError("Vous devez être membre d'une organisation pour créer des véhicules.")
        
        organization = Organization.objects.get(id=user_orgs[0])
        serializer.save(organization=organization, created_by=self.request.user)


class VehicleDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vue pour les détails d'un véhicule
    """
    serializer_class = VehicleSerializer
    permission_classes = [IsTransporterOrAdmin]

    def get_queryset(self):
        user_orgs = self.request.user.memberships.filter(
            status='active',
            role__in=['admin', 'manager', 'member', 'transporter']
        ).values_list('organization_id', flat=True)
        
        return Vehicle.objects.filter(organization_id__in=user_orgs)


# === VUES POUR LES CHAUFFEURS ===

class DriverListView(generics.ListCreateAPIView):
    """
    Vue pour lister et créer des chauffeurs
    """
    serializer_class = DriverSerializer
    permission_classes = [IsTransporterOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['license_type', 'status', 'has_hazmat_certification']
    search_fields = ['license_number', 'user__first_name', 'user__last_name', 'user__email']
    ordering_fields = ['created_at', 'years_experience']
    ordering = ['-created_at']

    def get_queryset(self):
        user_orgs = self.request.user.memberships.filter(
            status='active',
            role__in=['admin', 'manager', 'member', 'transporter']
        ).values_list('organization_id', flat=True)
        
        return Driver.objects.filter(organization_id__in=user_orgs).select_related('user', 'organization')

    def perform_create(self, serializer):
        user_orgs = self.request.user.memberships.filter(
            status='active',
            role__in=['admin', 'manager', 'member', 'transporter']
        ).values_list('organization_id', flat=True)
        
        if not user_orgs:
            raise serializers.ValidationError("Vous devez être membre d'une organisation pour créer des chauffeurs.")
        
        organization = Organization.objects.get(id=user_orgs[0])
        serializer.save(organization=organization)


class DriverDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vue pour les détails d'un chauffeur
    """
    serializer_class = DriverSerializer
    permission_classes = [IsTransporterOrAdmin]

    def get_queryset(self):
        user_orgs = self.request.user.memberships.filter(
            status='active',
            role__in=['admin', 'manager', 'member', 'transporter']
        ).values_list('organization_id', flat=True)
        
        return Driver.objects.filter(organization_id__in=user_orgs).select_related('user', 'organization')


# === VUES POUR LES ROUTES ===

class RouteListView(generics.ListCreateAPIView):
    """
    Vue pour lister et créer des routes
    """
    serializer_class = RouteSerializer
    permission_classes = [IsTransporterOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['origin_city_fk', 'destination_city_fk', 'requires_refrigeration', 'is_active']
    search_fields = ['name', 'origin_city_fk__name', 'destination_city_fk__name', 'origin_city_old', 'destination_city_old']
    ordering_fields = ['created_at', 'distance_km', 'base_price']
    ordering = ['-created_at']

    def get_queryset(self):
        user_orgs = self.request.user.memberships.filter(
            status='active',
            role__in=['admin', 'manager', 'member', 'transporter']
        ).values_list('organization_id', flat=True)
        
        return Route.objects.filter(organization_id__in=user_orgs)

    def perform_create(self, serializer):
        user_orgs = self.request.user.memberships.filter(
            status='active',
            role__in=['admin', 'manager', 'member', 'transporter']
        ).values_list('organization_id', flat=True)
        
        if not user_orgs:
            raise serializers.ValidationError("Vous devez être membre d'une organisation pour créer des routes.")
        
        organization = Organization.objects.get(id=user_orgs[0])
        serializer.save(organization=organization, created_by=self.request.user)


class RouteDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vue pour les détails d'une route
    """
    serializer_class = RouteSerializer
    permission_classes = [IsTransporterOrAdmin]

    def get_queryset(self):
        user_orgs = self.request.user.memberships.filter(
            status='active',
            role__in=['admin', 'manager', 'member', 'transporter']
        ).values_list('organization_id', flat=True)
        
        return Route.objects.filter(organization_id__in=user_orgs)


# === VUES POUR LES EXPÉDITIONS ===

class ShipmentListView(generics.ListCreateAPIView):
    """
    Vue pour lister et créer des expéditions
    """
    permission_classes = [IsTransporterOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'vehicle', 'driver']
    search_fields = ['tracking_number', 'order__order_number']
    ordering_fields = ['created_at', 'scheduled_pickup_date', 'scheduled_delivery_date']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ShipmentCreateUpdateSerializer
        return ShipmentListSerializer

    def get_queryset(self):
        user_orgs = self.request.user.memberships.filter(
            status='active',
            role__in=['admin', 'manager', 'member', 'transporter']
        ).values_list('organization_id', flat=True)
        
        return Shipment.objects.filter(
            Q(vehicle__organization_id__in=user_orgs) |
            Q(driver__organization_id__in=user_orgs) |
            Q(route__organization_id__in=user_orgs)
        ).select_related('order', 'route', 'vehicle', 'driver__user')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ShipmentDetailView(generics.RetrieveUpdateAPIView):
    """
    Vue pour les détails d'une expédition
    """
    serializer_class = ShipmentDetailSerializer
    permission_classes = [IsTransporterOrAdmin]

    def get_queryset(self):
        user_orgs = self.request.user.memberships.filter(
            status='active',
            role__in=['admin', 'manager', 'member', 'transporter']
        ).values_list('organization_id', flat=True)
        
        return Shipment.objects.filter(
            Q(vehicle__organization_id__in=user_orgs) |
            Q(driver__organization_id__in=user_orgs) |
            Q(route__organization_id__in=user_orgs)
        ).select_related('order', 'route', 'vehicle', 'driver__user').prefetch_related('tracking_events')

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ShipmentCreateUpdateSerializer
        return ShipmentDetailSerializer


class ShipmentTrackingView(APIView):
    """
    Vue pour ajouter des événements de suivi
    """
    permission_classes = [IsTransporterOrAdmin]

    def post(self, request, shipment_id):
        shipment = get_object_or_404(Shipment, id=shipment_id)
        
        # Vérifier que l'utilisateur peut modifier cette expédition
        user_orgs = request.user.memberships.filter(
            status='active',
            role__in=['admin', 'manager', 'member', 'transporter']
        ).values_list('organization_id', flat=True)
        
        can_modify = (
            shipment.vehicle.organization_id in user_orgs or
            shipment.driver.organization_id in user_orgs or
            shipment.route.organization_id in user_orgs
        )
        
        if not can_modify:
            return Response(
                {'error': 'Vous n\'avez pas le droit de modifier cette expédition.'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = ShipmentTrackingSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(shipment=shipment, created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# === VUES POUR LES OFFRES DE TRANSPORT ===

class TransportOfferListView(generics.ListCreateAPIView):
    """
    Vue pour lister et créer des offres de transport
    """
    permission_classes = [IsTransporterOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'vehicle', 'driver']
    ordering_fields = ['created_at', 'offered_price']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TransportOfferCreateSerializer
        return TransportOfferSerializer

    def get_queryset(self):
        user_orgs = self.request.user.memberships.filter(
            status='active',
            role__in=['admin', 'manager', 'member', 'transporter']
        ).values_list('organization_id', flat=True)
        
        return TransportOffer.objects.filter(transporter_id__in=user_orgs).select_related(
            'shipment', 'transporter', 'vehicle', 'driver__user'
        )

    def perform_create(self, serializer):
        user_orgs = self.request.user.memberships.filter(
            status='active',
            role__in=['admin', 'manager', 'member', 'transporter']
        ).values_list('organization_id', flat=True)
        
        if not user_orgs:
            raise serializers.ValidationError("Vous devez être membre d'une organisation pour créer des offres.")
        
        transporter = Organization.objects.get(id=user_orgs[0])
        serializer.save(transporter=transporter)


class TransportOfferDetailView(generics.RetrieveUpdateAPIView):
    """
    Vue pour les détails d'une offre de transport
    """
    serializer_class = TransportOfferSerializer
    permission_classes = [IsTransporterOrAdmin]

    def get_queryset(self):
        user_orgs = self.request.user.memberships.filter(
            status='active',
            role__in=['admin', 'manager', 'member', 'transporter']
        ).values_list('organization_id', flat=True)
        
        return TransportOffer.objects.filter(transporter_id__in=user_orgs).select_related(
            'shipment', 'transporter', 'vehicle', 'driver__user'
        )


# === VUES POUR LES STATISTIQUES ===

@api_view(['GET'])
@permission_classes([IsTransporterOrAdmin])
def transporter_dashboard_stats(request):
    """
    Statistiques pour le tableau de bord des transporteurs
    """
    user_orgs = request.user.memberships.filter(
        status='active',
        role__in=['admin', 'manager', 'member', 'transporter']
    ).values_list('organization_id', flat=True)
    
    if not user_orgs:
        return Response({'error': 'Aucune organisation trouvée.'}, status=status.HTTP_404_NOT_FOUND)

    # Statistiques des véhicules
    vehicles_stats = Vehicle.objects.filter(organization_id__in=user_orgs).aggregate(
        total_vehicles=Count('id'),
        available_vehicles=Count('id', filter=Q(status='available')),
        in_use_vehicles=Count('id', filter=Q(status='in_use')),
        maintenance_vehicles=Count('id', filter=Q(status='maintenance'))
    )

    # Statistiques des chauffeurs
    drivers_stats = Driver.objects.filter(organization_id__in=user_orgs).aggregate(
        total_drivers=Count('id'),
        available_drivers=Count('id', filter=Q(status='available')),
        on_duty_drivers=Count('id', filter=Q(status='on_duty'))
    )

    # Statistiques des expéditions
    shipments_stats = Shipment.objects.filter(
        Q(vehicle__organization_id__in=user_orgs) |
        Q(driver__organization_id__in=user_orgs) |
        Q(route__organization_id__in=user_orgs)
    ).aggregate(
        total_shipments=Count('id'),
        pending_shipments=Count('id', filter=Q(status='pending')),
        in_transit_shipments=Count('id', filter=Q(status='in_transit')),
        delivered_shipments=Count('id', filter=Q(status='delivered')),
        total_revenue=Sum('transport_cost', filter=Q(status='delivered'))
    )

    # Statistiques des offres
    offers_stats = TransportOffer.objects.filter(transporter_id__in=user_orgs).aggregate(
        total_offers=Count('id'),
        pending_offers=Count('id', filter=Q(status='pending')),
        accepted_offers=Count('id', filter=Q(status='accepted')),
        total_potential_revenue=Sum('offered_price', filter=Q(status='accepted'))
    )

    return Response({
        'vehicles': vehicles_stats,
        'drivers': drivers_stats,
        'shipments': shipments_stats,
        'offers': offers_stats
    })


@api_view(['GET'])
@permission_classes([IsTransporterOrAdmin])
def available_vehicles(request):
    """
    Liste des véhicules disponibles
    """
    user_orgs = request.user.memberships.filter(
        status='active',
        role__in=['admin', 'manager', 'member', 'transporter']
    ).values_list('organization_id', flat=True)
    
    vehicles = Vehicle.objects.filter(
        organization_id__in=user_orgs,
        status='available'
    )
    
    serializer = VehicleSerializer(vehicles, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsTransporterOrAdmin])
def available_drivers(request):
    """
    Liste des chauffeurs disponibles
    """
    user_orgs = request.user.memberships.filter(
        status='active',
        role__in=['admin', 'manager', 'member', 'transporter']
    ).values_list('organization_id', flat=True)
    
    drivers = Driver.objects.filter(
        organization_id__in=user_orgs,
        status='available'
    ).select_related('user')
    
    serializer = DriverSerializer(drivers, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def transport_meta(request):
    """
    Renvoie les listes de référence pour les formulaires transport (select, dropdown, autocomplete).
    """

    def _choices_to_list(choices):
        return [
            {
                'valeur': valeur,
                'libelle': str(libelle),
            }
            for valeur, libelle in choices
        ]

    # Types de véhicule
    types_vehicule = _choices_to_list(Vehicle.VEHICLE_TYPES)

    # Statuts de véhicule
    statuts_vehicule = _choices_to_list(Vehicle.STATUS_CHOICES)

    # Types de permis
    types_permis = _choices_to_list(Driver.LICENSE_TYPES)

    # Statuts chauffeur
    statuts_chauffeur = _choices_to_list(Driver.STATUS_CHOICES)

    # Priorités d'expédition
    priorites_expedition = _choices_to_list(Shipment.PRIORITY_CHOICES)

    # Statuts expédition
    statuts_expedition = _choices_to_list(Shipment.STATUS_CHOICES)

    # Statuts paiement expédition
    statuts_paiement = _choices_to_list(Shipment.PAYMENT_STATUS_CHOICES)

    # Statuts offre transport
    statuts_offre = _choices_to_list(TransportOffer.STATUS_CHOICES)

    # Véhicules disponibles pour l'utilisateur courant
    vehicules_disponibles = []
    chauffeurs_disponibles = []
    routes_disponibles = []
    user = request.user if request.user.is_authenticated else None

    if user and hasattr(user, 'memberships'):
        org_ids = list(user.memberships.filter(
            status='active',
            role__in=['admin', 'manager', 'member', 'transporter']
        ).values_list('organization_id', flat=True))

        if org_ids:
            vehicules = Vehicle.objects.filter(
                organization_id__in=org_ids,
                status='available'
            ).values('id', 'license_plate', 'make', 'model', 'vehicle_type')

            chauffeurs = Driver.objects.filter(
                organization_id__in=org_ids,
                status='available'
            ).select_related('user').values('id', 'user__first_name', 'user__last_name', 'license_number', 'license_type')

            routes = Route.objects.filter(
                organization_id__in=org_ids,
                is_active=True
            ).select_related('origin_city_fk', 'destination_city_fk').values(
                'id', 'name', 'origin_city_fk__name', 'destination_city_fk__name', 
                'origin_city_old', 'destination_city_old', 'required_vehicle_type'
            )

            vehicules_disponibles = [
                {
                    'id': v['id'],
                    'immatriculation': v['license_plate'],
                    'marque': v['make'],
                    'modele': v['model'],
                    'type': v['vehicle_type'],
                }
                for v in vehicules
            ]

            chauffeurs_disponibles = [
                {
                    'id': c['id'],
                    'nomComplet': f"{c['user__first_name']} {c['user__last_name']}".strip(),
                    'numeroPermis': c['license_number'],
                    'typePermis': c['license_type'],
                }
                for c in chauffeurs
            ]

            routes_disponibles = [
                {
                    'id': r['id'],
                    'nom': r['name'],
                    'depart': r['origin_city_fk__name'] or r['origin_city_old'] or '',
                    'arrivee': r['destination_city_fk__name'] or r['destination_city_old'] or '',
                    'typeVehiculeRequis': r['required_vehicle_type'],
                }
                for r in routes
            ]

    payload = {
        'typesVehicule': types_vehicule,
        'statutsVehicule': statuts_vehicule,
        'typesPermis': types_permis,
        'statutsChauffeur': statuts_chauffeur,
        'prioritesExpedition': priorites_expedition,
        'statutsExpedition': statuts_expedition,
        'statutsPaiementExpedition': statuts_paiement,
        'statutsOffreTransport': statuts_offre,
        'vehiculesDisponibles': vehicules_disponibles,
        'chauffeursDisponibles': chauffeurs_disponibles,
        'routesDisponibles': routes_disponibles,
        'message': _('Référentiels transport chargés avec succès.'),
    }
    return Response(payload)
