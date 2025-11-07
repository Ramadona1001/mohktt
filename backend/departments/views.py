from rest_framework import viewsets, permissions
from .models import Department
from .serializers import DepartmentSerializer
from accounts.permissions import IsContractorOrAdmin


class DepartmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Department management.
    """
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsContractorOrAdmin]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_company_admin:
            # Company admin sees all departments in their company
            return Department.objects.filter(contractor__company=user.company)
        elif user.is_contractor:
            # Contractor sees their own departments
            return Department.objects.filter(contractor=user.contractor)
        return Department.objects.none()
    
    def perform_create(self, serializer):
        user = self.request.user
        if user.is_contractor:
            serializer.save(contractor=user.contractor)

