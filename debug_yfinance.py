import yfinance as yf

def debug_ticker(ticker):
    print(f"--- Debugging {ticker} ---")
    stock = yf.Ticker(ticker)
    
    print("Trying fast_info...")
    try:
        fi = stock.fast_info
        print(f"  last_price: {fi.last_price}")
        print(f"  currency: {fi.currency}")
    except Exception as e:
        print(f"  fast_info error: {e}")

    print("\nTrying info...")
    try:
        info = stock.info
        print(f"  shortName: {info.get('shortName')}")
        print(f"  longName: {info.get('longName')}")
        print(f"  currentPrice: {info.get('currentPrice')}")
        print(f"  regularMarketPrice: {info.get('regularMarketPrice')}")
    except Exception as e:
        print(f"  info error: {e}")

if __name__ == "__main__":
    debug_ticker("MSFT")
    debug_ticker("AAPL")
