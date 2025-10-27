"""
Modèles pour l'application transport
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.iam.models import User
from apps.organizations.models import Organization
from apps.core.storage import MinIOUserAvatarsStorage
from apps.buyers.models import Order


class Vehicle(models.Model):
    """
    Modèle pour les véhicules de transport
    """
    VEHICLE_TYPES = [
        ('truck', _('Truck')),
        ('van', _('Van')),
        ('refrigerated_truck', _('Refrigerated Truck')),
        ('trailer', _('Trailer')),
        ('motorcycle', _('Motorcycle')),
        ('bicycle', _('Bicycle')),
    ]

    STATUS_CHOICES = [
        ('available', _('Available')),
        ('in_use', _('In Use')),
        ('maintenance', _('Maintenance')),
        ('out_of_service', _('Out of Service')),
    ]

    # Relations
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='vehicles')
    
    # Informations du véhicule
    license_plate = models.CharField(_('license plate'), max_length=20, unique=True)
    vehicle_type = models.CharField(_('vehicle type'), max_length=30, choices=VEHICLE_TYPES)
    make = models.CharField(_('make'), max_length=100)
    model = models.CharField(_('model'), max_length=100)
    year = models.PositiveIntegerField(_('year'), validators=[MinValueValidator(1900), MaxValueValidator(2030)])
    
    # Capacités
    max_weight = models.DecimalField(_('max weight'), max_digits=8, decimal_places=2, help_text=_('in kg'))
    max_volume = models.DecimalField(_('max volume'), max_digits=8, decimal_places=2, help_text=_('in m³'))
    max_pallets = models.PositiveIntegerField(_('max pallets'), default=0)
    
    # Équipements
    has_refrigeration = models.BooleanField(_('has refrigeration'), default=False)
    has_tracking = models.BooleanField(_('has tracking'), default=True)
    has_loading_equipment = models.BooleanField(_('has loading equipment'), default=False)
    
    # Statut et localisation
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES, default='available')
    current_location = models.JSONField(_('current location'), default=dict, blank=True)
    
    # Métadonnées
    insurance_number = models.CharField(_('insurance number'), max_length=100, blank=True)
    insurance_expiry = models.DateField(_('insurance expiry'), null=True, blank=True)
    inspection_date = models.DateField(_('inspection date'), null=True, blank=True)
    notes = models.TextField(_('notes'), blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='created_vehicles')

    class Meta:
        db_table = 'transport_vehicles'
        verbose_name = _('Vehicle')
        verbose_name_plural = _('Vehicles')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['organization', 'status']),
            models.Index(fields=['vehicle_type', 'status']),
            models.Index(fields=['license_plate']),
        ]

    def __str__(self):
        return f"{self.make} {self.model} - {self.license_plate}"

    @property
    def is_available(self):
        return self.status == 'available'

    @property
    def current_location_str(self):
        if self.current_location:
            return f"{self.current_location.get('city', '')}, {self.current_location.get('country', '')}"
        return "Non défini"


class TransporterProfile(models.Model):
    """
    Profil étendu pour les transporteurs
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='transporter_profile')
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='transporter_profiles')
    
    # Informations professionnelles
    license_number = models.CharField(_('license number'), max_length=50, blank=True)
    license_expiry = models.DateField(_('license expiry'), null=True, blank=True)
    years_experience = models.PositiveIntegerField(_('years of experience'), default=0)
    
    # Spécialisations
    specializations = models.JSONField(_('specializations'), default=list, blank=True)  # ['refrigerated', 'hazardous', 'oversized']
    service_areas = models.JSONField(_('service areas'), default=list, blank=True)  # ['Libreville', 'Port-Gentil']
    
    # Certifications
    has_hazmat_certification = models.BooleanField(_('hazmat certification'), default=False)
    has_refrigerated_certification = models.BooleanField(_('refrigerated certification'), default=False)
    has_oversized_certification = models.BooleanField(_('oversized certification'), default=False)
    
    # Informations de contact
    phone_emergency = models.CharField(_('emergency phone'), max_length=20, blank=True)
    current_location = models.JSONField(_('current location'), default=dict, blank=True)  # {lat, lng, address}
    
    # Préférences
    preferred_working_hours = models.JSONField(_('preferred working hours'), default=dict, blank=True)
    max_distance_km = models.PositiveIntegerField(_('max distance (km)'), default=500)
    
    # Notes
    notes = models.TextField(_('notes'), blank=True)
    
    # Images
    profile_photo = models.ImageField(_('profile photo'), upload_to='transporters/profiles/', storage=MinIOUserAvatarsStorage(), blank=True, null=True)
    license_documents = models.JSONField(_('license documents'), default=list, blank=True)  # Documents de permis
    vehicle_photos = models.JSONField(_('vehicle photos'), default=list, blank=True)  # Photos des véhicules
    
    # Métadonnées
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        db_table = 'transport_transporter_profiles'
        verbose_name = _('Transporter Profile')
        verbose_name_plural = _('Transporter Profiles')
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.organization.name}"


