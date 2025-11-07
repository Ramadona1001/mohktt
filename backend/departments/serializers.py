from rest_framework import serializers
from .models import Department
from accounts.serializers import ContractorSerializer


class DepartmentSerializer(serializers.ModelSerializer):
    contractor_name = serializers.CharField(source='contractor.name', read_only=True)
    company_name = serializers.CharField(source='contractor.company.name', read_only=True)
    member_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Department
        fields = ['id', 'contractor', 'contractor_name', 'company_name', 'name',
                  'description', 'is_active', 'member_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_member_count(self, obj):
        return obj.members.count()

