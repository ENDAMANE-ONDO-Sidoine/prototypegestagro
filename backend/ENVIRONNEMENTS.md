# 🌍 Guide des Environnements - GestAgro Backend

## 📊 Vue d'Ensemble

Ce projet utilise **deux environnements distincts** avec des bases de données **complètement séparées**.

---

## 🖥️ Environnement LOCAL (Développement)

### **URLs**
- Backend : `http://localhost:8000`
- Django Admin : `http://localhost:8000/admin/`
- API Docs : `http://localhost:8000/api/docs/`
- MinIO : `http://localhost:9000`

### **Base de Données**
```yaml
Type: PostgreSQL 17
Host: localhost
Port: 5432
Database: gestagro_db
Username: gestagro_user
Password: gestagro_password
```

### **Configuration**
```bash
# Fichier : .env (ou variables locales)
DJANGO_SETTINGS_MODULE=gestagro.settings.development
DEBUG=True
DATABASE_URL=postgresql://gestagro_user:gestagro_password@localhost:5432/gestagro_db
REDIS_URL=redis://localhost:6379/0
```

### **Commandes Utiles**
```bash
# Démarrer le serveur
python manage.py runserver

# Créer un superuser
python manage.py createsuperuser

# Migrations
python manage.py makemigrations
python manage.py migrate

# Shell Django
python manage.py shell
```

### **Accès Base de Données**
```bash
# Via psql
psql -U gestagro_user -d gestagro_db -h localhost

# Via pgAdmin
Host: localhost
Port: 5432
User: gestagro_user
Database: gestagro_db
```

---

## ☁️ Environnement PRODUCTION (Render)

### **URLs**
- Backend : `https://gestagro-api.onrender.com`
- Django Admin : `https://gestagro-api.onrender.com/admin/`
- API Docs : `https://gestagro-api.onrender.com/api/docs/`
- Health Check : `https://gestagro-api.onrender.com/health/`

### **Base de Données**
```yaml
Type: PostgreSQL 17
Provider: Render (Managed Database)
Name: gestagro-db
Database: gestagro_db
Username: gestagro_db_user
Hostname: dpg-d3vqr03ipnbc739kvej0-a
Port: 5432
Region: Oregon (US West)
Plan: Free (1 GB, expire le 26 novembre 2025)
```

### **Configuration Render**
```yaml
# Variables d'environnement (configurées dans Render Dashboard)
DJANGO_SETTINGS_MODULE: gestagro.settings.production
DEBUG: False
SECRET_KEY: [généré automatiquement par Render]
DATABASE_URL: [fourni par Render depuis gestagro-db]
REDIS_URL: [non configuré - cache en mémoire utilisé]
```

### **Accès Base de Données**

#### **Option 1 : Via Render Dashboard**
1. Aller sur https://dashboard.render.com
2. Sélectionner `gestagro-db`
3. Onglet **"Shell"** → Accès psql direct

#### **Option 2 : Via pgAdmin (depuis votre PC)**
Utilisez l'**External Database URL** fournie par Render :
```
Host: dpg-d3vqr03ipnbc739kvej0-a.oregon-postgres.render.com
Port: 5432
Database: gestagro_db
Username: gestagro_db_user
Password: [voir Render Dashboard]
SSL Mode: Require
```

#### **Option 3 : Via psql (depuis votre PC)**
```bash
# Copier la commande PSQL depuis Render Dashboard
psql [EXTERNAL_DATABASE_URL]
```

### **Commandes à Distance**

Pour exécuter des commandes Django sur Render, utilisez le **Shell** dans le dashboard :

```bash
# Créer un superuser
python manage.py createsuperuser

# Lister les utilisateurs
python manage.py shell
>>> from apps.iam.models import User
>>> User.objects.all()

# Vérifier les migrations
python manage.py showmigrations
```

---

## 🔄 Comparaison des Environnements

| Aspect | LOCAL | PRODUCTION (Render) |
|--------|-------|---------------------|
| **Backend URL** | localhost:8000 | gestagro-api.onrender.com |
| **Base de données** | PostgreSQL local | PostgreSQL Render (cloud) |
| **Cache** | Redis local (optionnel) | Mémoire locale (LocMemCache) |
| **Stockage fichiers** | MinIO local | À configurer (MinIO distant ou S3) |
| **Debug** | True | False |
| **Logs** | Console + fichiers | Console uniquement |
| **Données** | ❌ Isolées | ❌ Isolées |

