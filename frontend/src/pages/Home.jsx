import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, ArrowRight, Activity, Target, Database, Layers, BarChart2 } from 'lucide-react';

export default function Home() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handlePillClick = (term) => {
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <div className="container">
      {/* Hero Section */}
      <section style={{ padding: '3.5rem 0 2.5rem 0', textAlign: 'center', maxWidth: '840px', margin: '0 auto' }}>
        <div className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'var(--primary-light)', padding: '0.3rem 0.8rem', borderRadius: 'var(--radius-full)' }}>
          <Activity size={14} /> RESEARCH INTELLIGENCE PLATFORM
        </div>
        
        <h1 style={{ fontSize: '2.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.15, margin: '1rem 0 1.25rem 0', letterSpacing: '-0.02em' }}>
          Trace the evidence. <br />
          <span style={{ color: 'var(--primary)' }}>Understand the connection.</span>
        </h1>

        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
          Explore how diseases connect to biological targets, experimental compounds, and published scientific evidence across integrated biomedical knowledge bases.
        </p>

        {/* Hero Search Box */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-surface)', padding: '0.4rem 0.5rem 0.4rem 1.2rem', borderRadius: 'var(--radius-full)', border: '1.5px solid var(--border-color)', boxShadow: 'var(--shadow-lg)' }}>
          <Search size={22} color="var(--text-muted)" style={{ alignSelf: 'center' }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a disease, target gene (e.g. TP53), pathway, or compound..."
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: '1rem', background: 'transparent' }}
          />
          <button type="submit" className="btn-primary" style={{ borderRadius: 'var(--radius-full)', padding: '0.65rem 1.4rem' }}>
            Explore <ArrowRight size={16} />
          </button>
        </form>

        {/* Quick Search Pills */}
        <div className="quick-pills" style={{ justifyContent: 'center', marginTop: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Suggested:</span>
          <button className="quick-pill" onClick={() => handlePillClick('TP53')}>TP53</button>
          <button className="quick-pill" onClick={() => handlePillClick('EGFR')}>EGFR</button>
          <button className="quick-pill" onClick={() => handlePillClick('hepatocellular carcinoma')}>hepatocellular carcinoma</button>
          <button className="quick-pill" onClick={() => handlePillClick('NUTLIN-3')}>NUTLIN-3</button>
        </div>
      </section>

      {/* Feature Section Grid */}
      <section style={{ margin: '3rem 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="eyebrow">THE KNOWLEDGE GRAPH</div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Biomedical Intelligence Architecture</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <Link to="/search" className="card card-hover" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', marginBottom: '1rem' }}>
              <Search size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>1. Cross-Database Search</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Instantly query integrated targets, diseases, and chemical compounds from Open Targets and ChEMBL.
            </p>
            <div style={{ marginTop: '1.25rem', color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              Launch Search <ArrowRight size={14} />
            </div>
          </Link>

          <Link to="/disease/1" className="card card-hover" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', marginBottom: '1rem' }}>
              <Target size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>2. Relationship Evidence</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Explore scored target-disease associations and experimental compound binding activities with statistical confidence.
            </p>
            <div style={{ marginTop: '1.25rem', color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              View Disease Dashboard <ArrowRight size={14} />
            </div>
          </Link>

          <Link to="/analytics" className="card card-hover" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', marginBottom: '1rem' }}>
              <BarChart2 size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>3. Visual Analytics</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Analyze confidence distributions, horizontal target score rankings, and radial SVG knowledge networks.
            </p>
            <div style={{ marginTop: '1.25rem', color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              Open Analytics Dashboard <ArrowRight size={14} />
            </div>
          </Link>
        </div>
      </section>

      {/* Data Source Strip */}
      <section className="card" style={{ background: 'linear-gradient(90deg, #faf5ff 0%, #ffffff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginTop: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Database size={24} color="var(--primary)" />
          <div>
            <strong style={{ fontSize: '0.95rem', display: 'block' }}>Integrated Data Sources</strong>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Standardized evidence pipelines from trusted biomedical registries</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
          <span>Open Targets Platform</span>
          <span>·</span>
          <span>ChEMBL Database</span>
        </div>
      </section>
    </div>
  );
}
