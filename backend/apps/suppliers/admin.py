from django.contrib import admin
from .models import (
    SupplierProfile, InputCategory, Input, InputImage,
    EquipmentCategory, Equipment, EquipmentImage,
    StockMovement, SupplierOrder, SupplierOrderItem, SupplierReview
)


@admin.register(SupplierProfile)
class SupplierProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'organization', 'business_license', 'years_experience', 'has_organic_certification']
    list_filter = ['has_organic_certification', 'has_quality_certification', 'organization', 'created_at']
    search_fields = ['user__first_name', 'user__last_name', 'user__email', 'business_license', 'tax_number']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Utilisateur', {
            'fields': ('user', 'organization')
        }),
        ('Informations professionnelles', {
            'fields': ('business_license', 'tax_number', 'years_experience')
        }),
        ('Spécialisations', {
            'fields': ('specializations', 'product_categories')
        }),
        ('Localisation', {
            'fields': ('warehouse_address', 'warehouse_coordinates', 'phone_emergency')
        }),
        ('Certifications', {
            'fields': ('has_organic_certification', 'has_quality_certification')
        }),
        ('Informations publiques', {
            'fields': ('bio', 'website', 'social_media')
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(InputCategory)
class InputCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'parent', 'category_type', 'is_active', 'created_at']
    list_filter = ['category_type', 'is_active', 'parent', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']


class InputImageInline(admin.TabularInline):
    model = InputImage
    extra = 1


@admin.register(Input)
class InputAdmin(admin.ModelAdmin):
    list_display = ['name', 'sku', 'category', 'organization', 'price', 'currency', 'stock_quantity', 'status', 'created_at']
    list_filter = ['status', 'quality_grade', 'organic_certified', 'category', 'organization', 'created_at']
    search_fields = ['name', 'sku', 'description', 'brand']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [InputImageInline]
    
    fieldsets = (
        ('Informations de base', {
            'fields': ('name', 'description', 'sku', 'brand', 'organization', 'category', 'created_by')
        }),
        ('Prix et stock', {
            'fields': ('price', 'currency', 'unit', 'stock_quantity', 'reorder_level', 'min_order_quantity', 'max_order_quantity')
        }),
        ('Qualité et statut', {
            'fields': ('quality_grade', 'status', 'organic_certified')
        }),
        ('Informations spécifiques', {
            'fields': ('expiry_date', 'batch_number', 'origin_country')
        }),
        ('Caractéristiques techniques', {
            'fields': ('composition', 'usage_instructions', 'safety_precautions')
        }),
        ('Métadonnées', {
            'fields': ('tags', 'created_at', 'updated_at')
        }),
    )


@admin.register(InputImage)
class InputImageAdmin(admin.ModelAdmin):
    list_display = ['input_item', 'is_primary', 'order', 'created_at']
    list_filter = ['is_primary', 'created_at']
    search_fields = ['input_item__name', 'alt_text']


@admin.register(EquipmentCategory)
class EquipmentCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'parent', 'is_active', 'created_at']
    list_filter = ['is_active', 'parent', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']


class EquipmentImageInline(admin.TabularInline):
    model = EquipmentImage
    extra = 1


@admin.register(Equipment)
class EquipmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'sku', 'category', 'organization', 'price', 'currency', 'stock_quantity', 'condition', 'status', 'created_at']
    list_filter = ['status', 'condition', 'category', 'organization', 'has_maintenance_service', 'created_at']
    search_fields = ['name', 'sku', 'description', 'brand', 'model']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [EquipmentImageInline]
    
    fieldsets = (
        ('Informations de base', {
            'fields': ('name', 'description', 'sku', 'brand', 'model', 'organization', 'category', 'created_by')
        }),
        ('Prix et stock', {
            'fields': ('price', 'currency', 'stock_quantity', 'min_order_quantity')
        }),
        ('État et statut', {
            'fields': ('condition', 'status')
        }),
        ('Caractéristiques techniques', {
            'fields': ('specifications', 'weight', 'dimensions', 'power_requirement')
        }),
        ('Garantie et support', {
            'fields': ('warranty_period_months', 'has_maintenance_service')
        }),
        ('Métadonnées', {
            'fields': ('tags', 'created_at', 'updated_at')
        }),
    )


@admin.register(EquipmentImage)
class EquipmentImageAdmin(admin.ModelAdmin):
    list_display = ['equipment', 'is_primary', 'order', 'created_at']
    list_filter = ['is_primary', 'created_at']
    search_fields = ['equipment__name', 'alt_text']


@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = ['item', 'movement_type', 'quantity', 'stock_before', 'stock_after', 'organization', 'created_by', 'created_at']
    list_filter = ['movement_type', 'organization', 'created_at']
    search_fields = ['reference_number', 'reason', 'notes']
    readonly_fields = ['created_at', 'stock_before', 'stock_after']


class SupplierOrderItemInline(admin.TabularInline):
    model = SupplierOrderItem
    extra = 0
    readonly_fields = ['total_price']


@admin.register(SupplierOrder)
class SupplierOrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'farmer', 'supplier', 'status', 'payment_status', 'total_amount', 'currency', 'created_at']
    list_filter = ['status', 'payment_status', 'supplier', 'created_at']
    search_fields = ['order_number', 'farmer__first_name', 'farmer__last_name', 'farmer__email', 'tracking_number']
    readonly_fields = ['order_number', 'created_at', 'updated_at', 'confirmed_at', 'shipped_at', 'delivered_at']
    inlines = [SupplierOrderItemInline]
    
    fieldsets = (
        ('Informations de commande', {
            'fields': ('order_number', 'farmer', 'supplier', 'status', 'payment_status')
        }),
        ('Adresses', {
            'fields': ('billing_address', 'shipping_address')
        }),
        ('Prix', {
            'fields': ('subtotal', 'tax_amount', 'shipping_fee', 'total_amount', 'currency')
        }),
        ('Métadonnées', {
            'fields': ('notes', 'tracking_number')
        }),
        ('Dates', {
            'fields': ('created_at', 'updated_at', 'confirmed_at', 'shipped_at', 'delivered_at')
        }),
    )


@admin.register(SupplierOrderItem)
class SupplierOrderItemAdmin(admin.ModelAdmin):
    list_display = ['order', 'item', 'quantity', 'unit_price', 'total_price']
    list_filter = ['order__status', 'order__supplier']
    search_fields = ['order__order_number']
    readonly_fields = ['total_price']


@admin.register(SupplierReview)
class SupplierReviewAdmin(admin.ModelAdmin):
    list_display = ['reviewed_item', 'farmer', 'rating', 'title', 'is_verified_purchase', 'created_at']
    list_filter = ['rating', 'is_verified_purchase', 'created_at']
    search_fields = ['farmer__first_name', 'farmer__last_name', 'title', 'comment']
    readonly_fields = ['created_at', 'updated_at']

