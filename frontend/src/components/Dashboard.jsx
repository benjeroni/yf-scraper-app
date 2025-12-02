import React, { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, Plus } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import axios from 'axios';
import { Reorder } from 'framer-motion';
import AddStockModal from './AddStockModal';

const API_URL = 'http://127.0.0.1:8000/api';

const Sparkline = ({ data, color }) => (
    <div style={{ width: '100px', height: '40px' }}>
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
                <defs>
                    <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                        <stop offset="100%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                </defs>
                <Area
                    type="monotone"
                    dataKey="close"
                    stroke={color}
                    strokeWidth={2}
                    fill={`url(#gradient-${color})`}
                    isAnimationActive={false}
                />
                <YAxis domain={['dataMin', 'dataMax']} hide />
            </AreaChart>
        </ResponsiveContainer>
    </div>
);

export default function Dashboard({ onSelectTicker }) {
    const [tickers, setTickers] = useState(['RDDT', 'AAPL', 'TQQQ', 'NVDA', 'GOOG', 'SPY']);
    const [stockData, setStockData] = useState({});
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchAllStocks = async () => {
            const data = {};
            for (const ticker of tickers) {
                try {
                    // Fetch minimal data for sparkline (e.g., 1mo)
                    const res = await axios.get(`${API_URL}/stock/${ticker}?period=1mo`);
                    const history = res.data.history;
                    const currentPrice = history[history.length - 1].Close;
                    const prevPrice = history[0].Close; // Compare to start of period
                    const isUp = currentPrice >= prevPrice;

                    // Simple prediction simulation (since we can't fetch all predictions efficiently yet)
                    // In a real app, we'd batch this or have a dedicated endpoint
                    const predictionRes = await axios.post(`${API_URL}/predict`, { ticker, days: 5 });
                    const prediction = predictionRes.data.forecast;
                    const lastPred = prediction[prediction.length - 1].Predicted_Close;
                    const predIsUp = lastPred >= currentPrice;

                    data[ticker] = {
                        price: currentPrice,
                        change: ((currentPrice - prevPrice) / prevPrice) * 100,
                        isUp,
                        history: history.map(h => ({ close: h.Close })),
                        predIsUp
                    };
                } catch (err) {
                    console.error(`Failed to fetch ${ticker}`, err);
                }
            }
            setStockData(data);
            setLoading(false);
        };

        fetchAllStocks();
    }, [tickers]); // Re-fetch if tickers change (e.g. added new one)

    const handleAddStock = (newTicker) => {
        if (newTicker && !tickers.includes(newTicker)) {
            setTickers([...tickers, newTicker]);
        }
    };

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Dashboard...</div>;
    }

    return (
        <div className="fade-in">
            <h2 style={{ marginBottom: '1.5rem' }}>Market Overview</h2>

            <Reorder.Group
                axis="y"
                values={tickers}
                onReorder={setTickers}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                as="div" // Render as div instead of ul
            >
                {tickers.map((ticker) => {
                    const data = stockData[ticker];
                    if (!data) return null;

                    return (
                        <Reorder.Item
                            key={ticker}
                            value={ticker}
                            style={{ listStyle: 'none' }} // Remove default list style
                            dragListener={true}
                        >
                            <div
                                className="card hover-card"
                                onClick={() => onSelectTicker(ticker)}
                                style={{ cursor: 'grab', userSelect: 'none' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{ticker}</h3>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                                            {data.price.toFixed(2)}
                                        </div>
                                    </div>
                                    <Sparkline data={data.history} color={data.isUp ? '#008000' : '#d9534f'} />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                                    <div style={{ color: data.isUp ? '#008000' : '#d9534f', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        {data.isUp ? '+' : ''}{data.change.toFixed(2)}%
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#666' }}>
                                        Forecast:
                                        {data.predIsUp ? (
                                            <ArrowUp size={16} color="#008000" />
                                        ) : (
                                            <ArrowDown size={16} color="#d9534f" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Reorder.Item>
                    );
                })}

                {/* Add Stock Tile */}
                <div
                    className="card hover-card"
                    onClick={() => setIsModalOpen(true)}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        minHeight: '150px',
                        border: '2px dashed #e0e0e0',
                        backgroundColor: '#f9f9f9'
                    }}
                >
                    <Plus size={32} color="#999" />
                    <div style={{ marginTop: '0.5rem', color: '#666', fontWeight: 500 }}>Add Stock</div>
                </div>

            </Reorder.Group>

            <AddStockModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddStock}
            />
        </div>
    );
}
