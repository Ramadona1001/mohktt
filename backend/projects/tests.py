"""
Unit tests for projects app.
"""
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from factory import Faker, SubFactory
from factory.django import DjangoModelFactory
from accounts.tests import UserFactory, CompanyFactory
from .models import Project, Blueprint, Pin

User = get_user_model()


class ProjectFactory(DjangoModelFactory):
    """Factory for creating test projects."""
    class Meta:
        model = Project
    
    name = Faker('sentence', nb_words=3)
    description = Faker('text', max_nb_chars=200)
    status = 'PLANNING'
    company = SubFactory(CompanyFactory)


@pytest.mark.django_db
class TestProjectModel:
    """Test Project model."""
    
    def test_create_project(self):
        """Test creating a project."""
        project = ProjectFactory()
        assert project.id is not None
        assert project.name is not None
    
    def test_project_str(self):
        """Test project string representation."""
        project = ProjectFactory(name='Test Project')
        assert str(project) == 'Test Project'


@pytest.mark.django_db
class TestProjectAPI:
    """Test project API endpoints."""
    
    @pytest.fixture
    def api_client(self):
        """Create API client."""
        return APIClient()
    
    @pytest.fixture
    def user(self):
        """Create test user."""
        user = UserFactory(role='COMPANY_ADMIN')
        user.set_password('testpass123')
        user.save()
        return user
    
    @pytest.fixture
    def project(self, user):
        """Create test project."""
        company = CompanyFactory()
        project = ProjectFactory(company=company)
        return project
    
    def test_list_projects(self, api_client, user):
        """Test listing projects."""
        api_client.force_authenticate(user=user)
        response = api_client.get('/api/projects/')
        assert response.status_code == status.HTTP_200_OK
    
    def test_create_project(self, api_client, user):
        """Test creating a project."""
        company = CompanyFactory()
        api_client.force_authenticate(user=user)
        response = api_client.post('/api/projects/', {
            'name': 'New Project',
            'description': 'Test project description',
            'status': 'PLANNING',
            'company': company.id
        })
        assert response.status_code in [status.HTTP_201_CREATED, status.HTTP_400_BAD_REQUEST]
    
    def test_get_project_detail(self, api_client, user, project):
        """Test getting project details."""
        api_client.force_authenticate(user=user)
        response = api_client.get(f'/api/projects/{project.id}/')
        assert response.status_code == status.HTTP_200_OK

