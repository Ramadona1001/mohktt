from django.db.models.signals import post_save
from django.dispatch import receiver


# Super Admin Notifications
def notify_super_admins(notification_type, title, message, content_object=None):
    """Helper function to notify all super admin users."""
    from django.contrib.contenttypes.models import ContentType
    from .models import Notification
    from accounts.models import User
    
    super_admin_users = User.objects.filter(is_superuser=True)
    content_type = None
    object_id = None
    if content_object:
        content_type = ContentType.objects.get_for_model(content_object)
        object_id = content_object.id
    
    for admin in super_admin_users:
        Notification.objects.create(
            user=admin,
            notification_type=notification_type,
            title=title,
            message=message,
            content_type=content_type,
            object_id=object_id
        )


@receiver(post_save)
def company_created_or_updated(sender, instance, created, **kwargs):
    """Create notification for super admin when company is created or updated."""
    from accounts.models import Company
    
    if sender != Company:
        return
    
    if created:
        notify_super_admins(
            'NEW_COMPANY',
            f'New Company Registered: {instance.name}',
            f'A new company "{instance.name}" has been registered in the system.',
            instance
        )
    elif 'is_active' in kwargs.get('update_fields', []):
        if instance.is_active:
            notify_super_admins(
                'COMPANY_ACTIVATED',
                f'Company Activated: {instance.name}',
                f'Company "{instance.name}" has been activated.',
                instance
            )
        else:
            notify_super_admins(
                'COMPANY_DEACTIVATED',
                f'Company Deactivated: {instance.name}',
                f'Company "{instance.name}" has been deactivated.',
                instance
            )


@receiver(post_save)
def user_created_or_updated(sender, instance, created, **kwargs):
    """Create notification for super admin when user is created or role is changed."""
    from accounts.models import User
    
    if sender != User:
        return
    
    if created and not instance.is_superuser:
        notify_super_admins(
            'NEW_USER',
            f'New User Created: {instance.username}',
            f'A new user "{instance.username}" ({instance.get_role_display()}) has been created.',
            instance
        )
    elif 'role' in kwargs.get('update_fields', []) and not instance.is_superuser:
        notify_super_admins(
            'USER_ROLE_CHANGED',
            f'User Role Changed: {instance.username}',
            f'User "{instance.username}" role has been changed to {instance.get_role_display()}.',
            instance
        )


@receiver(post_save)
def contractor_created(sender, instance, created, **kwargs):
    """Create notification for super admin when contractor is created."""
    from accounts.models import Contractor
    
    if sender != Contractor:
        return
    
    if created:
        notify_super_admins(
            'NEW_CONTRACTOR',
            f'New Contractor Created: {instance.name}',
            f'A new contractor "{instance.name}" has been created.',
            instance
        )


@receiver(post_save)
def department_created(sender, instance, created, **kwargs):
    """Create notification for super admin when department is created."""
    from departments.models import Department
    
    if sender != Department:
        return
    
    if created:
        notify_super_admins(
            'NEW_DEPARTMENT',
            f'New Department Created: {instance.name}',
            f'A new department "{instance.name}" has been created for contractor "{instance.contractor.name}".',
            instance
        )


@receiver(post_save)
def project_created_or_updated(sender, instance, created, **kwargs):
    """Create notification for super admin when project is created or updated."""
    from projects.models import Project
    
    if sender != Project:
        return
    
    if created:
        notify_super_admins(
            'NEW_PROJECT',
            f'New Project Created: {instance.name}',
            f'A new project "{instance.name}" has been created by {instance.company.name if instance.company else "Unknown Company"}.',
            instance
        )
    elif not created:
        notify_super_admins(
            'PROJECT_UPDATED',
            f'Project Updated: {instance.name}',
            f'Project "{instance.name}" has been updated.',
            instance
        )


@receiver(post_save)
def task_created_for_super_admin(sender, instance, created, **kwargs):
    """Create notification for super admin when task is created."""
    from tasks.models import Task
    
    if sender != Task:
        return
    
    if created:
        notify_super_admins(
            'NEW_TASK',
            f'New Task Created: {instance.title}',
            f'A new task "{instance.title}" has been created in project "{instance.project.name if instance.project else "Unknown"}".',
            instance
        )
    elif 'status' in kwargs.get('update_fields', []):
        notify_super_admins(
            'TASK_STATUS_CHANGED',
            f'Task Status Changed: {instance.title}',
            f'Task "{instance.title}" status has been changed to {instance.get_status_display()}.',
            instance
        )


@receiver(post_save)
def document_created_for_super_admin(sender, instance, created, **kwargs):
    """Create notification for super admin when document is uploaded."""
    from documents.models import Document
    
    if sender != Document:
        return
    
    if created:
        notify_super_admins(
            'NEW_DOCUMENT',
            f'New Document Uploaded: {instance.title}',
            f'A new document "{instance.title}" has been uploaded for project "{instance.project.name if instance.project else "Unknown"}".',
            instance
        )
    elif 'status' in kwargs.get('update_fields', []):
        notify_super_admins(
            'DOCUMENT_STATUS_CHANGED',
            f'Document Status Changed: {instance.title}',
            f'Document "{instance.title}" status has been changed to {instance.get_status_display()}.',
            instance
        )

