import { useState, useEffect } from "react";
import { GradientControls } from "./components/GradientControls";
import { GradientPreview } from "./components/GradientPreview";

export type GradientType = "linear" | "radial" | "mesh";

export interface GradientStop {
  id: string;
  color: string;
  position: number;
  opacity: number;
}

export interface OrbConfig {
  x: number;   // 0-100
  y: number;   // 0-100
  size: number; // 0-100
  color: string;
}

export interface GradientState {
  type: GradientType;
  stops: GradientStop[];
  angle: number;
  radialX: number;
  radialY: number;
  grainIntensity: number; // 0-100
  orbs: OrbConfig[];
}

export interface SavedGradient {
  id: string;
  name: string;
  gradient: GradientState;
  savedAt: number;
}

export type Stage = "hidden" | "gradient" | "sidebar" | "content" | "ready";

const initialStops: GradientStop[] = [
  { id: "1", color: "#C8C5C0", position: 0,   opacity: 1 },
  { id: "2", color: "#D8B8A8", position: 20,  opacity: 1 },
  { id: "3", color: "#D89888", position: 40,  opacity: 1 },
  { id: "4", color: "#C88888", position: 50,  opacity: 1 },
  { id: "5", color: "#9B7B88", position: 65,  opacity: 1 },
  { id: "6", color: "#B8A898", position: 85,  opacity: 1 },
  { id: "7", color: "#A8A5A0", position: 100, opacity: 1 },
];

const initialOrbs: OrbConfig[] = [
  { x: 30, y: 40, size: 60, color: "#D89888" },
  { x: 70, y: 60, size: 50, color: "#9B7B88" },
];

function loadSaved(): SavedGradient[] {
  try {
    return JSON.parse(localStorage.getItem("jgb-saved") ?? "[]");
  } catch { return []; }
}

function persistSaved(saved: SavedGradient[]) {
  localStorage.setItem("jgb-saved", JSON.stringify(saved.slice(0, 12)));
}

export default function App() {
  const [gradient, setGradient] = useState<GradientState>({
    type: "linear",
    stops: initialStops,
    angle: 180,
    radialX: 50,
    radialY: 50,
    grainIntensity: 28,
    orbs: initialOrbs,
  });

  const [stage, setStage] = useState<Stage>("hidden");
  const [saved, setSaved] = useState<SavedGradient[]>(loadSaved);

  useEffect(() => {
    const t1 = setTimeout(() => setStage("gradient"), 50);
    const t2 = setTimeout(() => setStage("sidebar"),  900);
    const t3 = setTimeout(() => setStage("content"),  1400);
    const t4 = setTimeout(() => setStage("ready"),    2200);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, []);

  function saveGradient() {
    const entry: SavedGradient = {
      id: Math.random().toString(36).slice(2),
      name: `GRADIENT ${saved.length + 1}`,
      gradient: { ...gradient },
      savedAt: Date.now(),
    };
    const next = [entry, ...saved].slice(0, 12);
    setSaved(next);
    persistSaved(next);
  }

  function deleteSaved(id: string) {
    const next = saved.filter((s) => s.id !== id);
    setSaved(next);
    persistSaved(next);
  }

  function loadSavedGradient(g: GradientState) {
    setGradient(g);
  }

  return (
    <div className="size-full relative overflow-hidden bg-black">
      <GradientPreview gradient={gradient} stage={stage} />
      <GradientControls
        gradient={gradient}
        onChange={setGradient}
        stage={stage}
        saved={saved}
        onSave={saveGradient}
        onDeleteSaved={deleteSaved}
        onLoadSaved={loadSavedGradient}
      />
    </div>
  );
}
