import React from 'react';

export default function SectionHeader({ title, description, count }) {
  return (
    <div className="section-header">
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {count !== undefined && count !== null && (
        <span className="count-pill">{count}</span>
      )}
    </div>
  );
}
