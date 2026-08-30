import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Target as TargetIcon, Activity, Database, BarChart2, ChevronRight, ArrowRight } from 'lucide-react';
import { getTarget, getTargetEvidence } from '../api/client';
import Loading from '../components/Loading';
import ErrorState from '../components/ErrorState';
import StatCard from '../components/StatCard';
import SectionHeader from '../components/SectionHeader';
import SourceBadge from '../components/SourceBadge';
import EvidenceBar from '../components/EvidenceBar';
import EvidenceBarChart from '../components/charts/EvidenceBarChart';
import ActivityChart from '../components/charts/ActivityChart';
import RelationshipNetwork from '../components/charts/RelationshipNetwork';

export default function TargetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [targetData, setTargetData] = useState(null);
  const [evidenceData, setEvidenceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDetails = () => {
    setLoading(true);
    setError(null);

    Promise.all([
      getTarget(id),
      getTargetEvidence(id).catch(() => null)
    ])
      .then(([tRes, eRes]) => {
        setTargetData(tRes);
        setEvidenceData(eRes);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load target details');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  if (loading) return <div className="container" style={{ padding: '3rem 1.5rem' }}><Loading text="Loading biological target profile..." /></div>;
  if (error) return <div className="container" style={{ padding: '3rem 1.5rem' }}><ErrorState message={error} onRetry={fetchDetails} /></div>;

  const target = targetData?.target || {};
  const diseases = Array.isArray(targetData?.diseases) ? targetData.diseases : [];
  const compounds = Array.isArray(targetData?.compounds) ? targetData.compounds : [];
  const evidenceRecords = Array.isArray(evidenceData?.evidence) ? evidenceData.evidence : [];

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      {/* Breadcrumbs */}
      <div className="breadcrumbs">
        <Link to="/">Asclepius</Link>
        <span className="breadcrumb-separator">/</span>
        <Link to="/search">Targets</Link>
        <span className="breadcrumb-separator">/</span>
        <span>{target.symbol || target.name || `Target ${id}`}</span>
      </div>

      {/* Target Header Banner */}
      <div className="card" style={{ margin: '1.5rem 0', background: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="eyebrow">BIOLOGICAL TARGET PROFILE</div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--primary)', margin: '0.1rem 0 0.3rem 0' }}>
              {target.symbol || target.name}
            </h1>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              {target.name}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text-muted)', background: 'var(--bg-subtle)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
                Ensembl ID: {target.source_id || 'N/A'}
              </span>
              <SourceBadge source={target.source} />
            </div>
          </div>

          <button
            className="btn-primary"
            onClick={() => navigate(`/analytics/target/${id}`)}
          >
            <BarChart2 size={16} /> Target Analytics Dashboard
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <StatCard
          label="Disease Associations"
          value={diseases.length}
          icon={<Activity size={22} />}
        />
        <StatCard
          label="Associated Compounds"
          value={compounds.length}
          icon={<TargetIcon size={22} />}
        />
        <StatCard
          label="Target Data Source"
          value={target.source || 'Open Targets'}
          icon={<Database size={22} />}
        />
      </div>

      {/* Visual Analytics Section */}
      <section style={{ marginBottom: '2.5rem' }}>
        <SectionHeader title="Visual Analytics & Network Graph" description="Target disease associations and experimental compound binding spectrum." />
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
          {/* Disease evidence bar chart */}
          {diseases.length > 0 && (
            <div className="panel">
              <div className="eyebrow">ASSOCIATED DISEASES</div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem' }}>Disease Association Scores</h3>
              <EvidenceBarChart data={diseases.slice(0, 6)} onSelectTarget={(did) => navigate(`/disease/${did}`)} />
            </div>
          )}

          {/* Compound activity chart */}
          {compounds.length > 0 && (
            <div className="panel">
              <div className="eyebrow">COMPOUND ACTIVITY</div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem' }}>Experimental Activity Values</h3>
              <ActivityChart compounds={compounds} />
            </div>
          )}

          {/* Network Graph */}
          {diseases.length > 0 && (
            <div className="panel" style={{ gridColumn: '1 / -1' }}>
              <div className="eyebrow">KNOWLEDGE GRAPH NETWORK</div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem' }}>Target ↔ Disease Association Network</h3>
              <RelationshipNetwork
                centerLabel={target.symbol || target.name}
                centerSub={`Target #${id}`}
                nodes={diseases}
                onNodeClick={(d) => navigate(`/disease/${d.id}`)}
              />
            </div>
          )}
        </div>
      </section>

      {/* Disease Associations Table */}
      <section style={{ marginBottom: '2.5rem' }}>
        <SectionHeader
          title="Disease Associations"
          description="Diseases associated with this target sorted by Open Targets score."
          count={diseases.length}
        />

        {diseases.length === 0 ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No disease associations available for this target.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {diseases.map((d) => (
              <div
                key={d.id}
                className="card card-hover"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/disease/${d.id}`)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <SourceBadge source={d.relationship_source || d.source} />
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-purple)', fontWeight: 700 }}>
                    Score: {Number(d.score || 0).toFixed(3)}
                  </span>
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                  {d.name}
                </h4>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginBottom: '0.75rem' }}>
                  {d.source_id}
                </div>
                <EvidenceBar score={d.score} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Associated Compounds Table */}
      <section>
        <SectionHeader
          title="Associated Chemical Compounds"
          description="Experimental compounds tested against this target from ChEMBL."
          count={compounds.length}
        />

        {compounds.length === 0 ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No compound activity measurements currently available.
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Compound Name</th>
                <th>ChEMBL ID</th>
                <th>Activity Value</th>
                <th>Activity Type</th>
                <th>Source</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {compounds.map((c, idx) => (
                <tr key={`${c.id}-${idx}`} className="clickable" onClick={() => navigate(`/compound/${c.id}`)}>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--primary)' }}>
                    {c.chembl_id || `ID: ${c.id}`}
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    {c.activity !== null && c.activity !== undefined ? c.activity : '—'}
                  </td>
                  <td>
                    <span className="badge badge-medium">
                      {c.activity_type || 'Assay'}
                    </span>
                  </td>
                  <td>
                    <SourceBadge source={c.relationship_source || 'ChEMBL'} />
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
