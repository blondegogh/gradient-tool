import { GradientStop } from "../App";
import { useState, useRef, useEffect, useCallback } from "react";

interface StopsEditorProps {
  stops: GradientStop[];
  onChange: (stops: GradientStop[]) => void;
}

function uid() { return Math.random().toString(36).slice(2, 8); }

function midColor(a: string, b: string): string {
  const p = (h: string) => [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
  const ca = p(a); const cb = p(b);
  return "#" + ca.map((v,i) => Math.round((v+cb[i])/2).toString(16).padStart(2,"0")).join("");
}

// ── Liquid glass pill handle ──────────────────────────────────────────────────
function Handle({ active, color }: { active: boolean; color: string }) {
  return (
    <div style={{
      width: "6px",
      height: "14px",
      borderRadius: "3px",
      background: active ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.82)",
      border: `1px solid ${active ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.55)"}`,
      boxShadow: active
        ? `inset 0 1px 0 rgba(255,255,255,1), 0 0 0 2.5px ${color}66, 0 3px 10px rgba(0,0,0,0.4)`
        : "inset 0 1px 0 rgba(255,255,255,0.7), 0 1px 4px rgba(0,0,0,0.3)",
      backdropFilter: "blur(6px)",
      WebkitBackdropFilter: "blur(6px)",
      pointerEvents: "none",
      transition: "box-shadow 100ms ease, background 100ms ease",
      flexShrink: 0,
    }} />
  );
}

// ── Liquid glass color picker popup ──────────────────────────────────────────
function ColorPicker({
  stop,
  onUpdate,
  onClose,
}: {
  stop: GradientStop;
  onUpdate: (updates: Partial<GradientStop>) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    setTimeout(() => window.addEventListener("mousedown", handler), 50);
    return () => window.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        left: "calc(100% + 8px)",
        top: "-4px",
        zIndex: 100,
        width: "180px",
        borderRadius: "12px",
        background: "rgba(28, 28, 32, 0.75)",
        backdropFilter: "blur(28px) saturate(180%)",
        WebkitBackdropFilter: "blur(28px) saturate(180%)",
        border: "1px solid rgba(255,255,255,0.14)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18), 0 8px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.3)",
        padding: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      {/* Color preview + native picker */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div style={{
          position: "relative",
          width: "32px",
          height: "32px",
          borderRadius: "8px",
          flexShrink: 0,
          background: stop.color,
          border: "1px solid rgba(255,255,255,0.18)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25), 0 2px 6px rgba(0,0,0,0.3)",
          overflow: "hidden",
        }}>
          <input
            type="color"
            value={stop.color}
            onChange={(e) => onUpdate({ color: e.target.value })}
            style={{ position: "absolute", inset: "-4px", opacity: 0, cursor: "pointer", width: "140%", height: "140%" }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "8px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", marginBottom: "3px" }}>
            HEX
          </div>
          <input
            type="text"
            value={stop.color.toUpperCase()}
            onChange={(e) => {
              const v = e.target.value;
              if (/^#[0-9A-Fa-f]{6}$/.test(v)) onUpdate({ color: v });
              else if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) onUpdate({ color: v });
            }}
            onBlur={() => {
              if (!/^#[0-9A-Fa-f]{6}$/.test(stop.color)) onUpdate({ color: "#888888" });
            }}
            maxLength={7}
            spellCheck={false}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: "5px",
              padding: "4px 6px",
              fontSize: "10px",
              color: "rgba(255,255,255,0.85)",
              letterSpacing: "0.08em",
              fontFamily: "inherit",
              outline: "none",
            }}
          />
        </div>
      </div>

      {/* Opacity slider */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
          <span style={{ fontSize: "8px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em" }}>OPACITY</span>
          <span style={{ fontSize: "8px", color: "rgba(255,255,255,0.55)" }}>{Math.round(stop.opacity * 100)}%</span>
        </div>
        <div style={{
          position: "relative",
          height: "4px",
          borderRadius: "2px",
          background: "rgba(255,255,255,0.12)",
        }}>
          <div style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: "100%",
            width: `${stop.opacity * 100}%`,
            borderRadius: "2px",
            background: "rgba(255,255,255,0.7)",
            transition: "width 60ms ease",
          }} />
          <input
            type="range"
            min={0} max={100} step={1}
            value={Math.round(stop.opacity * 100)}
            onChange={(e) => onUpdate({ opacity: Number(e.target.value) / 100 })}
            style={{
              position: "absolute",
              inset: "-6px 0",
              opacity: 0,
              cursor: "pointer",
              width: "100%",
            }}
          />
        </div>
      </div>

      {/* Position display */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "8px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em" }}>POSITION</span>
        <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.60)" }}>{Math.round(stop.position)}%</span>
      </div>

      {/* Divider */}
      <div style={{ height: "0.5px", background: "rgba(255,255,255,0.08)" }} />

      {/* Done button */}
      <button
        onClick={onClose}
        style={{
          width: "100%",
          padding: "6px",
          borderRadius: "7px",
          background: "rgba(255,255,255,0.10)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15)",
          color: "rgba(255,255,255,0.70)",
          fontSize: "9px",
          letterSpacing: "0.08em",
          cursor: "pointer",
          fontFamily: "inherit",
          transition: "background 120ms ease",
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.16)"}
        onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.10)"}
      >
        DONE
      </button>
    </div>
  );
}

