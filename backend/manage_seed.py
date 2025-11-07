"""
Management command to seed the database.
Run with: python manage.py shell < manage_seed.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mukhattat.settings')
django.setup()

from accounts.models import User, Company, Contractor
from departments.models import Department
from projects.models import Project
from tasks.models import Task
from subscriptions.models import SubscriptionPlan
from django.utils import timezone
from datetime import timedelta

# Create subscription plans
free_plan, _ = SubscriptionPlan.objects.get_or_create(
    name='FREE',
    defaults={
        'display_name': 'Free Plan',
        'description': 'Basic plan for small projects',
        'max_projects': 1,
        'max_tasks_per_project': 50,
        'max_departments': 3,
        'max_users': 10,
        'price': 0.00,
        'features': ['Basic task tracking', 'Blueprint upload', '1 project']
    }
)

pro_plan, _ = SubscriptionPlan.objects.get_or_create(
    name='PRO',
    defaults={
        'display_name': 'Pro Plan',
        'description': 'Advanced plan for growing businesses',
        'max_projects': 0,
        'max_tasks_per_project': 0,
        'max_departments': 0,
        'max_users': 0,
        'price': 99.00,
        'features': ['Unlimited projects', 'Advanced reports', 'Priority support', 'All features']
    }
)

# Create company
company, _ = Company.objects.get_or_create(
    email='demo@company.com',
    defaults={
        'name': 'Demo Construction Company',
        'phone_number': '+1234567890',
        'address': '123 Construction St, City, Country',
        'subscription_plan': pro_plan,
        'subscription_start_date': timezone.now(),
        'subscription_end_date': timezone.now() + timedelta(days=365),
        'is_active': True
    }
)

# Create company admin
admin_user, _ = User.objects.get_or_create(
    username='admin',
    defaults={
        'email': 'admin@company.com',
        'first_name': 'Company',
        'last_name': 'Admin',
        'role': 'COMPANY_ADMIN',
        'company': company,
        'is_active': True,
        'is_staff': True,
        'is_superuser': True
    }
)
if not admin_user.check_password('admin123'):
    admin_user.set_password('admin123')
    admin_user.save()

# Create contractor
contractor, _ = Contractor.objects.get_or_create(
    company=company,
    email='contractor@example.com',
    defaults={
        'name': 'ABC Contractors',
        'phone_number': '+1234567891',
        'address': '456 Contractor Ave, City, Country',
        'is_active': True
    }
)

# Create contractor user
contractor_user, _ = User.objects.get_or_create(
    username='contractor',
    defaults={
        'email': 'contractor@example.com',
        'first_name': 'John',
        'last_name': 'Contractor',
        'role': 'CONTRACTOR',
        'company': company,
        'contractor': contractor,
        'is_active': True
    }
)
if not contractor_user.check_password('contractor123'):
    contractor_user.set_password('contractor123')
    contractor_user.save()

# Create departments
plumbing_dept, _ = Department.objects.get_or_create(
    contractor=contractor,
    name='Plumbing',
    defaults={
        'description': 'Plumbing department',
        'is_active': True
    }
)

electrical_dept, _ = Department.objects.get_or_create(
    contractor=contractor,
    name='Electrical',
    defaults={
        'description': 'Electrical department',
        'is_active': True
    }
)

# Create workers
worker1, _ = User.objects.get_or_create(
    username='worker1',
    defaults={
        'email': 'worker1@example.com',
        'first_name': 'Ahmed',
        'last_name': 'Worker',
        'role': 'WORKER',
        'company': company,
        'contractor': contractor,
        'department': plumbing_dept,
        'is_active': True
    }
)
if not worker1.check_password('worker123'):
    worker1.set_password('worker123')
    worker1.save()

worker2, _ = User.objects.get_or_create(
    username='worker2',
    defaults={
        'email': 'worker2@example.com',
        'first_name': 'Mohammed',
        'last_name': 'Engineer',
        'role': 'WORKER',
        'company': company,
        'contractor': contractor,
        'department': electrical_dept,
        'is_active': True
    }
)
if not worker2.check_password('worker123'):
    worker2.set_password('worker123')
    worker2.save()

# Create project
project, _ = Project.objects.get_or_create(
    company=company,
    name='Residential Building Project',
    defaults={
        'contractor': contractor,
        'description': 'A new residential building construction project',
        'address': '789 Project Site, City, Country',
        'status': 'IN_PROGRESS',
        'start_date': timezone.now().date(),
        'end_date': (timezone.now() + timedelta(days=180)).date(),
        'estimated_budget': 500000.00,
        'created_by': admin_user
    }
)

# Create tasks
task1, _ = Task.objects.get_or_create(
    project=project,
    title='Install Main Water Line',
    defaults={
        'department': plumbing_dept,
        'assigned_to': worker1,
        'description': 'Install the main water supply line for the building',
        'status': 'IN_PROGRESS',
        'priority': 'HIGH',
        'estimated_hours': 8.0,
        'due_date': timezone.now() + timedelta(days=5),
        'created_by': contractor_user
    }
)

task2, _ = Task.objects.get_or_create(
    project=project,
    title='Install Electrical Panel',
    defaults={
        'department': electrical_dept,
        'assigned_to': worker2,
        'description': 'Install the main electrical panel',
        'status': 'PENDING',
        'priority': 'HIGH',
        'estimated_hours': 12.0,
        'due_date': timezone.now() + timedelta(days=7),
        'created_by': contractor_user
    }
)

task3, _ = Task.objects.get_or_create(
    project=project,
    title='Install Bathroom Fixtures',
    defaults={
        'department': plumbing_dept,
        'assigned_to': worker1,
        'description': 'Install all bathroom fixtures',
        'status': 'PENDING',
        'priority': 'MEDIUM',
        'estimated_hours': 16.0,
        'due_date': timezone.now() + timedelta(days=10),
        'created_by': contractor_user
    }
)

print("✅ Seed data created successfully!")
print("\n📋 Default Users:")
print("   Company Admin: username='admin', password='admin123'")
print("   Contractor: username='contractor', password='contractor123'")
print("   Worker 1: username='worker1', password='worker123'")
print("   Worker 2: username='worker2', password='worker123'")

