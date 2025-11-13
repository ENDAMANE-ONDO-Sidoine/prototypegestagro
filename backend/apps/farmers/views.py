from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Count, Sum, Avg, Q
from apps.core.permissions import IsFarmerOrAdmin, IsOwnerOrAdmin
from .models import Category, Product, ProductImage, FarmerProfile, ProductReview
from .serializers import (
    CategorySerializer, ProductSerializer, ProductImageSerializer, FarmerProfileSerializer,
    ProductReviewSerializer
)


class CategoryListView(generics.ListCreateAPIView):
    """
    Liste et création des catégories de produits
    """
    serializer_class = CategorySerializer
    permission_classes = [IsFarmerOrAdmin]

    def get_queryset(self):
        queryset = Category.objects.filter(is_active=True)
        product_type = self.request.query_params.get('product_type')
        if product_type in ['crop', 'livestock', 'fishery']:
            queryset = queryset.filter(
                Q(product_type=product_type) | Q(product_type='mixed')
            )
        return queryset

    def perform_create(self, serializer):
        # Les agriculteurs peuvent créer des catégories
        serializer.save()


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Détail, modification et suppression d'une catégorie
    """
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [IsFarmerOrAdmin]

    def perform_destroy(self, instance):
        # Au lieu de supprimer, on désactive la catégorie
        instance.is_active = False
        instance.save()


class ProductListView(generics.ListCreateAPIView):
    """
    Liste et création de produits pour les agriculteurs
    """
    serializer_class = ProductSerializer
    permission_classes = [IsFarmerOrAdmin]

    def get_queryset(self):
        # Filtrer par organisation de l'utilisateur
        user_organizations = self.request.user.memberships.values_list('organization', flat=True)
        queryset = Product.objects.filter(organization__in=user_organizations).select_related(
            'organization',
            'category',
            'created_by'
        ).prefetch_related(
            'images',
            'organization__farmer_profiles__province',
            'organization__farmer_profiles__city'
        )
        product_type = self.request.query_params.get('product_type')
        if product_type in ['crop', 'livestock', 'fishery']:
            queryset = queryset.filter(product_type=product_type)
        return queryset

    def perform_create(self, serializer):
        # Récupérer l'organisation de l'utilisateur
        user_organization = self.request.user.memberships.first().organization
        serializer.save(
            organization=user_organization,
            created_by=self.request.user
        )


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Détail, modification et suppression d'un produit
    """
    serializer_class = ProductSerializer
    permission_classes = [IsFarmerOrAdmin]

    def get_queryset(self):
        user_organizations = self.request.user.memberships.values_list('organization', flat=True)
        return Product.objects.filter(organization__in=user_organizations).select_related(
            'organization',
            'category',
            'created_by'
        ).prefetch_related(
            'images',
            'organization__farmer_profiles__province',
            'organization__farmer_profiles__city'
        )


class ProductImageUploadView(generics.CreateAPIView):
    """
    Upload d'images pour un produit
    """
    serializer_class = ProductImageSerializer
    permission_classes = [IsFarmerOrAdmin]

    def perform_create(self, serializer):
        product_id = self.kwargs['product_id']
        product = get_object_or_404(Product, id=product_id)
        serializer.save(product=product)


