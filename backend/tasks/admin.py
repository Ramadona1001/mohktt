from django.contrib import admin
from .models import Task, TimeEntry, TaskComment, TaskAttachment


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'project', 'status', 'priority', 'assigned_to', 'due_date']
    list_filter = ['status', 'priority', 'project', 'department']
    search_fields = ['title', 'description']
    date_hierarchy = 'created_at'


@admin.register(TimeEntry)
class TimeEntryAdmin(admin.ModelAdmin):
    list_display = ['task', 'user', 'hours', 'date']
    list_filter = ['date', 'task__project']
    date_hierarchy = 'date'


@admin.register(TaskComment)
class TaskCommentAdmin(admin.ModelAdmin):
    list_display = ['task', 'user', 'created_at']
    list_filter = ['created_at']


@admin.register(TaskAttachment)
class TaskAttachmentAdmin(admin.ModelAdmin):
    list_display = ['task', 'file_name', 'uploaded_by', 'uploaded_at']
    list_filter = ['uploaded_at']

