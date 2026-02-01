from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import asyncio
import time

from app.config import get_settings
from app.routes import prices_router, stats_router, health_router
from app.database import Database, price_history_service
from app.services import ExchangeService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Get settings
settings = get_settings()

# Background task for storing prices
async def store_prices_background(exchange_service: ExchangeService):
    """Background task to store prices every hour for 24h change calculation."""
    while True:
        try:
            # Get current prices
            response = await exchange_service.get_current_prices()
            
            # Store each exchange price
            for price in response.prices:
                await price_history_service.store_price(
                    exchange=price.exchange,
                    bid=price.bid,
                    ask=price.ask,
                    last=price.last,
                    source="scheduled"
                )
            
            logger.info(f"Stored {len(response.prices)} price records")
            
            # Cleanup old data periodically (keep 30 days)
            await price_history_service.cleanup_old_data(30)
            
        except Exception as e:
            logger.error(f"Error storing prices: {e}")
        
        # Wait 1 hour before next storage
        await asyncio.sleep(3600)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    logger.info(f"Starting {settings.api_title} v{settings.api_version}")
    logger.info(f"CORS origins: {settings.cors_origins_list}")
    
    # Initialize Exchange Service Singleton
    service = ExchangeService()
    app.state.exchange_service = service
    logger.info("Initialized ExchangeService singleton in app.state")
    
    # Connect to MongoDB
    await Database.connect()
    
    # Start background task for price storage (only if MongoDB connected)
    task = None
    if Database.is_connected():
        task = asyncio.create_task(store_prices_background(service))
        logger.info("Started background price storage task")
    else:
        logger.warning("MongoDB not connected - price history disabled")
    
    yield
    
    # Shutdown
    if task:
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass
    
    await Database.disconnect()
    logger.info("Shutting down Dollar Tracker API")


# Create FastAPI app with lifespan
app = FastAPI(
    title=settings.api_title,
    version=settings.api_version,
    description="""
    ## Dollar Tracker API
    
    Backend API for tracking USD/BOB exchange rates from P2P exchanges.
    
    ### Features
    - **Current Prices**: Real-time rates from Binance P2P and OKX P2P
    - **Historical Data**: View price history with different time intervals
    - **Volatility Metrics**: Analyze market volatility
    - **24h Change**: Calculated from stored historical data
    
    ### Data Sources
    - **Binance P2P**: USDT/BOB peer-to-peer rates
    - **OKX P2P**: USDT/BOB peer-to-peer rates
    
    ### User Stories Supported
    - US1: Ver el valor del dólar paralelo
    - US2: Ver gráficos históricos
    - US3: Soporte a acceso anónimo (no auth required)
    - US4: Interfaz mobile first (CORS enabled)
    - US5: Optimización y performance (caching)
    - US6: Integración con API de exchanges
    """,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Add CORS middleware (US3, US4)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health_router)
app.include_router(prices_router, prefix="/api/v1")
app.include_router(stats_router, prefix="/api/v1")


# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API information."""
    return {
        "name": settings.api_title,
        "version": settings.api_version,
        "docs": "/docs",
        "health": "/health",
        "sources": ["Binance P2P", "OKX P2P"],
    }
