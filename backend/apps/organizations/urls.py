"""
URLs pour l'application organizations
"""
from django.urls import path
from .views import OrganizationListView, OrganizationDetailView, upload_organization_logo

urlpatterns = [
    # Organizations
    path('', OrganizationListView.as_view(), name='organization_list'),
    path('<int:pk>/', OrganizationDetailView.as_view(), name='organization_detail'),
    
    # Upload de logo
    path('<int:organization_id>/logo/', upload_organization_logo, name='upload_organization_logo'),
]
