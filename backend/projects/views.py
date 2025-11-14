from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Project, Blueprint, Pin
from .serializers import (
    ProjectSerializer, ProjectListSerializer,
    BlueprintSerializer, PinSerializer
)
from accounts.permissions import IsCompanyAdmin, IsContractorOrAdmin
from utils.file_validators import (
    validate_file_size, validate_mime_type, validate_image_file,
    get_file_type_from_mime, is_image_file, MAX_BLUEPRINT_SIZE_MB,
    ALLOWED_BLUEPRINT_MIME_TYPES
)
from PIL import Image
import os
import logging

logger = logging.getLogger(__name__)


class ProjectViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Project management.
    """
    queryset = Project.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ProjectListSerializer
        return ProjectSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.is_company_admin:
            return Project.objects.filter(company=user.company)
        elif user.is_contractor:
            return Project.objects.filter(contractor=user.contractor)
        elif user.is_worker:
            # Workers see projects where they have tasks
            from tasks.models import Task
            project_ids = Task.objects.filter(
                assigned_to=user
            ).values_list('project_id', flat=True).distinct()
            return Project.objects.filter(id__in=project_ids)
        return Project.objects.none()
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsCompanyAdmin()]
        return super().get_permissions()
    
    def perform_create(self, serializer):
        user = self.request.user
        if user.is_company_admin:
            serializer.save(company=user.company, created_by=user)
    
    @action(detail=True, methods=['post'])
    def upload_blueprint(self, request, pk=None):
        """Upload a blueprint for the project."""
        project = self.get_object()
        
        if hasattr(project, 'blueprint'):
            return Response(
                {"error": "Blueprint already exists. Delete it first to upload a new one."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        file = request.FILES.get('file')
        if not file:
            return Response(
                {"error": "No file provided."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate file size
        validate_file_size(file, MAX_BLUEPRINT_SIZE_MB)
        
        # Validate MIME type
        validate_mime_type(file, ALLOWED_BLUEPRINT_MIME_TYPES)
        
        # If it's an image, validate it's a real image and get dimensions
        if is_image_file(file):
            validate_image_file(file)
        
        # Get file type from MIME
        file_type = get_file_type_from_mime(file)
        
        blueprint = Blueprint.objects.create(
            project=project,
            file=file,
            file_type=file_type,
            uploaded_by=request.user
        )
        
        # If it's an image, get dimensions
        if is_image_file(file):
            try:
                img = Image.open(blueprint.file)
                blueprint.width, blueprint.height = img.size
                blueprint.save()
            except Exception as e:
                logger.warning(
                    f"Failed to extract image dimensions for blueprint {blueprint.id}: {e}",
                    exc_info=True
                )
        
        serializer = BlueprintSerializer(blueprint)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['delete'])
    def delete_blueprint(self, request, pk=None):
        """Delete the project blueprint."""
        project = self.get_object()
        if hasattr(project, 'blueprint'):
            project.blueprint.delete()
            return Response({"message": "Blueprint deleted successfully."})
        return Response(
            {"error": "No blueprint found."},
            status=status.HTTP_404_NOT_FOUND
        )
    
    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        """Get project statistics."""
        project = self.get_object()
        from tasks.models import Task
        from django.db.models import Count, Avg
        
        tasks = Task.objects.filter(project=project)
        total_tasks = tasks.count()
        completed_tasks = tasks.filter(status='COMPLETED').count()
        in_progress_tasks = tasks.filter(status='IN_PROGRESS').count()
        pending_tasks = tasks.filter(status='PENDING').count()
        delayed_tasks = tasks.filter(status='DELAYED').count()
        
        # Time tracking stats
        time_stats = tasks.aggregate(
            total_estimated_hours=Avg('estimated_hours'),
            total_actual_hours=Avg('actual_hours')
        )
        
        return Response({
            'total_tasks': total_tasks,
            'completed_tasks': completed_tasks,
            'in_progress_tasks': in_progress_tasks,
            'pending_tasks': pending_tasks,
            'delayed_tasks': delayed_tasks,
            'progress_percentage': round((completed_tasks / total_tasks * 100) if total_tasks > 0 else 0, 2),
            'avg_estimated_hours': time_stats['total_estimated_hours'] or 0,
            'avg_actual_hours': time_stats['total_actual_hours'] or 0,
        })


class PinViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Pin management on blueprints.
    """
    queryset = Pin.objects.all()
    serializer_class = PinSerializer
    permission_classes = [permissions.IsAuthenticated, IsContractorOrAdmin]
    
    def get_queryset(self):
        blueprint_id = self.request.query_params.get('blueprint', None)
        if blueprint_id:
            return Pin.objects.filter(blueprint_id=blueprint_id)
        return Pin.objects.none()
    
    def perform_create(self, serializer):
        serializer.save()

