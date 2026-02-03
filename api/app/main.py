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

# Background task for fetching prices from APIs (every 5 seconds)
async def fetch_prices_background(exchange_service: ExchangeService, shared_state: dict):
    """Background task to fetch prices from external APIs every 5 seconds."""
    while True:
        try:
            # Force fresh fetch by invalidating cache
            exchange_service._cache.clear()
            exchange_service._cache_time.clear()

            response = await exchange_service.get_current_prices()
            shared_state["prices"] = response
            shared_state["last_fetch"] = time.time()
            logger.info(f"[Fetch Task] Updated {len(response.prices)} prices from APIs")
        except Exception as e:
            logger.error(f"[Fetch Task] Error: {e}")

        # Fetch every 5 seconds
        await asyncio.sleep(5)


# Background task for storing prices to MongoDB (every 1 second)
async def store_prices_background(shared_state: dict):
    """Background task to store cached prices to MongoDB every 1 second."""
    iteration = 0
    while True:
        iteration += 1
        try:
            response = shared_state.get("prices")

            if response and response.prices:
                for price in response.prices:
                    await price_history_service.store_price(
                        exchange=price.exchange,
                        bid=price.bid,
                        ask=price.ask,
                        last=price.last,
                        source="realtime"
                    )

                # Log every 10 iterations (every 10 seconds)
                if iteration % 10 == 0:
                    logger.info(f"[Store Task] Iteration {iteration} - Stored {len(response.prices)} prices")

            # Cleanup old data every 3600 iterations (~1 hour)
            if iteration % 3600 == 0:
                await price_history_service.cleanup_old_data(7)  # Keep 7 days
                logger.info("[Store Task] Cleaned up old data")

        except Exception as e:
            logger.error(f"[Store Task] Error: {e}")

        # Store every 1 second
        await asyncio.sleep(1)


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

    # Shared state for communication between tasks
    shared_state = {"prices": None, "last_fetch": 0}

    # Start background tasks (only if MongoDB connected)
    tasks = []
    if Database.is_connected():
        # Task 1: Fetch from APIs every 5 seconds
        fetch_task = asyncio.create_task(fetch_prices_background(service, shared_state))
        tasks.append(fetch_task)
        logger.info("Started background fetch task (every 5 seconds)")

        # Task 2: Store to MongoDB every 1 second
        store_task = asyncio.create_task(store_prices_background(shared_state))
        tasks.append(store_task)
        logger.info("Started background store task (every 1 second)")
    else:
        logger.warning("MongoDB not connected - price history disabled")

    yield

    # Shutdown
    for task in tasks:
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
