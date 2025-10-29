"""
URL configuration for gestagro project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from apps.core.media_views import MinIOMediaView, MinIOStaticView
from apps.core.views_admin import trigger_migrations, check_database
from apps.core import emergency_views

urlpatterns = [
    # Admin
    path("admin/", admin.site.urls),
    
    # ⚠️ TEMPORAIRE - Endpoints de migration (À SUPPRIMER après utilisation)
    path("api/v1/admin/migrate/", trigger_migrations, name="trigger_migrations"),
    path("api/v1/admin/check-db/", check_database, name="check_database"),
    
    # 🚨 URGENCE - Endpoints de diagnostic (sans authentification)
    path("emergency/check-db/", emergency_views.emergency_check_db, name="emergency_check_db"),
    path("emergency/migrate/", emergency_views.emergency_migrate, name="emergency_migrate"),
    path("emergency/create-superuser/", emergency_views.emergency_create_superuser, name="emergency_create_superuser"),
    
    # 🚨 URGENCE - Endpoint simple pour créer superuser (GET)
    path("create-admin/", emergency_views.simple_create_admin, name="simple_create_admin"),
    
    # API Documentation
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
    
    # API v1
    path("api/v1/", include("apps.core.urls")),
    path("api/v1/auth/", include("apps.iam.urls")),
    path("api/v1/organizations/", include("apps.organizations.urls")),
    path("api/v1/farmers/", include("apps.farmers.urls")),
    path("api/v1/buyers/", include("apps.buyers.urls")),
    path("api/v1/transport/", include("apps.transport.urls")),
    path("api/v1/agronomy/", include("apps.agronomy.urls")),
    
    # Health Check
    path("health/", include("health_check.urls")),
    
    # MinIO Media Serving (Production)
    path("media/<path:path>", MinIOMediaView.as_view(), name="minio_media"),
    path("static/<path:path>", MinIOStaticView.as_view(), name="minio_static"),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
else:
    # Serve static files in production
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
