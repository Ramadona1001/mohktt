# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0005_company_other_info_company_password'),
    ]

    operations = [
        migrations.CreateModel(
            name='RolePermission',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('role', models.CharField(choices=[('SUPER_ADMIN', 'Super Admin'), ('COMPANY_ADMIN', 'Company Admin'), ('PROJECT_MANAGER', 'Project Manager'), ('CONTRACTOR', 'Contractor'), ('WORKER', 'Worker'), ('DOCUMENT_CONTROLLER', 'Document Controller'), ('CONSULTANT', 'Consultant')], max_length=20)),
                ('category', models.CharField(choices=[('companies', 'Companies'), ('users', 'Users'), ('contractors', 'Contractors'), ('projects', 'Projects'), ('tasks', 'Tasks'), ('documents', 'Documents'), ('reports', 'Reports'), ('settings', 'Settings')], max_length=20)),
                ('action', models.CharField(choices=[('create', 'Create'), ('read', 'Read'), ('update', 'Update'), ('delete', 'Delete'), ('activate', 'Activate'), ('assign_role', 'Assign Role'), ('assign_company', 'Assign Company'), ('approve', 'Approve'), ('reject', 'Reject'), ('view_all', 'View All'), ('export', 'Export'), ('manage_roles', 'Manage Roles'), ('manage_permissions', 'Manage Permissions'), ('system_settings', 'System Settings'), ('company_settings', 'Company Settings'), ('assign', 'Assign'), ('upload', 'Upload'), ('comment', 'Comment')], max_length=20)),
                ('is_allowed', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'db_table': 'role_permissions',
                'ordering': ['role', 'category', 'action'],
            },
        ),
        migrations.AddIndex(
            model_name='rolepermission',
            index=models.Index(fields=['role', 'category'], name='accounts_ro_role_12345_idx'),
        ),
        migrations.AlterUniqueTogether(
            name='rolepermission',
            unique_together={('role', 'category', 'action')},
        ),
    ]

