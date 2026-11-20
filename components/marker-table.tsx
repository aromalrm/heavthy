"use client";

import type { KeyboardEvent } from "react";
import { DRAWS, type Marker } from "@/lib/data";
import { deltaOf, HUE, isWithin, parseTarget, tickOf, toneOf, unitOf } from "@/lib/metrics";
import { useInspector } from "./inspector";
import { Chevron } from "./parts";

const COLS = "grid-cols-[minmax(0,1.6fr)_128px_96px_161px_168px_52px_22px]";

export function rowKeys(event: KeyboardEvent<HTMLElement>) {
  if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
  const rows = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("[data-row]"));
  const index = rows.indexOf(document.activeElement as HTMLElement);
  if (index < 0) return;
  event.preventDefault();
  const next =
    event.key === "Home"
      ? 0
      : event.key === "End"
        ? rows.length - 1
        : event.key === "ArrowDown"
          ? Math.min(index + 1, rows.length - 1)
          : Math.max(index - 1, 0);
  rows[next]?.focus();
}

export function MiniSpectrum({ tone }: { tone: ReturnType<typeof toneOf> }) {
  const low = tickOf(-1, 33);
  const high = tickOf(1, 33);
  const mark = tickOf(tone.p, 33);
  return (
    <span aria-hidden className="relative block h-6" style={{ width: 161 }}>
      {Array.from({ length: 33 }, (_, index) => {
        if (index === mark) return null;
        const bound = index === low || index === high;
        return (
          <span
            key={index}
            className="absolute w-px"
            style={{
              left: 5 * index,
              top: bound ? 6 : 9,
              height: bound ? 12 : 6,
              background: bound
                ? "rgba(17,17,16,0.32)"
                : index > low && index < high
                  ? "rgba(17,17,16,0.2)"
                  : "rgba(17,17,16,0.11)",
            }}
          />
        );
      })}
      <span
        className="absolute top-1 h-4 w-[7px] rounded-[2px]"
        style={{
          left: 5 * mark - 3,
          background: tone.hollow ? "#fff" : tone.light,
          boxShadow: tone.hollow ? `inset 0 0 0 1.5px ${tone.light}` : undefined,
        }}
      />
    </span>
  );
}

