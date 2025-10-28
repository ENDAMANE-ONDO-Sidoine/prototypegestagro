"""
Commande Django pour exécuter les migrations en production
"""
from django.core.management.base import BaseCommand
from django.core.management import call_command


class Command(BaseCommand):
    help = 'Exécute les migrations et le script de migration des rôles'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('=' * 80))
        self.stdout.write(self.style.SUCCESS('MIGRATION PRODUCTION'))
        self.stdout.write(self.style.SUCCESS('=' * 80))
        self.stdout.write('')
        
        # Exécuter les migrations
        self.stdout.write(self.style.WARNING('1. Application des migrations Django...'))
        call_command('migrate', '--noinput')
        self.stdout.write(self.style.SUCCESS('   ✅ Migrations appliquées'))
        self.stdout.write('')
        
        # Exécuter la migration des rôles
        self.stdout.write(self.style.WARNING('2. Migration des rôles utilisateurs...'))
        try:
            from scripts.migrate_user_roles import migrate_user_roles
            migrate_user_roles(dry_run=False)
            self.stdout.write(self.style.SUCCESS('   ✅ Rôles migrés'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'   ❌ Erreur: {e}'))
        
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('=' * 80))
        self.stdout.write(self.style.SUCCESS('MIGRATION TERMINÉE'))
        self.stdout.write(self.style.SUCCESS('=' * 80))

