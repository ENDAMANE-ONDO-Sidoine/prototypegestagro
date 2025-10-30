import os
from pathlib import Path
from typing import Optional

from elasticsearch import Elasticsearch
try:
    from decouple import Config, RepositoryEnv
except Exception:
    Config = None  # type: ignore
    RepositoryEnv = None  # type: ignore


def _get_from_env_or_file(key: str, default: Optional[str] = None) -> Optional[str]:
    """Fetch a variable from process env, else from backend/config.env if present."""
    value = os.environ.get(key)
    if value is not None:
        return value
    # Fallback: backend/config.env
    try:
        if Config and RepositoryEnv:
            backend_dir = Path(__file__).resolve().parents[2]
            env_path = backend_dir / "config.env"
            if env_path.exists():
                cfg = Config(RepositoryEnv(str(env_path)))
                return cfg(key, default=default)
    except Exception:
        pass
    return default


def get_es_client() -> Elasticsearch:
    """Return a configured Elasticsearch client using environment variables.

    Expected env vars:
    - ELASTICSEARCH_URL
    - ELASTICSEARCH_USERNAME
    - ELASTICSEARCH_PASSWORD
    - ELASTICSEARCH_FINGERPRINT (optional; recommended for self-signed TLS)
    """
    url: str = _get_from_env_or_file("ELASTICSEARCH_URL", "https://localhost:9200")  # type: ignore[arg-type]
    username: str = _get_from_env_or_file("ELASTICSEARCH_USERNAME", "") or ""
    password: str = _get_from_env_or_file("ELASTICSEARCH_PASSWORD", "") or ""
    fingerprint: Optional[str] = _get_from_env_or_file("ELASTICSEARCH_FINGERPRINT")
    ca_certs_path: Optional[str] = _get_from_env_or_file("ELASTICSEARCH_CA_CERTS")
    verify_certs_env: str = (_get_from_env_or_file("ELASTICSEARCH_VERIFY_CERTS", "true") or "true").lower()
    verify_certs: bool = verify_certs_env in ("1", "true", "yes", "y")

    kwargs: dict = {
        "basic_auth": (username, password) if username or password else None,
        "request_timeout": 10,
        "verify_certs": verify_certs,
    }
    # Priorité au CA local si fourni
    if ca_certs_path:
        kwargs["ca_certs"] = ca_certs_path
    elif fingerprint:
        kwargs["ssl_assert_fingerprint"] = fingerprint

    # Remove None values to avoid warnings
    filtered_kwargs = {k: v for k, v in kwargs.items() if v is not None}

    return Elasticsearch(url, **filtered_kwargs)


def ping_elasticsearch() -> bool:
    """Lightweight health check used by diagnostics/tests."""
    client = get_es_client()
    try:
        return bool(client.ping())
    except Exception:
        return False


