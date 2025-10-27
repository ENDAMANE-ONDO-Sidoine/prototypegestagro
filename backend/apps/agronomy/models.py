"""
Modèles pour l'application agronomy
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.iam.models import User
from apps.organizations.models import Organization
from apps.farmers.models import Product
from apps.core.storage import MinIOUserAvatarsStorage


class AgronomistProfile(models.Model):
    """
    Profil étendu pour les agronomes
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='agronomist_profile')
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='agronomist_profiles')
    
    # Informations professionnelles
    license_number = models.CharField(_('license number'), max_length=50, blank=True)
    license_expiry = models.DateField(_('license expiry'), null=True, blank=True)
    years_experience = models.PositiveIntegerField(_('years of experience'), default=0)
    
    # Spécialisations
    specializations = models.JSONField(_('specializations'), default=list, blank=True)  # ['soil_analysis', 'crop_management', 'pest_control']
    expertise_areas = models.JSONField(_('expertise areas'), default=list, blank=True)  # ['vegetables', 'fruits', 'grains']
    
    # Certifications
    has_organic_certification = models.BooleanField(_('organic certification'), default=False)
    has_pest_control_certification = models.BooleanField(_('pest control certification'), default=False)
    has_soil_analysis_certification = models.BooleanField(_('soil analysis certification'), default=False)
    
    # Informations de contact
    phone_emergency = models.CharField(_('emergency phone'), max_length=20, blank=True)
    current_location = models.JSONField(_('current location'), default=dict, blank=True)  # {lat, lng, address}
    
    # Préférences
    preferred_working_hours = models.JSONField(_('preferred working hours'), default=dict, blank=True)
    max_travel_distance_km = models.PositiveIntegerField(_('max travel distance (km)'), default=100)
    
    # Notes
    notes = models.TextField(_('notes'), blank=True)
    
    # Images
    profile_photo = models.ImageField(_('profile photo'), upload_to='agronomists/profiles/', storage=MinIOUserAvatarsStorage(), blank=True, null=True)
    certification_documents = models.JSONField(_('certification documents'), default=list, blank=True)  # Documents de certification
    field_photos = models.JSONField(_('field photos'), default=list, blank=True)  # Photos de champs visités
    
    # Métadonnées
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        db_table = 'agronomy_agronomist_profiles'
        verbose_name = _('Agronomist Profile')
        verbose_name_plural = _('Agronomist Profiles')
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.organization.name}"


class Field(models.Model):
    """
    Modèle pour les champs agricoles
    """
    SOIL_TYPES = [
        ('clay', _('Clay')),
        ('sandy', _('Sandy')),
        ('loamy', _('Loamy')),
        ('silty', _('Silty')),
        ('peaty', _('Peaty')),
        ('chalky', _('Chalky')),
    ]

    IRRIGATION_TYPES = [
        ('none', _('None')),
        ('manual', _('Manual')),
        ('drip', _('Drip')),
        ('sprinkler', _('Sprinkler')),
        ('flood', _('Flood')),
    ]

    # Relations
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='fields')
    
    # Informations de base
    name = models.CharField(_('name'), max_length=255)
    description = models.TextField(_('description'), blank=True)
    
    # Localisation
    location = models.JSONField(_('location'), default=dict, blank=True)  # {lat, lng, address}
    area_hectares = models.DecimalField(_('area (hectares)'), max_digits=8, decimal_places=2)
    
    # Caractéristiques du sol
    soil_type = models.CharField(_('soil type'), max_length=20, choices=SOIL_TYPES)
    ph_level = models.DecimalField(_('pH level'), max_digits=3, decimal_places=1, null=True, blank=True)
    organic_matter_percentage = models.DecimalField(_('organic matter %'), max_digits=4, decimal_places=2, null=True, blank=True)
    
    # Irrigation
    irrigation_type = models.CharField(_('irrigation type'), max_length=20, choices=IRRIGATION_TYPES, default='none')
    water_source = models.CharField(_('water source'), max_length=100, blank=True)
    
    # Statut
    is_active = models.BooleanField(_('active'), default=True)
    
    # Métadonnées
    notes = models.TextField(_('notes'), blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='created_fields')

    class Meta:
        db_table = 'agronomy_fields'
        verbose_name = _('Field')
        verbose_name_plural = _('Fields')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.organization.name}"


