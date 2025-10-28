# 🔄 Script de Migration des Rôles Utilisateurs

## 📋 Description

Ce script permet de migrer les utilisateurs existants ayant le rôle générique `'member'` vers leurs rôles spécifiques (`farmer`, `buyer`, `transporter`, `agronomist`) basés sur les profils qu'ils ont créés.

---

## 🎯 Pourquoi ce Script ?

Après les corrections des permissions (migration `0006_add_specific_roles_to_membership`), les nouveaux utilisateurs reçoivent automatiquement le bon rôle lors de l'inscription.

**Cependant**, les utilisateurs créés **AVANT** cette correction ont encore le rôle générique `'member'`, ce qui peut causer des problèmes de permissions.

---

## 🚀 Utilisation

### **Méthode 1 : Exécution Directe (Recommandée)**

```bash
# En local
cd backend
python scripts/migrate_user_roles.py

# Sur Render (via Shell)
python scripts/migrate_user_roles.py
```

Cette méthode :
1. Exécute d'abord en **mode dry-run** (simulation)
2. Affiche les changements qui seront appliqués
3. Demande une **confirmation** avant d'appliquer
4. Applique les changements si confirmé
5. Vérifie la migration

---

### **Méthode 2 : Via Django Shell**

```bash
python manage.py shell
```

Puis dans le shell :

```python
# Charger le script
exec(open('scripts/migrate_user_roles.py').read())

# Simuler la migration (dry-run)
migrate_user_roles(dry_run=True)

# Appliquer les changements
migrate_user_roles(dry_run=False)

# Vérifier le résultat
verify_migration()
```

---

### **Méthode 3 : Via Redirection (Linux/Mac)**

```bash
python manage.py shell < scripts/migrate_user_roles.py
```

---

## 🧪 Mode Dry-Run (Simulation)

Pour voir les changements **sans les appliquer** :

```python
migrate_user_roles(dry_run=True)
```

**Sortie exemple :**
```
================================================================================
🔄 MIGRATION DES RÔLES UTILISATEURS
================================================================================

📊 3 membership(s) avec le rôle 'member' trouvée(s)

⚠️  MODE DRY-RUN: Les changements ne seront PAS sauvegardés

👤 marly17@gestagro.ga (ID: 8)
   Organisation: Nouvelle Coopérative Agricole
   Ancien rôle: 'member'
   Nouveau rôle: 'buyer'
   🔍 Serait mis à jour (dry-run)

...
```

---

## ✅ Mode Production

Pour **appliquer** les changements :

```python
migrate_user_roles(dry_run=False)
```

**Sortie exemple :**
```
================================================================================
🔄 MIGRATION DES RÔLES UTILISATEURS
================================================================================

📊 3 membership(s) avec le rôle 'member' trouvée(s)

⚠️  MODE PRODUCTION: Les changements seront sauvegardés

👤 marly17@gestagro.ga (ID: 8)
   Organisation: Nouvelle Coopérative Agricole
   Ancien rôle: 'member'
   Nouveau rôle: 'buyer'
   ✅ Mis à jour avec succès

...

================================================================================
📊 STATISTIQUES DE MIGRATION
================================================================================
Total traité: 3
  - Farmers:      1
  - Buyers:       1
  - Transporters: 1
  - Agronomists:  0
  - Members:      0 (aucun profil spécifique)
  - Erreurs:      0
================================================================================

✅ Migration terminée avec succès!
   Les rôles ont été mis à jour dans la base de données.
```

---

## 🔍 Vérification Post-Migration

Pour vérifier la distribution des rôles :

```python
verify_migration()
```

**Sortie exemple :**
```
================================================================================
🔍 VÉRIFICATION DES RÔLES
================================================================================

📊 Distribution des rôles:

  admin           :   1 utilisateur(s)
  farmer          :   2 utilisateur(s)
  buyer           :   3 utilisateur(s)
  transporter     :   1 utilisateur(s)
  agronomist      :   1 utilisateur(s)

✅ Aucun utilisateur avec le rôle générique 'member'

================================================================================
```

