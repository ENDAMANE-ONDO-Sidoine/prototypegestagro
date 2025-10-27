from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryListView, CategoryDetailView, ProductListView, ProductDetailView, ProductImageUploadView,
    FarmerProfileView, ProductReviewListView, ProductReviewDetailView,
    farmer_dashboard_stats, farmer_products_stats
)

router = DefaultRouter()

urlpatterns = [
    # Catégories
    path('categories/', CategoryListView.as_view(), name='farmer_category_list'),
    path('categories/<int:pk>/', CategoryDetailView.as_view(), name='farmer_category_detail'),
    
    # Gestion des produits
    path('products/', ProductListView.as_view(), name='farmer_product_list'),
    path('products/<int:pk>/', ProductDetailView.as_view(), name='farmer_product_detail'),
    path('products/<int:product_id>/images/', ProductImageUploadView.as_view(), name='product_image_upload'),
    
    # Profil agriculteur
    path('profile/', FarmerProfileView.as_view(), name='farmer_profile'),
    
    # Avis sur les produits
    path('products/<int:product_id>/reviews/', ProductReviewListView.as_view(), name='product_review_list'),
    path('reviews/<int:pk>/', ProductReviewDetailView.as_view(), name='product_review_detail'),
    
    # Statistiques
    path('dashboard/stats/', farmer_dashboard_stats, name='farmer_dashboard_stats'),
    path('products/stats/', farmer_products_stats, name='farmer_products_stats'),
]
