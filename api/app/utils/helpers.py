"""Utility helper functions."""


def format_currency(value: float, decimals: int = 2) -> str:
    """Format a number as currency."""
    return f"${value:,.{decimals}f}"


def format_percent(value: float) -> str:
    """Format a number as percentage."""
    sign = "+" if value >= 0 else ""
    return f"{sign}{value:.2f}%"


def format_volume(value: float) -> str:
    """Format volume with K/M suffix."""
    if value >= 1_000_000:
        return f"${value / 1_000_000:.1f}M"
    if value >= 1_000:
        return f"${value / 1_000:.1f}K"
    return f"${value:.0f}"
