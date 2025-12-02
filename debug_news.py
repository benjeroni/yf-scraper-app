import yfinance as yf
import json

def check_news(ticker):
    try:
        stock = yf.Ticker(ticker)
        news = stock.news
        if news:
            first = news[0]
            print("First item keys:", first.keys())
            print("Publisher:", first.get('publisher'))
            print("Type of publisher:", type(first.get('publisher')))
        else:
            print("No news found")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_news("AAPL")
