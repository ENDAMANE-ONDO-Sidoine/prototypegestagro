"""
Vues pour l'application suppliers
"""
from rest_framework import generics, status, viewsets, serializers
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Count, Sum, Avg, Q, F
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from drf_spectacular.utils import extend_schema
from apps.core.permissions import IsSupplierOrAdmin, IsOwnerOrAdmin, IsFarmerOrAdmin
from .models import (
    SupplierProfile, InputCategory, Input, InputImage,
    EquipmentCategory, Equipment, EquipmentImage,
    StockMovement, SupplierOrder, SupplierOrderItem, SupplierReview
)
from .serializers import (
    SupplierProfileSerializer, InputCategorySerializer, InputSerializer, InputImageSerializer,
    EquipmentCategorySerializer, EquipmentSerializer, EquipmentImageSerializer,
    StockMovementSerializer, SupplierOrderSerializer, SupplierOrderItemSerializer,
    SupplierReviewSerializer
)
from apps.organizations.models import Organization
from django.contrib.contenttypes.models import ContentType


# === VUES POUR LE PROFIL FOURNISSEUR ===

class SupplierProfileView(generics.RetrieveUpdateAPIView):
    """
    Profil du fournisseur
    """
    serializer_class = SupplierProfileSerializer
    permission_classes = [IsSupplierOrAdmin]

    def get_object(self):
        user_organization = self.request.user.memberships.filter(
            role__in=['supplier', 'admin'],
            status='active'
        ).first()
        if user_organization:
            user_organization = user_organization.organization
        
        profile, created = SupplierProfile.objects.get_or_create(
            user=self.request.user,
            defaults={'organization': user_organization} if user_organization else {}
        )
        return profile


# === VUES POUR LES CATÉGORIES D'INTRANTS ===

class InputCategoryListView(generics.ListCreateAPIView):
    """
    Liste et création des catégories d'intrants
    """
    serializer_class = InputCategorySerializer
    permission_classes = [IsSupplierOrAdmin]
    queryset = InputCategory.objects.filter(is_active=True)

    def get_queryset(self):
        queryset = InputCategory.objects.filter(is_active=True)
        category_type = self.request.query_params.get('category_type')
        if category_type:
            queryset = queryset.filter(category_type=category_type)
        return queryset


class InputCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Détail, modification et suppression d'une catégorie d'intrants
    """
    queryset = InputCategory.objects.filter(is_active=True)
    serializer_class = InputCategorySerializer
    permission_classes = [IsSupplierOrAdmin]

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()


# === VUES POUR LES INTRANTS ===

class InputListView(generics.ListCreateAPIView):
    """
    Liste et création d'intrants
    """
    serializer_class = InputSerializer
    permission_classes = [IsSupplierOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'status', 'quality_grade', 'organic_certified']
    search_fields = ['name', 'description', 'sku', 'brand']
    ordering_fields = ['created_at', 'price', 'stock_quantity']
    ordering = ['-created_at']

    def get_queryset(self):
        # Filtrer par organisation de l'utilisateur
        user_orgs = self.request.user.memberships.filter(
            status='active',
            role__in=['supplier', 'admin']
        ).values_list('organization_id', flat=True)
        queryset = Input.objects.filter(organization_id__in=user_orgs)
        
        # Filtre pour les producteurs (lecture seule)
        if self.request.query_params.get('available') == 'true':
            queryset = queryset.filter(status='active', stock_quantity__gt=0)
        
        return queryset

    def perform_create(self, serializer):
        user_org = self.request.user.memberships.filter(
            role__in=['supplier', 'admin'],
            status='active'
        ).first()
        if user_org:
            serializer.save(organization=user_org.organization, created_by=self.request.user)
        else:
            raise serializers.ValidationError("Vous devez être membre d'une organisation fournisseur")


class InputDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Détail, modification et suppression d'un intrant
    """
    serializer_class = InputSerializer
    permission_classes = [IsSupplierOrAdmin]

    def get_queryset(self):
        user_orgs = self.request.user.memberships.filter(
            status='active',
            role__in=['supplier', 'admin']
        ).values_list('organization_id', flat=True)
        return Input.objects.filter(organization_id__in=user_orgs)


class InputImageUploadView(generics.CreateAPIView):
    """
    Upload d'images pour un intrant
    """
    serializer_class = InputImageSerializer
    permission_classes = [IsSupplierOrAdmin]

    def perform_create(self, serializer):
        input_id = self.kwargs['input_id']
        input_item = get_object_or_404(Input, id=input_id)
        serializer.save(input_item=input_item)


# === VUES POUR LES CATÉGORIES D'ÉQUIPEMENTS ===

class EquipmentCategoryListView(generics.ListCreateAPIView):
    """
    Liste et création des catégories d'équipements
    """
    serializer_class = EquipmentCategorySerializer
    permission_classes = [IsSupplierOrAdmin]
    queryset = EquipmentCategory.objects.filter(is_active=True)


class EquipmentCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Détail, modification et suppression d'une catégorie d'équipements
    """
    queryset = EquipmentCategory.objects.filter(is_active=True)
    serializer_class = EquipmentCategorySerializer
    permission_classes = [IsSupplierOrAdmin]

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()


# === VUES POUR LES ÉQUIPEMENTS ===

class EquipmentListView(generics.ListCreateAPIView):
    """
    Liste et création d'équipements
    """
    serializer_class = EquipmentSerializer
    permission_classes = [IsSupplierOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'status', 'condition']
    search_fields = ['name', 'description', 'sku', 'brand', 'model']
    ordering_fields = ['created_at', 'price', 'stock_quantity']
    ordering = ['-created_at']

    def get_queryset(self):
        user_orgs = self.request.user.memberships.filter(
            status='active',
            role__in=['supplier', 'admin']
        ).values_list('organization_id', flat=True)
        queryset = Equipment.objects.filter(organization_id__in=user_orgs)
        
        if self.request.query_params.get('available') == 'true':
            queryset = queryset.filter(status='active', stock_quantity__gt=0)
        
        return queryset

    def perform_create(self, serializer):
        user_org = self.request.user.memberships.filter(
            role__in=['supplier', 'admin'],
            status='active'
        ).first()
        if user_org:
            serializer.save(organization=user_org.organization, created_by=self.request.user)
        else:
            raise serializers.ValidationError("Vous devez être membre d'une organisation fournisseur")


class EquipmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Détail, modification et suppression d'un équipement
    """
    serializer_class = EquipmentSerializer
    permission_classes = [IsSupplierOrAdmin]

    def get_queryset(self):
        user_orgs = self.request.user.memberships.filter(
            status='active',
            role__in=['supplier', 'admin']
        ).values_list('organization_id', flat=True)
        return Equipment.objects.filter(organization_id__in=user_orgs)


class EquipmentImageUploadView(generics.CreateAPIView):
    """
    Upload d'images pour un équipement
    """
    serializer_class = EquipmentImageSerializer
    permission_classes = [IsSupplierOrAdmin]

    def perform_create(self, serializer):
        equipment_id = self.kwargs['equipment_id']
        equipment = get_object_or_404(Equipment, id=equipment_id)
        serializer.save(equipment=equipment)


# === VUES POUR LES MOUVEMENTS DE STOCK ===

