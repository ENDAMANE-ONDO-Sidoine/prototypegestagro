"""
Configuration pour Django Admin Développement
Fonctionnalités avancées pour le développement
"""
from .development import *

# Configuration spécifique au développement
DEBUG = True

# Interface de développement
ADMIN_SITE_HEADER = "GestAgro - Administration Développement"
ADMIN_SITE_TITLE = "GestAgro Dev"
ADMIN_INDEX_TITLE = "Interface de Développement"

# Fonctionnalités de développement
# Ajout des outils de développement s'ils sont disponibles
INSTALLED_APPS += [
    'django_extensions',
]

try:
    import debug_toolbar  # type: ignore

    INSTALLED_APPS += ['debug_toolbar']
    MIDDLEWARE += ['debug_toolbar.middleware.DebugToolbarMiddleware']
    INTERNAL_IPS = ['127.0.0.1', 'localhost']
except ImportError:
    # Debug Toolbar non installée dans l'environnement actuel
    pass

# Logging avancé pour développement
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
        'file': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': 'logs/django_dev.log',
            'formatter': 'verbose',
        },
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'console'],
            'level': 'DEBUG',
            'propagate': True,
        },
        'gestagro': {
            'handlers': ['file', 'console'],
            'level': 'DEBUG',
            'propagate': True,
        },
    },
}

# Configuration Django Extensions
GRAPH_MODELS = {
    'all_applications': True,
    'group_models': True,
}

# Configuration de développement
DEVELOPMENT_MODE = True
