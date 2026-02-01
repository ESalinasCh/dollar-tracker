from fastapi import APIRouter, Query, Depends

from app.dependencies import get_exchange_service
from app.services import ExchangeService
from app.models import VolatilityResponse, SourcesResponse

router = APIRouter(prefix="/stats", tags=["Statistics"])


@router.get(
    "/volatility",
    response_model=VolatilityResponse,
    summary="Get volatility metrics",
    description="Returns volatility metrics for the exchange rate.",
)
async def get_volatility(
    period: str = Query(
        default="24h",
        description="Period for volatility calculation",
        enum=["1h", "24h", "7d", "30d"],
    ),
    service: ExchangeService = Depends(get_exchange_service),
):
    """
    Get volatility metrics.
    
    Calculates and returns volatility statistics including
    standard deviation and a qualitative rating (low/medium/high).
    """
    return await service.get_volatility(period)


@router.get(
    "/sources",
    response_model=SourcesResponse,
    summary="Get data sources",
    description="Returns information about available data sources (US6).",
)
async def get_sources(
    service: ExchangeService = Depends(get_exchange_service),
):
    """
    Get information about data sources (US6).
    
    Returns a list of all configured data sources with their
    current status and last check time.
    """
    return await service.get_sources()
