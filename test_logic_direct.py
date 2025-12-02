from backend.services.stock_data import get_stock_history

def test_direct(ticker, period):
    print(f"Testing direct call for {ticker} with period={period}")
    try:
        data = get_stock_history(ticker, period=period)
        print(f"  Returned {len(data)} records")
        if data:
            print(f"  First: {data[0]['Date']}")
            print(f"  Last: {data[-1]['Date']}")
    except Exception as e:
        print(f"  Error: {e}")

if __name__ == "__main__":
    test_direct("AAPL", "1d")
    test_direct("AAPL", "5d")
    test_direct("AAPL", "1mo")
