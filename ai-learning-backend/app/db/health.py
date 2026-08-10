from typing import Any, Dict
from app.db.client import db_client


async def check_database_health() -> Dict[str, Any]:
    is_healthy = await db_client.check_health(timeout_seconds=2.0)
    return {
        "status": "ok" if is_healthy else "error",
        "healthy": is_healthy,
    }
