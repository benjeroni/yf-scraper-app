import React from 'react';
import { ExternalLink } from 'lucide-react';

export default function NewsFeed({ news }) {
    if (!news || news.length === 0) return null;

    return (
        <div className="card">
            <h2 style={{ textAlign: 'left', marginBottom: '1rem' }}>Recent News</h2>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {news.map((item, index) => (
                    <div key={index} className="news-item">
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="news-title">
                            {item.title} <ExternalLink size={12} style={{ display: 'inline', marginLeft: '4px' }} />
                        </a>
                        <div className="news-meta">
                            <span>{item.publisher}</span> • <span>{new Date(item.providerPublishTime * 1000).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
