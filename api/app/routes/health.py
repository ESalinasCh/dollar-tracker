from fastapi import APIRouter, Depends
from datetime import datetime

from app.config import get_settings
from app.models import HealthResponse
from app.dependencies import get_exchange_service
from app.services.exchange_service import ExchangeService

router = APIRouter(tags=["Health"])
settings = get_settings()


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check",
    description="Returns the health status of the API.",
)
async def health_check(
    exchange_service: ExchangeService = Depends(get_exchange_service)
):
    """
    Health check endpoint.

    Returns the API status, version, and status of data sources.
    Used for monitoring and load balancer health checks.
    """
    sources = await exchange_service.get_sources()
    source_status = {s.id: s.status for s in sources.sources}

    return HealthResponse(
        status="healthy",
        timestamp=datetime.utcnow(),
        version=settings.api_version,
        sources=source_status,
    )
