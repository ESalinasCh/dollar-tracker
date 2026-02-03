"""
Tests for prices endpoints.
"""
import pytest


@pytest.mark.asyncio
async def test_current_prices_endpoint(client):
    """Test that current prices endpoint returns valid structure."""
    response = await client.get("/api/v1/prices/current")

    assert response.status_code == 200
    data = response.json()

    # Check required fields
    assert "timestamp" in data
    assert "base_currency" in data
    assert "quote_currency" in data
    assert "prices" in data
    assert "average" in data

    # Check currency values
    assert data["base_currency"] == "USD"
    assert data["quote_currency"] == "BOB"

    # Check prices is a list
    assert isinstance(data["prices"], list)

    # Check average is a number
    assert isinstance(data["average"], (int, float))


@pytest.mark.asyncio
async def test_current_prices_structure(client):
    """Test that each price in the response has correct structure."""
    response = await client.get("/api/v1/prices/current")
    data = response.json()

    if data["prices"]:  # If there are prices
        price = data["prices"][0]

        # Each price should have these fields
        assert "exchange" in price
        assert "name" in price
        assert "bid" in price
        assert "ask" in price
        assert "last" in price


@pytest.mark.asyncio
async def test_price_history_endpoint(client):
    """Test that price history endpoint returns valid structure."""
    response = await client.get("/api/v1/prices/history?interval=24h")

    assert response.status_code == 200
    data = response.json()

    # Check required fields
    assert "exchange" in data
    assert "interval" in data
    assert "data_points" in data
    assert "summary" in data

    # Check data_points is a list
    assert isinstance(data["data_points"], list)


@pytest.mark.asyncio
async def test_price_history_valid_intervals(client):
    """Test that valid intervals are accepted."""
    intervals = ["1h", "24h", "7d", "30d"]

    for interval in intervals:
        response = await client.get(f"/api/v1/prices/history?interval={interval}")
        assert response.status_code == 200, f"Failed for interval {interval}"


@pytest.mark.asyncio
async def test_price_history_default_interval(client):
    """Test that missing interval uses default."""
    response = await client.get("/api/v1/prices/history")

    assert response.status_code == 200
    data = response.json()
    assert "data_points" in data
