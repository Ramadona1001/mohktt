from rest_framework import serializers
from .models import Task, TimeEntry, TaskComment, TaskAttachment
from projects.serializers import ProjectSerializer, PinSerializer
from departments.serializers import DepartmentSerializer
from accounts.serializers import UserSerializer


class TaskAttachmentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    
    class Meta:
        model = TaskAttachment
        fields = ['id', 'task', 'file', 'file_name', 'file_type', 'uploaded_by',
                  'uploaded_by_name', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at', 'file_type']


class TaskCommentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = TaskComment
        fields = ['id', 'task', 'user', 'user_name', 'user_username', 'content',
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class TimeEntrySerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    task_title = serializers.CharField(source='task.title', read_only=True)
    
    class Meta:
        model = TimeEntry
        fields = ['id', 'task', 'task_title', 'user', 'user_name', 'hours', 'date',
                  'notes', 'created_at']
        read_only_fields = ['id', 'created_at']


class TaskSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source='project.name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    pin = PinSerializer(read_only=True)
    comments = TaskCommentSerializer(many=True, read_only=True)
    attachments = TaskAttachmentSerializer(many=True, read_only=True)
    time_entries = TimeEntrySerializer(many=True, read_only=True)
    total_logged_hours = serializers.SerializerMethodField()
    is_overdue = serializers.SerializerMethodField()
    
    class Meta:
        model = Task
        fields = ['id', 'project', 'project_name', 'pin', 'department', 'department_name',
                  'assigned_to', 'assigned_to_name', 'title', 'description', 'status',
                  'priority', 'estimated_hours', 'actual_hours', 'total_logged_hours',
                  'due_date', 'started_at', 'completed_at', 'created_by', 'created_by_name',
                  'comments', 'attachments', 'time_entries', 'is_overdue',
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_total_logged_hours(self, obj):
        return sum(entry.hours for entry in obj.time_entries.all())
    
    def get_is_overdue(self, obj):
        if obj.due_date and obj.status not in ['COMPLETED']:
            from django.utils import timezone
            from django.utils.dateparse import parse_datetime
            # Handle both datetime objects and string representations
            due_date = obj.due_date
            if isinstance(due_date, str):
                due_date = parse_datetime(due_date)
            if due_date:
                return timezone.now() > due_date
        return False


class TaskListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views."""
    project_name = serializers.CharField(source='project.name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    
    class Meta:
        model = Task
        fields = ['id', 'project_name', 'title', 'status', 'priority', 'department_name',
                  'assigned_to_name', 'due_date', 'created_at']

