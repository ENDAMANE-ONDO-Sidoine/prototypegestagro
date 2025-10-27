"""
Modèles pour l'application buyers (acheteurs)
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.iam.models import User
from apps.organizations.models import Organization
from apps.farmers.models import Category
from apps.farmers.models import Product
from apps.core.storage import MinIOUserAvatarsStorage


class Cart(models.Model):
    """
    Panier d'achat pour les acheteurs
    """
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='carts')
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='carts')
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        db_table = 'buyers_carts'
        verbose_name = _('Cart')
        verbose_name_plural = _('Carts')
        unique_together = ['buyer', 'organization']

    def __str__(self):
        return f"Panier de {self.buyer.get_full_name()} - {self.organization.name}"

    @property
    def total_items(self):
        return sum(item.quantity for item in self.items.all())

    @property
    def total_amount(self):
        return sum(item.total_price for item in self.items.all())


class CartItem(models.Model):
    """
    Articles dans le panier
    """
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='cart_items')
    quantity = models.PositiveIntegerField(_('quantity'), validators=[MinValueValidator(1)])
    unit_price = models.DecimalField(_('unit price'), max_digits=10, decimal_places=2)
    total_price = models.DecimalField(_('total price'), max_digits=10, decimal_places=2)
    added_at = models.DateTimeField(_('added at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        db_table = 'buyers_cart_items'
        verbose_name = _('Cart Item')
        verbose_name_plural = _('Cart Items')
        unique_together = ['cart', 'product']

    def __str__(self):
        return f"{self.product.name} x{self.quantity}"

    def save(self, *args, **kwargs):
        self.total_price = self.quantity * self.unit_price
        super().save(*args, **kwargs)


class Order(models.Model):
    """
    Commande d'achat
    """
    STATUS_CHOICES = [
        ('pending', _('Pending')),
        ('confirmed', _('Confirmed')),
        ('processing', _('Processing')),
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
    buyer = models.ForeignKey(User, on_delete=models.PROTECT, related_name='orders_as_buyer')
    seller = models.ForeignKey(Organization, on_delete=models.PROTECT, related_name='orders_as_seller')
    
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
        db_table = 'buyers_orders'
        verbose_name = _('Order')
        verbose_name_plural = _('Orders')
        ordering = ['-created_at']

    def __str__(self):
        return f"Commande {self.order_number} - {self.buyer.get_full_name()}"

    @property
    def is_paid(self):
        return self.payment_status == 'paid'

    @property
    def is_delivered(self):
        return self.status == 'delivered'


class OrderItem(models.Model):
    """
    Articles dans une commande
    """
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name='order_items')
    quantity = models.PositiveIntegerField(_('quantity'), validators=[MinValueValidator(1)])
    unit_price = models.DecimalField(_('unit price'), max_digits=10, decimal_places=2)
    total_price = models.DecimalField(_('total price'), max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'buyers_order_items'
        verbose_name = _('Order Item')
        verbose_name_plural = _('Order Items')

    def __str__(self):
        return f"{self.product.name} x{self.quantity} - {self.order.order_number}"

    def save(self, *args, **kwargs):
        self.total_price = self.quantity * self.unit_price
        super().save(*args, **kwargs)


class BuyerProfile(models.Model):
    """
    Profil étendu pour les acheteurs
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='buyer_profile')
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='buyer_profiles')
    
    # Informations commerciales
    business_type = models.CharField(_('business type'), max_length=100, blank=True)
    business_license = models.CharField(_('business license'), max_length=100, blank=True)
    tax_number = models.CharField(_('tax number'), max_length=100, blank=True)
    
    # Préférences d'achat
    preferred_categories = models.ManyToManyField(Category, blank=True, related_name='buyer_preferences')
    preferred_suppliers = models.ManyToManyField(Organization, blank=True, related_name='preferred_by_buyers')
    budget_range = models.JSONField(_('budget range'), default=dict, blank=True)
    
    # Informations de livraison
    default_shipping_address = models.JSONField(_('default shipping address'), null=True, blank=True)
    delivery_preferences = models.JSONField(_('delivery preferences'), default=dict, blank=True)
    
    # Métadonnées
    bio = models.TextField(_('bio'), blank=True)
    website = models.URLField(_('website'), blank=True)
    social_media = models.JSONField(_('social media'), default=dict, blank=True)
    
    # Images
    profile_photo = models.ImageField(_('profile photo'), upload_to='buyers/profiles/', storage=MinIOUserAvatarsStorage(), blank=True, null=True)
    business_documents = models.JSONField(_('business documents'), default=list, blank=True)  # Documents commerciaux
    
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        db_table = 'buyers_buyer_profiles'
        verbose_name = _('Buyer Profile')
        verbose_name_plural = _('Buyer Profiles')

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.organization.name}"


class Wishlist(models.Model):
    """
    Liste de souhaits pour les acheteurs
    """
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wishlists')
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='wishlists')
    name = models.CharField(_('name'), max_length=255, default='Ma liste de souhaits')
    is_public = models.BooleanField(_('public'), default=False)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        db_table = 'buyers_wishlists'
        verbose_name = _('Wishlist')
        verbose_name_plural = _('Wishlists')
        unique_together = ['buyer', 'organization', 'name']

    def __str__(self):
        return f"{self.name} - {self.buyer.get_full_name()}"


class WishlistItem(models.Model):
    """
    Articles dans la liste de souhaits
    """
    wishlist = models.ForeignKey(Wishlist, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='wishlist_items')
    added_at = models.DateTimeField(_('added at'), auto_now_add=True)

    class Meta:
        db_table = 'buyers_wishlist_items'
        verbose_name = _('Wishlist Item')
        verbose_name_plural = _('Wishlist Items')
        unique_together = ['wishlist', 'product']

    def __str__(self):
        return f"{self.product.name} dans {self.wishlist.name}"