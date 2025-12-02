import React from 'react';
import { TrendingUp, AlertCircle } from 'lucide-react';

export default function AccuracyBadge({ accuracy }) {
    if (!accuracy) return null;

    // Placeholder logic for display
    const hasData = accuracy.predictions_count > 0;

    return (
        <div className="card" style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ textAlign: 'left' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Model Accuracy</h3>
                <p style={{ margin: '0.5rem 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>
                    Based on {accuracy.predictions_count} tracked predictions
                </p>
            </div>

            {hasData ? (
                <div className="badge">
                    <TrendingUp size={16} style={{ marginRight: '0.5rem' }} />
                    MAE: {accuracy.mean_absolute_error.toFixed(2)}
                </div>
            ) : (
                <div className="badge warning">
                    <AlertCircle size={16} style={{ marginRight: '0.5rem' }} />
                    No historical data yet
                </div>
            )}
        </div>
    );
}
