"""
Vues pour servir les médias depuis MinIO
"""
from django.http import HttpResponse, Http404
from django.views import View
from django.conf import settings
from django.core.files.storage import default_storage
import mimetypes
import os


class MinIOMediaView(View):
    """
    Vue pour servir les fichiers média depuis MinIO
    """
    
    def get(self, request, path):
        """
        Servir un fichier média depuis MinIO
        """
        try:
            # Construire le chemin complet du fichier
            full_path = f"media/{path}"
            
            # Vérifier si le fichier existe dans MinIO
            if not default_storage.exists(full_path):
                raise Http404("Fichier non trouvé")
            
            # Ouvrir le fichier depuis MinIO
            file_obj = default_storage.open(full_path, 'rb')
            file_content = file_obj.read()
            file_obj.close()
            
            # Déterminer le type MIME
            mime_type, _ = mimetypes.guess_type(full_path)
            if not mime_type:
                mime_type = 'application/octet-stream'
            
            # Créer la réponse HTTP
            response = HttpResponse(file_content, content_type=mime_type)
            
            # Ajouter les headers pour le cache
            response['Cache-Control'] = 'public, max-age=3600'  # Cache 1 heure
            response['Content-Disposition'] = f'inline; filename="{os.path.basename(path)}"'
            
            return response
            
        except Exception as e:
            raise Http404(f"Erreur lors du chargement du fichier: {str(e)}")


class MinIOStaticView(View):
    """
    Vue pour servir les fichiers statiques depuis MinIO
    """
    
    def get(self, request, path):
        """
        Servir un fichier statique depuis MinIO
        """
        try:
            # Construire le chemin complet du fichier
            full_path = f"static/{path}"
            
            # Vérifier si le fichier existe dans MinIO
            if not default_storage.exists(full_path):
                raise Http404("Fichier non trouvé")
            
            # Ouvrir le fichier depuis MinIO
            file_obj = default_storage.open(full_path, 'rb')
            file_content = file_obj.read()
            file_obj.close()
            
            # Déterminer le type MIME
            mime_type, _ = mimetypes.guess_type(full_path)
            if not mime_type:
                mime_type = 'application/octet-stream'
            
            # Créer la réponse HTTP
            response = HttpResponse(file_content, content_type=mime_type)
            
            # Ajouter les headers pour le cache (plus long pour les statiques)
            response['Cache-Control'] = 'public, max-age=86400'  # Cache 24 heures
            
            return response
            
        except Exception as e:
            raise Http404(f"Erreur lors du chargement du fichier: {str(e)}")
