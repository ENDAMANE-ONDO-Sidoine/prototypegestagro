"""
Filtres de template personnalisés pour la documentation
"""
from django import template

register = template.Library()


@register.filter
def safe_url_name(resolver_match):
    """
    Retourne le nom de l'URL de manière sécurisée
    Gère le cas où resolver_match est un URLResolver au lieu d'un ResolverMatch
    """
    if resolver_match is None:
        return ''
    try:
        # Si c'est un ResolverMatch, on peut accéder à url_name
        if hasattr(resolver_match, 'url_name'):
            return resolver_match.url_name or ''
    except (AttributeError, TypeError):
        pass
    return ''


@register.filter
def safe_kwarg(resolver_match, arg_name):
    """
    Retourne un argument de kwargs de manière sécurisée
    """
    if resolver_match is None:
        return ''
    try:
        if hasattr(resolver_match, 'kwargs') and resolver_match.kwargs:
            return resolver_match.kwargs.get(arg_name, '')
    except (AttributeError, TypeError):
        pass
    return ''

