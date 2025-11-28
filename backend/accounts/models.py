from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator


class User(AbstractUser):
    """
    Custom User model with role-based access control.
    """
    ROLE_CHOICES = [
        ('COMPANY_ADMIN', 'Company Admin'),
        ('PROJECT_MANAGER', 'Project Manager'),
        ('CONTRACTOR', 'Contractor'),
        ('WORKER', 'Worker'),
        ('DOCUMENT_CONTROLLER', 'Document Controller'),
        ('CONSULTANT', 'Consultant'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
    )
    phone_number = models.CharField(validators=[phone_regex], max_length=17, blank=True)
    company = models.ForeignKey(
        'Company',
        on_delete=models.CASCADE,
        related_name='users',
        null=True,
        blank=True
    )
    contractor = models.ForeignKey(
        'Contractor',
        on_delete=models.SET_NULL,
        related_name='workers',
        null=True,
        blank=True
    )
    department = models.ForeignKey(
        'departments.Department',
        on_delete=models.SET_NULL,
        related_name='members',
        null=True,
        blank=True
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'users'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
    
    @property
    def is_company_admin(self):
        return self.role == 'COMPANY_ADMIN'
    
    @property
    def is_contractor(self):
        return self.role == 'CONTRACTOR'
    
    @property
    def is_worker(self):
        return self.role == 'WORKER'
    
    @property
    def is_document_controller(self):
        return self.role == 'DOCUMENT_CONTROLLER'
    
    @property
    def is_consultant(self):
        return self.role == 'CONSULTANT'
    
    @property
    def is_project_manager(self):
        return self.role == 'PROJECT_MANAGER'


class Company(models.Model):
    """
    Company model representing a construction company.
    """
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=17, blank=True)
    address = models.TextField(blank=True)
    logo = models.ImageField(upload_to='companies/logos/', blank=True, null=True)
    password = models.CharField(max_length=128, blank=True, null=True, help_text="Company login password")
    other_info = models.TextField(blank=True, null=True, help_text="Additional company information")
    subscription_plan = models.ForeignKey(
        'subscriptions.SubscriptionPlan',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='companies'
    )
    subscription_start_date = models.DateTimeField(null=True, blank=True)
    subscription_end_date = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'companies'
        verbose_name_plural = 'Companies'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name


class Contractor(models.Model):
    """
    Contractor model representing a contractor under a company.
    """
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='contractors'
    )
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone_number = models.CharField(max_length=17, blank=True)
    address = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'contractors'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} ({self.company.name})"


class RolePermission(models.Model):
    """
    Model to store role-based permissions dynamically.
    Allows Super Admin to manage permissions for each role.
    """
    ROLE_CHOICES = [
        ('SUPER_ADMIN', 'Super Admin'),
        ('COMPANY_ADMIN', 'Company Admin'),
        ('PROJECT_MANAGER', 'Project Manager'),
        ('CONTRACTOR', 'Contractor'),
        ('WORKER', 'Worker'),
        ('DOCUMENT_CONTROLLER', 'Document Controller'),
        ('CONSULTANT', 'Consultant'),
    ]
    
    PERMISSION_CATEGORIES = [
        ('companies', 'Companies'),
        ('users', 'Users'),
        ('contractors', 'Contractors'),
        ('projects', 'Projects'),
        ('tasks', 'Tasks'),
        ('documents', 'Documents'),
        ('reports', 'Reports'),
        ('settings', 'Settings'),
    ]
    
    PERMISSION_ACTIONS = [
        ('create', 'Create'),
        ('read', 'Read'),
        ('update', 'Update'),
        ('delete', 'Delete'),
        ('activate', 'Activate'),
        ('assign_role', 'Assign Role'),
        ('assign_company', 'Assign Company'),
        ('approve', 'Approve'),
        ('reject', 'Reject'),
        ('view_all', 'View All'),
        ('export', 'Export'),
        ('manage_roles', 'Manage Roles'),
        ('manage_permissions', 'Manage Permissions'),
        ('system_settings', 'System Settings'),
        ('company_settings', 'Company Settings'),
        ('assign', 'Assign'),
        ('upload', 'Upload'),
        ('comment', 'Comment'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    category = models.CharField(max_length=20, choices=PERMISSION_CATEGORIES)
    action = models.CharField(max_length=20, choices=PERMISSION_ACTIONS)
    is_allowed = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'role_permissions'
        unique_together = [['role', 'category', 'action']]
        ordering = ['role', 'category', 'action']
        indexes = [
            models.Index(fields=['role', 'category']),
        ]
    
    def __str__(self):
        return f"{self.get_role_display()} - {self.get_category_display()} - {self.get_action_display()}"

