from django.apps import AppConfig


class FarmersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.farmers'
    verbose_name = 'Agriculteurs'

    def ready(self):
        # Import signal handlers
        from . import signals  # noqa: F401