from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Count, Sum, Avg
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
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [IsFarmerOrAdmin]

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
        return Product.objects.filter(organization__in=user_organizations)

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
        return Product.objects.filter(organization__in=user_organizations)


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
    })