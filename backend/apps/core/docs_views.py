"""
Vues pour la documentation développeur de l'API GestAgro
"""
import json
from django.shortcuts import render, get_object_or_404
from django.urls import reverse
from django.http import HttpResponse
from django.conf import settings
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView


def format_json(data):
    """
    Convertit un dictionnaire Python en chaîne JSON formatée
    """
    if isinstance(data, str):
        return data
    return json.dumps(data, indent=2, ensure_ascii=False)


def favicon_view(request):
    """
    Vue pour gérer les requêtes favicon.ico
    Retourne une réponse vide pour éviter les erreurs 404
    """
    return HttpResponse(status=204)


def api_home(request):
    """
    Page d'accueil publique de l'API (landing page)
    """
    base_url = request.build_absolute_uri('/api/v1/')
    context = {
        'api_info': {
            'title': 'GestAgro API',
            'tagline': "Connecter l'écosystème agricole du Gabon",
            'description': "Une API REST moderne pour relier agriculteurs, acheteurs, transporteurs et agronomes avec des outils sécurisés et performants.",
            'version': getattr(settings, 'SPECTACULAR_SETTINGS', {}).get('VERSION', '1.0.0'),
        },
        'api_base_url': base_url,
        'swagger_url': request.build_absolute_uri('/api/docs/'),
        'docs_url': request.build_absolute_uri(reverse('docs-home')),
    }
    return render(request, 'api_home.html', context)


def get_actors_data(base_url, request):
    """
    Récupère les données de tous les acteurs
    """
    return [
        {
            'icon': 'fa-seedling',
            'name': 'Agriculteurs',
            'slug': 'farmers',
            'description': 'Gestion des produits agricoles, catégories, stocks et statistiques de vente',
            'base_url': f'{base_url}farmers/',
            'swagger_url': request.build_absolute_uri('/api/docs/'),
            'key_endpoints': [
                {'method': 'GET', 'path': 'products/', 'description': 'Lister mes produits'},
                {'method': 'POST', 'path': 'products/', 'description': 'Créer un produit'},
                {'method': 'GET', 'path': 'dashboard/stats/', 'description': 'Statistiques tableau de bord'},
                {'method': 'POST', 'path': 'products/{id}/images/', 'description': 'Upload images produit'},
            ],
            'color': 'green',
        },
        {
            'icon': 'fa-cart-shopping',
            'name': 'Acheteurs',
            'slug': 'buyers',
            'description': 'Catalogue, paniers, commandes et listes de souhaits',
            'base_url': f'{base_url}buyers/',
            'swagger_url': request.build_absolute_uri('/api/docs/'),
            'key_endpoints': [
                {'method': 'GET', 'path': 'cart/{org_id}/', 'description': 'Gérer le panier'},
                {'method': 'POST', 'path': 'orders/', 'description': 'Passer une commande'},
                {'method': 'GET', 'path': 'orders/', 'description': 'Mes commandes'},
                {'method': 'GET', 'path': 'wishlists/', 'description': 'Listes de souhaits'},
            ],
            'color': 'blue',
        },
        {
            'icon': 'fa-truck',
            'name': 'Transporteurs',
            'slug': 'transport',
            'description': 'Gestion de flotte, expéditions, routes et offres de transport',
            'base_url': f'{base_url}transport/',
            'swagger_url': request.build_absolute_uri('/api/docs/'),
            'key_endpoints': [
                {'method': 'GET', 'path': 'vehicles/', 'description': 'Gérer les véhicules'},
                {'method': 'GET', 'path': 'drivers/', 'description': 'Gérer les chauffeurs'},
                {'method': 'GET', 'path': 'shipments/', 'description': 'Suivre les expéditions'},
                {'method': 'POST', 'path': 'offers/', 'description': 'Créer une offre'},
            ],
            'color': 'purple',
        },
        {
            'icon': 'fa-microscope',
            'name': 'Agronomes',
            'slug': 'agronomy',
            'description': 'Champs, cultures, diagnostics, recommandations et alertes météo',
            'base_url': f'{base_url}agronomy/',
            'swagger_url': request.build_absolute_uri('/api/docs/'),
            'key_endpoints': [
                {'method': 'GET', 'path': 'fields/', 'description': 'Gérer les champs'},
                {'method': 'GET', 'path': 'crops/', 'description': 'Suivre les cultures'},
                {'method': 'POST', 'path': 'diagnostics/', 'description': 'Créer un diagnostic'},
                {'method': 'GET', 'path': 'weather-alerts/active/', 'description': 'Alertes actives'},
            ],
            'color': 'yellow',
        },
    ]


