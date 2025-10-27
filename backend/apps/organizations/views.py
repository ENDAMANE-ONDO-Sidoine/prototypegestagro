"""
Vues pour l'application organizations
"""
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
from .models import Organization
from .serializers import OrganizationSerializer


class OrganizationListView(generics.ListCreateAPIView):
    """
    Vue pour lister et créer des organisations
    """
    queryset = Organization.objects.filter(is_active=True)
    serializer_class = OrganizationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # L'utilisateur qui crée l'organisation devient automatiquement admin
        organization = serializer.save()
        
        # Créer l'adhésion admin
        from apps.iam.models import Membership
        Membership.objects.create(
            user=self.request.user,
            organization=organization,
            role='admin',
            status='active'
        )


class OrganizationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vue pour les détails d'une organisation
    """
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Un utilisateur ne peut voir que les organisations dont il est membre
        user_orgs = self.request.user.memberships.filter(status='active').values_list('organization_id', flat=True)
        return Organization.objects.filter(id__in=user_orgs)

    def perform_update(self, serializer):
        # Seuls les admins peuvent modifier l'organisation
        organization = self.get_object()
        membership = self.request.user.memberships.filter(
            organization=organization,
            role='admin',
            status='active'
        ).first()
        
        if not membership:
            return Response(
                {'error': 'Seuls les administrateurs peuvent modifier cette organisation'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer.save()

    def perform_destroy(self, instance):
        # Seuls les admins peuvent supprimer l'organisation
        membership = self.request.user.memberships.filter(
            organization=instance,
            role='admin',
            status='active'
        ).first()
        
        if not membership:
            return Response(
                {'error': 'Seuls les administrateurs peuvent supprimer cette organisation'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Désactiver au lieu de supprimer
        instance.is_active = False
        instance.save()


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def upload_organization_logo(request, organization_id):
    """
    Upload du logo d'une organisation
    """
    organization = get_object_or_404(Organization, id=organization_id)
    
    # Vérifier que l'utilisateur est admin de cette organisation
    membership = request.user.memberships.filter(
        organization=organization,
        role='admin',
        status='active'
    ).first()
    
    if not membership:
        return Response(
            {'error': 'Seuls les administrateurs peuvent modifier le logo de cette organisation'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    if 'logo' not in request.FILES:
        return Response(
            {'error': 'Aucun fichier logo fourni'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    logo_file = request.FILES['logo']
    
    # Supprimer l'ancien logo s'il existe
    if organization.logo:
        organization.logo.delete()
    
    # Sauvegarder le nouveau logo
    organization.logo = logo_file
    organization.save()
    
    return Response({
        'message': 'Logo uploadé avec succès',
        'logo_url': organization.logo.url,
        'organization_id': organization.id
    }, status=status.HTTP_200_OK)