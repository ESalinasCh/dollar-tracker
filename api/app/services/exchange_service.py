import httpx
from datetime import datetime, timedelta
from typing import Optional
import logging
import random

from app.config import get_settings
from app.models.schemas import (
    ExchangePrice,
    BestPrice,
    CurrentPricesResponse,
    PriceDataPoint,
    PriceHistorySummary,
    PriceHistoryResponse,
    SourceInfo,
    SourcesResponse,
)

logger = logging.getLogger(__name__)
settings = get_settings()


class ExchangeService:
    """Service to fetch exchange rates from external APIs."""
    
    def __init__(self):
        self._cache: dict = {}
        self._cache_time: dict = {}
        self._source_status: dict = {
            "binance": "unknown",
        }
    
    async def get_current_prices(self) -> CurrentPricesResponse:
        """Get current exchange rates from available sources."""
        
        # Check cache
        cache_key = "current_prices"
        if self._is_cache_valid(cache_key):
            return self._cache[cache_key]
        
        prices = []
        source_used = "unknown"
        sources_active = []
        
        # Fetch Binance P2P (Real BOB Rates)
        try:
            p2p_buy_usdt = await self._fetch_binance_p2p(trade_type="BUY")  # User Buys = Ask
            p2p_sell_usdt = await self._fetch_binance_p2p(trade_type="SELL") # User Sells = Bid
            
            if p2p_buy_usdt and p2p_sell_usdt:
                self._source_status["binance"] = "active"
                sources_active.append("Binance P2P")
                
                prices.append(ExchangePrice(
                    exchange="binance",
                    name="Binance P2P (USDT)",
                    bid=round(p2p_sell_usdt, 2), # Price to sell USDT (receive BOB)
                    ask=round(p2p_buy_usdt, 2),  # Price to buy USDT (pay BOB)
                    last=round((p2p_buy_usdt + p2p_sell_usdt) / 2, 2),
                    change_24h=0.0,
                    updated_at=datetime.utcnow(),
                    volume_24h=None
                ))
        except Exception as e:
            logger.error(f"Binance error: {e}")
            self._source_status["binance"] = "error"
        
        # Set source used
        if sources_active:
            source_used = " + ".join(sources_active)
        
        # If no data, use mock data
        if not prices:
            prices = self._get_mock_prices()
            source_used = "Mock Data"
        
        # Calculate average and best prices
        if prices:
            avg_price = sum(p.last for p in prices) / len(prices)
            best_buy = min(prices, key=lambda p: p.bid)
            best_sell = max(prices, key=lambda p: p.ask)
        else:
            avg_price = 6.96
            best_buy = BestPrice(exchange="unknown", price=6.95)
            best_sell = BestPrice(exchange="unknown", price=6.98)
        
        # Handle BestPrice object vs ExchangePrice
        if isinstance(best_buy, ExchangePrice):
            best_buy = BestPrice(exchange=best_buy.exchange, price=best_buy.bid)
        if isinstance(best_sell, ExchangePrice):
            best_sell = BestPrice(exchange=best_sell.exchange, price=best_sell.ask)

        response = CurrentPricesResponse(
            timestamp=datetime.utcnow(),
            base_currency="USD",
            quote_currency="BOB",
            prices=prices,
            average=round(avg_price, 4),
            best_buy=best_buy,
            best_sell=best_sell,
            source=source_used,
        )
        
        # Cache result
        self._set_cache(cache_key, response)
        
        return response
    
    async def get_price_history(
        self, 
        interval: str = "7d",
        exchange: Optional[str] = None
    ) -> PriceHistoryResponse:
        """Get historical price data."""
        
        # Parse interval
        intervals = {
            "1h": 1/24,
            "24h": 1,
            "7d": 7,
            "30d": 30,
            "1y": 365,
        }
        days = intervals.get(interval, 7)
        
        # Generate data points (in production, fetch from DB or external API)
        data_points = self._generate_price_history(days)
        
        # Calculate summary
        closes = [dp.close for dp in data_points]
        summary = PriceHistorySummary(
            avg_price=round(sum(closes) / len(closes), 4),
            min_price=round(min(closes), 4),
            max_price=round(max(closes), 4),
            total_volume=sum(dp.volume or 0 for dp in data_points),
            change_percent=round(
                ((closes[-1] - closes[0]) / closes[0]) * 100 if closes[0] else 0, 
                2
            ),
        )
        
        return PriceHistoryResponse(
            exchange=exchange or "all",
            interval=interval,
            data_points=data_points,
            summary=summary,
        )
    

    async def get_sources(self) -> SourcesResponse:
        """Get information about data sources."""
        
        sources = [
            SourceInfo(
                id="binance",
                name="Binance P2P",
                url="https://p2p.binance.com",
                status=self._source_status.get("binance", "unknown"),
                last_check=datetime.utcnow(),
            ),
        ]
        
        return SourcesResponse(sources=sources)
    
    # ============================================
    # Private Methods
    # ============================================
    
    async def _fetch_binance_p2p(self, trade_type: str = "BUY") -> float:
        """
        Fetch P2P rates from Binance (USDT/BOB).
        """
        url = "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search"
        headers = {
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0",
        }
        payload = {
            "fiat": "BOB",
            "page": 1,
            "rows": 5,
            "tradeType": trade_type, 
            "asset": "USDT",
            "countries": [],
            "proMerchantAds": False,
            "shieldMerchantAds": False,
            "publisherType": None,
            "payTypes": [],
            "classifies": ["mass", "profession"]
        }
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(url, json=payload, headers=headers)
                response.raise_for_status()
                data = response.json()
                
                ads = data.get("data", [])
                if not ads:
                    return 0.0
                
                # Get average of top 3 prices to avoid outliers
                valid_ads = [float(ad["adv"]["price"]) for ad in ads[:3] if ad.get("adv", {}).get("price")]
                if not valid_ads:
                    return 0.0
                    
                return sum(valid_ads) / len(valid_ads)
        except Exception as e:
            logger.error(f"Binance P2P {trade_type} error: {e}")
            return 0.0

    def _get_mock_prices(self) -> list[ExchangePrice]:
        """Return mock prices for development."""
        now = datetime.utcnow()
        # Cleaned mock data - Only Binance
        return [ExchangePrice(
            exchange="binance",
            name="Binance",
            bid=6.95,
            ask=6.98,
            last=6.97,
            change_24h=0.01,
            volume_24h=1200000,
            updated_at=now,
        )]
    
    def _generate_price_history(self, days: float) -> list[PriceDataPoint]:
        """Generate simulated price history."""
        data_points = []
        now = datetime.utcnow()
        
        # Determine number of points and interval
        if days <= 1/24:  # 1 hour
            num_points = 60
            delta = timedelta(minutes=1)
        elif days <= 1:  # 24 hours
            num_points = 24
            delta = timedelta(hours=1)
        elif days <= 7:
            num_points = 7 * 24
            delta = timedelta(hours=1)
        else:
            num_points = 30
            delta = timedelta(days=1)
        
        base_price = 6.96
        volatility = 0.02
        
        for i in range(num_points, 0, -1):
            timestamp = now - (delta * i)
            
            # Random walk
            change = random.gauss(0, volatility)
            open_price = base_price + change
            close_price = open_price + random.gauss(0, volatility / 2)
            high_price = max(open_price, close_price) + random.uniform(0, 0.01)
            low_price = min(open_price, close_price) - random.uniform(0, 0.01)
            
            data_points.append(PriceDataPoint(
                timestamp=timestamp,
                open=round(open_price, 4),
                high=round(high_price, 4),
                low=round(low_price, 4),
                close=round(close_price, 4),
                volume=random.randint(10000, 100000),
            ))
            
            base_price = close_price
        
        return data_points
    
    def _is_cache_valid(self, key: str) -> bool:
        """Check if cache entry is still valid."""
        if key not in self._cache:
            return False
        
        cache_time = self._cache_time.get(key)
        if not cache_time:
            return False
        
        return (datetime.utcnow() - cache_time).total_seconds() < settings.cache_ttl
    
    def _set_cache(self, key: str, value) -> None:
        """Set cache entry."""
        self._cache[key] = value
        self._cache_time[key] = datetime.utcnow()


# Singleton instance
exchange_service = ExchangeService()
