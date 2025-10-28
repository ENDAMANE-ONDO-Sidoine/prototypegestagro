# 📁 Scripts - GestAgro

Ce dossier contient les scripts utilitaires essentiels pour le projet GestAgro.

## 📋 Scripts disponibles

### 🔄 `migrate_user_roles.py` ⭐ IMPORTANT
**Description** : Migre les rôles utilisateurs existants de `'member'` vers les rôles spécifiques (`farmer`, `buyer`, `transporter`, `agronomist`) basés sur leurs profils.

**Usage** :
```bash
# Exécution directe (avec dry-run puis confirmation)
python scripts/migrate_user_roles.py

# OU via Django shell
python manage.py shell
>>> exec(open('scripts/migrate_user_roles.py').read())
>>> migrate_user_roles(dry_run=True)   # Simuler
>>> migrate_user_roles(dry_run=False)  # Appliquer
>>> verify_migration()                 # Vérifier
```

**Fonctionnalités** :
- Mode dry-run pour simuler les changements
- Détection automatique des rôles basée sur les profils
- Statistiques détaillées de migration
- Vérification post-migration
- Demande de confirmation avant application

**Documentation** : Voir `README_MIGRATE_ROLES.md` pour le guide complet

---

### 🔧 `add_patch_to_postman.py`
**Description** : Ajoute automatiquement les endpoints PATCH manquants à la collection Postman.

**Usage** :
```bash
python scripts/add_patch_to_postman.py
```

**Fonctionnalités** :
- Ajoute 11+ endpoints PATCH manquants
- Met à jour la collection Postman automatiquement
- Gère les noms de dossiers avec emojis
- Évite les doublons

## 🗑️ Scripts supprimés

Les scripts suivants ont été supprimés car ils ne sont plus nécessaires maintenant que nous avons des données fraîches et fonctionnelles :

### Scripts de création de données (supprimés) :
- `create_data.py` - Remplacé par la création manuelle via shell Django
- `create_fresh_data_simple.py` - Redondant
- `create_fresh_test_data.py` - Redondant
- `create_test_data.py` - Redondant
- `clean_all_data.py` - Remplacé par `python manage.py flush`

### Scripts de test (supprimés) :
- `test_patch_simple.py` - Fonctionnalité intégrée dans Postman
- `test_patch_endpoints.py` - Fonctionnalité intégrée dans Postman
- `test_categories.py` - Fonctionnalité testée via API
- `quick_test.py` - Remplacé par `test_api.py` dans le root
- `diagnostic_errors.py` - Non nécessaire avec données fraîches

### Scripts de maintenance (supprimés) :
- `cleanup_duplicates.py` - Non nécessaire avec données fraîches
- `fix_postgresql_sequences.py` - Non nécessaire avec données fraîches
- `migrate_organizations.py` - Migration déjà effectuée
- `redis_simple.py` - Non essentiel pour le développement
- `setup.sh` - Configuration déjà effectuée

## 🚀 Workflow actuel

1. **Migration des rôles** : `python scripts/migrate_user_roles.py` (à exécuter sur Render après déploiement)
2. **Données de test** : Créées manuellement via shell Django
3. **Tests API** : Utiliser `test_api.py` dans le root du projet
4. **Tests Postman** : Utiliser la collection `GestAgro_API_Collection.json`
5. **Mise à jour Postman** : `python scripts/add_patch_to_postman.py` si nécessaire

## 📚 Documentation

Pour plus d'informations sur l'utilisation des scripts, consultez :
- [README_MIGRATE_ROLES.md](README_MIGRATE_ROLES.md) - Guide complet de migration des rôles
- [Guide de Développement](../md/development/GUIDE_DEVELOPPEMENT.md)
- [Documentation API](../md/api/DOCUMENTATION_API.md)
- [Corrections Rôles et Permissions](../CORRECTIONS_ROLES_PERMISSIONS.md)

## 🗑️ Scripts temporaires supprimés (28/10/2025)

Les scripts de diagnostic suivants ont été supprimés après validation des corrections :
- ❌ `check_profiles.py` - Diagnostic des profils utilisateurs
- ❌ `check_orphan_profiles.py` - Vérification des profils orphelins
- ❌ `test_permissions.py` - Test des permissions après migration
- ❌ `SUMMARY_SCRIPTS.md` - Ancien résumé

---

*Scripts GestAgro - Version 2.1 - 28/10/2025*
*Ajout du script de migration des rôles utilisateurs*