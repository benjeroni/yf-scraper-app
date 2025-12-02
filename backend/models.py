from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class TickerRequest(BaseModel):
    ticker: str

class StockData(BaseModel):
    ticker: str
    history: List[Dict[str, Any]]  # Date, Open, High, Low, Close, Volume
    info: Dict[str, Any]
    last_refreshed: str

class NewsItem(BaseModel):
    title: str
    publisher: str
    link: str
    providerPublishTime: int
    type: str

class PredictionRequest(BaseModel):
    ticker: str
    days: int = 30

class PredictionResult(BaseModel):
    ticker: str
    forecast: List[Dict[str, Any]] # Date, Predicted_Close
    model_type: str

class AccuracyMetric(BaseModel):
    ticker: str
    mean_absolute_error: float
    predictions_count: int
    last_updated: str
