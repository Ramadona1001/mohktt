from rest_framework import serializers
from .models import Document, DocumentVersion
from projects.serializers import ProjectSerializer
from accounts.serializers import UserSerializer


class DocumentVersionSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    
    class Meta:
        model = DocumentVersion
        fields = ['id', 'document', 'file', 'version_number', 'change_notes',
                  'uploaded_by', 'uploaded_by_name', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']


class DocumentSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source='project.name', read_only=True)
    contractor_name = serializers.CharField(source='contractor.name', read_only=True)
    company_name = serializers.CharField(source='company.name', read_only=True)
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    reviewed_by_name = serializers.CharField(source='reviewed_by.get_full_name', read_only=True)
    versions = DocumentVersionSerializer(many=True, read_only=True)
    is_overdue = serializers.SerializerMethodField()
    days_until_deadline = serializers.SerializerMethodField()
    
    class Meta:
        model = Document
        fields = ['id', 'project', 'project_name', 'contractor', 'contractor_name',
                  'company', 'company_name', 'side', 'title', 'description', 'file',
                  'file_name', 'file_type', 'status', 'uploaded_by', 'uploaded_by_name',
                  'reviewed_by', 'reviewed_by_name', 'review_notes', 'uploaded_at',
                  'review_deadline', 'reviewed_at', 'versions', 'is_overdue',
                  'days_until_deadline']
        read_only_fields = ['id', 'uploaded_at', 'file_type', 'side', 'file_name', 
                           'uploaded_by', 'contractor', 'company', 'status']
    
    def get_is_overdue(self, obj):
        return obj.is_overdue()
    
    def get_days_until_deadline(self, obj):
        return obj.days_until_deadline()


class DocumentListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views."""
    project_name = serializers.CharField(source='project.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Document
        fields = ['id', 'project_name', 'title', 'side', 'status', 'status_display',
                  'uploaded_at', 'review_deadline']

