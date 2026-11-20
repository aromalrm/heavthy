import type { Marker, Status } from "./data";

export type Target =
  | { kind: "below"; lo: number; hi: number }
  | { kind: "above"; lo: number; hi: number }
  | { kind: "between"; lo: number; hi: number };

const NUM = /-?\d+(?:\.\d+)?/g;

export function parseTarget(input: string): Target | null {
  const values = (input.match(NUM) ?? []).map(Number);
  if (values.length === 0) return null;
  const text = input.trim();
  if (/^[<≤]/.test(text)) return { kind: "below", lo: 0, hi: values[0] };
  if (/^[>≥]/.test(text)) return { kind: "above", lo: values[0], hi: Infinity };
  if (values.length >= 2)
    return { kind: "between", lo: values[0], hi: values[1] };
  return null;
}

export function isWithin(value: number, target: Target | null) {
  if (!target) return true;
  if (target.kind === "below") return value < target.hi;
  if (target.kind === "above") return value >= target.lo;
  return value >= target.lo && value <= target.hi;
}

export function unitOf(value: string) {
  return value.replace(/^\s*-?\d+(?:\.\d+)?\s*/, "").trim();
}

function formatValue(value: number, unit: string) {
  const text = Number.isInteger(value)
    ? String(value)
    : String(Math.round(value * 100) / 100);
  if (unit === "%") return `${text}%`;
  return unit ? `${text} ${unit}` : text;
}

const BANDS = {
  optimal: [0, 0.6],
  inrange: [0.62, 1],
  attention: [1.08, 1.4],
} as const;

export function spectrumOf(
  value: string,
  range: string,
  status: Status,
  optimal?: string,
) {
  const match = value.match(/-?\d+(?:\.\d+)?/);
  const target = parseTarget(range);
  if (!match || !target) return null;
  const current = Number(match[0]);
  const preferred = optimal ? parseTarget(optimal) : null;
  let signed: number;
  if (preferred && preferred.kind === "between") {
    const mid = (preferred.lo + preferred.hi) / 2;
    signed =
      current < mid
        ? -0.6 * ((mid - current) / (mid - preferred.lo))
        : 0.6 * ((current - mid) / (preferred.hi - mid));
  } else if (target.kind === "between") {
    signed =
      (current - (target.lo + target.hi) / 2) / ((target.hi - target.lo) / 2);
  } else if (target.kind === "below") {
    signed = -0.6 + 1.6 * (current / target.hi);
  } else if (current < target.lo) {
    signed = -1 - (target.lo - current) / target.lo;
  } else {
    signed = -1 + 1.6 * Math.min(1, (current - target.lo) / (0.5 * target.lo));
  }
  const [lo, hi] = BANDS[status];
  return (signed < 0 ? -1 : 1) * Math.min(hi, Math.max(lo, Math.abs(signed)));
}

export const HUE = {
  low: { dark: "#ebc43c", light: "#a68100" },
  optimal: { dark: "#22c57a", light: "#0e9f6e" },
  high: { dark: "#ec60de", light: "#df3fbf" },
} as const;

export const KINDS = [
  "low",
  "slightly-low",
  "optimal",
  "slightly-high",
  "high",
] as const;

export type Kind = (typeof KINDS)[number];

export const KIND_WORD: Record<Kind, string> = {
  low: "Low",
  "slightly-low": "Slightly low",
  optimal: "Optimal",
  "slightly-high": "Slightly high",
  high: "High",
};

export function sideOf(kind: Kind): keyof typeof HUE {
  if (kind === "optimal") return "optimal";
  return kind.endsWith("low") ? "low" : "high";
}

export function toneOf(marker: Pick<Marker, "value" | "range" | "status" | "optimal">) {
  const position = spectrumOf(marker.value, marker.range, marker.status, marker.optimal) ?? 0;
  const side = position < 0 ? "low" : "high";
  const kind: Kind =
    marker.status === "optimal"
      ? "optimal"
      : marker.status === "inrange"
        ? (`slightly-${side}` as Kind)
        : side;
  const hue = HUE[sideOf(kind)];
  return {
    p: position,
    kind,
    word: KIND_WORD[kind],
    dark: hue.dark,
    light: hue.light,
    hollow: kind.startsWith("slightly"),
  };
}

export function tickOf(position: number, count: number) {
  return Math.round((0.5 + (position / 1.4) * 0.47) * (count - 1));
}

export function snapToTicks(values: number[], count: number, gap: number) {
  const ranked = values
    .map((value, index) => [Math.round(Math.max(0, Math.min(1, value)) * (count - 1)), index] as const)
    .sort((a, b) => a[0] - b[0]);
  const length = ranked.length;
  const forward = ranked.map(([value]) => value);
  for (let i = 1; i < length; i++) forward[i] = Math.max(forward[i], forward[i - 1] + gap);
  const back = ranked.map(([value]) => value);
  back[length - 1] = Math.min(back[length - 1], count - 1);
  for (let i = length - 2; i >= 0; i--) back[i] = Math.min(back[i], back[i + 1] - gap);
  const mid = forward.map((value, index) => Math.round((value + back[index]) / 2));
  for (let i = 1; i < length; i++) mid[i] = Math.max(mid[i], mid[i - 1] + gap);
  const placed = Array<number>(length);
  ranked.forEach(([, index], order) => {
    placed[index] = mid[order];
  });
  return placed;
}

