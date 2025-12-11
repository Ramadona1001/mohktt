"""
Unit tests for tasks app.
"""
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from factory import Faker, SubFactory
from factory.django import DjangoModelFactory
from accounts.tests import UserFactory, CompanyFactory
from projects.tests import ProjectFactory
from .models import Task, TimeEntry

User = get_user_model()


class TaskFactory(DjangoModelFactory):
    """Factory for creating test tasks."""
    class Meta:
        model = Task
    
    title = Faker('sentence', nb_words=4)
    description = Faker('text', max_nb_chars=200)
    status = 'PENDING'
    priority = 'MEDIUM'
    project = SubFactory(ProjectFactory)
    assigned_to = SubFactory(UserFactory)


@pytest.mark.django_db
class TestTaskModel:
    """Test Task model."""
    
    def test_create_task(self):
        """Test creating a task."""
        task = TaskFactory()
        assert task.id is not None
        assert task.title is not None
    
    def test_task_str(self):
        """Test task string representation."""
        task = TaskFactory(title='Test Task')
        assert str(task) == 'Test Task'


@pytest.mark.django_db
class TestTaskAPI:
    """Test task API endpoints."""
    
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
    
    def test_list_tasks(self, api_client, user):
        """Test listing tasks."""
        api_client.force_authenticate(user=user)
        response = api_client.get('/api/tasks/')
        assert response.status_code == status.HTTP_200_OK
    
    def test_create_task(self, api_client, user):
        """Test creating a task."""
        project = ProjectFactory()
        api_client.force_authenticate(user=user)
        response = api_client.post('/api/tasks/', {
            'title': 'New Task',
            'description': 'Test task description',
            'status': 'PENDING',
            'priority': 'MEDIUM',
            'project': project.id
        })
        assert response.status_code in [status.HTTP_201_CREATED, status.HTTP_400_BAD_REQUEST]