class Crop(models.Model):
    """
    Modèle pour les cultures
    """
    CROP_TYPES = [
        ('cereal', _('Cereal')),
        ('legume', _('Legume')),
        ('vegetable', _('Vegetable')),
        ('fruit', _('Fruit')),
        ('tuber', _('Tuber')),
        ('spice', _('Spice')),
        ('cash_crop', _('Cash Crop')),
    ]

    SEASONS = [
        ('dry', _('Dry Season')),
        ('rainy', _('Rainy Season')),
        ('all_year', _('All Year')),
    ]

    # Relations
    field = models.ForeignKey(Field, on_delete=models.CASCADE, related_name='crops')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True, related_name='crops')
    
    # Informations de base
    name = models.CharField(_('name'), max_length=255)
    variety = models.CharField(_('variety'), max_length=100, blank=True)
    crop_type = models.CharField(_('crop type'), max_length=20, choices=CROP_TYPES)
    
    # Plantation
    planting_date = models.DateField(_('planting date'))
    expected_harvest_date = models.DateField(_('expected harvest date'))
    actual_harvest_date = models.DateField(_('actual harvest date'), null=True, blank=True)
    
    # Superficie et rendement
    planted_area_hectares = models.DecimalField(_('planted area (hectares)'), max_digits=8, decimal_places=2)
    expected_yield_kg = models.DecimalField(_('expected yield (kg)'), max_digits=10, decimal_places=2, null=True, blank=True)
    actual_yield_kg = models.DecimalField(_('actual yield (kg)'), max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Saison et conditions
    season = models.CharField(_('season'), max_length=20, choices=SEASONS)
    weather_conditions = models.JSONField(_('weather conditions'), default=dict, blank=True)
    
    # Statut
    status = models.CharField(_('status'), max_length=20, choices=[
        ('planted', _('Planted')),
        ('growing', _('Growing')),
        ('flowering', _('Flowering')),
        ('fruiting', _('Fruiting')),
        ('harvested', _('Harvested')),
        ('failed', _('Failed')),
    ], default='planted')
    
    # Métadonnées
    notes = models.TextField(_('notes'), blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='created_crops')

    class Meta:
        db_table = 'agronomy_crops'
        verbose_name = _('Crop')
        verbose_name_plural = _('Crops')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.field.name}"

    @property
    def yield_per_hectare(self):
        if self.actual_yield_kg and self.planted_area_hectares:
            return self.actual_yield_kg / self.planted_area_hectares
        return None


