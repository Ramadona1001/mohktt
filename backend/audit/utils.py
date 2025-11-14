"""
Audit utility functions.
"""
from django.contrib.contenttypes.models import ContentType
from .models import AuditLog


def log_action(user, action, obj, description='', changes=None, request=None):
    """
    Log an action to the audit log.
    
    Args:
        user: User performing the action
        action: Action type (CREATE, UPDATE, DELETE, etc.)
        obj: Object being acted upon
        description: Human-readable description
        changes: Dict of field changes {field: {'before': x, 'after': y}}
        request: Request object (for IP and user agent)
    """
    content_type = ContentType.objects.get_for_model(obj.__class__)
    
    audit_info = {}
    if request and hasattr(request, '_audit_info'):
        audit_info = request._audit_info
    
    AuditLog.objects.create(
        user=user,
        action=action,
        content_type=content_type,
        object_id=obj.pk,
        description=description,
        changes=changes or {},
        ip_address=audit_info.get('ip_address'),
        user_agent=audit_info.get('user_agent', ''),
    )

