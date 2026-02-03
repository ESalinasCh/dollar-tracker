"""
Tests for health check endpoint.
"""
import pytest


@pytest.mark.asyncio
async def test_health_endpoint(client):
    """Test that health endpoint returns 200 and correct structure."""
    response = await client.get("/health")

    assert response.status_code == 200
    data = response.json()

    assert "status" in data
    assert data["status"] == "healthy"


@pytest.mark.asyncio
async def test_root_endpoint(client):
    """Test that root endpoint returns API info."""
    response = await client.get("/")

    assert response.status_code == 200
    data = response.json()

    assert "name" in data
    assert "version" in data
    assert "docs" in data
