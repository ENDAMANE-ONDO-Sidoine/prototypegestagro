"""
Vues pour l'application IAM
"""
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import login, logout
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from .models import User, Membership, Role, Permission
from apps.organizations.models import Organization
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserProfileSerializer,
    OrganizationSerializer, MembershipSerializer, RoleSerializer, PermissionSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer
)
from apps.core.throttles import (
    SignupThrottle, LoginThrottle, PasswordResetThrottle, EmailVerificationThrottle
)
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from apps.core.services.email_service import EmailService
from rest_framework.permissions import AllowAny


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Vue personnalisée pour l'obtention des tokens JWT
    """
    throttle_classes = [LoginThrottle]
    
    def post(self, request, *args, **kwargs):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserProfileSerializer(user).data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserRegistrationView(APIView):
    """
    Vue pour l'inscription d'un utilisateur
    """
    permission_classes = [permissions.AllowAny]
    throttle_classes = [SignupThrottle]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'message': 'Utilisateur créé avec succès',
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserProfileSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(APIView):
    """
    Vue pour le profil utilisateur
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserLogoutView(APIView):
    """
    Vue pour la déconnexion
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response({'error': 'Refresh token requis'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Vérifier que le refresh token est valide
            try:
                token = RefreshToken(refresh_token)
                # Optionnel : blacklister le token (nécessite django-rest-framework-simplejwt[blacklist])
                # token.blacklist()
            except Exception as token_error:
                return Response({'error': f'Refresh token invalide: {str(token_error)}'}, status=status.HTTP_400_BAD_REQUEST)
            
            return Response({'message': 'Déconnexion réussie'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': f'Erreur lors de la déconnexion: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)


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


class MembershipListView(generics.ListCreateAPIView):
    """
    Vue pour lister et créer des adhésions
    """
    serializer_class = MembershipSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Un utilisateur ne peut voir que ses propres adhésions
        return Membership.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, status='pending')


class MembershipDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vue pour les détails d'une adhésion
    """
    serializer_class = MembershipSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Membership.objects.filter(user=self.request.user)


class RoleListView(generics.ListAPIView):
    """
    Vue pour lister les rôles
    """
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [permissions.IsAuthenticated]


class PermissionListView(generics.ListAPIView):
    """
    Vue pour lister les permissions
    """
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [permissions.IsAuthenticated]


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_organizations(request):
    """
    Endpoint pour récupérer les organisations de l'utilisateur
    """
    memberships = request.user.memberships.filter(status='active')
    organizations = [membership.organization for membership in memberships]
    serializer = OrganizationSerializer(organizations, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def join_organization(request):
    """
    Endpoint pour rejoindre une organisation
    """
    organization_id = request.data.get('organization_id')
    role = request.data.get('role', 'member')
    
    try:
        organization = Organization.objects.get(id=organization_id)
        membership, created = Membership.objects.get_or_create(
            user=request.user,
            organization=organization,
            defaults={'role': role, 'status': 'pending'}
        )
        
        if created:
            return Response({
                'message': 'Demande d\'adhésion envoyée',
                'membership': MembershipSerializer(membership).data
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'message': 'Vous êtes déjà membre de cette organisation'
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Organization.DoesNotExist:
        return Response({
            'error': 'Organisation non trouvée'
        }, status=status.HTTP_404_NOT_FOUND)


class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [PasswordResetThrottle]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Réponse générique pour ne pas révéler l'existence de l'email
            return Response({'message': 'Si un compte existe, un email a été envoyé.'})

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_url = f"{request.scheme}://{request.get_host()}/reset-password?uid={uid}&token={token}"

        context = {
            'user': user,
            'reset_url': reset_url,
        }
        # Envoi via service (console backend par défaut en dev)
        EmailService.send_template_email(
            to_email=user.email,
            subject='Réinitialisation de votre mot de passe',
            template_name='emails/auth/password_reset_email.html',
            text_template_name='emails/auth/password_reset_email.txt',
            context=context,
        )
        return Response({'message': 'Si un compte existe, un email a été envoyé.'})


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        uid = serializer.validated_data['uid']
        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']

        try:
            uid_int = int(urlsafe_base64_decode(uid).decode())
            user = User.objects.get(pk=uid_int)
        except Exception:
            return Response({'error': 'Lien invalide.'}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({'error': 'Token invalide ou expiré.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({'message': 'Mot de passe réinitialisé avec succès.'})


class EmailVerificationRequestView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [EmailVerificationThrottle]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email requis.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'message': 'Si un compte existe, un email de vérification a été envoyé.'})

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        verify_url = f"{request.scheme}://{request.get_host()}/verify-email?uid={uid}&token={token}"
        context = {
            'user': user,
            'verify_url': verify_url,
        }
        EmailService.send_template_email(
            to_email=user.email,
            subject='Vérifiez votre adresse email',
            template_name='emails/auth/email_verification.html',
            text_template_name='emails/auth/email_verification.txt',
            context=context,
        )
        return Response({'message': 'Si un compte existe, un email de vérification a été envoyé.'})


class EmailVerificationConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        uid = request.data.get('uid')
        token = request.data.get('token')
        if not uid or not token:
            return Response({'error': 'uid et token requis.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            uid_int = int(urlsafe_base64_decode(uid).decode())
            user = User.objects.get(pk=uid_int)
        except Exception:
            return Response({'error': 'Lien invalide.'}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({'error': 'Token invalide ou expiré.'}, status=status.HTTP_400_BAD_REQUEST)

        user.is_verified = True
        user.save(update_fields=['is_verified'])
        return Response({'message': 'Email vérifié avec succès.'})