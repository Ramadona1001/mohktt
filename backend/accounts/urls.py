from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, CompanyViewSet, ContractorViewSet,
    RegisterViewSet, CustomTokenObtainPairView, SuperAdminViewSet
)
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'companies', CompanyViewSet, basename='company')
router.register(r'contractors', ContractorViewSet, basename='contractor')
router.register(r'register', RegisterViewSet, basename='register')
router.register(r'super-admin', SuperAdminViewSet, basename='super-admin')

urlpatterns = [
    path('', include(router.urls)),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

