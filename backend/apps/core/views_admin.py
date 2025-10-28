"""
Vues d'administration temporaires
⚠️ À SUPPRIMER après la migration initiale
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.core.management import call_command
from io import StringIO
import sys


@api_view(['POST'])
@permission_classes([AllowAny])  # ⚠️ TEMPORAIRE - À sécuriser
def trigger_migrations(request):
    """
    Endpoint temporaire pour déclencher les migrations
    ⚠️ À SUPPRIMER après utilisation
    
    Usage: POST /api/v1/admin/migrate/
    """
    # Vérifier un token secret simple
    secret = request.data.get('secret')
    if secret != 'gestagro-migrate-2025':
        return Response({
            'error': 'Token secret invalide'
        }, status=403)
    
    try:
        # Capturer la sortie
        output = StringIO()
        sys.stdout = output
        
        # Exécuter la commande
        call_command('migrate_production')
        
        # Restaurer stdout
        sys.stdout = sys.__stdout__
        
        return Response({
            'status': 'success',
            'message': 'Migrations exécutées avec succès',
            'output': output.getvalue()
        })
    except Exception as e:
        sys.stdout = sys.__stdout__
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=500)


@api_view(['GET'])
@permission_classes([AllowAny])
def check_database(request):
    """
    Vérifier l'état de la base de données
    """
    from django.db import connection
    
    try:
        with connection.cursor() as cursor:
            # Compter les tables
            cursor.execute("""
                SELECT COUNT(*) 
                FROM information_schema.tables 
                WHERE table_schema = 'public';
            """)
            table_count = cursor.fetchone()[0]
            
            # Lister quelques tables
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                ORDER BY table_name 
                LIMIT 10;
            """)
            tables = [row[0] for row in cursor.fetchall()]
            
            return Response({
                'status': 'connected',
                'table_count': table_count,
                'sample_tables': tables,
                'database': connection.settings_dict['NAME'],
                'host': connection.settings_dict['HOST']
            })
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=500)

