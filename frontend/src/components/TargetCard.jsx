import { ArrowRight, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TargetCard({ target }) {
  const navigate = useNavigate();

  const score = Number(target.score || 0);
  const percentage = Math.round(score * 100);

  function openTarget() {
    navigate(`/target/${target.target_id}`);
  }

  return (
    <button className="target-card" onClick={openTarget}>
      <div className="target-icon">
        <Target size={18} />
      </div>

      <div className="target-main">
        <strong>Target {target.target_id}</strong>

        <span>
          Biological target associated with this disease
        </span>
      </div>

      <div className="target-score">
        <small>Evidence</small>
        <strong>{percentage}</strong>
      </div>

      <ArrowRight size={17} />
    </button>
  );
}
