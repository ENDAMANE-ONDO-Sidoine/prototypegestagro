"""
Tests pour les modèles IAM
"""
import pytest
from django.test import TestCase
from django.contrib.auth import get_user_model
from apps.iam.models import Organization, Membership, Role, Permission

User = get_user_model()


class TestUserModel(TestCase):
    """Tests pour le modèle User"""

    def test_create_user(self):
        """Test de création d'un utilisateur"""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        self.assertEqual(user.email, 'test@example.com')
        self.assertEqual(user.username, 'testuser')
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
        self.assertTrue(user.is_active)

    def test_create_superuser(self):
        """Test de création d'un superutilisateur"""
        user = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='adminpass123'
        )
        self.assertTrue(user.is_staff)
        self.assertTrue(user.is_superuser)
        self.assertTrue(user.is_active)

    def test_full_name_property(self):
        """Test de la propriété full_name"""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            first_name='John',
            last_name='Doe'
        )
        self.assertEqual(user.full_name, 'John Doe')

    def test_str_representation(self):
        """Test de la représentation string"""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.assertEqual(str(user), 'test@example.com')


class TestOrganizationModel(TestCase):
    """Tests pour le modèle Organization"""

    def test_create_organization(self):
        """Test de création d'une organisation"""
        org = Organization.objects.create(
            name='Test Organization',
            type='cooperative',
            country='France',
            industry='Agriculture'
        )
        self.assertEqual(org.name, 'Test Organization')
        self.assertEqual(org.type, 'cooperative')
        self.assertEqual(org.country, 'France')
        self.assertTrue(org.is_active)

    def test_str_representation(self):
        """Test de la représentation string"""
        org = Organization.objects.create(
            name='Test Organization',
            type='cooperative',
            country='France'
        )
        self.assertEqual(str(org), 'Test Organization')


class TestMembershipModel(TestCase):
    """Tests pour le modèle Membership"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.organization = Organization.objects.create(
            name='Test Organization',
            type='cooperative',
            country='France'
        )

    def test_create_membership(self):
        """Test de création d'une adhésion"""
        membership = Membership.objects.create(
            user=self.user,
            organization=self.organization,
            role='admin',
            status='active'
        )
        self.assertEqual(membership.user, self.user)
        self.assertEqual(membership.organization, self.organization)
        self.assertEqual(membership.role, 'admin')
        self.assertEqual(membership.status, 'active')

    def test_str_representation(self):
        """Test de la représentation string"""
        membership = Membership.objects.create(
            user=self.user,
            organization=self.organization,
            role='admin',
            status='active'
        )
        expected = f"{self.user.email} - {self.organization.name} (admin)"
        self.assertEqual(str(membership), expected)
