import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from typing import List, Dict, Any
from datetime import timedelta, datetime

def train_and_predict(history: List[Dict[str, Any]], days: int = 30) -> List[Dict[str, Any]]:
    """
    Simple linear regression prediction based on recent close prices.
    This is a baseline model.
    """
    if not history:
        return []

    df = pd.DataFrame(history)
    df['Date'] = pd.to_datetime(df['Date'])
    df['OrdinalDate'] = df['Date'].apply(lambda x: x.toordinal())
    
    # Use last 60 days for training to catch recent trends
    train_df = df.tail(60)
    
    X = train_df[['OrdinalDate']]
    y = train_df['Close']
    
    model = LinearRegression()
    model.fit(X, y)
    
    last_date = df['Date'].iloc[-1]
    future_dates = [last_date + timedelta(days=i) for i in range(1, days + 1)]
    future_ordinal = np.array([d.toordinal() for d in future_dates]).reshape(-1, 1)
    
    predictions = model.predict(future_ordinal)
    
    result = []
    for date, price in zip(future_dates, predictions):
        result.append({
            "Date": date.strftime('%Y-%m-%d'),
            "Predicted_Close": float(price)
        })
        
    return result
