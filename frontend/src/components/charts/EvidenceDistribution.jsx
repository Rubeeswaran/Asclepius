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

export default function EvidenceDistribution({ targets = [] }) {
  // Buckets: 0-0.2, 0.2-0.4, 0.4-0.6, 0.6-0.8, 0.8-1.0
  const buckets = [
    { range: '0–0.2', count: 0, fill: '#cbd5e1' },
    { range: '0.2–0.4', count: 0, fill: '#c084fc' },
    { range: '0.4–0.6', count: 0, fill: '#a855f7' },
    { range: '0.6–0.8', count: 0, fill: '#9333ea' },
    { range: '0.8–1.0', count: 0, fill: '#7c3aed' },
  ];

  targets.forEach((t) => {
    const s = Number(t.score || 0);
    if (s < 0.2) buckets[0].count++;
    else if (s < 0.4) buckets[1].count++;
    else if (s < 0.6) buckets[2].count++;
    else if (s < 0.8) buckets[3].count++;
    else buckets[4].count++;
  });

  return (
    <div style={{ width: '100%', height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={buckets} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey="range" stroke="var(--text-muted)" fontSize={11} />
          <YAxis allowDecimals={false} stroke="var(--text-muted)" fontSize={11} />
          <Tooltip
            formatter={(val) => [`${val} targets`, 'Count']}
            contentStyle={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8rem'
            }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {buckets.map((b, idx) => (
              <Cell key={idx} fill={b.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
