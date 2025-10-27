# 📮 Collection Postman - GestAgro API

## 📋 Vue d'ensemble

Ce dossier contient les collections Postman essentielles pour tester l'API GestAgro. Les collections sont organisées par acteur et incluent tous les endpoints nécessaires.

## 📂 Fichiers disponibles

### **1. `GestAgro_API_Collection.json`**
**Collection principale** contenant tous les endpoints API organisés par acteur :
- 🔐 **Authentication** - Login, register, refresh token, logout
- 👤 **User Profile** - Gestion du profil utilisateur
- 🏢 **Organizations** - Gestion des organisations
- 🌾 **Farmers** - APIs pour les agriculteurs
- 🛒 **Buyers** - APIs pour les acheteurs
- 🚚 **Transport** - APIs pour les transporteurs
- 👨‍🌾 **Agronomy** - APIs pour les agronomes
- 📊 **Core APIs** - APIs de base et documentation

### **2. `GestAgro_Environment.json`**
**Environnement Postman** avec toutes les variables nécessaires :
- `base_url` - URL de base de l'API
- `access_token` - Token d'accès JWT
- `refresh_token` - Token de rafraîchissement
- Variables pour les IDs (user_id, product_id, etc.)

## 🚀 Installation dans Postman

### **1. Importer la collection :**
1. Ouvrir Postman
2. Cliquer sur **Import**
3. Sélectionner `GestAgro_API_Collection.json`
4. Cliquer sur **Import**

### **2. Importer l'environnement :**
1. Cliquer sur **Import**
2. Sélectionner `GestAgro_Environment.json`
3. Cliquer sur **Import**
4. Sélectionner l'environnement "GestAgro Environment" dans le dropdown

### **3. Configurer l'environnement :**
1. Cliquer sur l'icône d'engrenage (⚙️) en haut à droite
2. Sélectionner "GestAgro Environment"
3. Vérifier que `base_url` est défini sur `http://localhost:8000`

## 🔧 Configuration

### **Variables d'environnement :**

| **Variable** | **Valeur par défaut** | **Description** |
|--------------|----------------------|-----------------|
| `base_url` | `http://localhost:8000` | URL de base de l'API |
| `access_token` | (vide) | Token JWT d'accès |
| `refresh_token` | (vide) | Token JWT de rafraîchissement |
| `user_id` | (vide) | ID de l'utilisateur connecté |
| `organization_id` | (vide) | ID de l'organisation |
| `product_id` | (vide) | ID du produit |
| `order_id` | (vide) | ID de la commande |
| `vehicle_id` | (vide) | ID du véhicule |
| `driver_id` | (vide) | ID du chauffeur |
| `route_id` | (vide) | ID de la route |
| `field_id` | (vide) | ID du champ |
| `crop_id` | (vide) | ID de la culture |

## 🎯 Utilisation

### **1. Démarrage rapide :**

#### **Étape 1 : Vérifier l'API**
```http
GET {{base_url}}/api/v1/
```

#### **Étape 2 : Se connecter**
```http
POST {{base_url}}/api/v1/auth/login/
{
    "email": "agriculteur1@gestagro.ga",
    "password": "password123"
}
```

#### **Étape 3 : Utiliser les tokens**
- Copier `access_token` de la réponse
- Coller dans la variable `access_token` de l'environnement
- Tous les endpoints authentifiés fonctionneront automatiquement

### **2. Comptes de test disponibles :**

| **Acteur** | **Email** | **Mot de passe** | **Organisation** |
|------------|-----------|------------------|------------------|
| **Agriculteur** | `agriculteur1@gestagro.ga` | `password123` | Coopérative Agricole Libreville |
| **Acheteur** | `acheteur1@gestagro.ga` | `password123` | Restaurant Le Gabonais |
| **Transporteur** | `transporteur1@gestagro.ga` | `password123` | Transport Express Gabon |
| **Agronome** | `agronome1@gestagro.ga` | `password123` | ONG Agriculture Durable |
| **Admin** | `admin_gestagro@gestagro.ga` | `password123` | Ministère de l'Agriculture |

### **3. Workflow recommandé :**

#### **Pour tester un acteur complet :**
1. **Login** avec le compte de l'acteur
2. **Récupérer le profil** utilisateur
3. **Lister les données** de l'acteur
4. **Créer de nouvelles données**
5. **Modifier les données existantes**
6. **Supprimer des données** (si nécessaire)

## 📊 Endpoints par acteur

