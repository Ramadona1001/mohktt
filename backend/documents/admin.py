from django.contrib import admin
from .models import Document, DocumentVersion


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ['title', 'project', 'side', 'status', 'uploaded_at', 'review_deadline']
    list_filter = ['status', 'side', 'project']
    search_fields = ['title', 'description']
    date_hierarchy = 'uploaded_at'


@admin.register(DocumentVersion)
class DocumentVersionAdmin(admin.ModelAdmin):
    list_display = ['document', 'version_number', 'uploaded_by', 'uploaded_at']
    list_filter = ['document', 'version_number']

