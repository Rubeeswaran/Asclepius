import React from 'react';

export default function EvidenceBar({ score }) {
  const numScore = Number(score || 0);
  const percentage = Math.min(Math.max(numScore * 100, 0), 100);

  return (
    <div className="evidence-bar-wrapper">
      <div className="evidence-bar-track">
        <div 
          className="evidence-bar-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="evidence-bar-text">{numScore.toFixed(3)}</span>
    </div>
  );
}
