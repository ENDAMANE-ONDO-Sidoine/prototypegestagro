from django.contrib import admin
from .models import Province, City


@admin.register(Province)
class ProvinceAdmin(admin.ModelAdmin):
    list_display = ['name', 'chef_lieu', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'chef_lieu']
    ordering = ['name']


@admin.register(City)
class CityAdmin(admin.ModelAdmin):
    list_display = ['name', 'province', 'is_chef_lieu', 'is_active', 'created_at']
    list_filter = ['province', 'is_chef_lieu', 'is_active', 'created_at']
    search_fields = ['name', 'province__name']
    ordering = ['province', 'name']
