"""
Reports API endpoints for analytics and data export.
"""
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Sum, Avg, Q, F
from django.utils import timezone
from datetime import timedelta
from projects.models import Project
from tasks.models import Task, TimeEntry
from documents.models import Document
from accounts.models import Company, Contractor


class ReportsViewSet(viewsets.ViewSet):
    """
    ViewSet for generating reports and analytics.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def project_progress(self, request):
        """Get project progress report."""
        user = request.user
        project_id = request.query_params.get('project_id')
        
        if user.is_company_admin:
            projects = Project.objects.filter(company=user.company)
        elif user.is_contractor:
            projects = Project.objects.filter(contractor=user.contractor)
        elif user.is_consultant:
            projects = Project.objects.filter(consultant=user)
        else:
            projects = Project.objects.none()
        
        if project_id:
            projects = projects.filter(id=project_id)
        
        data = []
        for project in projects:
            tasks = Task.objects.filter(project=project)
            total_tasks = tasks.count()
            completed_tasks = tasks.filter(status='COMPLETED').count()
            
            data.append({
                'project_id': project.id,
                'project_name': project.name,
                'status': project.status,
                'total_tasks': total_tasks,
                'completed_tasks': completed_tasks,
                'progress_percentage': round((completed_tasks / total_tasks * 100) if total_tasks > 0 else 0, 2),
                'start_date': project.start_date,
                'end_date': project.end_date,
            })
        
        return Response(data)
    
    @action(detail=False, methods=['get'])
    def time_tracking(self, request):
        """Get time tracking report."""
        user = request.user
        project_id = request.query_params.get('project_id')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        # Build query
        if user.is_company_admin:
            tasks = Task.objects.filter(project__company=user.company)
        elif user.is_contractor:
            tasks = Task.objects.filter(project__contractor=user.contractor)
        elif user.is_worker:
            tasks = Task.objects.filter(assigned_to=user)
        else:
            tasks = Task.objects.none()
        
        if project_id:
            tasks = tasks.filter(project_id=project_id)
        
        # Get time entries
        time_entries = TimeEntry.objects.filter(task__in=tasks)
        
        if start_date:
            time_entries = time_entries.filter(date__gte=start_date)
        if end_date:
            time_entries = time_entries.filter(date__lte=end_date)
        
        # Aggregate by task
        task_stats = time_entries.values('task__id', 'task__title').annotate(
            total_hours=Sum('hours'),
            entry_count=Count('id')
        )
        
        # Aggregate by project
        project_stats = time_entries.values('task__project__id', 'task__project__name').annotate(
            total_hours=Sum('hours'),
            entry_count=Count('id')
        )
        
        return Response({
            'by_task': list(task_stats),
            'by_project': list(project_stats),
            'total_hours': time_entries.aggregate(total=Sum('hours'))['total'] or 0,
            'total_entries': time_entries.count(),
        })
    
    @action(detail=False, methods=['get'])
    def budget_vs_actual(self, request):
        """Get budget vs actual spending report."""
        user = request.user
        
        if user.is_company_admin:
            projects = Project.objects.filter(company=user.company)
        elif user.is_contractor:
            projects = Project.objects.filter(contractor=user.contractor)
        else:
            projects = Project.objects.none()
        
        data = []
        for project in projects:
            # Calculate actual spending from time entries
            tasks = Task.objects.filter(project=project)
            total_hours = TimeEntry.objects.filter(task__in=tasks).aggregate(
                total=Sum('hours')
            )['total'] or 0
            
            # Assuming hourly rate (this should be configurable)
            hourly_rate = 50  # Default rate
            actual_cost = total_hours * hourly_rate
            
            data.append({
                'project_id': project.id,
                'project_name': project.name,
                'estimated_budget': float(project.estimated_budget) if project.estimated_budget else 0,
                'actual_budget': float(project.actual_budget) if project.actual_budget else 0,
                'calculated_cost': actual_cost,
                'total_hours': total_hours,
                'variance': (float(project.estimated_budget) if project.estimated_budget else 0) - actual_cost,
            })
        
        return Response(data)
    
    @action(detail=False, methods=['get'])
    def document_approval_timeline(self, request):
        """Get document approval timeline report."""
        user = request.user
        project_id = request.query_params.get('project_id')
        
        if user.is_company_admin:
            documents = Document.objects.filter(project__company=user.company)
        elif user.is_contractor:
            documents = Document.objects.filter(
                Q(contractor=user.contractor) | Q(project__contractor=user.contractor)
            )
        else:
            documents = Document.objects.none()
        
        if project_id:
            documents = documents.filter(project_id=project_id)
        
        # Group by status
        status_counts = documents.values('status').annotate(count=Count('id'))
        
        # Overdue documents
        overdue = documents.filter(
            review_deadline__lt=timezone.now(),
            status='PENDING'
        ).count()
        
        # Average review time
        reviewed_docs = documents.filter(reviewed_at__isnull=False)
        avg_review_time = None
        if reviewed_docs.exists():
            review_times = []
            for doc in reviewed_docs:
                if doc.uploaded_at and doc.reviewed_at:
                    delta = doc.reviewed_at - doc.uploaded_at
                    review_times.append(delta.total_seconds() / 3600)  # Convert to hours
            if review_times:
                avg_review_time = sum(review_times) / len(review_times)
        
        return Response({
            'status_breakdown': list(status_counts),
            'overdue_count': overdue,
            'total_documents': documents.count(),
            'average_review_time_hours': round(avg_review_time, 2) if avg_review_time else None,
        })
    
    @action(detail=False, methods=['get'])
    def department_performance(self, request):
        """Get department performance report."""
        user = request.user
        
        if user.is_company_admin:
            # Get all departments from contractors
            contractors = Contractor.objects.filter(company=user.company)
        elif user.is_contractor:
            contractors = Contractor.objects.filter(id=user.contractor.id)
        else:
            return Response([])
        
        from departments.models import Department
        departments = Department.objects.filter(contractor__in=contractors)
        
        data = []
        for dept in departments:
            tasks = Task.objects.filter(department=dept)
            total_tasks = tasks.count()
            completed_tasks = tasks.filter(status='COMPLETED').count()
            
            # Time tracking
            time_entries = TimeEntry.objects.filter(task__in=tasks)
            total_hours = time_entries.aggregate(total=Sum('hours'))['total'] or 0
            
            data.append({
                'department_id': dept.id,
                'department_name': dept.name,
                'contractor_name': dept.contractor.name,
                'total_tasks': total_tasks,
                'completed_tasks': completed_tasks,
                'completion_rate': round((completed_tasks / total_tasks * 100) if total_tasks > 0 else 0, 2),
                'total_hours': total_hours,
                'member_count': dept.members.count(),
            })
        
        return Response(data)
    
    @action(detail=False, methods=['get'])
    def dashboard_summary(self, request):
        """Get dashboard summary statistics."""
        user = request.user
        
        if user.is_company_admin:
            projects = Project.objects.filter(company=user.company)
            tasks = Task.objects.filter(project__company=user.company)
        elif user.is_contractor:
            projects = Project.objects.filter(contractor=user.contractor)
            tasks = Task.objects.filter(project__contractor=user.contractor)
        elif user.is_worker:
            projects = Project.objects.filter(tasks__assigned_to=user).distinct()
            tasks = Task.objects.filter(assigned_to=user)
        elif user.is_consultant:
            projects = Project.objects.filter(consultant=user)
            tasks = Task.objects.filter(project__consultant=user)
        else:
            projects = Project.objects.none()
            tasks = Task.objects.none()
        
        # Pending documents
        documents = Document.objects.filter(project__in=projects, status='PENDING')
        overdue_documents = documents.filter(
            review_deadline__lt=timezone.now()
        ).count()
        
        # Pending blueprints
        from projects.models import Blueprint
        pending_blueprints = Blueprint.objects.filter(
            project__in=projects,
            review_status='PENDING'
        ).count()
        overdue_blueprints = Blueprint.objects.filter(
            project__in=projects,
            review_status='PENDING',
            review_deadline__lt=timezone.now()
        ).count()
        
        # Project status breakdown
        project_status_breakdown = projects.values('status').annotate(count=Count('id'))
        
        # Project progress over time (last 12 months)
        progress_over_time = []
        for i in range(11, -1, -1):
            month_date = timezone.now() - timedelta(days=30 * i)
            month_start = month_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            if i == 0:
                month_end = timezone.now()
            else:
                next_month = month_start + timedelta(days=32)
                month_end = next_month.replace(day=1) - timedelta(seconds=1)
            
            month_projects = projects.filter(created_at__lte=month_end)
            month_tasks = tasks.filter(project__in=month_projects)
            total_tasks = month_tasks.count()
            completed_tasks = month_tasks.filter(status='COMPLETED').count()
            avg_progress = round((completed_tasks / total_tasks * 100) if total_tasks > 0 else 0, 2)
            
            progress_over_time.append({
                'month': month_start.strftime('%Y-%m'),
                'month_name': month_start.strftime('%b %Y'),
                'total_projects': month_projects.count(),
                'avg_progress': avg_progress,
                'total_tasks': total_tasks,
                'completed_tasks': completed_tasks,
            })
        
        return Response({
            'total_projects': projects.count(),
            'active_projects': projects.filter(status='IN_PROGRESS').count(),
            'total_tasks': tasks.count(),
            'completed_tasks': tasks.filter(status='COMPLETED').count(),
            'pending_tasks': tasks.filter(status='PENDING').count(),
            'overdue_tasks': tasks.filter(status='DELAYED').count(),
            'pending_documents': documents.count(),
            'overdue_documents': overdue_documents,
            'pending_blueprints': pending_blueprints,
            'overdue_blueprints': overdue_blueprints,
            'project_status_breakdown': list(project_status_breakdown),
            'progress_over_time': progress_over_time,
        })

