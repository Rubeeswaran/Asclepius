import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export default function ActivityChart({ compounds = [] }) {
  const chartData = compounds
    .filter((c) => c.activity !== null && c.activity !== undefined)
    .map((c) => ({
      name: c.name,
      activity: Number(c.activity),
      type: c.activity_type || 'Activity',
      chemblId: c.chembl_id,
    }))
    .slice(0, 10);

  if (!chartData.length) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        No quantifiable numerical activity measurements available for visualization.
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 240 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
          <XAxis
            dataKey="name"
            stroke="var(--text-muted)"
            fontSize={11}
            angle={-20}
            textAnchor="end"
            interval={0}
          />
          <YAxis stroke="var(--text-muted)" fontSize={11} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const d = payload[0].payload;
                return (
                  <div style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    padding: '0.5rem 0.8rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.8rem'
                  }}>
                    <strong style={{ color: 'var(--text-primary)' }}>{d.name}</strong>
                    <div style={{ color: 'var(--text-secondary)' }}>{d.chemblId}</div>
                    <div style={{ color: 'var(--primary)', fontWeight: 600, marginTop: '0.2rem' }}>
                      {d.type}: {d.activity}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="activity" radius={[4, 4, 0, 0]}>
            {chartData.map((_, idx) => (
              <Cell key={idx} fill={idx % 2 === 0 ? '#7c3aed' : '#a855f7'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