def docs_home(request):
    """
    Page d'accueil de la documentation développeur (dynamique)
    """
    base_url = request.build_absolute_uri('/api/v1/')
    
    # Récupération des statistiques depuis la base de données
    stats = {}
    try:
        from apps.farmers.models import Product, Category
        from apps.buyers.models import Order
        from apps.transport.models import Vehicle, Driver, Shipment
        from apps.agronomy.models import Field, Crop
        from apps.iam.models import User
        from apps.organizations.models import Organization
        
        stats = {
            'total_users': User.objects.count(),
            'total_organizations': Organization.objects.count(),
            'total_products': Product.objects.count(),
            'active_products': Product.objects.filter(status='active').count(),
            'total_orders': Order.objects.count(),
            'total_vehicles': Vehicle.objects.count(),
            'total_fields': Field.objects.count(),
            'total_crops': Crop.objects.count(),
        }
    except Exception:
        stats = {}
    
    # Définition dynamique des acteurs avec leurs endpoints clés
    actors = get_actors_data(base_url, request)
    
    # Informations générales de l'API
    api_info = {
        'title': 'GestAgro API',
        'description': 'API REST complète pour la gestion agricole au Gabon. Connecte les agriculteurs, acheteurs, transporteurs et agronomes dans un écosystème unifié.',
        'version': getattr(settings, 'SPECTACULAR_SETTINGS', {}).get('VERSION', '1.0.0'),
        'base_url_production': 'https://gestagro-api.onrender.com/api/v1/' if not settings.DEBUG else base_url,
    }
    
    # Liens rapides avec descriptions dynamiques
    quick_links = [
        {
            'title': 'Swagger UI',
            'description': 'Interface interactive pour tester l\'API en temps réel',
            'url': request.build_absolute_uri('/api/docs/'),
            'icon': 'code',
        },
        {
            'title': 'ReDoc',
            'description': 'Documentation API en format lisible et élégant',
            'url': request.build_absolute_uri('/api/redoc/'),
            'icon': 'book',
        },
        {
            'title': 'Schéma OpenAPI',
            'description': 'Schéma JSON/YAML complet de l\'API (OpenAPI 3.0)',
            'url': request.build_absolute_uri('/api/schema/'),
            'icon': 'file',
        },
        {
            'title': 'Authentification',
            'description': 'Guide complet d\'authentification JWT et OAuth2',
            'url': f'{base_url}auth/login/',
            'icon': 'lock',
        },
    ]
    
    # Sections de démarrage rapide
    getting_started = [
        {
            'title': 'Démarrage rapide',
            'description': 'Commencez à utiliser l\'API en quelques minutes avec ce guide pas à pas',
            'icon': 'rocket',
            'color': 'green',
            'link': request.build_absolute_uri('/docs/quickstart/'),
            'external': False,
        },
        {
            'title': 'Essayer l\'API',
            'description': 'Testez l\'API directement dans Swagger UI avec des exemples interactifs',
            'icon': 'settings',
            'color': 'blue',
            'link': request.build_absolute_uri('/api/docs/'),
            'external': True,
        },
        {
            'title': 'Installation',
            'description': 'Configurez votre environnement et intégrez l\'API dans votre application',
            'icon': 'server',
            'color': 'purple',
            'link': request.build_absolute_uri('/docs/setup/'),
            'external': False,
        },
    ]
    
    context = {
        'api_base_url': base_url,
        'swagger_url': request.build_absolute_uri('/api/docs/'),
        'redoc_url': request.build_absolute_uri('/api/redoc/'),
        'schema_url': request.build_absolute_uri('/api/schema/'),
        'api_info': api_info,
        'actors': actors,
        'stats': stats,
        'quick_links': quick_links,
        'getting_started': getting_started,
        'version': api_info['version'],
        'settings': settings,
    }
    
    return render(request, 'docs/index.html', context)


def docs_concepts(request):
    """
    Page des concepts de l'API
    """
    base_url = request.build_absolute_uri('/api/v1/')
    api_info = {
        'title': 'GestAgro API',
        'version': getattr(settings, 'SPECTACULAR_SETTINGS', {}).get('VERSION', '1.0.0'),
    }
    
    actors = get_actors_data(base_url, request)
    context = {
        'api_info': api_info,
        'api_base_url': base_url,
        'swagger_url': request.build_absolute_uri('/api/docs/'),
        'redoc_url': request.build_absolute_uri('/api/redoc/'),
        'schema_url': request.build_absolute_uri('/api/schema/'),
        'actors': actors,
        'version': api_info['version'],
    }
    return render(request, 'docs/concepts.html', context)


