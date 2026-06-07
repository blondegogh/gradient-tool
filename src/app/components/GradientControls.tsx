import { useState, useRef, useEffect } from "react";
import { GradientState, SavedGradient } from "../App";
import { Stage } from "../App";
import { TypeToggle } from "./TypeToggle";
import { PalettePresets } from "./PalettePresets";
import { StopsEditor } from "./StopsEditor";
import { OrbEditor } from "./OrbEditor";
import { AngleControl } from "./AngleControl";
import { GrainControl } from "./GrainControl";
import { SavedGradients } from "./SavedGradients";
import { ExportPanel } from "./ExportPanel";
import { generateCSSGradient } from "../utils/gradientUtils";

interface GradientControlsProps {
  gradient: GradientState;
  onChange: (gradient: GradientState) => void;
  stage: Stage;
  saved: SavedGradient[];
  onSave: () => void;
  onDeleteSaved: (id: string) => void;
  onLoadSaved: (g: GradientState) => void;
}

const SL = { color: "rgba(255,255,255,0.45)", letterSpacing: "0.06em" } as const;
const DIV = { borderColor: "rgba(255,255,255,0.10)", borderWidth: "0.5px" } as const;

interface SectionProps {
  label: string;
  children: React.ReactNode;
  delay: number;
  stage: Stage;
}

