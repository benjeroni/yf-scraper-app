import json
import os
from datetime import datetime
from typing import List, Dict, Any

TRACKER_FILE = "backend/predictions_log.json"

def load_predictions():
    if not os.path.exists(TRACKER_FILE):
        return []
    with open(TRACKER_FILE, 'r') as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []

def save_prediction(ticker: str, prediction_data: List[Dict[str, Any]], model_type: str):
    predictions = load_predictions()
    entry = {
        "ticker": ticker,
        "timestamp": datetime.now().isoformat(),
        "model": model_type,
        "forecast": prediction_data
    }
    predictions.append(entry)
    with open(TRACKER_FILE, 'w') as f:
        json.dump(predictions, f, indent=2)

def calculate_accuracy(current_history: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Compare past predictions with actual data in current_history.
    Returns MAE (Mean Absolute Error) per ticker.
    """
    predictions = load_predictions()
    if not predictions:
        return {}
    
    # Convert history to a lookup dict: Date -> Close
    # history dates are strings 'YYYY-MM-DD'
    history_lookup = {item['Date']: item['Close'] for item in current_history}
    
    total_error = 0
    count = 0
    
    for pred_entry in predictions:
        # Only check predictions for this ticker if we want specific ticker accuracy, 
        # but here we might want to pass ticker as arg. 
        # For now, let's assume we filter by ticker outside or here.
        # Let's just return a generic accuracy metric for now or filter by the ticker passed in history.
        
        # We need to know which ticker this history belongs to.
        # Let's assume the caller handles filtering or we pass ticker.
        pass

    return {} # Placeholder, will implement properly in main logic or improve this function
