"""
Modèles pour l'application suppliers (Fournisseurs)
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from apps.iam.models import User
from apps.organizations.models import Organization
from apps.core.storage import MinIOUserAvatarsStorage, MinIOProductImagesStorage
from apps.core.models import Province, City


class SupplierProfile(models.Model):
    """
    Profil étendu pour les fournisseurs
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='supplier_profile')
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='supplier_profiles')
    
    # Informations professionnelles
    business_license = models.CharField(_('business license'), max_length=100, blank=True)
    tax_number = models.CharField(_('tax number'), max_length=100, blank=True)
    years_experience = models.PositiveIntegerField(_('years of experience'), default=0)
    
    # Spécialisations
    specializations = models.JSONField(_('specializations'), default=list, blank=True)  # ['seeds', 'pesticides', 'fertilizers', 'equipment']
    product_categories = models.JSONField(_('product categories'), default=list, blank=True)  # Catégories de produits fournis
    
    # Informations de contact
    warehouse_address = models.TextField(_('warehouse address'), blank=True)
    warehouse_coordinates = models.JSONField(_('warehouse coordinates'), null=True, blank=True)
    province = models.ForeignKey(Province, on_delete=models.SET_NULL, null=True, blank=True, related_name='supplier_profiles', verbose_name=_('province'))
    city = models.ForeignKey(City, on_delete=models.SET_NULL, null=True, blank=True, related_name='supplier_profiles', verbose_name=_('city'))
    phone_emergency = models.CharField(_('emergency phone'), max_length=20, blank=True)
    
    # Certifications
    has_organic_certification = models.BooleanField(_('organic certification'), default=False)
    has_quality_certification = models.BooleanField(_('quality certification'), default=False)
    
    # Métadonnées
    bio = models.TextField(_('bio'), blank=True)
    website = models.URLField(_('website'), blank=True)
    social_media = models.JSONField(_('social media'), default=dict, blank=True)
    
    # Images
    profile_photo = models.ImageField(_('profile photo'), upload_to='suppliers/profiles/', storage=MinIOUserAvatarsStorage(), blank=True, null=True)
    business_documents = models.JSONField(_('business documents'), default=list, blank=True)  # Documents commerciaux
    warehouse_photos = models.JSONField(_('warehouse photos'), default=list, blank=True)  # Photos de l'entrepôt
    
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        db_table = 'suppliers_supplier_profiles'
        verbose_name = _('Supplier Profile')
        verbose_name_plural = _('Supplier Profiles')

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.organization.name}"


