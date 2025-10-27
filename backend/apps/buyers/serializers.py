from rest_framework import serializers
from .models import Cart, CartItem, Order, OrderItem, BuyerProfile, Wishlist, WishlistItem
from apps.farmers.models import Product
from apps.organizations.models import Organization


class CartItemSerializer(serializers.ModelSerializer):
    """
    Serializer pour les articles du panier
    """
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    product_image = serializers.SerializerMethodField()
    
    class Meta:
        model = CartItem
        fields = [
            'id', 'product', 'product_name', 'product_sku', 'product_image',
            'quantity', 'unit_price', 'total_price', 'added_at', 'updated_at'
        ]
        read_only_fields = ['id', 'total_price', 'added_at', 'updated_at']

    def get_product_image(self, obj):
        """
        Récupérer l'image principale du produit
        """
        primary_image = obj.product.images.filter(is_primary=True).first()
        if primary_image:
            return primary_image.image.url
        return None

    def validate_quantity(self, value):
        """
        Vérifier que la quantité est valide
        """
        if value <= 0:
            raise serializers.ValidationError("La quantité doit être positive.")
        return value


class CartSerializer(serializers.ModelSerializer):
    """
    Serializer pour le panier
    """
    items = CartItemSerializer(many=True, read_only=True)
    buyer_name = serializers.CharField(source='buyer.get_full_name', read_only=True)
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    total_items = serializers.IntegerField(read_only=True)
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = Cart
        fields = [
            'id', 'buyer', 'buyer_name', 'organization', 'organization_name',
            'items', 'total_items', 'total_amount', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'buyer', 'created_at', 'updated_at']


class OrderItemSerializer(serializers.ModelSerializer):
    """
    Serializer pour les articles de commande
    """
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'product_name', 'product_sku',
            'quantity', 'unit_price', 'total_price'
        ]
        read_only_fields = ['id', 'total_price']


class OrderSerializer(serializers.ModelSerializer):
    """
    Serializer pour les commandes
    """
    items = OrderItemSerializer(many=True, read_only=True)
    buyer_name = serializers.CharField(source='buyer.get_full_name', read_only=True)
    seller_name = serializers.CharField(source='seller.name', read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'buyer', 'buyer_name', 'seller', 'seller_name',
            'order_number', 'status', 'payment_status', 'billing_address',
            'shipping_address', 'subtotal', 'tax_amount', 'shipping_fee',
            'total_amount', 'currency', 'notes', 'tracking_number',
            'items', 'created_at', 'updated_at', 'confirmed_at',
            'shipped_at', 'delivered_at'
        ]
        read_only_fields = [
            'id', 'buyer', 'order_number', 'created_at', 'updated_at',
            'confirmed_at', 'shipped_at', 'delivered_at'
        ]


class BuyerProfileSerializer(serializers.ModelSerializer):
    """
    Serializer pour le profil acheteur
    """
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    preferred_suppliers_names = serializers.SerializerMethodField()
    profile_photo_url = serializers.SerializerMethodField()
    
    class Meta:
        model = BuyerProfile
        fields = [
            'id', 'user', 'user_name', 'user_email', 'organization', 'organization_name',
            'business_type', 'business_license', 'tax_number', 'preferred_categories',
            'preferred_suppliers', 'preferred_suppliers_names', 'budget_range', 
            'default_shipping_address', 'delivery_preferences', 'bio', 'website', 
            'social_media', 'profile_photo', 'profile_photo_url', 'business_documents',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def get_preferred_suppliers_names(self, obj):
        """Récupérer les noms des fournisseurs préférés"""
        return [supplier.name for supplier in obj.preferred_suppliers.all()]
    
    def get_profile_photo_url(self, obj):
        """Retourner l'URL de la photo de profil si disponible"""
        if obj.profile_photo:
            return obj.profile_photo.url
        return None


class WishlistItemSerializer(serializers.ModelSerializer):
    """
    Serializer pour les articles de liste de souhaits
    """
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    product_price = serializers.DecimalField(source='product.price', max_digits=10, decimal_places=2, read_only=True)
    product_currency = serializers.CharField(source='product.currency', read_only=True)
    product_image = serializers.SerializerMethodField()
    
    class Meta:
        model = WishlistItem
        fields = [
            'id', 'product', 'product_name', 'product_sku', 'product_price',
            'product_currency', 'product_image', 'added_at'
        ]
        read_only_fields = ['id', 'added_at']

    def get_product_image(self, obj):
        """
        Récupérer l'image principale du produit
        """
        primary_image = obj.product.images.filter(is_primary=True).first()
        if primary_image:
            return primary_image.image.url
        return None


class WishlistSerializer(serializers.ModelSerializer):
    """
    Serializer pour les listes de souhaits
    """
    items = WishlistItemSerializer(many=True, read_only=True)
    buyer_name = serializers.CharField(source='buyer.get_full_name', read_only=True)
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    items_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Wishlist
        fields = [
            'id', 'buyer', 'buyer_name', 'organization', 'organization_name',
            'name', 'is_public', 'items', 'items_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'buyer', 'created_at', 'updated_at']

    def get_items_count(self, obj):
        """
        Compter le nombre d'articles dans la liste
        """
        return obj.items.count()
