"""
Configuration de test pour GestAgro
"""
from .base import *

# Database pour tests
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

# Cache pour tests
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
    }
}

# Email backend pour tests
EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'

# Password hashers pour tests (plus rapides)
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.MD5PasswordHasher',
]

# Celery pour tests
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True

# Logging pour tests
LOGGING['handlers']['console']['level'] = 'WARNING'
LOGGING['loggers']['gestagro']['level'] = 'WARNING'
LOGGING['loggers']['django']['level'] = 'WARNING'

# Media files pour tests
MEDIA_ROOT = '/tmp/gestagro_test_media'

# Static files pour tests
STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.StaticFilesStorage'

# Disable migrations for faster tests
class DisableMigrations:
    def __contains__(self, item):
        return True
    
    def __getitem__(self, item):
        return None

MIGRATION_MODULES = DisableMigrations()