// ── Main StopsEditor ──────────────────────────────────────────────────────────
export function StopsEditor({ stops, onChange }: StopsEditorProps) {
  const [openPickerId, setOpenPickerId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  // ── Use refs for drag state so callbacks are never stale ──────────────────
  const barRef = useRef<HTMLDivElement>(null);
  const stopsRef = useRef(stops);
  const onChangeRef = useRef(onChange);
  const dragIdRef = useRef<string | null>(null);

  // Keep refs in sync every render
  useEffect(() => { stopsRef.current = stops; }, [stops]);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  const getPos = useCallback((clientX: number) => {
    if (!barRef.current) return 0;
    const r = barRef.current.getBoundingClientRect();
    return Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100));
  }, []);

  // Stable event handlers — read from refs, never recreated
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragIdRef.current) return;
    const pos = getPos(e.clientX);
    const id = dragIdRef.current;
    onChangeRef.current(stopsRef.current.map(s => s.id === id ? { ...s, position: pos } : s));
  }, [getPos]);

  const handleMouseUp = useCallback(() => {
    dragIdRef.current = null;
    setActiveId(null);
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!dragIdRef.current) return;
    e.preventDefault();
    const pos = getPos(e.touches[0].clientX);
    const id = dragIdRef.current;
    onChangeRef.current(stopsRef.current.map(s => s.id === id ? { ...s, position: pos } : s));
  }, [getPos]);

  const handleTouchEnd = useCallback(() => {
    dragIdRef.current = null;
    setActiveId(null);
    window.removeEventListener("touchmove", handleTouchMove);
    window.removeEventListener("touchend", handleTouchEnd);
  }, [handleTouchMove]);

  function startDrag(e: React.MouseEvent, id: string) {
    e.preventDefault();
    e.stopPropagation();
    dragIdRef.current = id;
    setActiveId(id);
    setOpenPickerId(null);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }

  function startTouchDrag(e: React.TouchEvent, id: string) {
    e.stopPropagation();
    dragIdRef.current = id;
    setActiveId(id);
    setOpenPickerId(null);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);
  }

  useEffect(() => () => {
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
    window.removeEventListener("touchmove", handleTouchMove);
    window.removeEventListener("touchend", handleTouchEnd);
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  function handleBarClick(e: React.MouseEvent<HTMLDivElement>) {
    if (dragIdRef.current) return;
    const pos = getPos(e.clientX);
    const sorted = [...stops].sort((a,b) => a.position - b.position);
    const before = [...sorted].reverse().find(s => s.position <= pos);
    const after = sorted.find(s => s.position >= pos);
    const color = before && after && before.id !== after.id
      ? midColor(before.color, after.color)
      : before?.color ?? after?.color ?? "#888888";
    onChange([...stops, { id: uid(), color, position: pos, opacity: 1 }]
      .sort((a,b) => a.position - b.position));
  }

  function updateStop(id: string, updates: Partial<GradientStop>) {
    onChange(stops.map(s => s.id === id ? { ...s, ...updates } : s));
  }

  function removeStop(id: string) {
    if (stops.length > 2) {
      onChange(stops.filter(s => s.id !== id));
      if (openPickerId === id) setOpenPickerId(null);
    }
  }

  function addStop() {
    const sorted = [...stops].sort((a,b) => a.position - b.position);
    const last = sorted[sorted.length - 1];
    const prev = sorted[sorted.length - 2];
    const position = prev ? (prev.position + last.position) / 2 : 50;
    const color = prev ? midColor(prev.color, last.color) : "#888888";
    onChange([...stops, { id: uid(), color, position, opacity: 1 }]
      .sort((a,b) => a.position - b.position));
  }

  const sorted = [...stops].sort((a,b) => a.position - b.position);
  const barGradient = `linear-gradient(to right, ${sorted.map(s => `${s.color} ${s.position}%`).join(", ")})`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

      {/* Gradient bar + handles */}
      <div style={{ paddingTop: "12px", paddingBottom: "12px" }}>
        <div
          ref={barRef}
          onClick={handleBarClick}
          style={{
            height: "4px",
            borderRadius: "2px",
            background: barGradient,
            position: "relative",
            cursor: "crosshair",
          }}
        >
          {sorted.map((stop) => (
            <div
              key={stop.id}
              style={{
                position: "absolute",
                left: `${stop.position}%`,
                top: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: activeId === stop.id ? 20 : 2,
                cursor: "grab",
                padding: "6px 4px", // larger hit area than visual
                boxSizing: "content-box",
              }}
              onMouseDown={(e) => startDrag(e, stop.id)}
              onTouchStart={(e) => startTouchDrag(e, stop.id)}
            >
              <Handle active={activeId === stop.id} color={stop.color} />
            </div>
          ))}
        </div>
      </div>

      {/* Stop rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        {sorted.map((stop) => (
          <div key={stop.id} style={{ position: "relative" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "5px 6px",
                borderRadius: "7px",
                background: openPickerId === stop.id
                  ? "rgba(255,255,255,0.07)"
                  : "transparent",
                transition: "background 150ms ease",
              }}
            >
              {/* Swatch — opens picker */}
              <button
                onClick={() => setOpenPickerId(openPickerId === stop.id ? null : stop.id)}
                style={{
                  position: "relative",
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  background: stop.color,
                  border: openPickerId === stop.id
                    ? "1.5px solid rgba(255,255,255,0.7)"
                    : "1px solid rgba(255,255,255,0.25)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 1px 3px rgba(0,0,0,0.25)",
                  cursor: "pointer",
                  flexShrink: 0,
                  transition: "border 120ms ease, transform 120ms ease",
                  transform: openPickerId === stop.id ? "scale(1.15)" : "scale(1)",
                }}
              />

              {/* Hex display */}
              <span style={{
                flex: 1,
                fontSize: "10px",
                color: "rgba(255,255,255,0.65)",
                letterSpacing: "0.08em",
                fontFamily: "inherit",
                cursor: "default",
              }}>
                {stop.color.toUpperCase()}
              </span>

              {/* Position */}
              <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.28)", minWidth: "22px", textAlign: "right" }}>
                {Math.round(stop.position)}%
              </span>

              {/* Remove */}
              <button
                onClick={() => removeStop(stop.id)}
                disabled={stops.length <= 2}
                style={{
                  fontSize: "13px",
                  lineHeight: 1,
                  color: "rgba(255,255,255,0.22)",
                  background: "transparent",
                  border: "none",
                  cursor: stops.length <= 2 ? "default" : "pointer",
                  opacity: stops.length <= 2 ? 0.15 : 1,
                  padding: "0 2px",
                  transition: "color 120ms ease",
                }}
                onMouseEnter={(e) => { if (stops.length > 2) e.currentTarget.style.color = "rgba(255,90,90,0.75)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.22)"; }}
              >
                ×
              </button>
            </div>

            {/* Color picker popup */}
            {openPickerId === stop.id && (
              <ColorPicker
                stop={stop}
                onUpdate={(u) => updateStop(stop.id, u)}
                onClose={() => setOpenPickerId(null)}
              />
            )}
          </div>
        ))}
      </div>

      <button
        onClick={addStop}
        style={{
          fontSize: "10px",
          color: "rgba(255,255,255,0.30)",
          letterSpacing: "0.08em",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: 0,
          textAlign: "left",
          transition: "color 150ms ease",
          fontFamily: "inherit",
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.75)"}
        onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.30)"}
      >
        + ADD STOP
      </button>
    </div>
  );
}
