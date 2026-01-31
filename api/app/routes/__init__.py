from app.routes.prices import router as prices_router
from app.routes.stats import router as stats_router
from app.routes.health import router as health_router

__all__ = ["prices_router", "stats_router", "health_router"]
