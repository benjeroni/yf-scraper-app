from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import uvicorn
import yfinance as yf
from datetime import datetime

from backend.models import TickerRequest, StockData, NewsItem, PredictionRequest, PredictionResult, AccuracyMetric
from backend.services.stock_data import get_stock_history, get_stock_info, get_stock_news
from backend.services.prediction import train_and_predict
from backend.services.tracker import save_prediction, calculate_accuracy, load_predictions
from backend.services.alerts import save_alert, get_alert, delete_alert, TradeAlert

app = FastAPI(title="Yahoo Finance Scraper & Predictor")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Yahoo Finance Scraper API"}

@app.get("/api/stock/{ticker}", response_model=StockData)
def get_stock(ticker: str, period: str = "1y"):
    try:
        history = get_stock_history(ticker, period=period)
        info = get_stock_info(ticker)
        last_refreshed = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        return StockData(ticker=ticker, history=history, info=info, last_refreshed=last_refreshed)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/news/{ticker}", response_model=List[NewsItem])
def get_news(ticker: str):
    try:
        raw_news = get_stock_news(ticker)
        news_items = []
        for item in raw_news:
            news_items.append(NewsItem(
                title=item.get('title', 'No Title'),
                publisher=item.get('publisher', 'Yahoo Finance'),
                link=item.get('link', ''),
                providerPublishTime=item.get('providerPublishTime', 0),
                type=item.get('type', 'STORY')
            ))
        return news_items
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/predict", response_model=PredictionResult)
def predict_stock(request: PredictionRequest):
    try:
        history = get_stock_history(request.ticker, period="2y")
        forecast = train_and_predict(history, days=request.days)
        
        save_prediction(request.ticker, forecast, "LinearRegression_Baseline")
        
        return PredictionResult(
            ticker=request.ticker,
            forecast=forecast,
            model_type="LinearRegression_Baseline"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/accuracy/{ticker}", response_model=AccuracyMetric)
def get_accuracy(ticker: str):
    try:
        return AccuracyMetric(
            ticker=ticker,
            mean_absolute_error=0.0,
            predictions_count=0,
            last_updated="2023-01-01"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/validate/{ticker}")
def validate_ticker(ticker: str):
    print(f"Validating ticker: {ticker}")
    try:
        stock = yf.Ticker(ticker)
        # Try fast_info first
        try:
            fast_info = stock.fast_info
            price = fast_info.last_price
            currency = fast_info.currency
            if price is None:
                raise ValueError("Price is None")
        except Exception as e:
            print(f"fast_info failed for {ticker}: {e}")
            # Fallback to info
            try:
                info = stock.info
                price = info.get('currentPrice') or info.get('regularMarketPrice')
                currency = info.get('currency', 'USD')
                if price is None:
                     raise ValueError("Price is None in info")
            except Exception as e2:
                print(f"info failed for {ticker}: {e2}")
                raise HTTPException(status_code=404, detail="Ticker not found")

        # Get name and exchange
        long_name = ticker
        exchange = 'Unknown'
        try:
            info = stock.info
            long_name = info.get('longName') or info.get('shortName') or ticker
            exchange = info.get('exchange', 'Unknown')
        except:
            pass

        return {
            "ticker": ticker.upper(),
            "name": long_name,
            "price": price,
            "exchange": exchange,
            "currency": currency
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Unexpected error validating {ticker}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/alerts")
def create_alert(alert: TradeAlert):
    try:
        save_alert(alert)
        return {"message": "Alert saved successfully", "alert": alert}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/alerts/{ticker}")
def read_alert(ticker: str):
    alert = get_alert(ticker)
    if not alert:
        return {} # Return empty object if no alert found, easier for frontend
    return alert

@app.delete("/api/alerts/{ticker}")
def remove_alert(ticker: str):
    try:
        delete_alert(ticker)
        return {"message": "Alert deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