def docs_authentication(request):
    """
    Page de documentation de l'authentification
    """
    base_url = request.build_absolute_uri('/api/v1/')
    api_info = {
        'title': 'GestAgro API',
        'version': getattr(settings, 'SPECTACULAR_SETTINGS', {}).get('VERSION', '1.0.0'),
    }
    
    actors = get_actors_data(base_url, request)
    context = {
        'api_info': api_info,
        'api_base_url': base_url,
        'swagger_url': request.build_absolute_uri('/api/docs/'),
        'redoc_url': request.build_absolute_uri('/api/redoc/'),
        'schema_url': request.build_absolute_uri('/api/schema/'),
        'actors': actors,
        'version': api_info['version'],
    }
    return render(request, 'docs/authentication.html', context)


def docs_examples(request):
    """
    Page d'exemples d'utilisation par acteur
    """
    base_url = request.build_absolute_uri('/api/v1/')
    actors = get_actors_data(base_url, request)
    api_info = {
        'title': 'GestAgro API',
        'version': getattr(settings, 'SPECTACULAR_SETTINGS', {}).get('VERSION', '1.0.0'),
    }
    
    context = {
        'api_info': api_info,
        'api_base_url': base_url,
        'actors': actors,
        'swagger_url': request.build_absolute_uri('/api/docs/'),
        'redoc_url': request.build_absolute_uri('/api/redoc/'),
        'schema_url': request.build_absolute_uri('/api/schema/'),
        'version': api_info['version'],
    }
    return render(request, 'docs/examples.html', context)


def docs_examples_actor(request, actor_slug):
    """
    Page d'exemples détaillés pour un acteur spécifique
    """
    base_url = request.build_absolute_uri('/api/v1/')
    actors = get_actors_data(base_url, request)
    actor = next((a for a in actors if a['slug'] == actor_slug), None)
    
    if not actor:
        from django.http import Http404
        raise Http404("Acteur non trouvé")
    
    api_info = {
        'title': 'GestAgro API',
        'version': getattr(settings, 'SPECTACULAR_SETTINGS', {}).get('VERSION', '1.0.0'),
    }
    
    # Exemples de code spécifiques par acteur
    examples = get_actor_examples(actor_slug, base_url)
    
    context = {
        'api_info': api_info,
        'actor': actor,
        'actors': actors,
        'api_base_url': base_url,
        'examples': examples,
        'swagger_url': request.build_absolute_uri('/api/docs/'),
        'redoc_url': request.build_absolute_uri('/api/redoc/'),
        'schema_url': request.build_absolute_uri('/api/schema/'),
        'version': api_info['version'],
    }
    return render(request, 'docs/examples_actor.html', context)


