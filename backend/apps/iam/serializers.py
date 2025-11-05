"""
Serializers pour l'application IAM
"""
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, Membership, Role, Permission
from apps.organizations.models import Organization


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer pour l'inscription d'un utilisateur
    """
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    organization_name = serializers.CharField(write_only=True, required=False)
    organization_type = serializers.ChoiceField(
        choices=[
            ('cooperative', 'Cooperative'),
            ('enterprise', 'Enterprise'),
            ('ngo', 'NGO'),
            ('government', 'Government'),
            ('other', 'Other'),
        ],
        write_only=True,
        required=False
    )
    user_role = serializers.ChoiceField(
        choices=[
            ('farmer', 'Agriculteur'),
            ('buyer', 'Acheteur'),
            ('transporter', 'Transporteur'),
            ('agronomist', 'Agronome'),
            ('admin', 'Administrateur'),
        ],
        write_only=True,
        required=True,
        help_text="Rôle de l'utilisateur dans l'application"
    )

    class Meta:
        model = User
        fields = [
            'username', 'email', 'first_name', 'last_name', 'phone',
            'password', 'password_confirm', 'organization_name', 'organization_type', 'user_role'
        ]
        extra_kwargs = {
            'username': {'required': True},
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Les mots de passe ne correspondent pas.")
        return attrs

    def create(self, validated_data):
        # Extraire les données d'organisation et de rôle
        org_name = validated_data.pop('organization_name', None)
        org_type = validated_data.pop('organization_type', None)
        user_role = validated_data.pop('user_role', None)
        validated_data.pop('password_confirm', None)
        
        # Créer l'utilisateur
        user = User.objects.create_user(**validated_data)
        
        # Créer l'organisation si fournie
        if org_name and org_type:
            organization = Organization.objects.create(
                name=org_name,
                type=org_type,
                country='GA'  # Gabon par défaut
            )
            
            # Déterminer le rôle dans l'organisation basé sur user_role
            membership_role = self._get_membership_role_for_user_role(user_role)
            
            # Créer l'adhésion avec le rôle approprié
            Membership.objects.create(
                user=user,
                organization=organization,
                role=membership_role,
                status='active'
            )
        
        return user
    
    def _get_membership_role_for_user_role(self, user_role):
        """
        Mappe le rôle utilisateur vers le rôle de membership
        CORRIGÉ: Chaque user_role a maintenant son propre rôle de membership spécifique
        """
        # Mapping direct des user_role vers les rôles de membership
        role_mapping = {
            'farmer': 'farmer',           # Agriculteur
            'buyer': 'buyer',             # Acheteur
            'transporter': 'transporter', # Transporteur
            'agronomist': 'agronomist',   # Agronome
            'admin': 'admin'              # Admin
        }
        return role_mapping.get(user_role, 'member')


class UserLoginSerializer(serializers.Serializer):
    """
    Serializer pour la connexion
    """
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError('Identifiants invalides.')
            if not user.is_active:
                raise serializers.ValidationError('Compte désactivé.')
            attrs['user'] = user
        else:
            raise serializers.ValidationError('Email et mot de passe requis.')
        
        return attrs


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer pour le profil utilisateur
    """
    full_name = serializers.ReadOnlyField()
    organizations = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'phone', 'is_verified', 'date_joined', 'organizations'
        ]
        read_only_fields = ['id', 'date_joined', 'is_verified']

    def get_organizations(self, obj):
        memberships = obj.memberships.filter(status='active')
        return [
            {
                'id': membership.organization.id,
                'name': membership.organization.name,
                'type': membership.organization.type,
                'role': membership.role,
                'joined_at': membership.joined_at
            }
            for membership in memberships
        ]


class OrganizationSerializer(serializers.ModelSerializer):
    """
    Serializer pour les organisations
    """
    members_count = serializers.SerializerMethodField()

    class Meta:
        model = Organization
        fields = [
            'id', 'name', 'type', 'country', 'industry', 'plan',
            'is_active', 'created_at', 'members_count'
        ]
        read_only_fields = ['id', 'created_at', 'members_count']

    def get_members_count(self, obj):
        return obj.memberships.filter(status='active').count()


class MembershipSerializer(serializers.ModelSerializer):
    """
    Serializer pour les adhésions
    """
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    organization_name = serializers.CharField(source='organization.name', read_only=True)

    class Meta:
        model = Membership
        fields = [
            'id', 'user', 'organization', 'role', 'status',
            'user_email', 'user_name', 'organization_name',
            'joined_at', 'created_at'
        ]
        read_only_fields = ['id', 'joined_at', 'created_at']


class RoleSerializer(serializers.ModelSerializer):
    """
    Serializer pour les rôles
    """
    permissions = serializers.StringRelatedField(many=True, read_only=True)

    class Meta:
        model = Role
        fields = [
            'id', 'name', 'organization', 'scope', 'description',
            'is_default', 'permissions', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class PermissionSerializer(serializers.ModelSerializer):
    """
    Serializer pour les permissions
    """
    class Meta:
        model = Permission
        fields = ['id', 'code', 'description', 'created_at']
        read_only_fields = ['id', 'created_at']


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
