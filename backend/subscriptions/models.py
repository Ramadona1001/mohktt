from django.db import models


class SubscriptionPlan(models.Model):
    """
    Subscription plan model (Free, Pro, etc.)
    """
    PLAN_TYPES = [
        ('FREE', 'Free'),
        ('PRO', 'Pro'),
        ('ENTERPRISE', 'Enterprise'),
    ]
    
    name = models.CharField(max_length=50, choices=PLAN_TYPES, unique=True)
    display_name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    max_projects = models.IntegerField(default=1, help_text="0 for unlimited")
    max_tasks_per_project = models.IntegerField(default=50, help_text="0 for unlimited")
    max_departments = models.IntegerField(default=3, help_text="0 for unlimited")
    max_users = models.IntegerField(default=10, help_text="0 for unlimited")
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    price_period = models.CharField(
        max_length=20,
        choices=[('MONTHLY', 'Monthly'), ('YEARLY', 'Yearly')],
        default='MONTHLY'
    )
    features = models.JSONField(default=list, help_text="List of feature names")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'subscription_plans'
        ordering = ['price']
    
    def __str__(self):
        return self.display_name
    
    def is_unlimited_projects(self):
        return self.max_projects == 0
    
    def is_unlimited_tasks(self):
        return self.max_tasks_per_project == 0
    
    def is_unlimited_departments(self):
        return self.max_departments == 0
    
    def is_unlimited_users(self):
        return self.max_users == 0

