import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorState({ title = "Unable to load data", message, onRetry }) {
  return (
    <div className="error-box">
      <AlertCircle size={32} color="var(--danger)" />
      <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{title}</h3>
      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '450px' }}>
        {message || "An unexpected error occurred while communicating with the biomedical backend."}
      </p>
      {onRetry && (
        <button className="btn-secondary" onClick={onRetry} style={{ marginTop: '0.5rem' }}>
          <RefreshCw size={15} />
          Retry Request
        </button>
      )}
    </div>
  );
}
