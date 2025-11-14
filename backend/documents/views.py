from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.db.models import Q
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from .models import Document, DocumentVersion
from .serializers import DocumentSerializer, DocumentListSerializer, DocumentVersionSerializer
from accounts.permissions import IsCompanyAdmin, IsContractorOrAdmin, IsDocumentController
from utils.file_validators import (
    validate_file_size, validate_mime_type, validate_image_file,
    get_file_type_from_mime, is_image_file, MAX_ATTACHMENT_SIZE_MB,
    ALLOWED_DOCUMENT_MIME_TYPES, ALLOWED_IMAGE_MIME_TYPES
)
import os


class DocumentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Document management.
    """
    queryset = Document.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['project', 'status', 'side', 'contractor', 'company']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return DocumentListSerializer
        return DocumentSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.is_company_admin:
            return Document.objects.filter(project__company=user.company)
        elif user.is_contractor:
            return Document.objects.filter(
                Q(contractor=user.contractor) | Q(project__contractor=user.contractor)
            )
        else:
            return Document.objects.filter(
                Q(uploaded_by=user) | Q(project__tasks__assigned_to=user)
            ).distinct()
    
    def get_permissions(self):
        if self.action in ['approve', 'reject', 'request_modification']:
            return [permissions.IsAuthenticated(), IsDocumentController()]
        return super().get_permissions()
    
    def perform_create(self, serializer):
        user = self.request.user
        file = self.request.FILES.get('file')
        
        if not file:
            raise ValidationError({"file": "No file provided."})
        
        # Validate project is provided
        project = serializer.validated_data.get('project')
        if not project:
            raise ValidationError({"project": "Project is required."})
        
        # Validate file size (documents use attachment limit)
        validate_file_size(file, MAX_ATTACHMENT_SIZE_MB)
        
        # Validate MIME type (documents can be PDF, DOCX, images, etc.)
        allowed_mime_types = ALLOWED_DOCUMENT_MIME_TYPES + ALLOWED_IMAGE_MIME_TYPES
        validate_mime_type(file, allowed_mime_types)
        
        # If it's an image, validate it's a real image
        if is_image_file(file):
            validate_image_file(file)
        
        # Get file type from MIME
        file_type = get_file_type_from_mime(file)
        
        # Determine side
        side = 'CONTRACTOR' if user.is_contractor else 'COMPANY'
        
        serializer.save(
            project=project,
            uploaded_by=user,
            file_name=file.name,
            file_type=file_type,
            side=side,
            contractor=user.contractor if user.is_contractor else None,
            company=user.company if user.is_company_admin else None
        )
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a document."""
        document = self.get_object()
        document.status = 'APPROVED'
        document.reviewed_by = request.user
        document.reviewed_at = timezone.now()
        document.review_notes = request.data.get('notes', '')
        document.save()
        
        serializer = self.get_serializer(document)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a document."""
        document = self.get_object()
        document.status = 'REJECTED'
        document.reviewed_by = request.user
        document.reviewed_at = timezone.now()
        document.review_notes = request.data.get('notes', '')
        document.save()
        
        serializer = self.get_serializer(document)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def request_modification(self, request, pk=None):
        """Request modification for a document."""
        document = self.get_object()
        document.status = 'MODIFICATION_REQUESTED'
        document.reviewed_by = request.user
        document.reviewed_at = timezone.now()
        document.review_notes = request.data.get('notes', '')
        document.save()
        
        serializer = self.get_serializer(document)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def upload_version(self, request, pk=None):
        """Upload a new version of the document."""
        document = self.get_object()
        file = request.FILES.get('file')
        
        if not file:
            return Response(
                {"error": "No file provided."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate file size
        validate_file_size(file, MAX_ATTACHMENT_SIZE_MB)
        
        # Validate MIME type
        allowed_mime_types = ALLOWED_DOCUMENT_MIME_TYPES + ALLOWED_IMAGE_MIME_TYPES
        validate_mime_type(file, allowed_mime_types)
        
        # If it's an image, validate it's a real image
        if is_image_file(file):
            validate_image_file(file)
        
        # Get next version number
        last_version = document.versions.order_by('-version_number').first()
        version_number = (last_version.version_number + 1) if last_version else 1
        
        version = DocumentVersion.objects.create(
            document=document,
            file=file,
            version_number=version_number,
            change_notes=request.data.get('change_notes', ''),
            uploaded_by=request.user
        )
        
        # Reset document status to pending
        document.status = 'PENDING'
        document.save()
        
        serializer = DocumentVersionSerializer(version)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def pending_review(self, request):
        """Get documents pending review."""
        user = request.user
        if user.is_document_controller:
            # Show documents that need review from the opposite side
            if user.company:
                documents = Document.objects.filter(
                    project__company=user.company,
                    status='PENDING',
                    side='CONTRACTOR'
                )
            else:
                documents = Document.objects.filter(
                    contractor=user.contractor,
                    status='PENDING',
                    side='COMPANY'
                )
        else:
            documents = Document.objects.none()
        
        serializer = self.get_serializer(documents, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Get overdue documents."""
        documents = self.get_queryset().filter(
            status='PENDING',
            review_deadline__lt=timezone.now()
        )
        serializer = self.get_serializer(documents, many=True)
        return Response(serializer.data)