class InputCategory(models.Model):
    """
    Modèle pour les catégories d'intrants
    """
    CATEGORY_TYPE_CHOICES = [
        ('seed', _('Semences')),
        ('pesticide', _('Produits phytosanitaires')),
        ('fertilizer', _('Engrais')),
        ('feed', _('Aliments pour bétail')),
        ('other', _('Autre')),
    ]

    name = models.CharField(_('name'), max_length=100, unique=True)
    description = models.TextField(_('description'), blank=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    category_type = models.CharField(_('category type'), max_length=20, choices=CATEGORY_TYPE_CHOICES, default='other')
    is_active = models.BooleanField(_('active'), default=True)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        db_table = 'suppliers_input_categories'
        verbose_name = _('Input Category')
        verbose_name_plural = _('Input Categories')
        ordering = ['name']

    def __str__(self):
        return self.name


class Input(models.Model):
    """
    Modèle pour les intrants (semences, produits phytosanitaires, engrais, etc.)
    """
    STATUS_CHOICES = [
        ('draft', _('Draft')),
        ('active', _('Active')),
        ('inactive', _('Inactive')),
        ('out_of_stock', _('Out of Stock')),
    ]

    QUALITY_CHOICES = [
        ('premium', _('Premium')),
        ('standard', _('Standard')),
        ('economy', _('Economy')),
    ]

    # Relations
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='supplier_inputs')
    category = models.ForeignKey(InputCategory, on_delete=models.PROTECT, related_name='inputs')
    created_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='created_inputs')
    
    # Informations de base
    name = models.CharField(_('name'), max_length=255)
    description = models.TextField(_('description'))
    sku = models.CharField(_('SKU'), max_length=100, unique=True)
    brand = models.CharField(_('brand'), max_length=100, blank=True)
    
    # Prix et unité
    price = models.DecimalField(_('price'), max_digits=10, decimal_places=2)
    currency = models.CharField(_('currency'), max_length=3, default='XAF')
    unit = models.CharField(_('unit'), max_length=20, default='kg')  # kg, L, unité, etc.
    min_order_quantity = models.PositiveIntegerField(_('minimum order quantity'), default=1)
    max_order_quantity = models.PositiveIntegerField(_('maximum order quantity'), null=True, blank=True)
    
    # Stock
    stock_quantity = models.PositiveIntegerField(_('stock quantity'), default=0)
    reorder_level = models.PositiveIntegerField(_('reorder level'), default=10)  # Seuil de réapprovisionnement
    
    # Qualité et statut
    quality_grade = models.CharField(_('quality grade'), max_length=20, choices=QUALITY_CHOICES, default='standard')
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # Informations spécifiques
    expiry_date = models.DateField(_('expiry date'), null=True, blank=True)
    batch_number = models.CharField(_('batch number'), max_length=100, blank=True)
    origin_country = models.CharField(_('origin country'), max_length=100, default='Gabon')
    organic_certified = models.BooleanField(_('organic certified'), default=False)
    
    # Caractéristiques techniques (pour produits phytosanitaires, engrais, etc.)
    composition = models.JSONField(_('composition'), default=dict, blank=True)  # Composition chimique
    usage_instructions = models.TextField(_('usage instructions'), blank=True)
    safety_precautions = models.TextField(_('safety precautions'), blank=True)
    
    # Métadonnées
    tags = models.JSONField(_('tags'), default=list, blank=True)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        db_table = 'suppliers_inputs'
        verbose_name = _('Input')
        verbose_name_plural = _('Inputs')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['organization', 'status']),
            models.Index(fields=['category', 'status']),
            models.Index(fields=['sku']),
        ]

    def __str__(self):
        return f"{self.name} ({self.organization.name})"

    @property
    def is_available(self):
        return self.status == 'active' and self.stock_quantity > 0

    @property
    def needs_reorder(self):
        return self.stock_quantity <= self.reorder_level


class InputImage(models.Model):
    """
    Modèle pour les images des intrants
    """
    input_item = models.ForeignKey(Input, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(_('image'), upload_to='suppliers/inputs/images/', storage=MinIOProductImagesStorage())
    alt_text = models.CharField(_('alt text'), max_length=255, blank=True)
    is_primary = models.BooleanField(_('primary image'), default=False)
    order = models.PositiveIntegerField(_('order'), default=0)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)

    class Meta:
        db_table = 'suppliers_input_images'
        verbose_name = _('Input Image')
        verbose_name_plural = _('Input Images')
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"{self.input_item.name} - Image {self.order}"


class EquipmentCategory(models.Model):
    """
    Modèle pour les catégories d'équipements agricoles
    """
    name = models.CharField(_('name'), max_length=100, unique=True)
    description = models.TextField(_('description'), blank=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    is_active = models.BooleanField(_('active'), default=True)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        db_table = 'suppliers_equipment_categories'
        verbose_name = _('Equipment Category')
        verbose_name_plural = _('Equipment Categories')
        ordering = ['name']

    def __str__(self):
        return self.name


class Equipment(models.Model):
    """
    Modèle pour les équipements agricoles
    """
    STATUS_CHOICES = [
        ('draft', _('Draft')),
        ('active', _('Active')),
        ('inactive', _('Inactive')),
        ('out_of_stock', _('Out of Stock')),
    ]

    CONDITION_CHOICES = [
        ('new', _('Neuf')),
        ('used', _('Occasion')),
        ('refurbished', _('Reconditionné')),
    ]

    # Relations
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='supplier_equipment')
    category = models.ForeignKey(EquipmentCategory, on_delete=models.PROTECT, related_name='equipment')
    created_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='created_equipment')
    
    # Informations de base
    name = models.CharField(_('name'), max_length=255)
    description = models.TextField(_('description'))
    sku = models.CharField(_('SKU'), max_length=100, unique=True)
    brand = models.CharField(_('brand'), max_length=100, blank=True)
    model = models.CharField(_('model'), max_length=100, blank=True)
    
    # Prix et stock
    price = models.DecimalField(_('price'), max_digits=10, decimal_places=2)
    currency = models.CharField(_('currency'), max_length=3, default='XAF')
    stock_quantity = models.PositiveIntegerField(_('stock quantity'), default=0)
    min_order_quantity = models.PositiveIntegerField(_('minimum order quantity'), default=1)
    
    # État et statut
    condition = models.CharField(_('condition'), max_length=20, choices=CONDITION_CHOICES, default='new')
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # Caractéristiques techniques
    specifications = models.JSONField(_('specifications'), default=dict, blank=True)  # Caractéristiques techniques
    weight = models.DecimalField(_('weight'), max_digits=8, decimal_places=2, null=True, blank=True, help_text=_('in kg'))
    dimensions = models.JSONField(_('dimensions'), null=True, blank=True)  # {length, width, height}
    power_requirement = models.CharField(_('power requirement'), max_length=100, blank=True)  # Ex: "220V", "Diesel", etc.
    
    # Garantie et support
    warranty_period_months = models.PositiveIntegerField(_('warranty period (months)'), null=True, blank=True)
    has_maintenance_service = models.BooleanField(_('has maintenance service'), default=False)
    
    # Métadonnées
    tags = models.JSONField(_('tags'), default=list, blank=True)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        db_table = 'suppliers_equipment'
        verbose_name = _('Equipment')
        verbose_name_plural = _('Equipment')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['organization', 'status']),
            models.Index(fields=['category', 'status']),
            models.Index(fields=['sku']),
        ]

    def __str__(self):
        return f"{self.name} ({self.organization.name})"

    @property
    def is_available(self):
        return self.status == 'active' and self.stock_quantity > 0


