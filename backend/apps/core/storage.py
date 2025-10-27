"""
Classes de stockage MinIO pour GestAgro
"""
from django.conf import settings
from storages.backends.s3boto3 import S3Boto3Storage


class MinIOStorage(S3Boto3Storage):
    """Classe de stockage de base pour MinIO"""
    
    def __init__(self, *args, **kwargs):
        # Configuration dynamique pour éviter les erreurs d'import
        kwargs.setdefault('bucket_name', getattr(settings, 'MINIO_BUCKET_NAME', 'gestagro'))
        kwargs.setdefault('custom_domain', None)
        kwargs.setdefault('file_overwrite', False)
        kwargs.setdefault('default_acl', 'private')
        super().__init__(*args, **kwargs)


class MinIOMediaStorage(MinIOStorage):
    """Stockage pour les fichiers média (images, documents)"""
    location = 'media'
    file_overwrite = False


class MinIOStaticStorage(MinIOStorage):
    """Stockage pour les fichiers statiques"""
    location = 'static'
    file_overwrite = True


class MinIOProductImagesStorage(MinIOStorage):
    """Stockage spécialisé pour les images de produits"""
    location = 'media/products/images'
    file_overwrite = False


class MinIOOrganizationLogosStorage(MinIOStorage):
    """Stockage spécialisé pour les logos d'organisations"""
    location = 'media/organizations/logos'
    file_overwrite = False


class MinIOUserAvatarsStorage(MinIOStorage):
    """Stockage spécialisé pour les avatars d'utilisateurs"""
    location = 'media/users/avatars'
    file_overwrite = False
