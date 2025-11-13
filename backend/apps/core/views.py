"""
Vues pour l'application core (administration)
"""
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q, Count, Sum
from django.utils import timezone
from datetime import timedelta
from apps.iam.models import User
from apps.organizations.models import Organization
from apps.iam.models import Membership
from apps.farmers.models import Product, Category
from apps.buyers.models import Order
from apps.transport.models import Vehicle, Driver, Shipment
from apps.iam.serializers import UserProfileSerializer, OrganizationSerializer, MembershipSerializer
from gestagro.utils.search_client import get_es_client
from drf_spectacular.utils import extend_schema
from apps.core.models import Province, City
from apps.core.serializers import ProvinceSerializer, CitySerializer


@extend_schema(exclude=True)
class AdminUserListView(generics.ListAPIView):
    """
    Vue pour lister tous les utilisateurs (admin seulement)
    """
    queryset = User.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        queryset = User.objects.all()
        
        # Filtres
        search = self.request.query_params.get('search', None)
        is_active = self.request.query_params.get('is_active', None)
        is_verified = self.request.query_params.get('is_verified', None)
        
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search) |
                Q(username__icontains=search)
            )
        
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        if is_verified is not None:
            queryset = queryset.filter(is_verified=is_verified.lower() == 'true')
        
        return queryset.order_by('-date_joined')


@extend_schema(exclude=True)
class AdminUserDetailView(generics.RetrieveUpdateAPIView):
    """
    Vue pour les détails d'un utilisateur (admin seulement)
    """
    queryset = User.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAdminUser]


@extend_schema(exclude=True)
class AdminOrganizationListView(generics.ListAPIView):
    """
    Vue pour lister toutes les organisations (admin seulement)
    """
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        queryset = Organization.objects.all()
        
        # Filtres
        search = self.request.query_params.get('search', None)
        org_type = self.request.query_params.get('type', None)
        is_active = self.request.query_params.get('is_active', None)
        
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(country__icontains=search) |
                Q(industry__icontains=search)
            )
        
        if org_type:
            queryset = queryset.filter(type=org_type)
        
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset.order_by('-created_at')


@extend_schema(exclude=True)
class AdminOrganizationDetailView(generics.RetrieveUpdateAPIView):
    """
    Vue pour les détails d'une organisation (admin seulement)
    """
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer
    permission_classes = [permissions.IsAdminUser]


@extend_schema(exclude=True)
class AdminMembershipListView(generics.ListAPIView):
    """
    Vue pour lister toutes les adhésions (admin seulement)
    """
    queryset = Membership.objects.all()
    serializer_class = MembershipSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        queryset = Membership.objects.select_related('user', 'organization')
        
        # Filtres
        status_filter = self.request.query_params.get('status', None)
        role = self.request.query_params.get('role', None)
        organization_id = self.request.query_params.get('organization', None)
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        if role:
            queryset = queryset.filter(role=role)
        
        if organization_id:
            queryset = queryset.filter(organization_id=organization_id)
        
        return queryset.order_by('-created_at')


@extend_schema(exclude=True)
class AdminMembershipDetailView(generics.RetrieveUpdateAPIView):
    """
    Vue pour les détails d'une adhésion (admin seulement)
    """
    queryset = Membership.objects.all()
    serializer_class = MembershipSerializer
    permission_classes = [permissions.IsAdminUser]


