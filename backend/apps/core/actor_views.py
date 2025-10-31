"""
Vues pour les résumés d'acteurs (redirection vers Swagger)
"""
from django.shortcuts import redirect


def actor_endpoints_redirect(request, actor_slug):
    """
    Redirige vers Swagger UI avec le tag de l'acteur
    Les tags dans Swagger sont généralement: farmers, buyers, transport, agronomy
    """
    swagger_url = request.build_absolute_uri('/api/docs/')
    
    # Mapping des slugs vers les tags Swagger possibles
    tag_mapping = {
        'farmers': 'farmers',
        'buyers': 'buyers',
        'transport': 'transport',
        'agronomy': 'agronomy',
        'agronomist': 'agronomy',
    }
    
    tag = tag_mapping.get(actor_slug, actor_slug)
    # Swagger UI ne supporte pas directement les fragments pour les tags,
    # donc on redirige simplement vers Swagger
    return redirect(swagger_url)