class EquipmentImage(models.Model):
    """
    Modèle pour les images des équipements
    """
    equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(_('image'), upload_to='suppliers/equipment/images/', storage=MinIOProductImagesStorage())
    alt_text = models.CharField(_('alt text'), max_length=255, blank=True)
    is_primary = models.BooleanField(_('primary image'), default=False)
    order = models.PositiveIntegerField(_('order'), default=0)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)

    class Meta:
        db_table = 'suppliers_equipment_images'
        verbose_name = _('Equipment Image')
        verbose_name_plural = _('Equipment Images')
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"{self.equipment.name} - Image {self.order}"


class StockMovement(models.Model):
    """
    Modèle pour les mouvements de stock (entrées/sorties)
    """
    MOVEMENT_TYPE_CHOICES = [
        ('in', _('Entrée')),
        ('out', _('Sortie')),
        ('adjustment', _('Ajustement')),
        ('return', _('Retour')),
    ]

    # Relation générique pour Input ou Equipment
    content_type = models.ForeignKey(ContentType, on_delete=models.PROTECT)
    object_id = models.PositiveIntegerField()
    item = GenericForeignKey('content_type', 'object_id')
    
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='stock_movements')
    movement_type = models.CharField(_('movement type'), max_length=20, choices=MOVEMENT_TYPE_CHOICES)
    quantity = models.PositiveIntegerField(_('quantity'))
    
    # Informations de mouvement
    reference_number = models.CharField(_('reference number'), max_length=100, blank=True)  # Numéro de commande, facture, etc.
    reason = models.CharField(_('reason'), max_length=255, blank=True)
    notes = models.TextField(_('notes'), blank=True)
    
    # Stock avant et après
    stock_before = models.PositiveIntegerField(_('stock before'))
    stock_after = models.PositiveIntegerField(_('stock after'))
    
    created_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='created_stock_movements')
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)

    class Meta:
        db_table = 'suppliers_stock_movements'
        verbose_name = _('Stock Movement')
        verbose_name_plural = _('Stock Movements')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['content_type', 'object_id']),
            models.Index(fields=['organization', 'movement_type']),
        ]

    def __str__(self):
        return f"{self.get_movement_type_display()} - {self.quantity} - {self.created_at}"


