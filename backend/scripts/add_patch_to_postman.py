#!/usr/bin/env python3
"""
Script pour ajouter automatiquement les endpoints PATCH manquants à la collection Postman
"""
import json
import os
from datetime import datetime

def add_patch_endpoints_to_postman():
    """Ajoute les endpoints PATCH manquants à la collection Postman"""
    
    # Charger la collection Postman existante
    collection_path = "postman/GestAgro_API_Collection.json"
    
    if not os.path.exists(collection_path):
        print(f"❌ Collection Postman non trouvée: {collection_path}")
        return
    
    with open(collection_path, 'r', encoding='utf-8') as f:
        collection = json.load(f)
    
    print("🔧 Ajout des endpoints PATCH manquants à la collection Postman...")
    
    # Fonction pour créer un endpoint PATCH
    def create_patch_endpoint(name, url, description, body_data=None):
        return {
            "name": f"Partial Update {name}",
            "request": {
                "method": "PATCH",
                "header": [
                    {
                        "key": "Authorization",
                        "value": "Bearer {{access_token}}"
                    },
                    {
                        "key": "Content-Type",
                        "value": "application/json"
                    }
                ],
                "body": {
                    "mode": "raw",
                    "raw": json.dumps(body_data or {"notes": "Mise à jour partielle via PATCH"})
                },
                "url": {
                    "raw": f"{{base_url}}{url}",
                    "host": ["{{base_url}}"],
                    "path": url.replace("/api/v1/", "").split("/")
                },
                "description": f"Mise à jour partielle de {description}"
            },
            "response": []
        }
    
    # Endpoints PATCH à ajouter
    patch_endpoints = [
        # IAM - Memberships (déjà présent dans la collection)
        # Organizations
        {
            "folder": "🏢 Organizations",
            "subfolder": None,
            "endpoint": create_patch_endpoint("Organization", "/api/v1/organizations/1/", "une organisation", {"description": "Description mise à jour via PATCH"})
        },
        
        # Farmers - Categories
        {
            "folder": "🌾 Farmers (Agriculteurs)",
            "subfolder": "Categories",
            "endpoint": create_patch_endpoint("Category", "/api/v1/farmers/categories/1/", "une catégorie", {"description": "Catégorie mise à jour via PATCH"})
        },
        
        # Farmers - Products
        {
            "folder": "🌾 Farmers (Agriculteurs)",
            "subfolder": "Products",
            "endpoint": create_patch_endpoint("Product", "/api/v1/farmers/products/1/", "un produit", {"description": "Produit mis à jour via PATCH"})
        },
        
        # Farmers - Profile
        {
            "folder": "🌾 Farmers (Agriculteurs)",
            "subfolder": "Profile",
            "endpoint": create_patch_endpoint("Farmer Profile", "/api/v1/farmers/profile/", "le profil agriculteur", {"bio": "Bio mise à jour via PATCH"})
        },
        
        # Buyers - Profile
        {
            "folder": "🛒 Buyers (Acheteurs)",
            "subfolder": "Profile",
            "endpoint": create_patch_endpoint("Buyer Profile", "/api/v1/buyers/profile/", "le profil acheteur", {"preferences": "Préférences mises à jour via PATCH"})
        },
        
        # Buyers - Cart
        {
            "folder": "🛒 Buyers (Acheteurs)",
            "subfolder": "Cart",
            "endpoint": create_patch_endpoint("Cart", "/api/v1/buyers/cart/1/", "le panier", {"notes": "Notes mises à jour via PATCH"})
        },
        
        # Buyers - Orders
        {
            "folder": "🛒 Buyers (Acheteurs)",
            "subfolder": "Orders",
            "endpoint": create_patch_endpoint("Order", "/api/v1/buyers/orders/1/", "une commande", {"notes": "Notes de commande mises à jour via PATCH"})
        },
        
        # Buyers - Wishlists
        {
            "folder": "🛒 Buyers (Acheteurs)",
            "subfolder": "Wishlists",
            "endpoint": create_patch_endpoint("Wishlist", "/api/v1/buyers/wishlists/1/", "une liste de souhaits", {"name": "Liste mise à jour via PATCH"})
        },
        
        # Transport - Vehicles
        {
            "folder": "🚛 Transport",
            "subfolder": "Vehicles",
            "endpoint": create_patch_endpoint("Vehicle", "/api/v1/transport/vehicles/1/", "un véhicule", {"notes": "Véhicule mis à jour via PATCH"})
        },
        
        # Transport - Drivers
        {
            "folder": "🚛 Transport",
            "subfolder": "Drivers",
            "endpoint": create_patch_endpoint("Driver", "/api/v1/transport/drivers/1/", "un chauffeur", {"notes": "Chauffeur mis à jour via PATCH"})
        },
        
        # Transport - Routes
        {
            "folder": "🚛 Transport",
            "subfolder": "Routes",
            "endpoint": create_patch_endpoint("Route", "/api/v1/transport/routes/1/", "une route", {"notes": "Route mise à jour via PATCH"})
        },
        
        # Transport - Shipments
        {
            "folder": "🚛 Transport",
            "subfolder": "Shipments",
            "endpoint": create_patch_endpoint("Shipment", "/api/v1/transport/shipments/1/", "une expédition", {"notes": "Expédition mise à jour via PATCH"})
        },
        
        # Transport - Offers
        {
            "folder": "🚛 Transport",
            "subfolder": "Offers",
            "endpoint": create_patch_endpoint("Transport Offer", "/api/v1/transport/offers/1/", "une offre de transport", {"notes": "Offre mise à jour via PATCH"})
        },
        
        # Agronomy - Fields
        {
            "folder": "👨‍🌾 Agronomy",
            "subfolder": "Fields",
            "endpoint": create_patch_endpoint("Field", "/api/v1/agronomy/fields/1/", "un champ", {"notes": "Champ mis à jour via PATCH"})
        },
        
        # Agronomy - Crops
        {
            "folder": "👨‍🌾 Agronomy",
            "subfolder": "Crops",
            "endpoint": create_patch_endpoint("Crop", "/api/v1/agronomy/crops/1/", "une culture", {"notes": "Culture mise à jour via PATCH"})
        },
        
        # Agronomy - Visits
        {
            "folder": "👨‍🌾 Agronomy",
            "subfolder": "Field Visits",
            "endpoint": create_patch_endpoint("Field Visit", "/api/v1/agronomy/visits/1/", "une visite de champ", {"notes": "Visite mise à jour via PATCH"})
        },
        
        # Agronomy - Diagnostics
        {
            "folder": "👨‍🌾 Agronomy",
            "subfolder": "Diagnostics",
            "endpoint": create_patch_endpoint("Diagnostic", "/api/v1/agronomy/diagnostics/1/", "un diagnostic", {"notes": "Diagnostic mis à jour via PATCH"})
        },
        
        # Agronomy - Recommendations
        {
            "folder": "👨‍🌾 Agronomy",
            "subfolder": "Recommendations",
            "endpoint": create_patch_endpoint("Recommendation", "/api/v1/agronomy/recommendations/1/", "une recommandation", {"notes": "Recommandation mise à jour via PATCH"})
        },
        
        # Agronomy - Weather Alerts
        {
            "folder": "👨‍🌾 Agronomy",
            "subfolder": "Weather Alerts",
            "endpoint": create_patch_endpoint("Weather Alert", "/api/v1/agronomy/weather-alerts/1/", "une alerte météo", {"notes": "Alerte météo mise à jour via PATCH"})
        }
    ]
    
    # Fonction pour trouver un dossier dans la collection
    def find_folder(collection, folder_name):
        for item in collection.get("item", []):
            if item.get("name") == folder_name:
                return item
        return None
    
    # Fonction pour trouver un sous-dossier
    def find_subfolder(folder, subfolder_name):
        if not subfolder_name:
            return folder
        for item in folder.get("item", []):
            if item.get("name") == subfolder_name:
                return item
        return None
    
    # Ajouter les endpoints PATCH
    added_count = 0
    for patch_info in patch_endpoints:
        folder = find_folder(collection, patch_info["folder"])
        if not folder:
            print(f"⚠️ Dossier non trouvé: {patch_info['folder']}")
            continue
        
        target_folder = find_subfolder(folder, patch_info["subfolder"])
        if not target_folder:
            print(f"⚠️ Sous-dossier non trouvé: {patch_info['subfolder']} dans {patch_info['folder']}")
            continue
        
        # Vérifier si l'endpoint PATCH existe déjà
        existing_patch = None
        for item in target_folder.get("item", []):
            if item.get("name") == patch_info["endpoint"]["name"]:
                existing_patch = item
                break
        
        if existing_patch:
            print(f"ℹ️ Endpoint PATCH déjà présent: {patch_info['folder']} - {patch_info['endpoint']['name']}")
        else:
            # Ajouter l'endpoint PATCH
            if "item" not in target_folder:
                target_folder["item"] = []
            target_folder["item"].append(patch_info["endpoint"])
            added_count += 1
            print(f"✅ Ajouté: {patch_info['folder']} - {patch_info['endpoint']['name']}")
    
    # Sauvegarder la collection mise à jour
    with open(collection_path, 'w', encoding='utf-8') as f:
        json.dump(collection, f, indent=2, ensure_ascii=False)
    
    print(f"\n🎉 TERMINÉ!")
    print(f"✅ {added_count} endpoints PATCH ajoutés à la collection Postman")
    print(f"📁 Collection sauvegardée: {collection_path}")

if __name__ == "__main__":
    add_patch_endpoints_to_postman()
