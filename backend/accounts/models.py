from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator


class User(AbstractUser):
    """
    Custom User model with role-based access control.
    """
    ROLE_CHOICES = [
        ('COMPANY_ADMIN', 'Company Admin'),
        ('CONTRACTOR', 'Contractor'),
        ('WORKER', 'Worker'),
        ('DOCUMENT_CONTROLLER', 'Document Controller'),
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


class Company(models.Model):
    """
    Company model representing a construction company.
    """
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=17, blank=True)
    address = models.TextField(blank=True)
    logo = models.ImageField(upload_to='companies/logos/', blank=True, null=True)
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

