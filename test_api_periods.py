import requests
import json
from datetime import datetime

BASE_URL = "http://127.0.0.1:8000/api/stock/AAPL"

def test_period(period):
    print(f"Testing period: {period}")
    try:
        response = requests.get(f"{BASE_URL}?period={period}")
        data = response.json()
        history = data.get('history', [])
        if not history:
            print("  No history found.")
            return

        first_date = history[0]['Date']
        last_date = history[-1]['Date']
        count = len(history)
        print(f"  Count: {count}")
        print(f"  First Date: {first_date}")
        print(f"  Last Date: {last_date}")
    except Exception as e:
        print(f"  Error: {e}")

if __name__ == "__main__":
    test_period("1d")
    test_period("5d")
    test_period("1mo")
    test_period("1y")
