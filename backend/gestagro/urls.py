"""
URL configuration for gestagro project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from apps.core.docs_views import (
    NoThrottleSpectacularAPIView,
    NoThrottleSpectacularRedocView,
    NoThrottleSpectacularSwaggerView
)
from apps.core.media_views import MinIOMediaView, MinIOStaticView
from apps.core.docs_views import (
    docs_home, docs_concepts, docs_authentication, 
    docs_examples, docs_examples_actor,
    docs_quickstart, docs_reference, docs_errors, 
    docs_setup, docs_support, docs_best_practices,
    docs_webhooks, docs_rate_limiting, docs_security,
    docs_changelog, docs_performance, docs_glossary,
    api_home
)
from apps.core.actor_views import actor_endpoints_redirect
from apps.core.docs_views import favicon_view

urlpatterns = [
    # Favicon (gère les requêtes favicon.ico pour éviter les erreurs 404)
    path("favicon.ico", favicon_view, name="favicon"),
    
    # Admin (désactivable via settings.DJANGO_ADMIN_ENABLED)
    *([path("admin/", admin.site.urls)] if getattr(settings, "DJANGO_ADMIN_ENABLED", True) else []),
    
    # Accueil API (landing)
    path("", api_home, name="api-home"),

    # Documentation développeur
    path("docs/", docs_home, name="docs-home"),
    path("docs/quickstart/", docs_quickstart, name="docs-quickstart"),
    path("docs/concepts/", docs_concepts, name="docs-concepts"),
    path("docs/authentication/", docs_authentication, name="docs-authentication"),
    path("docs/examples/", docs_examples, name="docs-examples"),
    path("docs/examples/<str:actor_slug>/", docs_examples_actor, name="docs-examples-actor"),
    path("docs/reference/", docs_reference, name="docs-reference"),
    path("docs/errors/", docs_errors, name="docs-errors"),
    path("docs/setup/", docs_setup, name="docs-setup"),
    path("docs/support/", docs_support, name="docs-support"),
    path("docs/best-practices/", docs_best_practices, name="docs-best-practices"),
    path("docs/webhooks/", docs_webhooks, name="docs-webhooks"),
    path("docs/rate-limiting/", docs_rate_limiting, name="docs-rate-limiting"),
    path("docs/security/", docs_security, name="docs-security"),
    path("docs/changelog/", docs_changelog, name="docs-changelog"),
    path("docs/performance/", docs_performance, name="docs-performance"),
    path("docs/glossary/", docs_glossary, name="docs-glossary"),
    
    # API Documentation (sans throttling)
    path("api/schema/", NoThrottleSpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", NoThrottleSpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/redoc/", NoThrottleSpectacularRedocView.as_view(url_name="schema"), name="redoc"),
    
    # API v1
    path("api/v1/", include("apps.core.urls")),
    path("api/v1/auth/", include("apps.iam.urls")),
    path("api/v1/organizations/", include("apps.organizations.urls")),
    path("api/v1/farmers/", include("apps.farmers.urls")),
    path("api/v1/buyers/", include("apps.buyers.urls")),
    path("api/v1/transport/", include("apps.transport.urls")),
    path("api/v1/agronomy/", include("apps.agronomy.urls")),
    path("api/v1/payments/", include("apps.payments.urls")),
    path("api/v1/", include("apps.notifications.urls")),
    
    # Redirections pour les pages acteurs (docs)
    path("docs/actor/<str:actor_slug>/", actor_endpoints_redirect, name="actor-endpoints-redirect"),
    
    # Health Check
    path("health/", include("health_check.urls")),
    
    # MinIO Media/Static (conditionnel)
    # Active uniquement si MINIO_ENABLED est True (ou endpoint défini)
    # Sinon, Whitenoise/Django sert les fichiers statiques
    *([path("media/<path:path>", MinIOMediaView.as_view(), name="minio_media"),
       path("static/<path:path>", MinIOStaticView.as_view(), name="minio_static")] 
      if (getattr(settings, "MINIO_ENABLED", False) or getattr(settings, "MINIO_STORAGE_ENDPOINT", None)) else []),
]

# Serve media and static files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    # Serve collected staticfiles (if any)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    # Also serve assets from STATICFILES_DIRS (e.g., backend/static)
    for _static_dir in getattr(settings, "STATICFILES_DIRS", []):
        urlpatterns += static(settings.STATIC_URL, document_root=_static_dir)
else:
    # Serve static files in production (collected to STATIC_ROOT or storage backend)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