class Driver(models.Model):
    """
    Modèle pour les chauffeurs
    """
    LICENSE_TYPES = [
        ('B', _('License B (Car)')),
        ('C', _('License C (Truck)')),
        ('CE', _('License CE (Truck + Trailer)')),
        ('D', _('License D (Bus)')),
    ]

    STATUS_CHOICES = [
        ('available', _('Available')),
        ('on_duty', _('On Duty')),
        ('off_duty', _('Off Duty')),
        ('suspended', _('Suspended')),
    ]

    # Relations
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='driver_profile')
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='drivers')
    
    # Informations du chauffeur
    license_number = models.CharField(_('license number'), max_length=50, unique=True)
    license_type = models.CharField(_('license type'), max_length=10, choices=LICENSE_TYPES)
    license_expiry = models.DateField(_('license expiry'))
    
    # Statut et localisation
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES, default='available')
    current_location = models.JSONField(_('current location'), default=dict, blank=True)
    
    # Expérience et qualifications
    years_experience = models.PositiveIntegerField(_('years experience'), default=0)
    has_hazmat_certification = models.BooleanField(_('has hazmat certification'), default=False)
    has_refrigerated_certification = models.BooleanField(_('has refrigerated certification'), default=False)
    
    # Métadonnées
    phone_emergency = models.CharField(_('emergency phone'), max_length=20, blank=True)
    notes = models.TextField(_('notes'), blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        db_table = 'transport_drivers'
        verbose_name = _('Driver')
        verbose_name_plural = _('Drivers')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.full_name} - {self.license_number}"

    @property
    def is_available(self):
        return self.status == 'available'


class Route(models.Model):
    """
    Modèle pour les routes de transport
    """
    # Relations
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='routes')
    
    # Informations de la route
    name = models.CharField(_('name'), max_length=255)
    description = models.TextField(_('description'), blank=True)
    
    # Points de départ et d'arrivée
    origin_city = models.CharField(_('origin city'), max_length=100)
    origin_country = models.CharField(_('origin country'), max_length=100)
    origin_coordinates = models.JSONField(_('origin coordinates'), default=dict, blank=True)
    
    destination_city = models.CharField(_('destination city'), max_length=100)
    destination_country = models.CharField(_('destination country'), max_length=100)
    destination_coordinates = models.JSONField(_('destination coordinates'), default=dict, blank=True)
    
    # Informations de transport
    distance_km = models.DecimalField(_('distance (km)'), max_digits=8, decimal_places=2)
    estimated_duration_hours = models.DecimalField(_('estimated duration (hours)'), max_digits=5, decimal_places=2)
    base_price = models.DecimalField(_('base price'), max_digits=10, decimal_places=2)
    currency = models.CharField(_('currency'), max_length=3, default='XAF')
    
    # Capacités requises
    required_vehicle_type = models.CharField(_('required vehicle type'), max_length=30, blank=True)
    requires_refrigeration = models.BooleanField(_('requires refrigeration'), default=False)
    requires_special_equipment = models.BooleanField(_('requires special equipment'), default=False)
    
    # Statut
    is_active = models.BooleanField(_('active'), default=True)
    
    # Métadonnées
    notes = models.TextField(_('notes'), blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='created_routes')

    class Meta:
        db_table = 'transport_routes'
        verbose_name = _('Route')
        verbose_name_plural = _('Routes')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['organization', 'is_active']),
            models.Index(fields=['origin_city', 'destination_city']),
        ]

    def __str__(self):
        return f"{self.origin_city} → {self.destination_city}"

    @property
    def origin_str(self):
        return f"{self.origin_city}, {self.origin_country}"

    @property
    def destination_str(self):
        return f"{self.destination_city}, {self.destination_country}"


