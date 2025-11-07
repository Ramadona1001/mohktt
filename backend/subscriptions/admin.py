from django.contrib import admin
from .models import SubscriptionPlan


@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ['display_name', 'name', 'price', 'price_period', 'max_projects', 'is_active']
    list_filter = ['is_active', 'price_period']

