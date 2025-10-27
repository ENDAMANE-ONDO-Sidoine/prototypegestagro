import os
from decouple import config
from .base import *
import dj_database_url

DEBUG = False
ALLOWED_HOSTS = ['*']

# Configuration Render
SECRET_KEY = config('SECRET_KEY')

# Base de données PostgreSQL
DATABASES = {
    'default': dj_database_url.parse(
        config('DATABASE_URL', default='postgresql://gestagro_user:gestagro_password@localhost:5432/gestagro_db')
    )
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