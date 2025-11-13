from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SupplierProfileView,
    InputCategoryListView, InputCategoryDetailView,
    InputListView, InputDetailView, InputImageUploadView,
    EquipmentCategoryListView, EquipmentCategoryDetailView,
    EquipmentListView, EquipmentDetailView, EquipmentImageUploadView,
    StockMovementListView,
    SupplierOrderViewSet,
    SupplierReviewListView,
    supplier_dashboard_stats
)

router = DefaultRouter()
router.register(r'orders', SupplierOrderViewSet, basename='supplier-order')

urlpatterns = [
    # Profil fournisseur
    path('profile/', SupplierProfileView.as_view(), name='supplier_profile'),
    
    # Catégories d'intrants
    path('input-categories/', InputCategoryListView.as_view(), name='supplier_input_category_list'),
    path('input-categories/<int:pk>/', InputCategoryDetailView.as_view(), name='supplier_input_category_detail'),
    
    # Intrants
    path('inputs/', InputListView.as_view(), name='supplier_input_list'),
    path('inputs/<int:pk>/', InputDetailView.as_view(), name='supplier_input_detail'),
    path('inputs/<int:input_id>/images/', InputImageUploadView.as_view(), name='supplier_input_image_upload'),
    
    # Catégories d'équipements
    path('equipment-categories/', EquipmentCategoryListView.as_view(), name='supplier_equipment_category_list'),
    path('equipment-categories/<int:pk>/', EquipmentCategoryDetailView.as_view(), name='supplier_equipment_category_detail'),
    
    # Équipements
    path('equipment/', EquipmentListView.as_view(), name='supplier_equipment_list'),
    path('equipment/<int:pk>/', EquipmentDetailView.as_view(), name='supplier_equipment_detail'),
    path('equipment/<int:equipment_id>/images/', EquipmentImageUploadView.as_view(), name='supplier_equipment_image_upload'),
    
    # Mouvements de stock
    path('stock-movements/', StockMovementListView.as_view(), name='supplier_stock_movement_list'),
    
    # Commandes (via router)
    path('', include(router.urls)),
    
    # Avis
    path('reviews/', SupplierReviewListView.as_view(), name='supplier_review_list'),
    
    # Statistiques
    path('dashboard/stats/', supplier_dashboard_stats, name='supplier_dashboard_stats'),
]

