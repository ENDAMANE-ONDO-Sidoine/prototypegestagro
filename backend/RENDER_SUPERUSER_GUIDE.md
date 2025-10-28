# 👤 Guide : Créer un Superuser sur Render

## 🎯 Objectif
Créer un compte administrateur pour accéder au **Django Admin** sur Render : `https://gestagro-api.onrender.com/admin/`

---

## 📋 Méthodes Disponibles

### ✅ **Méthode 1 : Via Render Shell** (Recommandée)

#### **Étapes**
1. Aller sur https://dashboard.render.com
2. Cliquer sur votre service **"gestagro-backend"**
3. Dans le menu de gauche, cliquer sur **"Shell"**
4. Attendre que le shell se connecte
5. Exécuter la commande suivante :

```bash
python manage.py createsuperuser
```

6. Répondre aux questions :
```
Username: admin
Email: admin@gestagro.com
Password: [votre mot de passe sécurisé]
Password (again): [confirmer]
```

7. **Succès !** Vous verrez :
```
Superuser created successfully.
```

#### **Test**
- Aller sur `https://gestagro-api.onrender.com/admin/`
- Se connecter avec :
  - Username : `admin`
  - Password : `[votre mot de passe]`

---

### ✅ **Méthode 2 : Via API (Script Python)**

Si le Shell Render ne fonctionne pas, créez un script temporaire :

#### **1. Créer le fichier**
```bash
# Dans votre projet local
cd backend
```

Créez `create_superuser_render.py` :

```python
import os
import django
import sys

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gestagro.settings.production')
django.setup()

from apps.iam.models import User

# Informations du superuser
username = input("Username: ")
email = input("Email: ")
password = input("Password: ")

try:
    # Créer le superuser
    user = User.objects.create_superuser(
        username=username,
        email=email,
        password=password
    )
    print(f"✅ Superuser '{username}' créé avec succès !")
    print(f"   ID: {user.id}")
    print(f"   Email: {user.email}")
    print(f"   is_superuser: {user.is_superuser}")
    print(f"   is_staff: {user.is_staff}")
except Exception as e:
    print(f"❌ Erreur : {e}")
    sys.exit(1)
```

#### **2. Exécuter sur Render**
1. Commitez et pushez le script sur Git
2. Sur Render Dashboard → **"gestagro-backend"** → **"Shell"**
3. Exécutez :
```bash
python create_superuser_render.py
```

#### **3. Nettoyer**
Une fois le superuser créé, supprimez le script pour la sécurité :
```bash
git rm create_superuser_render.py
git commit -m "Suppression script temporaire"
git push
```

---

### ✅ **Méthode 3 : Via Django Shell**

#### **1. Accéder au Shell Render**
- Dashboard → **"gestagro-backend"** → **"Shell"**

#### **2. Lancer Django Shell**
```bash
python manage.py shell
```

#### **3. Créer le Superuser**
```python
from apps.iam.models import User

# Créer le superuser
user = User.objects.create_superuser(
    username='admin',
    email='admin@gestagro.com',
    password='VotreMotDePasseSecurise123!'
)

print(f"✅ Superuser créé : {user.username} (ID: {user.id})")
```

#### **4. Quitter**
```python
exit()
```

---

## 🧪 Vérification

### **1. Test Login Admin**
```
URL : https://gestagro-api.onrender.com/admin/
Username : admin
Password : [votre mot de passe]
```

### **2. Test API (Postman)**
```bash
POST https://gestagro-api.onrender.com/api/v1/auth/login/
Content-Type: application/json

{
  "username": "admin",
  "password": "VotreMotDePasseSecurise123!"
}
```

**Réponse attendue :**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJ...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJ...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@gestagro.com",
    "is_superuser": true,
    "is_staff": true
  }
}
```

---

## 📊 Vérifier les Utilisateurs Existants

### **Via Django Shell**
```python
from apps.iam.models import User

# Lister tous les utilisateurs
users = User.objects.all()
for user in users:
    print(f"- {user.username} (Staff: {user.is_staff}, Super: {user.is_superuser})")

# Vérifier si un superuser existe
superusers = User.objects.filter(is_superuser=True)
print(f"\n{superusers.count()} superuser(s) trouvé(s)")
```

### **Via Django Admin**
1. Connectez-vous à `https://gestagro-api.onrender.com/admin/`
2. Section **"IAM"** → **"Users"**
3. Vous verrez tous les utilisateurs

---

## 🔐 Bonnes Pratiques

### **Mot de Passe Sécurisé**
- ✅ Au moins 12 caractères
- ✅ Majuscules + minuscules + chiffres + symboles
- ✅ Ne pas utiliser de mots du dictionnaire
- ✅ Exemple : `G3st@gr0_R3nd3r_2025!`

### **Email Valide**
- ✅ Utilisez un vrai email si vous configurez la récupération de mot de passe
- ⚠️ Pour les tests : `admin@gestagro.com` suffit

### **Username**
- ✅ Simple et mémorable : `admin`, `superadmin`, etc.
- ❌ Évitez : `admin123`, `test`, `user`

---

## ⚠️ Dépannage

### **Erreur : "That username is already taken"**
Le superuser existe déjà. Options :
1. Réinitialisez le mot de passe :
```python
from apps.iam.models import User
user = User.objects.get(username='admin')
user.set_password('NouveauMotDePasse')
user.save()
print("✅ Mot de passe mis à jour")
```

2. Utilisez un autre username : `superadmin`, `admin2`, etc.

### **Erreur : "Shell not available"**
Le service est peut-être en veille. Solutions :
1. Attendez 30-60 secondes
2. Rafraîchissez la page
3. Visitez l'URL de l'API pour réveiller le service : `https://gestagro-api.onrender.com/api/v1/`

### **Erreur : "ModuleNotFoundError"**
Le build n'est pas terminé. Attendez que le déploiement soit "Live" (vert).

---

## 📝 Informations Système

### **Base de Données Render**
```yaml
Name: gestagro-db
Database: gestagro_db
Username: gestagro_db_user
Hostname: dpg-d3vqr03ipnbc739kvej0-a
Region: Oregon (US West)
```

### **Backend Render**
```yaml
Name: gestagro-backend
URL: https://gestagro-api.onrender.com
Settings: gestagro.settings.production
```

---

## 🎯 Prochaines Étapes

Après avoir créé le superuser :

1. ✅ **Se connecter au Django Admin**
2. ✅ **Créer des données de test** (organisations, produits, etc.)
3. ✅ **Tester les endpoints API** avec Postman (environnement PRODUCTION)
4. ✅ **Vérifier les permissions** et les rôles

---

**Dernière mise à jour** : Octobre 2025
**Version Backend** : 1.9.0

