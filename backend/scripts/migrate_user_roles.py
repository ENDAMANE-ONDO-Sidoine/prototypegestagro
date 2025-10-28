"""
Script de migration des rôles utilisateurs existants
====================================================

Ce script met à jour les rôles 'member' vers les rôles spécifiques
(farmer, buyer, transporter, agronomist) basés sur les profils créés.

Usage:
    python manage.py shell < scripts/migrate_user_roles.py
    
    OU depuis le shell Django:
    python manage.py shell
    >>> exec(open('scripts/migrate_user_roles.py').read())

Auteur: GestAgro Team
Date: 2025-10-28
"""

import django
import os
import sys

# Configuration Django (si exécuté directement)
if __name__ == '__main__':
    # Ajouter le répertoire parent au PYTHONPATH
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gestagro.settings.base')
    django.setup()

from apps.iam.models import Membership, User
from django.db.models import Q

def migrate_user_roles(dry_run=False):
    """
    Migre les rôles 'member' vers les rôles spécifiques
    
    Args:
        dry_run (bool): Si True, affiche les changements sans les appliquer
    """
    print("=" * 80)
    print("🔄 MIGRATION DES RÔLES UTILISATEURS")
    print("=" * 80)
    print()
    
    # Récupérer toutes les memberships avec le rôle 'member'
    memberships_to_update = Membership.objects.filter(role='member').select_related('user')
    
    total_count = memberships_to_update.count()
    
    if total_count == 0:
        print("✅ Aucune membership avec le rôle 'member' trouvée.")
        print("   Tous les utilisateurs ont déjà des rôles spécifiques.")
        return
    
    print(f"📊 {total_count} membership(s) avec le rôle 'member' trouvée(s)\n")
    
    if dry_run:
        print("⚠️  MODE DRY-RUN: Les changements ne seront PAS sauvegardés\n")
    else:
        print("⚠️  MODE PRODUCTION: Les changements seront sauvegardés\n")
    
    # Compteurs
    stats = {
        'farmer': 0,
        'buyer': 0,
        'transporter': 0,
        'agronomist': 0,
        'member': 0,  # Reste 'member' (pas de profil spécifique)
        'errors': 0
    }
    
    for membership in memberships_to_update:
        user = membership.user
        old_role = membership.role
        new_role = determine_user_role(user)
        
        try:
            # Afficher le changement
            print(f"👤 {user.email} (ID: {user.id})")
            print(f"   Organisation: {membership.organization.name}")
            print(f"   Ancien rôle: '{old_role}'")
            print(f"   Nouveau rôle: '{new_role}'")
            
            # Appliquer le changement si pas en dry-run
            if not dry_run:
                membership.role = new_role
                membership.save()
                print(f"   ✅ Mis à jour avec succès")
            else:
                print(f"   🔍 Serait mis à jour (dry-run)")
            
            stats[new_role] += 1
            print()
            
        except Exception as e:
            print(f"   ❌ ERREUR: {str(e)}")
            stats['errors'] += 1
            print()
    
    # Afficher les statistiques finales
    print("=" * 80)
    print("📊 STATISTIQUES DE MIGRATION")
    print("=" * 80)
    print(f"Total traité: {total_count}")
    print(f"  - Farmers:      {stats['farmer']}")
    print(f"  - Buyers:       {stats['buyer']}")
    print(f"  - Transporters: {stats['transporter']}")
    print(f"  - Agronomists:  {stats['agronomist']}")
    print(f"  - Members:      {stats['member']} (aucun profil spécifique)")
    print(f"  - Erreurs:      {stats['errors']}")
    print("=" * 80)
    
    if dry_run:
        print("\n⚠️  Ceci était un DRY-RUN. Aucun changement n'a été appliqué.")
        print("   Pour appliquer les changements, exécutez:")
        print("   >>> migrate_user_roles(dry_run=False)")
    else:
        print("\n✅ Migration terminée avec succès!")
        print("   Les rôles ont été mis à jour dans la base de données.")


def determine_user_role(user):
    """
    Détermine le rôle approprié pour un utilisateur basé sur ses profils
    
    Priorité:
    1. FarmerProfile → farmer
    2. BuyerProfile → buyer
    3. TransporterProfile → transporter
    4. AgronomistProfile → agronomist
    5. Aucun profil → member
    
    Args:
        user (User): L'instance utilisateur
        
    Returns:
        str: Le rôle déterminé
    """
    # Vérifier les profils existants (avec underscores dans related_name)
    has_farmer_profile = hasattr(user, 'farmer_profile') and user.farmer_profile is not None
    has_buyer_profile = hasattr(user, 'buyer_profile') and user.buyer_profile is not None
    has_transporter_profile = hasattr(user, 'transporter_profile') and user.transporter_profile is not None
    has_agronomist_profile = hasattr(user, 'agronomist_profile') and user.agronomist_profile is not None
    
    # Déterminer le rôle selon la priorité
    if has_farmer_profile:
        return 'farmer'
    elif has_buyer_profile:
        return 'buyer'
    elif has_transporter_profile:
        return 'transporter'
    elif has_agronomist_profile:
        return 'agronomist'
    else:
        # Aucun profil spécifique trouvé
        return 'member'


def verify_migration():
    """
    Vérifie l'état de la migration des rôles
    """
    print("=" * 80)
    print("🔍 VÉRIFICATION DES RÔLES")
    print("=" * 80)
    print()
    
    # Compter les memberships par rôle
    roles = ['admin', 'manager', 'farmer', 'buyer', 'transporter', 'agronomist', 'member', 'viewer']
    
    print("📊 Distribution des rôles:")
    print()
    
    for role in roles:
        count = Membership.objects.filter(role=role).count()
        if count > 0:
            print(f"  {role:15} : {count:3} utilisateur(s)")
    
    print()
    
    # Vérifier les membres sans profil spécifique
    members = Membership.objects.filter(role='member').select_related('user')
    if members.exists():
        print(f"⚠️  {members.count()} utilisateur(s) avec le rôle 'member':")
        for membership in members:
            print(f"     - {membership.user.email} (Organisation: {membership.organization.name})")
        print()
    else:
        print("✅ Aucun utilisateur avec le rôle générique 'member'")
        print()
    
    print("=" * 80)


# Si exécuté directement
if __name__ == '__main__':
    print("\n🚀 Démarrage de la migration des rôles...\n")
    
    # D'abord, exécuter en mode dry-run
    migrate_user_roles(dry_run=True)
    
    # Demander confirmation
    print("\n" + "=" * 80)
    response = input("Voulez-vous appliquer ces changements? (oui/non): ")
    
    if response.lower() in ['oui', 'yes', 'y', 'o']:
        print("\n🚀 Application des changements...\n")
        migrate_user_roles(dry_run=False)
        print("\n🔍 Vérification post-migration...\n")
        verify_migration()
    else:
        print("\n❌ Migration annulée par l'utilisateur.")

# Si exécuté depuis le shell Django
else:
    print("\n📝 Script chargé. Vous pouvez exécuter:")
    print("   >>> migrate_user_roles(dry_run=True)   # Pour simuler")
    print("   >>> migrate_user_roles(dry_run=False)  # Pour appliquer")
    print("   >>> verify_migration()                 # Pour vérifier")
    print()

