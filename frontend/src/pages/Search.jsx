import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Search as SearchIcon, Target, Activity, FlaskConical, Shield, ChevronRight } from 'lucide-react';
import { searchBackend } from '../api/client';
import Loading from '../components/Loading';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import SourceBadge from '../components/SourceBadge';

export default function SearchPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setQuery(initialQuery);
    if (!initialQuery.trim()) {
      setData(null);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    searchBackend(initialQuery)
      .then((res) => {
        if (isMounted) setData(res);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Search failed');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [initialQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const diseases = Array.isArray(data?.diseases) ? data.diseases : [];
  const targets = Array.isArray(data?.targets) ? data.targets : [];
  const compounds = Array.isArray(data?.compounds) ? data.compounds : [];
  const totalResults = diseases.length + targets.length + compounds.length;

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <div className="breadcrumbs">
        <Link to="/">Asclepius</Link>
        <span className="breadcrumb-separator">/</span>
        <span>Global Search</span>
      </div>

      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <div className="eyebrow">KNOWLEDGE BASE SEARCH</div>
          <h1>Biomedical Discovery Search</h1>
          <p>Search targets, diseases, and chemical compounds across integrated registries.</p>
        </div>
      </div>

      {/* Main Search Input Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <SearchIcon size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search gene symbol (TP53), disease (carcinoma), or compound..."
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.8rem',
              fontSize: '1rem',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--border-color)',
              outline: 'none',
              background: 'var(--bg-surface)'
            }}
          />
        </div>
        <button type="submit" className="btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}>
          Search
        </button>
      </form>

      {/* Prompt when no initial query */}
      {!initialQuery && (
        <div className="card" style={{ textCenter: 'center', padding: '3rem 2rem', textAlign: 'center' }}>
          <SearchIcon size={40} color="var(--primary)" style={{ margin: '0 auto 1rem auto', display: 'block' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Search the Asclepius Biomedical Database</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '500px', margin: '0 auto 1.5rem auto' }}>
            Enter a disease name, target gene symbol, or chemical compound to search real backend records.
          </p>
          <div className="quick-pills" style={{ justifyContent: 'center' }}>
            <button className="quick-pill" onClick={() => navigate('/search?q=TP53')}>Try "TP53"</button>
            <button className="quick-pill" onClick={() => navigate('/search?q=EGFR')}>Try "EGFR"</button>
            <button className="quick-pill" onClick={() => navigate('/search?q=hepatocellular carcinoma')}>Try "hepatocellular carcinoma"</button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && <Loading text={`Searching database for "${initialQuery}"...`} />}

      {/* Error state */}
      {error && <ErrorState message={error} onRetry={() => navigate(`/search?q=${encodeURIComponent(initialQuery)}`)} />}

      {/* Results view */}
      {data && !loading && !error && (
        <div>
          <div className="section-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
            <div>
              <h2>Results for <span style={{ color: 'var(--primary)' }}>"{data.query || initialQuery}"</span></h2>
            </div>
            <span className="count-pill">{totalResults} total matches</span>
          </div>

          {totalResults === 0 ? (
            <EmptyState title="No matching records found" description={`No diseases, targets, or compounds matched "${initialQuery}". Try searching for TP53, EGFR, or carcinoma.`} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Diseases Group */}
              {diseases.length > 0 && (
                <section>
                  <div className="section-header">
                    <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Activity size={18} color="var(--primary)" /> Diseases ({diseases.length})
                    </h3>
                  </div>
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Disease Name</th>
                        <th>Source</th>
                        <th>Source ID</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {diseases.map((d) => (
                        <tr key={d.id} className="clickable" onClick={() => navigate(`/disease/${d.id}`)}>
                          <td style={{ fontWeight: 600 }}>{d.name}</td>
                          <td><SourceBadge source={d.source} /></td>
                          <td style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--text-muted)' }}>{d.source_id || `ID: ${d.id}`}</td>
                          <td style={{ textAlign: 'right' }}><ChevronRight size={18} color="var(--text-muted)" /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              )}

              {/* Targets Group */}
              {targets.length > 0 && (
                <section>
                  <div className="section-header">
                    <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Target size={18} color="var(--primary)" /> Targets ({targets.length})
                    </h3>
                  </div>
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Symbol</th>
                        <th>Target Name</th>
                        <th>Source</th>
                        <th>Source ID</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {targets.map((t) => (
                        <tr key={t.id} className="clickable" onClick={() => navigate(`/target/${t.id}`)}>
                          <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{t.symbol || '—'}</td>
                          <td style={{ fontWeight: 500 }}>{t.name}</td>
                          <td><SourceBadge source={t.source} /></td>
                          <td style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--text-muted)' }}>{t.source_id || `ID: ${t.id}`}</td>
                          <td style={{ textAlign: 'right' }}><ChevronRight size={18} color="var(--text-muted)" /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              )}

              {/* Compounds Group */}
              {compounds.length > 0 && (
                <section>
                  <div className="section-header">
                    <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Activity size={18} color="var(--primary)" /> Compounds ({compounds.length})
                    </h3>
                  </div>
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Compound Name</th>
                        <th>ChEMBL ID</th>
                        <th>Source</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {compounds.map((c) => (
                        <tr key={c.id} className="clickable" onClick={() => navigate(`/compound/${c.id}`)}>
                          <td style={{ fontWeight: 600 }}>{c.name}</td>
                          <td style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--primary)' }}>{c.chembl_id || `ID: ${c.id}`}</td>
                          <td><SourceBadge source="ChEMBL" /></td>
                          <td style={{ textAlign: 'right' }}><ChevronRight size={18} color="var(--text-muted)" /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
