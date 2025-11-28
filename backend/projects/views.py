from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Project, Blueprint, Pin
from .serializers import (
    ProjectSerializer, ProjectListSerializer,
    BlueprintSerializer, PinSerializer
)
from accounts.permissions import IsCompanyAdmin, IsContractorOrAdmin, IsProjectManagerOrAdmin
from django.utils import timezone
from datetime import timedelta
from django.conf import settings
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
        elif user.is_project_manager:
            # Project managers see projects from their company
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
            return [permissions.IsAuthenticated(), IsProjectManagerOrAdmin()]
        return super().get_permissions()
    
    def perform_create(self, serializer):
        user = self.request.user
        if user.is_company_admin or user.is_project_manager:
            serializer.save(company=user.company, created_by=user)
    
    @action(detail=True, methods=['post'])
    def upload_blueprint(self, request, pk=None):
        """Upload or replace a blueprint for the project."""
        project = self.get_object()
        
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
        
        # Set review deadline (10 days or configurable)
        review_days = getattr(settings, 'DOCUMENT_REVIEW_TIMER_DAYS', 10)
        review_deadline = timezone.now() + timedelta(days=review_days)
        
        # Check if blueprint already exists
        if hasattr(project, 'blueprint'):
            # Update existing blueprint
            blueprint = project.blueprint
            # Store old file path before replacing
            old_file = blueprint.file
            old_file_path = old_file.path if old_file else None
            
            # Assign new file first
            blueprint.file = file
            blueprint.file_type = file_type
            blueprint.uploaded_by = request.user
            blueprint.review_status = 'PENDING'  # Reset to pending when replaced
            blueprint.review_deadline = review_deadline
            blueprint.reviewed_by = None
            blueprint.reviewed_at = None
            blueprint.review_notes = ''
            blueprint.uploaded_at = timezone.now()
            blueprint.save()
            
            # Try to delete old file after saving new one
            # This avoids Windows file locking issues
            if old_file_path and old_file:
                try:
                    # Close the file handle first if possible
                    if hasattr(old_file, 'close'):
                        try:
                            old_file.close()
                        except:
                            pass
                    # Try to delete the file
                    if os.path.exists(old_file_path):
                        os.remove(old_file_path)
                except (PermissionError, OSError) as e:
                    # Log the error but don't fail the request
                    # The new file is already saved, old file will be cleaned up later
                    logger.warning(
                        f"Could not delete old blueprint file {old_file_path}: {e}. "
                        "File may be in use. It will be cleaned up later."
                    )
            
            created = False
        else:
            # Create new blueprint
            blueprint = Blueprint.objects.create(
                project=project,
                file=file,
                file_type=file_type,
                uploaded_by=request.user,
                review_status='PENDING',
                review_deadline=review_deadline
            )
            created = True
        
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
        
        # Send notifications to Company Admin and Consultant
        from notifications.signals import blueprint_uploaded
        blueprint_uploaded.send(sender=Blueprint, instance=blueprint, created=created)
        
        serializer = BlueprintSerializer(blueprint)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def approve_blueprint(self, request, pk=None):
        """Approve a blueprint (Company Admin or Consultant only)."""
        project = self.get_object()
        if not hasattr(project, 'blueprint'):
            return Response(
                {"error": "No blueprint found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        blueprint = project.blueprint
        user = request.user
        
        # Check permissions
        if not (user.is_company_admin or user.is_consultant):
            return Response(
                {"error": "Only Company Admin or Consultant can approve blueprints."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if consultant is assigned to this project
        if user.is_consultant and project.consultant != user:
            return Response(
                {"error": "You are not assigned as consultant for this project."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        blueprint.review_status = 'APPROVED'
        blueprint.reviewed_by = user
        blueprint.reviewed_at = timezone.now()
        blueprint.review_notes = request.data.get('notes', '')
        blueprint.save()
        
        # Send notification
        from notifications.models import Notification
        from django.contrib.contenttypes.models import ContentType
        Notification.objects.create(
            user=blueprint.uploaded_by,
            notification_type='BLUEPRINT_APPROVED',
            title=f'Blueprint Approved: {project.name}',
            message=f'Your blueprint for project "{project.name}" has been approved.',
            content_type=ContentType.objects.get_for_model(Blueprint),
            object_id=blueprint.id
        )
        
        serializer = BlueprintSerializer(blueprint)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def reject_blueprint(self, request, pk=None):
        """Reject a blueprint (Company Admin or Consultant only)."""
        project = self.get_object()
        if not hasattr(project, 'blueprint'):
            return Response(
                {"error": "No blueprint found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        blueprint = project.blueprint
        user = request.user
        
        # Check permissions
        if not (user.is_company_admin or user.is_consultant):
            return Response(
                {"error": "Only Company Admin or Consultant can reject blueprints."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if consultant is assigned to this project
        if user.is_consultant and project.consultant != user:
            return Response(
                {"error": "You are not assigned as consultant for this project."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        blueprint.review_status = 'REJECTED'
        blueprint.reviewed_by = user
        blueprint.reviewed_at = timezone.now()
        blueprint.review_notes = request.data.get('notes', '')
        blueprint.save()
        
        # Send notification
        from notifications.models import Notification
        from django.contrib.contenttypes.models import ContentType
        Notification.objects.create(
            user=blueprint.uploaded_by,
            notification_type='BLUEPRINT_REJECTED',
            title=f'Blueprint Rejected: {project.name}',
            message=f'Your blueprint for project "{project.name}" has been rejected. Notes: {blueprint.review_notes}',
            content_type=ContentType.objects.get_for_model(Blueprint),
            object_id=blueprint.id
        )
        
        serializer = BlueprintSerializer(blueprint)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def request_blueprint_modification(self, request, pk=None):
        """Request blueprint modification (Company Admin or Consultant only)."""
        project = self.get_object()
        if not hasattr(project, 'blueprint'):
            return Response(
                {"error": "No blueprint found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        blueprint = project.blueprint
        user = request.user
        
        # Check permissions
        if not (user.is_company_admin or user.is_consultant):
            return Response(
                {"error": "Only Company Admin or Consultant can request modifications."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if consultant is assigned to this project
        if user.is_consultant and project.consultant != user:
            return Response(
                {"error": "You are not assigned as consultant for this project."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        blueprint.review_status = 'MODIFICATION_REQUESTED'
        blueprint.reviewed_by = user
        blueprint.reviewed_at = timezone.now()
        blueprint.review_notes = request.data.get('notes', '')
        blueprint.save()
        
        # Send notification
        from notifications.models import Notification
        from django.contrib.contenttypes.models import ContentType
        Notification.objects.create(
            user=blueprint.uploaded_by,
            notification_type='BLUEPRINT_MODIFICATION_REQUESTED',
            title=f'Blueprint Modification Requested: {project.name}',
            message=f'Modifications requested for blueprint of project "{project.name}". Notes: {blueprint.review_notes}',
            content_type=ContentType.objects.get_for_model(Blueprint),
            object_id=blueprint.id
        )
        
        serializer = BlueprintSerializer(blueprint)
        return Response(serializer.data)
    
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
    
    @action(detail=True, methods=['post'])
    def create_task_from_location(self, request, pk=None):
        """Create a task from a blueprint location (creates pin + task)."""
        project = self.get_object()
        
        # Check if blueprint exists
        if not hasattr(project, 'blueprint'):
            return Response(
                {"error": "No blueprint found for this project. Please upload a blueprint first."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        blueprint = project.blueprint
        user = request.user
        
        # Get coordinates from request
        x = request.data.get('x')
        y = request.data.get('y')
        
        if x is None or y is None:
            return Response(
                {"error": "Coordinates (x, y) are required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate coordinates (0-1)
        try:
            x = float(x)
            y = float(y)
            if not (0 <= x <= 1 and 0 <= y <= 1):
                return Response(
                    {"error": "Coordinates must be between 0 and 1."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except (ValueError, TypeError):
            return Response(
                {"error": "Invalid coordinates format."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get task data
        task_data = {
            'title': request.data.get('title', ''),
            'description': request.data.get('description', ''),
            'priority': request.data.get('priority', 'MEDIUM'),
            'status': request.data.get('status', 'PENDING'),
            'department': request.data.get('department'),
            'assigned_to': request.data.get('assigned_to'),
            'estimated_hours': request.data.get('estimated_hours'),
            'due_date': request.data.get('due_date'),
        }
        
        if not task_data['title']:
            return Response(
                {"error": "Task title is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Parse due_date if provided
        due_date = None
        if task_data.get('due_date'):
            from django.utils.dateparse import parse_datetime
            from django.utils import timezone as tz
            if isinstance(task_data['due_date'], str):
                parsed = parse_datetime(task_data['due_date'])
                if parsed:
                    # Make timezone-aware if it's naive
                    if tz.is_naive(parsed):
                        due_date = tz.make_aware(parsed)
                    else:
                        due_date = parsed
            else:
                due_date = task_data['due_date']
        
        # Create pin
        pin_label = request.data.get('pin_label', task_data['title'])
        pin = Pin.objects.create(
            blueprint=blueprint,
            x=x,
            y=y,
            label=pin_label
        )
        
        # Create task
        from tasks.models import Task
        task = Task.objects.create(
            project=project,
            pin=pin,
            title=task_data['title'],
            description=task_data.get('description', ''),
            priority=task_data.get('priority', 'MEDIUM'),
            status=task_data.get('status', 'PENDING'),
            department_id=task_data.get('department'),
            assigned_to_id=task_data.get('assigned_to'),
            estimated_hours=task_data.get('estimated_hours'),
            due_date=due_date,
            created_by=user
        )
        
        # Return both pin and task
        from tasks.serializers import TaskSerializer
        from .serializers import PinSerializer
        
        return Response({
            'pin': PinSerializer(pin).data,
            'task': TaskSerializer(task).data,
            'message': 'Task created successfully from blueprint location.'
        }, status=status.HTTP_201_CREATED)
    
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