class FarmerProfileView(generics.RetrieveUpdateAPIView):
    """
    Profil de l'agriculteur
    """
    serializer_class = FarmerProfileSerializer
    permission_classes = [IsFarmerOrAdmin]

    def get_object(self):
        user_organization = self.request.user.memberships.first().organization if self.request.user.memberships.exists() else None
        profile, created = FarmerProfile.objects.get_or_create(
            user=self.request.user,
            defaults={'organization': user_organization}
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


class ProductReviewListView(generics.ListAPIView):
    """
    Liste des avis sur les produits de l'agriculteur
    """
    serializer_class = ProductReviewSerializer
    permission_classes = [IsFarmerOrAdmin]

    def get_queryset(self):
        product_id = self.kwargs['product_id']
        user_organizations = self.request.user.memberships.values_list('organization', flat=True)
        return ProductReview.objects.filter(
            product_id=product_id,
            product__organization__in=user_organizations
        )


class ProductReviewDetailView(generics.RetrieveUpdateAPIView):
    """
    Détail et modification d'un avis sur un produit
    """
    serializer_class = ProductReviewSerializer
    permission_classes = [IsFarmerOrAdmin]

    def get_queryset(self):
        user_organizations = self.request.user.memberships.values_list('organization', flat=True)
        return ProductReview.objects.filter(
            product__organization__in=user_organizations
        )


@api_view(['GET'])
@permission_classes([IsFarmerOrAdmin])
def farmer_dashboard_stats(request):
    """
    Statistiques du tableau de bord agriculteur
    """
    user_organizations = request.user.memberships.values_list('organization', flat=True)
    
    # Statistiques des produits
    products = Product.objects.filter(organization__in=user_organizations)
    total_products = products.count()
    active_products = products.filter(status='active').count()
    out_of_stock = products.filter(status='out_of_stock').count()
    
    # Statistiques des ventes (via les commandes)
    from apps.buyers.models import OrderItem
    order_items = OrderItem.objects.filter(
        product__organization__in=user_organizations
    )
    total_sales = order_items.aggregate(
        total=Sum('total_price')
    )['total'] or 0
    
    total_orders = order_items.values('order').distinct().count()
    
    # Statistiques des avis
    reviews = ProductReview.objects.filter(
        product__organization__in=user_organizations
    )
    avg_rating = reviews.aggregate(
        avg=Avg('rating')
    )['avg'] or 0
    
    return Response({
        'products': {
            'total': total_products,
            'active': active_products,
            'out_of_stock': out_of_stock,
        },
        'sales': {
            'total_amount': float(total_sales),
            'total_orders': total_orders,
        },
        'reviews': {
            'total': reviews.count(),
            'average_rating': round(avg_rating, 2),
        }
    })


@api_view(['GET'])
@permission_classes([IsFarmerOrAdmin])
def farmer_products_stats(request):
    """
    Statistiques détaillées des produits
    """
    user_organizations = request.user.memberships.values_list('organization', flat=True)
    products = Product.objects.filter(organization__in=user_organizations)
    
    # Statistiques par catégorie
    category_stats = products.values('category__name').annotate(
        count=Count('id'),
        total_stock=Sum('stock_quantity')
    )
    
    # Statistiques par qualité
    quality_stats = products.values('quality_grade').annotate(
        count=Count('id')
    )

    # Statistiques par type de produit
    type_stats = products.values('product_type').annotate(
        count=Count('id'),
        total_stock=Sum('stock_quantity')
    )
    
    # Top 5 des produits les plus vendus
    from apps.buyers.models import OrderItem
    top_products = OrderItem.objects.filter(
        product__organization__in=user_organizations
    ).values(
        'product__name', 'product__sku'
    ).annotate(
        total_sold=Sum('quantity'),
        total_revenue=Sum('total_price')
    ).order_by('-total_sold')[:5]
    
    return Response({
        'by_category': list(category_stats),
        'by_quality': list(quality_stats),
        'top_products': list(top_products),
        'by_type': list(type_stats),
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def farmer_meta(request):
    """
    Renvoie les listes de référence pour faciliter les formulaires côté frontend (produits & catégories).
    """

    def _choices_to_list(choices):
        return [
            {
                'valeur': value,
                'libelle': str(label),
            }
            for value, label in choices
        ]

    # Types de produit possibles
    types_produit = _choices_to_list(Product.PRODUCT_TYPE_CHOICES)

    # Classes de qualité reconnues
    classes_qualite = _choices_to_list(Product.QUALITY_CHOICES)

    # Types de transformation (produits animaux)
    types_transformation = _choices_to_list(Product.PROCESSING_CHOICES)

    # Unités d'âge pour les animaux
    unites_age = _choices_to_list(Product.AGE_UNIT_CHOICES)

    # Statuts que l'utilisateur peut sélectionner volontairement
    etats_produit = _choices_to_list(Product.STATUS_CHOICES)

    # Catégories actives
    categories_queryset = Category.objects.filter(is_active=True).order_by('name')
    categories = [
        {
            'id': categorie.id,
            'nom': categorie.name,
            'description': categorie.description,
            'typeProduit': categorie.product_type,
            'typeProduitLibelle': categorie.get_product_type_display(),
            'parentId': categorie.parent_id,
        }
        for categorie in categories_queryset
    ]

    # Organisations accessibles pour l'utilisateur connecté (si présent)
    organisations = []
    user = request.user if request.user.is_authenticated else None
    if user and hasattr(user, 'memberships'):
        organisations = [
            {
                'id': membership.organization.id,
                'nom': membership.organization.name,
                'role': membership.role,
                'roleLibelle': membership.get_role_display(),
            }
            for membership in user.memberships.filter(status='active').select_related('organization')
        ]

    payload = {
        'typesProduit': types_produit,
        'classesQualite': classes_qualite,
        'typesTransformation': types_transformation,
        'unitesAgeAnimal': unites_age,
        'etatsProduit': etats_produit,
        'categories': categories,
        'organisationsDisponibles': organisations,
        'message': 'Référentiels agriculteur chargés avec succès.',
    }
    return Response(payload)