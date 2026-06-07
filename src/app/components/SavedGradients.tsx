import { useRef, useEffect } from "react";
import { SavedGradient, GradientState } from "../App";
import { generateCSSGradient } from "../utils/gradientUtils";

interface SavedGradientsProps {
  saved: SavedGradient[];
  onLoad: (g: GradientState) => void;
  onDelete: (id: string) => void;
  onSave: () => void;
}

function MiniSwatch({ gradient }: { gradient: GradientState }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 64;
    canvas.height = 40;

    const sorted = [...gradient.stops].sort((a, b) => a.position - b.position);

    if (gradient.type === "mesh" && gradient.orbs?.length) {
      // Draw orbs
      const bg = sorted[sorted.length - 1]?.color ?? "#0a0a0a";
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 64, 40);
      gradient.orbs.forEach((orb) => {
        const cx = (orb.x / 100) * 64;
        const cy = (orb.y / 100) * 40;
        const r = (orb.size / 100) * 40;
        const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        const hex = orb.color.replace("#", "");
        const ro = parseInt(hex.slice(0,2),16);
        const go = parseInt(hex.slice(2,4),16);
        const bo = parseInt(hex.slice(4,6),16);
        grd.addColorStop(0, `rgba(${ro},${go},${bo},0.9)`);
        grd.addColorStop(1, `rgba(${ro},${go},${bo},0)`);
        ctx.globalCompositeOperation = "screen";
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, 64, 40);
      });
      ctx.globalCompositeOperation = "source-over";
    } else {
      const grd = gradient.type === "radial"
        ? ctx.createRadialGradient(32, 20, 0, 32, 20, 40)
        : ctx.createLinearGradient(0, 0, 64, 0);
      sorted.forEach(s => {
        const hex = s.color.replace("#", "");
        const r = parseInt(hex.slice(0,2),16);
        const g = parseInt(hex.slice(2,4),16);
        const b = parseInt(hex.slice(4,6),16);
        grd.addColorStop(
          Math.max(0, Math.min(1, s.position / 100)),
          `rgba(${r},${g},${b},${s.opacity})`
        );
      });
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, 64, 40);
    }
  }, [gradient]);

  return (
    <canvas
      ref={canvasRef}
      width={64}
      height={40}
      style={{ width: "32px", height: "20px", borderRadius: "3px", display: "block" }}
    />
  );
}

export function SavedGradients({ saved, onLoad, onDelete, onSave }: SavedGradientsProps) {
  return (
    <div className="space-y-2">
      {/* Save current */}
      <button
        onClick={onSave}
        style={{
          fontSize: "10px",
          color: "rgba(255,255,255,0.40)",
          letterSpacing: "0.08em",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: "5px",
          cursor: "pointer",
          padding: "5px 10px",
          width: "100%",
          textAlign: "left",
          transition: "background 150ms ease, color 150ms ease",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.10)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.10)";
          e.currentTarget.style.color = "rgba(255,255,255,0.80)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.06)";
          e.currentTarget.style.color = "rgba(255,255,255,0.40)";
        }}
      >
        + SAVE CURRENT
      </button>

      {saved.length === 0 && (
        <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.20)", letterSpacing: "0.06em", paddingTop: "4px" }}>
          NO SAVED GRADIENTS
        </div>
      )}

      {/* Grid of saved swatches */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px" }}>
        {saved.map((s) => (
          <div key={s.id} style={{ position: "relative" }}>
            <button
              onClick={() => onLoad(s.gradient)}
              title={s.name}
              style={{
                width: "100%",
                padding: 0,
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: "4px",
                cursor: "pointer",
                overflow: "hidden",
                transition: "border-color 150ms ease",
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)"}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)"}
            >
              <MiniSwatch gradient={s.gradient} />
            </button>
            {/* Delete */}
            <button
              onClick={() => onDelete(s.id)}
              style={{
                position: "absolute",
                top: "-4px",
                right: "-4px",
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: "rgba(0,0,0,0.6)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "rgba(255,255,255,0.5)",
                fontSize: "8px",
                lineHeight: 1,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: 0,
                transition: "opacity 150ms ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "1";
                e.currentTarget.style.color = "rgba(255,100,100,0.9)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "0";
              }}
              onFocus={(e) => e.currentTarget.style.opacity = "1"}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