### **🌾 Agriculteur :**
- `GET /api/v1/farmers/categories/` - Lister les catégories
- `GET /api/v1/farmers/products/` - Lister les produits
- `POST /api/v1/farmers/products/` - Créer un produit
- `PUT /api/v1/farmers/products/{id}/` - Modifier un produit
- `DELETE /api/v1/farmers/products/{id}/` - Supprimer un produit
- `POST /api/v1/farmers/products/{id}/images/` - Uploader une image
- `GET /api/v1/farmers/dashboard/stats/` - Statistiques dashboard

### **🛒 Acheteur :**
- `GET /api/v1/buyers/cart/` - Récupérer le panier
- `POST /api/v1/buyers/cart/items/` - Ajouter au panier
- `PUT /api/v1/buyers/cart/items/{id}/` - Modifier le panier
- `DELETE /api/v1/buyers/cart/items/{id}/` - Supprimer du panier
- `GET /api/v1/buyers/orders/` - Lister les commandes
- `POST /api/v1/buyers/orders/` - Créer une commande
- `GET /api/v1/buyers/wishlist/` - Liste de souhaits

### **🚚 Transporteur :**
- `GET /api/v1/transport/vehicles/` - Lister les véhicules
- `POST /api/v1/transport/vehicles/` - Créer un véhicule
- `GET /api/v1/transport/drivers/` - Lister les chauffeurs
- `POST /api/v1/transport/drivers/` - Créer un chauffeur
- `GET /api/v1/transport/routes/` - Lister les routes
- `POST /api/v1/transport/routes/` - Créer une route
- `GET /api/v1/transport/shipments/` - Lister les expéditions

### **👨‍🌾 Agronome :**
- `GET /api/v1/agronomy/fields/` - Lister les champs
- `POST /api/v1/agronomy/fields/` - Créer un champ
- `GET /api/v1/agronomy/crops/` - Lister les cultures
- `POST /api/v1/agronomy/crops/` - Créer une culture
- `GET /api/v1/agronomy/field-visits/` - Lister les visites
- `POST /api/v1/agronomy/field-visits/` - Créer une visite
- `GET /api/v1/agronomy/diagnostics/` - Lister les diagnostics

## 🔐 Authentification

### **JWT Tokens :**
- **Access Token** : Valide 1 heure, utilisé pour les requêtes authentifiées
- **Refresh Token** : Valide 7 jours, utilisé pour renouveler l'access token

### **Headers requis :**
```http
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

### **Renouvellement automatique :**
1. Quand l'access token expire, utiliser le refresh token
2. Appeler `POST /api/v1/auth/refresh/`
3. Mettre à jour la variable `access_token` avec le nouveau token

## 🧪 Tests automatisés

### **Scripts de test Postman :**
Les collections incluent des scripts de test automatiques pour :
- ✅ Vérifier les codes de statut HTTP
- ✅ Valider la structure des réponses JSON
- ✅ Extraire automatiquement les tokens JWT
- ✅ Sauvegarder les IDs dans les variables d'environnement

## 🆘 Dépannage

### **Erreurs courantes :**

#### **401 Unauthorized :**
- Vérifier que l'access token est valide
- Se reconnecter si nécessaire

#### **403 Forbidden :**
- Vérifier les permissions de l'utilisateur
- Utiliser un compte avec les bonnes permissions

#### **404 Not Found :**
- Vérifier l'URL de l'endpoint
- Vérifier que l'ID existe

#### **500 Internal Server Error :**
- Vérifier que le serveur Django est démarré
- Vérifier les logs du serveur

### **Vérifications :**
1. **Serveur Django** : `http://localhost:8000/api/v1/`
2. **Base de données** : Vérifier que les migrations sont appliquées
3. **Données de test** : Exécuter `python test_api.py`
4. **Redis** : Vérifier la connexion Redis

## 📚 Ressources

- **Documentation API** : `http://localhost:8000/api/docs/`
- **ReDoc** : `http://localhost:8000/api/redoc/`
- **Health Check** : `http://localhost:8000/health/`
- **Documentation complète** : `md/api/DOCUMENTATION_API.md`

## 🔄 Mise à jour

### **Pour mettre à jour la collection :**
1. Modifier les endpoints dans `GestAgro_API_Collection.json`
2. Réimporter dans Postman
3. Mettre à jour ce README si nécessaire

### **Pour ajouter de nouveaux endpoints :**
1. Ajouter dans la collection JSON
2. Documenter dans ce README
3. Tester avec les comptes de test

---

*Collection créée le 26/10/2025 - Version 2.0*
*Nettoyage effectué après création des données fraîches*