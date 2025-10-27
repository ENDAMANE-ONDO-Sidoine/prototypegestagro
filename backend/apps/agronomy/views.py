"""
Vues pour l'application agronomy
"""
from rest_framework import status, generics, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Sum, Avg
from django.shortcuts import get_object_or_404
from django.utils import timezone
from apps.core.permissions import IsAgronomistOrAdmin, IsOwnerOrAdmin
from .models import (
    Field, Crop, FieldVisit, Diagnostic, Recommendation, WeatherAlert, AgronomistProfile
)
from .serializers import (
    FieldSerializer, FieldDetailSerializer, CropSerializer, CropDetailSerializer,
    FieldVisitSerializer, DiagnosticSerializer, RecommendationSerializer,
    WeatherAlertSerializer, AgronomistProfileSerializer
)
from apps.organizations.models import Organization


# === VUES POUR LE PROFIL AGRONOME ===

class AgronomistProfileView(generics.RetrieveUpdateAPIView):
    """
    Profil de l'agronome
    """
    serializer_class = AgronomistProfileSerializer
    permission_classes = [IsAgronomistOrAdmin]

    def get_object(self):
        profile, created = AgronomistProfile.objects.get_or_create(
            user=self.request.user,
            defaults={'organization': self.request.user.memberships.first().organization if self.request.user.memberships.exists() else None}
        )
        return profile
    
    def patch(self, request, *args, **kwargs):
        """
        Mise à jour du profil avec gestion de l'upload de photo
        """
        profile = self.get_object()
        
        # Si une photo est fournie, la traiter séparément
        if 'profile_photo' in request.FILES:
            photo_file = request.FILES['profile_photo']
            
            # Supprimer l'ancienne photo s'il existe
            if profile.profile_photo:
                profile.profile_photo.delete()
            
            # Sauvegarder la nouvelle photo
            profile.profile_photo = photo_file
            profile.save()
            
            return Response({
                'message': 'Photo de profil mise à jour avec succès',
                'profile_photo_url': profile.profile_photo.url,
                'profile_id': profile.id
            }, status=status.HTTP_200_OK)
        
        # Sinon, traitement normal du PATCH
        return super().patch(request, *args, **kwargs)


