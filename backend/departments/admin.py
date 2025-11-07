from django.contrib import admin
from .models import Department


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'contractor', 'is_active']
    list_filter = ['contractor', 'is_active']

