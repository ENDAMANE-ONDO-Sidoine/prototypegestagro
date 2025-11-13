"""
Serializers pour l'application suppliers
"""
from rest_framework import serializers
from .models import (
    SupplierProfile, InputCategory, Input, InputImage,
    EquipmentCategory, Equipment, EquipmentImage,
    StockMovement, SupplierOrder, SupplierOrderItem, SupplierReview
)
from apps.organizations.models import Organization
from django.contrib.contenttypes.models import ContentType


class SupplierProfileSerializer(serializers.ModelSerializer):
    """
    Serializer pour le profil fournisseur
    """
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    profile_photo_url = serializers.SerializerMethodField()
    
    class Meta:
        model = SupplierProfile
        fields = [
            'id', 'user', 'user_name', 'user_email', 'organization', 'organization_name',
            'business_license', 'tax_number', 'years_experience', 'specializations',
            'product_categories', 'warehouse_address', 'warehouse_coordinates',
            'phone_emergency', 'has_organic_certification', 'has_quality_certification',
            'bio', 'website', 'social_media', 'profile_photo', 'profile_photo_url',
            'business_documents', 'warehouse_photos', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def get_profile_photo_url(self, obj):
        """Retourner l'URL de la photo de profil si disponible"""
        if obj.profile_photo:
            return obj.profile_photo.url
        return None


class InputCategorySerializer(serializers.ModelSerializer):
    """
    Serializer pour les catégories d'intrants
    """
    class Meta:
        model = InputCategory
        fields = ['id', 'name', 'description', 'parent', 'category_type', 'is_active', 'created_at', 'updated_at']

    def validate(self, attrs):
        parent = attrs.get('parent') or getattr(self.instance, 'parent', None)
        if parent:
            # Si une catégorie parente existe, hériter du type si nécessaire
            parent_type = parent.category_type
            if parent_type != 'other':
                attrs.setdefault('category_type', parent_type)
        return attrs


class InputImageSerializer(serializers.ModelSerializer):
    """
    Serializer pour les images d'intrants
    """
    class Meta:
        model = InputImage
        fields = ['id', 'image', 'alt_text', 'is_primary', 'order', 'created_at']


class InputSerializer(serializers.ModelSerializer):
    """
    Serializer pour les intrants
    """
    images = InputImageSerializer(many=True, read_only=True)
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    is_available = serializers.BooleanField(read_only=True)
    needs_reorder = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Input
        fields = [
            'id', 'name', 'description', 'sku', 'brand', 'organization', 'organization_name',
            'category', 'category_name', 'created_by', 'created_by_name',
            'price', 'currency', 'unit', 'min_order_quantity', 'max_order_quantity',
            'stock_quantity', 'reorder_level', 'quality_grade', 'status',
            'expiry_date', 'batch_number', 'origin_country', 'organic_certified',
            'composition', 'usage_instructions', 'safety_precautions',
            'tags', 'images', 'is_available', 'needs_reorder', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        """Créer un intrant en définissant automatiquement created_by"""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['created_by'] = request.user
        else:
            from apps.iam.models import User
            admin_user = User.objects.filter(is_superuser=True).first()
            if admin_user:
                validated_data['created_by'] = admin_user
            else:
                raise serializers.ValidationError("Aucun utilisateur disponible pour created_by")
        return super().create(validated_data)
    
    def validate_sku(self, value):
        """Vérifier que le SKU est unique"""
        if self.instance and self.instance.sku == value:
            return value
        if Input.objects.filter(sku=value).exists():
            raise serializers.ValidationError("Ce SKU existe déjà.")
        return value


class EquipmentCategorySerializer(serializers.ModelSerializer):
    """
    Serializer pour les catégories d'équipements
    """
    class Meta:
        model = EquipmentCategory
        fields = ['id', 'name', 'description', 'parent', 'is_active', 'created_at', 'updated_at']


class EquipmentImageSerializer(serializers.ModelSerializer):
    """
    Serializer pour les images d'équipements
    """
    class Meta:
        model = EquipmentImage
        fields = ['id', 'image', 'alt_text', 'is_primary', 'order', 'created_at']


class EquipmentSerializer(serializers.ModelSerializer):
    """
    Serializer pour les équipements agricoles
    """
    images = EquipmentImageSerializer(many=True, read_only=True)
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    is_available = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Equipment
        fields = [
            'id', 'name', 'description', 'sku', 'brand', 'model', 'organization', 'organization_name',
            'category', 'category_name', 'created_by', 'created_by_name',
            'price', 'currency', 'stock_quantity', 'min_order_quantity',
            'condition', 'status', 'specifications', 'weight', 'dimensions',
            'power_requirement', 'warranty_period_months', 'has_maintenance_service',
            'tags', 'images', 'is_available', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        """Créer un équipement en définissant automatiquement created_by"""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['created_by'] = request.user
        else:
            from apps.iam.models import User
            admin_user = User.objects.filter(is_superuser=True).first()
            if admin_user:
                validated_data['created_by'] = admin_user
            else:
                raise serializers.ValidationError("Aucun utilisateur disponible pour created_by")
        return super().create(validated_data)
    
    def validate_sku(self, value):
        """Vérifier que le SKU est unique"""
        if self.instance and self.instance.sku == value:
            return value
        if Equipment.objects.filter(sku=value).exists():
            raise serializers.ValidationError("Ce SKU existe déjà.")
        return value


class StockMovementSerializer(serializers.ModelSerializer):
    """
    Serializer pour les mouvements de stock
    """
    item_type = serializers.CharField(write_only=True, required=False, help_text="Type d'item: 'input' ou 'equipment'")
    item_id = serializers.IntegerField(write_only=True, required=False, help_text="ID de l'item")
    item_name = serializers.SerializerMethodField()
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    # Exclure 'item' du schéma car c'est un GenericForeignKey
    item = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = StockMovement
        fields = [
            'id', 'item_type', 'item_id', 'item', 'item_name', 'organization',
            'movement_type', 'quantity', 'reference_number', 'reason', 'notes',
            'stock_before', 'stock_after', 'created_by', 'created_by_name', 'created_at'
        ]
        read_only_fields = ['id', 'item', 'stock_before', 'stock_after', 'created_by', 'created_at']
    
    def get_item(self, obj):
        """Retourner une représentation de l'item"""
        if obj.item:
            return {
                'id': obj.object_id,
                'type': obj.content_type.model,
                'name': str(obj.item)
            }
        return None
    
    def get_item_name(self, obj):
        """Retourner le nom de l'item"""
        if obj.item:
            return str(obj.item)
        return None
    
    def validate(self, attrs):
        """Valider et créer la relation générique"""
        item_type = attrs.pop('item_type', None)
        item_id = attrs.pop('item_id', None)
        
        if item_type and item_id:
            try:
                content_type = ContentType.objects.get(model=item_type.lower())
                model_class = content_type.model_class()
                item = model_class.objects.get(id=item_id)
                attrs['content_type'] = content_type
                attrs['object_id'] = item_id
            except ContentType.DoesNotExist:
                raise serializers.ValidationError(f"Type d'item invalide: {item_type}")
            except model_class.DoesNotExist:
                raise serializers.ValidationError(f"Item avec l'ID {item_id} n'existe pas")
        
        return attrs
    
    def create(self, validated_data):
        """Créer un mouvement de stock"""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['created_by'] = request.user
        
        # Calculer stock_before et stock_after
        item = validated_data.get('item')
        if item and hasattr(item, 'stock_quantity'):
            validated_data['stock_before'] = item.stock_quantity
            movement_type = validated_data.get('movement_type')
            quantity = validated_data.get('quantity', 0)
            
            if movement_type == 'in':
                item.stock_quantity += quantity
            elif movement_type == 'out':
                item.stock_quantity = max(0, item.stock_quantity - quantity)
            elif movement_type == 'adjustment':
                item.stock_quantity = quantity
            
            validated_data['stock_after'] = item.stock_quantity
            item.save()
        
        return super().create(validated_data)


class SupplierOrderItemSerializer(serializers.ModelSerializer):
    """
    Serializer pour les articles d'une commande fournisseur
    """
    item_type = serializers.CharField(write_only=True, required=False, help_text="Type d'item: 'input' ou 'equipment'")
    item_id = serializers.IntegerField(write_only=True, required=False, help_text="ID de l'item")
    item_name = serializers.SerializerMethodField()
    # Exclure 'item' du schéma car c'est un GenericForeignKey
    item = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = SupplierOrderItem
        fields = ['id', 'item_type', 'item_id', 'item', 'item_name', 'quantity', 'unit_price', 'total_price']
        read_only_fields = ['id', 'item', 'total_price']
    
    def get_item(self, obj):
        """Retourner une représentation de l'item"""
        if obj.item:
            return {
                'id': obj.object_id,
                'type': obj.content_type.model,
                'name': str(obj.item)
            }
        return None
    
    def get_item_name(self, obj):
        """Retourner le nom de l'item"""
        if obj.item:
            return str(obj.item)
        return None
    
    def validate(self, attrs):
        """Valider et créer la relation générique"""
        item_type = attrs.pop('item_type', None)
        item_id = attrs.pop('item_id', None)
        
        if item_type and item_id:
            try:
                content_type = ContentType.objects.get(model=item_type.lower())
                model_class = content_type.model_class()
                item = model_class.objects.get(id=item_id)
                attrs['content_type'] = content_type
                attrs['object_id'] = item_id
                
                # Définir le prix unitaire si non fourni
                if 'unit_price' not in attrs and hasattr(item, 'price'):
                    attrs['unit_price'] = item.price
            except ContentType.DoesNotExist:
                raise serializers.ValidationError(f"Type d'item invalide: {item_type}")
            except model_class.DoesNotExist:
                raise serializers.ValidationError(f"Item avec l'ID {item_id} n'existe pas")
        
        return attrs


class SupplierOrderSerializer(serializers.ModelSerializer):
    """
    Serializer pour les commandes fournisseur
    """
    items = SupplierOrderItemSerializer(many=True, read_only=True)
    farmer_name = serializers.CharField(source='farmer.get_full_name', read_only=True)
    farmer_email = serializers.CharField(source='farmer.email', read_only=True)
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    is_paid = serializers.BooleanField(read_only=True)
    is_delivered = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = SupplierOrder
        fields = [
            'id', 'order_number', 'farmer', 'farmer_name', 'farmer_email',
            'supplier', 'supplier_name', 'status', 'payment_status',
            'billing_address', 'shipping_address', 'subtotal', 'tax_amount',
            'shipping_fee', 'total_amount', 'currency', 'notes', 'tracking_number',
            'items', 'is_paid', 'is_delivered', 'created_at', 'updated_at',
            'confirmed_at', 'shipped_at', 'delivered_at'
        ]
        read_only_fields = ['id', 'order_number', 'created_at', 'updated_at', 'confirmed_at', 'shipped_at', 'delivered_at']


class SupplierReviewSerializer(serializers.ModelSerializer):
    """
    Serializer pour les avis sur les fournisseurs/intrants/équipements
    """
    item_type = serializers.CharField(write_only=True, required=False, help_text="Type d'item: 'input', 'equipment' ou 'supplierprofile'")
    item_id = serializers.IntegerField(write_only=True, required=False, help_text="ID de l'item")
    reviewed_item_name = serializers.SerializerMethodField()
    farmer_name = serializers.CharField(source='farmer.get_full_name', read_only=True)
    # Exclure 'reviewed_item' du schéma car c'est un GenericForeignKey
    reviewed_item = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = SupplierReview
        fields = [
            'id', 'item_type', 'item_id', 'reviewed_item', 'reviewed_item_name',
            'farmer', 'farmer_name', 'rating', 'title', 'comment',
            'is_verified_purchase', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'reviewed_item', 'farmer', 'created_at', 'updated_at']
    
    def get_reviewed_item(self, obj):
        """Retourner une représentation de l'item évalué"""
        if obj.reviewed_item:
            return {
                'id': obj.object_id,
                'type': obj.content_type.model,
                'name': str(obj.reviewed_item)
            }
        return None
    
    def get_reviewed_item_name(self, obj):
        """Retourner le nom de l'item évalué"""
        if obj.reviewed_item:
            return str(obj.reviewed_item)
        return None
    
    def validate(self, attrs):
        """Valider et créer la relation générique"""
        item_type = attrs.pop('item_type', None)
        item_id = attrs.pop('item_id', None)
        
        if item_type and item_id:
            try:
                content_type = ContentType.objects.get(model=item_type.lower())
                model_class = content_type.model_class()
                item = model_class.objects.get(id=item_id)
                attrs['content_type'] = content_type
                attrs['object_id'] = item_id
            except ContentType.DoesNotExist:
                raise serializers.ValidationError(f"Type d'item invalide: {item_type}")
            except model_class.DoesNotExist:
                raise serializers.ValidationError(f"Item avec l'ID {item_id} n'existe pas")
        
        return attrs
    
    def create(self, validated_data):
        """Créer un avis"""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['farmer'] = request.user
        return super().create(validated_data)

