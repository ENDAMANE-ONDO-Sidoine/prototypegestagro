"""
Vues d'urgence pour diagnostic
⚠️ À SUPPRIMER après résolution des problèmes
"""
from django.http import JsonResponse
from django.db import connection
from django.core.management import call_command
from io import StringIO
import sys


def emergency_check_db(request):
    """
    Vérification d'urgence de la base de données
    Accès: GET /emergency/check-db/
    """
    try:
        with connection.cursor() as cursor:
            # Détecter le type de base de données
            db_engine = connection.vendor
            
            if db_engine == 'sqlite':
                # Requêtes SQLite
                cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
                tables = [row[0] for row in cursor.fetchall()]
                table_count = len(tables)
                
                # Vérifier les migrations
                try:
                    cursor.execute("SELECT app, name FROM django_migrations ORDER BY app, name")
                    migrations = [f"{row[0]}.{row[1]}" for row in cursor.fetchall()]
                except:
                    migrations = []
                    
            else:
                # Requêtes PostgreSQL/MySQL
                cursor.execute("""
                    SELECT COUNT(*) 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public'
                """)
                table_count = cursor.fetchone()[0]
                
                cursor.execute("""
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public'
                    ORDER BY table_name
                """)
                tables = [row[0] for row in cursor.fetchall()]
                
                cursor.execute("""
                    SELECT app, name 
                    FROM django_migrations 
                    ORDER BY app, name
                """)
                migrations = [f"{row[0]}.{row[1]}" for row in cursor.fetchall()]
            
            return JsonResponse({
                'status': 'success',
                'database': {
                    'engine': db_engine,
                    'connected': True,
                    'table_count': table_count,
                    'tables': tables,
                    'migrations_applied': len(migrations),
                    'migrations': migrations
                }
            })
            
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e),
            'database': {
                'connected': False
            }
        }, status=500)


def emergency_migrate(request):
    """
    Migration d'urgence
    Accès: POST /emergency/migrate/
    """
    try:
        # Capturer la sortie
        old_stdout = sys.stdout
        sys.stdout = captured_output = StringIO()
        
        # Exécuter les migrations
        call_command('migrate', verbosity=2)
        
        # Récupérer la sortie
        output = captured_output.getvalue()
        sys.stdout = old_stdout
        
        return JsonResponse({
            'status': 'success',
            'message': 'Migrations exécutées avec succès',
            'output': output
        })
        
    except Exception as e:
        sys.stdout = old_stdout
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=500)


def emergency_create_superuser(request):
    """
    Créer un superutilisateur d'urgence
    Accès: POST /emergency/create-superuser/
    Body: {"username": "admin", "email": "admin@gestagro.com", "password": "admin123"}
    """
    try:
        from django.contrib.auth import get_user_model
        import json
        User = get_user_model()
        
        # Récupérer les données (support JSON et form-data)
        if request.content_type == 'application/json':
            try:
                data = json.loads(request.body)
                username = data.get('username', 'admin')
                email = data.get('email', 'admin@gestagro.com')
                password = data.get('password', 'admin123')
            except:
                username = 'admin'
                email = 'admin@gestagro.com'
                password = 'admin123'
        else:
            username = request.POST.get('username', 'admin')
            email = request.POST.get('email', 'admin@gestagro.com')
            password = request.POST.get('password', 'admin123')
        
        # Créer le superutilisateur
        if User.objects.filter(username=username).exists():
            return JsonResponse({
                'status': 'warning',
                'message': f'Superutilisateur "{username}" existe déjà'
            })
        
        user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
            first_name='Admin',
            last_name='GestAgro'
        )
        
        return JsonResponse({
            'status': 'success',
            'message': 'Superutilisateur créé avec succès',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_superuser': user.is_superuser,
                'is_staff': user.is_staff
            }
        })
        
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=500)


def simple_create_admin(request):
    """
    Créer un superutilisateur simple (GET)
    Accès: GET /create-admin/
    """
    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        username = 'admin'
        email = 'admin@gestagro.com'
        password = 'admin123'
        
        # Créer le superutilisateur
        if User.objects.filter(username=username).exists():
            return JsonResponse({
                'status': 'warning',
                'message': f'Superutilisateur "{username}" existe déjà',
                'admin_url': 'https://gestagro-api.onrender.com/admin/',
                'credentials': {
                    'username': username,
                    'password': password
                }
            })
        
        user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
            first_name='Admin',
            last_name='GestAgro'
        )
        
        return JsonResponse({
            'status': 'success',
            'message': 'Superutilisateur créé avec succès !',
            'admin_url': 'https://gestagro-api.onrender.com/admin/',
            'credentials': {
                'username': username,
                'password': password
            },
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_superuser': user.is_superuser,
                'is_staff': user.is_staff
            }
        })
        
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=500)
