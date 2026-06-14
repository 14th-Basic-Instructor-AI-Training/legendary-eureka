/**
 * Shared recharts styling for the admin dashboard. Colors come from globals.css
 * tokens (never hardcoded hex) so charts track the theme. recharts writes these
 * through to SVG `fill`/`stroke`, where `var(--token)` resolves correctly.
 */
export const axisProps = {
  tickLine: false,
  axisLine: false,
  tick: { fill: "var(--text-secondary)", fontSize: 12 },
} as const;

export const gridProps = {
  strokeDasharray: "3 3",
  vertical: false,
  stroke: "var(--border)",
} as const;

export const tooltipProps = {
  cursor: { fill: "var(--bg-dashboard)", stroke: "var(--border)" },
  contentStyle: {
    borderRadius: 12,
    border: "1px solid var(--border)",
    background: "var(--card)",
    boxShadow: "0px 0px 10px 0px rgba(0,0,0,0.07)",
    fontSize: 12,
  },
  labelStyle: { color: "var(--text-primary)", fontWeight: 600 },
} as const;
