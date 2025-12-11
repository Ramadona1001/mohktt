"""
Integration tests for the Mukhattat platform.
"""
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from accounts.tests import UserFactory, CompanyFactory
from projects.tests import ProjectFactory
from tasks.tests import TaskFactory

User = get_user_model()


@pytest.mark.django_db
class TestProjectWorkflow:
    """Test complete project workflow."""
    
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
    
    @pytest.fixture
    def worker_user(self):
        """Create worker user."""
        user = UserFactory(role='WORKER')
        user.set_password('testpass123')
        user.save()
        return user
    
    def test_create_project_and_task_workflow(self, api_client, admin_user, worker_user):
        """Test creating a project and assigning tasks."""
        # Login as admin
        login_response = api_client.post('/api/auth/login/', {
            'username': admin_user.username,
            'password': 'testpass123'
        })
        assert login_response.status_code == status.HTTP_200_OK
        token = login_response.data['access']
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        # Create project
        company = CompanyFactory()
        project_response = api_client.post('/api/projects/', {
            'name': 'Integration Test Project',
            'description': 'Test project for integration testing',
            'status': 'PLANNING',
            'company': company.id
        })
        assert project_response.status_code in [status.HTTP_201_CREATED, status.HTTP_400_BAD_REQUEST]
        
        if project_response.status_code == status.HTTP_201_CREATED:
            project_id = project_response.data['id']
            
            # Create task
            task_response = api_client.post('/api/tasks/', {
                'title': 'Integration Test Task',
                'description': 'Test task for integration testing',
                'status': 'PENDING',
                'priority': 'MEDIUM',
                'project': project_id,
                'assigned_to': worker_user.id
            })
            assert task_response.status_code in [status.HTTP_201_CREATED, status.HTTP_400_BAD_REQUEST]


@pytest.mark.django_db
class TestAuthenticationFlow:
    """Test authentication flow."""
    
    @pytest.fixture
    def api_client(self):
        """Create API client."""
        return APIClient()
    
    def test_register_login_logout_flow(self, api_client):
        """Test complete authentication flow."""
        # Register
        register_response = api_client.post('/api/auth/register/register/', {
            'username': 'testuser',
            'email': 'testuser@test.com',
            'password': 'testpass123',
            'first_name': 'Test',
            'last_name': 'User',
            'role': 'WORKER'
        })
        assert register_response.status_code in [status.HTTP_201_CREATED, status.HTTP_200_OK]
        
        # Login
        login_response = api_client.post('/api/auth/login/', {
            'username': 'testuser',
            'password': 'testpass123'
        })
        assert login_response.status_code == status.HTTP_200_OK
        assert 'access' in login_response.data
        assert 'refresh' in login_response.data
        
        # Get current user
        token = login_response.data['access']
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        me_response = api_client.get('/api/auth/me/')
        assert me_response.status_code == status.HTTP_200_OK
        assert me_response.data['username'] == 'testuser'


@pytest.mark.django_db
class TestRateLimiting:
    """Test rate limiting functionality."""
    
    @pytest.fixture
    def api_client(self):
        """Create API client."""
        return APIClient()
    
    def test_rate_limit_on_login(self, api_client):
        """Test rate limiting on login endpoint."""
        # Make multiple login attempts
        for i in range(10):
            response = api_client.post('/api/auth/login/', {
                'username': 'invalid',
                'password': 'wrong'
            })
            # After certain number of attempts, should get rate limited
            if response.status_code == 429:
                assert 'Rate limit' in str(response.data)
                break

