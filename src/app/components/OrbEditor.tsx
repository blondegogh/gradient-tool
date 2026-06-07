import { OrbConfig } from "../App";
import { useState, useRef, useCallback, useEffect } from "react";

interface OrbEditorProps {
  orbs: OrbConfig[];
  onChange: (orbs: OrbConfig[]) => void;
}

function uid() { return Math.random().toString(36).slice(2, 8); }

export function OrbEditor({ orbs, onChange }: OrbEditorProps) {
  const [activeOrb, setActiveOrb] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ index: number } | null>(null);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!dragRef.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    const next = orbs.map((o, i) =>
      i === dragRef.current!.index ? { ...o, x, y } : o
    );
    onChange(next);
  }, [orbs, onChange]);

  const onMouseUp = useCallback(() => {
    dragRef.current = null;
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  }, [onMouseMove]);

  useEffect(() => () => {
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  }, [onMouseMove, onMouseUp]);

  function startDrag(e: React.MouseEvent, index: number) {
    e.preventDefault();
    dragRef.current = { index };
    setActiveOrb(String(index));
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }

  function updateOrb(index: number, updates: Partial<OrbConfig>) {
    onChange(orbs.map((o, i) => i === index ? { ...o, ...updates } : o));
  }

  function addOrb() {
    if (orbs.length >= 4) return;
    onChange([...orbs, { x: 50, y: 50, size: 50, color: "#888888" }]);
  }

  function removeOrb(index: number) {
    if (orbs.length <= 1) return;
    onChange(orbs.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      {/* XY canvas */}
      <div
        ref={canvasRef}
        style={{
          width: "100%",
          height: "80px",
          borderRadius: "6px",
          background: "rgba(0,0,0,0.3)",
          border: "1px solid rgba(255,255,255,0.10)",
          position: "relative",
          overflow: "hidden",
          cursor: "crosshair",
        }}
      >
        {/* Orb previews in canvas */}
        {orbs.map((orb, i) => (
          <div
            key={i}
            onMouseDown={(e) => startDrag(e, i)}
            style={{
              position: "absolute",
              left: `${orb.x}%`,
              top: `${orb.y}%`,
              transform: "translate(-50%, -50%)",
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: orb.color,
              border: activeOrb === String(i)
                ? "2px solid rgba(255,255,255,0.9)"
                : "1.5px solid rgba(255,255,255,0.5)",
              boxShadow: `0 0 12px ${orb.color}88`,
              cursor: "grab",
              zIndex: 2,
              transition: "border 100ms ease",
            }}
          />
        ))}
      </div>

      {/* Orb list */}
      {orbs.map((orb, i) => (
        <div key={i} className="space-y-1">
          <div className="flex items-center gap-2 py-1">
            {/* Color */}
            <div style={{ position: "relative", width: "14px", height: "14px", flexShrink: 0 }}>
              <div style={{
                position: "absolute", inset: 0, borderRadius: "50%",
                background: orb.color,
                border: "1px solid rgba(255,255,255,0.3)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4)",
              }} />
              <input
                type="color"
                value={orb.color}
                onChange={(e) => updateOrb(i, { color: e.target.value })}
                style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" }}
              />
            </div>
            <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.06em" }}>
              ORB {i + 1}
            </span>
            <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.25)", marginLeft: "auto" }}>
              {Math.round(orb.x)}% {Math.round(orb.y)}%
            </span>
            <button
              onClick={() => removeOrb(i)}
              disabled={orbs.length <= 1}
              style={{
                fontSize: "12px", color: "rgba(255,255,255,0.25)",
                background: "transparent", border: "none", cursor: "pointer",
                opacity: orbs.length <= 1 ? 0.2 : 1,
              }}
            >×</button>
          </div>

          {/* Size slider */}
          <div
            style={{
              padding: "6px 10px",
              borderRadius: "6px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div className="flex items-center gap-3">
              <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", minWidth: "28px" }}>
                SIZE
              </span>
              <input
                type="range"
                min="10"
                max="100"
                step="1"
                value={orb.size}
                onChange={(e) => updateOrb(i, { size: Number(e.target.value) })}
                className="flex-1"
                style={{ accentColor: "rgba(255,255,255,0.6)" }}
              />
              <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.45)", minWidth: "24px", textAlign: "right" }}>
                {orb.size}%
              </span>
            </div>
          </div>
        </div>
      ))}

      {orbs.length < 4 && (
        <button
          onClick={addOrb}
          style={{
            fontSize: "10px", color: "rgba(255,255,255,0.35)",
            letterSpacing: "0.08em", background: "transparent",
            border: "none", cursor: "pointer", padding: 0,
            transition: "color 150ms ease",
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.75)"}
          onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}
        >
          + ADD ORB
        </button>
      )}
    </div>
  );
}
