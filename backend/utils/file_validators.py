"""
File validation utilities for Django REST Framework.
Provides reusable helpers for file size and MIME type validation.
"""
import logging
from rest_framework import serializers
from PIL import Image
import filetype

logger = logging.getLogger(__name__)

# File size limits in MB
MAX_ATTACHMENT_SIZE_MB = 10
MAX_BLUEPRINT_SIZE_MB = 50

# Allowed MIME types
ALLOWED_IMAGE_MIME_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
]

ALLOWED_DOCUMENT_MIME_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',  # .docx
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',  # .xlsx
    'text/plain',
    'text/csv',
]

ALLOWED_BLUEPRINT_MIME_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
]


def validate_file_size(file, max_size_mb):
    """
    Validate file size.
    
    Args:
        file: Django UploadedFile object
        max_size_mb: Maximum file size in megabytes
        
    Raises:
        ValidationError: If file exceeds the maximum size
    """
    max_size_bytes = max_size_mb * 1024 * 1024
    
    # Check file size
    if file.size > max_size_bytes:
        raise serializers.ValidationError(
            f"File size exceeds the maximum allowed size of {max_size_mb}MB. "
            f"Current file size: {file.size / (1024 * 1024):.2f}MB"
        )


def validate_mime_type(file, allowed_types):
    """
    Validate file MIME type using real file content (not just extension).
    
    Args:
        file: Django UploadedFile object
        allowed_types: List of allowed MIME types
        
    Raises:
        ValidationError: If MIME type is not allowed
    """
    # Reset file pointer to beginning
    file.seek(0)
    
    # Read first chunk to detect MIME type
    chunk = file.read(1024)
    file.seek(0)  # Reset again for later use
    
    if not chunk:
        raise serializers.ValidationError("File is empty or cannot be read.")
    
    # Use filetype library to detect real MIME type
    kind = filetype.guess(chunk)
    
    if not kind:
        # Fallback: try to detect from file extension if filetype fails
        # This is less secure but provides better UX
        import os
        ext = os.path.splitext(file.name)[1].lower()
        ext_to_mime = {
            '.pdf': 'application/pdf',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.xls': 'application/vnd.ms-excel',
            '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            '.txt': 'text/plain',
            '.csv': 'text/csv',
        }
        detected_mime = ext_to_mime.get(ext)
        
        if not detected_mime:
            raise serializers.ValidationError(
                f"Unable to detect file type. Please ensure the file is a valid format."
            )
        
        if detected_mime not in allowed_types:
            raise serializers.ValidationError(
                f"File type '{detected_mime}' is not allowed. "
                f"Allowed types: {', '.join(allowed_types)}"
            )
    else:
        detected_mime = kind.mime
        
        if detected_mime not in allowed_types:
            raise serializers.ValidationError(
                f"File type '{detected_mime}' is not allowed. "
                f"Allowed types: {', '.join(allowed_types)}"
            )


def validate_image_file(file):
    """
    Validate that a file is a real, non-corrupted image using PIL.
    
    Args:
        file: Django UploadedFile object
        
    Raises:
        ValidationError: If file is not a valid image or is corrupted
    """
    file.seek(0)
    
    try:
        # Try to open and verify the image
        img = Image.open(file)
        img.verify()  # Verify that it's a valid image
        
        # Reset file pointer after verification
        file.seek(0)
        
        # Additional check: try to load the image
        img = Image.open(file)
        img.load()  # Load the image data to check for corruption
        file.seek(0)
        
    except Exception as e:
        file.seek(0)
        raise serializers.ValidationError(
            f"Invalid or corrupted image file: {str(e)}"
        )


def is_image_file(file):
    """
    Check if a file is an image based on MIME type.
    
    Args:
        file: Django UploadedFile object
        
    Returns:
        bool: True if file is an image, False otherwise
    """
    file.seek(0)
    chunk = file.read(1024)
    file.seek(0)
    
    kind = filetype.guess(chunk)
    if kind:
        return kind.mime in ALLOWED_IMAGE_MIME_TYPES
    
    # Fallback to extension check
    import os
    ext = os.path.splitext(file.name)[1].lower()
    image_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    return ext in image_extensions


def get_file_type_from_mime(file):
    """
    Get file type extension from MIME type.
    
    Args:
        file: Django UploadedFile object
        
    Returns:
        str: File extension without dot (e.g., 'pdf', 'jpg')
    """
    file.seek(0)
    chunk = file.read(1024)
    file.seek(0)
    
    kind = filetype.guess(chunk)
    
    if kind:
        mime_to_ext = {
            'application/pdf': 'pdf',
            'image/jpeg': 'jpg',
            'image/jpg': 'jpg',
            'image/png': 'png',
            'image/gif': 'gif',
            'image/webp': 'webp',
            'application/msword': 'doc',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
            'application/vnd.ms-excel': 'xls',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
            'text/plain': 'txt',
            'text/csv': 'csv',
        }
        return mime_to_ext.get(kind.mime, 'unknown')
    
    # Fallback to extension
    import os
    ext = os.path.splitext(file.name)[1].lower()
    return ext[1:] if ext else 'unknown'

