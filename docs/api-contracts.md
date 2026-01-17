# API Contracts - Dollar Tracker

Este documento define los contratos de API que serán utilizados por el frontend. Durante el desarrollo inicial, estos endpoints serán simulados con datos mock.

## Base URL

```
Production: https://api.dollartracker.com/v1
Development: http://localhost:3001/api/v1
```

---

## 📊 Endpoints de Precios

### GET /prices/current

Obtiene el precio actual del dólar en todos los exchanges.

**Response:**
```json
{
  "timestamp": "2026-01-17T08:30:00Z",
  "baseCurrency": "USD",
  "quoteCurrency": "BOB",
  "prices": [
    {
      "exchange": "binance",
      "name": "Binance",
      "logo": "/logos/binance.svg",
      "bid": 6.95,
      "ask": 6.98,
      "last": 6.97,
      "change24h": 0.42,
      "volume24h": 1250000,
      "updatedAt": "2026-01-17T08:29:55Z"
    },
    {
      "exchange": "kraken",
      "name": "Kraken",
      "logo": "/logos/kraken.svg",
      "bid": 6.94,
      "ask": 6.97,
      "last": 6.96,
      "change24h": 0.35,
      "volume24h": 890000,
      "updatedAt": "2026-01-17T08:29:58Z"
    }
  ],
  "average": 6.965,
  "bestBuy": {
    "exchange": "kraken",
    "price": 6.94
  },
  "bestSell": {
    "exchange": "binance",
    "price": 6.98
  }
}
```

---

### GET /prices/history

Obtiene el histórico de precios para un rango de tiempo.

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| exchange | string | No | Filtrar por exchange (default: all) |
| interval | string | Yes | `1h`, `24h`, `7d`, `30d`, `1y` |
| from | ISO8601 | No | Fecha inicio |
| to | ISO8601 | No | Fecha fin |

**Response:**
```json
{
  "exchange": "binance",
  "interval": "24h",
  "dataPoints": [
    {
      "timestamp": "2026-01-16T08:00:00Z",
      "open": 6.92,
      "high": 6.98,
      "low": 6.90,
      "close": 6.95,
      "volume": 52000
    },
    {
      "timestamp": "2026-01-16T09:00:00Z",
      "open": 6.95,
      "high": 6.99,
      "low": 6.94,
      "close": 6.97,
      "volume": 48000
    }
  ],
  "summary": {
    "avgPrice": 6.945,
    "minPrice": 6.90,
    "maxPrice": 6.99,
    "totalVolume": 1250000,
    "changePercent": 0.72
  }
}
```

---

## 📈 Endpoints de Estadísticas

### GET /stats/volatility

Obtiene métricas de volatilidad.

**Response:**
```json
{
  "period": "24h",
  "volatility": 0.8,
  "rating": "low",
  "standardDeviation": 0.023,
  "range": {
    "min": 6.90,
    "max": 6.99
  }
}
```

---

### GET /stats/comparison

Comparación detallada entre exchanges.

**Response:**
```json
{
  "timestamp": "2026-01-17T08:30:00Z",
  "exchanges": [
    {
      "exchange": "binance",
      "avgSpread": 0.03,
      "avgResponseTime": 120,
      "uptime": 99.9,
      "reliability": "excellent",
      "fees": {
        "maker": 0.1,
        "taker": 0.1
      }
    }
  ]
}
```

---

## 🔔 Endpoints de Alertas

### GET /alerts

Lista todas las alertas del usuario.

**Response:**
```json
{
  "alerts": [
    {
      "id": "alert-001",
      "type": "price_above",
      "threshold": 7.00,
      "exchange": "all",
      "enabled": true,
      "createdAt": "2026-01-15T10:00:00Z",
      "triggeredAt": null
    }
  ]
}
```

---

### POST /alerts

Crea una nueva alerta.

**Request:**
```json
{
  "type": "price_above",
  "threshold": 7.00,
  "exchange": "all"
}
```

**Response:**
```json
{
  "id": "alert-002",
  "type": "price_above",
  "threshold": 7.00,
  "exchange": "all",
  "enabled": true,
  "createdAt": "2026-01-17T08:30:00Z"
}
```

---

### DELETE /alerts/:id

Elimina una alerta existente.

**Response:**
```json
{
  "success": true,
  "deletedId": "alert-002"
}
```

---

## 📋 Endpoints de Reportes

### POST /reports/generate

Genera un reporte para un período específico.

**Request:**
```json
{
  "type": "daily",
  "format": "pdf",
  "dateRange": {
    "from": "2026-01-10",
    "to": "2026-01-17"
  },
  "exchanges": ["binance", "kraken"],
  "includeCharts": true
}
```

**Response:**
```json
{
  "reportId": "report-123",
  "status": "processing",
  "estimatedTime": 30,
  "downloadUrl": null
}
```

---

### GET /reports/:id

Obtiene el estado y URL de descarga de un reporte.

**Response:**
```json
{
  "reportId": "report-123",
  "status": "completed",
  "format": "pdf",
  "size": 245000,
  "downloadUrl": "/reports/download/report-123.pdf",
  "expiresAt": "2026-01-18T08:30:00Z"
}
```

---

## 🔐 Autenticación (Futuro)

Para features como alertas y reportes personalizados, se implementará autenticación JWT.

**Headers requeridos:**
```
Authorization: Bearer <token>
```

---

## 📱 WebSocket (Futuro)

Para actualizaciones en tiempo real:

```
ws://api.dollartracker.com/ws/prices
```

**Message format:**
```json
{
  "type": "price_update",
  "exchange": "binance",
  "data": {
    "last": 6.97,
    "change24h": 0.42
  }
}
```

---

## ⚠️ Error Responses

Todos los endpoints siguen el mismo formato de error:

```json
{
  "error": {
    "code": "INVALID_PARAM",
    "message": "Invalid interval parameter",
    "details": {
      "param": "interval",
      "received": "2h",
      "allowed": ["1h", "24h", "7d", "30d", "1y"]
    }
  }
}
```

**HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `429` - Rate Limited
- `500` - Internal Server Error
