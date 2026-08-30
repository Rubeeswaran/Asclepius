import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Activity, ShieldCheck } from 'lucide-react';

export default function RelationshipNetwork({
  centerLabel = "Disease",
  centerSub = "Central Entity",
  nodes = [],
  onNodeClick
}) {
  const navigate = useNavigate();

  // Limit to top 10 nodes for clean spacing
  const displayNodes = nodes.slice(0, 10);
  const total = displayNodes.length;

  const centerX = 50; // percentage
  const centerY = 50; // percentage
  const radius = 38;  // radius percentage

  const calculatedNodes = displayNodes.map((node, index) => {
    const angle = (index / Math.max(total, 1)) * 2 * Math.PI - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    const score = Number(node.score || 0);

    return {
      ...node,
      x,
      y,
      score,
      angle
    };
  });

  const handleNodeClick = (node) => {
    if (onNodeClick) {
      onNodeClick(node);
    } else if (node.id) {
      navigate(`/target/${node.id}`);
    }
  };

  return (
    <div className="network-container">
      {/* Connection lines */}
      <svg className="network-svg">
        {calculatedNodes.map((node, i) => (
          <line
            key={i}
            x1={`${centerX}%`}
            y1={`${centerY}%`}
            x2={`${node.x}%`}
            y2={`${node.y}%`}
            stroke="#a855f7"
            strokeWidth={Math.max(1, node.score * 3.5)}
            strokeOpacity={Math.max(0.2, node.score)}
            strokeDasharray={node.score < 0.4 ? "4 4" : "none"}
          />
        ))}
      </svg>

      {/* Central Node */}
      <div className="network-center-node">
        <Activity size={18} style={{ marginBottom: '2px' }} />
        <div>{centerLabel}</div>
        <span style={{ fontSize: '0.68rem', fontWeight: 500, opacity: 0.9 }}>{centerSub}</span>
      </div>

      {/* Orbiting Nodes */}
      {calculatedNodes.map((node) => (
        <button
          key={node.id}
          className="network-orbit-node"
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
            borderColor: node.score >= 0.7 ? 'var(--primary)' : 'var(--border-color)',
          }}
          onClick={() => handleNodeClick(node)}
          title={`${node.symbol || node.name} - Score: ${node.score.toFixed(3)}`}
        >
          <Target size={14} color="var(--primary)" />
          <span>{node.symbol || node.name}</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-purple)', fontWeight: 700 }}>
            {Math.round(node.score * 100)}%
          </span>
        </button>
      ))}
    </div>
  );
}
