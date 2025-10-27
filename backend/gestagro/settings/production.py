import os
from decouple import config
from .base import *

DEBUG = False
ALLOWED_HOSTS = ['*']

# Configuration Render
SECRET_KEY = config('SECRET_KEY')

# Base de données PostgreSQL
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DATABASE_URL', '').split('/')[-1],
        'USER': config('DATABASE_URL', '').split('://')[1].split(':')[0],
        'PASSWORD': config('DATABASE_URL', '').split(':')[2].split('@')[0],
        'HOST': config('DATABASE_URL', '').split('@')[1].split(':')[0],
        'PORT': config('DATABASE_URL', '').split(':')[-1].split('/')[0],
    }
}

# Configuration Redis
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': config('REDIS_URL', 'redis://localhost:6379/1'),
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

# Configuration des fichiers statiques
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

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