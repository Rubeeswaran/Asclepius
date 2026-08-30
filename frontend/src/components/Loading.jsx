import React from 'react';

export default function Loading({ text = 'Loading biomedical data...' }) {
  return (
    <div className="loading-box">
      <div className="spinner"></div>
      <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
        {text}
      </span>
    </div>
  );
}
