import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Dna,
  FlaskConical,
  FileText,
  Network,
  Target,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { getDisease } from "../api/client";
import Loading from "../components/Loading";
import StatCard from "../components/StatCard";

export default function DiseaseDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const result = await getDisease(id);

        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load disease.");
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
  }, [id]);

  const disease = data?.disease;
  const targets = Array.isArray(data?.targets) ? data.targets : [];

  const averageScore = useMemo(() => {
    if (!targets.length) return 0;

    return Math.round(
      (targets.reduce(
        (sum, target) => sum + Number(target.score || 0),
        0
      ) /
        targets.length) *
        100
    );
  }, [targets]);

  const sources = new Set(
    targets.map((target) => target.relationship_source).filter(Boolean)
  ).size;

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
          <h2>Could not load disease</h2>
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
      <div className="breadcrumbs">
        Home <span>›</span> Diseases <span>›</span>{" "}
        {disease?.name || `Disease ${id}`}
      </div>

      <section className="disease-heading">
        <div>
          <div className="entity-icon">
            <Dna />
          </div>

          <div>
            <div className="eyebrow">DISEASE PROFILE</div>

            <h1>
              {disease?.name || `Disease ${id}`}
              <span className="badge">ID {disease?.id}</span>
            </h1>

            <p>
              Explore biological targets and evidence associated with this
              disease.
            </p>

            <div className="entity-meta">
              <span>
                Source: <strong>{disease?.source || "—"}</strong>
              </span>

              <span>
                Source ID: <strong>{disease?.source_id || "—"}</strong>
              </span>
            </div>
          </div>
        </div>

        <button
          className="outline-button"
          onClick={() => navigate(`/disease/${id}/targets`)}
        >
          Explore targets
          <ArrowRight size={16} />
        </button>
      </section>

      <div className="stats-grid">
        <StatCard
          icon={<Network />}
          label="Relevance Score"
          value={`${averageScore}/100`}
          description="Average target evidence"
        />

        <StatCard
          icon={<Target />}
          label="Targets Identified"
          value={targets.length}
          description="Associated targets"
        />

        <StatCard
          icon={<FlaskConical />}
          label="Evidence Records"
          value={targets.length}
          description="Disease-target relationships"
        />

        <StatCard
          icon={<FileText />}
          label="Sources"
          value={sources}
          description="Relationship sources"
        />
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <div className="eyebrow">BIOLOGICAL CONNECTIONS</div>
              <h2>Targets associated with {disease?.name}</h2>
            </div>

            <span className="count-badge">
              {targets.length}
            </span>
          </div>

          <div className="target-list">
            {targets.map((target) => (
              <button
                key={target.id}
                className="target-row"
                onClick={() => navigate(`/target/${target.id}`)}
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
                    {Math.round(Number(target.score || 0) * 100)}
                  </strong>
                </div>

                <ArrowRight size={16} />
              </button>
            ))}

            {!targets.length && (
              <div className="empty-state">
                <Target size={30} />
                <h3>No targets found</h3>
                <p>
                  This disease has no target relationships returned by
                  the backend.
                </p>
              </div>
            )}
          </div>
        </section>

        <aside className="panel overview-panel">
          <div className="eyebrow">DISEASE INFORMATION</div>

          <h2>Profile</h2>

          <div className="summary-row">
            <span>Name</span>
            <strong>{disease?.name || "—"}</strong>
          </div>

          <div className="summary-row">
            <span>Database</span>
            <strong>{disease?.source || "—"}</strong>
          </div>

          <div className="summary-row">
            <span>Source ID</span>
            <strong>{disease?.source_id || "—"}</strong>
          </div>

          <div className="summary-row">
            <span>Organ ID</span>
            <strong>{disease?.organ_id ?? "—"}</strong>
          </div>

          <button
            className="primary-button full-width"
            onClick={() => navigate(`/disease/${id}/targets`)}
          >
            View all targets
            <ArrowRight size={16} />
          </button>
        </aside>
      </div>
    </main>
  );
}
