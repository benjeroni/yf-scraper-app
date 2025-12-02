import yfinance as yf
import pandas as pd
from typing import List, Dict, Any

def get_stock_history(ticker: str, period: str = "1y") -> List[Dict[str, Any]]:
    """Fetches historical stock data."""
    stock = yf.Ticker(ticker)
    
    interval = "1d"
    if period == "1d":
        interval = "5m"
    elif period in ["5d", "1mo"]:
        interval = "1h" # More granular for short periods if desired, or keep 1d
        if period == "5d":
            interval = "15m"

            interval = "15m"

    print(f"Fetching data for {ticker}, period={period}, interval={interval}")
    hist = stock.history(period=period, interval=interval)
    print(f"Fetched {len(hist)} records")
    hist.reset_index(inplace=True)
    
    # Standardize Date column
    if 'Datetime' in hist.columns:
        hist.rename(columns={'Datetime': 'Date'}, inplace=True)
    
    # Format Date/Time based on interval
    if interval in ["5m", "15m", "1h"]:
        # Datetime with time
        hist['Date'] = hist['Date'].dt.strftime('%Y-%m-%d %H:%M')
    else:
        # Just date
        hist['Date'] = hist['Date'].dt.strftime('%Y-%m-%d')
        
    return hist.to_dict(orient='records')

def get_stock_info(ticker: str) -> Dict[str, Any]:
    """Fetches stock info."""
    stock = yf.Ticker(ticker)
    return stock.info

def get_stock_news(ticker: str) -> List[Dict[str, Any]]:
    """Fetches stock news."""
    stock = yf.Ticker(ticker)
    return stock.news
