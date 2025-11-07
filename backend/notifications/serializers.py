from rest_framework import serializers
from .models import Notification, EmailNotification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', 'notification_type', 'title', 'message',
                  'is_read', 'content_type', 'object_id', 'created_at']
        read_only_fields = ['id', 'created_at']


class EmailNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailNotification
        fields = ['id', 'user', 'subject', 'message', 'sent_at', 'is_sent', 'error_message']
        read_only_fields = ['id', 'sent_at']

