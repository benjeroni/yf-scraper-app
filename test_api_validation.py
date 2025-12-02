import requests

def test_validation(ticker):
    print(f"Testing validation for {ticker}...")
    try:
        res = requests.get(f"http://127.0.0.1:8000/api/validate/{ticker}")
        print(f"Status Code: {res.status_code}")
        print(f"Response: {res.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_validation("MSFT")
    test_validation("AAPL")
    test_validation("INVALID_TICKER_123")
