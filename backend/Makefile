# Makefile pour GestAgro Backend

.PHONY: help setup build up down logs shell migrate makemigrations test lint format clean

help: ## Afficher l'aide
	@echo "Commandes disponibles:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

setup: ## Configuration initiale du projet
	@echo "Configuration initiale..."
	poetry install
	cp config.env .env
	@echo "Configuration terminée!"

build: ## Construire les images Docker
	@echo "Construction des images Docker..."
	docker-compose build

up: ## Démarrer tous les services
	@echo "Démarrage des services..."
	docker-compose up -d

down: ## Arrêter tous les services
	@echo "Arrêt des services..."
	docker-compose down

logs: ## Afficher les logs des services
	docker-compose logs -f

shell: ## Ouvrir un shell dans le conteneur web
	docker-compose exec web bash

migrate: ## Appliquer les migrations
	@echo "Application des migrations..."
	poetry run python manage.py migrate

makemigrations: ## Créer les migrations
	@echo "Création des migrations..."
	poetry run python manage.py makemigrations

test: ## Lancer les tests
	@echo "Lancement des tests..."
	poetry run pytest

lint: ## Vérifier le code avec les linters
	@echo "Vérification du code..."
	poetry run flake8 .
	poetry run mypy .
	poetry run bandit -r .

format: ## Formater le code
	@echo "Formatage du code..."
	poetry run black .
	poetry run isort .

clean: ## Nettoyer les fichiers temporaires
	@echo "Nettoyage..."
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	rm -rf .pytest_cache
	rm -rf .coverage
	rm -rf htmlcov

dev: ## Démarrer le serveur de développement
	@echo "Démarrage du serveur de développement..."
	poetry run python manage.py runserver 0.0.0.0:8000

superuser: ## Créer un superutilisateur
	@echo "Création d'un superutilisateur..."
	poetry run python manage.py createsuperuser

collectstatic: ## Collecter les fichiers statiques
	@echo "Collecte des fichiers statiques..."
	poetry run python manage.py collectstatic --noinput
