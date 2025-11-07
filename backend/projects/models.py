from django.db import models
from django.core.validators import FileExtensionValidator
from accounts.models import Company, Contractor


class Project(models.Model):
    """
    Project model representing a real estate construction project.
    """
    STATUS_CHOICES = [
        ('PLANNING', 'Planning'),
        ('IN_PROGRESS', 'In Progress'),
        ('ON_HOLD', 'On Hold'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='projects'
    )
    contractor = models.ForeignKey(
        Contractor,
        on_delete=models.SET_NULL,
        related_name='projects',
        null=True,
        blank=True
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    address = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PLANNING')
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    estimated_budget = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    created_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_projects'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'projects'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} ({self.company.name})"


class Blueprint(models.Model):
    """
    Blueprint model for project blueprints (PDF/JPG/PNG).
    """
    project = models.OneToOneField(
        Project,
        on_delete=models.CASCADE,
        related_name='blueprint'
    )
    file = models.FileField(
        upload_to='blueprints/',
        validators=[
            FileExtensionValidator(allowed_extensions=['pdf', 'jpg', 'jpeg', 'png'])
        ]
    )
    file_type = models.CharField(max_length=10, blank=True)
    width = models.IntegerField(null=True, blank=True, help_text="Image width in pixels")
    height = models.IntegerField(null=True, blank=True, help_text="Image height in pixels")
    uploaded_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='uploaded_blueprints'
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'blueprints'
    
    def __str__(self):
        return f"Blueprint for {self.project.name}"


class Pin(models.Model):
    """
    Pin model representing a task location on the blueprint.
    """
    blueprint = models.ForeignKey(
        Blueprint,
        on_delete=models.CASCADE,
        related_name='pins'
    )
    x = models.FloatField(help_text="X coordinate (0-1 normalized)")
    y = models.FloatField(help_text="Y coordinate (0-1 normalized)")
    label = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'pins'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Pin ({self.x}, {self.y}) - {self.label or 'No label'}"

