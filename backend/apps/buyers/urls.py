from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CartView, CartItemView,
    OrderListView, OrderDetailView, OrderShipmentDetailView,
    BuyerProfileView,
    WishlistListView, WishlistDetailView, WishlistItemView,
    buyer_dashboard_stats, buyer_orders_stats
)

router = DefaultRouter()

urlpatterns = [
    # Panier
    path('cart/<int:organization_id>/', CartView.as_view(), name='buyer_cart'),
    path('cart/<int:cart_id>/items/<int:pk>/', CartItemView.as_view(), name='cart_item_detail'),
    
    # Commandes
    path('orders/', OrderListView.as_view(), name='buyer_order_list'),
    path('orders/<int:pk>/', OrderDetailView.as_view(), name='buyer_order_detail'),
    path('orders/<int:order_id>/shipment/', OrderShipmentDetailView.as_view(), name='buyer_order_shipment'),
    
    # Profil acheteur
    path('profile/', BuyerProfileView.as_view(), name='buyer_profile'),
    
    # Liste de souhaits
    path('wishlists/', WishlistListView.as_view(), name='wishlist_list'),
    path('wishlists/<int:pk>/', WishlistDetailView.as_view(), name='wishlist_detail'),
    path('wishlists/<int:wishlist_id>/items/<int:pk>/', WishlistItemView.as_view(), name='wishlist_item_detail'),
    
    # Statistiques
    path('dashboard/stats/', buyer_dashboard_stats, name='buyer_dashboard_stats'),
    path('orders/stats/', buyer_orders_stats, name='buyer_orders_stats'),
]
