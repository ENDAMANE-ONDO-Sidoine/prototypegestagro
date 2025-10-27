from django.contrib import admin
from .models import Organization


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ['name', 'type', 'country', 'plan', 'is_active', 'created_at']
    list_filter = ['type', 'country', 'plan', 'is_active']
    search_fields = ['name', 'country', 'industry']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['name']