class FieldVisit(models.Model):
    """
    Modèle pour les visites de terrain
    """
    VISIT_TYPES = [
        ('routine', _('Routine Visit')),
        ('inspection', _('Inspection')),
        ('consultation', _('Consultation')),
        ('emergency', _('Emergency')),
        ('harvest_preparation', _('Harvest Preparation')),
    ]

    # Relations
    field = models.ForeignKey(Field, on_delete=models.CASCADE, related_name='visits')
    agronomist = models.ForeignKey(User, on_delete=models.PROTECT, related_name='field_visits')
    
    # Informations de la visite
    visit_type = models.CharField(_('visit type'), max_length=30, choices=VISIT_TYPES)
    visit_date = models.DateTimeField(_('visit date'))
    duration_hours = models.DecimalField(_('duration (hours)'), max_digits=4, decimal_places=2, null=True, blank=True)
    
    # Observations
    weather_conditions = models.JSONField(_('weather conditions'), default=dict, blank=True)
    soil_conditions = models.TextField(_('soil conditions'), blank=True)
    crop_conditions = models.TextField(_('crop conditions'), blank=True)
    pest_disease_observations = models.TextField(_('pest/disease observations'), blank=True)
    
    # Recommandations
    recommendations = models.TextField(_('recommendations'), blank=True)
    next_visit_date = models.DateField(_('next visit date'), null=True, blank=True)
    
    # Photos et documents
    photos = models.JSONField(_('photos'), default=list, blank=True)
    documents = models.JSONField(_('documents'), default=list, blank=True)
    
    # Statut
    status = models.CharField(_('status'), max_length=20, choices=[
        ('scheduled', _('Scheduled')),
        ('in_progress', _('In Progress')),
        ('completed', _('Completed')),
        ('cancelled', _('Cancelled')),
    ], default='scheduled')
    
    # Métadonnées
    notes = models.TextField(_('notes'), blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        db_table = 'agronomy_field_visits'
        verbose_name = _('Field Visit')
        verbose_name_plural = _('Field Visits')
        ordering = ['-visit_date']

    def __str__(self):
        return f"Visite {self.visit_type} - {self.field.name} - {self.visit_date.date()}"


class Diagnostic(models.Model):
    """
    Modèle pour les diagnostics agricoles
    """
    DIAGNOSTIC_TYPES = [
        ('soil_analysis', _('Soil Analysis')),
        ('pest_disease', _('Pest/Disease Diagnosis')),
        ('nutrient_deficiency', _('Nutrient Deficiency')),
        ('yield_analysis', _('Yield Analysis')),
        ('water_quality', _('Water Quality')),
        ('general_health', _('General Health')),
    ]

    SEVERITY_LEVELS = [
        ('low', _('Low')),
        ('moderate', _('Moderate')),
        ('high', _('High')),
        ('critical', _('Critical')),
    ]

    # Relations
    field = models.ForeignKey(Field, on_delete=models.CASCADE, related_name='diagnostics')
    crop = models.ForeignKey(Crop, on_delete=models.CASCADE, related_name='diagnostics', null=True, blank=True)
    agronomist = models.ForeignKey(User, on_delete=models.PROTECT, related_name='diagnostics')
    
    # Informations du diagnostic
    diagnostic_type = models.CharField(_('diagnostic type'), max_length=30, choices=DIAGNOSTIC_TYPES)
    diagnosis_date = models.DateTimeField(_('diagnosis date'))
    severity = models.CharField(_('severity'), max_length=20, choices=SEVERITY_LEVELS)
    
    # Résultats
    findings = models.TextField(_('findings'))
    causes = models.TextField(_('causes'), blank=True)
    impact_assessment = models.TextField(_('impact assessment'), blank=True)
    
    # Traitement recommandé
    recommended_treatment = models.TextField(_('recommended treatment'), blank=True)
    treatment_cost_xaf = models.DecimalField(_('treatment cost (XAF)'), max_digits=10, decimal_places=2, null=True, blank=True)
    treatment_duration_days = models.PositiveIntegerField(_('treatment duration (days)'), null=True, blank=True)
    
    # Suivi
    follow_up_required = models.BooleanField(_('follow up required'), default=False)
    follow_up_date = models.DateField(_('follow up date'), null=True, blank=True)
    
    # Photos et documents
    photos = models.JSONField(_('photos'), default=list, blank=True)
    lab_results = models.JSONField(_('lab results'), default=dict, blank=True)
    
    # Statut
    status = models.CharField(_('status'), max_length=20, choices=[
        ('pending', _('Pending')),
        ('in_progress', _('In Progress')),
        ('completed', _('Completed')),
        ('resolved', _('Resolved')),
    ], default='pending')
    
    # Métadonnées
    notes = models.TextField(_('notes'), blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        db_table = 'agronomy_diagnostics'
        verbose_name = _('Diagnostic')
        verbose_name_plural = _('Diagnostics')
        ordering = ['-diagnosis_date']

    def __str__(self):
        return f"Diagnostic {self.diagnostic_type} - {self.field.name} - {self.diagnosis_date.date()}"


class Recommendation(models.Model):
    """
    Modèle pour les recommandations agronomiques
    """
    RECOMMENDATION_TYPES = [
        ('fertilization', _('Fertilization')),
        ('irrigation', _('Irrigation')),
        ('pest_control', _('Pest Control')),
        ('disease_management', _('Disease Management')),
        ('harvest_timing', _('Harvest Timing')),
        ('crop_rotation', _('Crop Rotation')),
        ('soil_improvement', _('Soil Improvement')),
        ('general_practice', _('General Practice')),
    ]

    PRIORITY_LEVELS = [
        ('low', _('Low')),
        ('medium', _('Medium')),
        ('high', _('High')),
        ('urgent', _('Urgent')),
    ]

    # Relations
    field = models.ForeignKey(Field, on_delete=models.CASCADE, related_name='recommendations')
    crop = models.ForeignKey(Crop, on_delete=models.CASCADE, related_name='recommendations', null=True, blank=True)
    diagnostic = models.ForeignKey(Diagnostic, on_delete=models.CASCADE, related_name='recommendations', null=True, blank=True)
    agronomist = models.ForeignKey(User, on_delete=models.PROTECT, related_name='recommendations')
    
    # Informations de la recommandation
    recommendation_type = models.CharField(_('recommendation type'), max_length=30, choices=RECOMMENDATION_TYPES)
    title = models.CharField(_('title'), max_length=255)
    description = models.TextField(_('description'))
    priority = models.CharField(_('priority'), max_length=20, choices=PRIORITY_LEVELS)
    
    # Détails d'implémentation
    implementation_steps = models.TextField(_('implementation steps'), blank=True)
    required_materials = models.JSONField(_('required materials'), default=list, blank=True)
    estimated_cost_xaf = models.DecimalField(_('estimated cost (XAF)'), max_digits=10, decimal_places=2, null=True, blank=True)
    estimated_duration_days = models.PositiveIntegerField(_('estimated duration (days)'), null=True, blank=True)
    
    # Timing
    recommended_start_date = models.DateField(_('recommended start date'), null=True, blank=True)
    recommended_end_date = models.DateField(_('recommended end date'), null=True, blank=True)
    
    # Suivi
    follow_up_required = models.BooleanField(_('follow up required'), default=True)
    follow_up_date = models.DateField(_('follow up date'), null=True, blank=True)
    
    # Statut
    status = models.CharField(_('status'), max_length=20, choices=[
        ('pending', _('Pending')),
        ('in_progress', _('In Progress')),
        ('completed', _('Completed')),
        ('cancelled', _('Cancelled')),
    ], default='pending')
    
    # Métadonnées
    notes = models.TextField(_('notes'), blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        db_table = 'agronomy_recommendations'
        verbose_name = _('Recommendation')
        verbose_name_plural = _('Recommendations')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.field.name}"


class WeatherAlert(models.Model):
    """
    Modèle pour les alertes météo
    """
    ALERT_TYPES = [
        ('rain', _('Rain Alert')),
        ('drought', _('Drought Alert')),
        ('storm', _('Storm Alert')),
        ('flood', _('Flood Alert')),
        ('pest_risk', _('Pest Risk Alert')),
        ('disease_risk', _('Disease Risk Alert')),
    ]

    SEVERITY_LEVELS = [
        ('low', _('Low')),
        ('moderate', _('Moderate')),
        ('high', _('High')),
        ('extreme', _('Extreme')),
    ]

    # Relations
    field = models.ForeignKey(Field, on_delete=models.CASCADE, related_name='weather_alerts', null=True, blank=True)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='weather_alerts')
    
    # Informations de l'alerte
    alert_type = models.CharField(_('alert type'), max_length=30, choices=ALERT_TYPES)
    severity = models.CharField(_('severity'), max_length=20, choices=SEVERITY_LEVELS)
    title = models.CharField(_('title'), max_length=255)
    description = models.TextField(_('description'))
    
    # Timing
    alert_date = models.DateTimeField(_('alert date'))
    valid_until = models.DateTimeField(_('valid until'))
    
    # Zone géographique
    affected_area = models.JSONField(_('affected area'), default=dict, blank=True)
    
    # Recommandations
    recommendations = models.TextField(_('recommendations'), blank=True)
    
    # Statut
    status = models.CharField(_('status'), max_length=20, choices=[
        ('active', _('Active')),
        ('expired', _('Expired')),
        ('cancelled', _('Cancelled')),
    ], default='active')
    
    # Métadonnées
    source = models.CharField(_('source'), max_length=100, blank=True)
    notes = models.TextField(_('notes'), blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='created_weather_alerts')

    class Meta:
        db_table = 'agronomy_weather_alerts'
        verbose_name = _('Weather Alert')
        verbose_name_plural = _('Weather Alerts')
        ordering = ['-alert_date']

    def __str__(self):
        return f"{self.alert_type} - {self.title} - {self.alert_date.date()}"

    @property
    def is_active(self):
        from django.utils import timezone
        return self.status == 'active' and timezone.now() <= self.valid_until