class SupplierOrder(models.Model):
    """
    Modèle pour les commandes des producteurs auprès des fournisseurs
    """
    STATUS_CHOICES = [
        ('pending', _('Pending')),
        ('confirmed', _('Confirmed')),
        ('processing', _('Processing')),
        ('ready', _('Ready for Pickup')),
        ('shipped', _('Shipped')),
        ('delivered', _('Delivered')),
        ('cancelled', _('Cancelled')),
        ('refunded', _('Refunded')),
    ]

    PAYMENT_STATUS_CHOICES = [
        ('pending', _('Pending')),
        ('paid', _('Paid')),
        ('failed', _('Failed')),
        ('refunded', _('Refunded')),
    ]

    # Relations
    farmer = models.ForeignKey(User, on_delete=models.PROTECT, related_name='supplier_orders_as_farmer')
    supplier = models.ForeignKey(Organization, on_delete=models.PROTECT, related_name='supplier_orders_as_supplier')
    
    # Informations de commande
    order_number = models.CharField(_('order number'), max_length=50, unique=True)
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_status = models.CharField(_('payment status'), max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    
    # Adresses
    billing_address = models.JSONField(_('billing address'))
    shipping_address = models.JSONField(_('shipping address'))
    
    # Prix
    subtotal = models.DecimalField(_('subtotal'), max_digits=10, decimal_places=2)
    tax_amount = models.DecimalField(_('tax amount'), max_digits=10, decimal_places=2, default=0)
    shipping_fee = models.DecimalField(_('shipping fee'), max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(_('total amount'), max_digits=10, decimal_places=2)
    currency = models.CharField(_('currency'), max_length=3, default='XAF')
    
    # Métadonnées
    notes = models.TextField(_('notes'), blank=True)
    tracking_number = models.CharField(_('tracking number'), max_length=100, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    confirmed_at = models.DateTimeField(_('confirmed at'), null=True, blank=True)
    shipped_at = models.DateTimeField(_('shipped at'), null=True, blank=True)
    delivered_at = models.DateTimeField(_('delivered at'), null=True, blank=True)

    class Meta:
        db_table = 'suppliers_orders'
        verbose_name = _('Supplier Order')
        verbose_name_plural = _('Supplier Orders')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['farmer', 'status']),
            models.Index(fields=['supplier', 'status']),
            models.Index(fields=['order_number']),
        ]

    def __str__(self):
        return f"Commande {self.order_number} - {self.farmer.get_full_name()}"

    def save(self, *args, **kwargs):
        if not self.order_number:
            import uuid
            self.order_number = f"SUP-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    @property
    def is_paid(self):
        return self.payment_status == 'paid'

    @property
    def is_delivered(self):
        return self.status == 'delivered'


class SupplierOrderItem(models.Model):
    """
    Articles dans une commande fournisseur
    """
    # Relation générique pour Input ou Equipment
    content_type = models.ForeignKey(ContentType, on_delete=models.PROTECT)
    object_id = models.PositiveIntegerField()
    item = GenericForeignKey('content_type', 'object_id')
    
    order = models.ForeignKey(SupplierOrder, on_delete=models.CASCADE, related_name='items')
    quantity = models.PositiveIntegerField(_('quantity'), validators=[MinValueValidator(1)])
    unit_price = models.DecimalField(_('unit price'), max_digits=10, decimal_places=2)
    total_price = models.DecimalField(_('total price'), max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'suppliers_order_items'
        verbose_name = _('Supplier Order Item')
        verbose_name_plural = _('Supplier Order Items')

    def __str__(self):
        item_name = f"{self.content_type.model}#{self.object_id}"
        return f"{item_name} x{self.quantity} - {self.order.order_number}"

    def save(self, *args, **kwargs):
        self.total_price = self.quantity * self.unit_price
        super().save(*args, **kwargs)


class SupplierReview(models.Model):
    """
    Avis sur les fournisseurs/intrants/équipements
    """
    RATING_CHOICES = [
        (1, '1 étoile'),
        (2, '2 étoiles'),
        (3, '3 étoiles'),
        (4, '4 étoiles'),
        (5, '5 étoiles'),
    ]

    # Relation générique pour Input, Equipment ou SupplierProfile
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    reviewed_item = GenericForeignKey('content_type', 'object_id')
    
    farmer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='supplier_reviews')
    rating = models.PositiveIntegerField(_('rating'), choices=RATING_CHOICES)
    title = models.CharField(_('title'), max_length=255)
    comment = models.TextField(_('comment'))
    is_verified_purchase = models.BooleanField(_('verified purchase'), default=False)
    
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        db_table = 'suppliers_reviews'
        verbose_name = _('Supplier Review')
        verbose_name_plural = _('Supplier Reviews')
        unique_together = ['content_type', 'object_id', 'farmer']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.reviewed_item} - {self.rating} étoiles par {self.farmer.get_full_name()}"

