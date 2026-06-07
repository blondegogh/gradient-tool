import { GradientType } from "../App";

interface TypeToggleProps {
  value: GradientType;
  onChange: (type: GradientType) => void;
}

export function TypeToggle({ value, onChange }: TypeToggleProps) {
  const types: GradientType[] = ["linear", "radial", "mesh"];

  return (
    <div className="flex gap-4">
      {types.map((type) => (
        <button
          key={type}
          onClick={() => onChange(type)}
          className="text-[12px] font-normal uppercase transition-colors"
          style={{
            color: value === type ? 'rgba(255, 255, 255, 0.90)' : 'rgba(255, 255, 255, 0.35)',
            letterSpacing: '0.06em',
            borderBottom: value === type ? '1px solid rgba(255, 255, 255, 0.90)' : 'none',
            paddingBottom: '2px',
            fontWeight: value === type ? 500 : 400
          }}
        >
          {type}
        </button>
      ))}
    </div>
  );
}
