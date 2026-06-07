import { GradientState } from "../App";
 
export function generateCSSGradient(gradient: GradientState): string {
  const sortedStops = [...gradient.stops].sort((a, b) => a.position - b.position);
  const colorStops = sortedStops
    .map((stop) => {
      const alpha = stop.opacity < 1
        ? Math.round(stop.opacity * 255).toString(16).padStart(2, "0")
        : "";
      return `${stop.color}${alpha} ${stop.position}%`;
    })
    .join(", ");
 
  switch (gradient.type) {
    case "linear":
      return `linear-gradient(${gradient.angle}deg, ${colorStops})`;
    case "radial":
      return `radial-gradient(circle at ${gradient.radialX}% ${gradient.radialY}%, ${colorStops})`;
    case "mesh":
      // Mesh renders via canvas in GradientPreview — CSS fallback uses first/last stop
      if (gradient.orbs.length >= 2) {
        return `radial-gradient(circle at ${gradient.orbs[0].x}% ${gradient.orbs[0].y}%, ${gradient.orbs[0].color}, transparent 60%), radial-gradient(circle at ${gradient.orbs[1].x}% ${gradient.orbs[1].y}%, ${gradient.orbs[1].color}, transparent 60%)`;
      }
      return `linear-gradient(${gradient.angle}deg, ${colorStops})`;
    default:
      return `linear-gradient(135deg, ${colorStops})`;
  }
}
 
export function generateSVGGradient(gradient: GradientState): string {
  const sortedStops = [...gradient.stops].sort((a, b) => a.position - b.position);
  const gradientId = "g-" + Date.now();
 
  if (gradient.type === "linear") {
    const angle = gradient.angle;
    const rad = (angle - 90) * (Math.PI / 180);
    const x1 = 50 + 50 * Math.cos(rad);
    const y1 = 50 + 50 * Math.sin(rad);
    const x2 = 50 - 50 * Math.cos(rad);
    const y2 = 50 - 50 * Math.sin(rad);
    return `<svg width="2400" height="1600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="${gradientId}" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">
      ${sortedStops.map(s => `<stop offset="${s.position}%" stop-color="${s.color}" stop-opacity="${s.opacity}" />`).join("\n      ")}
    </linearGradient>
  </defs>
  <rect width="2400" height="1600" fill="url(#${gradientId})" />
</svg>`;
  }
 
  if (gradient.type === "mesh") {
    const orbDefs = gradient.orbs.map((orb, i) => {
      const id = `${gradientId}-orb${i}`;
      const r = orb.size;
      return `<radialGradient id="${id}" cx="${orb.x}%" cy="${orb.y}%" r="${r}%" gradientUnits="userSpaceOnUse" gradientTransform="scale(24 16)">
      <stop offset="0%" stop-color="${orb.color}" stop-opacity="0.9" />
      <stop offset="100%" stop-color="${orb.color}" stop-opacity="0" />
    </radialGradient>`;
    }).join("\n    ");
 
    const rects = gradient.orbs.map((_, i) =>
      `<rect width="2400" height="1600" fill="url(#${gradientId}-orb${i})" />`
    ).join("\n  ");
 
    return `<svg width="2400" height="1600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    ${orbDefs}
  </defs>
  <rect width="2400" height="1600" fill="${gradient.stops[gradient.stops.length - 1]?.color ?? '#000'}" />
  ${rects}
</svg>`;
  }
 
  return `<svg width="2400" height="1600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="${gradientId}" cx="${gradient.radialX}%" cy="${gradient.radialY}%">
      ${sortedStops.map(s => `<stop offset="${s.position}%" stop-color="${s.color}" stop-opacity="${s.opacity}" />`).join("\n      ")}
    </radialGradient>
  </defs>
  <rect width="2400" height="1600" fill="url(#${gradientId})" />
</svg>`;
}
 
export function generateJSON(gradient: GradientState): string {
  return JSON.stringify(gradient, null, 2);
}
