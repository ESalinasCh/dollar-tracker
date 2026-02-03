"""
Pytest configuration and fixtures for Dollar Tracker API tests.
"""
import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import AsyncMock, MagicMock
from datetime import datetime

from app.main import app
from app.services.exchange_service import ExchangeService
from app.models.schemas import (
    CurrentPricesResponse,
    ExchangePrice,
    BestPrice,
    PriceHistoryResponse,
    PriceDataPoint,
    PriceHistorySummary,
    SourcesResponse,
    SourceInfo,
)


@pytest.fixture
def mock_exchange_service():
    """Create a mock exchange service with predefined responses."""
    service = MagicMock(spec=ExchangeService)

    # Mock current prices response
    mock_prices = CurrentPricesResponse(
        timestamp=datetime.utcnow(),
        base_currency="USD",
        quote_currency="BOB",
        prices=[
            ExchangePrice(
                exchange="binance",
                name="Binance P2P",
                bid=9.20,
                ask=9.25,
                last=9.22,
                change_24h=0.5,
                updated_at=datetime.utcnow(),
                volume_24h=None,
            ),
            ExchangePrice(
                exchange="bcb",
                name="BCB (Oficial)",
                bid=6.96,
                ask=6.96,
                last=6.96,
                change_24h=0.0,
                updated_at=datetime.utcnow(),
                volume_24h=None,
            ),
        ],
        average=9.22,
        best_buy=BestPrice(exchange="binance", price=9.20),
        best_sell=BestPrice(exchange="binance", price=9.25),
        source="Binance P2P",
    )
    service.get_current_prices = AsyncMock(return_value=mock_prices)

    # Mock history response
    mock_history = PriceHistoryResponse(
        exchange="all",
        interval="24h",
        data_points=[
            PriceDataPoint(
                timestamp=datetime.utcnow(),
                open=9.20,
                high=9.25,
                low=9.18,
                close=9.22,
                volume=0,
            )
        ],
        summary=PriceHistorySummary(
            avg_price=9.21,
            min_price=9.18,
            max_price=9.25,
            total_volume=0,
            change_percent=0.5,
        ),
    )
    service.get_price_history = AsyncMock(return_value=mock_history)

    # Mock sources response
    mock_sources = SourcesResponse(
        sources=[
            SourceInfo(
                id="binance",
                name="Binance P2P",
                url="https://p2p.binance.com",
                status="active",
                last_check=datetime.utcnow(),
            )
        ]
    )
    service.get_sources = AsyncMock(return_value=mock_sources)

    return service


@pytest.fixture
async def client(mock_exchange_service):
    """Create an async test client with mocked dependencies."""
    # Set up the mock exchange service in app state
    app.state.exchange_service = mock_exchange_service

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    # Cleanup
    if hasattr(app.state, 'exchange_service'):
        del app.state.exchange_service
