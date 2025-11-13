from rest_framework import serializers
from .models import Category, Product, ProductImage, FarmerProfile, ProductReview
from apps.organizations.models import Organization


class CategorySerializer(serializers.ModelSerializer):
    """
    Serializer pour les catégories de produits
    """
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'parent', 'product_type', 'is_active', 'created_at', 'updated_at']

    def validate(self, attrs):
        parent = attrs.get('parent') or getattr(self.instance, 'parent', None)
        product_type = attrs.get('product_type') or getattr(self.instance, 'product_type', 'crop')

        if parent:
            if parent.product_type != 'mixed':
                attrs.setdefault('product_type', parent.product_type)
                product_type = attrs.get('product_type', product_type)
                if product_type != parent.product_type:
                    raise serializers.ValidationError({
                        'product_type': "Le type de produit doit correspondre à celui de la catégorie parente."
                    })
        return attrs


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
    product_type_display = serializers.CharField(source='get_product_type_display', read_only=True)
    
    # Informations de localisation du producteur
    producer_province = serializers.SerializerMethodField()
    producer_city = serializers.SerializerMethodField()
    producer_address = serializers.SerializerMethodField()
    producer_coordinates = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'sku', 'product_type', 'product_type_display',
            'organization', 'organization_name',
            'category', 'category_name', 'created_by', 'created_by_name',
            'price', 'currency', 'unit', 'stock_quantity', 'min_order_quantity',
            'max_order_quantity', 'quality_grade', 'status', 'harvest_date',
            'expiry_date', 'origin_country', 'organic_certified',
            'animal_species', 'animal_breed', 'animal_age', 'animal_age_unit',
            'rearing_method', 'feeding_type', 'health_status', 'processing_type',
            'slaughter_date', 'storage_temperature', 'animals_per_lot',
            'weight', 'dimensions', 'tags', 'images',
            'producer_province', 'producer_city', 'producer_address', 'producer_coordinates',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']
    
    def get_producer_province(self, obj):
        """Récupérer la province du producteur"""
        try:
            farmer_profile = obj.organization.farmer_profiles.first()
            if farmer_profile and farmer_profile.province:
                return {
                    'id': farmer_profile.province.id,
                    'name': farmer_profile.province.name,
                    'chef_lieu': farmer_profile.province.chef_lieu
                }
        except:
            pass
        return None
    
    def get_producer_city(self, obj):
        """Récupérer la ville du producteur"""
        try:
            farmer_profile = obj.organization.farmer_profiles.first()
            if farmer_profile and farmer_profile.city:
                return {
                    'id': farmer_profile.city.id,
                    'name': farmer_profile.city.name,
                    'province': farmer_profile.city.province.name
                }
        except:
            pass
        return None
    
    def get_producer_address(self, obj):
        """Récupérer l'adresse de la ferme"""
        try:
            farmer_profile = obj.organization.farmer_profiles.first()
            if farmer_profile:
                return farmer_profile.farm_address
        except:
            pass
        return None
    
    def get_producer_coordinates(self, obj):
        """Récupérer les coordonnées GPS de la ferme"""
        try:
            farmer_profile = obj.organization.farmer_profiles.first()
            if farmer_profile:
                return farmer_profile.farm_coordinates
        except:
            pass
        return None
    
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
        
        category = validated_data.get('category')
        if category and category.product_type != 'mixed':
            validated_data.setdefault('product_type', category.product_type)

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

    def validate(self, attrs):
        """
        Règles de validation contextuelles pour les produits animaux
        """
        category = attrs.get('category') or getattr(self.instance, 'category', None)
        if category and category.product_type != 'mixed':
            attrs.setdefault('product_type', category.product_type)

        product_type = attrs.get('product_type') or getattr(self.instance, 'product_type', 'crop')

        if category and category.product_type != 'mixed' and product_type != category.product_type:
            raise serializers.ValidationError({
                'product_type': "Le type de produit doit correspondre au type de la catégorie sélectionnée."
            })

        if product_type in ['livestock', 'fishery']:
            required_fields = ['animal_species', 'processing_type']
            for field in required_fields:
                value = attrs.get(field, getattr(self.instance, field, None))
                if not value:
                    raise serializers.ValidationError({
                        field: "Ce champ est requis pour les produits animaux."
                    })

            # Pour les produits non vivants, certaines informations de traçabilité deviennent importantes
            processing_type = attrs.get('processing_type', getattr(self.instance, 'processing_type', None))
            slaughter_date = attrs.get('slaughter_date', getattr(self.instance, 'slaughter_date', None))
            if processing_type in ['fresh', 'frozen', 'processed'] and not slaughter_date:
                raise serializers.ValidationError({
                    'slaughter_date': "La date d'abattage est requise pour les produits animaux non vivants."
                })

            animal_age = attrs.get('animal_age', getattr(self.instance, 'animal_age', None))
            if animal_age is not None and animal_age < 0:
                raise serializers.ValidationError({
                    'animal_age': "L'âge de l'animal doit être positif."
                })

        return attrs


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
