from django.core.management.base import BaseCommand

from gestagro.utils.search_index import ensure_products_index


class Command(BaseCommand):
    help = "Initialise l'index Elasticsearch des produits"

    def add_arguments(self, parser):
        parser.add_argument(
            "--force",
            action="store_true",
            help="Recrée l'index s'il existe déjà (destructif)",
        )

    def handle(self, *args, **options):
        result = ensure_products_index(force=options.get("force", False))
        if result.get("created"):
            suffix = " (recréé)" if result.get("forced") else ""
            self.stdout.write(self.style.SUCCESS(f"Index '{result['index']}' créé{suffix}."))
        else:
            self.stdout.write(self.style.WARNING(f"Index '{result['index']}' déjà existant."))


