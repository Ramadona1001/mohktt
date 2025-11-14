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
