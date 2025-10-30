from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

from apps.farmers.models import Product
from gestagro.utils.search_index import index_product_document, delete_product_document


@receiver(post_save, sender=Product)
def on_product_saved(sender, instance: Product, **kwargs):
    # Index or update product in Elasticsearch
    try:
        index_product_document(instance)
    except Exception:
        # Avoid breaking the request path for search indexing issues
        pass


@receiver(post_delete, sender=Product)
def on_product_deleted(sender, instance: Product, **kwargs):
    try:
        delete_product_document(instance.id)
    except Exception:
        pass


