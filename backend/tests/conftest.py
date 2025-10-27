"""
Configuration pytest pour GestAgro
"""
import pytest
from django.test import TestCase
from django.contrib.auth import get_user_model
from apps.iam.models import Organization, Membership

User = get_user_model()


@pytest.fixture
def user():
    """Créer un utilisateur de test"""
    return User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='testpass123',
        first_name='Test',
        last_name='User'
    )


@pytest.fixture
def organization():
    """Créer une organisation de test"""
    return Organization.objects.create(
        name='Test Organization',
        type='cooperative',
        country='France',
        industry='Agriculture'
    )


@pytest.fixture
def membership(user, organization):
    """Créer une adhésion de test"""
    return Membership.objects.create(
        user=user,
        organization=organization,
        role='admin',
        status='active'
    )


@pytest.fixture
def admin_user():
    """Créer un utilisateur admin de test"""
    return User.objects.create_superuser(
        username='admin',
        email='admin@example.com',
        password='adminpass123',
        first_name='Admin',
        last_name='User'
    )