def get_actor_examples(actor_slug, base_url):
    """
    Retourne les exemples de code pour un acteur
    """
    # Convertir les dictionnaires en JSON formaté
    def json_str(data):
        return json.dumps(data, indent=2, ensure_ascii=False) if isinstance(data, dict) or isinstance(data, list) else data
    
    examples_data = {
        'farmers': {
            'title': 'Exemples pour les Agriculteurs',
            'description': 'Exemples pratiques d\'utilisation de l\'API pour gérer vos produits agricoles',
            'examples': [
                {
                    'title': '1. Créer un produit',
                    'description': 'Créer un nouveau produit agricole',
                    'request': {
                        'method': 'POST',
                        'url': f'{base_url}farmers/products/',
                        'headers': {
                            'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
                            'Content-Type': 'application/json',
                        },
                        'body': '''{
  "name": "Tomates Bio Cerise",
  "description": "Tomates cerise biologiques de qualité supérieure",
  "sku": "TOM-CER-001",
  "price": "1500.00",
  "currency": "XAF",
  "unit": "kg",
  "stock_quantity": 100,
  "min_order_quantity": 5,
  "max_order_quantity": 500,
  "quality_grade": "premium",
  "status": "active",
  "harvest_date": "2025-10-30",
  "origin_country": "Gabon",
  "organic_certified": true
}''',
                    },
                    'response': {
                        'status': 201,
                        'body': '''{
  "id": 1,
  "name": "Tomates Bio Cerise",
  "sku": "TOM-CER-001",
  "price": "1500.00",
  "stock_quantity": 100,
  "status": "active",
  "created_at": "2025-10-29T14:30:00Z"
}''',
                    },
                },
                {
                    'title': '2. Lister mes produits',
                    'description': 'Récupérer la liste de tous vos produits',
                    'request': {
                        'method': 'GET',
                        'url': f'{base_url}farmers/products/',
                        'headers': {
                            'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
                        },
                    },
                    'response': {
                        'status': 200,
                        'body': {
                            'count': 10,
                            'results': [
                                {
                                    'id': 1,
                                    'name': 'Tomates Bio Cerise',
                                    'price': '1500.00',
                                    'stock_quantity': 100,
                                    'status': 'active',
                                },
                            ],
                        },
                    },
                },
                {
                    'title': '3. Uploader une image produit',
                    'description': 'Ajouter une image à un produit',
                    'request': {
                        'method': 'POST',
                        'url': f'{base_url}farmers/products/1/images/',
                        'headers': {
                            'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
                        },
                        'body': {
                            'image': '<fichier image>',
                            'is_primary': True,
                        },
                    },
                    'response': {
                        'status': 201,
                        'body': {
                            'id': 1,
                            'image_url': 'https://...',
                            'is_primary': True,
                        },
                    },
                },
                {
                    'title': '4. Obtenir les statistiques',
                    'description': 'Récupérer les statistiques de votre tableau de bord',
                    'request': {
                        'method': 'GET',
                        'url': f'{base_url}farmers/dashboard/stats/',
                        'headers': {
                            'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
                        },
                    },
                    'response': {
                        'status': 200,
                        'body': {
                            'products': {
                                'total': 25,
                                'active': 20,
                                'out_of_stock': 2,
                            },
                            'sales': {
                                'total_amount': '125000.00',
                                'total_orders': 45,
                            },
                            'reviews': {
                                'total': 12,
                                'average_rating': 4.5,
                            },
                        },
                    },
                },
            ],
        },
        'buyers': {
            'title': 'Exemples pour les Acheteurs',
            'description': 'Exemples pratiques pour naviguer dans le catalogue et passer des commandes',
            'examples': [
                {
                    'title': '1. Rechercher des produits',
                    'description': 'Rechercher des produits dans le catalogue',
                    'request': {
                        'method': 'GET',
                        'url': f'{base_url}search/products/?q=mais',
                        'headers': {
                            'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
                        },
                    },
                    'response': {
                        'status': 200,
                        'body': {
                            'results': [
                                {
                                    'id': '1',
                                    'name': 'Maïs jaune premium',
                                    'price': 1200.0,
                                    'category': 'Céréales',
                                },
                            ],
                            'total': 1,
                        },
                    },
                },
                {
                    'title': '2. Ajouter au panier',
                    'description': 'Ajouter un produit au panier',
                    'request': {
                        'method': 'PUT',
                        'url': f'{base_url}buyers/cart/1/',
                        'headers': {
                            'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
                            'Content-Type': 'application/json',
                        },
                        'body': {
                            'items': [
                                {
                                    'product_id': 1,
                                    'quantity': 50,
                                },
                            ],
                        },
                    },
                    'response': {
                        'status': 200,
                        'body': {
                            'id': 1,
                            'items': [
                                {
                                    'product': {
                                        'id': 1,
                                        'name': 'Tomates Bio Cerise',
                                        'price': '1500.00',
                                    },
                                    'quantity': 50,
                                    'total': '75000.00',
                                },
                            ],
                            'total': '75000.00',
                        },
                    },
                },
                {
                    'title': '3. Passer une commande',
                    'description': 'Créer une commande à partir du panier',
                    'request': {
                        'method': 'POST',
                        'url': f'{base_url}buyers/orders/',
                        'headers': {
                            'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
                            'Content-Type': 'application/json',
                        },
                        'body': {
                            'seller_organization_id': 1,
                            'items': [
                                {
                                    'product_id': 1,
                                    'quantity': 50,
                                },
                            ],
                            'delivery_address': {
                                'street': '123 Rue de la Paix',
                                'city': 'Libreville',
                                'postal_code': '001',
                                'country': 'Gabon',
                            },
                            'delivery_date': '2025-11-05',
                        },
                    },
                    'response': {
                        'status': 201,
                        'body': {
                            'id': 1,
                            'order_number': 'ORD-2025-001',
                            'status': 'pending',
                            'total_amount': '75000.00',
                            'currency': 'XAF',
                        },
                    },
                },
                {
                    'title': '4. Créer une wishlist',
                    'description': 'Créer une liste de souhaits',
                    'request': {
                        'method': 'POST',
                        'url': f'{base_url}buyers/wishlists/',
                        'headers': {
                            'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
                            'Content-Type': 'application/json',
                        },
                        'body': {
                            'name': 'Produits Bio',
                            'items': [
                                {'product_id': 1},
                                {'product_id': 2},
                            ],
                        },
                    },
                    'response': {
                        'status': 201,
                        'body': {
                            'id': 1,
                            'name': 'Produits Bio',
                            'items_count': 2,
                        },
                    },
                },
            ],
        },
        'transport': {
            'title': 'Exemples pour les Transporteurs',
            'description': 'Exemples pour gérer votre flotte et suivre les expéditions',
            'examples': [
                {
                    'title': '1. Lister les véhicules disponibles',
                    'description': 'Récupérer la liste des véhicules disponibles',
                    'request': {
                        'method': 'GET',
                        'url': f'{base_url}transport/vehicles/available/',
                        'headers': {
                            'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
                        },
                    },
                    'response': {
                        'status': 200,
                        'body': [
                            {
                                'id': 1,
                                'license_plate': 'GA-123-AB',
                                'vehicle_type': 'truck',
                                'status': 'available',
                                'max_weight': 5000.00,
                            },
                        ],
                    },
                },
                {
                    'title': '2. Créer une expédition',
                    'description': 'Créer une nouvelle expédition',
                    'request': {
                        'method': 'POST',
                        'url': f'{base_url}transport/shipments/',
                        'headers': {
                            'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
                            'Content-Type': 'application/json',
                        },
                        'body': {
                            'order': 1,
                            'route': 1,
                            'vehicle': 1,
                            'driver': 1,
                            'scheduled_pickup_date': '2025-11-01T08:00:00Z',
                            'scheduled_delivery_date': '2025-11-01T14:00:00Z',
                            'total_weight': 150.50,
                            'total_volume': 2.5,
                            'transport_cost': '15000.00',
                        },
                    },
                    'response': {
                        'status': 201,
                        'body': {
                            'id': 1,
                            'tracking_number': 'TRK-A1B2C3D4',
                            'status': 'pending',
                            'transport_cost': '15000.00',
                        },
                    },
                },
                {
                    'title': '3. Ajouter un événement de suivi',
                    'description': 'Mettre à jour le statut d\'une expédition',
                    'request': {
                        'method': 'POST',
                        'url': f'{base_url}transport/shipments/1/tracking/',
                        'headers': {
                            'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
                            'Content-Type': 'application/json',
                        },
                        'body': {
                            'status': 'in_transit',
                            'location': {
                                'lat': 0.3927,
                                'lng': 9.4542,
                                'address': 'Route de Ntoum, Libreville',
                            },
                            'description': 'Colis en transit vers la destination',
                        },
                    },
                    'response': {
                        'status': 201,
                        'body': {
                            'id': 1,
                            'status': 'in_transit',
                            'timestamp': '2025-11-01T10:30:00Z',
                        },
                    },
                },
                {
                    'title': '4. Proposer une offre de transport',
                    'description': 'Créer une offre pour transporter une commande',
                    'request': {
                        'method': 'POST',
                        'url': f'{base_url}transport/offers/',
                        'headers': {
                            'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
                            'Content-Type': 'application/json',
                        },
                        'body': {
                            'shipment': 1,
                            'vehicle': 1,
                            'driver': 1,
                            'offered_price': '12000.00',
                            'estimated_pickup_date': '2025-11-01T08:00:00Z',
                            'estimated_delivery_date': '2025-11-01T14:00:00Z',
                        },
                    },
                    'response': {
                        'status': 201,
                        'body': {
                            'id': 1,
                            'offered_price': '12000.00',
                            'status': 'pending',
                        },
                    },
                },
            ],
        },
        'agronomy': {
            'title': 'Exemples pour les Agronomes',
            'description': 'Exemples pour gérer les champs, cultures et diagnostics',
            'examples': [
                {
                    'title': '1. Créer un champ',
                    'description': 'Enregistrer un nouveau champ agricole',
                    'request': {
                        'method': 'POST',
                        'url': f'{base_url}agronomy/fields/',
                        'headers': {
                            'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
                            'Content-Type': 'application/json',
                        },
                        'body': {
                            'name': 'Champ Nord',
                            'description': 'Champ principal de production de tomates',
                            'location': {
                                'lat': 0.3927,
                                'lng': 9.4542,
                                'address': 'Route de Ntoum, Libreville',
                            },
                            'area_hectares': '2.5',
                            'soil_type': 'loamy',
                            'ph_level': '6.5',
                            'irrigation_type': 'drip',
                        },
                    },
                    'response': {
                        'status': 201,
                        'body': {
                            'id': 1,
                            'name': 'Champ Nord',
                            'area_hectares': '2.5',
                            'soil_type': 'loamy',
                        },
                    },
                },
                {
                    'title': '2. Enregistrer une culture',
                    'description': 'Créer une nouvelle culture dans un champ',
                    'request': {
                        'method': 'POST',
                        'url': f'{base_url}agronomy/crops/',
                        'headers': {
                            'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
                            'Content-Type': 'application/json',
                        },
                        'body': {
                            'field': 1,
                            'name': 'Tomates Cerise',
                            'variety': 'Cherry Red',
                            'crop_type': 'vegetable',
                            'planting_date': '2025-09-15',
                            'expected_harvest_date': '2025-12-15',
                            'planted_area_hectares': '1.0',
                            'expected_yield_kg': '5000.00',
                            'season': 'rainy',
                        },
                    },
                    'response': {
                        'status': 201,
                        'body': {
                            'id': 1,
                            'name': 'Tomates Cerise',
                            'status': 'planted',
                            'planting_date': '2025-09-15',
                        },
                    },
                },
                {
                    'title': '3. Créer un diagnostic',
                    'description': 'Enregistrer un diagnostic agronomique',
                    'request': {
                        'method': 'POST',
                        'url': f'{base_url}agronomy/diagnostics/',
                        'headers': {
                            'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
                            'Content-Type': 'application/json',
                        },
                        'body': {
                            'field': 1,
                            'crop': 1,
                            'diagnostic_type': 'pest_disease',
                            'diagnosis_date': '2025-10-29T14:00:00Z',
                            'severity': 'moderate',
                            'findings': 'Présence de mildiou détectée sur les feuilles inférieures',
                            'recommended_treatment': 'Application de fongicide biologique',
                            'treatment_cost_xaf': '25000.00',
                        },
                    },
                    'response': {
                        'status': 201,
                        'body': {
                            'id': 1,
                            'diagnostic_type': 'pest_disease',
                            'severity': 'moderate',
                            'status': 'pending',
                        },
                    },
                },
                {
                    'title': '4. Planifier une visite de terrain',
                    'description': 'Créer une visite de terrain',
                    'request': {
                        'method': 'POST',
                        'url': f'{base_url}agronomy/visits/',
                        'headers': {
                            'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
                            'Content-Type': 'application/json',
                        },
                        'body': {
                            'field': 1,
                            'visit_type': 'routine',
                            'visit_date': '2025-11-05T09:00:00Z',
                            'duration_hours': 2.5,
                        },
                    },
                    'response': {
                        'status': 201,
                        'body': {
                            'id': 1,
                            'visit_type': 'routine',
                            'status': 'scheduled',
                        },
                    },
                },
            ],
        },
    }
    
    # Récupérer les exemples de l'acteur
    result = examples_data.get(actor_slug, {
        'title': 'Exemples',
        'description': 'Exemples d\'utilisation',
        'examples': [],
    })
    
    # Convertir tous les body de réponse en JSON formaté
    if 'examples' in result:
        for example in result['examples']:
            if 'response' in example and 'body' in example['response']:
                if isinstance(example['response']['body'], (dict, list)):
                    example['response']['body'] = json_str(example['response']['body'])
            if 'request' in example and 'body' in example['request']:
                if isinstance(example['request']['body'], (dict, list)):
                    if not isinstance(example['request']['body'], str):
                        example['request']['body'] = json_str(example['request']['body'])
    
    return result


