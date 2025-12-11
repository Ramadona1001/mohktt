"""
Pytest configuration and fixtures.
"""
import pytest
from django.test import override_settings


@pytest.fixture(scope='session')
def django_db_setup():
    """Setup test database."""
    pass


@pytest.fixture(autouse=True)
def enable_db_access_for_all_tests(db):
    """Enable database access for all tests."""
    pass


@pytest.fixture
def settings():
    """Override settings for tests."""
    with override_settings(
        CACHES={
            'default': {
                'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
            }
        },
        CELERY_TASK_ALWAYS_EAGER=True,
        CELERY_TASK_EAGER_PROPAGATES=True,
    ):
        yield

