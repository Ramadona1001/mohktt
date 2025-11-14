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
    consultant = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='consulted_projects',
        limit_choices_to={'role': 'CONSULTANT'}
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    address = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PLANNING')
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    estimated_budget = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    actual_budget = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
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
    REVIEW_STATUS_CHOICES = [
        ('PENDING', 'Pending Review'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('MODIFICATION_REQUESTED', 'Modification Requested'),
        ('EXPIRED', 'Review Expired'),
    ]
    
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
    review_status = models.CharField(
        max_length=25,
        choices=REVIEW_STATUS_CHOICES,
        default='PENDING'
    )
    review_deadline = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_blueprints'
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    review_notes = models.TextField(blank=True)
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
    
    def is_overdue(self):
        """Check if blueprint review is overdue."""
        if self.review_deadline and self.review_status == 'PENDING':
            from django.utils import timezone
            return timezone.now() > self.review_deadline
        return False
    
    def days_until_deadline(self):
        """Get days until review deadline."""
        if self.review_deadline:
            from django.utils import timezone
            delta = self.review_deadline - timezone.now()
            return max(0, delta.days)
        return None


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

