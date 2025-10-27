from django.contrib import admin
from .models import Cart, CartItem, Order, OrderItem, BuyerProfile, Wishlist, WishlistItem


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ['buyer', 'organization', 'total_items', 'total_amount', 'created_at']
    list_filter = ['organization', 'created_at']
    search_fields = ['buyer__first_name', 'buyer__last_name', 'buyer__email']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [CartItemInline]


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ['cart', 'product', 'quantity', 'unit_price', 'total_price', 'added_at']
    list_filter = ['added_at']
    search_fields = ['product__name', 'cart__buyer__first_name', 'cart__buyer__last_name']


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'buyer', 'seller', 'status', 'payment_status', 'total_amount', 'created_at']
    list_filter = ['status', 'payment_status', 'created_at']
    search_fields = ['order_number', 'buyer__first_name', 'buyer__last_name', 'seller__name']
    readonly_fields = ['created_at', 'updated_at', 'order_number']
    inlines = [OrderItemInline]
    
    fieldsets = (
        ('Informations de base', {
            'fields': ('order_number', 'buyer', 'seller', 'status', 'payment_status')
        }),
        ('Adresses', {
            'fields': ('billing_address', 'shipping_address')
        }),
        ('Prix', {
            'fields': ('subtotal', 'tax_amount', 'shipping_fee', 'total_amount', 'currency')
        }),
        ('Métadonnées', {
            'fields': ('notes', 'tracking_number', 'created_at', 'updated_at')
        }),
        ('Dates importantes', {
            'fields': ('confirmed_at', 'shipped_at', 'delivered_at')
        }),
    )


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['order', 'product', 'quantity', 'unit_price', 'total_price']
    list_filter = ['order__status']
    search_fields = ['product__name', 'order__order_number']


@admin.register(BuyerProfile)
class BuyerProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'organization', 'business_type', 'created_at']
    list_filter = ['business_type', 'organization', 'created_at']
    search_fields = ['user__first_name', 'user__last_name', 'user__email', 'business_license', 'tax_number']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Utilisateur', {
            'fields': ('user', 'organization')
        }),
        ('Informations commerciales', {
            'fields': ('business_type', 'business_license', 'tax_number')
        }),
        ('Préférences', {
            'fields': ('preferred_categories', 'preferred_suppliers', 'budget_range')
        }),
        ('Livraison', {
            'fields': ('default_shipping_address', 'delivery_preferences')
        }),
        ('Informations publiques', {
            'fields': ('bio', 'website', 'social_media')
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at')
        }),
    )


class WishlistItemInline(admin.TabularInline):
    model = WishlistItem
    extra = 0


@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ['name', 'buyer', 'organization', 'is_public', 'items_count', 'created_at']
    list_filter = ['is_public', 'organization', 'created_at']
    search_fields = ['name', 'buyer__first_name', 'buyer__last_name']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [WishlistItemInline]

    def items_count(self, obj):
        return obj.items.count()
    items_count.short_description = 'Nombre d\'articles'


@admin.register(WishlistItem)
class WishlistItemAdmin(admin.ModelAdmin):
    list_display = ['wishlist', 'product', 'added_at']
    list_filter = ['added_at']
    search_fields = ['product__name', 'wishlist__name', 'wishlist__buyer__first_name']