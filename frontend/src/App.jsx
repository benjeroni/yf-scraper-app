import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';
import TickerInput from './components/TickerInput';
import StockChart from './components/StockChart';
import NewsFeed from './components/NewsFeed';
import AccuracyBadge from './components/AccuracyBadge';
import Dashboard from './components/Dashboard';
import TradeHelper from './components/TradeHelper';

const API_URL = 'http://127.0.0.1:8000/api';

function App() {
  const [view, setView] = useState('dashboard'); // 'dashboard' or 'detail'
  const [selectedTicker, setSelectedTicker] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stockData, setStockData] = useState(null);
  const [news, setNews] = useState([]);
  const [prediction, setPrediction] = useState([]);
  const [accuracy, setAccuracy] = useState(null);
  const [period, setPeriod] = useState('1y'); // Default period for chart
  const [alertData, setAlertData] = useState(null); // { refPrice, threshold, active }

  const fetchStockData = async (ticker, timeRange = '1y') => {
    setLoading(true);
    setError(null);

    // Map UI ranges to yfinance periods
    // 1W -> 5d (closest), 1M -> 1mo, 3M -> 3mo, 6M -> 6mo, 1Y -> 1y, 2Y -> 2y
    const rangeMap = {
      '1D': '1d',
      '1W': '5d',
      '1M': '1mo',
      '3M': '3mo',
      '6M': '6mo',
      '1Y': '1y',
      '2Y': '2y'
    };
    const apiPeriod = rangeMap[timeRange] || '1y';

    try {
      // Fetch Stock Data
      const stockRes = await axios.get(`${API_URL}/stock/${ticker}?period=${apiPeriod}`);
      setStockData(stockRes.data);

      // Fetch News (only if new ticker)
      if (ticker !== selectedTicker) {
        const newsRes = await axios.get(`${API_URL}/news/${ticker}`);
        setNews(newsRes.data);

        // Fetch Accuracy
        const accRes = await axios.get(`${API_URL}/accuracy/${ticker}`);
        setAccuracy(accRes.data);
      }

      // Fetch Prediction
      // We might want to adjust prediction days based on range, but keeping it simple for now
      const predRes = await axios.post(`${API_URL}/predict`, { ticker, days: 30 });
      setPrediction(predRes.data.forecast);

    } catch (err) {
      console.error(err);
      setError('Failed to fetch data. Please check the ticker and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTickerSelect = (ticker) => {
    setSelectedTicker(ticker);
    setView('detail');
    setAlertData(null); // Reset alert data when switching ticker
    fetchStockData(ticker, '1W'); // Default to 1W as requested
  };

  const handleRangeChange = (newRange) => {
    console.log(`Range changed to: ${newRange} for ticker: ${selectedTicker}`);
    if (selectedTicker) {
      fetchStockData(selectedTicker, newRange);
    }
  };

  const handleBack = () => {
    setView('dashboard');
    setSelectedTicker(null);
    setStockData(null);
  };

  return (
    <div className="App">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {view === 'detail' && (
            <button onClick={handleBack} className="secondary" style={{ borderRadius: '50%', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowLeft size={20} />
            </button>
          )}
          <h1 style={{ fontSize: '1.5rem', margin: 0, cursor: 'pointer' }} onClick={handleBack}>
            Stock Oracle
          </h1>
        </div>
      </header>

      {view === 'dashboard' && (
        <Dashboard onSelectTicker={handleTickerSelect} />
      )}

      {view === 'detail' && stockData && (
        <div className="fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '2.5rem' }}>{stockData.ticker}</h1>
              <div style={{ color: '#666' }}>{stockData.info.shortName}</div>
              <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '0.25rem' }}>
                Data as of {stockData.last_refreshed}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
                {stockData.history[stockData.history.length - 1].Close.toFixed(2)}
              </span>
            </div>
          </div>

          <StockChart
            history={stockData.history}
            prediction={prediction}
            onRangeChange={handleRangeChange}
            referenceLines={alertData && alertData.active ? {
              sell: alertData.refPrice + alertData.threshold,
              buy: alertData.refPrice - alertData.threshold
            } : null}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ marginTop: '2rem' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <NewsFeed news={news} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <TradeHelper
                ticker={stockData.ticker}
                currentPrice={stockData.history[stockData.history.length - 1].Close}
                onAlertUpdate={setAlertData}
              />
              <AccuracyBadge accuracy={accuracy} />

              <div className="card" style={{ textAlign: 'left' }}>
                <h3>Key Statistics</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem', fontSize: '0.9rem' }}>
                  <div>
                    <div style={{ color: '#666' }}>Market Cap</div>
                    <div style={{ fontWeight: 500 }}>{stockData.info.marketCap ? (stockData.info.marketCap / 1e9).toFixed(2) + 'B' : '-'}</div>
                  </div>
                  <div>
                    <div style={{ color: '#666' }}>PE Ratio</div>
                    <div style={{ fontWeight: 500 }}>{stockData.info.trailingPE?.toFixed(2) || '-'}</div>
                  </div>
                  <div>
                    <div style={{ color: '#666' }}>52W High</div>
                    <div style={{ fontWeight: 500 }}>{stockData.info.fiftyTwoWeekHigh?.toFixed(2) || '-'}</div>
                  </div>
                  <div>
                    <div style={{ color: '#666' }}>52W Low</div>
                    <div style={{ fontWeight: 500 }}>{stockData.info.fiftyTwoWeekLow?.toFixed(2) || '-'}</div>
                  </div>
                  <div>
                    <div style={{ color: '#666' }}>Volume</div>
                    <div style={{ fontWeight: 500 }}>{stockData.history[stockData.history.length - 1].Volume?.toLocaleString() || '-'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
