"""
Modèles pour l'application farmers (agriculteurs/vendeurs)
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.iam.models import User
from apps.organizations.models import Organization
from apps.core.storage import MinIOProductImagesStorage, MinIOUserAvatarsStorage
from apps.core.models import Province, City


class Category(models.Model):
    """
    Modèle pour les catégories de produits
    """
    PRODUCT_TYPE_CHOICES = [
        ('crop', _('Produits végétaux')),
        ('livestock', _('Produits animaux (élevage)')),
        ('fishery', _('Produits animaux (pêche)')),
        ('mixed', _('Mixte')),
    ]

    name = models.CharField(_('name'), max_length=100, unique=True)
    description = models.TextField(_('description'), blank=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    product_type = models.CharField(_('product type'), max_length=20, choices=PRODUCT_TYPE_CHOICES, default='crop')
    is_active = models.BooleanField(_('active'), default=True)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        db_table = 'farmers_categories'
        verbose_name = _('Category')
        verbose_name_plural = _('Categories')
        ordering = ['name']

    def __str__(self):
        return self.name


class Product(models.Model):
    """
    Modèle pour les produits agricoles vendus par les agriculteurs
    """
    PRODUCT_TYPE_CHOICES = [
        ('crop', _('Produit végétal')),
        ('livestock', _('Produit animal - élevage')),
        ('fishery', _('Produit animal - pêche')),
    ]

    AGE_UNIT_CHOICES = [
        ('day', _('Jour(s)')),
        ('week', _('Semaine(s)')),
        ('month', _('Mois')),
        ('year', _('Année(s)')),
    ]

    PROCESSING_CHOICES = [
        ('live', _('Vivant')),
        ('fresh', _('Frais / abattu')),
        ('frozen', _('Congelé')),
        ('processed', _('Transformé')),
    ]

    QUALITY_CHOICES = [
        ('extra', _('Qualité Extra')),
        ('class_i', _('Classe I')),
        ('class_ii', _('Classe II')),
    ]

    STATUS_CHOICES = [
        ('draft', _('Draft')),
        ('active', _('Active')),
        ('inactive', _('Inactive')),
        ('out_of_stock', _('Out of Stock')),
    ]

    # Informations de base
    name = models.CharField(_('name'), max_length=255)
    description = models.TextField(_('description'))
    sku = models.CharField(_('SKU'), max_length=100, unique=True)
    product_type = models.CharField(_('product type'), max_length=20, choices=PRODUCT_TYPE_CHOICES, default='crop')
    
    # Relations
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='products')
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='products')
    created_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='created_products')
    
    # Prix et stock
    price = models.DecimalField(_('price'), max_digits=10, decimal_places=2)
    currency = models.CharField(_('currency'), max_length=3, default='XAF')
    unit = models.CharField(_('unit'), max_length=20, default='kg')
    stock_quantity = models.PositiveIntegerField(_('stock quantity'), default=0)
    min_order_quantity = models.PositiveIntegerField(_('minimum order quantity'), default=1)
    max_order_quantity = models.PositiveIntegerField(_('maximum order quantity'), null=True, blank=True)
    
    # Qualité et statut
    quality_grade = models.CharField(_('quality grade'), max_length=20, choices=QUALITY_CHOICES, default='standard')
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # Informations de production
    harvest_date = models.DateField(_('harvest date'), null=True, blank=True)
    expiry_date = models.DateField(_('expiry date'), null=True, blank=True)
    origin_country = models.CharField(_('origin country'), max_length=100, default='Gabon')
    organic_certified = models.BooleanField(_('organic certified'), default=False)

    # Informations spécifiques aux produits animaux
    animal_species = models.CharField(_('animal species'), max_length=100, blank=True)
    animal_breed = models.CharField(_('animal breed'), max_length=100, blank=True)
    animal_age = models.DecimalField(_('animal age'), max_digits=5, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0)])
    animal_age_unit = models.CharField(_('animal age unit'), max_length=10, choices=AGE_UNIT_CHOICES, default='month', blank=True)
    rearing_method = models.CharField(_('rearing method'), max_length=120, blank=True)
    feeding_type = models.CharField(_('feeding type'), max_length=120, blank=True)
    health_status = models.CharField(_('health status'), max_length=120, blank=True)
    processing_type = models.CharField(_('processing type'), max_length=20, choices=PROCESSING_CHOICES, blank=True)
    slaughter_date = models.DateField(_('slaughter date'), null=True, blank=True)
    storage_temperature = models.DecimalField(_('storage temperature (°C)'), max_digits=4, decimal_places=1, null=True, blank=True)
    animals_per_lot = models.PositiveIntegerField(_('animals per lot'), null=True, blank=True)
    
    # Caractéristiques physiques
    weight = models.DecimalField(_('weight'), max_digits=8, decimal_places=2, null=True, blank=True)
    dimensions = models.JSONField(_('dimensions'), null=True, blank=True)
    
    # Métadonnées
    tags = models.JSONField(_('tags'), default=list, blank=True)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        db_table = 'farmers_products'
        verbose_name = _('Product')
        verbose_name_plural = _('Products')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.organization.name})"

    @property
    def is_available(self):
        return self.status == 'active' and self.stock_quantity > 0

    @property
    def is_organic(self):
        return self.organic_certified


class ProductImage(models.Model):
    """
    Modèle pour les images des produits
    """
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(_('image'), upload_to='products/images/', storage=MinIOProductImagesStorage())
    alt_text = models.CharField(_('alt text'), max_length=255, blank=True)
    is_primary = models.BooleanField(_('primary image'), default=False)
    order = models.PositiveIntegerField(_('order'), default=0)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)

    class Meta:
        db_table = 'farmers_product_images'
        verbose_name = _('Product Image')
        verbose_name_plural = _('Product Images')
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"{self.product.name} - Image {self.order}"


class FarmerProfile(models.Model):
    """
    Profil étendu pour les agriculteurs
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='farmer_profile')
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='farmer_profiles')
    
    # Informations agricoles
    farm_size_hectares = models.DecimalField(_('farm size (hectares)'), max_digits=10, decimal_places=2, null=True, blank=True)
    farming_experience_years = models.PositiveIntegerField(_('farming experience (years)'), null=True, blank=True)
    certification_number = models.CharField(_('certification number'), max_length=100, blank=True)
    organic_certified = models.BooleanField(_('organic certified'), default=False)
    
    # Spécialisations
    specializations = models.JSONField(_('specializations'), default=list, blank=True)
    crops_grown = models.JSONField(_('crops grown'), default=list, blank=True)
    
    # Informations de contact
    farm_address = models.TextField(_('farm address'), blank=True)
    farm_coordinates = models.JSONField(_('farm coordinates'), null=True, blank=True)
    province = models.ForeignKey(Province, on_delete=models.SET_NULL, null=True, blank=True, related_name='farmer_profiles', verbose_name=_('province'))
    city = models.ForeignKey(City, on_delete=models.SET_NULL, null=True, blank=True, related_name='farmer_profiles', verbose_name=_('city'))
    
    # Métadonnées
    bio = models.TextField(_('bio'), blank=True)
    website = models.URLField(_('website'), blank=True)
    social_media = models.JSONField(_('social media'), default=dict, blank=True)
    
    # Images
    profile_photo = models.ImageField(_('profile photo'), upload_to='farmers/profiles/', storage=MinIOUserAvatarsStorage(), blank=True, null=True)
    farm_photos = models.JSONField(_('farm photos'), default=list, blank=True)  # Liste d'URLs d'images de la ferme
    certification_documents = models.JSONField(_('certification documents'), default=list, blank=True)  # Documents de certification
    
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        db_table = 'farmers_farmer_profiles'
        verbose_name = _('Farmer Profile')
        verbose_name_plural = _('Farmer Profiles')

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.organization.name}"


class ProductReview(models.Model):
    """
    Avis sur les produits des agriculteurs
    """
    RATING_CHOICES = [
        (1, '1 étoile'),
        (2, '2 étoiles'),
        (3, '3 étoiles'),
        (4, '4 étoiles'),
        (5, '5 étoiles'),
    ]

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='product_reviews')
    rating = models.PositiveIntegerField(_('rating'), choices=RATING_CHOICES)
    title = models.CharField(_('title'), max_length=255)
    comment = models.TextField(_('comment'))
    is_verified_purchase = models.BooleanField(_('verified purchase'), default=False)
    
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        db_table = 'farmers_product_reviews'
        verbose_name = _('Product Review')
        verbose_name_plural = _('Product Reviews')
        unique_together = ['product', 'buyer']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.product.name} - {self.rating} étoiles par {self.buyer.get_full_name()}"