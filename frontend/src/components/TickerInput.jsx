import React, { useState } from 'react';
import { Search } from 'lucide-react';

export default function TickerInput({ onSearch, isLoading }) {
    const [ticker, setTicker] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (ticker.trim()) {
            onSearch(ticker.toUpperCase());
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 w-full max-w-md mx-auto mb-8">
            <div style={{ position: 'relative', width: '100%', maxWidth: '400px', margin: '0 auto' }}>
                <input
                    type="text"
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value)}
                    placeholder="Enter Stock Ticker (e.g., AAPL)"
                    disabled={isLoading}
                    style={{ paddingLeft: '3rem' }}
                />
                <Search
                    size={20}
                    style={{
                        position: 'absolute',
                        left: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#94a3b8'
                    }}
                />
            </div>
            <button type="submit" disabled={isLoading || !ticker.trim()}>
                {isLoading ? 'Loading...' : 'Analyze Stock'}
            </button>
        </form>
    );
}
