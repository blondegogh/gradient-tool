import { useState } from "react";
import { GradientStop } from "../App";

interface Palette {
  name: string;
  colors: string[];
}

const palettes: Palette[] = [
  { name: "SAKURA",      colors: ["#C8C5C0","#D8B8A8","#D89888","#C88888","#9B7B88","#B8A898","#A8A5A0"] },
  { name: "WABI-SABI",   colors: ["#9AA4C8","#B8AEC8","#CAA8A8","#D88C6A","#E07248"] },
  { name: "SUMI INK",    colors: ["#000B00","#2A2A2A","#727171","#B8B4B0","#F3F3F2"] },
  { name: "SHIZEN",      colors: ["#E5E8E0","#B8C5A8","#8B9B7E","#6B7A5D","#3A4A30"] },
  { name: "NATSU",       colors: ["#1A0A08","#400E08","#890000","#C84020","#C6D780"] },
  { name: "FUYUGESHIKI", colors: ["#07090F","#111C35","#1E3570","#2B4E8F","#8BACC8","#DDD5A8"] },
  { name: "SEIHITSU",    colors: ["#E8E4DF","#D4B5A0","#D4875A","#A06080","#C8B8B0","#E0DCD8"] },
  { name: "AINEZUMI",    colors: ["#16160E","#1A2535","#6C848D","#8A9080","#C8B870","#F5F0E0"] },
];

interface PalettePresetsProps {
  onSelect: (stops: GradientStop[]) => void;
}

export function PalettePresets({ onSelect }: PalettePresetsProps) {
  const [hoveredName, setHoveredName] = useState<string | null>(null);
  const [activeName, setActiveName] = useState<string | null>(null);

  function handleSelect(palette: Palette) {
    setActiveName(palette.name);
    setTimeout(() => setActiveName(null), 800);
    const stops: GradientStop[] = palette.colors.map((color, i) => ({
      id: `${Date.now()}-${i}`,
      color,
      position: (i / (palette.colors.length - 1)) * 100,
      opacity: 1,
    }));
    onSelect(stops);
  }

  return (
    <>
      {/* Keyframe for shine sweep */}
      <style>{`
        @keyframes shineSweep {
          0%   { transform: translateX(-100%) skewX(-20deg); }
          100% { transform: translateX(300%) skewX(-20deg); }
        }
        .palette-shine {
          animation: shineSweep 700ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
        {palettes.map((palette) => {
          const isHovered = hoveredName === palette.name;
          const isActive = activeName === palette.name;

          const gradientCSS = `linear-gradient(to right, ${palette.colors
            .map((c, i) => `${c} ${(i / (palette.colors.length - 1)) * 100}%`)
            .join(", ")})`;

          // Determine label contrast from midpoint color
          const mid = palette.colors[Math.floor(palette.colors.length / 2)].replace("#", "");
          const rm = parseInt(mid.slice(0,2),16);
          const gm = parseInt(mid.slice(2,4),16);
          const bm = parseInt(mid.slice(4,6),16);
          const brightness = (rm * 299 + gm * 587 + bm * 114) / 1000;
          const textColor = brightness > 140 ? "rgba(0,0,0,0.60)" : "rgba(255,255,255,0.80)";
          const textShadow = brightness > 140
            ? "0 1px 2px rgba(255,255,255,0.25)"
            : "0 1px 3px rgba(0,0,0,0.50)";

          return (
            <button
              key={palette.name}
              onClick={() => handleSelect(palette)}
              onMouseEnter={() => setHoveredName(palette.name)}
              onMouseLeave={() => setHoveredName(null)}
              style={{
                width: "96%",
                height: "28px",
                borderRadius: "5px",
                background: gradientCSS,
                border: isActive
                  ? "1px solid rgba(255,255,255,0.45)"
                  : isHovered
                  ? "1px solid rgba(255,255,255,0.22)"
                  : "1px solid rgba(255,255,255,0.08)",
                position: "relative",
                cursor: "pointer",
                overflow: "hidden",
                transform: isHovered ? "translateY(-1px)" : "translateY(0)",
                boxShadow: isHovered
                  ? "0 4px 16px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.18)"
                  : isActive
                  ? "0 2px 12px rgba(255,255,255,0.12), inset 0 1px 0 rgba(255,255,255,0.14)"
                  : "inset 0 1px 0 rgba(255,255,255,0.08)",
                transition: [
                  "transform 180ms cubic-bezier(0.16,1,0.3,1)",
                  "box-shadow 180ms ease",
                  "border-color 180ms ease",
                ].join(", "),
                padding: 0,
              }}
            >
              {/* Shine sweep — plays on click */}
              {isActive && (
                <div
                  className="palette-shine"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "40%",
                    height: "100%",
                    background: "linear-gradient(to right, transparent, rgba(255,255,255,0.45) 50%, transparent)",
                    pointerEvents: "none",
                    zIndex: 3,
                  }}
                />
              )}

              {/* Hover overlay */}
              <div style={{
                position: "absolute",
                inset: 0,
                background: isHovered ? "rgba(255,255,255,0.05)" : "transparent",
                transition: "background 180ms ease",
                zIndex: 1,
              }} />

              {/* Palette name — always visible */}
              <div style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 8px",
                zIndex: 2,
              }}>
                <span style={{
                  fontSize: "8px",
                  letterSpacing: "0.10em",
                  color: textColor,
                  textShadow,
                  fontFamily: "inherit",
                  userSelect: "none",
                }}>
                  {palette.name}
                </span>

                {/* Swatch count hint */}
                <span style={{
                  fontSize: "7px",
                  letterSpacing: "0.06em",
                  color: brightness > 140 ? "rgba(0,0,0,0.30)" : "rgba(255,255,255,0.35)",
                  fontFamily: "inherit",
                  userSelect: "none",
                }}>
                  {palette.colors.length}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}
