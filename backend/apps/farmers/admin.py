from django.contrib import admin
from .models import Category, Product, ProductImage, FarmerProfile, ProductReview


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'parent', 'product_type', 'is_active', 'created_at']
    list_filter = ['product_type', 'is_active', 'parent', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'sku', 'product_type', 'organization', 'category', 'price', 'currency', 'stock_quantity', 'status', 'created_at']
    list_filter = ['product_type', 'status', 'quality_grade', 'organic_certified', 'category', 'organization', 'created_at']
    search_fields = ['name', 'sku', 'description']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [ProductImageInline]
    
    fieldsets = (
        ('Informations de base', {
            'fields': ('name', 'description', 'sku', 'product_type', 'organization', 'category', 'created_by')
        }),
        ('Prix et stock', {
            'fields': ('price', 'currency', 'unit', 'stock_quantity', 'min_order_quantity', 'max_order_quantity')
        }),
        ('Qualité et statut', {
            'fields': ('quality_grade', 'status', 'organic_certified')
        }),
        ('Informations animales', {
            'fields': (
                'animal_species', 'animal_breed', 'animal_age', 'animal_age_unit',
                'rearing_method', 'feeding_type', 'health_status', 'processing_type',
                'slaughter_date', 'storage_temperature', 'animals_per_lot'
            )
        }),
        ('Informations de production', {
            'fields': ('harvest_date', 'expiry_date', 'origin_country', 'weight', 'dimensions')
        }),
        ('Métadonnées', {
            'fields': ('tags', 'created_at', 'updated_at')
        }),
    )


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ['product', 'is_primary', 'order', 'created_at']
    list_filter = ['is_primary', 'created_at']
    search_fields = ['product__name', 'alt_text']


@admin.register(FarmerProfile)
class FarmerProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'organization', 'farm_size_hectares', 'farming_experience_years', 'organic_certified']
    list_filter = ['organic_certified', 'organization', 'created_at']
    search_fields = ['user__first_name', 'user__last_name', 'user__email', 'certification_number']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Utilisateur', {
            'fields': ('user', 'organization')
        }),
        ('Informations agricoles', {
            'fields': ('farm_size_hectares', 'farming_experience_years', 'certification_number', 'organic_certified')
        }),
        ('Spécialisations', {
            'fields': ('specializations', 'crops_grown')
        }),
        ('Localisation', {
            'fields': ('farm_address', 'farm_coordinates')
        }),
        ('Informations publiques', {
            'fields': ('bio', 'website', 'social_media')
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(ProductReview)
class ProductReviewAdmin(admin.ModelAdmin):
    list_display = ['product', 'buyer', 'rating', 'title', 'is_verified_purchase', 'created_at']
    list_filter = ['rating', 'is_verified_purchase', 'created_at']
    search_fields = ['product__name', 'buyer__first_name', 'buyer__last_name', 'title', 'comment']
    readonly_fields = ['created_at', 'updated_at']