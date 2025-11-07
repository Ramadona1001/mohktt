from rest_framework import serializers
from .models import SubscriptionPlan


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = ['id', 'name', 'display_name', 'description', 'max_projects',
                  'max_tasks_per_project', 'max_departments', 'max_users',
                  'price', 'price_period', 'features', 'is_active',
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

