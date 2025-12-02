import React, { useState } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';

const RANGES = ['1D', '1W', '1M', '3M', '6M', '1Y', '2Y'];

export default function StockChart({ history, prediction, onRangeChange, referenceLines }) {
    // Combine history and prediction for the chart
    // ... (rest of data processing)
    const [activeRange, setActiveRange] = useState('1W');

    const handleRangeClick = (range) => {
        setActiveRange(range);
        if (onRangeChange) onRangeChange(range);
    };

    // Combine data
    const data = [...history];
    if (prediction && prediction.length > 0) {
        const lastHistoryDate = history[history.length - 1]?.Date;
        prediction.forEach(p => {
            if (p.Date > lastHistoryDate) {
                data.push({
                    Date: p.Date,
                    Predicted_Close: p.Predicted_Close,
                    isPrediction: true
                });
            }
        });
    }

    // Determine color based on trend (start vs end of visible data)
    const firstPrice = data[0]?.Close || data[0]?.Predicted_Close;
    const lastPrice = data[data.length - 1]?.Predicted_Close || data[data.length - 1]?.Close;
    const isUp = lastPrice >= firstPrice;
    const chartColor = isUp ? 'var(--up-color)' : 'var(--down-color)';

    // Prediction color logic: compare last historical close to last predicted close
    const lastHistoryClose = history[history.length - 1]?.Close;
    const lastPredictedClose = prediction && prediction.length > 0 ? prediction[prediction.length - 1].Predicted_Close : lastHistoryClose;
    const isPredictionUp = lastPredictedClose >= lastHistoryClose;
    const predictionColor = isPredictionUp ? 'var(--up-color)' : 'var(--down-color)';

    return (
        <div className="card" style={{ height: '500px', width: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0 }}>Price History & Forecast</h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {RANGES.map(range => (
                        <button
                            key={range}
                            onClick={() => handleRangeClick(range)}
                            className={activeRange === range ? '' : 'secondary'}
                            style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ flex: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorChart" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={chartColor} stopOpacity={0.2} />
                                <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="Date"
                            tick={{ fill: '#666', fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                            minTickGap={30}
                        />
                        <YAxis
                            domain={['auto', 'auto']}
                            orientation="right"
                            tick={{ fill: '#666', fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(val) => val.toFixed(0)}
                        />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#fff', borderColor: '#e0e0e0', color: '#000', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                            itemStyle={{ color: '#000' }}
                            labelStyle={{ color: '#666' }}
                            formatter={(value) => value.toFixed(2)}
                        />
                        <Area
                            type="monotone"
                            dataKey="Close"
                            stroke={chartColor}
                            fillOpacity={1}
                            fill="url(#colorChart)"
                            strokeWidth={2}
                            name="Price"
                        />
                        <Area
                            type="monotone"
                            dataKey="Predicted_Close"
                            stroke={predictionColor}
                            strokeDasharray="5 5"
                            fillOpacity={1}
                            fill="url(#colorChart)"
                            strokeWidth={2}
                            name="Forecast"
                            connectNulls
                        />
                        {referenceLines && referenceLines.sell && (
                            <ReferenceLine y={referenceLines.sell} label="Sell" stroke="#d9534f" strokeDasharray="3 3" />
                        )}
                        {referenceLines && referenceLines.buy && (
                            <ReferenceLine y={referenceLines.buy} label="Buy" stroke="#008000" strokeDasharray="3 3" />
                        )}
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
