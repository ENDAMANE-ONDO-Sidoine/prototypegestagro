"""
Vues pour la documentation développeur de l'API GestAgro
"""
import json
import textwrap
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
        {
            'title': 'Démos Next.js',
            'description': 'Exemples pratiques pour consommer l\'API dans une application Next.js',
            'url': request.build_absolute_uri('/docs/frontend-demo/'),
            'icon': 'laptop-code',
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


def docs_frontend_demo(request):
    """
    Page de démonstration Next.js pour consommer l'API
    """
    base_url = request.build_absolute_uri('/api/v1/')
    api_info = {
        'title': 'GestAgro API',
        'version': getattr(settings, 'SPECTACULAR_SETTINGS', {}).get('VERSION', '1.0.0'),
    }
    actors = get_actors_data(base_url, request)

    style_presets = {
        'emerald': {
            'accent_text': 'text-emerald-600',
            'icon_bg': 'bg-emerald-100 text-emerald-600',
            'accent_ring': 'focus-visible:ring-emerald-400',
            'badge_class': 'bg-emerald-100 text-emerald-700',
            'border_class': 'border-emerald-200',
        },
        'lime': {
            'accent_text': 'text-lime-600',
            'icon_bg': 'bg-lime-100 text-lime-600',
            'accent_ring': 'focus-visible:ring-lime-400',
            'badge_class': 'bg-lime-100 text-lime-700',
            'border_class': 'border-lime-200',
        },
        'sky': {
            'accent_text': 'text-sky-600',
            'icon_bg': 'bg-sky-100 text-sky-600',
            'accent_ring': 'focus-visible:ring-sky-400',
            'badge_class': 'bg-sky-100 text-sky-700',
            'border_class': 'border-sky-200',
        },
        'amber': {
            'accent_text': 'text-amber-600',
            'icon_bg': 'bg-amber-100 text-amber-600',
            'accent_ring': 'focus-visible:ring-amber-400',
            'badge_class': 'bg-amber-100 text-amber-700',
            'border_class': 'border-amber-200',
        },
        'rose': {
            'accent_text': 'text-rose-600',
            'icon_bg': 'bg-rose-100 text-rose-600',
            'accent_ring': 'focus-visible:ring-rose-400',
            'badge_class': 'bg-rose-100 text-rose-700',
            'border_class': 'border-rose-200',
        },
        'purple': {
            'accent_text': 'text-purple-600',
            'icon_bg': 'bg-purple-100 text-purple-600',
            'accent_ring': 'focus-visible:ring-purple-400',
            'badge_class': 'bg-purple-100 text-purple-700',
            'border_class': 'border-purple-200',
        },
        'teal': {
            'accent_text': 'text-teal-600',
            'icon_bg': 'bg-teal-100 text-teal-600',
            'accent_ring': 'focus-visible:ring-teal-400',
            'badge_class': 'bg-teal-100 text-teal-700',
            'border_class': 'border-teal-200',
        },
    }

    def dedent(code: str) -> str:
        return textwrap.dedent(code).strip()

    demos = [
        {
            'slug': 'iam',
            'title': 'IAM & Organisations',
            'subtitle': 'Authentification, inscription et configuration organisationnelle',
            'color': 'emerald',
            'icon': 'fa-id-card',
            'summary': "Les routes d'IAM fournissent l'authentification JWT et les listes nécessaires aux formulaires (rôles, plans, organisations actives). Les tokens doivent être stockés dans des cookies HttpOnly via des actions serveur Next.js.",
            'meta_endpoint': '/api/v1/auth/meta/',
            'endpoints': [],
            'examples': [
                {
                    'id': 'login',
                    'title': 'Connexion utilisateur',
                    'method': 'POST',
                    'endpoint': '/api/v1/auth/login/',
                    'description': "Envoie les identifiants sur `/auth/login/` et stocke les tokens JWT dans des cookies HttpOnly.",
                    'snippet': {
                        'filename': 'app/api/auth/actions.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loginAction(formData: FormData) {
                              const payload = {
                                email: formData.get("email"),
                                password: formData.get("password"),
                              };

                              const res = await fetch(`${API_URL}/auth/login/`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(payload),
                                cache: "no-store",
                              });

                              if (!res.ok) {
                                const error = await res.json();
                                throw new Error(error.detail ?? "Connexion refusée");
                              }

                              const data = await res.json();
                              const cookieStore = cookies();
                              cookieStore.set("gestagro_access", data.access, {
                                httpOnly: true,
                                sameSite: "lax",
                                secure: process.env.NODE_ENV === "production",
                                path: "/",
                              });
                              cookieStore.set("gestagro_refresh", data.refresh, {
                                httpOnly: true,
                                sameSite: "lax",
                                secure: process.env.NODE_ENV === "production",
                                path: "/",
                              });

                              return data;
                            }
                        """),
                    },
                },
                {
                    'id': 'register',
                    'title': 'Inscription utilisateur',
                    'method': 'POST',
                    'endpoint': '/api/v1/auth/register/',
                    'description': "Crée un compte, renvoie les tokens et déclenche l'email de bienvenue.",
                    'snippet': {
                        'filename': 'app/api/auth/register.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function registerAction(payload: Record<string, unknown>) {
                              const res = await fetch(`${API_URL}/auth/register/`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(payload),
                              });

                              if (!res.ok) {
                                const detail = await res.json().catch(() => ({}));
                                throw new Error(detail.error ?? "Inscription impossible");
                              }

                              const data = await res.json();
                              const cookieStore = cookies();
                              const cookieOptions = {
                                httpOnly: true,
                                sameSite: "lax" as const,
                                secure: process.env.NODE_ENV === "production",
                                path: "/",
                              };
                              cookieStore.set("gestagro_access", data.access, cookieOptions);
                              cookieStore.set("gestagro_refresh", data.refresh, cookieOptions);

                              return data.user;
                            }
                        """),
                    },
                },
                {
                    'id': 'refresh',
                    'title': 'Rafraîchir le token',
                    'method': 'POST',
                    'endpoint': '/api/v1/auth/refresh/',
                    'description': "Utilise le refresh token pour obtenir un nouvel access token et met à jour les cookies.",
                    'snippet': {
                        'filename': 'app/api/auth/refresh.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function refreshTokens() {
                              const refresh = cookies().get("gestagro_refresh")?.value;
                              if (!refresh) throw new Error("Aucun refresh token");

                              const res = await fetch(`${API_URL}/auth/refresh/`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ refresh }),
                                cache: "no-store",
                              });

                              if (!res.ok) throw new Error("Refresh refusé");

                              const data = await res.json();
                              const cookieStore = cookies();
                              cookieStore.set("gestagro_access", data.access, {
                                httpOnly: true,
                                sameSite: "lax",
                                secure: process.env.NODE_ENV === "production",
                                path: "/",
                              });

                              return data.access;
                            }
                        """),
                    },
                },
                {
                    'id': 'verify-token',
                    'title': 'Vérifier un access token',
                    'method': 'POST',
                    'endpoint': '/api/v1/auth/verify/',
                    'description': "Valide localement un access token avant d'appeler des routes sensibles.",
                    'snippet': {
                        'filename': 'lib/auth/verify-token.ts',
                        'language': 'ts',
                        'code': dedent("""
                            export async function verifyAccessToken(token: string): Promise<boolean> {
                              const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";
                              const res = await fetch(`${API_URL}/auth/verify/`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ token }),
                                cache: "no-store",
                              });

                              return res.ok;
                            }
                        """),
                    },
                },
                {
                    'id': 'logout',
                    'title': 'Déconnexion',
                    'method': 'POST',
                    'endpoint': '/api/v1/auth/logout/',
                    'description': "Révoque le refresh token et supprime les cookies côté serveur.",
                    'snippet': {
                        'filename': 'app/api/auth/logout.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function logoutAction() {
                              const refresh = cookies().get("gestagro_refresh")?.value;

                              await fetch(`${API_URL}/auth/logout/`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ refresh }),
                              }).catch(() => null);

                              const store = cookies();
                              store.delete("gestagro_access");
                              store.delete("gestagro_refresh");
                            }
                        """),
                    },
                },
                {
                    'id': 'password-reset-request',
                    'title': 'Demander une réinitialisation',
                    'method': 'POST',
                    'endpoint': '/api/v1/auth/password/reset/',
                    'description': "Envoie l'email de réinitialisation de mot de passe.",
                    'snippet': {
                        'filename': 'app/api/auth/password-reset-request.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function requestPasswordReset(email: string) {
                              const res = await fetch(`${API_URL}/auth/password/reset/`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ email }),
                              });

                              if (!res.ok) {
                                const detail = await res.json().catch(() => ({}));
                                throw new Error(detail.error ?? "Envoi impossible");
                              }
                            }
                        """),
                    },
                },
                {
                    'id': 'password-reset-confirm',
                    'title': 'Confirmer la réinitialisation',
                    'method': 'POST',
                    'endpoint': '/api/v1/auth/password/reset/confirm/',
                    'description': "Applique le nouveau mot de passe à partir du lien reçu par email.",
                    'snippet': {
                        'filename': 'app/api/auth/password-reset-confirm.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function confirmPasswordReset(payload: {
                              uid: string;
                              token: string;
                              new_password: string;
                              new_password_confirm: string;
                            }) {
                              const res = await fetch(`${API_URL}/auth/password/reset/confirm/`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(payload),
                              });

                              if (!res.ok) {
                                const detail = await res.json().catch(() => ({}));
                                throw new Error(detail.error ?? "Lien expiré ou invalide");
                              }
                            }
                        """),
                    },
                },
                {
                    'id': 'verify-email-request',
                    'title': 'Relancer la vérification email',
                    'method': 'POST',
                    'endpoint': '/api/v1/auth/verify-email/request/',
                    'description': "Demande un nouvel email de vérification pour un utilisateur existant.",
                    'snippet': {
                        'filename': 'app/api/auth/verify-email-request.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function requestEmailVerification(email: string) {
                              const res = await fetch(`${API_URL}/auth/verify-email/request/`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ email }),
                              });

                              if (!res.ok) {
                                const detail = await res.json().catch(() => ({}));
                                throw new Error(detail.error ?? "Requête refusée");
                              }
                            }
                        """),
                    },
                },
                {
                    'id': 'verify-email-confirm',
                    'title': 'Valider le token email',
                    'method': 'POST',
                    'endpoint': '/api/v1/auth/verify-email/confirm/',
                    'description': "Valide le token de vérification reçu par email.",
                    'snippet': {
                        'filename': 'app/api/auth/verify-email-confirm.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function confirmEmailVerification(payload: { uid: string; token: string }) {
                              const res = await fetch(`${API_URL}/auth/verify-email/confirm/`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(payload),
                              });

                              if (!res.ok) {
                                const detail = await res.json().catch(() => ({}));
                                throw new Error(detail.error ?? "Validation impossible");
                              }
                            }
                        """),
                    },
                },
                {
                    'id': 'profile',
                    'title': 'Récupérer le profil',
                    'method': 'GET',
                    'endpoint': '/api/v1/auth/profile/',
                    'description': "Retourne les informations du profil connecté.",
                    'snippet': {
                        'filename': 'app/(dashboard)/profile/data.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadProfile() {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/auth/profile/`, {
                                headers: { Authorization: `Bearer ${token}` },
                                cache: "no-store",
                              });

                              if (!res.ok) throw new Error("Impossible de charger le profil");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'my-organizations',
                    'title': 'Lister mes organisations',
                    'method': 'GET',
                    'endpoint': '/api/v1/auth/my-organizations/',
                    'description': "Retourne les organisations actives de l'utilisateur courant.",
                    'snippet': {
                        'filename': 'app/(dashboard)/organizations/data.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadMyOrganizations() {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/auth/my-organizations/`, {
                                headers: { Authorization: `Bearer ${token}` },
                                cache: "no-store",
                              });

                              if (!res.ok) throw new Error("Organisations indisponibles");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'join-organization',
                    'title': 'Demander une adhésion',
                    'method': 'POST',
                    'endpoint': '/api/v1/auth/join-organization/',
                    'description': "Soumet une demande pour rejoindre une organisation ou changer de rôle.",
                    'snippet': {
                        'filename': 'app/(dashboard)/organizations/join-action.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";
                            import { revalidatePath } from "next/cache";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function joinOrganizationAction(organizationId: number, role = "member") {
                              const token = cookies().get("gestagro_access")?.value ?? "";

                              const res = await fetch(`${API_URL}/auth/join-organization/`, {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify({ organization_id: organizationId, role }),
                              });

                              if (!res.ok) {
                                const detail = await res.json().catch(() => ({}));
                                throw new Error(detail.error ?? "Impossible d'envoyer la demande");
                              }

                              revalidatePath("/dashboard/organizations");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'meta',
                    'title': 'Charger les métadonnées IAM',
                    'method': 'GET',
                    'endpoint': '/api/v1/auth/meta/',
                    'description': "Récupère rôles, plans et organisations actives pour les formulaires frontend.",
                    'snippet': {
                        'filename': 'app/api/auth/actions.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadIamMeta() {
                              const token = cookies().get("gestagro_access")?.value;
                              if (!token) return null;

                              const res = await fetch(`${API_URL}/auth/meta/`, {
                                headers: { Authorization: `Bearer ${token}` },
                                next: { revalidate: 300 },
                              });

                              if (!res.ok) throw new Error("Impossible de charger la configuration IAM");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'memberships',
                    'title': 'Consulter mes adhésions',
                    'method': 'GET',
                    'endpoint': '/api/v1/auth/memberships/',
                    'description': "Liste les adhésions associées à l'utilisateur connecté.",
                    'snippet': {
                        'filename': 'app/(dashboard)/organizations/memberships.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadMemberships() {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/auth/memberships/`, {
                                headers: { Authorization: `Bearer ${token}` },
                                cache: "no-store",
                              });

                              if (!res.ok) throw new Error("Impossible de charger les adhésions");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'roles',
                    'title': 'Lister les rôles globaux',
                    'method': 'GET',
                    'endpoint': '/api/v1/auth/roles/',
                    'description': "Expose l'ensemble des rôles disponibles (utile pour une console admin).",
                    'snippet': {
                        'filename': 'app/(admin)/settings/roles.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadRoles() {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/auth/roles/`, {
                                headers: { Authorization: `Bearer ${token}` },
                                next: { revalidate: 600 },
                              });

                              if (!res.ok) throw new Error("Rôles indisponibles");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'permissions',
                    'title': 'Lister les permissions',
                    'method': 'GET',
                    'endpoint': '/api/v1/auth/permissions/',
                    'description': "Récupère toutes les permissions déclarées pour construire une interface RBAC.",
                    'snippet': {
                        'filename': 'app/(admin)/settings/permissions.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadPermissions() {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/auth/permissions/`, {
                                headers: { Authorization: `Bearer ${token}` },
                                next: { revalidate: 600 },
                              });

                              if (!res.ok) throw new Error("Permissions indisponibles");
                              return res.json();
                            }
                        """),
                    },
                },
            ],
            'snippets': [],
            'tips': [
                "Exposez un provider de contexte (React) pour partager les données renvoyées par `/auth/meta/` dans tout le dashboard.",
                "Encapsulez les appels sensibles (login, refresh) dans des actions serveur pour éviter d'exposer les tokens au navigateur.",
            ],
        },
        {
            'slug': 'farmers',
            'title': 'Agriculteurs',
            'subtitle': 'Gestion des produits et catégories',
            'color': 'lime',
            'icon': 'fa-seedling',
            'summary': "Utilisez `/farmers/meta/` pour alimenter les listes (types de produit, classes qualité, catégories actives). Les créations/modifications passent par des actions serveur qui envoient le payload JSON au backend.",
            'meta_endpoint': '/api/v1/farmers/meta/',
            'endpoints': [],
            'examples': [
                {
                    'id': 'meta',
                    'title': 'Charger les métadonnées agriculteur',
                    'method': 'GET',
                    'endpoint': '/api/v1/farmers/meta/',
                    'description': "Récupère types de produit, classes qualité, unités animales, catégories actives et organisations.",
                    'snippet': {
                        'filename': 'app/(dashboard)/farmers/products/meta.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadFarmerMeta() {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/farmers/meta/`, {
                                headers: { Authorization: `Bearer ${token}` },
                                cache: "no-store",
                              });

                              if (!res.ok) throw new Error("Métadonnées agriculteur indisponibles");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'list-products',
                    'title': 'Lister les produits',
                    'method': 'GET',
                    'endpoint': '/api/v1/farmers/products/',
                    'description': "Retourne les produits de l'organisation connectée (filtres `product_type`, `status`).",
                    'snippet': {
                        'filename': 'app/(dashboard)/farmers/products/data.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadFarmerProducts(params: { product_type?: string; status?: string } = {}) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const query = new URLSearchParams(params as Record<string, string>);
                              const res = await fetch(`${API_URL}/farmers/products/?${query.toString()}`, {
                                headers: { Authorization: `Bearer ${token}` },
                                cache: "no-store",
                              });

                              if (!res.ok) throw new Error("Impossible de récupérer les produits");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'product-detail',
                    'title': 'Consulter un produit',
                    'method': 'GET',
                    'endpoint': '/api/v1/farmers/products/{id}/',
                    'description': "Charge les détails d'un produit (qualité, stock, informations animales, images).",
                    'snippet': {
                        'filename': 'app/(dashboard)/farmers/products/[productId]/data.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadProductDetail(productId: number) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/farmers/products/${productId}/`, {
                                headers: { Authorization: `Bearer ${token}` },
                                cache: "no-store",
                              });

                              if (!res.ok) throw new Error("Produit introuvable");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'create-product',
                    'title': 'Créer un produit',
                    'method': 'POST',
                    'endpoint': '/api/v1/farmers/products/',
                    'description': "Crée un nouveau produit en envoyant un payload JSON (prix, stock, type, attributs animaux).",
                    'snippet': {
                        'filename': 'app/(dashboard)/farmers/products/actions.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";
                            import { revalidatePath } from "next/cache";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function createProduct(payload: Record<string, unknown>) {
                              const token = cookies().get("gestagro_access")?.value ?? "";

                              const res = await fetch(`${API_URL}/farmers/products/`, {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify(payload),
                              });

                              if (!res.ok) {
                                const detail = await res.text();
                                throw new Error(detail || "Création impossible");
                              }

                              revalidatePath("/dashboard/farmers/products");
                            }
                        """),
                    },
                },
                {
                    'id': 'update-product',
                    'title': 'Mettre à jour un produit',
                    'method': 'PATCH',
                    'endpoint': '/api/v1/farmers/products/{id}/',
                    'description': "Met à jour un produit existant (stock, qualité, statut, métadonnées animales).",
                    'snippet': {
                        'filename': 'app/(dashboard)/farmers/products/update.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";
                            import { revalidatePath } from "next/cache";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function updateProduct(productId: number, payload: Record<string, unknown>) {
                              const token = cookies().get("gestagro_access")?.value ?? "";

                              const res = await fetch(`${API_URL}/farmers/products/${productId}/`, {
                                method: "PATCH",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify(payload),
                              });

                              if (!res.ok) {
                                const detail = await res.text();
                                throw new Error(detail || "Mise à jour impossible");
                              }

                              revalidatePath("/dashboard/farmers/products");
                            }
                        """),
                    },
                },
                {
                    'id': 'delete-product',
                    'title': 'Supprimer un produit',
                    'method': 'DELETE',
                    'endpoint': '/api/v1/farmers/products/{id}/',
                    'description': "Retire un produit du catalogue (utiliser pour les produits obsolètes).",
                    'snippet': {
                        'filename': 'app/(dashboard)/farmers/products/delete.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";
                            import { revalidatePath } from "next/cache";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function deleteProduct(productId: number) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/farmers/products/${productId}/`, {
                                method: "DELETE",
                                headers: { Authorization: `Bearer ${token}` },
                              });

                              if (!res.ok) {
                                const detail = await res.text();
                                throw new Error(detail || "Suppression impossible");
                              }

                              revalidatePath("/dashboard/farmers/products");
                            }
                        """),
                    },
                },
                {
                    'id': 'upload-image',
                    'title': 'Uploader une image produit',
                    'method': 'POST',
                    'endpoint': '/api/v1/farmers/products/{id}/images/',
                    'description': "Ajoute une image à un produit via un `FormData` depuis une route API Next.js.",
                    'snippet': {
                        'filename': 'app/api/farmers/products/[productId]/upload-image/route.ts',
                        'language': 'ts',
                        'code': dedent("""
                            import { NextRequest, NextResponse } from "next/server";
                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function POST(request: NextRequest, { params }: { params: { productId: string } }) {
                              const formData = await request.formData();
                              const token = cookies().get("gestagro_access")?.value ?? "";

                              const res = await fetch(`${API_URL}/farmers/products/${params.productId}/images/`, {
                                method: "POST",
                                headers: { Authorization: `Bearer ${token}` },
                                body: formData,
                              });

                              if (!res.ok) {
                                const detail = await res.text();
                                return NextResponse.json({ error: detail || "Upload refusé" }, { status: res.status });
                              }

                              return NextResponse.json(await res.json());
                            }
                        """),
                    },
                },
                {
                    'id': 'list-categories',
                    'title': 'Lister les catégories',
                    'method': 'GET',
                    'endpoint': '/api/v1/farmers/categories/',
                    'description': "Retourne les catégories actives (filtrable par type de produit ou parent).",
                    'snippet': {
                        'filename': 'app/(dashboard)/farmers/categories/data.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadCategories(params: { product_type?: string } = {}) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const query = new URLSearchParams(params as Record<string, string>);
                              const res = await fetch(`${API_URL}/farmers/categories/?${query.toString()}`, {
                                headers: { Authorization: `Bearer ${token}` },
                                cache: "no-store",
                              });

                              if (!res.ok) throw new Error("Impossible de charger les catégories");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'category-detail',
                    'title': 'Consulter une catégorie',
                    'method': 'GET',
                    'endpoint': '/api/v1/farmers/categories/{id}/',
                    'description': "Charge une catégorie unique avec son type de produit et son parent.",
                    'snippet': {
                        'filename': 'app/(dashboard)/farmers/categories/detail.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadCategoryDetail(categoryId: number) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/farmers/categories/${categoryId}/`, {
                                headers: { Authorization: `Bearer ${token}` },
                                cache: "no-store",
                              });

                              if (!res.ok) throw new Error("Catégorie introuvable");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'create-category',
                    'title': 'Créer une catégorie',
                    'method': 'POST',
                    'endpoint': '/api/v1/farmers/categories/',
                    'description': "Ajoute une nouvelle catégorie (parent optionnel, type de produit requis).",
                    'snippet': {
                        'filename': 'app/(dashboard)/farmers/categories/actions.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";
                            import { revalidatePath } from "next/cache";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function createCategory(payload: Record<string, unknown>) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/farmers/categories/`, {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify(payload),
                              });

                              if (!res.ok) {
                                const detail = await res.text();
                                throw new Error(detail || "Création de catégorie refusée");
                              }

                              revalidatePath("/dashboard/farmers/categories");
                            }
                        """),
                    },
                },
                {
                    'id': 'update-category',
                    'title': 'Modifier une catégorie',
                    'method': 'PATCH',
                    'endpoint': '/api/v1/farmers/categories/{id}/',
                    'description': "Met à jour une catégorie ou la désactive (`is_active=false`).",
                    'snippet': {
                        'filename': 'app/(dashboard)/farmers/categories/update.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";
                            import { revalidatePath } from "next/cache";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function updateCategory(categoryId: number, payload: Record<string, unknown>) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/farmers/categories/${categoryId}/`, {
                                method: "PATCH",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify(payload),
                              });

                              if (!res.ok) {
                                const detail = await res.text();
                                throw new Error(detail || "Mise à jour de catégorie impossible");
                              }

                              revalidatePath("/dashboard/farmers/categories");
                            }
                        """),
                    },
                },
                {
                    'id': 'profile-get',
                    'title': 'Consulter le profil agriculteur',
                    'method': 'GET',
                    'endpoint': '/api/v1/farmers/profile/',
                    'description': "Charge le profil agriculteur (surface, spécialisations, certifications).",
                    'snippet': {
                        'filename': 'app/(dashboard)/farmers/profile/data.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadFarmerProfile() {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/farmers/profile/`, {
                                headers: { Authorization: `Bearer ${token}` },
                                cache: "no-store",
                              });

                              if (!res.ok) throw new Error("Profil agriculteur indisponible");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'profile-update',
                    'title': 'Mettre à jour le profil',
                    'method': 'PATCH',
                    'endpoint': '/api/v1/farmers/profile/',
                    'description': "Met à jour le profil agriculteur. Pour la photo, envoyer un `FormData` dans une route API Next.js.",
                    'snippet': {
                        'filename': 'app/(dashboard)/farmers/profile/update.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function updateFarmerProfile(payload: Record<string, unknown>) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/farmers/profile/`, {
                                method: "PATCH",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify(payload),
                              });

                              if (!res.ok) {
                                const detail = await res.text();
                                throw new Error(detail || "Mise à jour du profil impossible");
                              }
                            }
                        """),
                    },
                },
                {
                    'id': 'reviews-list',
                    'title': 'Lister les avis',
                    'method': 'GET',
                    'endpoint': '/api/v1/farmers/products/{id}/reviews/',
                    'description': "Retourne les avis d’un produit pour analyse et réponse.",
                    'snippet': {
                        'filename': 'app/(dashboard)/farmers/reviews/data.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadProductReviews(productId: number) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/farmers/products/${productId}/reviews/`, {
                                headers: { Authorization: `Bearer ${token}` },
                                cache: "no-store",
                              });

                              if (!res.ok) throw new Error("Avis indisponibles");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'review-update',
                    'title': 'Mettre à jour un avis',
                    'method': 'PATCH',
                    'endpoint': '/api/v1/farmers/reviews/{id}/',
                    'description': "Met à jour un avis (statut, réponse, note ajustée si nécessaire).",
                    'snippet': {
                        'filename': 'app/(dashboard)/farmers/reviews/update.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function updateReview(reviewId: number, payload: Record<string, unknown>) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/farmers/reviews/${reviewId}/`, {
                                method: "PATCH",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify(payload),
                              });

                              if (!res.ok) {
                                const detail = await res.text();
                                throw new Error(detail || "Mise à jour de l'avis impossible");
                              }
                            }
                        """),
                    },
                },
                {
                    'id': 'dashboard-stats',
                    'title': 'Statistiques tableau de bord',
                    'method': 'GET',
                    'endpoint': '/api/v1/farmers/dashboard/stats/',
                    'description': "Récupère les KPIs (produits actifs, montant des ventes, moyenne des avis).",
                    'snippet': {
                        'filename': 'app/(dashboard)/farmers/overview/data.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadFarmerDashboardStats() {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/farmers/dashboard/stats/`, {
                                headers: { Authorization: `Bearer ${token}` },
                                cache: "no-store",
                              });

                              if (!res.ok) throw new Error("Statistiques indisponibles");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'products-stats',
                    'title': 'Statistiques produits détaillées',
                    'method': 'GET',
                    'endpoint': '/api/v1/farmers/products/stats/',
                    'description': "Renvoie les agrégats par catégorie, qualité, type de produit et top ventes.",
                    'snippet': {
                        'filename': 'app/(dashboard)/farmers/analytics/data.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadProductAnalytics() {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/farmers/products/stats/`, {
                                headers: { Authorization: `Bearer ${token}` },
                                cache: "no-store",
                              });

                              if (!res.ok) throw new Error("Analytique produits indisponible");
                              return res.json();
                            }
                        """),
                    },
                },
            ],
            'snippets': [],
            'tips': [
                "Pré-remplissez vos `<Select>` avec `meta.typesProduit`, `meta.classesQualite` et `meta.categories`.",
                "Réutilisez la même action serveur pour les éditions en envoyant un `PATCH` conditionnel si un identifiant existe.",
            ],
        },
        {
            'slug': 'buyers',
            'title': 'Acheteurs',
            'subtitle': 'Panier, commandes et listes de souhaits',
            'color': 'sky',
            'icon': 'fa-shopping-basket',
            'summary': "Les acheteurs combinent panier multi-organisation, commandes et listes de souhaits. Les appels se font toujours avec le JWT stocké en cookie HttpOnly.",
            'meta_endpoint': None,
            'endpoints': [],
            'examples': [
                {
                    'id': 'cart-load',
                    'title': 'Charger le panier d’une organisation',
                    'method': 'GET',
                    'endpoint': '/api/v1/buyers/cart/{organizationId}/',
                    'description': "Retourne le panier associé à l’organisation (items, totaux, informations acheteur).",
                    'snippet': {
                        'filename': 'app/(dashboard)/buyers/cart/data.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadBuyerCart(organizationId: number) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/buyers/cart/${organizationId}/`, {
                                headers: { Authorization: `Bearer ${token}` },
                                cache: "no-store",
                              });

                              if (!res.ok) throw new Error("Panier indisponible");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'cart-item-update',
                    'title': 'Mettre à jour la quantité d’un article',
                    'method': 'PATCH',
                    'endpoint': '/api/v1/buyers/cart/{cartId}/items/{itemId}/',
                    'description': "Ajuste la quantité d’un article existant dans le panier.",
                    'snippet': {
                        'filename': 'app/(dashboard)/buyers/cart/update-item.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";
                            import { revalidatePath } from "next/cache";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function updateCartItemQuantity(cartId: number, itemId: number, quantity: number) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/buyers/cart/${cartId}/items/${itemId}/`, {
                                method: "PATCH",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify({ quantity }),
                              });

                              if (!res.ok) {
                                const detail = await res.text();
                                throw new Error(detail || "Mise à jour de l'article impossible");
                              }

                              revalidatePath(`/dashboard/buyers/cart/${cartId}`);
                            }
                        """),
                    },
                },
                {
                    'id': 'cart-item-remove',
                    'title': 'Retirer un article du panier',
                    'method': 'DELETE',
                    'endpoint': '/api/v1/buyers/cart/{cartId}/items/{itemId}/',
                    'description': "Supprime un article du panier en appelant l’API en DELETE.",
                    'snippet': {
                        'filename': 'app/(dashboard)/buyers/cart/remove-item.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";
                            import { revalidatePath } from "next/cache";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function removeCartItem(cartId: number, itemId: number) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/buyers/cart/${cartId}/items/${itemId}/`, {
                                method: "DELETE",
                                headers: { Authorization: `Bearer ${token}` },
                              });

                              if (!res.ok) {
                                const detail = await res.text();
                                throw new Error(detail || "Suppression impossible");
                              }

                              revalidatePath(`/dashboard/buyers/cart/${cartId}`);
                            }
                        """),
                    },
                },
                {
                    'id': 'orders-list',
                    'title': 'Lister les commandes acheteur',
                    'method': 'GET',
                    'endpoint': '/api/v1/buyers/orders/',
                    'description': "Retourne l’historique des commandes de l’utilisateur connecté.",
                    'snippet': {
                        'filename': 'app/(dashboard)/buyers/orders/data.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadBuyerOrders(query: Record<string, string> = {}) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const params = new URLSearchParams(query);
                              const res = await fetch(`${API_URL}/buyers/orders/?${params.toString()}`, {
                                headers: { Authorization: `Bearer ${token}` },
                                cache: "no-store",
                              });

                              if (!res.ok) throw new Error("Commandes indisponibles");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'orders-create',
                    'title': 'Créer une commande',
                    'method': 'POST',
                    'endpoint': '/api/v1/buyers/orders/',
                    'description': "Finalise une commande à partir du panier et retourne le récapitulatif complet.",
                    'snippet': {
                        'filename': 'app/(dashboard)/buyers/orders/actions.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";
                            import { revalidatePath } from "next/cache";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function createOrder(payload: Record<string, unknown>) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/buyers/orders/`, {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify(payload),
                              });

                              if (!res.ok) {
                                const detail = await res.text();
                                throw new Error(detail || "Commande refusée");
                              }

                              revalidatePath("/dashboard/buyers/orders");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'order-detail',
                    'title': 'Consulter une commande',
                    'method': 'GET',
                    'endpoint': '/api/v1/buyers/orders/{orderId}/',
                    'description': "Retourne le détail d’une commande (articles, adresses, statut).",
                    'snippet': {
                        'filename': 'app/(dashboard)/buyers/orders/[orderId]/data.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadOrderDetail(orderId: number) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/buyers/orders/${orderId}/`, {
                                headers: { Authorization: `Bearer ${token}` },
                                cache: "no-store",
                              });

                              if (!res.ok) throw new Error("Commande introuvable");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'order-update',
                    'title': 'Mettre à jour une commande',
                    'method': 'PATCH',
                    'endpoint': '/api/v1/buyers/orders/{orderId}/',
                    'description': "Permet à l’acheteur d’ajuster certaines informations (note, adresse) tant que la commande n’est pas expédiée.",
                    'snippet': {
                        'filename': 'app/(dashboard)/buyers/orders/update.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";
                            import { revalidatePath } from "next/cache";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function updateOrder(orderId: number, payload: Record<string, unknown>) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/buyers/orders/${orderId}/`, {
                                method: "PATCH",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify(payload),
                              });

                              if (!res.ok) {
                                const detail = await res.text();
                                throw new Error(detail || "Mise à jour de la commande impossible");
                              }

                              revalidatePath(`/dashboard/buyers/orders/${orderId}`);
                            }
                        """),
                    },
                },
                {
                    'id': 'profile-load',
                    'title': 'Charger le profil acheteur',
                    'method': 'GET',
                    'endpoint': '/api/v1/buyers/profile/',
                    'description': "Retourne le profil acheteur (préférences, documents, organisation).",
                    'snippet': {
                        'filename': 'app/(dashboard)/buyers/profile/data.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadBuyerProfile() {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/buyers/profile/`, {
                                headers: { Authorization: `Bearer ${token}` },
                                cache: "no-store",
                              });

                              if (!res.ok) throw new Error("Profil acheteur indisponible");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'profile-update',
                    'title': 'Mettre à jour le profil',
                    'method': 'PATCH',
                    'endpoint': '/api/v1/buyers/profile/',
                    'description': "Met à jour les informations de l’acheteur. Pour les fichiers, utiliser un `FormData` dans une route API Next.js.",
                    'snippet': {
                        'filename': 'app/(dashboard)/buyers/profile/update.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function updateBuyerProfile(payload: Record<string, unknown>) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/buyers/profile/`, {
                                method: "PATCH",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify(payload),
                              });

                              if (!res.ok) {
                                const detail = await res.text();
                                throw new Error(detail || "Mise à jour du profil impossible");
                              }
                            }
                        """),
                    },
                },
                {
                    'id': 'wishlists-list',
                    'title': 'Lister les listes de souhaits',
                    'method': 'GET',
                    'endpoint': '/api/v1/buyers/wishlists/',
                    'description': "Retourne les listes de souhaits de l’acheteur avec leurs articles.",
                    'snippet': {
                        'filename': 'app/(dashboard)/buyers/wishlists/data.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadWishlists() {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/buyers/wishlists/`, {
                                headers: { Authorization: `Bearer ${token}` },
                                cache: "no-store",
                              });

                              if (!res.ok) throw new Error("Listes de souhaits indisponibles");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'wishlist-create',
                    'title': 'Créer une liste de souhaits',
                    'method': 'POST',
                    'endpoint': '/api/v1/buyers/wishlists/',
                    'description': "Crée une nouvelle liste (nom, visibilité, organisation liée).",
                    'snippet': {
                        'filename': 'app/(dashboard)/buyers/wishlists/actions.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";
                            import { revalidatePath } from "next/cache";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function createWishlist(payload: Record<string, unknown>) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/buyers/wishlists/`, {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify(payload),
                              });

                              if (!res.ok) {
                                const detail = await res.text();
                                throw new Error(detail || "Création de la liste impossible");
                              }

                              revalidatePath("/dashboard/buyers/wishlists");
                            }
                        """),
                    },
                },
                {
                    'id': 'wishlist-detail',
                    'title': 'Consulter une liste de souhaits',
                    'method': 'GET',
                    'endpoint': '/api/v1/buyers/wishlists/{wishlistId}/',
                    'description': "Charge la liste ciblée ainsi que ses articles.",
                    'snippet': {
                        'filename': 'app/(dashboard)/buyers/wishlists/[wishlistId]/data.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadWishlistDetail(wishlistId: number) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/buyers/wishlists/${wishlistId}/`, {
                                headers: { Authorization: `Bearer ${token}` },
                                cache: "no-store",
                              });

                              if (!res.ok) throw new Error("Liste de souhaits introuvable");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'wishlist-update',
                    'title': 'Renommer une liste de souhaits',
                    'method': 'PATCH',
                    'endpoint': '/api/v1/buyers/wishlists/{wishlistId}/',
                    'description': "Modifie le nom, la visibilité ou l’organisation cible d’une liste existante.",
                    'snippet': {
                        'filename': 'app/(dashboard)/buyers/wishlists/update.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";
                            import { revalidatePath } from "next/cache";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function updateWishlist(wishlistId: number, payload: Record<string, unknown>) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/buyers/wishlists/${wishlistId}/`, {
                                method: "PATCH",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify(payload),
                              });

                              if (!res.ok) {
                                const detail = await res.text();
                                throw new Error(detail || "Mise à jour de la liste impossible");
                              }

                              revalidatePath(`/dashboard/buyers/wishlists/${wishlistId}`);
                            }
                        """),
                    },
                },
                {
                    'id': 'wishlist-item-update',
                    'title': 'Modifier un article de liste de souhaits',
                    'method': 'PATCH',
                    'endpoint': '/api/v1/buyers/wishlists/{wishlistId}/items/{itemId}/',
                    'description': "Permet de déplacer un article vers une autre liste ou de modifier des métadonnées.",
                    'snippet': {
                        'filename': 'app/(dashboard)/buyers/wishlists/update-item.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";
                            import { revalidatePath } from "next/cache";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function updateWishlistItem(wishlistId: number, itemId: number, payload: Record<string, unknown>) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/buyers/wishlists/${wishlistId}/items/${itemId}/`, {
                                method: "PATCH",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify(payload),
                              });

                              if (!res.ok) {
                                const detail = await res.text();
                                throw new Error(detail || "Mise à jour de l'article impossible");
                              }

                              revalidatePath(`/dashboard/buyers/wishlists/${wishlistId}`);
                            }
                        """),
                    },
                },
                {
                    'id': 'wishlist-item-remove',
                    'title': 'Retirer un article de la liste',
                    'method': 'DELETE',
                    'endpoint': '/api/v1/buyers/wishlists/{wishlistId}/items/{itemId}/',
                    'description': "Supprime un article d’une liste de souhaits.",
                    'snippet': {
                        'filename': 'app/(dashboard)/buyers/wishlists/remove-item.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";
                            import { revalidatePath } from "next/cache";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function removeWishlistItem(wishlistId: number, itemId: number) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/buyers/wishlists/${wishlistId}/items/${itemId}/`, {
                                method: "DELETE",
                                headers: { Authorization: `Bearer ${token}` },
                              });

                              if (!res.ok) {
                                const detail = await res.text();
                                throw new Error(detail || "Suppression impossible");
                              }

                              revalidatePath(`/dashboard/buyers/wishlists/${wishlistId}`);
                            }
                        """),
                    },
                },
                {
                    'id': 'dashboard-stats',
                    'title': 'Charger les statistiques acheteur',
                    'method': 'GET',
                    'endpoint': '/api/v1/buyers/dashboard/stats/',
                    'description': "Retourne les indicateurs clés (commandes, panier, listes) pour le tableau de bord.",
                    'snippet': {
                        'filename': 'app/(dashboard)/buyers/overview/data.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadBuyerDashboardStats() {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/buyers/dashboard/stats/`, {
                                headers: { Authorization: `Bearer ${token}` },
                                cache: "no-store",
                              });

                              if (!res.ok) throw new Error("Statistiques acheteur indisponibles");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'orders-stats',
                    'title': 'Analyser les commandes',
                    'method': 'GET',
                    'endpoint': '/api/v1/buyers/orders/stats/',
                    'description': "Renvoie la répartition des commandes par statut, mois et produits les plus commandés.",
                    'snippet': {
                        'filename': 'app/(dashboard)/buyers/analytics/data.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadBuyerOrderStats() {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/buyers/orders/stats/`, {
                                headers: { Authorization: `Bearer ${token}` },
                                cache: "no-store",
                              });

                              if (!res.ok) throw new Error("Statistiques commandes indisponibles");
                              return res.json();
                            }
                        """),
                    },
                },
            ],
            'snippets': [],
            'tips': [
                "Stockez l’identifiant d’organisation courant dans votre contexte UI pour alimenter `/buyers/cart/{organizationId}/`.",
                "Rafraîchissez le panier et les listes via `revalidatePath` après chaque mutation pour garder l’UI synchrone.",
            ],
        },
        {
            'slug': 'notifications',
            'title': 'Notifications',
            'subtitle': 'Flux utilisateur et canaux de diffusion',
            'color': 'sky',
            'icon': 'fa-bell',
            'summary': "Les développeurs peuvent combiner `/notifications/meta/` et `/notifications/` pour afficher une boîte de réception. Les actions personnalisées (`mark_as_read`, `mark_all_as_read`) se consomment comme des mutations POST.",
            'meta_endpoint': '/api/v1/notifications/meta/',
            'endpoints': [],
            'examples': [
                {
                    'id': 'meta',
                    'title': 'Charger les métadonnées notification',
                    'method': 'GET',
                    'endpoint': '/api/v1/notifications/meta/',
                    'description': "Retourne les types de notifications, canaux supportés et statuts de canal.",
                    'snippet': {
                        'filename': 'app/(dashboard)/notifications/meta.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadNotificationsMeta() {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/notifications/meta/`, {
                                headers: { Authorization: `Bearer ${token}` },
                                next: { revalidate: 600 },
                              });

                              if (!res.ok) throw new Error("Impossible de charger les métadonnées notifications");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'notifications-list',
                    'title': 'Lister les notifications',
                    'method': 'GET',
                    'endpoint': '/api/v1/notifications/',
                    'description': "Récupère la boîte de réception (filtres par type, statut de lecture, recherche).",
                    'snippet': {
                        'filename': 'app/(dashboard)/notifications/data.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadNotifications(params: { unread_only?: boolean; type?: string } = {}) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const query = new URLSearchParams(
                                Object.fromEntries(
                                  Object.entries(params).map(([key, value]) => [key, String(value)])
                                )
                              );
                              const res = await fetch(`${API_URL}/notifications/?${query.toString()}`, {
                                headers: { Authorization: `Bearer ${token}` },
                                cache: "no-store",
                              });

                              if (!res.ok) throw new Error("Impossible de charger les notifications");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'notification-detail',
                    'title': 'Consulter une notification',
                    'method': 'GET',
                    'endpoint': '/api/v1/notifications/{id}/',
                    'description': "Retourne le détail d’une notification (message, métadonnées, canal).",
                    'snippet': {
                        'filename': 'app/(dashboard)/notifications/[notificationId]/data.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadNotification(notificationId: number) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/notifications/${notificationId}/`, {
                                headers: { Authorization: `Bearer ${token}` },
                                cache: "no-store",
                              });

                              if (!res.ok) throw new Error("Notification introuvable");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'notification-create',
                    'title': 'Créer une notification',
                    'method': 'POST',
                    'endpoint': '/api/v1/notifications/',
                    'description': "Permet d’envoyer une notification depuis le dashboard (administrateur).",
                    'snippet': {
                        'filename': 'app/(dashboard)/notifications/actions.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";
                            import { revalidatePath } from "next/cache";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function createNotification(payload: Record<string, unknown>) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/notifications/`, {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify(payload),
                              });

                              if (!res.ok) {
                                const detail = await res.text();
                                throw new Error(detail || "Notification non envoyée");
                              }

                              revalidatePath("/dashboard/notifications");
                            }
                        """),
                    },
                },
                {
                    'id': 'mark-as-read',
                    'title': 'Marquer une notification comme lue',
                    'method': 'POST',
                    'endpoint': '/api/v1/notifications/{id}/mark_as_read/',
                    'description': "Change le statut de lecture d’une notification ciblée.",
                    'snippet': {
                        'filename': 'app/(dashboard)/notifications/mark.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function markNotificationAsRead(notificationId: number) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/notifications/${notificationId}/mark_as_read/`, {
                                method: "POST",
                                headers: { Authorization: `Bearer ${token}` },
                              });

                              if (!res.ok) throw new Error("Échec du passage en lu");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'mark-all-as-read',
                    'title': 'Tout marquer comme lu',
                    'method': 'POST',
                    'endpoint': '/api/v1/notifications/mark_all_as_read/',
                    'description': "Bascule toutes les notifications non lues en statut lu.",
                    'snippet': {
                        'filename': 'app/(dashboard)/notifications/mark-all.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function markAllNotificationsAsRead() {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/notifications/mark_all_as_read/`, {
                                method: "POST",
                                headers: { Authorization: `Bearer ${token}` },
                              });

                              if (!res.ok) throw new Error("Impossible de tout marquer comme lu");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'unread-count',
                    'title': 'Compter les notifications non lues',
                    'method': 'GET',
                    'endpoint': '/api/v1/notifications/unread_count/',
                    'description': "Récupère le compteur non lu pour afficher un badge dans la barre supérieure.",
                    'snippet': {
                        'filename': 'app/(dashboard)/notifications/unread-count.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadUnreadCount() {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/notifications/unread_count/`, {
                                headers: { Authorization: `Bearer ${token}` },
                                cache: "no-store",
                              });

                              if (!res.ok) throw new Error("Compteur non lu indisponible");
                              return res.json();
                            }
                        """),
                    },
                },
            ],
            'snippets': [],
            'tips': [
                "Utilisez `meta.typesNotification` pour colorer vos badges dans l’UI.",
                "Le compteur `/notifications/unread_count/` peut être rafraîchi via un appel `cache: 'no-store'` dans une route API Next.js.",
            ],
        },
        {
            'slug': 'organizations',
            'title': 'Organisations',
            'subtitle': 'Gestion multi-tenant côté frontend',
            'color': 'amber',
            'icon': 'fa-building',
            'summary': "Le module organisations permet de créer et piloter les structures. Combinez `/auth/meta/` (plans, types) et `/organizations/` pour afficher ou créer des entités depuis le frontal.",
            'meta_endpoint': '/api/v1/auth/meta/',
            'endpoints': [
                {'method': 'GET', 'path': '/api/v1/organizations/', 'description': 'Lister les organisations dont l’utilisateur est membre.'},
                {'method': 'POST', 'path': '/api/v1/organizations/', 'description': 'Créer une nouvelle organisation.'},
                {'method': 'PATCH', 'path': '/api/v1/organizations/{id}/', 'description': 'Mettre à jour les informations d’une organisation.'},
            ],
            'snippets': [
                {
                    'filename': 'app/(dashboard)/organizations/actions.ts',
                    'language': 'ts',
                    'description': 'Chargement des organisations et création depuis une action serveur.',
                    'code': dedent("""
                        "use server";

                        import { cookies } from "next/headers";
                        import { revalidatePath } from "next/cache";

                        const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                        export async function loadOrganizations() {
                          const token = cookies().get("gestagro_access")?.value ?? "";
                          const res = await fetch(`${API_URL}/organizations/`, {
                            headers: { Authorization: `Bearer ${token}` },
                            cache: "no-store",
                          });

                          if (!res.ok) throw new Error("Impossible de récupérer les organisations");
                          return res.json();
                        }

                        export async function createOrganization(payload: Record<string, unknown>) {
                          const token = cookies().get("gestagro_access")?.value ?? "";
                          const res = await fetch(`${API_URL}/organizations/`, {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify(payload),
                          });

                          if (!res.ok) {
                            const detail = await res.text();
                            throw new Error(detail || "Création d'organisation impossible");
                          }

                          revalidatePath("/dashboard/organizations");
                        }
                    """),
                },
            ],
            'tips': [
                "Réutilisez les plans (`meta.plansOrganisation`) pour afficher un sélecteur de formule dans le formulaire de création.",
                "Après création, le backend ajoute automatiquement l'utilisateur comme administrateur de l'organisation.",
            ],
        },
        {
            'slug': 'payments',
            'title': 'Paiements',
            'subtitle': 'Paiements mobile money et suivi des tentatives',
            'color': 'rose',
            'icon': 'fa-credit-card',
            'summary': "Le frontal doit interroger `/payments/meta/` pour obtenir la liste des providers et types de paiements supportés. Les mutations se font en POST sur `/payments/` avec un payload orienté transaction.",
            'meta_endpoint': '/api/v1/payments/meta/',
            'endpoints': [],
            'examples': [
                {
                    'id': 'meta',
                    'title': 'Charger la configuration paiement',
                    'method': 'GET',
                    'endpoint': '/api/v1/payments/meta/',
                    'description': "Renvoie types de paiement, providers, statuts et transactions disponibles.",
                    'snippet': {
                        'filename': 'app/(dashboard)/payments/meta.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadPaymentMeta() {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/payments/meta/`, {
                                headers: { Authorization: `Bearer ${token}` },
                                next: { revalidate: 120 },
                              });

                              if (!res.ok) throw new Error("Impossible de charger la configuration paiement");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'payments-list',
                    'title': 'Lister les paiements',
                    'method': 'GET',
                    'endpoint': '/api/v1/payments/',
                    'description': "Liste les paiements initiés par l'utilisateur (filtres provider, statut, type).",
                    'snippet': {
                        'filename': 'app/(dashboard)/payments/data.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadPayments(params: { status?: string; provider?: string } = {}) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const query = new URLSearchParams(params as Record<string, string>);
                              const res = await fetch(`${API_URL}/payments/?${query.toString()}`, {
                                headers: { Authorization: `Bearer ${token}` },
                                cache: "no-store",
                              });

                              if (!res.ok) throw new Error("Impossible de charger les paiements");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'payment-create',
                    'title': 'Initier un paiement',
                    'method': 'POST',
                    'endpoint': '/api/v1/payments/',
                    'description': "Crée une transaction mobile money pour une commande ou une expédition.",
                    'snippet': {
                        'filename': 'app/(dashboard)/payments/actions.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";
                            import { revalidatePath } from "next/cache";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function createPayment(payload: Record<string, unknown>) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/payments/`, {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify(payload),
                              });

                              if (!res.ok) {
                                const detail = await res.text();
                                throw new Error(detail || "Paiement refusé");
                              }

                              revalidatePath("/dashboard/payments");
                            }
                        """),
                    },
                },
                {
                    'id': 'payment-detail',
                    'title': 'Consulter un paiement',
                    'method': 'GET',
                    'endpoint': '/api/v1/payments/{payment_id}/',
                    'description': "Affiche le détail d’une transaction (tentatives, statut, timestamps).",
                    'snippet': {
                        'filename': 'app/(dashboard)/payments/[paymentId]/data.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadPayment(paymentId: string) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/payments/${paymentId}/`, {
                                headers: { Authorization: `Bearer ${token}` },
                                cache: "no-store",
                              });

                              if (!res.ok) throw new Error("Paiement introuvable");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'webhook-events',
                    'title': 'Consulter les événements webhook',
                    'method': 'GET',
                    'endpoint': '/api/v1/payments/webhook-events/',
                    'description': "Permet de diagnostiquer les callbacks providers liés aux paiements de l’utilisateur.",
                    'snippet': {
                        'filename': 'app/(dashboard)/payments/webhook-events/data.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadWebhookEvents() {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/payments/webhook-events/`, {
                                headers: { Authorization: `Bearer ${token}` },
                                cache: "no-store",
                              });

                              if (!res.ok) throw new Error("Événements webhook indisponibles");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'webhook-handler',
                    'title': 'Publier un endpoint webhook Next.js',
                    'method': 'POST',
                    'endpoint': '/api/v1/payments/webhooks/{provider}/',
                    'description': "Expose une route API Next.js qui propage le webhook du provider vers Django.",
                    'snippet': {
                        'filename': 'app/api/payments/webhooks/[provider]/route.ts',
                        'language': 'ts',
                        'code': dedent("""
                            import { NextRequest, NextResponse } from "next/server";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function POST(request: NextRequest, { params }: { params: { provider: string } }) {
                              const body = await request.text();
                              const res = await fetch(`${API_URL}/payments/webhooks/${params.provider}/`, {
                                method: "POST",
                                headers: Object.fromEntries(request.headers),
                                body,
                              });

                              if (!res.ok) {
                                const detail = await res.text();
                                return NextResponse.json({ error: detail || "Webhook rejeté" }, { status: res.status });
                              }

                              return NextResponse.json(await res.json());
                            }
                        """),
                    },
                },
            ],
            'snippets': [],
            'tips': [
                "Affichez dynamiquement les providers disponibles via `meta.fournisseursPaiement`.",
                "Le statut `processing` peut être rafraîchi périodiquement avec `cache: 'no-store'` pour suivre les callbacks provider.",
            ],
        },
        {
            'slug': 'transport',
            'title': 'Transport',
            'subtitle': 'Gestion de flotte et expéditions',
            'color': 'purple',
            'icon': 'fa-truck',
            'summary': "Les transporteurs ont besoin des listes (véhicules, chauffeurs, routes) pour créer des expéditions. `/transport/meta/` renvoie toutes les données prêtes à l’emploi.",
            'meta_endpoint': '/api/v1/transport/meta/',
            'endpoints': [],
            'examples': [
                {
                    'id': 'meta',
                    'title': 'Charger les métadonnées transport',
                    'method': 'GET',
                    'endpoint': '/api/v1/transport/meta/',
                    'description': "Récupère les listes véhicules, chauffeurs, routes, types de charge et disponibilités.",
                    'snippet': {
                        'filename': 'app/(dashboard)/transport/meta.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadTransportMeta() {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/transport/meta/`, {
                                headers: { Authorization: `Bearer ${token}` },
                                cache: "no-store",
                              });

                              if (!res.ok) throw new Error("Métadonnées transport indisponibles");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'vehicles-list',
                    'title': 'Lister les véhicules',
                    'method': 'GET',
                    'endpoint': '/api/v1/transport/vehicles/',
                    'description': "Retourne la flotte du transporteur avec filtres (`vehicle_type`, `status`, `has_refrigeration`).",
                    'snippet': {
                        'filename': 'app/(dashboard)/transport/vehicles/data.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadVehicles(params: { vehicle_type?: string; status?: string } = {}) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const query = new URLSearchParams(params as Record<string, string>);
                              const res = await fetch(`${API_URL}/transport/vehicles/?${query.toString()}`, {
                                headers: { Authorization: `Bearer ${token}` },
                                cache: "no-store",
                              });

                              if (!res.ok) throw new Error("Impossible de charger les véhicules");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'vehicle-create',
                    'title': 'Créer un véhicule',
                    'method': 'POST',
                    'endpoint': '/api/v1/transport/vehicles/',
                    'description': "Ajoute un véhicule à la flotte (plaque, capacité, équipements spéciaux).",
                    'snippet': {
                        'filename': 'app/(dashboard)/transport/vehicles/actions.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";
                            import { revalidatePath } from "next/cache";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function createVehicle(payload: Record<string, unknown>) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/transport/vehicles/`, {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify(payload),
                              });

                              if (!res.ok) {
                                const detail = await res.text();
                                throw new Error(detail || "Création de véhicule refusée");
                              }

                              revalidatePath("/dashboard/transport/vehicles");
                            }
                        """),
                    },
                },
                {
                    'id': 'vehicle-detail',
                    'title': 'Consulter un véhicule',
                    'method': 'GET',
                    'endpoint': '/api/v1/transport/vehicles/{id}/',
                    'description': "Charge les informations détaillées d’un véhicule (capacité, état, documents).",
                    'snippet': {
                        'filename': 'app/(dashboard)/transport/vehicles/[vehicleId]/data.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadVehicle(vehicleId: number) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/transport/vehicles/${vehicleId}/`, {
                                headers: { Authorization: `Bearer ${token}` },
                                cache: "no-store",
                              });

                              if (!res.ok) throw new Error("Véhicule introuvable");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'vehicle-update',
                    'title': 'Mettre à jour un véhicule',
                    'method': 'PATCH',
                    'endpoint': '/api/v1/transport/vehicles/{id}/',
                    'description': "Met à jour l’état d’un véhicule (maintenance, disponibilité, documents).",
                    'snippet': {
                        'filename': 'app/(dashboard)/transport/vehicles/update.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";
                            import { revalidatePath } from "next/cache";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function updateVehicle(vehicleId: number, payload: Record<string, unknown>) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/transport/vehicles/${vehicleId}/`, {
                                method: "PATCH",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify(payload),
                              });

                              if (!res.ok) {
                                const detail = await res.text();
                                throw new Error(detail || "Mise à jour du véhicule impossible");
                              }

                              revalidatePath("/dashboard/transport/vehicles");
                            }
                        """),
                    },
                },
                {
                    'id': 'vehicles-available',
                    'title': 'Lister les véhicules disponibles',
                    'method': 'GET',
                    'endpoint': '/api/v1/transport/vehicles/available/',
                    'description': "Renvoie uniquement les véhicules libres pour planifier une expédition.",
                    'snippet': {
                        'filename': 'app/(dashboard)/transport/vehicles/available.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadAvailableVehicles() {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/transport/vehicles/available/`, {
                                headers: { Authorization: `Bearer ${token}` },
                                cache: "no-store",
                              });

                              if (!res.ok) throw new Error("Véhicules disponibles indisponibles");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'drivers-list',
                    'title': 'Lister les chauffeurs',
                    'method': 'GET',
                    'endpoint': '/api/v1/transport/drivers/',
                    'description': "Retourne les chauffeurs de l’organisation (filtres par permis ou statut).",
                    'snippet': {
                        'filename': 'app/(dashboard)/transport/drivers/data.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadDrivers(params: { license_type?: string; status?: string } = {}) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const query = new URLSearchParams(params as Record<string, string>);
                              const res = await fetch(`${API_URL}/transport/drivers/?${query.toString()}`, {
                                headers: { Authorization: `Bearer ${token}` },
                                cache: "no-store",
                              });

                              if (!res.ok) throw new Error("Impossible de charger les chauffeurs");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'driver-create',
                    'title': 'Créer un chauffeur',
                    'method': 'POST',
                    'endpoint': '/api/v1/transport/drivers/',
                    'description': "Enregistre un nouveau chauffeur avec son type de permis et certificats.",
                    'snippet': {
                        'filename': 'app/(dashboard)/transport/drivers/actions.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";
                            import { revalidatePath } from "next/cache";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function createDriver(payload: Record<string, unknown>) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/transport/drivers/`, {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify(payload),
                              });

                              if (!res.ok) {
                                const detail = await res.text();
                                throw new Error(detail || "Création de chauffeur refusée");
                              }

                              revalidatePath("/dashboard/transport/drivers");
                            }
                        """),
                    },
                },
                {
                    'id': 'driver-detail',
                    'title': 'Consulter un chauffeur',
                    'method': 'GET',
                    'endpoint': '/api/v1/transport/drivers/{id}/',
                    'description': "Charge le profil chauffeur (expérience, certifications, disponibilité).",
                    'snippet': {
                        'filename': 'app/(dashboard)/transport/drivers/[driverId]/data.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadDriver(driverId: number) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/transport/drivers/${driverId}/`, {
                                headers: { Authorization: `Bearer ${token}` },
                                cache: "no-store",
                              });

                              if (!res.ok) throw new Error("Chauffeur introuvable");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'driver-update',
                    'title': 'Mettre à jour un chauffeur',
                    'method': 'PATCH',
                    'endpoint': '/api/v1/transport/drivers/{id}/',
                    'description': "Met à jour le statut ou les documents d’un chauffeur existant.",
                    'snippet': {
                        'filename': 'app/(dashboard)/transport/drivers/update.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";
                            import { revalidatePath } from "next/cache";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function updateDriver(driverId: number, payload: Record<string, unknown>) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/transport/drivers/${driverId}/`, {
                                method: "PATCH",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify(payload),
                              });

                              if (!res.ok) {
                                const detail = await res.text();
                                throw new Error(detail || "Mise à jour du chauffeur impossible");
                              }

                              revalidatePath("/dashboard/transport/drivers");
                            }
                        """),
                    },
                },
                {
                    'id': 'drivers-available',
                    'title': 'Lister les chauffeurs disponibles',
                    'method': 'GET',
                    'endpoint': '/api/v1/transport/drivers/available/',
                    'description': "Utilise pour assigner rapidement un chauffeur libre à une expédition.",
                    'snippet': {
                        'filename': 'app/(dashboard)/transport/drivers/available.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadAvailableDrivers() {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/transport/drivers/available/`, {
                                headers: { Authorization: `Bearer ${token}` },
                                cache: "no-store",
                              });

                              if (!res.ok) throw new Error("Chauffeurs disponibles indisponibles");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'routes-list',
                    'title': 'Lister les routes',
                    'method': 'GET',
                    'endpoint': '/api/v1/transport/routes/',
                    'description': "Affiche les itinéraires configurés (filtres par ville, réfrigération, statut).",
                    'snippet': {
                        'filename': 'app/(dashboard)/transport/routes/data.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadRoutes(params: { origin_city?: string; destination_city?: string } = {}) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const query = new URLSearchParams(params as Record<string, string>);
                              const res = await fetch(`${API_URL}/transport/routes/?${query.toString()}`, {
                                headers: { Authorization: `Bearer ${token}` },
                                cache: "no-store",
                              });

                              if (!res.ok) throw new Error("Routes indisponibles");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'route-create',
                    'title': 'Créer une route',
                    'method': 'POST',
                    'endpoint': '/api/v1/transport/routes/',
                    'description': "Ajoute un nouvel itinéraire avec distance, prix de base et exigences spéciales.",
                    'snippet': {
                        'filename': 'app/(dashboard)/transport/routes/actions.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";
                            import { revalidatePath } from "next/cache";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function createRoute(payload: Record<string, unknown>) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/transport/routes/`, {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify(payload),
                              });

                              if (!res.ok) {
                                const detail = await res.text();
                                throw new Error(detail || "Création de route refusée");
                              }

                              revalidatePath("/dashboard/transport/routes");
                            }
                        """),
                    },
                },
                {
                    'id': 'route-update',
                    'title': 'Mettre à jour une route',
                    'method': 'PATCH',
                    'endpoint': '/api/v1/transport/routes/{id}/',
                    'description': "Met à jour une route (statut actif, coût, température requise).",
                    'snippet': {
                        'filename': 'app/(dashboard)/transport/routes/update.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";
                            import { revalidatePath } from "next/cache";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function updateRoute(routeId: number, payload: Record<string, unknown>) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/transport/routes/${routeId}/`, {
                                method: "PATCH",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify(payload),
                              });

                              if (!res.ok) {
                                const detail = await res.text();
                                throw new Error(detail || "Mise à jour de la route impossible");
                              }

                              revalidatePath("/dashboard/transport/routes");
                            }
                        """),
                    },
                },
                {
                    'id': 'shipments-list',
                    'title': 'Lister les expéditions',
                    'method': 'GET',
                    'endpoint': '/api/v1/transport/shipments/',
                    'description': "Récupère les expéditions en cours avec filtres (statut, priorité, véhicule, chauffeur).",
                    'snippet': {
                        'filename': 'app/(dashboard)/transport/shipments/data.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadShipments(params: { status?: string; driver?: number } = {}) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const query = new URLSearchParams(params as Record<string, string>);
                              const res = await fetch(`${API_URL}/transport/shipments/?${query.toString()}`, {
                                headers: { Authorization: `Bearer ${token}` },
                                cache: "no-store",
                              });

                              if (!res.ok) throw new Error("Impossible de charger les expéditions");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'shipment-create',
                    'title': 'Créer une expédition',
                    'method': 'POST',
                    'endpoint': '/api/v1/transport/shipments/',
                    'description': "Planifie une expédition (véhicule, chauffeur, route, dates de collecte/livraison).",
                    'snippet': {
                        'filename': 'app/(dashboard)/transport/shipments/actions.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";
                            import { revalidatePath } from "next/cache";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function createShipment(payload: Record<string, unknown>) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/transport/shipments/`, {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify(payload),
                              });

                              if (!res.ok) {
                                const detail = await res.text();
                                throw new Error(detail || "Création d'expédition impossible");
                              }

                              revalidatePath("/dashboard/transport/shipments");
                            }
                        """),
                    },
                },
                {
                    'id': 'shipment-detail',
                    'title': 'Consulter une expédition',
                    'method': 'GET',
                    'endpoint': '/api/v1/transport/shipments/{id}/',
                    'description': "Détail d’une expédition (tracking, véhicule, chauffeur, historique d’événements).",
                    'snippet': {
                        'filename': 'app/(dashboard)/transport/shipments/[shipmentId]/data.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadShipment(shipmentId: number) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/transport/shipments/${shipmentId}/`, {
                                headers: { Authorization: `Bearer ${token}` },
                                cache: "no-store",
                              });

                              if (!res.ok) throw new Error("Expédition introuvable");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'shipment-update',
                    'title': 'Mettre à jour une expédition',
                    'method': 'PATCH',
                    'endpoint': '/api/v1/transport/shipments/{id}/',
                    'description': "Actualise l’expédition (statut, chauffeur assigné, dates de livraison).",
                    'snippet': {
                        'filename': 'app/(dashboard)/transport/shipments/update.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";
                            import { revalidatePath } from "next/cache";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function updateShipment(shipmentId: number, payload: Record<string, unknown>) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/transport/shipments/${shipmentId}/`, {
                                method: "PATCH",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify(payload),
                              });

                              if (!res.ok) {
                                const detail = await res.text();
                                throw new Error(detail || "Mise à jour de l'expédition impossible");
                              }

                              revalidatePath(`/dashboard/transport/shipments/${shipmentId}`);
                            }
                        """),
                    },
                },
                {
                    'id': 'shipment-tracking',
                    'title': 'Ajouter un événement de suivi',
                    'method': 'POST',
                    'endpoint': '/api/v1/transport/shipments/{id}/tracking/',
                    'description': "Ajoute un point de tracking (scan, chargement, livraison) via une route API Next.js.",
                    'snippet': {
                        'filename': 'app/api/transport/shipments/[shipmentId]/tracking/route.ts',
                        'language': 'ts',
                        'code': dedent("""
                            import { NextRequest, NextResponse } from "next/server";
                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function POST(request: NextRequest, { params }: { params: { shipmentId: string } }) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const body = await request.json();

                              const res = await fetch(`${API_URL}/transport/shipments/${params.shipmentId}/tracking/`, {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify(body),
                              });

                              if (!res.ok) {
                                const detail = await res.text();
                                return NextResponse.json({ error: detail || "Événement non enregistré" }, { status: res.status });
                              }

                              return NextResponse.json(await res.json());
                            }
                        """),
                    },
                },
                {
                    'id': 'offers-list',
                    'title': 'Lister les offres de transport',
                    'method': 'GET',
                    'endpoint': '/api/v1/transport/offers/',
                    'description': "Affiche les offres soumises ou reçues pour les expéditions.",
                    'snippet': {
                        'filename': 'app/(dashboard)/transport/offers/data.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadTransportOffers(params: { status?: string } = {}) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const query = new URLSearchParams(params as Record<string, string>);
                              const res = await fetch(`${API_URL}/transport/offers/?${query.toString()}`, {
                                headers: { Authorization: `Bearer ${token}` },
                                cache: "no-store",
                              });

                              if (!res.ok) throw new Error("Offres de transport indisponibles");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'offer-create',
                    'title': 'Créer une offre de transport',
                    'method': 'POST',
                    'endpoint': '/api/v1/transport/offers/',
                    'description': "Propose une offre (prix, disponibilité) sur une expédition donnée.",
                    'snippet': {
                        'filename': 'app/(dashboard)/transport/offers/actions.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";
                            import { revalidatePath } from "next/cache";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function createTransportOffer(payload: Record<string, unknown>) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/transport/offers/`, {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify(payload),
                              });

                              if (!res.ok) {
                                const detail = await res.text();
                                throw new Error(detail || "Offre refusée");
                              }

                              revalidatePath("/dashboard/transport/offers");
                            }
                        """),
                    },
                },
                {
                    'id': 'offer-update',
                    'title': 'Mettre à jour une offre',
                    'method': 'PATCH',
                    'endpoint': '/api/v1/transport/offers/{id}/',
                    'description': "Ajuste le prix proposé ou l’état d’une offre de transport.",
                    'snippet': {
                        'filename': 'app/(dashboard)/transport/offers/update.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";
                            import { revalidatePath } from "next/cache";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function updateTransportOffer(offerId: number, payload: Record<string, unknown>) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/transport/offers/${offerId}/`, {
                                method: "PATCH",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify(payload),
                              });

                              if (!res.ok) {
                                const detail = await res.text();
                                throw new Error(detail || "Mise à jour de l'offre impossible");
                              }

                              revalidatePath("/dashboard/transport/offers");
                            }
                        """),
                    },
                },
                {
                    'id': 'profile-get',
                    'title': 'Consulter le profil transporteur',
                    'method': 'GET',
                    'endpoint': '/api/v1/transport/profile/',
                    'description': "Charge les informations du transporteur (zone couverte, certifications, flotte).",
                    'snippet': {
                        'filename': 'app/(dashboard)/transport/profile/data.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadTransporterProfile() {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/transport/profile/`, {
                                headers: { Authorization: `Bearer ${token}` },
                                cache: "no-store",
                              });

                              if (!res.ok) throw new Error("Profil transporteur indisponible");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'profile-update',
                    'title': 'Mettre à jour le profil transporteur',
                    'method': 'PATCH',
                    'endpoint': '/api/v1/transport/profile/',
                    'description': "Met à jour les informations de l’entreprise. Pour la photo, utilisez un `FormData` dans une route API Next.js.",
                    'snippet': {
                        'filename': 'app/(dashboard)/transport/profile/update.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function updateTransporterProfile(payload: Record<string, unknown>) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/transport/profile/`, {
                                method: "PATCH",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify(payload),
                              });

                              if (!res.ok) {
                                const detail = await res.text();
                                throw new Error(detail || "Mise à jour du profil impossible");
                              }
                            }
                        """),
                    },
                },
                {
                    'id': 'dashboard-stats',
                    'title': 'Statistiques transporteur',
                    'method': 'GET',
                    'endpoint': '/api/v1/transport/dashboard/stats/',
                    'description': "Récupère les KPIs transport (flotte active, expéditions en cours, chiffre).",
                    'snippet': {
                        'filename': 'app/(dashboard)/transport/overview/data.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadTransportDashboardStats() {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/transport/dashboard/stats/`, {
                                headers: { Authorization: `Bearer ${token}` },
                                cache: "no-store",
                              });

                              if (!res.ok) throw new Error("Statistiques transport indisponibles");
                              return res.json();
                            }
                        """),
                    },
                },
            ],
            'snippets': [],
            'tips': [
                "Filtrez les sélecteurs côté client en utilisant `meta.vehiculesDisponibles` et `meta.chauffeursDisponibles`.",
                "Le champ `meta.routesDisponibles` contient `typeVehiculeRequis` pour pré-filtrer les options lorsque l’utilisateur choisit un véhicule.",
            ],
        },
        {
            'slug': 'agronomy',
            'title': 'Agronomie',
            'subtitle': 'Diagnostics, recommandations et alertes météo',
            'color': 'teal',
            'icon': 'fa-microscope',
            'summary': "Consommez `/agronomy/meta/` pour alimenter tous les formulaires agronomiques : types de sol, cultures, diagnostics, recommandations. Les diagnostics et recommandations se soumettent via des POST/PATCH classiques.",
            'meta_endpoint': '/api/v1/agronomy/meta/',
            'endpoints': [],
            'examples': [
                {
                    'id': 'meta',
                    'title': 'Charger les référentiels agronomiques',
                    'method': 'GET',
                    'endpoint': '/api/v1/agronomy/meta/',
                    'description': "Rassemble types de sol, cultures, diagnostics, traitements, unités d’analyse.",
                    'snippet': {
                        'filename': 'app/(dashboard)/agronomy/meta.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadAgronomyMeta() {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/agronomy/meta/`, {
                                headers: { Authorization: `Bearer ${token}` },
                                cache: "no-store",
                              });

                              if (!res.ok) throw new Error("Impossible de charger les référentiels agronomiques");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'fields-list',
                    'title': 'Lister les champs',
                    'method': 'GET',
                    'endpoint': '/api/v1/agronomy/fields/',
                    'description': "Récupère les parcelles suivies par l’agronome (surface, culture active, statut).",
                    'snippet': {
                        'filename': 'app/(dashboard)/agronomy/fields/data.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadFields(params: { crop?: number } = {}) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const query = new URLSearchParams(params as Record<string, string>);
                              const res = await fetch(`${API_URL}/agronomy/fields/?${query.toString()}`, {
                                headers: { Authorization: `Bearer ${token}` },
                                cache: "no-store",
                              });

                              if (!res.ok) throw new Error("Impossible de charger les champs");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'field-detail',
                    'title': 'Consulter un champ',
                    'method': 'GET',
                    'endpoint': '/api/v1/agronomy/fields/{id}/',
                    'description': "Retourne les informations complètes du champ (cultures, recommandations, visites).",
                    'snippet': {
                        'filename': 'app/(dashboard)/agronomy/fields/[fieldId]/data.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadField(fieldId: number) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/agronomy/fields/${fieldId}/`, {
                                headers: { Authorization: `Bearer ${token}` },
                                cache: "no-store",
                              });

                              if (!res.ok) throw new Error("Champ introuvable");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'field-create',
                    'title': 'Créer un champ',
                    'method': 'POST',
                    'endpoint': '/api/v1/agronomy/fields/',
                    'description': "Enregistre une parcelle (surface, localisation, type de sol).",
                    'snippet': {
                        'filename': 'app/(dashboard)/agronomy/fields/actions.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";
                            import { revalidatePath } from "next/cache";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function createField(payload: Record<string, unknown>) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/agronomy/fields/`, {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify(payload),
                              });

                              if (!res.ok) {
                                const detail = await res.text();
                                throw new Error(detail || "Création de champ impossible");
                              }

                              revalidatePath("/dashboard/agronomy/fields");
                            }
                        """),
                    },
                },
                {
                    'id': 'field-update',
                    'title': 'Mettre à jour un champ',
                    'method': 'PATCH',
                    'endpoint': '/api/v1/agronomy/fields/{id}/',
                    'description': "Met à jour les données agronomiques d’une parcelle (sol, irrigation, statut).",
                    'snippet': {
                        'filename': 'app/(dashboard)/agronomy/fields/update.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";
                            import { revalidatePath } from "next/cache";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function updateField(fieldId: number, payload: Record<string, unknown>) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/agronomy/fields/${fieldId}/`, {
                                method: "PATCH",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify(payload),
                              });

                              if (!res.ok) {
                                const detail = await res.text();
                                throw new Error(detail || "Mise à jour du champ impossible");
                              }

                              revalidatePath(`/dashboard/agronomy/fields/${fieldId}`);
                            }
                        """),
                    },
                },
                {
                    'id': 'field-yield',
                    'title': 'Analyser le rendement',
                    'method': 'GET',
                    'endpoint': '/api/v1/agronomy/fields/{id}/yield-analysis/',
                    'description': "Renvoie les statistiques de rendement historiques d’une parcelle.",
                    'snippet': {
                        'filename': 'app/(dashboard)/agronomy/fields/[fieldId]/yield.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadFieldYield(fieldId: number) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/agronomy/fields/${fieldId}/yield-analysis/`, {
                                headers: { Authorization: `Bearer ${token}` },
                                cache: "no-store",
                              });

                              if (!res.ok) throw new Error("Analyse de rendement indisponible");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'crops-list',
                    'title': 'Lister les cultures suivies',
                    'method': 'GET',
                    'endpoint': '/api/v1/agronomy/crops/',
                    'description': "Affiche les cultures par parcelle (variété, densité de plantation, stade phénologique).",
                    'snippet': {
                        'filename': 'app/(dashboard)/agronomy/crops/data.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadCrops(params: { field?: number } = {}) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const query = new URLSearchParams(params as Record<string, string>);
                              const res = await fetch(`${API_URL}/agronomy/crops/?${query.toString()}`, {
                                headers: { Authorization: `Bearer ${token}` },
                                cache: "no-store",
                              });

                              if (!res.ok) throw new Error("Cultures indisponibles");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'crop-create',
                    'title': 'Créer une culture',
                    'method': 'POST',
                    'endpoint': '/api/v1/agronomy/crops/',
                    'description': "Associe une culture à un champ (variété, densité de plantation, dates clés).",
                    'snippet': {
                        'filename': 'app/(dashboard)/agronomy/crops/actions.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";
                            import { revalidatePath } from "next/cache";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function createCrop(payload: Record<string, unknown>) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/agronomy/crops/`, {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify(payload),
                              });

                              if (!res.ok) {
                                const detail = await res.text();
                                throw new Error(detail || "Création de culture refusée");
                              }

                              revalidatePath("/dashboard/agronomy/crops");
                            }
                        """),
                    },
                },
                {
                    'id': 'crop-detail',
                    'title': 'Consulter une culture',
                    'method': 'GET',
                    'endpoint': '/api/v1/agronomy/crops/{id}/',
                    'description': "Charge la culture et ses diagnostics/recommandations associés.",
                    'snippet': {
                        'filename': 'app/(dashboard)/agronomy/crops/[cropId]/data.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadCrop(cropId: number) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/agronomy/crops/${cropId}/`, {
                                headers: { Authorization: `Bearer ${token}` },
                                cache: "no-store",
                              });

                              if (!res.ok) throw new Error("Culture introuvable");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'crop-update',
                    'title': 'Mettre à jour une culture',
                    'method': 'PATCH',
                    'endpoint': '/api/v1/agronomy/crops/{id}/',
                    'description': "Actualise les informations d’une culture (stade, densité, santé).",
                    'snippet': {
                        'filename': 'app/(dashboard)/agronomy/crops/update.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";
                            import { revalidatePath } from "next/cache";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function updateCrop(cropId: number, payload: Record<string, unknown>) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/agronomy/crops/${cropId}/`, {
                                method: "PATCH",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify(payload),
                              });

                              if (!res.ok) {
                                const detail = await res.text();
                                throw new Error(detail || "Mise à jour de la culture impossible");
                              }

                              revalidatePath(`/dashboard/agronomy/crops/${cropId}`);
                            }
                        """),
                    },
                },
                {
                    'id': 'visits-list',
                    'title': 'Lister les visites de terrain',
                    'method': 'GET',
                    'endpoint': '/api/v1/agronomy/visits/',
                    'description': "Retourne l’historique des visites (observations, actions réalisées).",
                    'snippet': {
                        'filename': 'app/(dashboard)/agronomy/visits/data.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadFieldVisits(params: { field?: number } = {}) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const query = new URLSearchParams(params as Record<string, string>);
                              const res = await fetch(`${API_URL}/agronomy/visits/?${query.toString()}`, {
                                headers: { Authorization: `Bearer ${token}` },
                                cache: "no-store",
                              });

                              if (!res.ok) throw new Error("Visites indisponibles");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'visit-create',
                    'title': 'Créer une visite de terrain',
                    'method': 'POST',
                    'endpoint': '/api/v1/agronomy/visits/',
                    'description': "Enregistre une visite (date, observations, interventions).",
                    'snippet': {
                        'filename': 'app/(dashboard)/agronomy/visits/actions.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";
                            import { revalidatePath } from "next/cache";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function createFieldVisit(payload: Record<string, unknown>) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/agronomy/visits/`, {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify(payload),
                              });

                              if (!res.ok) {
                                const detail = await res.text();
                                throw new Error(detail || "Visite non enregistrée");
                              }

                              revalidatePath("/dashboard/agronomy/visits");
                            }
                        """),
                    },
                },
                {
                    'id': 'visit-detail',
                    'title': 'Consulter une visite',
                    'method': 'GET',
                    'endpoint': '/api/v1/agronomy/visits/{id}/',
                    'description': "Affiche les observations d’une visite spécifique (sol, climat, recommandations).",
                    'snippet': {
                        'filename': 'app/(dashboard)/agronomy/visits/[visitId]/data.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadFieldVisit(visitId: number) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/agronomy/visits/${visitId}/`, {
                                headers: { Authorization: `Bearer ${token}` },
                                cache: "no-store",
                              });

                              if (!res.ok) throw new Error("Visite introuvable");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'visit-update',
                    'title': 'Mettre à jour une visite',
                    'method': 'PATCH',
                    'endpoint': '/api/v1/agronomy/visits/{id}/',
                    'description': "Permet de compléter les notes d’une visite ou de changer son statut.",
                    'snippet': {
                        'filename': 'app/(dashboard)/agronomy/visits/update.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";
                            import { revalidatePath } from "next/cache";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function updateFieldVisit(visitId: number, payload: Record<string, unknown>) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/agronomy/visits/${visitId}/`, {
                                method: "PATCH",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify(payload),
                              });

                              if (!res.ok) {
                                const detail = await res.text();
                                throw new Error(detail || "Mise à jour de la visite impossible");
                              }

                              revalidatePath(`/dashboard/agronomy/visits/${visitId}`);
                            }
                        """),
                    },
                },
                {
                    'id': 'diagnostics-list',
                    'title': 'Lister les diagnostics',
                    'method': 'GET',
                    'endpoint': '/api/v1/agronomy/diagnostics/',
                    'description': "Affiche les diagnostics réalisés (stress hydrique, maladie, carences).",
                    'snippet': {
                        'filename': 'app/(dashboard)/agronomy/diagnostics/data.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadDiagnostics(params: { field?: number } = {}) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const query = new URLSearchParams(params as Record<string, string>);
                              const res = await fetch(`${API_URL}/agronomy/diagnostics/?${query.toString()}`, {
                                headers: { Authorization: `Bearer ${token}` },
                                cache: "no-store",
                              });

                              if (!res.ok) throw new Error("Diagnostics indisponibles");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'diagnostic-detail',
                    'title': 'Consulter un diagnostic',
                    'method': 'GET',
                    'endpoint': '/api/v1/agronomy/diagnostics/{id}/',
                    'description': "Affiche les conclusions, causes probables et traitements recommandés.",
                    'snippet': {
                        'filename': 'app/(dashboard)/agronomy/diagnostics/[diagnosticId]/data.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadDiagnostic(diagnosticId: number) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/agronomy/diagnostics/${diagnosticId}/`, {
                                headers: { Authorization: `Bearer ${token}` },
                                cache: "no-store",
                              });

                              if (!res.ok) throw new Error("Diagnostic introuvable");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'diagnostic-create',
                    'title': 'Créer un diagnostic',
                    'method': 'POST',
                    'endpoint': '/api/v1/agronomy/diagnostics/',
                    'description': "Enregistre un diagnostic (symptômes, type d’anomalie, recommandations rapides).",
                    'snippet': {
                        'filename': 'app/(dashboard)/agronomy/diagnostics/actions.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";
                            import { revalidatePath } from "next/cache";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function createDiagnostic(payload: Record<string, unknown>) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/agronomy/diagnostics/`, {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify(payload),
                              });

                              if (!res.ok) {
                                const detail = await res.text();
                                throw new Error(detail || "Diagnostic refusé");
                              }

                              revalidatePath("/dashboard/agronomy/diagnostics");
                            }
                        """),
                    },
                },
                {
                    'id': 'diagnostic-update',
                    'title': 'Mettre à jour un diagnostic',
                    'method': 'PATCH',
                    'endpoint': '/api/v1/agronomy/diagnostics/{id}/',
                    'description': "Complète ou corrige un diagnostic existant (résultat labo, évolution).",
                    'snippet': {
                        'filename': 'app/(dashboard)/agronomy/diagnostics/update.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";
                            import { revalidatePath } from "next/cache";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function updateDiagnostic(diagnosticId: number, payload: Record<string, unknown>) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/agronomy/diagnostics/${diagnosticId}/`, {
                                method: "PATCH",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify(payload),
                              });

                              if (!res.ok) {
                                const detail = await res.text();
                                throw new Error(detail || "Mise à jour du diagnostic impossible");
                              }

                              revalidatePath(`/dashboard/agronomy/diagnostics/${diagnosticId}`);
                            }
                        """),
                    },
                },
                {
                    'id': 'recommendations-list',
                    'title': 'Lister les recommandations',
                    'method': 'GET',
                    'endpoint': '/api/v1/agronomy/recommendations/',
                    'description': "Affiche les prescriptions agronomiques (intrants, calendrier d’intervention).",
                    'snippet': {
                        'filename': 'app/(dashboard)/agronomy/recommendations/data.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadRecommendations(params: { field?: number } = {}) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const query = new URLSearchParams(params as Record<string, string>);
                              const res = await fetch(`${API_URL}/agronomy/recommendations/?${query.toString()}`, {
                                headers: { Authorization: `Bearer ${token}` },
                                cache: "no-store",
                              });

                              if (!res.ok) throw new Error("Recommandations indisponibles");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'recommendation-detail',
                    'title': 'Consulter une recommandation',
                    'method': 'GET',
                    'endpoint': '/api/v1/agronomy/recommendations/{id}/',
                    'description': "Retourne le plan d’action détaillé (étapes, ressources, priorité).",
                    'snippet': {
                        'filename': 'app/(dashboard)/agronomy/recommendations/[recommendationId]/data.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadRecommendation(recommendationId: number) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/agronomy/recommendations/${recommendationId}/`, {
                                headers: { Authorization: `Bearer ${token}` },
                                cache: "no-store",
                              });

                              if (!res.ok) throw new Error("Recommandation introuvable");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'recommendation-create',
                    'title': 'Publier une recommandation',
                    'method': 'POST',
                    'endpoint': '/api/v1/agronomy/recommendations/',
                    'description': "Ajoute une recommandation agronome (produits, doses, calendrier).",
                    'snippet': {
                        'filename': 'app/(dashboard)/agronomy/recommendations/actions.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";
                            import { revalidatePath } from "next/cache";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function createRecommendation(payload: Record<string, unknown>) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/agronomy/recommendations/`, {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify(payload),
                              });

                              if (!res.ok) {
                                const detail = await res.text();
                                throw new Error(detail || "Publication impossible");
                              }

                              revalidatePath("/dashboard/agronomy/recommendations");
                            }
                        """),
                    },
                },
                {
                    'id': 'recommendation-update',
                    'title': 'Mettre à jour une recommandation',
                    'method': 'PATCH',
                    'endpoint': '/api/v1/agronomy/recommendations/{id}/',
                    'description': "Modifie une recommandation (ajout d’une étape, modification de dose).",
                    'snippet': {
                        'filename': 'app/(dashboard)/agronomy/recommendations/update.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";
                            import { revalidatePath } from "next/cache";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function updateRecommendation(recommendationId: number, payload: Record<string, unknown>) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/agronomy/recommendations/${recommendationId}/`, {
                                method: "PATCH",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify(payload),
                              });

                              if (!res.ok) {
                                const detail = await res.text();
                                throw new Error(detail || "Mise à jour de la recommandation impossible");
                              }

                              revalidatePath(`/dashboard/agronomy/recommendations/${recommendationId}`);
                            }
                        """),
                    },
                },
                {
                    'id': 'weather-create',
                    'title': 'Créer une alerte météo',
                    'method': 'POST',
                    'endpoint': '/api/v1/agronomy/weather-alerts/',
                    'description': "Publie une alerte (type, sévérité, zone impactée) pour prévenir les agriculteurs.",
                    'snippet': {
                        'filename': 'app/(dashboard)/agronomy/weather/actions.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";
                            import { revalidatePath } from "next/cache";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function createWeatherAlert(payload: Record<string, unknown>) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/agronomy/weather-alerts/`, {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify(payload),
                              });

                              if (!res.ok) {
                                const detail = await res.text();
                                throw new Error(detail || "Alerte météo refusée");
                              }

                              revalidatePath("/dashboard/agronomy/weather");
                            }
                        """),
                    },
                },
                {
                    'id': 'weather-detail',
                    'title': 'Consulter une alerte météo',
                    'method': 'GET',
                    'endpoint': '/api/v1/agronomy/weather-alerts/{id}/',
                    'description': "Retourne le détail d’une alerte (durée, recommandations, statut).",
                    'snippet': {
                        'filename': 'app/(dashboard)/agronomy/weather/[alertId]/data.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadWeatherAlert(alertId: number) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/agronomy/weather-alerts/${alertId}/`, {
                                headers: { Authorization: `Bearer ${token}` },
                                cache: "no-store",
                              });

                              if (!res.ok) throw new Error("Alerte météo introuvable");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'weather-alerts',
                    'title': 'Lister les alertes météo',
                    'method': 'GET',
                    'endpoint': '/api/v1/agronomy/weather-alerts/',
                    'description': "Affiche l’historique des alertes météo (type, intensité, zones concernées).",
                    'snippet': {
                        'filename': 'app/(dashboard)/agronomy/weather/data.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadWeatherAlerts() {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/agronomy/weather-alerts/`, {
                                headers: { Authorization: `Bearer ${token}` },
                                cache: "no-store",
                              });

                              if (!res.ok) throw new Error("Alertes météo indisponibles");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'weather-active',
                    'title': 'Récupérer les alertes actives',
                    'method': 'GET',
                    'endpoint': '/api/v1/agronomy/weather-alerts/active/',
                    'description': "Renvoie uniquement les alertes météo en cours pour affichage dans un bandeau temps réel.",
                    'snippet': {
                        'filename': 'app/(dashboard)/agronomy/weather/active.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadActiveWeatherAlerts() {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/agronomy/weather-alerts/active/`, {
                                headers: { Authorization: `Bearer ${token}` },
                                cache: "no-store",
                              });

                              if (!res.ok) throw new Error("Pas d'alertes météo actives");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'profile-get',
                    'title': 'Consulter le profil agronome',
                    'method': 'GET',
                    'endpoint': '/api/v1/agronomy/profile/',
                    'description': "Retourne les compétences, certifications et zones de couverture de l’agronome.",
                    'snippet': {
                        'filename': 'app/(dashboard)/agronomy/profile/data.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadAgronomistProfile() {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/agronomy/profile/`, {
                                headers: { Authorization: `Bearer ${token}` },
                                cache: "no-store",
                              });

                              if (!res.ok) throw new Error("Profil agronome indisponible");
                              return res.json();
                            }
                        """),
                    },
                },
                {
                    'id': 'profile-update',
                    'title': 'Mettre à jour le profil agronome',
                    'method': 'PATCH',
                    'endpoint': '/api/v1/agronomy/profile/',
                    'description': "Met à jour les informations professionnelles. Pour la photo, utiliser un `FormData`.",
                    'snippet': {
                        'filename': 'app/(dashboard)/agronomy/profile/update.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function updateAgronomistProfile(payload: Record<string, unknown>) {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/agronomy/profile/`, {
                                method: "PATCH",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify(payload),
                              });

                              if (!res.ok) {
                                const detail = await res.text();
                                throw new Error(detail || "Mise à jour du profil agronome impossible");
                              }
                            }
                        """),
                    },
                },
                {
                    'id': 'dashboard-stats',
                    'title': 'Statistiques agronomiques',
                    'method': 'GET',
                    'endpoint': '/api/v1/agronomy/dashboard/stats/',
                    'description': "KPIs agronomiques (champs suivis, diagnostics en cours, recommandations actives).",
                    'snippet': {
                        'filename': 'app/(dashboard)/agronomy/overview/data.ts',
                        'language': 'ts',
                        'code': dedent("""
                            "use server";

                            import { cookies } from "next/headers";

                            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestagro-api.onrender.com/api/v1";

                            export async function loadAgronomyDashboardStats() {
                              const token = cookies().get("gestagro_access")?.value ?? "";
                              const res = await fetch(`${API_URL}/agronomy/dashboard/stats/`, {
                                headers: { Authorization: `Bearer ${token}` },
                                cache: "no-store",
                              });

                              if (!res.ok) throw new Error("Statistiques agronomiques indisponibles");
                              return res.json();
                            }
                        """),
                    },
                },
            ],
            'snippets': [],
            'tips': [
                "La réponse de `/agronomy/meta/` contient `champsDisponibles` et `culturesDisponibles` pour hydrater les formulaires sans appels supplémentaires.",
                "Les recommandations peuvent réutiliser l’identifiant du diagnostic (`diagnosticId`) pour lier les deux entités côté UI.",
            ],
        },
    ]

    for demo in demos:
        preset = style_presets.get(demo['color'], style_presets['emerald'])
        demo.update(preset)

    context = {
        'api_info': api_info,
        'api_base_url': base_url,
        'actors': actors,
        'demos': demos,
        'swagger_url': request.build_absolute_uri('/api/docs/'),
        'redoc_url': request.build_absolute_uri('/api/redoc/'),
        'schema_url': request.build_absolute_uri('/api/schema/'),
        'version': api_info['version'],
    }
    return render(request, 'docs/frontend_demo.html', context)


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
  "name": "Tomates Bio Classe Extra",
  "description": "Tomates cerise biologiques classées Extra",
  "sku": "TOM-CER-001",
  "price": "1500.00",
  "currency": "XAF",
  "unit": "kg",
  "stock_quantity": 100,
  "min_order_quantity": 5,
  "max_order_quantity": 500,
  "quality_grade": "extra",
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
                                    'name': 'Maïs jaune Classe I',
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