---

## 🧪 Tests API avec Postman

### **Environnement "LOCAL"**
```json
{
  "base_url": "http://localhost:8000",
  "media_base_url": "http://localhost:9000"
}
```
➡️ **Les données vont dans PostgreSQL LOCAL**

### **Environnement "PRODUCTION"**
```json
{
  "base_url": "https://gestagro-api.onrender.com",
  "media_base_url": "https://gestagro-api.onrender.com/media"
}
```
➡️ **Les données vont dans PostgreSQL RENDER (cloud)**

### **Basculer entre Environnements**
1. Ouvrez Postman
2. En haut à droite : sélectionnez **"LOCAL"** ou **"PRODUCTION"**
3. Toutes les requêtes utiliseront automatiquement la bonne URL

---

## 🔐 Créer un Superuser sur Render

### **Méthode 1 : Via Render Shell (Recommandé)**
1. Aller sur https://dashboard.render.com
2. Sélectionner votre service `gestagro-backend`
3. Onglet **"Shell"**
4. Exécuter :
```bash
python manage.py createsuperuser
# Suivre les instructions
```

### **Méthode 2 : Via API**
Utilisez l'endpoint d'inscription avec `is_superuser=true` (si implémenté) ou créez-le via Django shell.

---

## 📂 Synchroniser les Données (Optionnel)

Si vous voulez copier les données de LOCAL vers RENDER ou vice-versa :

### **Export LOCAL → Fichier**
```bash
# Dump de la base locale
pg_dump -U gestagro_user -d gestagro_db -F c -f gestagro_backup.dump
```

### **Import Fichier → RENDER**
```bash
# Restaurer sur Render (nécessite pg_restore et External URL)
pg_restore -d [EXTERNAL_DATABASE_URL] gestagro_backup.dump
```

⚠️ **Attention** : Cela peut écraser les données existantes sur Render !

---

## ⚡ Points Clés à Retenir

### ✅ **OUI**
- ✅ Les deux environnements sont **complètement indépendants**
- ✅ Vous pouvez tester sur Render **sans affecter** votre base locale
- ✅ Les migrations sont **automatiques** sur Render (via `render.yaml`)
- ✅ Vous pouvez accéder à la base Render depuis pgAdmin

### ❌ **NON**
- ❌ Les données **ne se synchronisent pas** automatiquement
- ❌ Un utilisateur créé sur Render **n'existe pas** en local
- ❌ Les fichiers uploadés sur Render **ne sont pas** en local
- ❌ Les deux bases **ne partagent AUCUNE donnée**

---

## 🎯 Workflow Recommandé

1. **Développement** : Travailler en LOCAL
   - Tests rapides
   - Debugging facile
   - Pas de latence réseau

2. **Tests Production** : Tester sur RENDER
   - Valider le déploiement
   - Tester les performances réelles
   - Vérifier la configuration cloud

3. **Données de Test** :
   - Créer des fixtures Django : `python manage.py dumpdata > fixtures.json`
   - Charger sur Render : `python manage.py loaddata fixtures.json`

---

## 📞 Support

- **Documentation Django** : https://docs.djangoproject.com
- **Render Docs** : https://render.com/docs
- **PostgreSQL Docs** : https://www.postgresql.org/docs/

---

## ⚠️ Rappels Importants

### **Plan Gratuit Render**
- ⏰ Base de données expire le **26 novembre 2025**
- 💾 Storage : 1 GB maximum
- 🔄 Après expiration : créer une nouvelle base gratuite ou upgrader

### **Limitations**
- 📊 Cache : Mémoire locale (pas Redis)
- 💤 Sleep après 15 min d'inactivité (premier accès = 30-60s de démarrage)
- 🚫 Pas de stockage persistant pour fichiers médias (utiliser S3 ou MinIO distant)

---

**Dernière mise à jour** : Octobre 2025
**Version Backend** : 1.9.0

