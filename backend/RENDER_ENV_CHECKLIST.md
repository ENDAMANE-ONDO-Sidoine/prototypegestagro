# ✅ CHECKLIST - Variables d'Environnement Render

## Variables Requises sur Render Dashboard

Allez sur **Render Dashboard** → **gestagro-backend** → **Environment**

### Variables à Vérifier/Ajouter :

1. **DJANGO_SETTINGS_MODULE**
   - Valeur : `gestagro.settings.production`
   - ✅ Déjà dans render.yaml

2. **SECRET_KEY**
   - Valeur : Générée automatiquement par Render
   - ✅ Déjà dans render.yaml

3. **DEBUG**
   - Valeur : `False`
   - ✅ Déjà dans render.yaml

4. **DATABASE_URL**
   - Valeur : Automatique depuis PostgreSQL
   - ✅ Déjà dans render.yaml

5. **REDIS_URL**
   - Valeur : Automatique depuis Redis
   - ✅ Déjà dans render.yaml

6. **ALLOWED_HOSTS** (Optionnel, déjà configuré dans production.py)
   - Valeur : `gestagro-api.onrender.com`

## 🔄 Après Vérification

1. **Redéployer** : Manual Deploy → Deploy latest commit
2. **Attendre** : Le build prend 2-5 minutes
3. **Vérifier les logs** : Onglet "Logs" pour voir les erreurs
4. **Tester** : `https://gestagro-api.onrender.com/admin/`

## 🐛 Si l'Erreur Persiste

### Consulter les Logs Render

Dans l'onglet **Logs**, cherchez :
- `ERROR` ou `CRITICAL`
- `ImproperlyConfigured`
- `ModuleNotFoundError`
- `OperationalError`

### Commandes de Debug

Si vous avez accès au shell Render :

```bash
# Vérifier les fichiers statiques
python manage.py collectstatic --noinput

# Vérifier les migrations
python manage.py migrate

# Créer un superuser
python manage.py createsuperuser
```

## 📋 Ordre de Résolution

1. ✅ Vérifier que le build est terminé (pas de "Building...")
2. ✅ Consulter les logs pour l'erreur exacte
3. ✅ Vérifier que `collectstatic` s'est exécuté sans erreur
4. ✅ Tester `/api/docs/` (si ça marche, c'est un problème spécifique à l'admin)
5. ✅ Tester `/health/` (si ça marche, l'app fonctionne)

## 🔗 URLs à Tester

- ✅ `https://gestagro-api.onrender.com/health/` (Doit retourner 200)
- ✅ `https://gestagro-api.onrender.com/api/docs/` (Doit afficher Swagger)
- ✅ `https://gestagro-api.onrender.com/api/v1/` (Doit lister les endpoints)
- ❌ `https://gestagro-api.onrender.com/admin/` (Erreur 500 actuellement)

## 🚨 Erreurs Communes

### 1. Fichiers Statiques Manquants
**Symptôme** : Admin charge mais sans CSS
**Solution** : Vérifier que `collectstatic` s'exécute dans le build

### 2. WHITENOISE_MANIFEST_STRICT
**Symptôme** : Erreur "ValueError: Missing staticfiles manifest entry"
**Solution** : ✅ Déjà configuré à `False` dans production.py

### 3. SECRET_KEY Non Défini
**Symptôme** : "ImproperlyConfigured: The SECRET_KEY setting must not be empty"
**Solution** : Vérifier que Render a généré une SECRET_KEY

### 4. Base de Données Non Migrée
**Symptôme** : "OperationalError: no such table"
**Solution** : Vérifier que `migrate` s'exécute dans le build

