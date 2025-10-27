from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Count, Sum, Avg
from apps.core.permissions import IsBuyerOrAdmin, IsOwnerOrAdmin
from .models import Cart, CartItem, Order, OrderItem, BuyerProfile, Wishlist, WishlistItem
from .serializers import (
    CartSerializer, CartItemSerializer, OrderSerializer, OrderItemSerializer,
    BuyerProfileSerializer, WishlistSerializer, WishlistItemSerializer
)


class CartView(generics.RetrieveUpdateAPIView):
    """
    Gestion du panier d'achat
    """
    serializer_class = CartSerializer
    permission_classes = [IsBuyerOrAdmin]

    def get_object(self):
        organization_id = self.kwargs['organization_id']
        cart, created = Cart.objects.get_or_create(
            buyer=self.request.user,
            organization_id=organization_id
        )
        return cart


class CartItemView(generics.RetrieveUpdateDestroyAPIView):
    """
    Gestion des articles du panier
    """
    serializer_class = CartItemSerializer
    permission_classes = [IsBuyerOrAdmin]

    def get_queryset(self):
        return CartItem.objects.filter(cart__buyer=self.request.user)


class OrderListView(generics.ListCreateAPIView):
    """
    Liste et création de commandes
    """
    serializer_class = OrderSerializer
    permission_classes = [IsBuyerOrAdmin]

    def get_queryset(self):
        return Order.objects.filter(buyer=self.request.user)

    def perform_create(self, serializer):
        serializer.save(buyer=self.request.user)


class OrderDetailView(generics.RetrieveUpdateAPIView):
    """
    Détail et modification d'une commande
    """
    serializer_class = OrderSerializer
    permission_classes = [IsBuyerOrAdmin]

    def get_queryset(self):
        return Order.objects.filter(buyer=self.request.user)


class BuyerProfileView(generics.RetrieveUpdateAPIView):
    """
    Profil de l'acheteur
    """
    serializer_class = BuyerProfileSerializer
    permission_classes = [IsBuyerOrAdmin]

    def get_object(self):
        profile, created = BuyerProfile.objects.get_or_create(
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


class WishlistListView(generics.ListCreateAPIView):
    """
    Liste et création de listes de souhaits
    """
    serializer_class = WishlistSerializer
    permission_classes = [IsBuyerOrAdmin]

    def get_queryset(self):
        return Wishlist.objects.filter(buyer=self.request.user)

    def perform_create(self, serializer):
        serializer.save(buyer=self.request.user)


class WishlistDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Détail, modification et suppression d'une liste de souhaits
    """
    serializer_class = WishlistSerializer
    permission_classes = [IsBuyerOrAdmin]

    def get_queryset(self):
        return Wishlist.objects.filter(buyer=self.request.user)


class WishlistItemView(generics.RetrieveUpdateDestroyAPIView):
    """
    Gestion des articles de liste de souhaits
    """
    serializer_class = WishlistItemSerializer
    permission_classes = [IsBuyerOrAdmin]

    def get_queryset(self):
        return WishlistItem.objects.filter(wishlist__buyer=self.request.user)


@api_view(['GET'])
@permission_classes([IsBuyerOrAdmin])
def buyer_dashboard_stats(request):
    """
    Statistiques du tableau de bord acheteur
    """
    # Statistiques des commandes
    orders = Order.objects.filter(buyer=request.user)
    total_orders = orders.count()
    pending_orders = orders.filter(status='pending').count()
    delivered_orders = orders.filter(status='delivered').count()
    
    total_spent = orders.aggregate(
        total=Sum('total_amount')
    )['total'] or 0
    
    # Statistiques du panier
    carts = Cart.objects.filter(buyer=request.user)
    total_cart_items = sum(cart.total_items for cart in carts)
    total_cart_amount = sum(cart.total_amount for cart in carts)
    
    # Statistiques des listes de souhaits
    wishlists = Wishlist.objects.filter(buyer=request.user)
    total_wishlist_items = sum(
        wishlist.items.count() for wishlist in wishlists
    )
    
    return Response({
        'orders': {
            'total': total_orders,
            'pending': pending_orders,
            'delivered': delivered_orders,
            'total_spent': float(total_spent),
        },
        'cart': {
            'total_items': total_cart_items,
            'total_amount': float(total_cart_amount),
        },
        'wishlists': {
            'total_lists': wishlists.count(),
            'total_items': total_wishlist_items,
        }
    })


@api_view(['GET'])
@permission_classes([IsBuyerOrAdmin])
def buyer_orders_stats(request):
    """
    Statistiques détaillées des commandes
    """
    orders = Order.objects.filter(buyer=request.user)
    
    # Statistiques par statut
    status_stats = orders.values('status').annotate(
        count=Count('id'),
        total_amount=Sum('total_amount')
    )
    
    # Statistiques par mois
    monthly_stats = orders.extra(
        select={'month': 'strftime("%Y-%m", created_at)'}
    ).values('month').annotate(
        count=Count('id'),
        total_amount=Sum('total_amount')
    ).order_by('month')
    
    # Top 5 des produits les plus commandés
    order_items = OrderItem.objects.filter(order__buyer=request.user)
    top_products = order_items.values(
        'product__name', 'product__sku'
    ).annotate(
        total_quantity=Sum('quantity'),
        total_spent=Sum('total_price')
    ).order_by('-total_quantity')[:5]
    
    return Response({
        'by_status': list(status_stats),
        'by_month': list(monthly_stats),
        'top_products': list(top_products),
    })