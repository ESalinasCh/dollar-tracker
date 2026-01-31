import httpx
from datetime import datetime, timedelta
from typing import Optional
import logging
import random
import math

from app.config import get_settings
from app.models.schemas import (
    ExchangePrice,
    BestPrice,
    CurrentPricesResponse,
    PriceDataPoint,
    PriceHistorySummary,
    PriceHistoryResponse,
    VolatilityResponse,
    PriceRange,
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
            "coinbase": "unknown",
            "exchangerate_api": "unknown",
            "binance": "unknown",
            "dolarapi": "unknown",
        }
        self._coinbase_bob_rate: float = 6.96  # Official rate cache
        self._exchangerate_bob: float = 6.92  # ExchangeRate-API rate
        self._binance_usdt_ars: float = 1500.0  # Binance USDT/ARS reference
    
    async def get_current_prices(self) -> CurrentPricesResponse:
        """Get current exchange rates from available sources."""
        
        # Check cache
        cache_key = "current_prices"
        if self._is_cache_valid(cache_key):
            return self._cache[cache_key]
        
        prices = []
        source_used = "unknown"
        sources_active = []
        
        # Fetch official BOB rate from Coinbase first
        try:
            coinbase_rate = await self._fetch_coinbase_bob()
            if coinbase_rate:
                self._coinbase_bob_rate = coinbase_rate
                self._source_status["coinbase"] = "active"
                sources_active.append("Coinbase")
        except Exception as e:
            logger.error(f"Coinbase error: {e}")
            self._source_status["coinbase"] = "error"
        
        # Fetch from ExchangeRate-API (official rates)
        try:
            exchangerate_bob = await self._fetch_exchangerate_api()
            if exchangerate_bob:
                self._exchangerate_bob = exchangerate_bob
                self._source_status["exchangerate_api"] = "active"
                sources_active.append("ExchangeRate-API")
                # Add ExchangeRate-API as a price source
                prices.append(ExchangePrice(
                    exchange="exchangerate_api",
                    name="ExchangeRate-API (Oficial)",
                    bid=round(exchangerate_bob * 0.995, 2),
                    ask=round(exchangerate_bob * 1.005, 2),
                    last=round(exchangerate_bob, 2),
                    change_24h=0.0,
                    updated_at=datetime.utcnow(),
                ))
        except Exception as e:
            logger.error(f"ExchangeRate-API error: {e}")
            self._source_status["exchangerate_api"] = "error"
        
        # Fetch Binance P2P (Real BOB Rates)
        try:
            # P2P BUY order means I want to BUY USDT paying BOB -> Use "SELL" ad type (Advertisers SELLING USDT)
            # P2P SELL order means I want to SELL USDT receiving BOB -> Use "BUY" ad type (Advertisers BUYING USDT)
            # BUT: Binance API tradeType "BUY" means "Ads where users can BUY".
            # So:
            # tradeType="BUY" -> Users BUY USDT -> Advertiser SELLS -> This is the ASK price
            # tradeType="SELL" -> Users SELL USDT -> Advertiser BUYS -> This is the BID price
            
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
        
        # Try DolarAPI (Bolivia Endpoint)
        try:
            dolar_data = await self._fetch_dolarapi()
            if dolar_data:
                prices.extend(dolar_data)
                sources_active.append("DolarAPI")
                self._source_status["dolarapi"] = "active"
        except Exception as e:
            logger.error(f"DolarAPI error: {e}")
            self._source_status["dolarapi"] = "error"
        
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
        
        response = CurrentPricesResponse(
            timestamp=datetime.utcnow(),
            base_currency="USD",
            quote_currency="BOB",
            prices=prices,
            average=round(avg_price, 4),
            best_buy=BestPrice(exchange=best_buy.exchange, price=best_buy.bid),
            best_sell=BestPrice(exchange=best_sell.exchange, price=best_sell.ask),
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
    
    async def get_volatility(self, period: str = "24h") -> VolatilityResponse:
        """Calculate volatility metrics."""
        
        history = await self.get_price_history(period)
        closes = [dp.close for dp in history.data_points]
        
        if len(closes) < 2:
            std_dev = 0.0
            volatility = 0.0
        else:
            mean = sum(closes) / len(closes)
            variance = sum((x - mean) ** 2 for x in closes) / len(closes)
            std_dev = math.sqrt(variance)
            volatility = (std_dev / mean) * 100 if mean else 0.0
        
        # Determine rating
        if volatility < 1.0:
            rating = "low"
        elif volatility < 3.0:
            rating = "medium"
        else:
            rating = "high"
        
        return VolatilityResponse(
            period=period,
            volatility=round(volatility, 2),
            rating=rating,
            standard_deviation=round(std_dev, 4),
            range=PriceRange(
                min=round(min(closes), 4) if closes else 0,
                max=round(max(closes), 4) if closes else 0,
            ),
        )
    
    async def get_sources(self) -> SourcesResponse:
        """Get information about data sources."""
        
        sources = [
            SourceInfo(
                id="coinbase",
                name="Coinbase",
                url="https://coinbase.com",
                status=self._source_status.get("coinbase", "unknown"),
                last_check=datetime.utcnow(),
            ),
            SourceInfo(
                id="exchangerate_api",
                name="ExchangeRate-API",
                url="https://exchangerate-api.com",
                status=self._source_status.get("exchangerate_api", "unknown"),
                last_check=datetime.utcnow(),
            ),
            SourceInfo(
                id="binance",
                name="Binance P2P",
                url="https://p2p.binance.com",
                status=self._source_status.get("binance", "unknown"),
                last_check=datetime.utcnow(),
            ),
            SourceInfo(
                id="dolarapi",
                name="DolarAPI.com",
                url="https://dolarapi.com",
                status=self._source_status.get("dolarapi", "unknown"),
                last_check=datetime.utcnow(),
            ),
        ]
        
        return SourcesResponse(sources=sources)
    
    # ============================================
    # Private Methods
    # ============================================
    
    async def _fetch_coinbase_bob(self) -> float:
        """Fetch official USD/BOB rate from Coinbase."""
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get("https://api.coinbase.com/v2/exchange-rates?currency=USD")
            response.raise_for_status()
            data = response.json()
            
            bob_rate = data.get("data", {}).get("rates", {}).get("BOB")
            if bob_rate:
                return float(bob_rate)
            return 6.96  # Default fallback
    
    async def _fetch_exchangerate_api(self) -> float:
        """Fetch official USD/BOB rate from ExchangeRate-API."""
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get("https://api.exchangerate-api.com/v4/latest/USD")
            response.raise_for_status()
            data = response.json()
            
            bob_rate = data.get("rates", {}).get("BOB")
            if bob_rate:
                return float(bob_rate)
            return 6.92  # Default fallback
    
    async def _fetch_binance_p2p(self, trade_type: str = "BUY") -> float:
        """
        Fetch P2P rates from Binance (USDT/BOB).
        trade_type: "BUY" (what users pay to buy USDT) or "SELL" (what users get selling USDT)
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

    async def _fetch_binance_usdt_ars(self) -> float:
        # Keep for backward compatibility or reference if needed, 
        # but P2P is now primary for BOB
        return 1500.0
    
    async def _fetch_dolarapi(self) -> list[ExchangePrice]:
        """Fetch data from DolarAPI.com (Bolivia Endpoint)."""
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{settings.dolar_api_url}/dolares")
            response.raise_for_status()
            data = response.json()
            
            prices = []
            for item in data:
                # Map 'casa' to exchange
                exchange_id = f"dolarapi_{item.get('casa', 'unknown').lower()}"
                
                # Check for valid prices (Binance might have None for compra)
                bid = item.get("compra") or 0.0
                ask = item.get("venta") or 0.0
                
                if bid == 0 and ask == 0:
                    continue
                    
                # Calculate last price
                if bid > 0 and ask > 0:
                    last = (bid + ask) / 2
                elif ask > 0: # If only ask (sell) price exists (like Binance here)
                    last = ask
                else:
                    last = bid
                    
                prices.append(ExchangePrice(
                    exchange=exchange_id, # 'oficial' or 'binance'
                    name=item.get("nombre", item.get("casa", "Unknown")),
                    bid=float(bid),
                    ask=float(ask),
                    last=round(float(last), 2),
                    change_24h=0.0,
                    updated_at=datetime.fromisoformat(
                        item.get("fechaActualizacion", datetime.utcnow().isoformat()).replace("Z", "+00:00")
                    ) if item.get("fechaActualizacion") else datetime.utcnow(),
                ))
            
            return prices
    
    def _get_mock_prices(self) -> list[ExchangePrice]:
        """Return mock prices for development."""
        now = datetime.utcnow()
        base_price = 6.96
        
        exchanges = [
            ("binance", "Binance", 0.01),
            ("kraken", "Kraken", -0.01),
            ("coinbase", "Coinbase", 0.02),
            ("bitso", "Bitso", -0.02),
            ("huobi", "Huobi", 0.0),
        ]
        
        prices = []
        for exchange_id, name, offset in exchanges:
            bid = round(base_price + offset - 0.02, 2)
            ask = round(base_price + offset + 0.01, 2)
            last = round((bid + ask) / 2, 2)
            
            prices.append(ExchangePrice(
                exchange=exchange_id,
                name=name,
                bid=bid,
                ask=ask,
                last=last,
                change_24h=round(random.uniform(-0.5, 0.5), 2),
                volume_24h=random.randint(100000, 2000000),
                updated_at=now,
            ))
        
        return prices
    
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
        elif days <= 30:
            num_points = 30
            delta = timedelta(days=1)
        else:
            num_points = 365
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
