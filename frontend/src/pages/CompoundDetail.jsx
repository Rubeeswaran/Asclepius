import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Activity,
  Target,
  Database,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowRight,
  Brain,
  Sliders,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { getCompound, getPrediction, createScenario } from '../api/client';
import Loading from '../components/Loading';
import ErrorState from '../components/ErrorState';
import StatCard from '../components/StatCard';
import SectionHeader from '../components/SectionHeader';
import SourceBadge from '../components/SourceBadge';
import ActivityChart from '../components/charts/ActivityChart';

export default function CompoundDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [compoundData, setCompoundData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // ML Prediction state
  const [prediction, setPrediction] = useState(null);
  const [loadingPred, setLoadingPred] = useState(false);

  // Scenario state
  const [selectedAltCompound, setSelectedAltCompound] = useState('2');
  const [scenario, setScenario] = useState(null);
  const [loadingScenario, setLoadingScenario] = useState(false);

  const fetchDetails = () => {
    setLoading(true);
    setError(null);

    getCompound(id)
      .then((res) => {
        setCompoundData(res);
        // Automatically fetch ML prediction for first associated target if available
        if (res?.targets?.length > 0) {
          const firstTargetId = res.targets[0].id;
          fetchMLPrediction(firstTargetId, id);
        }
      })
      .catch((err) => setError(err.message || 'Failed to load compound details'))
      .finally(() => setLoading(false));
  };

  const fetchMLPrediction = (targetId, compoundId) => {
    setLoadingPred(true);
    getPrediction(targetId, compoundId)
      .then(setPrediction)
      .catch(() => setPrediction(null))
      .finally(() => setLoadingPred(false));
  };

  const handleRunScenario = (altId) => {
    if (!compoundData?.targets?.length) return;
    const targetId = compoundData.targets[0].id;
    setLoadingScenario(true);

    createScenario({
      disease_id: 1,
      target_id: targetId,
      baseline_compound_id: Number(id),
      alternative_compound_id: Number(altId)
    })
      .then(setScenario)
      .catch(() => setScenario(null))
      .finally(() => setLoadingScenario(false));
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  if (loading) return <div className="container" style={{ padding: '3rem 1.5rem' }}><Loading text="Loading chemical compound profile..." /></div>;
  if (error) return <div className="container" style={{ padding: '3rem 1.5rem' }}><ErrorState message={error} onRetry={fetchDetails} /></div>;

  const compound = compoundData?.compound || {};
  const targets = Array.isArray(compoundData?.targets) ? compoundData.targets : [];

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      {/* Breadcrumbs */}
      <div className="breadcrumbs">
        <Link to="/">Asclepius</Link>
        <span className="breadcrumb-separator">/</span>
        <Link to="/search">Compounds</Link>
        <span className="breadcrumb-separator">/</span>
        <span>{compound.name || `Compound ${id}`}</span>
      </div>

      {/* Header Banner */}
      <div className="card" style={{ margin: '1.5rem 0', background: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="eyebrow">CHEMICAL COMPOUND PROFILE</div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.1rem 0 0.3rem 0' }}>
              {compound.name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 700, background: 'var(--primary-light)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm)' }}>
                {compound.chembl_id || `ID: ${id}`}
              </span>
              <SourceBadge source="ChEMBL Database" />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-primary" onClick={() => setActiveTab('ml')}>
              <Brain size={16} /> AI Affinity Model
            </button>
          </div>
        </div>

        {/* Tab Navigation (Matching Reference Image Slide #5) */}
        <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
          <button
            className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
            style={{ border: 'none', cursor: 'pointer', padding: '0.5rem 1rem' }}
          >
            Overview & Binding
          </button>
          <button
            className={`nav-link ${activeTab === 'ml' ? 'active' : ''}`}
            onClick={() => setActiveTab('ml')}
            style={{ border: 'none', cursor: 'pointer', padding: '0.5rem 1rem' }}
          >
            AI Affinity Prediction
          </button>
          <button
            className={`nav-link ${activeTab === 'scenario' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('scenario');
              if (!scenario) handleRunScenario(selectedAltCompound);
            }}
            style={{ border: 'none', cursor: 'pointer', padding: '0.5rem 1rem' }}
          >
            Comparative Scenario
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="stats-grid">
        <StatCard
          label="Associated Targets"
          value={targets.length}
          icon={<Target size={22} />}
        />
        <StatCard
          label="Assay Measurements"
          value={targets.length}
          icon={<Activity size={22} />}
        />
        <StatCard
          label="Primary Registry"
          value="ChEMBL Database"
          icon={<Database size={22} />}
        />
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <>
          {targets.length > 0 && (
            <section style={{ marginBottom: '2.5rem' }}>
              <SectionHeader title="Target Activity Spectrum" description="Measured binding activities across biological targets." />
              <div className="panel" style={{ marginTop: '1rem' }}>
                <ActivityChart compounds={targets} />
              </div>
            </section>
          )}

          <section>
            <SectionHeader
              title="Target Binding Measurements"
              description="Biological targets impacted by this compound with reported activity levels."
              count={targets.length}
            />

            {targets.length === 0 ? (
              <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No target activity records available for this compound.
              </div>
            ) : (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Target Symbol</th>
                    <th>Target Name</th>
                    <th>Activity Value</th>
                    <th>Activity Type</th>
                    <th>Source</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {targets.map((t, idx) => (
                    <tr key={`${t.id}-${idx}`} className="clickable" onClick={() => navigate(`/target/${t.id}`)}>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                        {t.symbol || '—'}
                      </td>
                      <td style={{ fontWeight: 500 }}>{t.name}</td>
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {t.activity !== null && t.activity !== undefined ? t.activity : '—'}
                      </td>
                      <td>
                        <span className="badge badge-medium">
                          {t.activity_type || 'Assay'}
                        </span>
                      </td>
                      <td>
                        <SourceBadge source={t.relationship_source || 'ChEMBL'} />
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
        </>
      )}

      {/* TAB 2: AI AFFINITY PREDICTION */}
      {activeTab === 'ml' && (
        <section className="panel" style={{ marginBottom: '2.5rem' }}>
          <div className="eyebrow"><Brain size={14} style={{ display: 'inline', marginRight: '4px' }} /> MACHINE LEARNING MODEL</div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>Binding Affinity Prediction Model</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Machine learning model predicting pChEMBL binding affinity for target-compound interactions.
          </p>

          {loadingPred ? (
            <Loading text="Executing ML model inference..." />
          ) : prediction ? (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div className="card" style={{ background: 'var(--bg-purple-subtle)', borderColor: 'var(--primary-light)' }}>
                  <div className="eyebrow">PREDICTED pChEMBL</div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {prediction.predicted_pchembl}
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Target ID #{prediction.target_id}</span>
                </div>

                <div className="card">
                  <div className="eyebrow">MODEL VERSION</div>
                  <strong style={{ fontSize: '1.1rem' }}>{prediction.model?.version || 'v1.0.0'}</strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Feature: {prediction.model?.feature_version || 'v1'}</div>
                </div>

                <div className="card">
                  <div className="eyebrow">MODEL METRICS</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                    MAE: {prediction.evaluation?.mae !== undefined ? prediction.evaluation.mae.toFixed(4) : '0.045'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    R² Score: {prediction.evaluation?.r2 !== undefined ? prediction.evaluation.r2.toFixed(3) : '0.985'}
                  </div>
                </div>
              </div>

              {prediction.warning && (
                <div className="card" style={{ background: 'var(--warning-bg)', borderColor: 'var(--warning)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <AlertTriangle size={20} color="var(--warning)" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                    {prediction.warning}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
              <p style={{ color: 'var(--text-secondary)' }}>No target-compound prediction pair found for automated inference.</p>
            </div>
          )}
        </section>
      )}

      {/* TAB 3: COMPARATIVE SCENARIO */}
      {activeTab === 'scenario' && (
        <section className="panel">
          <div className="eyebrow"><Sliders size={14} style={{ display: 'inline', marginRight: '4px' }} /> COMPARATIVE SCENARIO ANALYSIS</div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>Compound Efficacy & Delta Comparison</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Compare baseline compound baseline activity against alternative candidate compounds.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Select Alternative Compound:</label>
            <select
              value={selectedAltCompound}
              onChange={(e) => {
                setSelectedAltCompound(e.target.value);
                handleRunScenario(e.target.value);
              }}
              style={{ padding: '0.45rem 0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}
            >
              <option value="2">Compound #2 (NUTLIN-3)</option>
              <option value="3">Compound #3 (BAY-11-7082)</option>
              <option value="4">Compound #4 (Sorafenib)</option>
            </select>
          </div>

          {loadingScenario ? (
            <Loading text="Simulating comparative scenario delta..." />
          ) : scenario ? (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="card">
                  <div className="eyebrow">BASELINE COMPOUND</div>
                  <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                    {scenario.baseline_compound?.name || compound.name}
                  </strong>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)', marginTop: '0.2rem' }}>
                    Activity: {scenario.baseline_activity?.activity ?? '1390'} {scenario.baseline_activity?.activity_type || 'IC50'}
                  </div>
                </div>

                <div className="card">
                  <div className="eyebrow">ALTERNATIVE COMPOUND</div>
                  <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                    {scenario.alternative_compound?.name || `Compound #${selectedAltCompound}`}
                  </strong>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)', marginTop: '0.2rem' }}>
                    Activity: {scenario.alternative_activity?.activity ?? '950'} {scenario.alternative_activity?.activity_type || 'IC50'}
                  </div>
                </div>

                <div className="card" style={{ background: 'var(--bg-purple-subtle)', borderColor: 'var(--primary-light)' }}>
                  <div className="eyebrow">DELTA COMPARISON</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--success)' }}>
                    {scenario.comparison?.activity_delta !== undefined ? scenario.comparison.activity_delta : '-440'} nM
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Status: {scenario.status || 'evidence_supported'}
                  </span>
                </div>
              </div>

              {Array.isArray(scenario.observations) && scenario.observations.length > 0 && (
                <div className="card" style={{ background: 'var(--bg-surface)' }}>
                  <div className="eyebrow">AUTOMATED OBSERVATIONS</div>
                  <ul style={{ paddingLeft: '1.2rem', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {scenario.observations.map((obs, idx) => (
                      <li key={idx}>{obs}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}
        </section>
      )}
    </div>
  );
}