class Shipment(models.Model):
    """
    Modèle pour les expéditions
    """
    STATUS_CHOICES = [
        ('pending', _('Pending')),
        ('assigned', _('Assigned')),
        ('picked_up', _('Picked Up')),
        ('in_transit', _('In Transit')),
        ('delivered', _('Delivered')),
        ('cancelled', _('Cancelled')),
        ('delayed', _('Delayed')),
    ]

    PRIORITY_CHOICES = [
        ('low', _('Low')),
        ('normal', _('Normal')),
        ('high', _('High')),
        ('urgent', _('Urgent')),
    ]

    # Relations
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='shipments')
    route = models.ForeignKey(Route, on_delete=models.PROTECT, related_name='shipments')
    vehicle = models.ForeignKey(Vehicle, on_delete=models.PROTECT, related_name='shipments', null=True, blank=True)
    driver = models.ForeignKey(Driver, on_delete=models.PROTECT, related_name='shipments', null=True, blank=True)
    
    # Informations de l'expédition
    tracking_number = models.CharField(_('tracking number'), max_length=100, unique=True)
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES, default='pending')
    priority = models.CharField(_('priority'), max_length=10, choices=PRIORITY_CHOICES, default='normal')
    
    # Dates importantes
    scheduled_pickup_date = models.DateTimeField(_('scheduled pickup date'))
    scheduled_delivery_date = models.DateTimeField(_('scheduled delivery date'))
    actual_pickup_date = models.DateTimeField(_('actual pickup date'), null=True, blank=True)
    actual_delivery_date = models.DateTimeField(_('actual delivery date'), null=True, blank=True)
    
    # Informations de transport
    total_weight = models.DecimalField(_('total weight'), max_digits=8, decimal_places=2, help_text=_('in kg'))
    total_volume = models.DecimalField(_('total volume'), max_digits=8, decimal_places=2, help_text=_('in m³'))
    transport_cost = models.DecimalField(_('transport cost'), max_digits=10, decimal_places=2)
    currency = models.CharField(_('currency'), max_length=3, default='XAF')
    
    # Instructions spéciales
    special_instructions = models.TextField(_('special instructions'), blank=True)
    requires_signature = models.BooleanField(_('requires signature'), default=True)
    requires_photo_proof = models.BooleanField(_('requires photo proof'), default=False)
    
    # Géolocalisation
    current_location = models.JSONField(_('current location'), default=dict, blank=True)
    delivery_proof = models.JSONField(_('delivery proof'), default=dict, blank=True)
    
    # Métadonnées
    notes = models.TextField(_('notes'), blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='created_shipments')

    class Meta:
        db_table = 'transport_shipments'
        verbose_name = _('Shipment')
        verbose_name_plural = _('Shipments')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'priority']),
            models.Index(fields=['tracking_number']),
            models.Index(fields=['scheduled_pickup_date']),
            models.Index(fields=['scheduled_delivery_date']),
        ]

    def __str__(self):
        return f"Expédition {self.tracking_number} - {self.order.order_number}"

    def save(self, *args, **kwargs):
        if not self.tracking_number:
            # Générer un numéro de suivi unique
            import uuid
            self.tracking_number = f"TRK-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    @property
    def is_delayed(self):
        if self.status == 'delivered':
            return False
        from django.utils import timezone
        return timezone.now() > self.scheduled_delivery_date

    @property
    def progress_percentage(self):
        status_progress = {
            'pending': 0,
            'assigned': 20,
            'picked_up': 40,
            'in_transit': 70,
            'delivered': 100,
            'cancelled': 0,
            'delayed': 50,
        }
        return status_progress.get(self.status, 0)


class ShipmentTracking(models.Model):
    """
    Modèle pour le suivi des expéditions
    """
    # Relations
    shipment = models.ForeignKey(Shipment, on_delete=models.CASCADE, related_name='tracking_events')
    
    # Informations de suivi
    status = models.CharField(_('status'), max_length=20)
    location = models.JSONField(_('location'), default=dict, blank=True)
    description = models.TextField(_('description'))
    
    # Métadonnées
    timestamp = models.DateTimeField(_('timestamp'), auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='tracking_events')

    class Meta:
        db_table = 'transport_shipment_tracking'
        verbose_name = _('Shipment Tracking')
        verbose_name_plural = _('Shipment Tracking Events')
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.shipment.tracking_number} - {self.status}"


class TransportOffer(models.Model):
    """
    Modèle pour les offres de transport
    """
    STATUS_CHOICES = [
        ('pending', _('Pending')),
        ('accepted', _('Accepted')),
        ('rejected', _('Rejected')),
        ('expired', _('Expired')),
    ]

    # Relations
    shipment = models.ForeignKey(Shipment, on_delete=models.CASCADE, related_name='offers')
    transporter = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='transport_offers')
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='offers')
    driver = models.ForeignKey(Driver, on_delete=models.CASCADE, related_name='offers')
    
    # Informations de l'offre
    offered_price = models.DecimalField(_('offered price'), max_digits=10, decimal_places=2)
    currency = models.CharField(_('currency'), max_length=3, default='XAF')
    estimated_pickup_date = models.DateTimeField(_('estimated pickup date'))
    estimated_delivery_date = models.DateTimeField(_('estimated delivery date'))
    
    # Statut
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Métadonnées
    notes = models.TextField(_('notes'), blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    expires_at = models.DateTimeField(_('expires at'))

    class Meta:
        db_table = 'transport_offers'
        verbose_name = _('Transport Offer')
        verbose_name_plural = _('Transport Offers')
        ordering = ['-created_at']

    def __str__(self):
        return f"Offre {self.transporter.name} - {self.shipment.tracking_number}"

    @property
    def is_expired(self):
        from django.utils import timezone
        return timezone.now() > self.expires_at