export function layoutRange(value: string, range: string, optimal?: string) {
  const match = value.match(NUM);
  const current = match ? Number(match[0]) : null;
  const target = parseTarget(range);
  if (current === null || !target) return null;
  const lo = target.lo;
  const hi = target.kind === "above" ? Math.max(1.5 * target.lo, 1.15 * current) : target.hi;
  const span = hi - lo || 1;
  const min = Math.max(0, Math.min(lo - 0.35 * span, current - 0.1 * span));
  const max = Math.max(hi + 0.35 * span, current + 0.1 * span);
  const at = (point: number) => Math.max(0, Math.min(1, (point - min) / (max - min)));
  const preferred = optimal ? parseTarget(optimal) : null;
  return {
    optimal:
      preferred && preferred.kind === "between"
        ? { start: at(preferred.lo), end: at(preferred.hi), lo: preferred.lo, hi: preferred.hi }
        : undefined,
    min,
    max,
    bandStart: at(lo),
    bandEnd: target.kind === "above" ? 1 : at(hi),
    position: at(current),
    lo,
    hi: target.kind === "above" ? Infinity : hi,
  };
}

export const STATUS_RANK: Record<Status, number> = {
  attention: 0,
  inrange: 1,
  optimal: 2,
};

export function kindsOf(markers: Marker[]) {
  const grouped = new Map<Kind, string[]>();
  for (const marker of markers) {
    const kind = toneOf(marker).kind;
    grouped.set(kind, [...(grouped.get(kind) ?? []), marker.short]);
  }
  return KINDS.filter((kind) => grouped.has(kind)).map((kind) => ({
    kind,
    names: grouped.get(kind) ?? [],
    tone: { ...HUE[sideOf(kind)], hollow: kind.startsWith("slightly") },
  }));
}

export function tally(markers: Marker[]) {
  return markers.reduce(
    (sum, marker) => ({
      ...sum,
      total: sum.total + 1,
      [marker.status]: sum[marker.status] + 1,
    }),
    { total: 0, optimal: 0, inrange: 0, attention: 0 },
  );
}

export function sinceLast(marker: Marker) {
  const history = marker.history;
  if (history.length < 2) return "No earlier test to compare";
  const delta = history[history.length - 1] - history[history.length - 2];
  const unit = unitOf(marker.value);
  if (Math.abs(delta) < 1e-9) return "the same as your last test";
  return `${formatValue(Math.abs(delta), unit)} ${delta > 0 ? "higher" : "lower"} than your last test`;
}

export function sinceFirst(marker: Marker, firstMonth: string) {
  const history = marker.history;
  if (history.length < 2) return "First result";
  const delta = history[history.length - 1] - history[0];
  const unit = unitOf(marker.value);
  if (Math.abs(delta) < 1e-9) {
    return `Steady at ${formatValue(history[history.length - 1], unit)} since ${firstMonth}`;
  }
  return `${delta > 0 ? "Up" : "Down"} ${formatValue(Math.abs(delta), unit)} since ${firstMonth}`;
}

export function markerKey(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function niceScale(min: number, max: number, steps = 4) {
  const rough = (max - min) / Math.max(1, steps) || Math.abs(max) || 1;
  const power = 10 ** Math.floor(Math.log10(rough));
  const fraction = rough / power;
  const step =
    (fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 2.5 ? 2.5 : fraction <= 5 ? 5 : 10) *
    power;
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let value = lo; value <= hi + step / 2; value += step) {
    ticks.push(Math.round(value * 1e6) / 1e6);
  }
  return { lo, hi, step, ticks };
}

export function chartDomain(history: number[], target: Target | null) {
  const latest = history[history.length - 1];
  const bounds = target
    ? [target.lo, target.hi].filter((value) => Number.isFinite(value) && value > 0)
    : [];
  const near = bounds.length
    ? bounds.reduce((best, value) =>
        Math.abs(value - latest) < Math.abs(best - latest) ? value : best,
      )
    : undefined;
  const scale = niceScale(
    Math.min(...history, near ?? Infinity),
    Math.max(...history, near ?? -Infinity),
    3,
  );
  const lo = near !== undefined && near <= scale.lo ? scale.lo - scale.step : scale.lo;
  const hi = near !== undefined && near >= scale.hi ? scale.hi + scale.step : scale.hi;
  const ticks = scale.ticks.filter((tick) => tick >= lo && tick <= hi);
  if (lo < scale.lo) ticks.unshift(lo);
  if (hi > scale.hi) ticks.push(hi);
  return { lo, hi, ticks, near };
}
