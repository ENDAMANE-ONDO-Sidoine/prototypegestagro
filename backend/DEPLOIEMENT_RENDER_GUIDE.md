# 🚀 Guide de Déploiement sur Render - GestAgro

## ✅ Checklist Avant Déploiement

- [x] Corrections des permissions commitées
- [x] Migration 0006 créée
- [x] Script de migration des rôles créé
- [x] Collections Postman mises à jour
- [x] Tests locaux validés
- [x] Push sur GitHub effectué

---

## 📦 Ce qui sera Déployé

### **Commit:** `2096757`
**Branche:** `develop`
**Date:** 28/10/2025

### **Fichiers Modifiés:**

1. **`apps/core/permissions.py`**
   - Correction `IsFarmerOrAdmin`: retire `'member'` des rôles autorisés
   - Seuls `'farmer'` et `'admin'` peuvent créer des catégories/produits

2. **`apps/iam/models.py`**
   - Ajout des rôles spécifiques au modèle `Membership`:
     - `farmer`, `buyer`, `transporter`, `agronomist`

3. **`apps/iam/serializers.py`**
   - Correction du mapping `user_role` → `membership role`
   - Chaque rôle a maintenant son équivalent spécifique

4. **`apps/iam/migrations/0006_add_specific_roles_to_membership.py`**
   - Migration Django pour ajouter les nouveaux choix de rôles

5. **`scripts/migrate_user_roles.py`**
   - Script de migration pour les utilisateurs existants

6. **`scripts/README_MIGRATE_ROLES.md`**
   - Documentation complète du script

---

## 🔄 Processus de Déploiement Automatique

### **1. Render détecte le push GitHub** ✅

Render va automatiquement :
- Détecter le nouveau commit sur `develop`
- Déclencher un nouveau build

### **2. Build Command (render.yaml)** ✅

```bash
pip install -r requirements.txt
python manage.py collectstatic --noinput
python manage.py migrate  # ✅ Applique la migration 0006
```

La migration `0006_add_specific_roles_to_membership` sera **automatiquement appliquée**.

### **3. Start Command** ✅

```bash
gunicorn gestagro.wsgi:application --workers 1 --threads 2 --timeout 120
```

---

## ⚠️ ACTIONS POST-DÉPLOIEMENT (OBLIGATOIRES)

### **Étape 1: Vérifier que la Migration est Appliquée**

Connectez-vous au **Shell Render** :

```bash
# Render Dashboard > gestagro-backend > Shell
python manage.py showmigrations iam
```

**Résultat attendu:**
```
iam
 [X] 0001_initial
 [X] 0002_...
 [X] 0005_...
 [X] 0006_add_specific_roles_to_membership  # ✅ Doit être coché
```

---

### **Étape 2: Exécuter le Script de Migration des Rôles**

Les utilisateurs créés **AVANT** ce déploiement ont encore le rôle `'member'`.
Il faut les migrer vers leurs rôles spécifiques.

```bash
# Dans le Shell Render
python scripts/migrate_user_roles.py
```

**Le script va:**
1. Afficher un **dry-run** (simulation)
2. Demander une **confirmation**
3. Appliquer les changements
4. Afficher les **statistiques**

**Sortie attendue:**
```
================================================================================
🔄 MIGRATION DES RÔLES UTILISATEURS
================================================================================

📊 X membership(s) avec le rôle 'member' trouvée(s)

⚠️  MODE DRY-RUN: Les changements ne seront PAS sauvegardés

👤 user@example.com (ID: X)
   Organisation: Example Org
   Ancien rôle: 'member'
   Nouveau rôle: 'farmer'
   🔍 Serait mis à jour (dry-run)

...

Voulez-vous appliquer ces changements? (oui/non): oui

✅ Migration terminée avec succès!
```

---

### **Étape 3: Vérifier les Rôles**

```bash
# Dans le Shell Render
python manage.py shell
```

```python
from apps.iam.models import Membership

# Vérifier la distribution des rôles
print("Distribution des rôles:")
for role in ['farmer', 'buyer', 'transporter', 'agronomist', 'member']:
    count = Membership.objects.filter(role=role).count()
    print(f"  {role}: {count}")

# Vérifier qu'il ne reste plus de 'member'
members = Membership.objects.filter(role='member').count()
if members == 0:
    print("\n✅ Aucun utilisateur avec le rôle générique 'member'")
else:
    print(f"\n⚠️ {members} utilisateur(s) avec le rôle 'member'")
```

---

### **Étape 4: Tester les Permissions avec Postman**

#### **Test 1: Créer un Nouveau Compte Buyer**

**Endpoint:** `POST https://gestagro-api.onrender.com/api/v1/auth/register/`

```json
{
    "username": "test_buyer_new",
    "email": "test_buyer_new@gestagro.ga",
    "password": "SecurePass123!@#",
    "password_confirm": "SecurePass123!@#",
    "first_name": "Test",
    "last_name": "Buyer",
    "phone": "+241123456789",
    "organization_name": "Test Org",
    "organization_type": "cooperative",
    "user_role": "buyer"
}
```

