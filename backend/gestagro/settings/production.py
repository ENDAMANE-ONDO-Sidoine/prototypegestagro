import os
from decouple import config
from .base import *
import dj_database_url
from datetime import timedelta

DEBUG = False
ALLOWED_HOSTS = ['*']

# Configuration Render
SECRET_KEY = config('SECRET_KEY')

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

# Utiliser Whitenoise sans compression pour éviter les erreurs de manifest
STATICFILES_STORAGE = 'whitenoise.storage.CompressedStaticFilesStorage'

# Configuration des médias
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Configuration CORS
CORS_ALLOWED_ORIGINS = [
    "https://votre-frontend.onrender.com",
    "http://localhost:3000",
]

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