@extend_schema(exclude=True)
@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def admin_dashboard_stats(request):
    """
    Statistiques pour le tableau de bord admin
    """
    # Statistiques des utilisateurs
    users_stats = User.objects.aggregate(
        total_users=Count('id'),
        active_users=Count('id', filter=Q(is_active=True)),
        verified_users=Count('id', filter=Q(is_verified=True)),
        new_users_this_month=Count('id', filter=Q(
            date_joined__gte=timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        ))
    )

    # Statistiques des organisations
    organizations_stats = Organization.objects.aggregate(
        total_organizations=Count('id'),
        active_organizations=Count('id', filter=Q(is_active=True)),
        farmers_count=Count('id', filter=Q(type='cooperative')),
        buyers_count=Count('id', filter=Q(type='enterprise')),
        transporters_count=Count('id', filter=Q(type='transport')),
        ngos_count=Count('id', filter=Q(type='ngo'))
    )

    # Statistiques des produits
    products_stats = Product.objects.aggregate(
        total_products=Count('id'),
        active_products=Count('id', filter=Q(status='active')),
        draft_products=Count('id', filter=Q(status='draft')),
        out_of_stock_products=Count('id', filter=Q(stock_quantity=0))
    )

    # Statistiques des commandes
    orders_stats = Order.objects.aggregate(
        total_orders=Count('id'),
        pending_orders=Count('id', filter=Q(status='pending')),
        confirmed_orders=Count('id', filter=Q(status='confirmed')),
        delivered_orders=Count('id', filter=Q(status='delivered')),
        total_revenue=Sum('total_amount', filter=Q(payment_status='paid'))
    )

    # Statistiques des expéditions
    shipments_stats = Shipment.objects.aggregate(
        total_shipments=Count('id'),
        pending_shipments=Count('id', filter=Q(status='pending')),
        in_transit_shipments=Count('id', filter=Q(status='in_transit')),
        delivered_shipments=Count('id', filter=Q(status='delivered'))
    )

    # Statistiques des véhicules
    vehicles_stats = Vehicle.objects.aggregate(
        total_vehicles=Count('id'),
        available_vehicles=Count('id', filter=Q(status='available')),
        in_use_vehicles=Count('id', filter=Q(status='in_use')),
        maintenance_vehicles=Count('id', filter=Q(status='maintenance'))
    )

    return Response({
        'users': users_stats,
        'organizations': organizations_stats,
        'products': products_stats,
        'orders': orders_stats,
        'shipments': shipments_stats,
        'vehicles': vehicles_stats
    })


@extend_schema(exclude=True)
@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def admin_analytics(request):
    """
    Analytics avancées pour les admins
    """
    # Évolution des utilisateurs (derniers 12 mois)
    user_evolution = []
    for i in range(12):
        month_start = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0) - timedelta(days=30*i)
        month_end = month_start + timedelta(days=30)
        
        users_count = User.objects.filter(
            date_joined__gte=month_start,
            date_joined__lt=month_end
        ).count()
        
        user_evolution.append({
            'month': month_start.strftime('%Y-%m'),
            'users': users_count
        })
    
    user_evolution.reverse()

    # Top 10 des organisations par nombre de produits
    top_organizations = Organization.objects.annotate(
        products_count=Count('products')
    ).order_by('-products_count')[:10]

    # Top 10 des catégories de produits
    top_categories = Category.objects.annotate(
        products_count=Count('products')
    ).order_by('-products_count')[:10]

    # Évolution des commandes (derniers 30 jours)
    orders_evolution = []
    for i in range(30):
        day = timezone.now().date() - timedelta(days=i)
        orders_count = Order.objects.filter(created_at__date=day).count()
        orders_evolution.append({
            'date': day.strftime('%Y-%m-%d'),
            'orders': orders_count
        })
    
    orders_evolution.reverse()

    return Response({
        'user_evolution': user_evolution,
        'top_organizations': [
            {
                'id': org.id,
                'name': org.name,
                'type': org.type,
                'products_count': org.products_count
            }
            for org in top_organizations
        ],
        'top_categories': [
            {
                'id': cat.id,
                'name': cat.name,
                'products_count': cat.products_count
            }
            for cat in top_categories
        ],
        'orders_evolution': orders_evolution
    })


@extend_schema(exclude=True)
@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def admin_approve_organization(request, organization_id):
    """
    Approuver une organisation
    """
    try:
        organization = Organization.objects.get(id=organization_id)
        organization.is_active = True
        organization.save()
        
        return Response({
            'message': f'Organisation {organization.name} approuvée avec succès.'
        })
    except Organization.DoesNotExist:
        return Response(
            {'error': 'Organisation non trouvée.'},
            status=status.HTTP_404_NOT_FOUND
        )


