import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Activity, Target, Database, BarChart2, ChevronRight, Layers, ArrowRight } from 'lucide-react';
import { getDisease, getDiseaseEvidence } from '../api/client';
import Loading from '../components/Loading';
import ErrorState from '../components/ErrorState';
import StatCard from '../components/StatCard';
import SectionHeader from '../components/SectionHeader';
import SourceBadge from '../components/SourceBadge';
import EvidenceBar from '../components/EvidenceBar';
import EvidenceBarChart from '../components/charts/EvidenceBarChart';
import EvidenceDistribution from '../components/charts/EvidenceDistribution';
import RelationshipNetwork from '../components/charts/RelationshipNetwork';

export default function DiseaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [diseaseData, setDiseaseData] = useState(null);
  const [evidenceData, setEvidenceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDetails = () => {
    setLoading(true);
    setError(null);

    Promise.all([
      getDisease(id),
      getDiseaseEvidence(id).catch(() => null)
    ])
      .then(([dRes, eRes]) => {
        setDiseaseData(dRes);
        setEvidenceData(eRes);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load disease details');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  if (loading) return <div className="container" style={{ padding: '3rem 1.5rem' }}><Loading text="Loading disease evidence profile..." /></div>;
  if (error) return <div className="container" style={{ padding: '3rem 1.5rem' }}><ErrorState message={error} onRetry={fetchDetails} /></div>;

  const disease = diseaseData?.disease || {};
  const targets = Array.isArray(diseaseData?.targets) ? diseaseData.targets : [];
  const evidenceRecords = Array.isArray(evidenceData?.evidence) ? evidenceData.evidence : [];

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      {/* Breadcrumbs */}
      <div className="breadcrumbs">
        <Link to="/">Asclepius</Link>
        <span className="breadcrumb-separator">/</span>
        <Link to="/search">Diseases</Link>
        <span className="breadcrumb-separator">/</span>
        <span>{disease.name || `Disease ${id}`}</span>
      </div>

      {/* Disease Header Banner */}
      <div className="card" style={{ margin: '1.5rem 0', background: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="eyebrow">DISEASE PROFILE</div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.2rem 0' }}>
              {disease.name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text-muted)', background: 'var(--bg-subtle)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
                Source ID: {disease.source_id || 'N/A'}
              </span>
              {disease.organ_id !== undefined && (
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Organ ID: {disease.organ_id}
                </span>
              )}
              <SourceBadge source={disease.source} />
            </div>
          </div>

          <button
            className="btn-primary"
            onClick={() => navigate(`/analytics/disease/${id}`)}
          >
            <BarChart2 size={16} /> Disease Analytics Dashboard
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <StatCard
          label="Associated Targets"
          value={targets.length}
          icon={<Target size={22} />}
        />
        <StatCard
          label="Evidence Records"
          value={evidenceRecords.length || targets.length}
          icon={<Activity size={22} />}
        />
        <StatCard
          label="Primary Source"
          value={disease.source || 'Open Targets'}
          icon={<Database size={22} />}
        />
      </div>

      {/* Visual Analytics Overview Grid */}
      {targets.length > 0 && (
        <section style={{ marginBottom: '2.5rem' }}>
          <SectionHeader title="Visual Evidence Analytics" description="Score distribution and knowledge graph overview for this disease." />
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
            {/* Top Targets Horizontal Bar Chart */}
            <div className="panel">
              <div className="eyebrow">RANKED STRENGTH</div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem' }}>Top Target Score Ranking</h3>
              <EvidenceBarChart data={targets.slice(0, 6)} onSelectTarget={(tid) => navigate(`/target/${tid}`)} />
            </div>

            {/* Evidence Distribution */}
            <div className="panel">
              <div className="eyebrow">CONFIDENCE DISTRIBUTION</div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem' }}>Score Range Breakdown</h3>
              <EvidenceDistribution targets={targets} />
            </div>

            {/* Relationship Network SVG */}
            <div className="panel" style={{ gridColumn: '1 / -1' }}>
              <div className="eyebrow">KNOWLEDGE GRAPH NETWORK</div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem' }}>Disease → Target Relationship Graph</h3>
              <RelationshipNetwork
                centerLabel={disease.name}
                centerSub={`Disease #${id}`}
                nodes={targets}
                onNodeClick={(t) => navigate(`/target/${t.id}`)}
              />
            </div>
          </div>
        </section>
      )}

      {/* Associated Targets Ranking Table */}
      <section>
        <SectionHeader
          title="Associated Biological Targets"
          description="Targets linked to this disease with associated Open Targets evidence scores."
          count={targets.length}
        />

        {targets.length === 0 ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No target associations currently recorded for this disease.
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Target Symbol</th>
                <th>Full Name</th>
                <th>Evidence Score</th>
                <th>Source</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {targets.map((t, idx) => (
                <tr key={t.id} className="clickable" onClick={() => navigate(`/target/${t.id}`)}>
                  <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>#{idx + 1}</td>
                  <td style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.95rem' }}>
                    {t.symbol || '—'}
                  </td>
                  <td style={{ fontWeight: 500 }}>{t.name}</td>
                  <td style={{ minWidth: '180px' }}>
                    <EvidenceBar score={t.score} />
                  </td>
                  <td>
                    <SourceBadge source={t.relationship_source || t.source} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <ChevronRight size={18} color="var(--text-muted)" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