---

## 🧠 Logique de Détermination des Rôles

Le script utilise la fonction `determine_user_role()` qui vérifie les profils dans cet ordre de **priorité** :

1. **FarmerProfile** existe → `farmer`
2. **BuyerProfile** existe → `buyer`
3. **TransporterProfile** existe → `transporter`
4. **AgronomistProfile** existe → `agronomist`
5. **Aucun profil** → reste `member`

---

## 📊 Cas d'Usage

### **Cas 1 : Utilisateur avec un seul profil**

```
User: john@example.com
Profile: FarmerProfile
Résultat: role = 'farmer' ✅
```

### **Cas 2 : Utilisateur avec plusieurs profils**

```
User: multi@example.com
Profiles: FarmerProfile + BuyerProfile
Résultat: role = 'farmer' (priorité au farmer) ✅
```

### **Cas 3 : Utilisateur sans profil spécifique**

```
User: viewer@example.com
Profiles: Aucun
Résultat: role = 'member' (reste inchangé) ⚠️
```

---

## ⚠️ Recommandations

### **En Production (Render)**

1. **Sauvegarder la base de données** avant de lancer le script (Render fait des backups automatiques)
2. **Exécuter d'abord en mode dry-run** pour vérifier les changements
3. **Vérifier les logs** après migration
4. **Tester les permissions** avec Postman

### **Commandes Render**

```bash
# Se connecter au Shell Render
# (via le dashboard Render > Shell)

# Exécuter le script
python scripts/migrate_user_roles.py

# OU en mode manuel
python manage.py shell
>>> exec(open('scripts/migrate_user_roles.py').read())
>>> migrate_user_roles(dry_run=True)   # Vérifier
>>> migrate_user_roles(dry_run=False)  # Appliquer
>>> verify_migration()                 # Vérifier
```

---

## 🔄 Rollback

Si vous devez annuler la migration :

### **Option 1 : Remettre tous les rôles à 'member'**

```python
from apps.iam.models import Membership

Membership.objects.filter(
    role__in=['farmer', 'buyer', 'transporter', 'agronomist']
).update(role='member')
```

### **Option 2 : Restaurer depuis un backup**

```bash
# Sur Render
# Restaurer depuis le backup automatique
```

---

## 📝 Logs et Debugging

Le script affiche des informations détaillées :
- ✅ Succès
- 🔍 Dry-run (simulation)
- ❌ Erreurs
- 📊 Statistiques

**En cas d'erreur :**
1. Vérifier que la migration `0006` est appliquée
2. Vérifier que les modèles de profils existent
3. Consulter les logs Django

---

## 🎯 Checklist d'Exécution

- [ ] Migration `0006_add_specific_roles_to_membership` appliquée
- [ ] Backup de la base de données (si production)
- [ ] Exécution en mode dry-run
- [ ] Vérification des changements proposés
- [ ] Confirmation et exécution en mode production
- [ ] Vérification post-migration (`verify_migration()`)
- [ ] Tests des permissions avec Postman
- [ ] Documentation des résultats

---

## 📞 Support

En cas de problème :
1. Vérifier les logs Django
2. Consulter `CORRECTIONS_ROLES_PERMISSIONS.md`
3. Vérifier les permissions dans `apps/core/permissions.py`

---

## 📚 Fichiers Associés

- `apps/iam/models.py` - Modèles User et Membership
- `apps/iam/serializers.py` - Logique d'inscription
- `apps/core/permissions.py` - Classes de permissions
- `apps/iam/migrations/0006_add_specific_roles_to_membership.py` - Migration des rôles
- `CORRECTIONS_ROLES_PERMISSIONS.md` - Documentation complète des corrections

---

**Date de création :** 2025-10-28  
**Version :** 1.0  
**Auteur :** GestAgro Team

