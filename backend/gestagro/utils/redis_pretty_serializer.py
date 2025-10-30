"""
Sérialiseur JSON lisible pour django-redis (indentation + UTF-8).
"""
import json
from django_redis.serializers.base import BaseSerializer


class PrettyJSONSerializer(BaseSerializer):
    """Sérialise en JSON avec indentations pour lecture dans Redis Insight."""

    def dumps(self, value):
        return json.dumps(
            value,
            ensure_ascii=False,
            indent=2,
            separators=(",", ": "),
        )

    def loads(self, value):
        if value is None:
            return None
        if isinstance(value, (bytes, bytearray)):
            value = value.decode("utf-8")
        return json.loads(value)


