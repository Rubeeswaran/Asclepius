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

export default function EvidenceBarChart({ data = [], onSelectTarget }) {
  const chartData = data.map((t) => ({
    id: t.id,
    name: t.symbol || t.name,
    fullName: t.name,
    score: Math.round(Number(t.score || 0) * 100),
    rawScore: Number(t.score || 0),
  }));

  if (!chartData.length) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No target ranking data</div>;
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          padding: '0.6rem 0.9rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-md)',
          fontSize: '0.8rem'
        }}>
          <strong style={{ color: 'var(--primary)', display: 'block' }}>{d.name}</strong>
          <span style={{ color: 'var(--text-secondary)' }}>{d.fullName}</span>
          <div style={{ marginTop: '0.2rem', fontWeight: 600 }}>Score: {d.score}% ({d.rawScore.toFixed(3)})</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
        >
          <XAxis type="number" domain={[0, 100]} unit="%" stroke="var(--text-muted)" fontSize={12} />
          <YAxis
            type="category"
            dataKey="name"
            stroke="var(--text-secondary)"
            fontSize={12}
            width={70}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="score"
            radius={[0, 6, 6, 0]}
            onClick={(entry) => onSelectTarget && onSelectTarget(entry.id)}
            style={{ cursor: 'pointer' }}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={index === 0 ? '#7c3aed' : index < 3 ? '#9333ea' : '#a855f7'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
