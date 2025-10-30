from django.core.management.base import BaseCommand

from apps.farmers.models import Product
from gestagro.utils.search_index import ensure_products_index, index_product_document


class Command(BaseCommand):
    help = "Réindexe tous les produits PostgreSQL vers Elasticsearch"

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Supprime et recrée l'index avant réindexation",
        )

    def handle(self, *args, **options):
        if options.get("reset"):
            ensure_products_index(force=True)
            self.stdout.write(self.style.WARNING("Index recréé."))
        else:
            ensure_products_index()

        count = 0
        for product in Product.objects.all().iterator():
            index_product_document(product)
            count += 1
            if count % 100 == 0:
                self.stdout.write(f"Indexés: {count}")

        self.stdout.write(self.style.SUCCESS(f"Réindexation terminée. Total: {count}"))


