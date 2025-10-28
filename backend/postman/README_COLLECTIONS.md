# 📦 Collections Postman GestAgro

Ce dossier contient les collections Postman pour tester l'API GestAgro dans différents environnements.

---

## 📋 Collections Disponibles

### 1️⃣ **GestAgro_API_Collection.json** (PRODUCTION)
- **URL** : `https://gestagro-api.onrender.com`
- **Base de données** : PostgreSQL Render (cloud)
- **Usage** : Tests en production, validation du déploiement

### 2️⃣ **GestAgro_API_Collection_LOCAL.json** (DÉVELOPPEMENT)
- **URL** : `http://localhost:8000`
- **Base de données** : PostgreSQL local
- **Usage** : Développement, tests rapides, debugging

---

## 🚀 Import dans Postman

### **Méthode 1 : Import Direct**
1. Ouvrir Postman
2. Cliquer sur **"Import"** (en haut à gauche)
3. Glisser-déposer le fichier JSON ou cliquer sur **"Upload Files"**
4. Sélectionner :
   - `GestAgro_API_Collection_LOCAL.json` pour les tests locaux
   - `GestAgro_API_Collection.json` pour les tests en production

### **Méthode 2 : Import depuis le dossier**
1. Ouvrir Postman
2. **Import** → **Folder**
3. Sélectionner le dossier `backend/postman/`
4. Postman importera automatiquement toutes les collections

---

## 🔧 Configuration

### **Variables de Collection**

Chaque collection a ses propres variables :

#### **LOCAL** (`GestAgro_API_Collection_LOCAL.json`)
```json
{
  "base_url": "http://localhost:8000",
  "access_token": "",
  "refresh_token": ""
}
```

#### **PRODUCTION** (`GestAgro_API_Collection.json`)
```json
{
  "base_url": "https://gestagro-api.onrender.com",
  "access_token": "",
  "refresh_token": ""
}
```

---

## 🧪 Utilisation

### **1. Démarrer le Backend**

#### **Pour LOCAL :**
```bash
# Terminal 1 : Activer l'environnement virtuel
cd backend
source env/bin/activate  # Linux/Mac
# OU
.\env\Scripts\activate   # Windows

# Terminal 2 : Démarrer PostgreSQL (si nécessaire)
# Terminal 3 : Démarrer MinIO (si nécessaire)

# Démarrer Django
python manage.py runserver
```

#### **Pour PRODUCTION :**
Rien à démarrer, l'API est déjà déployée sur Render ! ✅

---

### **2. Tester l'Authentification**

#### **Étape 1 : Inscription**
```http
POST {{base_url}}/api/v1/auth/register/
Content-Type: application/json

{
  "username": "test_user",
  "email": "test@gestagro.ga",
  "password": "SecurePass123!",
  "password_confirm": "SecurePass123!",
  "first_name": "Test",
  "last_name": "User",
  "phone": "+241123456789",
  "organization_name": "Test Org",
  "organization_type": "cooperative",
  "user_role": "farmer"
}
```

#### **Étape 2 : Connexion**
```http
POST {{base_url}}/api/v1/auth/login/
Content-Type: application/json

{
  "email": "test@gestagro.ga",
  "password": "SecurePass123!"
}
```

