from django.contrib import admin
from .models import Project, Blueprint, Pin


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'company', 'contractor', 'status', 'start_date', 'end_date']
    list_filter = ['status', 'company', 'contractor']
    search_fields = ['name', 'description']


@admin.register(Blueprint)
class BlueprintAdmin(admin.ModelAdmin):
    list_display = ['project', 'file_type', 'uploaded_at']
    list_filter = ['file_type']


@admin.register(Pin)
class PinAdmin(admin.ModelAdmin):
    list_display = ['blueprint', 'x', 'y', 'label', 'created_at']
    list_filter = ['blueprint']

