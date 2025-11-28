from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, Company, Contractor


class CompanySerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    logo_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Company
        fields = ['id', 'name', 'email', 'phone_number', 'address', 'logo', 'logo_url',
                  'password', 'other_info', 'subscription_plan', 'subscription_start_date', 
                  'subscription_end_date', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'logo_url']
        extra_kwargs = {
            'password': {'write_only': True}
        }
    
    def get_logo_url(self, obj):
        if obj.logo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.logo.url)
            return obj.logo.url
        return None
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        company = Company.objects.create(**validated_data)
        if password:
            company.password = password  # Store plain password for company login
        company.save()
        return company
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.password = password
        instance.save()
        return instance


class ContractorSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    
    class Meta:
        model = Contractor
        fields = ['id', 'company', 'company_name', 'name', 'email', 'phone_number',
                  'address', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    contractor_name = serializers.CharField(source='contractor.name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    password = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role',
                  'phone_number', 'company', 'company_name', 'contractor',
                  'contractor_name', 'department', 'department_name', 'is_active',
                  'is_staff', 'is_superuser', 'password', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_staff', 'is_superuser']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False}
        }
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()
        return user
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    company_name = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name',
                  'last_name', 'role', 'phone_number', 'company_name']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        company_name = validated_data.pop('company_name', None)
        password = validated_data.pop('password')
        
        user = User(**validated_data)
        user.set_password(password)
        
        # If company admin or project manager, create company if company_name provided
        if user.role in ['COMPANY_ADMIN', 'PROJECT_MANAGER'] and company_name:
            company = Company.objects.create(name=company_name, email=user.email)
            user.company = company
        
        user.save()
        return user


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(required=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({"new_password": "Password fields didn't match."})
        return attrs

