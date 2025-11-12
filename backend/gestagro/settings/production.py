import os
from decouple import config
from .base import *
import dj_database_url
from datetime import timedelta

DEBUG = False
ALLOWED_HOSTS = ['*']

# Configuration Render
SECRET_KEY = config('SECRET_KEY')

# Désactiver health_check.cache en production (pas de Redis sur plan gratuit)
INSTALLED_APPS = [app for app in INSTALLED_APPS if app != 'health_check.cache']

# Désactiver l'interface Django Admin sur l'environnement Render (prod)
DJANGO_ADMIN_ENABLED = False

# Base de données PostgreSQL
DATABASES = {
    'default': dj_database_url.parse(
        config('DATABASE_URL', default='sqlite:///db.sqlite3')
    )
}

# Configuration Redis (optionnel pour plan gratuit)
# Si REDIS_URL est défini, utiliser Redis, sinon utiliser cache en mémoire
REDIS_URL = config('REDIS_URL', default=None)

if REDIS_URL:
    # Redis configuré (plan payant ou Redis externe)
    CACHES = {
        'default': {
            'BACKEND': 'django_redis.cache.RedisCache',
            'LOCATION': REDIS_URL,
            'OPTIONS': {
                'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            }
        }
    }
else:
    # Cache en mémoire locale (plan gratuit sans Redis)
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
            'LOCATION': 'gestagro-cache',
        }
    }

# Configuration des fichiers statiques
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
# Créer le répertoire staticfiles s'il n'existe pas (pour éviter le warning)
staticfiles_dir = BASE_DIR / 'staticfiles'
if not staticfiles_dir.exists():
    staticfiles_dir.mkdir(parents=True, exist_ok=True)
# S'assurer que STATICFILES_DIRS est défini pour collectstatic
# Créer le répertoire static s'il n'existe pas (pour éviter le warning)
static_dir = BASE_DIR / 'static'
if not static_dir.exists():
    static_dir.mkdir(parents=True, exist_ok=True)
STATICFILES_DIRS = [
    static_dir,
]

# Désactiver MinIO pour les fichiers statiques en production (utiliser WhiteNoise)
MINIO_ENABLED = False
MINIO_STORAGE_ENDPOINT = None

# Override STATICFILES_STORAGE de base.py pour utiliser le storage Django standard
# WhiteNoise middleware sert automatiquement les fichiers depuis STATIC_ROOT
STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.StaticFilesStorage'
# Configuration WhiteNoise (optionnel, valeurs par défaut)
WHITENOISE_USE_FINDERS = False  # Désactivé en production (les fichiers sont déjà collectés)
WHITENOISE_AUTOREFRESH = False  # Désactivé en production

# Configuration des médias
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Configuration CORS (prend la valeur définie dans base.py, mais permet un fallback spécifique prod)
_fallback_cors = [
    "https://votre-frontend.onrender.com",
    "http://localhost:3000",
]

cors_env = config('CORS_ALLOWED_ORIGINS', default=None)
if cors_env:
    CORS_ALLOWED_ORIGINS = [origin.strip() for origin in cors_env.split(',') if origin.strip()]
else:
    CORS_ALLOWED_ORIGINS = _fallback_cors

# Configuration JWT
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
}

# Configuration Logging pour Render (pas de fichiers)
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}