class StockMovementListView(generics.ListCreateAPIView):
    """
    Liste et création de mouvements de stock
    """
    serializer_class = StockMovementSerializer
    permission_classes = [IsSupplierOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['movement_type', 'content_type']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        user_orgs = self.request.user.memberships.filter(
            status='active',
            role__in=['supplier', 'admin']
        ).values_list('organization_id', flat=True)
        return StockMovement.objects.filter(organization_id__in=user_orgs)

    def perform_create(self, serializer):
        user_org = self.request.user.memberships.filter(
            role__in=['supplier', 'admin'],
            status='active'
        ).first()
        if user_org:
            serializer.save(organization=user_org.organization, created_by=self.request.user)
        else:
            raise serializers.ValidationError("Vous devez être membre d'une organisation fournisseur")


# === VUES POUR LES COMMANDES FOURNISSEUR ===

class SupplierOrderViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les commandes fournisseur
    """
    serializer_class = SupplierOrderSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'payment_status', 'supplier']
    ordering_fields = ['created_at', 'total_amount']
    ordering = ['-created_at']

    def get_queryset(self):
        # Les fournisseurs voient leurs commandes reçues
        # Les producteurs voient leurs commandes passées
        if self.request.user.memberships.filter(role='supplier', status='active').exists():
            user_orgs = self.request.user.memberships.filter(
                status='active',
                role__in=['supplier', 'admin']
            ).values_list('organization_id', flat=True)
            return SupplierOrder.objects.filter(supplier_id__in=user_orgs)
        elif self.request.user.memberships.filter(role='farmer', status='active').exists():
            return SupplierOrder.objects.filter(farmer=self.request.user)
        else:
            return SupplierOrder.objects.none()

    def perform_create(self, serializer):
        # Seuls les producteurs peuvent créer des commandes
        if not self.request.user.memberships.filter(role='farmer', status='active').exists():
            raise serializers.ValidationError("Seuls les producteurs peuvent passer des commandes")
        serializer.save(farmer=self.request.user)

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """Confirmer une commande"""
        order = self.get_object()
        if order.status != 'pending':
            return Response({'error': 'Seules les commandes en attente peuvent être confirmées'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        order.status = 'confirmed'
        order.confirmed_at = timezone.now()
        order.save()
        return Response(SupplierOrderSerializer(order).data)

    @action(detail=True, methods=['post'])
    def ship(self, request, pk=None):
        """Marquer une commande comme expédiée"""
        order = self.get_object()
        if order.status not in ['confirmed', 'processing', 'ready']:
            return Response({'error': 'La commande doit être confirmée ou en traitement'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        order.status = 'shipped'
        order.shipped_at = timezone.now()
        order.save()
        return Response(SupplierOrderSerializer(order).data)

    @action(detail=True, methods=['post'])
    def deliver(self, request, pk=None):
        """Marquer une commande comme livrée"""
        order = self.get_object()
        if order.status != 'shipped':
            return Response({'error': 'La commande doit être expédiée'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        order.status = 'delivered'
        order.delivered_at = timezone.now()
        order.save()
        return Response(SupplierOrderSerializer(order).data)


# === VUES POUR LES AVIS ===

class SupplierReviewListView(generics.ListCreateAPIView):
    """
    Liste et création d'avis sur les fournisseurs/intrants/équipements
    """
    serializer_class = SupplierReviewSerializer
    permission_classes = [IsFarmerOrAdmin]

    def get_queryset(self):
        queryset = SupplierReview.objects.all()
        item_type = self.request.query_params.get('item_type')
        item_id = self.request.query_params.get('item_id')
        
        if item_type and item_id:
            try:
                content_type = ContentType.objects.get(model=item_type.lower())
                queryset = queryset.filter(content_type=content_type, object_id=item_id)
            except ContentType.DoesNotExist:
                pass
        
        return queryset

    def perform_create(self, serializer):
        serializer.save(farmer=self.request.user)


# === VUES POUR LE DASHBOARD/STATS ===

@extend_schema(
    summary="Statistiques du dashboard fournisseur",
    description="Retourne les statistiques complètes du dashboard fournisseur (intrants, équipements, commandes, revenus)",
    responses={200: {
        'type': 'object',
        'properties': {
            'inputs': {
                'type': 'object',
                'properties': {
                    'total': {'type': 'integer'},
                    'active': {'type': 'integer'},
                    'low_stock': {'type': 'integer'},
                }
            },
            'equipment': {
                'type': 'object',
                'properties': {
                    'total': {'type': 'integer'},
                    'active': {'type': 'integer'},
                }
            },
            'orders': {
                'type': 'object',
                'properties': {
                    'total': {'type': 'integer'},
                    'pending': {'type': 'integer'},
                    'confirmed': {'type': 'integer'},
                    'delivered': {'type': 'integer'},
                }
            },
            'revenue': {
                'type': 'object',
                'properties': {
                    'total': {'type': 'number'},
                    'this_month': {'type': 'number'},
                }
            }
        }
    }}
)
@api_view(['GET'])
@permission_classes([IsSupplierOrAdmin])
def supplier_dashboard_stats(request):
    """
    Statistiques du dashboard fournisseur
    """
    user_orgs = request.user.memberships.filter(
        status='active',
        role__in=['supplier', 'admin']
    ).values_list('organization_id', flat=True)
    
    # Statistiques des intrants
    inputs_total = Input.objects.filter(organization_id__in=user_orgs).count()
    inputs_active = Input.objects.filter(organization_id__in=user_orgs, status='active').count()
    inputs_low_stock = Input.objects.filter(
        organization_id__in=user_orgs,
        stock_quantity__lte=F('reorder_level')
    ).count()
    
    # Statistiques des équipements
    equipment_total = Equipment.objects.filter(organization_id__in=user_orgs).count()
    equipment_active = Equipment.objects.filter(organization_id__in=user_orgs, status='active').count()
    
    # Statistiques des commandes
    orders_total = SupplierOrder.objects.filter(supplier_id__in=user_orgs).count()
    orders_pending = SupplierOrder.objects.filter(supplier_id__in=user_orgs, status='pending').count()
    orders_confirmed = SupplierOrder.objects.filter(supplier_id__in=user_orgs, status='confirmed').count()
    orders_delivered = SupplierOrder.objects.filter(supplier_id__in=user_orgs, status='delivered').count()
    
    # Revenus
    revenue_total = SupplierOrder.objects.filter(
        supplier_id__in=user_orgs,
        payment_status='paid'
    ).aggregate(total=Sum('total_amount'))['total'] or 0
    
    revenue_month = SupplierOrder.objects.filter(
        supplier_id__in=user_orgs,
        payment_status='paid',
        created_at__month=timezone.now().month,
        created_at__year=timezone.now().year
    ).aggregate(total=Sum('total_amount'))['total'] or 0
    
    return Response({
        'inputs': {
            'total': inputs_total,
            'active': inputs_active,
            'low_stock': inputs_low_stock,
        },
        'equipment': {
            'total': equipment_total,
            'active': equipment_active,
        },
        'orders': {
            'total': orders_total,
            'pending': orders_pending,
            'confirmed': orders_confirmed,
            'delivered': orders_delivered,
        },
        'revenue': {
            'total': float(revenue_total),
            'this_month': float(revenue_month),
        }
    })

