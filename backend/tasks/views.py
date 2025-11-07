from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Sum, Avg
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from .models import Task, TimeEntry, TaskComment, TaskAttachment
from .serializers import (
    TaskSerializer, TaskListSerializer,
    TimeEntrySerializer, TaskCommentSerializer, TaskAttachmentSerializer
)
from accounts.permissions import IsCompanyAdmin, IsContractorOrAdmin, IsOwnerOrAdmin


class TaskViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Task management.
    """
    queryset = Task.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'department', 'project', 'assigned_to']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'due_date', 'priority']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return TaskListSerializer
        return TaskSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.is_company_admin:
            # Company admin sees all tasks in their company's projects
            return Task.objects.filter(project__company=user.company)
        elif user.is_contractor:
            # Contractor sees tasks in their projects
            return Task.objects.filter(project__contractor=user.contractor)
        elif user.is_worker:
            # Worker sees only assigned tasks
            return Task.objects.filter(assigned_to=user)
        return Task.objects.none()
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsContractorOrAdmin()]
        return super().get_permissions()
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def log_time(self, request, pk=None):
        """Log time for a task."""
        task = self.get_object()
        serializer = TimeEntrySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(task=task, user=request.user)
        
        # Update task actual hours
        total_hours = task.time_entries.aggregate(Sum('hours'))['hours__sum'] or 0
        task.actual_hours = total_hours
        task.save()
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def add_comment(self, request, pk=None):
        """Add a comment to a task."""
        task = self.get_object()
        serializer = TaskCommentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(task=task, user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def upload_attachment(self, request, pk=None):
        """Upload an attachment to a task."""
        task = self.get_object()
        file = request.FILES.get('file')
        if not file:
            return Response(
                {"error": "No file provided."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        import os
        file_ext = os.path.splitext(file.name)[1]
        file_type = file_ext[1:] if file_ext else 'unknown'
        
        attachment = TaskAttachment.objects.create(
            task=task,
            file=file,
            file_name=file.name,
            file_type=file_type,
            uploaded_by=request.user
        )
        
        serializer = TaskAttachmentSerializer(attachment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Update task status."""
        task = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in dict(Task.STATUS_CHOICES):
            return Response(
                {"error": "Invalid status."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        task.status = new_status
        task.save()
        
        serializer = self.get_serializer(task)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my_tasks(self, request):
        """Get current user's tasks."""
        tasks = self.get_queryset().filter(assigned_to=request.user)
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Get overdue tasks."""
        tasks = self.get_queryset().filter(
            due_date__lt=timezone.now(),
            status__in=['PENDING', 'IN_PROGRESS']
        )
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get task statistics for the user."""
        tasks = self.get_queryset()
        
        stats = {
            'total': tasks.count(),
            'pending': tasks.filter(status='PENDING').count(),
            'in_progress': tasks.filter(status='IN_PROGRESS').count(),
            'completed': tasks.filter(status='COMPLETED').count(),
            'delayed': tasks.filter(status='DELAYED').count(),
            'overdue': tasks.filter(
                due_date__lt=timezone.now(),
                status__in=['PENDING', 'IN_PROGRESS']
            ).count(),
            'total_estimated_hours': tasks.aggregate(Sum('estimated_hours'))['estimated_hours__sum'] or 0,
            'total_actual_hours': tasks.aggregate(Sum('actual_hours'))['actual_hours__sum'] or 0,
        }
        
        return Response(stats)


class TimeEntryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for TimeEntry management.
    """
    queryset = TimeEntry.objects.all()
    serializer_class = TimeEntrySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['task', 'user', 'date']
    
    def get_queryset(self):
        user = self.request.user
        if user.is_company_admin:
            return TimeEntry.objects.filter(task__project__company=user.company)
        elif user.is_contractor:
            return TimeEntry.objects.filter(task__project__contractor=user.contractor)
        else:
            return TimeEntry.objects.filter(user=user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