def docs_quickstart(request):
    """
    Page de démarrage rapide
    """
    base_url = request.build_absolute_uri('/api/v1/')
    api_info = {
        'title': 'GestAgro API',
        'version': getattr(settings, 'SPECTACULAR_SETTINGS', {}).get('VERSION', '1.0.0'),
    }
    actors = get_actors_data(base_url, request)
    
    context = {
        'api_info': api_info,
        'api_base_url': base_url,
        'actors': actors,
        'swagger_url': request.build_absolute_uri('/api/docs/'),
        'redoc_url': request.build_absolute_uri('/api/redoc/'),
        'schema_url': request.build_absolute_uri('/api/schema/'),
        'version': api_info['version'],
    }
    return render(request, 'docs/quickstart.html', context)


def docs_reference(request):
    """
    Page de référence API
    """
    base_url = request.build_absolute_uri('/api/v1/')
    api_info = {
        'title': 'GestAgro API',
        'version': getattr(settings, 'SPECTACULAR_SETTINGS', {}).get('VERSION', '1.0.0'),
    }
    actors = get_actors_data(base_url, request)
    
    context = {
        'api_info': api_info,
        'api_base_url': base_url,
        'actors': actors,
        'swagger_url': request.build_absolute_uri('/api/docs/'),
        'redoc_url': request.build_absolute_uri('/api/redoc/'),
        'schema_url': request.build_absolute_uri('/api/schema/'),
        'version': api_info['version'],
    }
    return render(request, 'docs/reference.html', context)


