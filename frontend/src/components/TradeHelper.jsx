import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings, Save, RefreshCw, Trash2 } from 'lucide-react';

const API_URL = 'http://127.0.0.1:8000/api';

export default function TradeHelper({ ticker, currentPrice, onAlertUpdate }) {
    const [refPrice, setRefPrice] = useState('');
    const [threshold, setThreshold] = useState(15);
    const [isActive, setIsActive] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchAlert();
    }, [ticker]);

    const fetchAlert = async () => {
        try {
            const res = await axios.get(`${API_URL}/alerts/${ticker}`);
            if (res.data && res.data.ticker) {
                setRefPrice(res.data.reference_price);
                setThreshold(res.data.threshold);
                setIsActive(res.data.is_active);
                // Notify parent of initial lines
                onAlertUpdate({
                    refPrice: res.data.reference_price,
                    threshold: res.data.threshold,
                    active: res.data.is_active
                });
            } else {
                // Reset if no alert
                setRefPrice('');
                setIsActive(false);
                onAlertUpdate(null);
            }
        } catch (err) {
            console.error("Failed to fetch alert", err);
        }
    };

    const handleSave = async () => {
        if (!refPrice || !threshold) return;
        setLoading(true);
        const alertData = {
            ticker,
            reference_price: parseFloat(refPrice),
            threshold: parseFloat(threshold),
            is_active: true
        };
        try {
            await axios.post(`${API_URL}/alerts`, alertData);
            setIsActive(true);
            onAlertUpdate({
                refPrice: parseFloat(refPrice),
                threshold: parseFloat(threshold),
                active: true
            });
        } catch (err) {
            console.error("Failed to save alert", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`${API_URL}/alerts/${ticker}`);
            setIsActive(false);
            setRefPrice('');
            onAlertUpdate(null);
        } catch (err) {
            console.error("Failed to delete alert", err);
        }
    };

    const handleRecordTrade = async () => {
        // Update reference price to current price (or close to it)
        // In a real app, maybe ask for exact execution price.
        // For now, assume we just traded at current price.
        setRefPrice(currentPrice);
        const alertData = {
            ticker,
            reference_price: currentPrice,
            threshold: parseFloat(threshold),
            is_active: true
        };
        try {
            await axios.post(`${API_URL}/alerts`, alertData);
            onAlertUpdate({
                refPrice: currentPrice,
                threshold: parseFloat(threshold),
                active: true
            });
        } catch (err) {
            console.error("Failed to update trade", err);
        }
    };

    const sellTarget = refPrice ? parseFloat(refPrice) + parseFloat(threshold) : null;
    const buyTarget = refPrice ? parseFloat(refPrice) - parseFloat(threshold) : null;

    return (
        <div className="card" style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Settings size={20} /> Trading Helper
                </h3>
                {isActive && (
                    <button onClick={handleDelete} className="secondary" style={{ padding: '0.25rem', color: '#d9534f', borderColor: '#d9534f' }}>
                        <Trash2 size={16} />
                    </button>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '0.25rem' }}>Reference Price</label>
                    <input
                        type="number"
                        value={refPrice}
                        onChange={(e) => setRefPrice(e.target.value)}
                        placeholder={currentPrice?.toFixed(2)}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '0.25rem' }}>Threshold ($)</label>
                    <input
                        type="number"
                        value={threshold}
                        onChange={(e) => setThreshold(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                </div>
            </div>

            {isActive && sellTarget && buyTarget && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.9rem' }}>
                    <div style={{ color: '#d9534f' }}>Sell Target: <strong>{sellTarget.toFixed(2)}</strong></div>
                    <div style={{ color: '#008000' }}>Buy Target: <strong>{buyTarget.toFixed(2)}</strong></div>
                </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem' }}>
                {!isActive ? (
                    <button onClick={handleSave} disabled={loading} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <Save size={16} /> Start Tracking
                    </button>
                ) : (
                    <button onClick={handleRecordTrade} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', backgroundColor: '#333' }}>
                        <RefreshCw size={16} /> Record Trade (Reset Ref)
                    </button>
                )}
            </div>
        </div>
    );
}
