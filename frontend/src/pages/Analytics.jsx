import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  BarChart2,
  Target,
  Activity,
  Database,
  TrendingUp,
  Award,
  Layers,
  Sparkles,
  RefreshCw,
  ChevronRight
} from 'lucide-react';
import { getDisease, getTarget } from '../api/client';
import Loading from '../components/Loading';
import ErrorState from '../components/ErrorState';
import StatCard from '../components/StatCard';
import SectionHeader from '../components/SectionHeader';
import SourceBadge from '../components/SourceBadge';
import EvidenceBarChart from '../components/charts/EvidenceBarChart';
import EvidenceDistribution from '../components/charts/EvidenceDistribution';
import RelationshipNetwork from '../components/charts/RelationshipNetwork';
import ActivityChart from '../components/charts/ActivityChart';

export default function Analytics() {
  const { id } = useParams();
  const navigate = useNavigate();

  // If no ID passed, default to disease ID 1 for showcase analytics
  const activeId = id || '1';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = () => {
    setLoading(true);
    setError(null);

    getDisease(activeId)
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load analytics data');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAnalytics();
  }, [activeId]);

  const disease = data?.disease || {};
  const targets = useMemo(() => {
    if (!Array.isArray(data?.targets)) return [];
    return [...data.targets].sort((a, b) => Number(b.score || 0) - Number(a.score || 0));
  }, [data]);

  const averageScore = useMemo(() => {
    if (!targets.length) return 0;
    const sum = targets.reduce((acc, t) => acc + Number(t.score || 0), 0);
    return sum / targets.length;
  }, [targets]);

  const strongestTarget = targets[0] || null;
  const highConfidenceCount = targets.filter((t) => Number(t.score || 0) >= 0.7).length;

  if (loading) return <div className="container" style={{ padding: '3rem 1.5rem' }}><Loading text="Generating biomedical relationship analytics..." /></div>;
  if (error) return <div className="container" style={{ padding: '3rem 1.5rem' }}><ErrorState message={error} onRetry={fetchAnalytics} /></div>;

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      {/* Breadcrumbs */}
      <div className="breadcrumbs">
        <Link to="/">Asclepius</Link>
        <span className="breadcrumb-separator">/</span>
        <span>Analytics Dashboard</span>
      </div>

      {/* Header Banner */}
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <div className="eyebrow">INTELLIGENCE ANALYTICS</div>
          <h1>Biomedical Evidence Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Analytical summary for <strong style={{ color: 'var(--text-primary)' }}>{disease.name || `Disease #${activeId}`}</strong>.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn-secondary" onClick={() => navigate(`/disease/${activeId}`)}>
            View Disease Profile <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* A. KPI Cards Grid */}
      <div className="stats-grid">
        <StatCard
          label="Total Targets"
          value={targets.length}
          icon={<Target size={22} />}
        />
        <StatCard
          label="Avg Evidence Score"
          value={`${(averageScore * 100).toFixed(1)}%`}
          icon={<TrendingUp size={22} />}
        />
        <StatCard
          label="High Confidence (≥70%)"
          value={highConfidenceCount}
          icon={<Award size={22} />}
        />
        <StatCard
          label="Strongest Target"
          value={strongestTarget ? (strongestTarget.symbol || strongestTarget.name) : '—'}
          icon={<Sparkles size={22} />}
        />
      </div>

      {/* G. Derived UI Insight Cards */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div className="card" style={{ background: 'var(--bg-purple-subtle)', borderColor: 'var(--primary-light)' }}>
            <div className="eyebrow"><Sparkles size={12} style={{ display: 'inline', marginRight: '4px' }} /> KEY OBSERVATION</div>
            <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              {strongestTarget ? `${strongestTarget.symbol || strongestTarget.name} has the strongest target relationship.` : 'Target relationships evaluated.'}
            </strong>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Highest evidence score recorded: {strongestTarget ? Number(strongestTarget.score).toFixed(3) : '0.00'}.
            </p>
          </div>

          <div className="card" style={{ background: 'var(--bg-purple-subtle)', borderColor: 'var(--primary-light)' }}>
            <div className="eyebrow"><Layers size={12} style={{ display: 'inline', marginRight: '4px' }} /> CONFIDENCE PROFILES</div>
            <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              {highConfidenceCount} out of {targets.length} targets fall in the high-confidence bracket.
            </strong>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Based on aggregated evidence scores from Open Targets.
            </p>
          </div>

          <div className="card" style={{ background: 'var(--bg-purple-subtle)', borderColor: 'var(--primary-light)' }}>
            <div className="eyebrow"><Database size={12} style={{ display: 'inline', marginRight: '4px' }} /> DATA PROVENANCE</div>
            <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              Integrated from Open Targets Platform.
            </strong>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              All scores represent normalized statistical confidence.
            </p>
          </div>
        </div>
      </section>

      {/* Main Charts & Visual Networks Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {/* B. Horizontal Bar Chart */}
        <div className="panel">
          <div className="eyebrow">SCORE RANKING</div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Top Target Evidence Ranking</h3>
          <EvidenceBarChart data={targets.slice(0, 10)} onSelectTarget={(tid) => navigate(`/target/${tid}`)} />
        </div>

        {/* C. Evidence Distribution Histogram */}
        <div className="panel">
          <div className="eyebrow">DISTRIBUTION HISTOGRAM</div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Confidence Score Buckets</h3>
          <EvidenceDistribution targets={targets} />
        </div>

        {/* D. Interactive Radial Relationship Network */}
        <div className="panel" style={{ gridColumn: '1 / -1' }}>
          <div className="eyebrow">INTERACTIVE KNOWLEDGE GRAPH</div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Disease → Target Knowledge Network</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Click any target node to jump directly to its target detail and compound binding spectrum.
          </p>
          <RelationshipNetwork
            centerLabel={disease.name || 'Disease'}
            centerSub={`ID #${activeId}`}
            nodes={targets}
            onNodeClick={(t) => navigate(`/target/${t.id}`)}
          />
        </div>
      </div>

      {/* Ranked Target Evidence Data Table */}
      <section>
        <SectionHeader
          title="Evidence-Ranked Targets List"
          description="Complete target relationships ordered by statistical evidence strength."
          count={targets.length}
        />

        <table className="custom-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Target Symbol</th>
              <th>Full Name</th>
              <th>Source</th>
              <th>Score</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {targets.map((t, idx) => (
              <tr key={t.id} className="clickable" onClick={() => navigate(`/target/${t.id}`)}>
                <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>#{idx + 1}</td>
                <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{t.symbol || '—'}</td>
                <td style={{ fontWeight: 500 }}>{t.name}</td>
                <td><SourceBadge source={t.relationship_source || t.source} /></td>
                <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  {Number(t.score || 0).toFixed(3)}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <ChevronRight size={18} color="var(--text-muted)" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}