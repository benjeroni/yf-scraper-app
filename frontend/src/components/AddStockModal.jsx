import React, { useState } from 'react';
import axios from 'axios';
import { X, Search, Check, AlertCircle } from 'lucide-react';

const API_URL = 'http://127.0.0.1:8000/api';

export default function AddStockModal({ isOpen, onClose, onAdd }) {
    const [ticker, setTicker] = useState('');
    const [validationResult, setValidationResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleSearch = async () => {
        if (!ticker.trim()) return;

        setLoading(true);
        setError(null);
        setValidationResult(null);

        try {
            const res = await axios.get(`${API_URL}/validate/${ticker.trim()}`);
            setValidationResult(res.data);
        } catch (err) {
            setError('Ticker not found. Please check the symbol and try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleAdd = () => {
        if (validationResult) {
            onAdd(validationResult.ticker);
            setTicker('');
            setValidationResult(null);
            onClose();
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div className="card" style={{ width: '400px', padding: '2rem', position: 'relative' }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                    <X size={20} />
                </button>

                <h2 style={{ marginTop: 0 }}>Add Stock</h2>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    <input
                        type="text"
                        value={ticker}
                        onChange={(e) => setTicker(e.target.value.toUpperCase())}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter ticker (e.g. AAPL, AIR.PA)"
                        style={{ flex: 1, padding: '0.5rem', fontSize: '1rem', border: '1px solid #ccc', borderRadius: '4px' }}
                        autoFocus
                    />
                    <button onClick={handleSearch} disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {loading ? '...' : <Search size={20} />}
                    </button>
                </div>

                {error && (
                    <div style={{ color: '#d9534f', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                {validationResult && (
                    <div style={{ backgroundColor: '#f9f9f9', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div>
                                <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{validationResult.ticker}</div>
                                <div style={{ fontSize: '0.9rem', color: '#666' }}>{validationResult.name}</div>
                                <div style={{ fontSize: '0.8rem', color: '#999' }}>{validationResult.exchange}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: 'bold' }}>{validationResult.price.toFixed(2)}</div>
                                <div style={{ fontSize: '0.8rem', color: '#666' }}>{validationResult.currency}</div>
                            </div>
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button className="secondary" onClick={onClose}>Cancel</button>
                    <button
                        onClick={handleAdd}
                        disabled={!validationResult}
                        style={{ backgroundColor: validationResult ? '#008000' : '#ccc', cursor: validationResult ? 'pointer' : 'not-allowed' }}
                    >
                        Add to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}
