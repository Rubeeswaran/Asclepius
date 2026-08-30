import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Network,
  Search,
  Target,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { getDisease } from "../api/client";
import Loading from "../components/Loading";

export default function Targets() {
  const { diseaseId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);

        const result = await getDisease(diseaseId);

        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load targets.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [diseaseId]);

  const disease = data?.disease;

  const targets = Array.isArray(data?.targets)
    ? data.targets
    : [];

  const filteredTargets = useMemo(() => {
    const query = filter.trim().toLowerCase();

    if (!query) return targets;

    return targets.filter((target) =>
      `${target.name} ${target.symbol} ${target.id}`
        .toLowerCase()
        .includes(query)
    );
  }, [targets, filter]);

  if (loading) {
    return (
      <main className="page">
        <Loading />
      </main>
    );
  }

  if (error) {
    return (
      <main className="page">
        <div className="error-box">
          <h2>Unable to load targets</h2>
          <p>{error}</p>

          <button
            className="primary-button"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <button
        className="back-button"
        onClick={() => navigate(`/disease/${diseaseId}`)}
      >
        <ArrowLeft size={16} />
        Back to disease
      </button>

      <section className="page-header">
        <div>
          <div className="eyebrow">DISEASE → TARGET</div>

          <h1>Targets & Components</h1>

          <p>
            Molecular targets associated with{" "}
            <strong>{disease?.name || `Disease #${diseaseId}`}</strong>.
          </p>
        </div>

        <div className="header-stat">
          <Target size={18} />
          <span>{targets.length} targets</span>
        </div>
      </section>

      <section className="target-layout">
        <div className="panel network-panel">
          <div className="panel-header">
            <div>
              <div className="eyebrow">KNOWLEDGE GRAPH</div>
              <h2>Target relationships</h2>
            </div>
          </div>

          <div className="graph-area">
            <div className="graph-center">
              <Network size={30} />
              <span>{disease?.name || "Disease"}</span>
              <strong>#{diseaseId}</strong>
            </div>

            {filteredTargets.slice(0, 12).map((target, index) => {
              const count = Math.min(filteredTargets.length, 12);

              const angle =
                (index / Math.max(count, 1)) *
                  Math.PI *
                  2 -
                Math.PI / 2;

              const x = 50 + Math.cos(angle) * 35;
              const y = 50 + Math.sin(angle) * 35;

              return (
                <button
                  key={target.id}
                  className="graph-node"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                  }}
                  onClick={() =>
                    navigate(`/targets/${target.id}`)
                  }
                >
                  <Target size={14} />

                  <span>
                    {target.symbol || target.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <section className="panel">
          <div className="panel-header">
            <div>
              <div className="eyebrow">TARGETS</div>
              <h2>Associated targets</h2>
            </div>

            <span className="count-badge">
              {filteredTargets.length}
            </span>
          </div>

          <div className="search-mini">
            <Search size={16} />

            <input
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              placeholder="Filter targets..."
            />
          </div>

          <div className="target-list">
            {filteredTargets.map((target) => (
              <button
                key={target.id}
                className="target-row"
                onClick={() =>
                  navigate(`/targets/${target.id}`)
                }
              >
                <div className="target-row-icon">
                  <Target size={18} />
                </div>

                <div className="target-row-content">
                  <strong>{target.name}</strong>

                  <span>
                    {target.symbol} · Target #{target.id}
                  </span>
                </div>

                <div className="target-score">
                  <span>Evidence</span>

                  <strong>
                    {Math.round(
                      Number(target.score || 0) * 100
                    )}
                  </strong>
                </div>

                <ArrowRight size={16} />
              </button>
            ))}

            {!filteredTargets.length && (
              <div className="empty-state compact">
                <Target size={26} />
                <h3>No targets found</h3>
                <p>Try a different target search.</p>
              </div>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
