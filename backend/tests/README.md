# Testing Guide

This directory contains unit tests and integration tests for the Mukhattat platform.

## Running Tests

### Install Test Dependencies

```bash
pip install -r requirements.txt
```

### Run All Tests

```bash
# Using pytest (recommended)
pytest

# Using Django test runner
python manage.py test
```

### Run Specific Test Files

```bash
# Run tests for a specific app
pytest accounts/tests.py
pytest projects/tests.py
pytest tasks/tests.py

# Run integration tests
pytest tests/integration_tests.py
```

### Run Tests with Coverage

```bash
pytest --cov=. --cov-report=html --cov-report=term-missing
```

This will generate:
- Terminal coverage report
- HTML coverage report in `htmlcov/index.html`

### Run Tests Verbosely

```bash
pytest -v
```

### Run Tests with Output

```bash
pytest -s
```

## Test Structure

### Unit Tests

- `accounts/tests.py` - User, Company, and authentication tests
- `projects/tests.py` - Project and blueprint tests
- `tasks/tests.py` - Task and time tracking tests

### Integration Tests

- `tests/integration_tests.py` - End-to-end workflow tests

## Writing New Tests

### Example Unit Test

```python
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()

@pytest.mark.django_db
class TestMyFeature:
    @pytest.fixture
    def api_client(self):
        return APIClient()
    
    def test_my_feature(self, api_client):
        response = api_client.get('/api/my-endpoint/')
        assert response.status_code == status.HTTP_200_OK
```

### Example Integration Test

```python
@pytest.mark.django_db
class TestWorkflow:
    def test_complete_workflow(self, api_client):
        # Test multiple steps in sequence
        pass
```

## Test Coverage Goals

- **Unit Tests**: Aim for 80%+ coverage
- **Integration Tests**: Cover all major workflows
- **Critical Paths**: 100% coverage (authentication, payments, etc.)

## Continuous Integration

Tests should be run automatically on:
- Pull requests
- Before merging to main
- Before deployment

