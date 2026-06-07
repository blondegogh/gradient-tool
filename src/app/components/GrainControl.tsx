import { GradientState } from "../App";

interface GrainControlProps {
  gradient: GradientState;
  onChange: (g: GradientState) => void;
}

export function GrainControl({ gradient, onChange }: GrainControlProps) {
  const value = gradient.grainIntensity ?? 28;
  return (
    <div
      style={{
        padding: "8px 10px",
        borderRadius: "8px",
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
      }}
    >
      <div className="flex items-center gap-3">
        <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", minWidth: "28px" }}>
          GRAIN
        </span>
        <input
          type="range"
          min="0"
          max="60"
          step="1"
          value={value}
          onChange={(e) => onChange({ ...gradient, grainIntensity: Number(e.target.value) })}
          className="flex-1"
          style={{ accentColor: "rgba(255,255,255,0.6)" }}
        />
        <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.45)", minWidth: "24px", textAlign: "right" }}>
          {value}%
        </span>
      </div>
    </div>
  );
}