def docs_errors(request):
    """
    Page de gestion des erreurs
    """
    base_url = request.build_absolute_uri('/api/v1/')
    api_info = {
        'title': 'GestAgro API',
        'version': getattr(settings, 'SPECTACULAR_SETTINGS', {}).get('VERSION', '1.0.0'),
    }
    actors = get_actors_data(base_url, request)
    
    context = {
        'api_info': api_info,
        'api_base_url': base_url,
        'actors': actors,
        'swagger_url': request.build_absolute_uri('/api/docs/'),
        'redoc_url': request.build_absolute_uri('/api/redoc/'),
        'schema_url': request.build_absolute_uri('/api/schema/'),
        'version': api_info['version'],
    }
    return render(request, 'docs/errors.html', context)


def docs_setup(request):
    """
    Page d'installation et configuration
    """
    base_url = request.build_absolute_uri('/api/v1/')
    api_info = {
        'title': 'GestAgro API',
        'version': getattr(settings, 'SPECTACULAR_SETTINGS', {}).get('VERSION', '1.0.0'),
    }
    actors = get_actors_data(base_url, request)
    
    context = {
        'api_info': api_info,
        'api_base_url': base_url,
        'actors': actors,
        'swagger_url': request.build_absolute_uri('/api/docs/'),
        'redoc_url': request.build_absolute_uri('/api/redoc/'),
        'schema_url': request.build_absolute_uri('/api/schema/'),
        'version': api_info['version'],
    }
    return render(request, 'docs/setup.html', context)


