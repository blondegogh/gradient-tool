import { useEffect, useRef } from "react";
import { GradientState } from "../App";
import { Stage } from "../App";
import { generateCSSGradient } from "../utils/gradientUtils";

interface GradientPreviewProps {
  gradient: GradientState;
  stage: Stage;
}

// Render mesh/orb gradient onto a canvas
function useMeshCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  gradient: GradientState,
  active: boolean
) {
  useEffect(() => {
    if (!active || gradient.type !== "mesh") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;

    // Background — last stop color or dark
    const bg = gradient.stops[gradient.stops.length - 1]?.color ?? "#0a0a0a";
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Draw each orb as a radial gradient
    gradient.orbs.forEach((orb) => {
      const cx = (orb.x / 100) * w;
      const cy = (orb.y / 100) * h;
      const r = (orb.size / 100) * Math.max(w, h) * 0.8;

      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);

      // Parse hex to rgba
      const hex = orb.color.replace("#", "");
      const ro = parseInt(hex.slice(0, 2), 16);
      const go = parseInt(hex.slice(2, 4), 16);
      const bo = parseInt(hex.slice(4, 6), 16);

      grd.addColorStop(0, `rgba(${ro},${go},${bo},0.85)`);
      grd.addColorStop(0.5, `rgba(${ro},${go},${bo},0.4)`);
      grd.addColorStop(1, `rgba(${ro},${go},${bo},0)`);

      ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);
    });

    ctx.globalCompositeOperation = "source-over";
  }, [gradient, active, canvasRef]);
}

export function GradientPreview({ gradient, stage }: GradientPreviewProps) {
  const cssGradient = generateCSSGradient(gradient);
  const isMesh = gradient.type === "mesh";

  const gradientLayerB = generateCSSGradient({
    ...gradient,
    angle: gradient.type === "linear" ? (gradient.angle + 22) % 360 : gradient.angle,
    radialX: gradient.type === "radial" ? gradient.radialX + 8 : gradient.radialX,
    radialY: gradient.type === "radial" ? gradient.radialY - 6 : gradient.radialY,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const mouseTarget = useRef({ x: 0, y: 0 });
  const mouseCurrent = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);
  const meshCanvasRef = useRef<HTMLCanvasElement>(null);

  useMeshCanvas(meshCanvasRef, gradient, isMesh);

  useEffect(() => {
    const STRENGTH = 12;
    const LERP = 0.028;

    const handleMouse = (e: MouseEvent) => {
      mouseTarget.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      };
    };

    window.addEventListener("mousemove", handleMouse, { passive: true });

    const loop = () => {
      mouseCurrent.current.x += (mouseTarget.current.x * STRENGTH - mouseCurrent.current.x) * LERP;
      mouseCurrent.current.y += (mouseTarget.current.y * STRENGTH - mouseCurrent.current.y) * LERP;
      if (containerRef.current) {
        containerRef.current.style.transform =
          `translate(${mouseCurrent.current.x.toFixed(2)}px, ${mouseCurrent.current.y.toFixed(2)}px)`;
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", handleMouse);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const isVisible = stage !== "hidden";
  const showReadout = stage === "ready";
  const grainOpacity = (gradient.grainIntensity ?? 28) / 100;

  return (
    <>
      <div
        ref={containerRef}
        className="absolute"
        style={{ inset: "-15%", willChange: "transform" }}
      >
        {/* Layer A */}
        {!isMesh && (
          <div
            className="absolute inset-0 gradient-layer-a"
            style={{
              background: cssGradient,
              opacity: isVisible ? 1 : 0,
              transition: "opacity 1.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), background 700ms ease",
            }}
          />
        )}

        {/* Mesh canvas */}
        {isMesh && (
          <canvas
            ref={meshCanvasRef}
            className="absolute inset-0"
            style={{
              width: "100%",
              height: "100%",
              opacity: isVisible ? 1 : 0,
              transition: "opacity 1.4s ease",
            }}
          />
        )}

        {/* Layer B — breath layer, not shown for mesh */}
        {!isMesh && (
          <div
            className="absolute inset-0 gradient-layer-b"
            style={{
              background: gradientLayerB,
              mixBlendMode: "soft-light",
              opacity: 0,
              animation: isVisible
                ? "layerBIntro 3s ease-out 1.5s forwards, layerBBreathe 9s ease-in-out 4s infinite alternate"
                : "none",
            }}
          />
        )}
      </div>

      {/* Settle + drift */}
      <div
        className="absolute"
        style={{
          inset: "-15%",
          animation: isVisible
            ? "gradientSettle 12s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards, gradientDrift 22s ease-in-out 3s infinite alternate"
            : "none",
          pointerEvents: "none",
        }}
      />

      {/* Grain overlay — driven by grainIntensity */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          opacity: grainOpacity,
          transition: "opacity 300ms ease",
        }}
      >
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="discrete" tableValues="0 0.05" />
          </feComponentTransfer>
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>

      {/* CSS readout — stacked, bottom right, desktop only */}
      <div
        className="absolute bottom-6 right-6 max-w-[calc(100%-340px)] hidden md:block"
        style={{
          opacity: showReadout ? 1 : 0,
          transform: showReadout ? "translateY(0)" : "translateY(4px)",
          transition: "opacity 800ms ease, transform 800ms ease",
        }}
      >
        {cssGradient
          .replace("(", "(\n  ")
          .replace(/,\s*/g, ",\n  ")
          .replace(")", "\n)")
          .split("\n")
          .map((line, i) => (
            <div key={i}>
              <code
                className="text-[9px] font-normal"
                style={{
                  color: "rgba(255,255,255,0.18)",
                  letterSpacing: "0.06em",
                  fontFamily: "inherit",
                  whiteSpace: "pre",
                }}
              >
                {line}
              </code>
            </div>
          ))}
      </div>
    </>
  );
}
