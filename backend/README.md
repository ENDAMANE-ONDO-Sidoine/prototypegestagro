# GestAgro Backend

Backend API pour la plateforme GestAgro - Plateforme de gestion agricole intégrée.

## Architecture

- **Framework** : Django 5 LTS
- **API** : Django REST Framework
- **Base de données** : PostgreSQL 16
- **Cache** : Redis 7
- **Stockage** : MinIO/S3
- **Recherche** : OpenSearch
- **Tâches asynchrones** : Celery

## Installation

### Prérequis

- Python 3.12+
- Docker & Docker Compose
- Poetry

### Démarrage rapide

```bash
# Cloner le projet
git clone <repository-url>
cd backend

# Installer les dépendances
poetry install

# Démarrer les services
docker-compose up -d

# Appliquer les migrations
poetry run python manage.py migrate

# Créer un superutilisateur
poetry run python manage.py createsuperuser

# Démarrer le serveur de développement
poetry run python manage.py runserver
```

## Structure du projet

```
backend/
├── gestagro/                 # Configuration Django principale
│   ├── settings/            # Paramètres par environnement
│   ├── urls.py             # URLs principales
│   └── wsgi.py             # Configuration WSGI
├── apps/                    # Applications Django
│   ├── core/               # Utilitaires communs
│   ├── iam/                # Identity & Access Management
│   ├── organizations/      # Gestion des organisations
│   ├── agro/               # Gestion agricole
│   ├── marketplace/        # Marketplace et commandes
│   ├── logistics/          # Logistique et transport
│   ├── advisory/           # Services d'accompagnement
│   ├── ngo/                # Programmes ONG
│   ├── collaboration/      # Communication et collaboration
│   ├── documents/          # Gestion documentaire
│   ├── analytics/          # Analytics et reporting
│   └── integrations/       # Intégrations externes
├── docker/                 # Configuration Docker
├── tests/                  # Tests automatisés
└── docs/                   # Documentation
```

## Environnements

- **Développement** : `gestagro.settings.development`
- **Production** : `gestagro.settings.production`
- **Test** : `gestagro.settings.test`

## API Documentation

Une fois le serveur démarré, la documentation API est disponible à :
- Swagger UI : http://localhost:8000/api/docs/
- ReDoc : http://localhost:8000/api/redoc/

## Tests

```bash
# Lancer tous les tests
poetry run pytest

# Tests avec couverture
poetry run pytest --cov=gestagro

# Tests spécifiques
poetry run pytest apps/marketplace/tests/
```

## Qualité du code

```bash
# Formatage
poetry run black .
poetry run isort .

# Linting
poetry run flake8
poetry run mypy

# Sécurité
poetry run bandit -r .
poetry run safety check
```

## Déploiement

Le projet est configuré pour être déployé avec Docker et Kubernetes. Voir la documentation de déploiement dans `docs/deployment/`.

## Contribution

Voir `CONTRIBUTING.md` pour les guidelines de contribution.

## Licence

Propriétaire - GestAgro Team
