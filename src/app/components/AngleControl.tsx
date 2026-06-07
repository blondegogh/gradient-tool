import { GradientState } from "../App";

interface AngleControlProps {
  gradient: GradientState;
  onChange: (gradient: GradientState) => void;
}

export function AngleControl({ gradient, onChange }: AngleControlProps) {
  if (gradient.type !== "linear") {
    return null;
  }

  return (
    <div className="flex items-center justify-between">
      <input
        type="number"
        min="0"
        max="360"
        value={gradient.angle}
        onChange={(e) =>
          onChange({ ...gradient, angle: Number(e.target.value) })
        }
        className="bg-transparent border-none outline-none text-[12px] font-normal w-full text-right"
        style={{ color: 'rgba(255, 255, 255, 0.90)', letterSpacing: '0.06em', fontWeight: 500 }}
      />
      <span className="text-[12px] font-normal ml-1" style={{ color: 'rgba(255, 255, 255, 0.90)', letterSpacing: '0.06em', fontWeight: 500 }}>
        °
      </span>
    </div>
  );
}
