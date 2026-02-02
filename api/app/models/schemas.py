from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


# ============================================
# Price Models
# ============================================

class ExchangePrice(BaseModel):
    """Price data from a single exchange/source."""
    exchange: str
    name: str
    bid: float = Field(..., description="Buy price")
    ask: float = Field(..., description="Sell price")
    last: float = Field(..., description="Last traded price")
    change_24h: float = Field(default=0.0, description="24h change percentage")
    volume_24h: Optional[float] = Field(default=None, description="24h volume")
    updated_at: datetime


class BestPrice(BaseModel):
    """Best price reference."""
    exchange: str
    price: float


class CurrentPricesResponse(BaseModel):
    """Response for current prices endpoint."""
    timestamp: datetime
    base_currency: str = "USD"
    quote_currency: str = "BOB"
    prices: list[ExchangePrice]
    average: float
    best_buy: BestPrice
    best_sell: BestPrice
    source: str = Field(..., description="Data source name")


# ============================================
# History Models
# ============================================

class PriceDataPoint(BaseModel):
    """Single data point in price history."""
    timestamp: datetime
    open: float
    high: float
    low: float
    close: float
    volume: Optional[float] = None
    reference_close: Optional[float] = Field(default=None, description="Reference price (e.g., Official BCB) for comparison")


class PriceHistorySummary(BaseModel):
    """Summary statistics for price history."""
    avg_price: float
    min_price: float
    max_price: float
    total_volume: Optional[float] = None
    change_percent: float


class PriceHistoryResponse(BaseModel):
    """Response for price history endpoint."""
    exchange: str
    interval: str
    data_points: list[PriceDataPoint]
    summary: PriceHistorySummary


# ============================================
# Stats Models
# ============================================

class PriceRange(BaseModel):
    """Price range with min and max."""
    min: float
    max: float


class VolatilityResponse(BaseModel):
    """Response for volatility endpoint."""
    period: str
    volatility: float
    rating: str  # low, medium, high
    standard_deviation: float
    range: PriceRange


# ============================================
# Source Models
# ============================================

class SourceInfo(BaseModel):
    """Information about a data source."""
    id: str
    name: str
    url: str
    status: str  # active, inactive, error
    last_check: Optional[datetime] = None


class SourcesResponse(BaseModel):
    """Response for sources endpoint."""
    sources: list[SourceInfo]


# ============================================
# Error Models
# ============================================

class ErrorDetail(BaseModel):
    """Error detail information."""
    code: str
    message: str
    details: Optional[dict] = None


class ErrorResponse(BaseModel):
    """Standard error response."""
    error: ErrorDetail


# ============================================
# Health Models
# ============================================

class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    timestamp: datetime
    version: str
    sources: dict[str, str]
