# Dollar Tracker API

Backend API for Dollar Tracker application built with FastAPI.

## Setup

```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

## Run

```bash
# Development
uvicorn app.main:app --reload --port 3001

# Production
uvicorn app.main:app --host 0.0.0.0 --port 3001
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/v1/prices/current` | GET | Current exchange rates |
| `/api/v1/prices/history` | GET | Historical price data |
| `/api/v1/stats/volatility` | GET | Volatility metrics |

## Data Sources
- **Binance P2P** - Real-time market rates (USDT/BOB)
- **Others** - [REMOVED] (DolarAPI, Coinbase, etc.)