def docs_support(request):
    """
    Page de support
    """
    base_url = request.build_absolute_uri('/api/v1/')
    api_info = {
        'title': 'GestAgro API',
        'version': getattr(settings, 'SPECTACULAR_SETTINGS', {}).get('VERSION', '1.0.0'),
    }
    actors = get_actors_data(base_url, request)
    
    context = {
        'api_info': api_info,
        'api_base_url': base_url,
        'actors': actors,
        'swagger_url': request.build_absolute_uri('/api/docs/'),
        'redoc_url': request.build_absolute_uri('/api/redoc/'),
        'schema_url': request.build_absolute_uri('/api/schema/'),
        'version': api_info['version'],
    }
    return render(request, 'docs/support.html', context)


def docs_best_practices(request):
    """
    Page des bonnes pratiques
    """
    base_url = request.build_absolute_uri('/api/v1/')
    api_info = {
        'title': 'GestAgro API',
        'version': getattr(settings, 'SPECTACULAR_SETTINGS', {}).get('VERSION', '1.0.0'),
    }
    actors = get_actors_data(base_url, request)
    
    context = {
        'api_info': api_info,
        'api_base_url': base_url,
        'actors': actors,
        'swagger_url': request.build_absolute_uri('/api/docs/'),
        'redoc_url': request.build_absolute_uri('/api/redoc/'),
        'schema_url': request.build_absolute_uri('/api/schema/'),
        'version': api_info['version'],
    }
    return render(request, 'docs/best_practices.html', context)


def docs_webhooks(request):
    """
    Page de documentation des webhooks
    """
    base_url = request.build_absolute_uri('/api/v1/')
    api_info = {
        'title': 'GestAgro API',
        'version': getattr(settings, 'SPECTACULAR_SETTINGS', {}).get('VERSION', '1.0.0'),
    }
    actors = get_actors_data(base_url, request)
    
    context = {
        'api_info': api_info,
        'api_base_url': base_url,
        'actors': actors,
        'swagger_url': request.build_absolute_uri('/api/docs/'),
        'redoc_url': request.build_absolute_uri('/api/redoc/'),
        'schema_url': request.build_absolute_uri('/api/schema/'),
        'version': api_info['version'],
    }
    return render(request, 'docs/webhooks.html', context)


def docs_rate_limiting(request):
    """
    Page de documentation du rate limiting
    """
    base_url = request.build_absolute_uri('/api/v1/')
    api_info = {
        'title': 'GestAgro API',
        'version': getattr(settings, 'SPECTACULAR_SETTINGS', {}).get('VERSION', '1.0.0'),
    }
    actors = get_actors_data(base_url, request)
    
    context = {
        'api_info': api_info,
        'api_base_url': base_url,
        'actors': actors,
        'swagger_url': request.build_absolute_uri('/api/docs/'),
        'redoc_url': request.build_absolute_uri('/api/redoc/'),
        'schema_url': request.build_absolute_uri('/api/schema/'),
        'version': api_info['version'],
    }
    return render(request, 'docs/rate_limiting.html', context)


def docs_security(request):
    """
    Page de documentation de la sécurité
    """
    base_url = request.build_absolute_uri('/api/v1/')
    api_info = {
        'title': 'GestAgro API',
        'version': getattr(settings, 'SPECTACULAR_SETTINGS', {}).get('VERSION', '1.0.0'),
    }
    actors = get_actors_data(base_url, request)
    
    context = {
        'api_info': api_info,
        'api_base_url': base_url,
        'actors': actors,
        'swagger_url': request.build_absolute_uri('/api/docs/'),
        'redoc_url': request.build_absolute_uri('/api/redoc/'),
        'schema_url': request.build_absolute_uri('/api/schema/'),
        'version': api_info['version'],
    }
    return render(request, 'docs/security.html', context)


