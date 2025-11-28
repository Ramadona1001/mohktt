from rest_framework import serializers
from .models import Project, Blueprint, Pin
from accounts.serializers import CompanySerializer, ContractorSerializer


class PinSerializer(serializers.ModelSerializer):
    task_count = serializers.SerializerMethodField()
    tasks = serializers.SerializerMethodField()
    
    class Meta:
        model = Pin
        fields = ['id', 'blueprint', 'x', 'y', 'label', 'task_count', 'tasks', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_task_count(self, obj):
        return obj.tasks.count()
    
    def get_tasks(self, obj):
        from tasks.serializers import TaskListSerializer
        tasks = obj.tasks.all()[:5]  # Limit to 5 tasks to avoid large payloads
        return TaskListSerializer(tasks, many=True).data


class BlueprintSerializer(serializers.ModelSerializer):
    pins = PinSerializer(many=True, read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    reviewed_by_name = serializers.CharField(source='reviewed_by.get_full_name', read_only=True)
    is_overdue = serializers.SerializerMethodField()
    days_until_deadline = serializers.SerializerMethodField()
    
    class Meta:
        model = Blueprint
        fields = ['id', 'project', 'project_name', 'file', 'file_type', 'width', 'height',
                  'review_status', 'review_deadline', 'reviewed_by', 'reviewed_by_name',
                  'reviewed_at', 'review_notes', 'uploaded_by', 'uploaded_by_name',
                  'uploaded_at', 'pins', 'is_overdue', 'days_until_deadline']
        read_only_fields = ['id', 'uploaded_at', 'file_type', 'reviewed_at']
    
    def get_is_overdue(self, obj):
        return obj.is_overdue()
    
    def get_days_until_deadline(self, obj):
        return obj.days_until_deadline()


class ProjectSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    contractor_name = serializers.CharField(source='contractor.name', read_only=True)
    consultant_name = serializers.CharField(source='consultant.get_full_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    blueprint = BlueprintSerializer(read_only=True)
    task_count = serializers.SerializerMethodField()
    completed_task_count = serializers.SerializerMethodField()
    progress_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = ['id', 'company', 'company_name', 'contractor', 'contractor_name',
                  'consultant', 'consultant_name', 'name', 'description', 'address',
                  'status', 'start_date', 'end_date', 'estimated_budget', 'actual_budget',
                  'created_by', 'created_by_name', 'blueprint', 'task_count',
                  'completed_task_count', 'progress_percentage', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_task_count(self, obj):
        return obj.tasks.count()
    
    def get_completed_task_count(self, obj):
        return obj.tasks.filter(status='COMPLETED').count()
    
    def get_progress_percentage(self, obj):
        total = self.get_task_count(obj)
        if total == 0:
            return 0
        completed = self.get_completed_task_count(obj)
        return round((completed / total) * 100, 2)


class ProjectListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views."""
    company_name = serializers.CharField(source='company.name', read_only=True)
    contractor_name = serializers.CharField(source='contractor.name', read_only=True)
    progress_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = ['id', 'name', 'company_name', 'contractor_name', 'status',
                  'start_date', 'end_date', 'progress_percentage', 'created_at']
    
    def get_progress_percentage(self, obj):
        total = obj.tasks.count()
        if total == 0:
            return 0
        completed = obj.tasks.filter(status='COMPLETED').count()
        return round((completed / total) * 100, 2)

