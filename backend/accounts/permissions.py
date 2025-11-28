from rest_framework import permissions


class IsCompanyAdmin(permissions.BasePermission):
    """
    Permission check for Company Admin role.
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.is_company_admin
        )


class IsContractorOrAdmin(permissions.BasePermission):
    """
    Permission check for Contractor or Company Admin roles.
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            (request.user.is_contractor or request.user.is_company_admin)
        )


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Permission check for object owner or Company Admin.
    """
    def has_object_permission(self, request, view, obj):
        # Company admin has full access
        if request.user.is_company_admin:
            return True
        
        # Check if user owns the object
        if hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'created_by'):
            return obj.created_by == request.user
        elif obj == request.user:
            return True
        
        return False


class IsDocumentController(permissions.BasePermission):
    """
    Permission check for Document Controller role.
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.is_document_controller
        )


class IsConsultant(permissions.BasePermission):
    """
    Permission check for Consultant role.
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.is_consultant
        )


class IsConsultantOrAdmin(permissions.BasePermission):
    """
    Permission check for Consultant or Company Admin roles.
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            (request.user.is_consultant or request.user.is_company_admin)
        )


class IsProjectManager(permissions.BasePermission):
    """
    Permission check for Project Manager role.
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.is_project_manager
        )


class IsProjectManagerOrAdmin(permissions.BasePermission):
    """
    Permission check for Project Manager or Company Admin roles.
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            (request.user.is_project_manager or request.user.is_company_admin)
        )


class IsSuperAdmin(permissions.BasePermission):
    """
    Permission check for Super Admin (Django is_superuser).
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.is_superuser
        )


class IsCompanyAdminOrSuperAdmin(permissions.BasePermission):
    """
    Permission check for Company Admin or Super Admin.
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            (request.user.is_company_admin or request.user.is_superuser)
        )


class IsOwnerOrAdminOrSuperAdmin(permissions.BasePermission):
    """
    Permission check for object owner, Company Admin, or Super Admin.
    """
    def has_object_permission(self, request, view, obj):
        # Super admin has full access
        if request.user.is_superuser:
            return True
        # Company admin has full access
        if request.user.is_company_admin:
            return True
        
        # Check if user owns the object
        if hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'created_by'):
            return obj.created_by == request.user
        elif obj == request.user:
            return True
        
        return False