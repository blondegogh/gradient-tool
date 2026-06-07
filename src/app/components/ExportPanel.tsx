import { useState } from "react";
import { GradientState } from "../App";
import { generateCSSGradient, generateSVGGradient, generateJSON } from "../utils/gradientUtils";

interface ExportPanelProps {
  gradient: GradientState;
}

type Format = "css" | "svg" | "png" | "json";
type Status = "idle" | "copied" | "downloading" | "done" | "error";

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function buildPNGFromGradient(gradient: GradientState): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = 2400;
    canvas.height = 1600;
    const ctx = canvas.getContext("2d");
    if (!ctx) { reject(new Error("No canvas context")); return; }

    const sortedStops = [...gradient.stops].sort((a, b) => a.position - b.position);

    let grd: CanvasGradient;

    if (gradient.type === "radial") {
      const cx = canvas.width * (gradient.radialX / 100);
      const cy = canvas.height * (gradient.radialY / 100);
      const r = Math.max(canvas.width, canvas.height);
      grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    } else {
      // Convert CSS angle to canvas x1/y1 x2/y2
      const angle = ((gradient.angle - 90) * Math.PI) / 180;
      const x1 = canvas.width / 2 - Math.cos(angle) * canvas.width;
      const y1 = canvas.height / 2 - Math.sin(angle) * canvas.height;
      const x2 = canvas.width / 2 + Math.cos(angle) * canvas.width;
      const y2 = canvas.height / 2 + Math.sin(angle) * canvas.height;
      grd = ctx.createLinearGradient(x1, y1, x2, y2);
    }

    sortedStops.forEach((stop) => {
      const alpha = stop.opacity ?? 1;
      // Parse hex to rgba for canvas
      const r = parseInt(stop.color.slice(1, 3), 16);
      const g = parseInt(stop.color.slice(3, 5), 16);
      const b = parseInt(stop.color.slice(5, 7), 16);
      grd.addColorStop(
        Math.max(0, Math.min(1, stop.position / 100)),
        `rgba(${r},${g},${b},${alpha})`
      );
    });

    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Canvas toBlob failed"));
    }, "image/png");
  });
}

export function ExportPanel({ gradient }: ExportPanelProps) {
  const [statuses, setStatuses] = useState<Record<Format, Status>>({
    css: "idle", svg: "idle", png: "idle", json: "idle",
  });

  function setStatus(format: Format, status: Status) {
    setStatuses((prev) => ({ ...prev, [format]: status }));
  }

  async function handleExport(format: Format) {
    if (statuses[format] !== "idle") return;

    try {
      switch (format) {
        case "css": {
          const css = `background: ${generateCSSGradient(gradient)};`;
          await navigator.clipboard.writeText(css);
          setStatus("css", "copied");
          setTimeout(() => setStatus("css", "idle"), 2000);
          break;
        }
        case "svg": {
          setStatus("svg", "downloading");
          const svg = generateSVGGradient(gradient);
          const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
          triggerDownload(blob, "gradient.svg");
          setStatus("svg", "done");
          setTimeout(() => setStatus("svg", "idle"), 2000);
          break;
        }
        case "png": {
          setStatus("png", "downloading");
          const blob = await buildPNGFromGradient(gradient);
          triggerDownload(blob, "gradient.png");
          setStatus("png", "done");
          setTimeout(() => setStatus("png", "idle"), 2000);
          break;
        }
        case "json": {
          setStatus("json", "downloading");
          const json = generateJSON(gradient);
          const blob = new Blob([json], { type: "application/json" });
          triggerDownload(blob, "gradient.json");
          setStatus("json", "done");
          setTimeout(() => setStatus("json", "idle"), 2000);
          break;
        }
      }
    } catch {
      setStatus(format, "error");
      setTimeout(() => setStatus(format, "idle"), 2000);
    }
  }

  function label(format: Format): string {
    const s = statuses[format];
    if (format === "css") {
      if (s === "copied") return "COPIED";
      if (s === "error") return "ERROR";
      return "CSS";
    }
    if (s === "downloading") return format.toUpperCase() + " ...";
    if (s === "done") return format.toUpperCase() + " ✓";
    if (s === "error") return "ERROR";
    return format.toUpperCase();
  }

  const formats: Format[] = ["css", "svg", "png", "json"];

  return (
    <div
      className="flex items-center gap-2 text-[12px] font-normal uppercase"
      style={{ letterSpacing: "0.06em" }}
    >
      {formats.map((fmt, i) => (
        <span key={fmt} className="flex items-center gap-2">
          <button
            onClick={() => handleExport(fmt)}
            style={{
              color: statuses[fmt] !== "idle"
                ? "rgba(255,255,255,0.90)"
                : "rgba(255,255,255,0.50)",
              background: "transparent",
              border: "none",
              cursor: statuses[fmt] !== "idle" ? "default" : "pointer",
              padding: 0,
              transition: "color 150ms ease",
            }}
            onMouseEnter={(e) => {
              if (statuses[fmt] === "idle")
                e.currentTarget.style.color = "rgba(255,255,255,0.90)";
            }}
            onMouseLeave={(e) => {
              if (statuses[fmt] === "idle")
                e.currentTarget.style.color = "rgba(255,255,255,0.50)";
            }}
          >
            {label(fmt)}
          </button>
          {i < formats.length - 1 && (
            <span style={{ color: "rgba(255,255,255,0.20)" }}>|</span>
          )}
        </span>
      ))}
    </div>
  );
}
