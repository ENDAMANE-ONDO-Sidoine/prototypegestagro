from elasticsearch import ApiError
from gestagro.utils.search_client import get_es_client


def ensure_products_index(index_name: str = "products", force: bool = False) -> dict:
    """Create or recreate the products index with French folding analyzer.

    - Adds lowercase + asciifolding to ignore accents ("mais" ~= "maïs").
    - Multi-fields: name/name.folded, description/description.folded.
    """
    es = get_es_client()
    if es.indices.exists(index=index_name):
        if not force:
            return {"created": False, "index": index_name}
        es.indices.delete(index=index_name, ignore=[404])

    body = {
        "settings": {
            "analysis": {
                "filter": {
                    "french_elision": {
                        "type": "elision",
                        "articles_case": True,
                        "articles": [
                            "l", "m", "t", "qu", "n", "s", "j", "d", "c", "jusqu", "quoiqu", "lorsqu", "puisqu"
                        ],
                    },
                },
                "analyzer": {
                    "fr_folded": {
                        "type": "custom",
                        "char_filter": ["html_strip"],
                        "tokenizer": "standard",
                        "filter": ["lowercase", "asciifolding", "french_elision"],
                    }
                },
            }
        },
        "mappings": {
            "properties": {
                "id": {"type": "keyword"},
                "name": {
                    "type": "text",
                    "analyzer": "fr_folded",
                    "fields": {"folded": {"type": "text", "analyzer": "fr_folded"}},
                },
                "description": {
                    "type": "text",
                    "analyzer": "fr_folded",
                    "fields": {"folded": {"type": "text", "analyzer": "fr_folded"}},
                },
                "category": {
                    "type": "keyword",
                    "fields": {"folded": {"type": "text", "analyzer": "fr_folded"}},
                },
                "organization_id": {"type": "keyword"},
                "price": {"type": "float"},
                "created_at": {"type": "date"},
            }
        },
    }
    es.indices.create(index=index_name, **body)
    return {"created": True, "index": index_name, "forced": force}


def index_product_document(product) -> None:
    """Index a Django Product instance into Elasticsearch."""
    es = get_es_client()
    doc = {
        "id": str(product.id),
        "name": getattr(product, "name", ""),
        "description": getattr(product, "description", "") or "",
        "category": getattr(getattr(product, "category", None), "name", None),
        "organization_id": str(getattr(product, "organization_id", "") or ""),
        "price": float(product.price) if getattr(product, "price", None) is not None else None,
        "created_at": product.created_at.isoformat() if getattr(product, "created_at", None) else None,
    }
    es.index(index="products", id=str(product.id), document=doc, refresh="wait_for")


def delete_product_document(product_id) -> None:
    es = get_es_client()
    try:
        es.delete(index="products", id=str(product_id), ignore=[404], refresh="wait_for")
    except Exception:
        # deletion best-effort
        pass


