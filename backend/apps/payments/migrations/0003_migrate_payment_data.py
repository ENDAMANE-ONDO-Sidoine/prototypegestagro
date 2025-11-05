# Generated migration for data migration

from django.db import migrations
from django.contrib.contenttypes.models import ContentType


def migrate_payment_data_forward(apps, schema_editor):
    """
    Migre les paiements existants vers la nouvelle structure générique
    """
    Payment = apps.get_model('payments', 'Payment')
    Order = apps.get_model('buyers', 'Order')
    
    # Obtenir le ContentType pour Order
    order_content_type = ContentType.objects.get_for_model(Order)
    
    # Migrer tous les paiements existants
    for payment in Payment.objects.filter(order__isnull=False):
        # Remplir les nouveaux champs depuis les anciens
        payment.content_type = order_content_type
        payment.object_id = payment.order.id if payment.order else None
        payment.payer = payment.buyer if payment.buyer else None
        payment.payment_type = 'order'
        payment.save()


def migrate_payment_data_backward(apps, schema_editor):
    """
    Migration inverse : restaure les anciennes relations
    """
    Payment = apps.get_model('payments', 'Payment')
    
    # Restaurer order et buyer depuis les nouvelles relations
    for payment in Payment.objects.filter(payment_type='order', content_type__isnull=False):
        if payment.transaction:
            payment.order = payment.transaction
            payment.buyer = payment.payer
            payment.save()


class Migration(migrations.Migration):

    dependencies = [
        ('payments', '0002_remove_payment_payments_pa_order_i_3fb38a_idx_and_more'),
        ('buyers', '0001_initial'),  # Ajuster selon vos migrations buyers
        ('contenttypes', '0002_remove_content_type_name'),
    ]

    operations = [
        migrations.RunPython(
            migrate_payment_data_forward,
            migrate_payment_data_backward
        ),
    ]
