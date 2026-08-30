import { Beaker, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CompoundCard({ compound }) {
  const navigate = useNavigate();

  return (
    <button
      className="compound-card"
      onClick={() => navigate(`/compound/${compound.compound_id}`)}
    >
      <div className="compound-icon">
        <Beaker size={18} />
      </div>

      <div className="compound-main">
        <strong>Compound {compound.compound_id}</strong>

        <span>
          {compound.activity_type || "Activity"} ·{" "}
          {compound.activity ?? "—"}
        </span>
      </div>

      <span className="source-pill">
        {compound.source || "Evidence"}
      </span>

      <ArrowRight size={17} />
    </button>
  );
}
