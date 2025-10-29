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
            # Compter les tables
            cursor.execute("""
                SELECT COUNT(*) 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
            """)
            table_count = cursor.fetchone()[0]
            
            # Lister les tables
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name
            """)
            tables = [row[0] for row in cursor.fetchall()]
            
            # Vérifier les migrations
            cursor.execute("""
                SELECT app, name 
                FROM django_migrations 
                ORDER BY app, name
            """)
            migrations = [f"{row[0]}.{row[1]}" for row in cursor.fetchall()]
            
            return JsonResponse({
                'status': 'success',
                'database': {
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
