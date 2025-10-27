from rest_framework import serializers
from .models import Category, Product, ProductImage, FarmerProfile, ProductReview
from apps.organizations.models import Organization


class CategorySerializer(serializers.ModelSerializer):
    """
    Serializer pour les catégories de produits
    """
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'parent', 'is_active', 'created_at', 'updated_at']


class ProductImageSerializer(serializers.ModelSerializer):
    """
    Serializer pour les images de produits
    """
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'is_primary', 'order', 'created_at']


class ProductSerializer(serializers.ModelSerializer):
    """
    Serializer pour les produits des agriculteurs
    """
    images = ProductImageSerializer(many=True, read_only=True)
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'sku', 'organization', 'organization_name',
            'category', 'category_name', 'created_by', 'created_by_name',
            'price', 'currency', 'unit', 'stock_quantity', 'min_order_quantity',
            'max_order_quantity', 'quality_grade', 'status', 'harvest_date',
            'expiry_date', 'origin_country', 'organic_certified', 'weight',
            'dimensions', 'tags', 'images', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        """
        Créer un produit en définissant automatiquement created_by
        """
        # Récupérer l'utilisateur depuis le contexte de la requête
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['created_by'] = request.user
        else:
            # Fallback: utiliser l'utilisateur admin si pas de contexte
            from apps.iam.models import User
            admin_user = User.objects.filter(is_superuser=True).first()
            if admin_user:
                validated_data['created_by'] = admin_user
            else:
                raise serializers.ValidationError("Aucun utilisateur disponible pour created_by")
        
        return super().create(validated_data)

    def validate_sku(self, value):
        """
        Vérifier que le SKU est unique
        """
        if self.instance and self.instance.sku == value:
            return value
        
        if Product.objects.filter(sku=value).exists():
            raise serializers.ValidationError("Ce SKU existe déjà.")
        return value


class FarmerProfileSerializer(serializers.ModelSerializer):
    """
    Serializer pour le profil agriculteur
    """
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    profile_photo_url = serializers.SerializerMethodField()
    
    class Meta:
        model = FarmerProfile
        fields = [
            'id', 'user', 'user_name', 'user_email', 'organization', 'organization_name',
            'farm_size_hectares', 'farming_experience_years', 'certification_number',
            'organic_certified', 'specializations', 'crops_grown', 'farm_address',
            'farm_coordinates', 'bio', 'website', 'social_media',
            'profile_photo', 'profile_photo_url', 'farm_photos', 'certification_documents',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def get_profile_photo_url(self, obj):
        """Retourner l'URL de la photo de profil si disponible"""
        if obj.profile_photo:
            return obj.profile_photo.url
        return None


class ProductReviewSerializer(serializers.ModelSerializer):
    """
    Serializer pour les avis sur les produits
    """
    buyer_name = serializers.CharField(source='buyer.get_full_name', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = ProductReview
        fields = [
            'id', 'product', 'product_name', 'buyer', 'buyer_name',
            'rating', 'title', 'comment', 'is_verified_purchase',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'buyer', 'created_at', 'updated_at']

    def validate_rating(self, value):
        """
        Vérifier que la note est entre 1 et 5
        """
        if not 1 <= value <= 5:
            raise serializers.ValidationError("La note doit être entre 1 et 5.")
        return value
