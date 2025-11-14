from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from .models import Notification
from tasks.models import Task
from documents.models import Document
from projects.models import Blueprint

try:
    from .tasks import send_notification_email
    CELERY_AVAILABLE = True
except ImportError:
    CELERY_AVAILABLE = False
    def send_notification_email(*args, **kwargs):
        # No-op if celery is not available
        pass


@receiver(post_save, sender=Task)
def task_created_or_updated(sender, instance, created, **kwargs):
    """Create notification when task is created or updated."""
    if created:
        # Task assigned
        if instance.assigned_to:
            Notification.objects.create(
                user=instance.assigned_to,
                notification_type='TASK_ASSIGNED',
                title=f'New Task Assigned: {instance.title}',
                message=f'You have been assigned a new task: {instance.title}',
                content_type=ContentType.objects.get_for_model(Task),
                object_id=instance.id
            )
    else:
        # Task status changed
        if instance.status == 'COMPLETED':
            # Notify project admin/contractor
            if instance.project.company:
                admin_users = instance.project.company.users.filter(role='COMPANY_ADMIN')
                for admin in admin_users:
                    Notification.objects.create(
                        user=admin,
                        notification_type='TASK_COMPLETED',
                        title=f'Task Completed: {instance.title}',
                        message=f'Task "{instance.title}" has been completed.',
                        content_type=ContentType.objects.get_for_model(Task),
                        object_id=instance.id
                    )
        elif instance.status == 'DELAYED':
            if instance.assigned_to:
                Notification.objects.create(
                    user=instance.assigned_to,
                    notification_type='TASK_DELAYED',
                    title=f'Task Delayed: {instance.title}',
                    message=f'Task "{instance.title}" has been marked as delayed.',
                    content_type=ContentType.objects.get_for_model(Task),
                    object_id=instance.id
                )


@receiver(post_save, sender=Document)
def document_uploaded(sender, instance, created, **kwargs):
    """Create notification when document is uploaded."""
    if created:
        # Notify document controllers on the opposite side
        if instance.side == 'CONTRACTOR':
            # Notify company document controllers
            controllers = instance.project.company.users.filter(role='DOCUMENT_CONTROLLER')
            for controller in controllers:
                Notification.objects.create(
                    user=controller,
                    notification_type='DOCUMENT_UPLOADED',
                    title=f'New Document: {instance.title}',
                    message=f'A new document "{instance.title}" has been uploaded for review.',
                    content_type=ContentType.objects.get_for_model(Document),
                    object_id=instance.id
                )
        else:
            # Notify contractor document controllers
            if instance.project.contractor:
                controllers = instance.project.contractor.workers.filter(role='DOCUMENT_CONTROLLER')
                for controller in controllers:
                    Notification.objects.create(
                        user=controller,
                        notification_type='DOCUMENT_UPLOADED',
                        title=f'New Document: {instance.title}',
                        message=f'A new document "{instance.title}" has been uploaded for review.',
                        content_type=ContentType.objects.get_for_model(Document),
                        object_id=instance.id
                    )
        
        # Send email notification
        if CELERY_AVAILABLE:
            send_notification_email.delay(instance.id, 'DOCUMENT_UPLOADED')
        else:
            send_notification_email(instance.id, 'DOCUMENT_UPLOADED')


@receiver(post_save, sender=Document)
def document_reviewed(sender, instance, **kwargs):
    """Create notification when document is reviewed."""
    if instance.status in ['APPROVED', 'REJECTED'] and instance.reviewed_by:
        Notification.objects.create(
            user=instance.uploaded_by,
            notification_type=f'DOCUMENT_{instance.status}',
            title=f'Document {instance.status}: {instance.title}',
            message=f'Your document "{instance.title}" has been {instance.status.lower()}.',
            content_type=ContentType.objects.get_for_model(Document),
            object_id=instance.id
        )
        
        # Send email notification
        if CELERY_AVAILABLE:
            send_notification_email.delay(instance.id, f'DOCUMENT_{instance.status}')
        else:
            send_notification_email(instance.id, f'DOCUMENT_{instance.status}')


@receiver(post_save, sender=Blueprint)
def blueprint_uploaded(sender, instance, created, **kwargs):
    """Create notification when blueprint is uploaded."""
    if created:
        # Notify company admin
        if instance.project.company:
            admin_users = instance.project.company.users.filter(role='COMPANY_ADMIN')
            for admin in admin_users:
                Notification.objects.create(
                    user=admin,
                    notification_type='BLUEPRINT_UPLOADED',
                    title=f'Blueprint Uploaded: {instance.project.name}',
                    message=f'A blueprint has been uploaded for project "{instance.project.name}".',
                    content_type=ContentType.objects.get_for_model(Blueprint),
                    object_id=instance.id
                )
        
        # Send email notification
        if CELERY_AVAILABLE:
            send_notification_email.delay(instance.id, 'BLUEPRINT_UPLOADED')
        else:
            send_notification_email(instance.id, 'BLUEPRINT_UPLOADED')

