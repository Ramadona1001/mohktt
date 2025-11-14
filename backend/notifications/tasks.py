try:
    from celery import shared_task
    CELERY_AVAILABLE = True
except ImportError:
    CELERY_AVAILABLE = False
    # Fallback decorator if celery is not available
    def shared_task(func):
        return func

from django.core.mail import send_mail
from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from .models import EmailNotification
from documents.models import Document
from projects.models import Blueprint


@shared_task
def send_notification_email(object_id, notification_type):
    """
    Celery task to send email notifications.
    """
    try:
        if notification_type.startswith('DOCUMENT_'):
            content_type = ContentType.objects.get_for_model(Document)
            obj = Document.objects.get(id=object_id)
            user = obj.uploaded_by
        elif notification_type == 'BLUEPRINT_UPLOADED':
            content_type = ContentType.objects.get_for_model(Blueprint)
            obj = Blueprint.objects.get(id=object_id)
            user = obj.uploaded_by
        else:
            return
        
        if not user or not user.email:
            return
        
        subject = f"Mukhattat: {notification_type.replace('_', ' ').title()}"
        message = f"Notification: {obj}"
        
        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
            
            EmailNotification.objects.create(
                user=user,
                subject=subject,
                message=message,
                is_sent=True
            )
        except Exception as e:
            EmailNotification.objects.create(
                user=user,
                subject=subject,
                message=message,
                is_sent=False,
                error_message=str(e)
            )
    except Exception as e:
        print(f"Error sending notification email: {e}")