function Section({ label, children, delay, stage }: SectionProps) {
  const visible = stage === "content" || stage === "ready";
  return (
    <div
      className="border-t pb-5"
      style={{
        ...DIV,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
        transition: `opacity 500ms ease ${delay}ms, transform 500ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      <div className="text-[9px] uppercase mt-5 mb-3" style={{ color: SL.color, letterSpacing: SL.letterSpacing }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function useIsMobile() {
  const [m, setM] = useState(false);
  useEffect(() => {
    const check = () => setM(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return m;
}

function ControlsContent({
  gradient, onChange, stage, cssGradient, footerVisible, sidebarVisible,
  saved, onSave, onDeleteSaved, onLoadSaved,
}: {
  gradient: GradientState;
  onChange: (g: GradientState) => void;
  stage: Stage;
  cssGradient: string;
  footerVisible: boolean;
  sidebarVisible: boolean;
  saved: SavedGradient[];
  onSave: () => void;
  onDeleteSaved: (id: string) => void;
  onLoadSaved: (g: GradientState) => void;
}) {
  return (
    <>
      <div className="flex-1 overflow-y-auto scrollbar-hide px-5 pt-7 pb-5">
        <div>

          {/* Gradient type */}
          <div
            className="pb-5"
            style={{
              opacity: sidebarVisible ? 1 : 0,
              transform: sidebarVisible ? "translateY(0)" : "translateY(8px)",
              transition: "opacity 500ms ease 100ms, transform 500ms cubic-bezier(0.16,1,0.3,1) 100ms",
            }}
          >
            <div className="text-[9px] uppercase mb-3" style={{ color: SL.color, letterSpacing: SL.letterSpacing }}>
              ² GRADIENT TYPE /
            </div>
            <TypeToggle value={gradient.type} onChange={(type) => onChange({ ...gradient, type })} />
          </div>

          <Section label="² PALETTE PRESETS /" delay={80} stage={stage}>
            <PalettePresets onSelect={(stops) => onChange({ ...gradient, stops })} />
          </Section>

          {/* Stops or Orbs depending on type */}
          {gradient.type !== "mesh" ? (
            <Section label="² GRADIENT STOPS /" delay={160} stage={stage}>
              <StopsEditor stops={gradient.stops} onChange={(stops) => onChange({ ...gradient, stops })} />
            </Section>
          ) : (
            <Section label="² ORB LAYERS /" delay={160} stage={stage}>
              <OrbEditor orbs={gradient.orbs ?? []} onChange={(orbs) => onChange({ ...gradient, orbs })} />
            </Section>
          )}

          {/* Angle — linear only */}
          {gradient.type === "linear" && (
            <Section label="² ANGLE /" delay={240} stage={stage}>
              <AngleControl gradient={gradient} onChange={onChange} />
            </Section>
          )}

          {/* Grain */}
          <Section label="² TEXTURE /" delay={280} stage={stage}>
            <GrainControl gradient={gradient} onChange={onChange} />
          </Section>

          {/* Saved */}
          <Section label="² SAVED /" delay={320} stage={stage}>
            <SavedGradients
              saved={saved}
              onLoad={onLoadSaved}
              onDelete={onDeleteSaved}
              onSave={onSave}
            />
          </Section>

          {/* Export */}
          <Section label="² EXPORT /" delay={360} stage={stage}>
            <ExportPanel gradient={gradient} />
          </Section>

          {/* CSS readout */}
          <div
            className="border-t pt-4"
            style={{
              ...DIV,
              opacity: footerVisible ? 1 : 0,
              transition: "opacity 800ms ease 400ms",
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
                    style={{
                      fontSize: "9px",
                      color: "rgba(255,255,255,0.35)",
                      letterSpacing: "0.04em",
                      fontFamily: "inherit",
                      whiteSpace: "pre",
                    }}
                  >
                    {line}
                  </code>
                </div>
              ))}
          </div>

        </div>
      </div>

      {/* Footer */}
      <div
        className="px-5 pb-5 pt-3"
        style={{
          opacity: footerVisible ? 1 : 0,
          transform: footerVisible ? "translateY(0)" : "translateY(4px)",
          transition: "opacity 600ms ease 600ms, transform 600ms ease 600ms",
          flexShrink: 0,
        }}
      >
        <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.20)", letterSpacing: "0.06em", lineHeight: 1.6 }}>
          JAPANESE GRADIENT BUILDER<br />
          [ TOOL ] / DOMINO NY
        </div>
      </div>
    </>
  );
}

// ── Mobile bottom sheet ───────────────────────────────────────────────────────
function BottomSheet(props: {
  gradient: GradientState;
  onChange: (g: GradientState) => void;
  stage: Stage;
  cssGradient: string;
  saved: SavedGradient[];
  onSave: () => void;
  onDeleteSaved: (id: string) => void;
  onLoadSaved: (g: GradientState) => void;
}) {
  const [open, setOpen] = useState(false);
  const [dragDelta, setDragDelta] = useState(0);
  const dragStartY = useRef(0);
  const isDragging = useRef(false);

  const sidebarVisible = props.stage === "sidebar" || props.stage === "content" || props.stage === "ready";
  const footerVisible = props.stage === "ready";
  const handleVisible = props.stage === "ready" || props.stage === "content" || props.stage === "sidebar";

  return (
    <>
      {/* Handle */}
      <div
        className="fixed bottom-0 left-0 right-0 flex flex-col items-center"
        style={{
          opacity: handleVisible ? 1 : 0,
          transform: handleVisible ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 600ms ease 2000ms, transform 600ms cubic-bezier(0.16,1,0.3,1) 2000ms",
          zIndex: open ? 0 : 50,
          pointerEvents: open ? "none" : "auto",
        }}
      >
        <button
          onClick={() => setOpen(true)}
          className="flex flex-col items-center gap-2 pb-8 pt-4 w-full"
          style={{ background: "transparent", border: "none" }}
        >
          <div style={{ width: "32px", height: "3px", borderRadius: "2px", background: "rgba(255,255,255,0.30)" }} />
          <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.45)", letterSpacing: "0.10em" }}>
            ² CONTROLS /
          </span>
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0"
          style={{ background: "rgba(0,0,0,0.12)", zIndex: 49 }}
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className="fixed left-0 right-0 bottom-0 sidebar flex flex-col"
        style={{
          height: "36vh",
          borderRadius: "14px 14px 0 0",
          zIndex: 50,
          transform: open ? `translateY(${dragDelta}px)` : "translateY(100%)",
          transition: isDragging.current ? "none" : open
            ? "transform 500ms cubic-bezier(0.16,1,0.3,1)"
            : "transform 400ms cubic-bezier(0.4,0,1,1)",
        }}
      >
        {/* Drag handle */}
        <div
          className="flex justify-center pt-3 pb-1 flex-shrink-0"
          style={{ cursor: "grab" }}
          onTouchStart={(e) => {
            isDragging.current = true;
            dragStartY.current = e.touches[0].clientY;
            setDragDelta(0);
          }}
          onTouchMove={(e) => {
            const d = e.touches[0].clientY - dragStartY.current;
            if (d > 0) setDragDelta(d);
          }}
          onTouchEnd={() => {
            isDragging.current = false;
            if (dragDelta > 60) setOpen(false);
            setDragDelta(0);
          }}
          onClick={() => setOpen(false)}
        >
          <div style={{ width: "32px", height: "3px", borderRadius: "2px", background: "rgba(255,255,255,0.25)" }} />
        </div>

        <ControlsContent
          {...props}
          footerVisible={footerVisible}
          sidebarVisible={sidebarVisible}
        />
      </div>
    </>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export function GradientControls({
  gradient, onChange, stage, saved, onSave, onDeleteSaved, onLoadSaved,
}: GradientControlsProps) {
  const cssGradient = generateCSSGradient(gradient);
  const isMobile = useIsMobile();
  const sidebarVisible = stage === "sidebar" || stage === "content" || stage === "ready";
  const footerVisible = stage === "ready";

  const sharedProps = { gradient, onChange, stage, cssGradient, saved, onSave, onDeleteSaved, onLoadSaved };

  if (isMobile) {
    return <BottomSheet {...sharedProps} />;
  }

  return (
    <div
      className="fixed left-0 top-0 bottom-0 w-[300px] sidebar overflow-hidden flex flex-col"
      style={{
        clipPath: sidebarVisible ? "inset(0 0 0% 0)" : "inset(0 0 100% 0)",
        transition: "clip-path 700ms cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      <ControlsContent {...sharedProps} footerVisible={footerVisible} sidebarVisible={sidebarVisible} />
    </div>
  );
}
