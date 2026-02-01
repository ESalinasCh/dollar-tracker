from fastapi import Request
from app.services.exchange_service import ExchangeService

def get_exchange_service(request: Request) -> ExchangeService:
    """
    Retrieve the singleton ExchangeService instance from app.state.
    This ensures that the API uses the exact same instance created during startup.
    """
    return request.app.state.exchange_service