class FieldListView(generics.ListCreateAPIView):
    """
    Vue pour lister et créer des champs
    """
    serializer_class = FieldSerializer
    permission_classes = [IsAgronomistOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['soil_type', 'irrigation_type', 'is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['created_at', 'area_hectares']
    ordering = ['-created_at']

    def get_queryset(self):
        # Un agronome peut voir les champs des organisations dont il est membre
        user_orgs = self.request.user.memberships.filter(
            status='active',
            role__in=['admin', 'manager', 'member']
        ).values_list('organization_id', flat=True)
        
        return Field.objects.filter(organization_id__in=user_orgs)

    def perform_create(self, serializer):
        # Déterminer l'organisation de l'utilisateur
        user_orgs = self.request.user.memberships.filter(
            status='active',
            role__in=['admin', 'manager', 'member']
        ).values_list('organization_id', flat=True)
        
        if not user_orgs:
            raise serializers.ValidationError("Vous devez être membre d'une organisation pour créer des champs.")
        
        organization = Organization.objects.get(id=user_orgs[0])
        serializer.save(organization=organization, created_by=self.request.user)


class FieldDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vue pour les détails d'un champ
    """
    serializer_class = FieldDetailSerializer
    permission_classes = [IsAgronomistOrAdmin]

    def get_queryset(self):
        user_orgs = self.request.user.memberships.filter(
            status='active',
            role__in=['admin', 'manager', 'member']
        ).values_list('organization_id', flat=True)
        
        return Field.objects.filter(organization_id__in=user_orgs).prefetch_related(
            'crops', 'visits', 'recommendations'
        )


# === VUES POUR LES CULTURES ===

class CropListView(generics.ListCreateAPIView):
    """
    Vue pour lister et créer des cultures
    """
    serializer_class = CropSerializer
    permission_classes = [IsAgronomistOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['crop_type', 'status', 'season', 'field']
    search_fields = ['name', 'variety']
    ordering_fields = ['created_at', 'planting_date', 'expected_harvest_date']
    ordering = ['-created_at']

    def get_queryset(self):
        user_orgs = self.request.user.memberships.filter(
            status='active',
            role__in=['admin', 'manager', 'member']
        ).values_list('organization_id', flat=True)
        
        return Crop.objects.filter(field__organization_id__in=user_orgs).select_related('field')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class CropDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vue pour les détails d'une culture
    """
    serializer_class = CropDetailSerializer
    permission_classes = [IsAgronomistOrAdmin]

    def get_queryset(self):
        user_orgs = self.request.user.memberships.filter(
            status='active',
            role__in=['admin', 'manager', 'member']
        ).values_list('organization_id', flat=True)
        
        return Crop.objects.filter(field__organization_id__in=user_orgs).select_related(
            'field'
        ).prefetch_related('diagnostics', 'recommendations')


# === VUES POUR LES VISITES DE TERRAIN ===

class FieldVisitListView(generics.ListCreateAPIView):
    """
    Vue pour lister et créer des visites de terrain
    """
    serializer_class = FieldVisitSerializer
    permission_classes = [IsAgronomistOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['visit_type', 'status', 'field', 'agronomist']
    search_fields = ['notes', 'soil_conditions', 'crop_conditions']
    ordering_fields = ['visit_date', 'created_at']
    ordering = ['-visit_date']

    def get_queryset(self):
        user_orgs = self.request.user.memberships.filter(
            status='active',
            role__in=['admin', 'manager', 'member']
        ).values_list('organization_id', flat=True)
        
        return FieldVisit.objects.filter(
            field__organization_id__in=user_orgs
        ).select_related('field', 'agronomist')

    def perform_create(self, serializer):
        serializer.save(agronomist=self.request.user)


class FieldVisitDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vue pour les détails d'une visite de terrain
    """
    serializer_class = FieldVisitSerializer
    permission_classes = [IsAgronomistOrAdmin]

    def get_queryset(self):
        user_orgs = self.request.user.memberships.filter(
            status='active',
            role__in=['admin', 'manager', 'member']
        ).values_list('organization_id', flat=True)
        
        return FieldVisit.objects.filter(
            field__organization_id__in=user_orgs
        ).select_related('field', 'agronomist')


# === VUES POUR LES DIAGNOSTICS ===

class DiagnosticListView(generics.ListCreateAPIView):
    """
    Vue pour lister et créer des diagnostics
    """
    serializer_class = DiagnosticSerializer
    permission_classes = [IsAgronomistOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['diagnostic_type', 'severity', 'status', 'field', 'crop', 'agronomist']
    search_fields = ['findings', 'causes', 'recommended_treatment']
    ordering_fields = ['diagnosis_date', 'created_at']
    ordering = ['-diagnosis_date']

    def get_queryset(self):
        user_orgs = self.request.user.memberships.filter(
            status='active',
            role__in=['admin', 'manager', 'member']
        ).values_list('organization_id', flat=True)
        
        return Diagnostic.objects.filter(
            field__organization_id__in=user_orgs
        ).select_related('field', 'crop', 'agronomist')

    def perform_create(self, serializer):
        serializer.save(agronomist=self.request.user)


class DiagnosticDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vue pour les détails d'un diagnostic
    """
    serializer_class = DiagnosticSerializer
    permission_classes = [IsAgronomistOrAdmin]

    def get_queryset(self):
        user_orgs = self.request.user.memberships.filter(
            status='active',
            role__in=['admin', 'manager', 'member']
        ).values_list('organization_id', flat=True)
        
        return Diagnostic.objects.filter(
            field__organization_id__in=user_orgs
        ).select_related('field', 'crop', 'agronomist')


# === VUES POUR LES RECOMMANDATIONS ===

class RecommendationListView(generics.ListCreateAPIView):
    """
    Vue pour lister et créer des recommandations
    """
    serializer_class = RecommendationSerializer
    permission_classes = [IsAgronomistOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['recommendation_type', 'priority', 'status', 'field', 'crop', 'agronomist']
    search_fields = ['title', 'description', 'implementation_steps']
    ordering_fields = ['created_at', 'priority', 'recommended_start_date']
    ordering = ['-created_at']

    def get_queryset(self):
        user_orgs = self.request.user.memberships.filter(
            status='active',
            role__in=['admin', 'manager', 'member']
        ).values_list('organization_id', flat=True)
        
        return Recommendation.objects.filter(
            field__organization_id__in=user_orgs
        ).select_related('field', 'crop', 'agronomist')

    def perform_create(self, serializer):
        serializer.save(agronomist=self.request.user)


class RecommendationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vue pour les détails d'une recommandation
    """
    serializer_class = RecommendationSerializer
    permission_classes = [IsAgronomistOrAdmin]

    def get_queryset(self):
        user_orgs = self.request.user.memberships.filter(
            status='active',
            role__in=['admin', 'manager', 'member']
        ).values_list('organization_id', flat=True)
        
        return Recommendation.objects.filter(
            field__organization_id__in=user_orgs
        ).select_related('field', 'crop', 'agronomist')


# === VUES POUR LES ALERTES MÉTÉO ===

class WeatherAlertListView(generics.ListCreateAPIView):
    """
    Vue pour lister et créer des alertes météo
    """
    serializer_class = WeatherAlertSerializer
    permission_classes = [IsAgronomistOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['alert_type', 'severity', 'status', 'organization']
    search_fields = ['title', 'description', 'recommendations']
    ordering_fields = ['alert_date', 'created_at']
    ordering = ['-alert_date']

    def get_queryset(self):
        user_orgs = self.request.user.memberships.filter(
            status='active',
            role__in=['admin', 'manager', 'member']
        ).values_list('organization_id', flat=True)
        
        return WeatherAlert.objects.filter(
            Q(organization_id__in=user_orgs) | Q(field__organization_id__in=user_orgs)
        ).select_related('field', 'organization')

    def perform_create(self, serializer):
        user_orgs = self.request.user.memberships.filter(
            status='active',
            role__in=['admin', 'manager', 'member']
        ).values_list('organization_id', flat=True)
        
        if not user_orgs:
            raise serializers.ValidationError("Vous devez être membre d'une organisation pour créer des alertes.")
        
        organization = Organization.objects.get(id=user_orgs[0])
        serializer.save(organization=organization, created_by=self.request.user)


class WeatherAlertDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vue pour les détails d'une alerte météo
    """
    serializer_class = WeatherAlertSerializer
    permission_classes = [IsAgronomistOrAdmin]

    def get_queryset(self):
        user_orgs = self.request.user.memberships.filter(
            status='active',
            role__in=['admin', 'manager', 'member']
        ).values_list('organization_id', flat=True)
        
        return WeatherAlert.objects.filter(
            Q(organization_id__in=user_orgs) | Q(field__organization_id__in=user_orgs)
        ).select_related('field', 'organization')


# === VUES POUR LES STATISTIQUES ===

@api_view(['GET'])
@permission_classes([IsAgronomistOrAdmin])
def agronomist_dashboard_stats(request):
    """
    Statistiques pour le tableau de bord des agronomes
    """
    user_orgs = request.user.memberships.filter(
        status='active',
        role__in=['admin', 'manager', 'member']
    ).values_list('organization_id', flat=True)
    
    if not user_orgs:
        return Response({'error': 'Aucune organisation trouvée.'}, status=status.HTTP_404_NOT_FOUND)

    # Statistiques des champs
    fields_stats = Field.objects.filter(organization_id__in=user_orgs).aggregate(
        total_fields=Count('id'),
        active_fields=Count('id', filter=Q(is_active=True)),
        total_area_hectares=Sum('area_hectares', filter=Q(is_active=True))
    )

    # Statistiques des cultures
    crops_stats = Crop.objects.filter(field__organization_id__in=user_orgs).aggregate(
        total_crops=Count('id'),
        active_crops=Count('id', filter=Q(status__in=['planted', 'growing', 'flowering', 'fruiting'])),
        harvested_crops=Count('id', filter=Q(status='harvested')),
        total_yield_kg=Sum('actual_yield_kg', filter=Q(status='harvested'))
    )

    # Statistiques des visites
    visits_stats = FieldVisit.objects.filter(field__organization_id__in=user_orgs).aggregate(
        total_visits=Count('id'),
        completed_visits=Count('id', filter=Q(status='completed')),
        scheduled_visits=Count('id', filter=Q(status='scheduled'))
    )

    # Statistiques des diagnostics
    diagnostics_stats = Diagnostic.objects.filter(field__organization_id__in=user_orgs).aggregate(
        total_diagnostics=Count('id'),
        pending_diagnostics=Count('id', filter=Q(status='pending')),
        completed_diagnostics=Count('id', filter=Q(status='completed')),
        critical_issues=Count('id', filter=Q(severity='critical'))
    )

    # Statistiques des recommandations
    recommendations_stats = Recommendation.objects.filter(field__organization_id__in=user_orgs).aggregate(
        total_recommendations=Count('id'),
        pending_recommendations=Count('id', filter=Q(status='pending')),
        completed_recommendations=Count('id', filter=Q(status='completed')),
        urgent_recommendations=Count('id', filter=Q(priority='urgent'))
    )

    return Response({
        'fields': fields_stats,
        'crops': crops_stats,
        'visits': visits_stats,
        'diagnostics': diagnostics_stats,
        'recommendations': recommendations_stats
    })


@api_view(['GET'])
@permission_classes([IsAgronomistOrAdmin])
def field_yield_analysis(request, field_id):
    """
    Analyse des rendements d'un champ
    """
    field = get_object_or_404(Field, id=field_id)
    
    # Vérifier que l'utilisateur peut accéder à ce champ
    user_orgs = request.user.memberships.filter(
        status='active',
        role__in=['admin', 'manager', 'member']
    ).values_list('organization_id', flat=True)
    
    if field.organization_id not in user_orgs:
        return Response(
            {'error': 'Vous n\'avez pas le droit d\'accéder à ce champ.'},
            status=status.HTTP_403_FORBIDDEN
        )

    # Analyse des rendements par culture
    crops_analysis = Crop.objects.filter(field=field, status='harvested').aggregate(
        total_crops=Count('id'),
        total_yield_kg=Sum('actual_yield_kg'),
        average_yield_per_hectare=Avg('actual_yield_kg') / Avg('planted_area_hectares')
    )

    # Rendements par type de culture
    yield_by_crop_type = Crop.objects.filter(
        field=field, status='harvested'
    ).values('crop_type').annotate(
        count=Count('id'),
        total_yield=Sum('actual_yield_kg'),
        avg_yield_per_hectare=Avg('actual_yield_kg') / Avg('planted_area_hectares')
    )

    return Response({
        'field': {
            'id': field.id,
            'name': field.name,
            'area_hectares': field.area_hectares
        },
        'overall_analysis': crops_analysis,
        'yield_by_crop_type': list(yield_by_crop_type)
    })


@api_view(['GET'])
@permission_classes([IsAgronomistOrAdmin])
def active_weather_alerts(request):
    """
    Liste des alertes météo actives
    """
    user_orgs = request.user.memberships.filter(
        status='active',
        role__in=['admin', 'manager', 'member']
    ).values_list('organization_id', flat=True)
    
    alerts = WeatherAlert.objects.filter(
        Q(organization_id__in=user_orgs) | Q(field__organization_id__in=user_orgs),
        status='active',
        valid_until__gte=timezone.now()
    ).select_related('field', 'organization')
    
    serializer = WeatherAlertSerializer(alerts, many=True)
    return Response(serializer.data)
