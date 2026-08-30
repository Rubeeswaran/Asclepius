import React from 'react';

export default function SourceBadge({ source }) {
  const text = source || 'Open Targets';
  return (
    <span className="badge badge-source">
      {text}
    </span>
  );
}