def docs_changelog(request):
    """
    Page du changelog
    """
    base_url = request.build_absolute_uri('/api/v1/')
    api_info = {
        'title': 'GestAgro API',
        'version': getattr(settings, 'SPECTACULAR_SETTINGS', {}).get('VERSION', '1.0.0'),
    }
    actors = get_actors_data(base_url, request)
    
    # Changelog dynamique (peut être chargé depuis un fichier JSON ou la base de données)
    changelog = [
        {
            'version': '1.0.0',
            'date': '2025-01-15',
            'type': 'release',
            'changes': [
                {'type': 'added', 'description': 'API REST complète pour tous les acteurs'},
                {'type': 'added', 'description': 'Authentification JWT avec refresh tokens'},
                {'type': 'added', 'description': 'Documentation développeur interactive'},
                {'type': 'added', 'description': 'Support multi-organisations'},
            ]
        },
    ]
    
    context = {
        'api_info': api_info,
        'api_base_url': base_url,
        'actors': actors,
        'changelog': changelog,
        'swagger_url': request.build_absolute_uri('/api/docs/'),
        'redoc_url': request.build_absolute_uri('/api/redoc/'),
        'schema_url': request.build_absolute_uri('/api/schema/'),
        'version': api_info['version'],
    }
    return render(request, 'docs/changelog.html', context)


def docs_performance(request):
    """
    Page de documentation sur les performances
    """
    base_url = request.build_absolute_uri('/api/v1/')
    api_info = {
        'title': 'GestAgro API',
        'version': getattr(settings, 'SPECTACULAR_SETTINGS', {}).get('VERSION', '1.0.0'),
    }
    actors = get_actors_data(base_url, request)
    
    context = {
        'api_info': api_info,
        'api_base_url': base_url,
        'actors': actors,
        'swagger_url': request.build_absolute_uri('/api/docs/'),
        'redoc_url': request.build_absolute_uri('/api/redoc/'),
        'schema_url': request.build_absolute_uri('/api/schema/'),
        'version': api_info['version'],
    }
    return render(request, 'docs/performance.html', context)


def docs_glossary(request):
    """
    Page du glossaire
    """
    base_url = request.build_absolute_uri('/api/v1/')
    api_info = {
        'title': 'GestAgro API',
        'version': getattr(settings, 'SPECTACULAR_SETTINGS', {}).get('VERSION', '1.0.0'),
    }
    actors = get_actors_data(base_url, request)
    
    # Glossaire dynamique
    glossary = [
        {'term': 'API', 'definition': 'Application Programming Interface - Interface de programmation permettant à des applications de communiquer entre elles.'},
        {'term': 'JWT', 'definition': 'JSON Web Token - Standard ouvert pour transmettre des informations sécurisées sous forme d\'objet JSON.'},
        {'term': 'REST', 'definition': 'Representational State Transfer - Style d\'architecture pour créer des services web.'},
        {'term': 'Endpoint', 'definition': 'Point d\'accès à une fonctionnalité spécifique de l\'API via une URL unique.'},
        {'term': 'Token', 'definition': 'Jeton d\'authentification utilisé pour accéder aux ressources protégées de l\'API.'},
        {'term': 'Refresh Token', 'definition': 'Token utilisé pour obtenir un nouveau token d\'accès sans ré-authentification.'},
        {'term': 'Rate Limiting', 'definition': 'Limitation du nombre de requêtes qu\'un utilisateur peut effectuer dans un délai donné.'},
        {'term': 'Webhook', 'definition': 'Mécanisme permettant à l\'API de notifier automatiquement une URL externe lors d\'événements.'},
        {'term': 'Pagination', 'definition': 'Technique pour diviser de grandes listes de résultats en pages plus petites.'},
        {'term': 'Multi-tenancy', 'definition': 'Architecture permettant à plusieurs organisations d\'utiliser la même instance d\'application.'},
        {'term': 'CRUD', 'definition': 'Create, Read, Update, Delete - Opérations de base sur les données.'},
        {'term': 'HTTPS', 'definition': 'HyperText Transfer Protocol Secure - Protocole HTTP sécurisé avec chiffrement SSL/TLS.'},
    ]
    
    context = {
        'api_info': api_info,
        'api_base_url': base_url,
        'actors': actors,
        'glossary': glossary,
        'swagger_url': request.build_absolute_uri('/api/docs/'),
        'redoc_url': request.build_absolute_uri('/api/redoc/'),
        'schema_url': request.build_absolute_uri('/api/schema/'),
        'version': api_info['version'],
    }
    return render(request, 'docs/glossary.html', context)


# Vues personnalisées pour la documentation API qui désactivent le throttling
class NoThrottleSpectacularAPIView(SpectacularAPIView):
    """Vue pour le schéma OpenAPI sans throttling"""
    throttle_classes = []
    throttle_scope = None


class NoThrottleSpectacularRedocView(SpectacularRedocView):
    """Vue pour Redoc sans throttling"""
    throttle_classes = []
    throttle_scope = None


class NoThrottleSpectacularSwaggerView(SpectacularSwaggerView):
    """Vue pour Swagger UI sans throttling"""
    throttle_classes = []
    throttle_scope = None

