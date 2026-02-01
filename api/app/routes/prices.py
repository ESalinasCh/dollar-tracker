from fastapi import APIRouter, Query, Depends
from typing import Optional

from app.dependencies import get_exchange_service
from app.services import ExchangeService
from app.models import CurrentPricesResponse, PriceHistoryResponse

router = APIRouter(prefix="/prices", tags=["Prices"])


@router.get(
    "/current",
    response_model=CurrentPricesResponse,
    summary="Get current exchange rates",
    description="Returns current USD/BOB exchange rates from all available sources.",
)
async def get_current_prices(
    service: ExchangeService = Depends(get_exchange_service)
):
    """
    Get current exchange rates (US1).
    
    Returns the current dollar exchange rate from multiple sources,
    including the average price and best buy/sell recommendations.
    """
    return await service.get_current_prices()


@router.get(
    "/history",
    response_model=PriceHistoryResponse,
    summary="Get historical price data",
    description="Returns historical price data for specified time interval.",
)
async def get_price_history(
    interval: str = Query(
        default="7d",
        description="Time interval for historical data",
        enum=["1h", "24h", "7d", "30d", "1y"],
    ),
    exchange: Optional[str] = Query(
        default=None,
        description="Filter by specific exchange",
    ),
    service: ExchangeService = Depends(get_exchange_service),
):
    """
    Get historical price data (US2).
    
    Returns price history with OHLCV data for the specified interval.
    Users can filter by exchange and select different time ranges.
    """
    return await service.get_price_history(interval, exchange)
