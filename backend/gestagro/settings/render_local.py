"""
Configuration pour Django Admin local connecté à PostgreSQL Render
"""
from .base import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

# Development specific settings
ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0']
DJANGO_ADMIN_ENABLED = True
CSRF_TRUSTED_ORIGINS = [
    'http://localhost:8000',
    'http://127.0.0.1:8000',
    'http://localhost:8001',
    'http://127.0.0.1:8001',
]
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False

# Configuration PostgreSQL Render
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'gestagro_db',
        'USER': 'gestagro_db_user',
        'PASSWORD': 'JRka6Z5dHsFeNsmZFDS5PRETXowpfvaH',
        'HOST': 'dpg-d3vqr03ipnbc739kvej0-a.oregon-postgres.render.com',
        'PORT': '5432',
        'OPTIONS': {
            'sslmode': 'require',
        },
    }
}

# Cache local (pas de Redis)
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'gestagro-local-cache',
    }
}

# Email backend pour développement
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# CORS pour développement
CORS_ALLOW_ALL_ORIGINS = True

# Logging pour développement
LOGGING['loggers']['gestagro']['level'] = 'DEBUG'
LOGGING['loggers']['django']['level'] = 'DEBUG'

# Django Debug Toolbar (optionnel)
if DEBUG:
    try:
        import debug_toolbar
        INSTALLED_APPS += ['debug_toolbar']
        MIDDLEWARE += ['debug_toolbar.middleware.DebugToolbarMiddleware']
        INTERNAL_IPS = ['127.0.0.1', 'localhost']
    except ImportError:
        pass

# MinIO Configuration (désactivé pour admin local)
MINIO_ENABLED = False

# Forcer les stockages fichiers/statics en local pour servir correctement l'admin
DEFAULT_FILE_STORAGE = 'django.core.files.storage.FileSystemStorage'
STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.StaticFilesStorage'

# JWT Configuration pour développement
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=8),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUDIENCE': None,
    'ISSUER': None,
    'JWK_URL': None,
    'LEEWAY': 0,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'USER_AUTHENTICATION_RULE': 'rest_framework_simplejwt.authentication.default_user_authentication_rule',
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
    'TOKEN_USER_CLASS': 'rest_framework_simplejwt.models.TokenUser',
    'JTI_CLAIM': 'jti',
    'SLIDING_TOKEN_REFRESH_EXP_CLAIM': 'refresh_exp',
    'SLIDING_TOKEN_LIFETIME': timedelta(minutes=5),
    'SLIDING_TOKEN_REFRESH_LIFETIME': timedelta(days=1),
}