@extend_schema(
    tags=['Core'],
    summary="Recherche de produits",
    description="Recherche full-text basique sur les produits via Elasticsearch. Les résultats incluent les informations de localisation du producteur."
)
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def search_products(request):
    """
    Recherche full-text basique sur les produits via Elasticsearch.
    Note: Les résultats incluent maintenant les informations de localisation du producteur
    via le ProductSerializer (producer_province, producer_city, producer_address, producer_coordinates).
    """
    query = request.query_params.get('q', '')
    size = int(request.query_params.get('size', 10))
    province_id = request.query_params.get('province_id')
    city_id = request.query_params.get('city_id')

    es = get_es_client()
    try:
        # Construire la requête de recherche
        search_query = {
            'multi_match': {
                'query': query,
                'fields': [
                    'name^2', 'description',
                    'name.folded^2', 'description.folded',
                    'category.folded'
                ]
            }
        }
        
        # Ajouter des filtres de localisation si fournis
        filters = []
        if province_id:
            filters.append({'term': {'producer_province_id': int(province_id)}})
        if city_id:
            filters.append({'term': {'producer_city_id': int(city_id)}})
        
        query_dict = {'query': search_query}
        if filters:
            query_dict['query'] = {
                'bool': {
                    'must': [search_query],
                    'filter': filters
                }
            }
        
        resp = es.search(
            index='products',
            query=query_dict.get('query', search_query),
            size=size
        )
        hits = [
            {"id": h.get("_id"), "score": h.get("_score"), **h.get("_source", {})}
            for h in resp.get('hits', {}).get('hits', [])
        ]
        total = resp.get('hits', {}).get('total', {}).get('value', 0)
        return Response({"results": hits, "total": total})
    except Exception as exc:
        return Response({"error": str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

@extend_schema(exclude=True)
@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def admin_approve_membership(request, membership_id):
    """
    Approuver une adhésion
    """
    try:
        membership = Membership.objects.get(id=membership_id)
        membership.status = 'active'
        membership.save()
        
        return Response({
            'message': f'Adhésion de {membership.user.email} approuvée avec succès.'
        })
    except Membership.DoesNotExist:
        return Response(
            {'error': 'Adhésion non trouvée.'},
            status=status.HTTP_404_NOT_FOUND
        )


@extend_schema(exclude=True)
@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def admin_suspend_user(request, user_id):
    """
    Suspendre un utilisateur
    """
    try:
        user = User.objects.get(id=user_id)
        user.is_active = False
        user.save()
        
        return Response({
            'message': f'Utilisateur {user.email} suspendu avec succès.'
        })
    except User.DoesNotExist:
        return Response(
            {'error': 'Utilisateur non trouvé.'},
            status=status.HTTP_404_NOT_FOUND
        )


@extend_schema(exclude=True)
@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def admin_activate_user(request, user_id):
    """
    Activer un utilisateur
    """
    try:
        user = User.objects.get(id=user_id)
        user.is_active = True
        user.save()
        
        return Response({
            'message': f'Utilisateur {user.email} activé avec succès.'
        })
    except User.DoesNotExist:
        return Response(
            {'error': 'Utilisateur non trouvé.'},
            status=status.HTTP_404_NOT_FOUND
        )


@extend_schema(
    tags=['Core'],
    summary="Liste des provinces",
    description="Liste des provinces du Gabon (accessible à tous pour filtrage)"
)
class ProvinceListView(generics.ListAPIView):
    """
    Liste des provinces du Gabon (accessible à tous pour filtrage)
    """
    queryset = Province.objects.filter(is_active=True).prefetch_related('cities')
    serializer_class = ProvinceSerializer
    permission_classes = [permissions.AllowAny]


@extend_schema(
    tags=['Core'],
    summary="Liste des villes",
    description="Liste des villes du Gabon (accessible à tous pour filtrage). Peut être filtrée par province_id."
)
class CityListView(generics.ListAPIView):
    """
    Liste des villes du Gabon (accessible à tous pour filtrage)
    """
    queryset = City.objects.filter(is_active=True).select_related('province')
    serializer_class = CitySerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        queryset = City.objects.filter(is_active=True).select_related('province')
        province_id = self.request.query_params.get('province_id')
        if province_id:
            queryset = queryset.filter(province_id=province_id)
        return queryset