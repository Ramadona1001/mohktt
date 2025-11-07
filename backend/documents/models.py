from django.db import models
from django.utils import timezone
from django.conf import settings
from accounts.models import Company, Contractor
from projects.models import Project


class Document(models.Model):
    """
    Document model for project-related documents.
    """
    STATUS_CHOICES = [
        ('PENDING', 'Pending Review'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('EXPIRED', 'Expired'),
        ('MODIFICATION_REQUESTED', 'Modification Requested'),
    ]
    
    SIDE_CHOICES = [
        ('CONTRACTOR', 'Contractor'),
        ('COMPANY', 'Company/Owner'),
    ]
    
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='documents'
    )
    contractor = models.ForeignKey(
        Contractor,
        on_delete=models.CASCADE,
        related_name='documents',
        null=True,
        blank=True
    )
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='documents',
        null=True,
        blank=True
    )
    side = models.CharField(max_length=20, choices=SIDE_CHOICES)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to='documents/')
    file_name = models.CharField(max_length=255)
    file_type = models.CharField(max_length=50, blank=True)
    status = models.CharField(max_length=25, choices=STATUS_CHOICES, default='PENDING')
    uploaded_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='uploaded_documents'
    )
    reviewed_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_documents'
    )
    review_notes = models.TextField(blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    review_deadline = models.DateTimeField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'documents'
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"{self.title} - {self.project.name}"
    
    def save(self, *args, **kwargs):
        # Set review deadline on upload
        if not self.review_deadline and self.status == 'PENDING':
            from datetime import timedelta
            review_days = getattr(settings, 'DOCUMENT_REVIEW_TIMER_DAYS', 10)
            self.review_deadline = timezone.now() + timedelta(days=review_days)
        super().save(*args, **kwargs)
    
    def is_overdue(self):
        """Check if document review is overdue."""
        if self.review_deadline and self.status == 'PENDING':
            return timezone.now() > self.review_deadline
        return False
    
    def days_until_deadline(self):
        """Get days until review deadline."""
        if self.review_deadline:
            delta = self.review_deadline - timezone.now()
            return max(0, delta.days)
        return None


class DocumentVersion(models.Model):
    """
    Document version model for tracking document modifications.
    """
    document = models.ForeignKey(
        Document,
        on_delete=models.CASCADE,
        related_name='versions'
    )
    file = models.FileField(upload_to='documents/versions/')
    version_number = models.IntegerField()
    change_notes = models.TextField(blank=True)
    uploaded_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'document_versions'
        ordering = ['-version_number']
        unique_together = ['document', 'version_number']
    
    def __str__(self):
        return f"{self.document.title} - v{self.version_number}"