**Vérifier la réponse:**
```json
{
    "user": {
        "organizations": [
            {
                "role": "buyer"  // ✅ Doit être "buyer", PAS "member"
            }
        ]
    }
}
```

#### **Test 2: Essayer de Créer une Catégorie avec un Buyer**

**Endpoint:** `POST https://gestagro-api.onrender.com/api/v1/farmers/categories/`

**Headers:**
```
Authorization: Bearer <buyer_token>
```

**Body:**
```json
{
    "name": "Test Category",
    "description": "Test"
}
```

**Résultat attendu:** `403 Forbidden` ✅

```json
{
    "detail": "You do not have permission to perform this action."
}
```

#### **Test 3: Créer une Catégorie avec un Farmer**

**Endpoint:** `POST https://gestagro-api.onrender.com/api/v1/farmers/categories/`

**Headers:**
```
Authorization: Bearer <farmer_token>
```

**Body:**
```json
{
    "name": "Test Category Farmer",
    "description": "Test by Farmer"
}
```

**Résultat attendu:** `201 Created` ✅

---

## 📊 Tableau de Tests des Permissions

| Endpoint | Rôle | Résultat Attendu | Status |
|----------|------|------------------|--------|
| `POST /farmers/categories/` | `farmer` | 201 Created | ✅ |
| `POST /farmers/categories/` | `buyer` | 403 Forbidden | ✅ |
| `POST /farmers/products/` | `farmer` | 201 Created | ✅ |
| `POST /farmers/products/` | `buyer` | 403 Forbidden | ✅ |
| `POST /buyers/cart/` | `buyer` | 201 Created | ✅ |
| `POST /buyers/cart/` | `farmer` | 403 Forbidden | ✅ |
| `POST /buyers/orders/` | `buyer` | 201 Created | ✅ |
| `POST /buyers/orders/` | `transporter` | 403 Forbidden | ✅ |

---

## 🔙 Rollback (Si Problème)

Si quelque chose ne va pas, vous pouvez faire un rollback de la migration :

```bash
# Dans le Shell Render
python manage.py migrate iam 0005
```

⚠️ **ATTENTION:** Cela supprimera les nouveaux choix de rôles !

---

## 📝 Logs à Surveiller

### **Build Logs (Render Dashboard)**

```
-----> Running migrations:
  Applying iam.0006_add_specific_roles_to_membership... OK ✅
```

### **Application Logs**

Surveiller les erreurs de permissions :
```
INFO - User <email> attempted to access <endpoint>
WARNING - Permission denied for user <email> (role: buyer)
```

---

## 🎯 Critères de Succès

- [ ] Migration 0006 appliquée avec succès
- [ ] Script `migrate_user_roles.py` exécuté
- [ ] Tous les utilisateurs ont des rôles spécifiques (pas de `'member'`)
- [ ] Les buyers ne peuvent PAS créer de catégories (403)
- [ ] Les farmers peuvent créer des catégories (201)
- [ ] Les nouveaux utilisateurs reçoivent le bon rôle à l'inscription
- [ ] Aucune erreur dans les logs Render

---

## 📞 En Cas de Problème

### **Problème 1: Migration 0006 non appliquée**

```bash
python manage.py migrate iam 0006 --fake-initial
```

### **Problème 2: Script de migration échoue**

```bash
# Vérifier les profils
python manage.py shell
>>> from apps.iam.models import User
>>> from apps.farmers.models import FarmerProfile
>>> user = User.objects.get(email='<email>')
>>> hasattr(user, 'farmer_profile')  # Vérifier la relation
```

### **Problème 3: Permissions toujours incorrectes**

Vérifier que les memberships ont été mises à jour :

```python
from apps.iam.models import Membership
membership = Membership.objects.get(user__email='<email>')
print(f"Role actuel: {membership.role}")  # Doit être 'buyer' ou 'farmer', pas 'member'
```

---

## 🚀 Prochaines Étapes

1. ✅ Vérifier que le déploiement s'est bien passé
2. ✅ Exécuter le script de migration
3. ✅ Tester avec Postman
4. ✅ Surveiller les logs pendant 24h
5. ✅ Documenter les résultats

---

## 📚 Documentation Associée

- [README_MIGRATE_ROLES.md](scripts/README_MIGRATE_ROLES.md) - Guide complet du script de migration
- [GUIDE_DEPLOIEMENT_RENDER.md](md/deployment/GUIDE_DEPLOIEMENT_RENDER.md) - Guide de déploiement général
- [CORRECTIONS_RECENTES.md](md/CORRECTIONS_RECENTES.md) - Historique des corrections

---

**Date:** 28/10/2025  
**Version:** 1.0  
**Commit:** `2096757`  
**Auteur:** GestAgro Team

---

🎉 **Bonne chance pour le déploiement !**

