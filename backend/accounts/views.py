from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.db.models import Q
from .models import User, Company, Contractor, RolePermission
from .serializers import (
    UserSerializer, CompanySerializer, ContractorSerializer,
    RegisterSerializer, ChangePasswordSerializer
)
from .permissions import (
    IsCompanyAdmin, IsContractorOrAdmin, IsOwnerOrAdmin, IsSuperAdmin,
    IsCompanyAdminOrSuperAdmin, IsOwnerOrAdminOrSuperAdmin
)

User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom token view that returns user data along with tokens.
    Supports both user login (username/password) and company login (email/password).
    """
    def post(self, request, *args, **kwargs):
        username_or_email = request.data.get('username', '')
        password = request.data.get('password', '')
        
        # Try to find user by username or email
        try:
            user = User.objects.get(Q(username=username_or_email) | Q(email=username_or_email))
            # Authenticate user
            if not user.check_password(password):
                return Response(
                    {"detail": "No active account found with the given credentials."},
                    status=status.HTTP_401_UNAUTHORIZED
                )
        except User.DoesNotExist:
            # Try company login
            try:
                company = Company.objects.get(email=username_or_email)
                # Check if company has a password and it matches
                if not company.password or company.password != password:
                    return Response(
                        {"detail": "No active account found with the given credentials."},
                        status=status.HTTP_401_UNAUTHORIZED
                    )
                
                # Find or create company admin user
                company_admin = User.objects.filter(company=company, role='COMPANY_ADMIN').first()
                if not company_admin:
                    # Create company admin user if doesn't exist
                    username = company.email.split('@')[0] or company.name.lower().replace(' ', '_')
                    base_username = username
                    counter = 1
                    while User.objects.filter(username=username).exists():
                        username = f"{base_username}_{counter}"
                        counter += 1
                    
                    company_admin = User.objects.create(
                        username=username,
                        email=company.email,
                        first_name=company.name,
                        last_name='Admin',
                        role='COMPANY_ADMIN',
                        company=company,
                        phone_number=company.phone_number,
                        is_active=True
                    )
                    company_admin.set_password(password)
                    company_admin.save()
                
                user = company_admin
            except Company.DoesNotExist:
                return Response(
                    {"detail": "No active account found with the given credentials."},
                    status=status.HTTP_401_UNAUTHORIZED
                )
        
        # Generate tokens
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)
        
        # Return response with user data
        serializer = UserSerializer(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': serializer.data
        })


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for User management.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            # Super admin sees all users
            return User.objects.all()
        elif user.is_company_admin:
            # Company admin sees all users in their company
            return User.objects.filter(company=user.company)
        elif user.is_contractor:
            # Contractor sees workers in their departments
            return User.objects.filter(
                Q(contractor=user.contractor) | Q(id=user.id)
            )
        else:
            # Worker sees only themselves
            return User.objects.filter(id=user.id)
    
    def get_permissions(self):
        if self.action == 'create':
            return [permissions.IsAuthenticated(), IsCompanyAdminOrSuperAdmin()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsOwnerOrAdminOrSuperAdmin()]
        return super().get_permissions()
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user profile."""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def change_password(self, request):
        """Change user password."""
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return Response(
                {"old_password": "Wrong password."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({"message": "Password updated successfully."})


class CompanyViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Company management.
    """
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            # Super admin sees all companies
            return Company.objects.all()
        elif user.is_company_admin:
            return Company.objects.filter(id=user.company.id)
        return Company.objects.none()
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsCompanyAdminOrSuperAdmin()]
        return super().get_permissions()
    
    @action(detail=True, methods=['post'])
    def add_contractor(self, request, pk=None):
        """Add a contractor to the company."""
        company = self.get_object()
        serializer = ContractorSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(company=company)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ContractorViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Contractor management.
    """
    queryset = Contractor.objects.all()
    serializer_class = ContractorSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            # Super admin sees all contractors
            return Contractor.objects.all()
        elif user.is_company_admin:
            return Contractor.objects.filter(company=user.company)
        elif user.is_contractor:
            return Contractor.objects.filter(id=user.contractor.id)
        return Contractor.objects.none()
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsCompanyAdminOrSuperAdmin()]
        return super().get_permissions()


class RegisterViewSet(viewsets.GenericViewSet):
    """
    ViewSet for user registration.
    """
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    
    @action(detail=False, methods=['post'])
    def register(self, request):
        """Register a new user."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)


class SuperAdminViewSet(viewsets.GenericViewSet):
    """
    Super Admin ViewSet for managing all companies, users, contractors, and permissions.
    Only accessible by users with is_superuser=True.
    """
    permission_classes = [permissions.IsAuthenticated, IsSuperAdmin]
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Get dashboard statistics for super admin."""
        from projects.models import Project
        from tasks.models import Task
        
        stats = {
            'total_companies': Company.objects.count(),
            'active_companies': Company.objects.filter(is_active=True).count(),
            'total_users': User.objects.count(),
            'total_contractors': Contractor.objects.count(),
            'total_projects': Project.objects.count(),
            'total_tasks': Task.objects.count(),
            'users_by_role': {
                role[0]: User.objects.filter(role=role[0]).count()
                for role in User.ROLE_CHOICES
            },
            'total_project_managers': User.objects.filter(role='PROJECT_MANAGER').count(),
            'total_workers': User.objects.filter(role='WORKER').count(),
            'total_consultants': User.objects.filter(role='CONSULTANT').count(),
            'total_document_controllers': User.objects.filter(role='DOCUMENT_CONTROLLER').count(),
        }
        return Response(stats)
    
    @action(detail=False, methods=['get'])
    def notifications(self, request):
        """Get all notifications for super admin."""
        from notifications.models import Notification
        from notifications.serializers import NotificationSerializer
        from django.contrib.contenttypes.models import ContentType
        
        # Get all notifications for super admin users
        super_admin_users = User.objects.filter(is_superuser=True)
        notifications = Notification.objects.filter(user__in=super_admin_users).order_by('-created_at')
        
        # Filter by read status if provided
        is_read = request.query_params.get('is_read')
        if is_read is not None:
            is_read_bool = is_read.lower() == 'true'
            notifications = notifications.filter(is_read=is_read_bool)
        
        # Limit to last 100 notifications
        notifications = notifications[:100]
        
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def unread_notifications_count(self, request):
        """Get count of unread notifications for super admin."""
        from notifications.models import Notification
        
        super_admin_users = User.objects.filter(is_superuser=True)
        count = Notification.objects.filter(user__in=super_admin_users, is_read=False).count()
        return Response({"unread_count": count})
    
    @action(detail=False, methods=['get'])
    def all_companies(self, request):
        """Get all companies."""
        companies = Company.objects.all()
        serializer = CompanySerializer(companies, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def all_users(self, request):
        """Get all users across all companies."""
        users = User.objects.all().select_related('company', 'contractor', 'department')
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def all_contractors(self, request):
        """Get all contractors."""
        contractors = Contractor.objects.all().select_related('company')
        serializer = ContractorSerializer(contractors, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def all_departments(self, request):
        """Get all departments."""
        from departments.models import Department
        from departments.serializers import DepartmentSerializer
        departments = Department.objects.all().select_related('contractor', 'contractor__company')
        serializer = DepartmentSerializer(departments, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def create_department(self, request):
        """Create a new department."""
        from departments.models import Department
        from departments.serializers import DepartmentSerializer
        
        serializer = DepartmentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['put', 'patch'], url_path='departments/(?P<department_id>[^/.]+)')
    def update_department(self, request, department_id=None):
        """Update a department."""
        from departments.models import Department
        from departments.serializers import DepartmentSerializer
        
        try:
            department = Department.objects.get(id=department_id)
        except Department.DoesNotExist:
            return Response(
                {"error": "Department not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = DepartmentSerializer(department, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['delete'], url_path='departments/(?P<department_id>[^/.]+)')
    def delete_department(self, request, department_id=None):
        """Delete a department."""
        from departments.models import Department
        
        try:
            department = Department.objects.get(id=department_id)
            department.delete()
            return Response(
                {"message": "Department deleted successfully."},
                status=status.HTTP_200_OK
            )
        except Department.DoesNotExist:
            return Response(
                {"error": "Department not found."},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'], url_path='departments/(?P<department_id>[^/.]+)/assign_workers')
    def assign_workers_to_department(self, request, department_id=None):
        """Assign workers to a department."""
        from departments.models import Department
        
        try:
            department = Department.objects.get(id=department_id)
        except Department.DoesNotExist:
            return Response(
                {"error": "Department not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        worker_ids = request.data.get('worker_ids', [])
        if not isinstance(worker_ids, list):
            return Response(
                {"error": "worker_ids must be a list."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get workers
        workers = User.objects.filter(id__in=worker_ids, role='WORKER')
        if workers.count() != len(worker_ids):
            return Response(
                {"error": "Some worker IDs are invalid or not workers."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Assign workers to department
        workers.update(department=department)
        
        return Response({
            "message": f"Assigned {workers.count()} workers to department.",
            "assigned_count": workers.count()
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], url_path='companies/(?P<company_id>[^/.]+)/activate')
    def activate_company(self, request, company_id=None):
        """Activate or deactivate a company."""
        try:
            company = Company.objects.get(id=company_id)
            is_active = request.data.get('is_active', True)
            company.is_active = is_active
            company.save()
            serializer = CompanySerializer(company)
            return Response(serializer.data)
        except Company.DoesNotExist:
            return Response(
                {"error": "Company not found."},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'], url_path='users/(?P<user_id>[^/.]+)/update-role')
    def update_user_role(self, request, user_id=None):
        """Update user role and permissions."""
        try:
            user = User.objects.get(id=user_id)
            new_role = request.data.get('role')
            is_active = request.data.get('is_active', user.is_active)
            is_staff = request.data.get('is_staff', user.is_staff)
            
            if new_role and new_role in [choice[0] for choice in User.ROLE_CHOICES]:
                user.role = new_role
            user.is_active = is_active
            user.is_staff = is_staff
            user.save()
            
            serializer = UserSerializer(user)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'], url_path='users/(?P<user_id>[^/.]+)/assign-company')
    def assign_user_to_company(self, request, user_id=None):
        """Assign a user to a company."""
        try:
            user = User.objects.get(id=user_id)
            company_id = request.data.get('company_id')
            
            if company_id:
                try:
                    company = Company.objects.get(id=company_id)
                    user.company = company
                    user.save()
                except Company.DoesNotExist:
                    return Response(
                        {"error": "Company not found."},
                        status=status.HTTP_404_NOT_FOUND
                    )
            else:
                user.company = None
                user.save()
            
            serializer = UserSerializer(user)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['post'])
    def create_company(self, request):
        """Create a new company and automatically create a company admin user."""
        # Handle both FormData (for file uploads) and JSON
        data = request.data.dict() if hasattr(request.data, 'dict') else dict(request.data)
        files = request.FILES
        
        # Merge files into data
        if files and 'logo' in files:
            data['logo'] = files['logo']
        
        serializer = CompanySerializer(data=data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        company = serializer.save()
        
        # Create company admin user automatically
        password = data.get('password', '') or request.data.get('password', '')
        if password:
            # Generate username from company email or name
            username = company.email.split('@')[0] or company.name.lower().replace(' ', '_')
            # Ensure username is unique
            base_username = username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}_{counter}"
                counter += 1
            
            company_admin = User.objects.create(
                username=username,
                email=company.email,
                first_name=company.name,
                last_name='Admin',
                role='COMPANY_ADMIN',
                company=company,
                phone_number=company.phone_number,
                is_active=True,
                is_staff=False
            )
            company_admin.set_password(password)
            company_admin.save()
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'], url_path='company-by-email')
    def get_company_by_email(self, request):
        """Get company information by email (for login page logo)."""
        email = request.query_params.get('email', '')
        if not email:
            return Response(
                {"error": "Email parameter is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            company = Company.objects.get(email=email)
            serializer = CompanySerializer(company, context={'request': request})
            return Response(serializer.data)
        except Company.DoesNotExist:
            return Response(
                {"error": "Company not found."},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['post'])
    def create_user(self, request):
        """Create a new user (super admin can create any user)."""
        serializer = UserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        password = request.data.get('password')
        user = serializer.save()
        if password:
            user.set_password(password)
            user.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'])
    def create_contractor(self, request):
        """Create a new contractor."""
        serializer = ContractorSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def roles_permissions(self, request):
        """Get all roles and their permissions from database."""
        from .models import User
        
        # Get default permissions structure (for reference)
        default_permissions = {
            'SUPER_ADMIN': {
                'name': 'Super Admin',
                'description': 'Full system access and control',
                'permissions': {
                    'companies': ['create', 'read', 'update', 'delete', 'activate'],
                    'users': ['create', 'read', 'update', 'delete', 'assign_role', 'assign_company'],
                    'contractors': ['create', 'read', 'update', 'delete'],
                    'projects': ['create', 'read', 'update', 'delete', 'view_all'],
                    'tasks': ['create', 'read', 'update', 'delete', 'view_all'],
                    'documents': ['create', 'read', 'update', 'delete', 'approve', 'reject', 'view_all'],
                    'reports': ['view_all', 'export'],
                    'settings': ['manage_roles', 'manage_permissions', 'system_settings'],
                }
            },
            'COMPANY_ADMIN': {
                'name': 'Company Admin',
                'description': 'Full access to company resources',
                'permissions': {
                    'companies': ['read', 'update'],
                    'users': ['create', 'read', 'update', 'delete'],
                    'contractors': ['create', 'read', 'update', 'delete'],
                    'projects': ['create', 'read', 'update', 'delete'],
                    'tasks': ['create', 'read', 'update', 'delete'],
                    'documents': ['create', 'read', 'update', 'delete', 'approve', 'reject'],
                    'reports': ['view', 'export'],
                    'settings': ['company_settings'],
                }
            },
            'PROJECT_MANAGER': {
                'name': 'Project Manager',
                'description': 'Manage projects and tasks',
                'permissions': {
                    'companies': ['read'],
                    'users': ['read'],
                    'contractors': ['read'],
                    'projects': ['create', 'read', 'update', 'delete'],
                    'tasks': ['create', 'read', 'update', 'delete', 'assign'],
                    'documents': ['create', 'read', 'update'],
                    'reports': ['view'],
                    'settings': [],
                }
            },
            'CONTRACTOR': {
                'name': 'Contractor',
                'description': 'Manage workers and tasks',
                'permissions': {
                    'companies': ['read'],
                    'users': ['read', 'create', 'update'],
                    'contractors': ['read'],
                    'projects': ['read'],
                    'tasks': ['read', 'update'],
                    'documents': ['read', 'upload'],
                    'reports': ['view'],
                    'settings': [],
                }
            },
            'WORKER': {
                'name': 'Worker',
                'description': 'View and update assigned tasks',
                'permissions': {
                    'companies': ['read'],
                    'users': ['read'],
                    'contractors': ['read'],
                    'projects': ['read'],
                    'tasks': ['read', 'update'],
                    'documents': ['read'],
                    'reports': ['view'],
                    'settings': [],
                }
            },
            'DOCUMENT_CONTROLLER': {
                'name': 'Document Controller',
                'description': 'Manage and approve documents',
                'permissions': {
                    'companies': ['read'],
                    'users': ['read'],
                    'contractors': ['read'],
                    'projects': ['read'],
                    'tasks': ['read'],
                    'documents': ['create', 'read', 'update', 'delete', 'approve', 'reject'],
                    'reports': ['view'],
                    'settings': [],
                }
            },
            'CONSULTANT': {
                'name': 'Consultant',
                'description': 'View and provide consultation',
                'permissions': {
                    'companies': ['read'],
                    'users': ['read'],
                    'contractors': ['read'],
                    'projects': ['read'],
                    'tasks': ['read'],
                    'documents': ['read', 'comment'],
                    'reports': ['view'],
                    'settings': [],
                }
            },
        }
        
        # Get permissions from database (with error handling)
        use_db_permissions = False
        db_permissions_qs = None
        try:
            # Try to access the table - if it doesn't exist, OperationalError will be raised
            from django.db import OperationalError
            try:
                db_permissions_qs = RolePermission.objects.all()
                use_db_permissions = True
            except OperationalError:
                # Table doesn't exist yet
                use_db_permissions = False
                db_permissions_qs = None
        except Exception as e:
            # Any other error - use defaults
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"RolePermission table not accessible, using defaults: {str(e)}")
            use_db_permissions = False
            db_permissions_qs = None
        
        # Build permissions structure from database
        roles_permissions = {}
        # Get all roles from User model and add SUPER_ADMIN
        all_roles = [('SUPER_ADMIN', 'Super Admin')] + list(User.ROLE_CHOICES)
        
        for role_choice in all_roles:
            role = role_choice[0]
            role_info = default_permissions.get(role, {
                'name': role_choice[1],
                'description': '',
                'permissions': {}
            })
            
            # Initialize permissions structure
            permissions_dict = {}
            if use_db_permissions:
                # Get categories from RolePermission model
                try:
                    categories = RolePermission.PERMISSION_CATEGORIES
                except:
                    categories = [
                        ('companies', 'Companies'),
                        ('users', 'Users'),
                        ('contractors', 'Contractors'),
                        ('projects', 'Projects'),
                        ('tasks', 'Tasks'),
                        ('documents', 'Documents'),
                        ('reports', 'Reports'),
                        ('settings', 'Settings'),
                    ]
            else:
                categories = [
                    ('companies', 'Companies'),
                    ('users', 'Users'),
                    ('contractors', 'Contractors'),
                    ('projects', 'Projects'),
                    ('tasks', 'Tasks'),
                    ('documents', 'Documents'),
                    ('reports', 'Reports'),
                    ('settings', 'Settings'),
                ]
            
            for category in categories:
                permissions_dict[category[0]] = []
            
            # Get permissions from database for this role
            role_perms = None
            if use_db_permissions and db_permissions_qs is not None:
                role_perms = db_permissions_qs.filter(role=role, is_allowed=True)
                for perm in role_perms:
                    if perm.category not in permissions_dict:
                        permissions_dict[perm.category] = []
                    permissions_dict[perm.category].append(perm.action)
            
            # If no database permissions exist, use defaults
            if not use_db_permissions or (use_db_permissions and role_perms and not role_perms.exists() and role in default_permissions):
                permissions_dict = default_permissions[role]['permissions']
            
            roles_permissions[role] = {
                'name': role_info['name'],
                'description': role_info['description'],
                'permissions': permissions_dict
            }
        
        # Get role choices from model
        role_choices = [{'value': choice[0], 'label': choice[1]} for choice in User.ROLE_CHOICES]
        role_choices.insert(0, {'value': 'SUPER_ADMIN', 'label': 'Super Admin'})
        
        # Get permission categories and actions
        try:
            permission_categories = [cat[0] for cat in RolePermission.PERMISSION_CATEGORIES]
            permission_actions = [action[0] for action in RolePermission.PERMISSION_ACTIONS]
        except:
            permission_categories = [
                'companies', 'users', 'contractors', 'projects', 'tasks', 'documents', 'reports', 'settings',
            ]
            permission_actions = [
                'create', 'read', 'update', 'delete', 'activate', 'assign_role', 'assign_company', 'approve',
                'reject', 'view_all', 'export', 'manage_roles', 'manage_permissions', 'system_settings',
                'company_settings', 'assign', 'upload', 'comment',
            ]
        
        # Build response
        response_data = {
            'roles': role_choices,
            'permissions': roles_permissions,
            'permission_categories': permission_categories,
            'permission_actions': permission_actions
        }
        
        return Response(response_data)
    
    @action(detail=False, methods=['post'])
    def update_role_permissions(self, request):
        """Update permissions for a role."""
        import logging
        logger = logging.getLogger(__name__)
        
        role = request.data.get('role')
        permissions = request.data.get('permissions', {})  # {category: [actions]}
        
        logger.info(f"Received update_role_permissions request for role: {role}")
        logger.info(f"Permissions received: {permissions}")
        logger.info(f"Permissions type: {type(permissions)}")
        logger.info(f"Number of categories: {len(permissions) if isinstance(permissions, dict) else 0}")
        
        if not role:
            return Response(
                {"error": "Role is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not permissions or not isinstance(permissions, dict):
            logger.warning(f"Invalid permissions format: {permissions}")
            return Response(
                {"error": "Permissions must be a dictionary with categories as keys and actions as arrays."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate role
        try:
            valid_roles = [choice[0] for choice in RolePermission.ROLE_CHOICES]
        except:
            # Fallback if RolePermission model attributes not accessible
            valid_roles = ['SUPER_ADMIN', 'COMPANY_ADMIN', 'PROJECT_MANAGER', 'CONTRACTOR', 'WORKER', 'DOCUMENT_CONTROLLER', 'CONSULTANT']
        
        if role not in valid_roles:
            return Response(
                {"error": f"Invalid role. Must be one of: {', '.join(valid_roles)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Delete existing permissions for this role (with error handling)
        deleted_count = 0
        try:
            result = RolePermission.objects.filter(role=role).delete()
            deleted_count = result[0] if result else 0
            import logging
            logger = logging.getLogger(__name__)
            logger.info(f"Deleted {deleted_count} existing permissions for role {role}")
        except Exception as e:
            # If table doesn't exist, log and continue
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"Could not delete existing permissions: {str(e)}")
        
        # Create new permissions
        created_permissions = []
        try:
            permission_categories = RolePermission.PERMISSION_CATEGORIES
            permission_actions = RolePermission.PERMISSION_ACTIONS
        except:
            permission_categories = [
                ('companies', 'Companies'), ('users', 'Users'), ('contractors', 'Contractors'),
                ('projects', 'Projects'), ('tasks', 'Tasks'), ('documents', 'Documents'),
                ('reports', 'Reports'), ('settings', 'Settings'),
            ]
            permission_actions = [
                ('create', 'Create'), ('read', 'Read'), ('update', 'Update'), ('delete', 'Delete'),
                ('activate', 'Activate'), ('assign_role', 'Assign Role'), ('assign_company', 'Assign Company'),
                ('approve', 'Approve'), ('reject', 'Reject'), ('view_all', 'View All'), ('export', 'Export'),
                ('manage_roles', 'Manage Roles'), ('manage_permissions', 'Manage Permissions'),
                ('system_settings', 'System Settings'), ('company_settings', 'Company Settings'),
                ('assign', 'Assign'), ('upload', 'Upload'), ('comment', 'Comment'),
            ]
        
        total_processed = 0
        total_created = 0
        total_updated = 0
        
        for category, actions in permissions.items():
            logger.info(f"Processing category: {category}, actions: {actions}, type: {type(actions)}")
            total_processed += 1
            
            if not isinstance(actions, list):
                logger.warning(f"Category {category} has invalid actions type: {type(actions)}, expected list")
                continue
            
            if len(actions) == 0:
                logger.info(f"Skipping empty category: {category}")
                continue
            
            # Validate category
            valid_categories = [cat[0] for cat in permission_categories]
            if category not in valid_categories:
                logger.warning(f"Invalid category: {category}. Valid categories: {valid_categories}")
                continue
            
            logger.info(f"Category {category} is valid, processing {len(actions)} actions")
            
            for action in actions:
                if not isinstance(action, str):
                    logger.warning(f"Action is not a string: {action}, type: {type(action)}")
                    continue
                    
                # Validate action
                valid_actions = [act[0] for act in permission_actions]
                logger.info(f"Validating action: {action}, valid actions: {valid_actions}")
                if action not in valid_actions:
                    logger.warning(f"Invalid action: {action} for category: {category}. Valid actions: {valid_actions}")
                    continue
                
                logger.info(f"Action {action} is valid for category {category}")
                
                logger.info(f"Creating permission: {role}.{category}.{action}")
                try:
                    perm, created = RolePermission.objects.get_or_create(
                        role=role,
                        category=category,
                        action=action,
                        defaults={'is_allowed': True}
                    )
                    # Always add to created_permissions list (both new and existing)
                    created_permissions.append(perm)
                    if created:
                        total_created += 1
                        logger.info(f"✓ Created new permission: {role}.{category}.{action}")
                    else:
                        # Update existing permission to ensure is_allowed is True
                        perm.is_allowed = True
                        perm.save()
                        total_updated += 1
                        logger.info(f"✓ Updated existing permission: {role}.{category}.{action}")
                except Exception as e:
                    logger.error(f"✗ Could not create permission {role}.{category}.{action}: {str(e)}")
                    import traceback
                    logger.error(traceback.format_exc())
                    continue
        
        logger.info(f"Summary: {total_processed} categories processed, {total_created} new permissions created, {total_updated} permissions updated, {len(created_permissions)} total in list")
        
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"Updated {len(created_permissions)} permissions for role {role}")
        logger.info(f"Created permissions details: {[(p.role, p.category, p.action) for p in created_permissions]}")
        
        # Verify permissions were actually saved
        saved_count = RolePermission.objects.filter(role=role, is_allowed=True).count()
        logger.info(f"Total permissions in DB for role {role}: {saved_count}")
        
        return Response({
            "message": f"Permissions updated for {role}",
            "updated_count": len(created_permissions),
            "saved_count": saved_count,
            "role": role,
            "permissions": permissions
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'])
    def reset_role_permissions(self, request):
        """Reset permissions for a role to defaults."""
        role = request.data.get('role')
        
        if not role:
            return Response(
                {"error": "Role is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Default permissions for each role
        default_permissions = {
            'SUPER_ADMIN': {
                'companies': ['create', 'read', 'update', 'delete', 'activate'],
                'users': ['create', 'read', 'update', 'delete', 'assign_role', 'assign_company'],
                'contractors': ['create', 'read', 'update', 'delete'],
                'projects': ['create', 'read', 'update', 'delete', 'view_all'],
                'tasks': ['create', 'read', 'update', 'delete', 'view_all'],
                'documents': ['create', 'read', 'update', 'delete', 'approve', 'reject', 'view_all'],
                'reports': ['view_all', 'export'],
                'settings': ['manage_roles', 'manage_permissions', 'system_settings'],
            },
            'COMPANY_ADMIN': {
                'companies': ['read', 'update'],
                'users': ['create', 'read', 'update', 'delete'],
                'contractors': ['create', 'read', 'update', 'delete'],
                'projects': ['create', 'read', 'update', 'delete'],
                'tasks': ['create', 'read', 'update', 'delete'],
                'documents': ['create', 'read', 'update', 'delete', 'approve', 'reject'],
                'reports': ['view', 'export'],
                'settings': ['company_settings'],
            },
            'PROJECT_MANAGER': {
                'companies': ['read'],
                'users': ['read'],
                'contractors': ['read'],
                'projects': ['create', 'read', 'update', 'delete'],
                'tasks': ['create', 'read', 'update', 'delete', 'assign'],
                'documents': ['create', 'read', 'update'],
                'reports': ['view'],
                'settings': [],
            },
            'CONTRACTOR': {
                'companies': ['read'],
                'users': ['read', 'create', 'update'],
                'contractors': ['read'],
                'projects': ['read'],
                'tasks': ['read', 'update'],
                'documents': ['read', 'upload'],
                'reports': ['view'],
                'settings': [],
            },
            'WORKER': {
                'companies': ['read'],
                'users': ['read'],
                'contractors': ['read'],
                'projects': ['read'],
                'tasks': ['read', 'update'],
                'documents': ['read'],
                'reports': ['view'],
                'settings': [],
            },
            'DOCUMENT_CONTROLLER': {
                'companies': ['read'],
                'users': ['read'],
                'contractors': ['read'],
                'projects': ['read'],
                'tasks': ['read'],
                'documents': ['create', 'read', 'update', 'delete', 'approve', 'reject'],
                'reports': ['view'],
                'settings': [],
            },
            'CONSULTANT': {
                'companies': ['read'],
                'users': ['read'],
                'contractors': ['read'],
                'projects': ['read'],
                'tasks': ['read'],
                'documents': ['read', 'comment'],
                'reports': ['view'],
                'settings': [],
            },
        }
        
        if role not in default_permissions:
            return Response(
                {"error": f"No default permissions defined for role: {role}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Delete existing permissions
        RolePermission.objects.filter(role=role).delete()
        
        # Create default permissions
        created_count = 0
        for category, actions in default_permissions[role].items():
            for action in actions:
                RolePermission.objects.create(
                    role=role,
                    category=category,
                    action=action,
                    is_allowed=True
                )
                created_count += 1
        
        return Response({
            "message": f"Permissions reset to defaults for {role}",
            "created_count": created_count
        }, status=status.HTTP_200_OK)

