from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.config import get_settings
from app.routes import prices_router, stats_router, health_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Get settings
settings = get_settings()

# Create FastAPI app
app = FastAPI(
    title=settings.api_title,
    version=settings.api_version,
    description="""
    ## Dollar Tracker API
    
    Backend API for tracking USD/BOB exchange rates.
    
    ### Features
    - **Current Prices**: Get real-time exchange rates from multiple sources
    - **Historical Data**: View price history with different time intervals
    - **Volatility Metrics**: Analyze market volatility
    - **Multiple Sources**: Data from DolarAPI, Bluelytics, and more
    
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


@app.on_event("startup")
async def startup_event():
    """Initialize services on startup."""
    logger.info(f"Starting {settings.api_title} v{settings.api_version}")
    logger.info(f"CORS origins: {settings.cors_origins_list}")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    logger.info("Shutting down Dollar Tracker API")


# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API information."""
    return {
        "name": settings.api_title,
        "version": settings.api_version,
        "docs": "/docs",
        "health": "/health",
    }
