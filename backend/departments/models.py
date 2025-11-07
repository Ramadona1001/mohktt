from django.db import models
from accounts.models import Contractor


class Department(models.Model):
    """
    Department model representing teams within a contractor (e.g., Plumbing, Electrical).
    """
    contractor = models.ForeignKey(
        Contractor,
        on_delete=models.CASCADE,
        related_name='departments'
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'departments'
        ordering = ['name']
        unique_together = ['contractor', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.contractor.name})"

