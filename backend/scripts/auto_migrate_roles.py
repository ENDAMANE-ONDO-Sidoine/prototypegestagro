"""
Script d'auto-migration des rôles au démarrage (Render)
Ce script s'exécute automatiquement après le déploiement
"""
import os
import sys
import django

# Configuration Django
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gestagro.settings.production')
django.setup()

from apps.iam.models import Membership

def should_run_migration():
    """
    Vérifie si la migration doit être exécutée
    Retourne True si des memberships avec role='member' existent
    """
    count = Membership.objects.filter(role='member').count()
    return count > 0

def auto_migrate():
    """
    Exécute la migration automatique une seule fois
    """
    if not should_run_migration():
        print("✅ Aucune migration nécessaire. Tous les rôles sont déjà spécifiques.")
        return
    
    print("🔄 Migration automatique des rôles détectée...")
    
    # Importer et exécuter la migration
    from scripts.migrate_user_roles import migrate_user_roles
    
    try:
        migrate_user_roles(dry_run=False)
        print("✅ Migration automatique terminée avec succès!")
    except Exception as e:
        print(f"❌ Erreur lors de la migration automatique: {e}")
        sys.exit(1)

if __name__ == '__main__':
    auto_migrate()

