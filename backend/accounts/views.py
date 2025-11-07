from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.db.models import Q
from .models import User, Company, Contractor
from .serializers import (
    UserSerializer, CompanySerializer, ContractorSerializer,
    RegisterSerializer, ChangePasswordSerializer
)
from .permissions import IsCompanyAdmin, IsContractorOrAdmin, IsOwnerOrAdmin

User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom token view that returns user data along with tokens.
    """
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            user = User.objects.get(username=request.data['username'])
            serializer = UserSerializer(user)
            response.data['user'] = serializer.data
        return response


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for User management.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_company_admin:
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
            return [permissions.IsAuthenticated(), IsCompanyAdmin()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsOwnerOrAdmin()]
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
    permission_classes = [permissions.IsAuthenticated, IsCompanyAdmin]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_company_admin:
            return Company.objects.filter(id=user.company.id)
        return Company.objects.none()
    
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
        if user.is_company_admin:
            return Contractor.objects.filter(company=user.company)
        elif user.is_contractor:
            return Contractor.objects.filter(id=user.contractor.id)
        return Contractor.objects.none()
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsCompanyAdmin()]
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

