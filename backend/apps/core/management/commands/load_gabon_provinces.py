"""
Commande Django pour charger les provinces et villes du Gabon
"""
from django.core.management.base import BaseCommand
from apps.core.models import Province, City


GABON_PROVINCES = {
    "Estuaire": {
        "chef_lieu": "Libreville",
        "villes": ["Libreville", "Owendo", "Ntoum", "Kango", "Cocobeach"]
    },
    "Haut-Ogooué": {
        "chef_lieu": "Franceville",
        "villes": ["Franceville", "Moanda", "Mounana", "Bongoville", "Okondja"]
    },
    "Moyen-Ogooué": {
        "chef_lieu": "Lambaréné",
        "villes": ["Lambaréné", "Ndjolé", "Makouké", "Bifoun", "Alembe"]
    },
    "Ngounié": {
        "chef_lieu": "Mouila",
        "villes": ["Mouila", "Fougamou", "Mandji", "Mbigou", "Lebamba"]
    },
    "Nyanga": {
        "chef_lieu": "Tchibanga",
        "villes": ["Tchibanga", "Mayumba", "Moabi", "Ndindi", "Mabanda"]
    },
    "Ogooué-Ivindo": {
        "chef_lieu": "Makokou",
        "villes": ["Makokou", "Booué", "Mekambo", "Minvoul", "Bélinga"]
    },
    "Ogooué-Lolo": {
        "chef_lieu": "Koulamoutou",
        "villes": ["Koulamoutou", "Lastoursville", "Iboundji", "Popa", "Mouila-Est"]
    },
    "Ogooué-Maritime": {
        "chef_lieu": "Port-Gentil",
        "villes": ["Port-Gentil", "Omboué", "Gamba", "Setté-Cama", "Evaro"]
    },
    "Woleu-Ntem": {
        "chef_lieu": "Oyem",
        "villes": ["Oyem", "Bitam", "Minvoul", "Mitzic", "Medouneu"]
    }
}


class Command(BaseCommand):
    help = 'Charge les provinces et villes du Gabon dans la base de données'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Supprime toutes les provinces et villes existantes avant de charger',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write(self.style.WARNING('Suppression des provinces et villes existantes...'))
            City.objects.all().delete()
            Province.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('✓ Suppression terminée'))

        created_count = 0
        updated_count = 0

        for province_name, province_data in GABON_PROVINCES.items():
            province, created = Province.objects.get_or_create(
                name=province_name,
                defaults={
                    'chef_lieu': province_data['chef_lieu'],
                    'is_active': True
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'✓ Province créée: {province_name}'))
            else:
                # Mise à jour si nécessaire
                if province.chef_lieu != province_data['chef_lieu']:
                    province.chef_lieu = province_data['chef_lieu']
                    province.save()
                    updated_count += 1
                    self.stdout.write(self.style.WARNING(f'↻ Province mise à jour: {province_name}'))
                else:
                    self.stdout.write(f'  Province existante: {province_name}')

            # Création des villes
            for ville_name in province_data['villes']:
                is_chef_lieu = (ville_name == province_data['chef_lieu'])
                city, city_created = City.objects.get_or_create(
                    name=ville_name,
                    province=province,
                    defaults={
                        'is_chef_lieu': is_chef_lieu,
                        'is_active': True
                    }
                )
                
                if city_created:
                    created_count += 1
                    self.stdout.write(f'  ✓ Ville créée: {ville_name} ({province_name})')
                else:
                    # Mise à jour si nécessaire
                    if city.is_chef_lieu != is_chef_lieu:
                        city.is_chef_lieu = is_chef_lieu
                        city.save()
                        updated_count += 1

        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS(f'✓ Chargement terminé: {created_count} éléments créés, {updated_count} éléments mis à jour'))
        self.stdout.write(f'  Total provinces: {Province.objects.count()}')
        self.stdout.write(f'  Total villes: {City.objects.count()}')