function RowSpark({ marker }: { marker: Marker }) {
  const data = marker.history;
  if (data.length < 2) return <span className="caption">One test</span>;
  const target = parseTarget(marker.optimal ?? marker.range);
  const edges: { value: number; past: "high" | "low" }[] = [];
  if (target && Number.isFinite(target.hi)) edges.push({ value: target.hi, past: "high" });
  if (target && target.lo > 0) edges.push({ value: target.lo, past: "low" });
  const values = [...data, ...edges.map((edge) => edge.value)];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = 0.18 * (max - min || Math.abs(max) || 1);
  const lo = min >= 0 ? Math.max(0, min - pad) : min - pad;
  const hi = max + pad;
  const band = target
    ? { from: target.lo > 0 ? target.lo : lo, to: Number.isFinite(target.hi) ? target.hi : hi }
    : null;
  const x = (index: number) => 39 + (124 * index) / (data.length - 1);
  const y = (value: number) => 5 + ((hi - value) / (hi - lo)) * 26;
  const draws = DRAWS.slice(0, data.length);
  const last = data.length - 1;
  const outside = !!target && !isWithin(data[last], target);
  const tone = toneOf(marker);
  const cx = x(last);
  const cy = y(data[last]);
  return (
    <svg
      width={168}
      height={36}
      className="overflow-visible"
      role="img"
      aria-label={data.map((value, index) => `${draws[index]?.label ?? ""}: ${value}`).join(", ")}
    >
      {band && (
        <rect
          x={34}
          y={y(band.to)}
          width={134}
          height={Math.max(1, y(band.from) - y(band.to))}
          fill="rgba(14,159,110,0.08)"
          rx={2}
        />
      )}
      {data.map((_, index) => (
        <line
          key={index}
          x1={x(index)}
          x2={x(index)}
          y1={1}
          y2={35}
          stroke="rgba(17,17,16,0.14)"
          strokeDasharray="1 3"
        />
      ))}
      {edges.map((edge) => (
        <g key={edge.past}>
          <line
            x1={34}
            x2={168}
            y1={y(edge.value)}
            y2={y(edge.value)}
            stroke="rgba(14,159,110,0.4)"
            strokeDasharray="2 2"
          />
          <text
            x={24}
            y={y(edge.value)}
            dy="0.35em"
            textAnchor="end"
            fontSize={10}
            fill="var(--color-muted)"
            className="tabular"
          >
            {edge.value}
          </text>
          <circle cx={29.5} cy={y(edge.value)} r={2.25} fill={HUE[edge.past].light} />
        </g>
      ))}
      <polyline
        points={data.map((value, index) => `${x(index)},${y(value)}`).join(" ")}
        fill="none"
        stroke="rgba(17,17,16,0.28)"
        strokeWidth={1.25}
        strokeLinejoin="round"
      />
      {data.slice(0, last).map((value, index) => (
        <circle key={index} cx={x(index)} cy={y(value)} r={1.75} fill="#c4c4bf" />
      ))}
      {outside ? (
        <rect
          x={cx - 3.5}
          y={cy - 3.5}
          width={7}
          height={7}
          transform={`rotate(45 ${cx} ${cy})`}
          fill={tone.light}
          stroke="#fff"
          strokeWidth={1.25}
        />
      ) : (
        <circle
          cx={cx}
          cy={cy}
          r={3}
          fill={tone.hollow ? "#fff" : tone.light}
          stroke={tone.hollow ? tone.light : "#fff"}
          strokeWidth={tone.hollow ? 1.5 : 1.25}
        />
      )}
    </svg>
  );
}

export function MarkerHead() {
  return (
    <div className={`caption grid h-10 items-center gap-x-5 border-b border-[var(--color-line)] px-5 ${COLS}`}>
      <span>Biomarker</span>
      <span>Status</span>
      <span className="text-right">Result</span>
      <span className="flex justify-between">
        <span>Low</span>
        <span>High</span>
      </span>
      <span className="pl-[34px]">Tests</span>
      <span className="text-right">Change</span>
      <span />
    </div>
  );
}

export function MarkerRow({ marker }: { marker: Marker }) {
  const { openMarker } = useInspector();
  const unit = unitOf(marker.value);
  const amount = marker.value.replace(unit, "").trim();
  const delta = deltaOf(marker.history);
  const tone = toneOf(marker);
  return (
    <button
      type="button"
      onClick={() => openMarker(marker)}
      data-row
      aria-label={`${marker.short}, ${marker.value}, ${tone.word}`}
      className={`row-hover group grid h-14 w-full items-center gap-x-5 border-t border-[var(--color-line)] px-5 text-left first:border-t-0 ${COLS}`}
    >
      <span className="min-w-0">
        <span className="block truncate text-[14px]">{marker.short}</span>
        <span className="block truncate text-[12px] text-[var(--color-muted)]">{marker.name}</span>
      </span>
      <span className="flex items-center gap-2 text-[13px]">
        <span aria-hidden className="h-3.5 w-[5px] shrink-0 rounded-[2px]" style={{ background: tone.light }} />
        {tone.word}
      </span>
      <span className="text-right">
        <span className="tabular text-[15px]">{amount}</span>
        <span className="ml-1 text-[11px] text-[var(--color-muted)]">{unit}</span>
      </span>
      <MiniSpectrum tone={tone} />
      <span className="flex justify-center">
        <RowSpark marker={marker} />
      </span>
      <span className="tabular text-right text-[13px] text-[var(--color-muted)]">
        {delta === null ? "" : delta === 0 ? "0" : `${delta > 0 ? "+" : "−"}${Math.abs(delta)}`}
      </span>
      <Chevron />
    </button>
  );
}
