# 📁 Scripts - GestAgro

Ce dossier contient les scripts utilitaires essentiels pour le projet GestAgro.

## 📋 Scripts disponibles

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

1. **Données de test** : Créées manuellement via shell Django
2. **Tests API** : Utiliser `test_api.py` dans le root du projet
3. **Tests Postman** : Utiliser la collection `GestAgro_API_Collection.json`
4. **Mise à jour Postman** : `python scripts/add_patch_to_postman.py` si nécessaire

## 📚 Documentation

Pour plus d'informations sur l'utilisation des scripts, consultez :
- [Guide de Développement](../md/development/GUIDE_DEVELOPPEMENT.md)
- [Documentation API](../md/api/DOCUMENTATION_API.md)
- [Données de Test](../md/DONNEES_TEST.md)

---

*Scripts GestAgro - Version 2.0 - 26/10/2025*
*Nettoyage effectué après création des données fraîches*