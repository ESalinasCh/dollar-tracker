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
        logger.info(f"Initializing ExchangeService from {__file__} - Instance {id(self)}")
        self._cache: dict = {}
        self._cache_time: dict = {}
        self._source_status: dict = {
            "binance": "unknown",
            "okx": "unknown",
            "airtm": "unknown",
            "wallbit": "unknown",
            "takenos": "unknown",
            "bcb": "unknown",
        }
        # DolarBlueBolivia API base URL
        self._dbb_base_url = "https://api.dolarbluebolivia.click"
        
        # In-memory cache for partial recovery on API failure
        self._dbb_prices: dict = {}
    
    async def get_current_prices(self) -> CurrentPricesResponse:
        """Get current exchange rates from available sources."""
        logger.error(f"CRITICAL DEBUG: get_current_prices called on instance {id(self)}")
        
        # Check cache
        cache_key = "current_prices"
        if self._is_cache_valid(cache_key):
            cached = self._cache[cache_key]
            logger.error(f"CRITICAL DEBUG: Returning from cache: {len(cached.prices)} prices (instance {id(self)})")
            return cached
        
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
        
        # Fetch OKX P2P (Real BOB Rates)
        try:
            okx_buy_usdt = await self._fetch_okx_p2p(side="buy")  # User Buys = Ask
            okx_sell_usdt = await self._fetch_okx_p2p(side="sell") # User Sells = Bid
            
            if okx_buy_usdt and okx_sell_usdt:
                self._source_status["okx"] = "active"
                sources_active.append("OKX P2P")
                
                prices.append(ExchangePrice(
                    exchange="okx",
                    name="OKX P2P (USDT)",
                    bid=round(okx_sell_usdt, 2),
                    ask=round(okx_buy_usdt, 2),
                    last=round((okx_buy_usdt + okx_sell_usdt) / 2, 2),
                    change_24h=0.0,
                    updated_at=datetime.utcnow(),
                    volume_24h=None
                ))
        except Exception as e:
            logger.error(f"OKX error: {e}")
            self._source_status["okx"] = "error"
        
        # Set source used
        if sources_active:
            source_used = " + ".join(sources_active)
        
        # Fetch DolarBlueBolivia sources (AirTM, Wallbit, Takenos, BCB)
        dbb_sources = await self._fetch_dolarblue_sources()
        for price in dbb_sources:
            prices.append(price)
            sources_active.append(price.name)
        
        # Update source string
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
                id="binance",
                name="Binance P2P",
                url="https://p2p.binance.com",
                status=self._source_status.get("binance", "unknown"),
                last_check=datetime.utcnow(),
            ),
            SourceInfo(
                id="okx",
                name="OKX P2P",
                url="https://www.okx.com/p2p",
                status=self._source_status.get("okx", "unknown"),
                last_check=datetime.utcnow(),
            ),
            SourceInfo(
                id="airtm",
                name="AirTM",
                url="https://airtm.com",
                status=self._source_status.get("airtm", "unknown"),
                last_check=datetime.utcnow(),
            ),
            SourceInfo(
                id="wallbit",
                name="Wallbit",
                url="https://wallbit.io",
                status=self._source_status.get("wallbit", "unknown"),
                last_check=datetime.utcnow(),
            ),
            SourceInfo(
                id="takenos",
                name="Takenos",
                url="https://takenos.com",
                status=self._source_status.get("takenos", "unknown"),
                last_check=datetime.utcnow(),
            ),
            SourceInfo(
                id="bcb",
                name="Banco Central de Bolivia",
                url="https://www.bcb.gob.bo",
                status=self._source_status.get("bcb", "unknown"),
                last_check=datetime.utcnow(),
            ),
        ]
        
        return SourcesResponse(sources=sources)
    
    async def _fetch_dolarblue_sources(self) -> list[ExchangePrice]:
        """
        Fetch rates from DolarBlueBolivia API sources.
        Returns list of ExchangePrice from AirTM, Wallbit, Takenos, and BCB.
        Persists successful responses in self._dbb_prices to mitigate rate limiting/failures.
        """
        now = datetime.utcnow()
        fetched_count = 0
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            # AirTM
            try:
                response = await client.get(f"{self._dbb_base_url}/fetch/airtm")
                if response.status_code == 200:
                    data = response.json().get("data", {})
                    if data.get("addValue") and data.get("withdrawValue"):
                        self._source_status["airtm"] = "active"
                        self._dbb_prices["airtm"] = ExchangePrice(
                            exchange="airtm",
                            name="AirTM",
                            ask=round(float(data["addValue"]), 2),
                            bid=round(float(data["withdrawValue"]), 2),
                            last=round((float(data["addValue"]) + float(data["withdrawValue"])) / 2, 2),
                            change_24h=0.0,
                            updated_at=now,
                            volume_24h=None
                        )
                        fetched_count += 1
                else:
                    logger.warning(f"AirTM returned status {response.status_code}")
            except Exception as e:
                logger.error(f"AirTM error: {e}")
                self._source_status["airtm"] = "error"
            
            # Wallbit
            try:
                response = await client.get(f"{self._dbb_base_url}/fetch/wallbit")
                if response.status_code == 200:
                    data = response.json().get("data", {})
                    if data.get("buy") and data.get("sell"):
                        self._source_status["wallbit"] = "active"
                        self._dbb_prices["wallbit"] = ExchangePrice(
                            exchange="wallbit",
                            name="Wallbit",
                            ask=round(float(data["buy"]), 2),
                            bid=round(float(data["sell"]), 2),
                            last=round((float(data["buy"]) + float(data["sell"])) / 2, 2),
                            change_24h=0.0,
                            updated_at=now,
                            volume_24h=None
                        )
                        fetched_count += 1
                else:
                    logger.warning(f"Wallbit returned status {response.status_code}")
            except Exception as e:
                logger.error(f"Wallbit error: {e}")
                self._source_status["wallbit"] = "error"
            
            # Takenos
            try:
                response = await client.get(f"{self._dbb_base_url}/fetch/takenos")
                if response.status_code == 200:
                    data = response.json().get("data", {})
                    if data.get("buy") and data.get("sell"):
                        self._source_status["takenos"] = "active"
                        self._dbb_prices["takenos"] = ExchangePrice(
                            exchange="takenos",
                            name="Takenos",
                            ask=round(float(data["buy"]), 2),
                            bid=round(float(data["sell"]), 2),
                            last=round((float(data["buy"]) + float(data["sell"])) / 2, 2),
                            change_24h=0.0,
                            updated_at=now,
                            volume_24h=None
                        )
                        fetched_count += 1
                else:
                    logger.warning(f"Takenos returned status {response.status_code}")
            except Exception as e:
                logger.error(f"Takenos error: {e}")
                self._source_status["takenos"] = "error"
            
            # BCB (Banco Central de Bolivia) - Official Rate
            try:
                response = await client.get(f"{self._dbb_base_url}/v1/bcb")
                if response.status_code == 200:
                    data = response.json().get("data", {})
                    if data.get("compra") and data.get("venta"):
                        self._source_status["bcb"] = "active"
                        self._dbb_prices["bcb"] = ExchangePrice(
                            exchange="bcb",
                            name="BCB (Oficial)",
                            ask=round(float(data["venta"]), 2),
                            bid=round(float(data["compra"]), 2),
                            last=round((float(data["venta"]) + float(data["compra"])) / 2, 2),
                            change_24h=0.0,
                            updated_at=now,
                            volume_24h=None
                        )
                        fetched_count += 1
                else:
                    logger.warning(f"BCB returned status {response.status_code}")
            except Exception as e:
                logger.error(f"BCB error: {e}")
                self._source_status["bcb"] = "error"
        
        # Log success/failure count
        if fetched_count < 4:
            logger.info(f"Fetched {fetched_count}/4 DolarBlue sources. Using cached values for {4-fetched_count} sources.")
        
        # Return all available prices from cache (including just updated ones)
        return list(self._dbb_prices.values())
    
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

    async def _fetch_okx_p2p(self, side: str = "buy") -> float:
        """
        Fetch P2P rates from OKX (USDT/BOB).
        side: "buy" (user buys USDT = Ask) or "sell" (user sells USDT = Bid)
        """
        # OKX P2P uses GET with query parameters
        base_url = "https://www.okx.com/v3/c2c/tradingOrders/books"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "application/json",
        }
        params = {
            "quoteCurrency": "BOB",
            "baseCurrency": "USDT",
            "side": side,
            "paymentMethod": "all",
            "userType": "all",
            "showTrade": "false",
            "showFollow": "false",
            "showAlreadyTraded": "false",
            "isAbleFilter": "false",
            "urlId": "1",  # Required parameter
        }
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(base_url, params=params, headers=headers)
                response.raise_for_status()
                data = response.json()
                
                # OKX response: {"code": "0", "data": {"buy": [...], "sell": [...]}}
                if data.get("code") != "0":
                    logger.warning(f"OKX API error: {data.get('msg', 'Unknown error')}")
                    return 0.0
                
                ads_data = data.get("data", {})
                ads = ads_data.get(side, []) if isinstance(ads_data, dict) else []
                
                if not ads:
                    # Try alternate response structure (list)
                    if isinstance(ads_data, list):
                        ads = ads_data
                
                if not ads:
                    logger.debug(f"No OKX P2P ads found for {side}")
                    return 0.0
                
                # Get average of top 3 prices to avoid outliers
                valid_prices = []
                for ad in ads[:5]:
                    price = ad.get("price") or ad.get("unitPrice")
                    if price:
                        try:
                            valid_prices.append(float(price))
                        except (ValueError, TypeError):
                            continue
                
                if not valid_prices:
                    return 0.0
                    
                return sum(valid_prices[:3]) / min(len(valid_prices), 3)
        except httpx.HTTPStatusError as e:
            logger.debug(f"OKX P2P {side} HTTP error: {e.response.status_code}")
            return 0.0
        except Exception as e:
            logger.debug(f"OKX P2P {side} error: {e}")
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