**Réponse** :
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJ...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJ...",
  "user": {
    "id": 1,
    "username": "test_user",
    "email": "test@gestagro.ga"
  }
}
```

#### **Étape 3 : Copier le Token**
1. Copier la valeur de `access` depuis la réponse
2. Dans Postman, aller dans la collection → **Variables**
3. Coller le token dans `access_token`
4. Sauvegarder

---

### **3. Tester les Endpoints Protégés**

Maintenant que vous avez un token, vous pouvez tester tous les endpoints :

```http
GET {{base_url}}/api/v1/auth/profile/
Authorization: Bearer {{access_token}}
```

---

## 📊 Endpoints Principaux

### **🔐 Authentification**
- `POST /api/v1/auth/register/` - Inscription
- `POST /api/v1/auth/login/` - Connexion
- `POST /api/v1/auth/refresh/` - Rafraîchir le token
- `POST /api/v1/auth/logout/` - Déconnexion
- `GET /api/v1/auth/profile/` - Profil utilisateur

### **🏢 Organizations**
- `GET /api/v1/organizations/` - Liste des organisations
- `POST /api/v1/organizations/` - Créer une organisation
- `GET /api/v1/organizations/{id}/` - Détails d'une organisation
- `PUT /api/v1/organizations/{id}/` - Modifier une organisation
- `DELETE /api/v1/organizations/{id}/` - Supprimer une organisation

### **📊 Core**
- `GET /api/v1/` - API Root
- `GET /health/` - Health Check
- `GET /api/docs/` - Documentation Swagger

---

## 🔄 Workflow Recommandé

### **Développement (LOCAL)**
1. Développer une nouvelle fonctionnalité
2. Tester avec `GestAgro_API_Collection_LOCAL.json`
3. Débugger en local
4. Commiter les changements

### **Validation (PRODUCTION)**
1. Déployer sur Render (push sur `develop` ou `main`)
2. Attendre que le déploiement soit terminé (2-3 minutes)
3. Tester avec `GestAgro_API_Collection.json`
4. Valider que tout fonctionne en production

---

## 🆚 Comparaison LOCAL vs PRODUCTION

| Aspect | LOCAL | PRODUCTION |
|--------|-------|------------|
| **URL** | `http://localhost:8000` | `https://gestagro-api.onrender.com` |
| **Base de données** | PostgreSQL local | PostgreSQL Render |
| **Stockage fichiers** | MinIO local | À configurer |
| **Cache** | Redis local | Mémoire locale |
| **Données** | Isolées (votre PC) | Isolées (cloud) |
| **Performance** | Rapide (pas de latence réseau) | Plus lent (latence réseau) |
| **Debugging** | Facile (logs directs) | Via logs Render |
| **Sleep Mode** | ❌ Non | ✅ Oui (après 15 min) |

---

## 🐛 Dépannage

### **Problème : "Could not get any response"**

#### **LOCAL** :
```bash
# Vérifier que Django tourne
curl http://localhost:8000/health/

# Si rien :
cd backend
python manage.py runserver
```

#### **PRODUCTION** :
```bash
# Vérifier l'état sur Render
curl https://gestagro-api.onrender.com/health/

# Si rien : Le service est peut-être en veille
# Attendre 30-60 secondes après la première requête
```

---

### **Problème : "401 Unauthorized"**

```bash
# Le token a expiré ou est invalide
# Solution : Refaire le login

POST {{base_url}}/api/v1/auth/login/
{
  "email": "votre_email",
  "password": "votre_password"
}

# Puis mettre à jour access_token dans les variables
```

---

### **Problème : "Connection refused" (LOCAL)**

```bash
# Django n'est pas démarré
cd backend
source env/bin/activate
python manage.py runserver

# Ou PostgreSQL n'est pas démarré
# Windows : Ouvrir pgAdmin et démarrer le service
# Linux/Mac : sudo service postgresql start
```

---

## 📚 Ressources

- **Documentation complète** : `backend/md/API_ENDPOINTS_PROFILE.md`
- **Guide environnements** : `backend/ENVIRONNEMENTS.md`
- **Guide superuser Render** : `backend/RENDER_SUPERUSER_GUIDE.md`
- **Documentation Postman** : https://learning.postman.com/docs/

---

## 🎯 Prochaines Étapes

1. ✅ Importer les 2 collections dans Postman
2. ✅ Tester en LOCAL pour valider votre développement
3. ✅ Tester en PRODUCTION après déploiement
4. ✅ Créer des tests automatisés avec Postman Tests
5. ✅ Utiliser les environnements Postman pour gérer plusieurs profils

---

**Dernière mise à jour** : Octobre 2025  
**Version Backend** : 1.9.0

