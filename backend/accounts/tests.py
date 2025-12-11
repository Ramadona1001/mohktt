"""
Unit tests for accounts app.
"""
import pytest
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from factory import Faker, SubFactory
from factory.django import DjangoModelFactory
from .models import Company, Contractor, RolePermission

User = get_user_model()


class UserFactory(DjangoModelFactory):
    """Factory for creating test users."""
    class Meta:
        model = User
    
    username = Faker('user_name')
    email = Faker('email')
    first_name = Faker('first_name')
    last_name = Faker('last_name')
    role = 'WORKER'
    password = 'testpass123'


class CompanyFactory(DjangoModelFactory):
    """Factory for creating test companies."""
    class Meta:
        model = Company
    
    name = Faker('company')
    email = Faker('email')
    phone = Faker('phone_number')
    address = Faker('address')


@pytest.mark.django_db
class TestUserModel:
    """Test User model."""
    
    def test_create_user(self):
        """Test creating a user."""
        user = UserFactory()
        assert user.id is not None
        assert user.username is not None
        assert user.email is not None
    
    def test_user_str(self):
        """Test user string representation."""
        user = UserFactory(first_name='John', last_name='Doe')
        assert str(user) == 'John Doe'
    
    def test_user_password_hashing(self):
        """Test password is hashed."""
        user = UserFactory()
        user.set_password('testpass123')
        assert user.password != 'testpass123'
        assert user.check_password('testpass123')


@pytest.mark.django_db
class TestCompanyModel:
    """Test Company model."""
    
    def test_create_company(self):
        """Test creating a company."""
        company = CompanyFactory()
        assert company.id is not None
        assert company.name is not None
    
    def test_company_str(self):
        """Test company string representation."""
        company = CompanyFactory(name='Test Company')
        assert str(company) == 'Test Company'


@pytest.mark.django_db
class TestAuthenticationAPI:
    """Test authentication API endpoints."""
    
    @pytest.fixture
    def api_client(self):
        """Create API client."""
        return APIClient()
    
    @pytest.fixture
    def user(self):
        """Create test user."""
        user = UserFactory()
        user.set_password('testpass123')
        user.save()
        return user
    
    def test_login_success(self, api_client, user):
        """Test successful login."""
        response = api_client.post('/api/auth/login/', {
            'username': user.username,
            'password': 'testpass123'
        })
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
        assert 'refresh' in response.data
    
    def test_login_invalid_credentials(self, api_client):
        """Test login with invalid credentials."""
        response = api_client.post('/api/auth/login/', {
            'username': 'invalid',
            'password': 'wrongpass'
        })
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_register_user(self, api_client):
        """Test user registration."""
        response = api_client.post('/api/auth/register/register/', {
            'username': 'newuser',
            'email': 'newuser@test.com',
            'password': 'testpass123',
            'first_name': 'New',
            'last_name': 'User',
            'role': 'WORKER'
        })
        assert response.status_code in [status.HTTP_201_CREATED, status.HTTP_200_OK]
    
    def test_get_current_user(self, api_client, user):
        """Test getting current user."""
        api_client.force_authenticate(user=user)
        response = api_client.get('/api/auth/me/')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['username'] == user.username


@pytest.mark.django_db
class TestUserManagementAPI:
    """Test user management API endpoints."""
    
    @pytest.fixture
    def api_client(self):
        """Create API client."""
        return APIClient()
    
    @pytest.fixture
    def admin_user(self):
        """Create admin user."""
        user = UserFactory(role='COMPANY_ADMIN')
        user.set_password('testpass123')
        user.save()
        return user
    
    def test_list_users(self, api_client, admin_user):
        """Test listing users."""
        api_client.force_authenticate(user=admin_user)
        response = api_client.get('/api/auth/users/')
        assert response.status_code == status.HTTP_200_OK
    
    def test_create_user(self, api_client, admin_user):
        """Test creating a user."""
        api_client.force_authenticate(user=admin_user)
        response = api_client.post('/api/auth/users/', {
            'username': 'newuser',
            'email': 'newuser@test.com',
            'password': 'testpass123',
            'first_name': 'New',
            'last_name': 'User',
            'role': 'WORKER'
        })
        assert response.status_code == status.HTTP_201_CREATED

