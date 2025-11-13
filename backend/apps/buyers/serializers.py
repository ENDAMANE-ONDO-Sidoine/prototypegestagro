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
    product_origin = serializers.SerializerMethodField()
    
    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'product_name', 'product_sku', 'product_origin',
            'quantity', 'unit_price', 'total_price'
        ]
        read_only_fields = ['id', 'total_price']
    
    def get_product_origin(self, obj):
        """Récupérer le lieu de production du produit"""
        try:
            farmer_profile = obj.product.organization.farmer_profiles.first()
            if farmer_profile:
                origin_info = {
                    'country': obj.product.origin_country or 'Gabon',
                }
                if farmer_profile.province:
                    origin_info['province'] = {
                        'id': farmer_profile.province.id,
                        'name': farmer_profile.province.name
                    }
                if farmer_profile.city:
                    origin_info['city'] = {
                        'id': farmer_profile.city.id,
                        'name': farmer_profile.city.name
                    }
                if farmer_profile.farm_address:
                    origin_info['address'] = farmer_profile.farm_address
                if farmer_profile.farm_coordinates:
                    origin_info['coordinates'] = farmer_profile.farm_coordinates
                return origin_info
        except:
            pass
        return {
            'country': obj.product.origin_country or 'Gabon'
        }


class OrderSerializer(serializers.ModelSerializer):
    """
    Serializer pour les commandes
    """
    items = OrderItemSerializer(many=True, read_only=True)
    buyer_name = serializers.CharField(source='buyer.get_full_name', read_only=True)
    seller_name = serializers.CharField(source='seller.name', read_only=True)
    shipment_info = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = [
            'id', 'buyer', 'buyer_name', 'seller', 'seller_name',
            'order_number', 'status', 'payment_status', 'billing_address',
            'shipping_address', 'subtotal', 'tax_amount', 'shipping_fee',
            'total_amount', 'currency', 'notes', 'tracking_number',
            'items', 'shipment_info', 'created_at', 'updated_at', 'confirmed_at',
            'shipped_at', 'delivered_at'
        ]
        read_only_fields = [
            'id', 'buyer', 'order_number', 'created_at', 'updated_at',
            'confirmed_at', 'shipped_at', 'delivered_at'
        ]
    
    def get_shipment_info(self, obj):
        """Récupérer les informations d'expédition de la commande"""
        try:
            shipment = obj.shipments.first()  # Une commande peut avoir plusieurs expéditions
            if shipment:
                shipment_info = {
                    'id': shipment.id,
                    'tracking_number': shipment.tracking_number,
                    'status': shipment.status,
                    'status_display': shipment.get_status_display(),
                    'current_location': shipment.current_location,
                    'scheduled_pickup_date': shipment.scheduled_pickup_date,
                    'scheduled_delivery_date': shipment.scheduled_delivery_date,
                    'actual_pickup_date': shipment.actual_pickup_date,
                    'actual_delivery_date': shipment.actual_delivery_date,
                    'transport_cost': str(shipment.transport_cost) if shipment.transport_cost else None,
                    'currency': shipment.currency,
                    'progress_percentage': shipment.progress_percentage,
                    'is_delayed': shipment.is_delayed,
                }
                
                # Informations de la route
                if shipment.route:
                    route_info = {
                        'id': shipment.route.id,
                        'name': shipment.route.name,
                        'origin': {
                            'city': shipment.route.origin_city,
                            'province': shipment.route.origin_city_fk.province.name if shipment.route.origin_city_fk else None,
                            'country': shipment.route.origin_country,
                            'coordinates': shipment.route.origin_coordinates
                        } if shipment.route.origin_city_fk else {
                            'city': shipment.route.origin_city_old or shipment.route.origin_city,
                            'country': shipment.route.origin_country
                        },
                        'destination': {
                            'city': shipment.route.destination_city,
                            'province': shipment.route.destination_city_fk.province.name if shipment.route.destination_city_fk else None,
                            'country': shipment.route.destination_country,
                            'coordinates': shipment.route.destination_coordinates
                        } if shipment.route.destination_city_fk else {
                            'city': shipment.route.destination_city_old or shipment.route.destination_city,
                            'country': shipment.route.destination_country
                        },
                        'distance_km': str(shipment.route.distance_km) if shipment.route.distance_km else None,
                        'estimated_duration_hours': str(shipment.route.estimated_duration_hours) if shipment.route.estimated_duration_hours else None,
                    }
                    shipment_info['route'] = route_info
                
                # Informations du véhicule
                if shipment.vehicle:
                    shipment_info['vehicle'] = {
                        'id': shipment.vehicle.id,
                        'license_plate': shipment.vehicle.license_plate,
                        'make': shipment.vehicle.make,
                        'model': shipment.vehicle.model,
                        'vehicle_type': shipment.vehicle.get_vehicle_type_display(),
                        'current_location': shipment.vehicle.current_location,
                    }
                
                # Informations du chauffeur
                if shipment.driver:
                    shipment_info['driver'] = {
                        'id': shipment.driver.id,
                        'name': shipment.driver.get_full_name(),
                        'phone': shipment.driver.phone,
                        'license_number': shipment.driver.license_number,
                    }
                
                return shipment_info
        except Exception as e:
            # En cas d'erreur, retourner None plutôt que de faire planter la requête
            return None
        return None


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
