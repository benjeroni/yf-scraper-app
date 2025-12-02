import json
import os
from typing import Dict, Optional
from pydantic import BaseModel

class TradeAlert(BaseModel):
    ticker: str
    reference_price: float
    threshold: float
    is_active: bool = True

# Simple JSON file storage
ALERTS_FILE = "alerts.json"

def load_alerts() -> Dict[str, TradeAlert]:
    if not os.path.exists(ALERTS_FILE):
        return {}
    try:
        with open(ALERTS_FILE, 'r') as f:
            data = json.load(f)
            return {ticker: TradeAlert(**alert) for ticker, alert in data.items()}
    except Exception as e:
        print(f"Error loading alerts: {e}")
        return {}

def save_alert(alert: TradeAlert):
    alerts = load_alerts()
    alerts[alert.ticker] = alert
    with open(ALERTS_FILE, 'w') as f:
        json.dump({k: v.dict() for k, v in alerts.items()}, f, indent=2)

def get_alert(ticker: str) -> Optional[TradeAlert]:
    alerts = load_alerts()
    return alerts.get(ticker)

def delete_alert(ticker: str):
    alerts = load_alerts()
    if ticker in alerts:
        del alerts[ticker]
        with open(ALERTS_FILE, 'w') as f:
            json.dump({k: v.dict() for k, v in alerts.items()}, f, indent=2)
