import React from 'react';
import { Database } from 'lucide-react';

export default function EmptyState({ title = "No data found", description = "No relationships or records are currently available." }) {
  return (
    <div className="empty-box">
      <Database size={32} color="var(--text-muted)" />
      <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 600 }}>{title}</h4>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{description}</p>
    </div>
  );
}
