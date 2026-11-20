"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  DRAWS,
  GROUPS,
  NEXT_TEST,
  PERSONA,
  PROTOCOL,
  type Marker,
} from "@/lib/data";
import { useDraw } from "@/lib/draw";
import {
  layoutRange,
  sinceLast,
  snapToTicks,
  spectrumOf,
  STATUS_RANK,
  tally,
  tickOf,
  toneOf,
} from "@/lib/metrics";
import {
  Agent,
  ArrowDown,
  ArrowUp,
  Bolt,
  FlameFill,
  Flask,
  Heart,
  HeartFill,
  LeafFill,
  Shield,
} from "./icons";
import { Chevron, Facts, GlossaryText, ToneBar, ToneLegend, ToneMark } from "./parts";

const GROUP_ICON = {
  heart: Heart,
  metabolism: Bolt,
  organs: Flask,
  vitality: Shield,
} as const;

const SYSTEM_FILL: Record<string, typeof HeartFill> = {
  "Heart & Vascular Health": HeartFill,
  Nutrients: LeafFill,
  Inflammation: FlameFill,
};

function summaryLine(items: { m: Marker; p: number }[]) {
  const flagged = items.filter((item) => item.m.status === "attention");
  if (flagged.length === 0) return "Every result is inside its target.";
  const phrases = flagged.map((item, index) => {
    const name =
      index === 0 || /^[A-Z]{2}/.test(item.m.short)
        ? item.m.short
        : item.m.short[0].toLowerCase() + item.m.short.slice(1);
    return `${name} is ${item.p > 0 ? "high" : "low"}`;
  });
  const sentence =
    phrases.length > 1
      ? `${phrases.slice(0, -1).join(", ")} and ${phrases[phrases.length - 1]}`
      : phrases[0];
  return `${sentence}. Everything else is inside its target.`;
}

export function Spectrum({
  onOpen,
  compact = false,
}: {
  onOpen: (marker: Marker) => void;
  compact?: boolean;
}) {
  const { markers } = useDraw();
  const placed = markers
    .map((marker) => ({
      m: marker,
      p: spectrumOf(marker.value, marker.range, marker.status, marker.optimal),
    }))
    .filter((item): item is { m: Marker; p: number } => item.p !== null);
  const ticks = snapToTicks(
    placed.map((item) => tickOf(item.p, 97) / 96),
    97,
    2,
  );
  const marks = placed
    .map((item, index) => ({ ...item, x: ticks[index] / 96, tick: ticks[index] }))
    .sort((a, b) => a.x - b.x);
  const inTarget = markers.filter((marker) => marker.status !== "attention").length;
  const [hover, setHover] = useState<number | null>(null);
  const [focus, setFocus] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const node = track.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.floor(entry.contentRect.width));
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const px = (tick: number) => Math.round((tick * (width - 1)) / 96);
  const occupied = new Set(marks.map((mark) => mark.tick));
  const lowTick = tickOf(-1, 97);
  const highTick = tickOf(1, 97);
  const active = hover === null ? null : marks[hover];
  return (
    <section
      className={`tile-dark relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] p-6 text-white ${compact ? "min-h-[232px]" : "min-h-[320px]"}`}
    >
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-[13px] text-[var(--dock-muted)]">Biomarkers</p>
          <h2 className="mt-1 text-[24px] font-light leading-tight tracking-[-0.02em]">
            Your biomarkers in range
          </h2>
        </div>
        <div className="flex flex-col items-end gap-2">
          <p>
            <span className="tabular text-[44px] font-extralight leading-none tracking-[-0.04em]">
              {inTarget}
            </span>
            <span className="tabular ml-1 text-[15px] text-[var(--dock-muted)]">
              / {markers.length} in target
            </span>
          </p>
          <p className="flex items-center gap-1.5 text-[11px] text-[var(--dock-muted)]">
            <span className="h-2.5 w-[5px] rounded-[1.5px] shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.7)]" />
            Outline: in target, short of optimal
          </p>
        </div>
      </div>
      <p className="mt-auto min-h-[22px] text-[14px] text-[rgba(255,255,255,0.82)]" aria-live="polite">
        {active ? (
          <span>
            <span className="text-white">{active.m.short}</span>
            <span className="tabular ml-2">{active.m.value}</span>
            <span className="ml-2 text-[var(--dock-muted)]">{toneOf(active.m).word}</span>
          </span>
        ) : (
          summaryLine(marks)
        )}
      </p>
      <div
        ref={track}
        className="relative mt-4 h-[56px]"
        role="group"
        aria-label="Results from low to high"
        onPointerLeave={() => setHover(null)}
        onKeyDown={(event) => {
          const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
          if (!step) return;
          event.preventDefault();
          const next = Math.max(0, Math.min(marks.length - 1, focus + step));
          setFocus(next);
          setHover(next);
        }}
      >
        {width > 0 && (
          <span
            aria-hidden
            className="absolute inset-0"
            style={{
              WebkitMaskImage:
                "linear-gradient(90deg, transparent 0, #000 6%, #000 94%, transparent 100%)",
              maskImage:
                "linear-gradient(90deg, transparent 0, #000 6%, #000 94%, transparent 100%)",
            }}
          >
            {Array.from({ length: 97 }, (_, index) => {
              if (occupied.has(index)) return null;
              const bound = index === lowTick || index === highTick;
              return (
                <span
                  key={index}
                  className="wave-in absolute w-px bg-white"
                  style={{
                    animationDelay: `${120 + (index / 96) * 700}ms`,
                    left: px(index),
                    top: bound ? 21 : 25,
                    height: bound ? 14 : 6,
                    opacity: bound ? 0.45 : index > lowTick && index < highTick ? 0.3 : 0.14,
                  }}
                />
              );
            })}
          </span>
        )}
        {marks.map((mark, index) => {
          const tone = toneOf(mark.m);
          return (
            <button
              key={mark.m.name}
              type="button"
              tabIndex={index === focus ? 0 : -1}
              aria-label={`${mark.m.short}, ${mark.m.value}, ${tone.word}`}
              onPointerEnter={() => setHover(index)}
              onFocus={() => {
                setFocus(index);
                setHover(index);
              }}
              onBlur={() => setHover(null)}
              onClick={() => onOpen(mark.m)}
              className="spectrum-mark absolute top-0 flex h-full w-[17px] items-center justify-center"
              style={{
                left: width > 0 ? px(mark.tick) - 8 : `calc(${mark.x * 100}% - 8px)`,
                color: tone.dark,
                opacity: hover === null || hover === index ? 1 : 0.35,
                animationDelay: `${120 + 700 * mark.x + 60}ms`,
              }}
              data-on={hover === index ? "" : undefined}
              data-hollow={tone.hollow ? "" : undefined}
            >
              <span className="spectrum-block" />
            </button>
          );
        })}
      </div>
      <div
        aria-hidden
        className="relative mt-3 h-3 text-[10px] font-medium uppercase leading-3 tracking-[0.12em] text-[var(--dock-faint)]"
      >
        <span className="wave-in absolute left-0" style={{ animationDelay: "148ms" }}>
          Low
        </span>
        <span
          className="wave-in absolute -translate-x-1/2 text-[var(--dock-muted)]"
          style={{ left: "50%", animationDelay: "470ms" }}
        >
          Target
        </span>
        <span className="wave-in absolute right-0" style={{ animationDelay: "792ms" }}>
          High
        </span>
      </div>
    </section>
  );
}

export function BioAge({ size = "home" }: { size?: "home" | "large" }) {
  const { draw, index } = useDraw();
  const age = PERSONA.age;
  const bio = draw.bioAge;
  const gap = Math.round((bio - age) * 10) / 10;
  const younger = gap <= 0;
  const previous = index > 0 ? DRAWS[index - 1] : null;
  const delta = previous ? Math.round((bio - previous.bioAge) * 10) / 10 : null;
  const marker = 50 + (Math.max(-6, Math.min(6, gap)) / 6) * 50;
  const large = size === "large";
  const radius = large ? 150 : 88;
  const squash = large ? 0.82 : 0.66;
  const lower = 1 + (Math.max(-6, Math.min(6, gap)) / 6) * 0.5;
  const width = 2 * radius + 8;
  const height = 2 * radius * squash * 1.5 + 8;
  const rings = Array.from({ length: 16 }, (_, index) => {
    const step = (index + 1) / 16;
    return { ry: radius * step * squash, opacity: 0.25 + 0.55 * step };
  });
  return (
    <Link
      href="/data?tab=age"
      aria-label={`Biological age ${bio}, ${Math.abs(gap)} years ${younger ? "younger" : "older"} than your calendar age of ${age}`}
      className={`group relative isolate flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] p-6 text-white ${large ? "min-h-[520px]" : "min-h-[320px]"}`}
      style={{
        background: younger
          ? "radial-gradient(70% 60% at 100% 50%, rgba(52,150,96,0.42) 0%, rgba(52,150,96,0) 70%), radial-gradient(90% 70% at 20% 0%, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 60%), #141413"
          : "radial-gradient(70% 60% at 100% 50%, rgba(190,120,40,0.42) 0%, rgba(190,120,40,0) 70%), radial-gradient(90% 70% at 20% 0%, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 60%), #141413",
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.08] mix-blend-soft-light"
        style={{ backgroundImage: "url(/grain.png)", backgroundSize: "128px" }}
      />
      <svg
        aria-hidden
        viewBox={`0 0 ${width} ${height}`}
        className="pointer-events-none absolute right-0 top-1/2 -z-10 h-auto w-[220px] translate-x-1/2 -translate-y-1/2 text-white opacity-60"
      >
        {rings.map((ring, index) => (
          <g key={index} fill="none" stroke="currentColor" strokeWidth="0.9" opacity={ring.opacity}>
            <ellipse cx={width / 2} cy={height / 2 - ring.ry} rx={radius} ry={ring.ry} />
            <ellipse cx={width / 2} cy={height / 2 + ring.ry * lower} rx={radius} ry={ring.ry * lower} />
          </g>
        ))}
      </svg>
      <div className="flex items-baseline justify-between text-[13px]">
        <span className="flex items-center gap-1 text-[var(--dock-muted)]">
          Biological age
          <Chevron on="dark" />
        </span>
        <span className="tabular text-[17px]">
          {gap === 0 ? "Your age" : `${gap > 0 ? "+" : "−"}${Math.abs(gap)}`}
          <span className="ml-1 text-[13px] text-[rgba(255,255,255,0.8)]">years</span>
        </span>
      </div>
      <div className="mt-6 flex items-end gap-2">
        <span className="tabular text-[96px] font-extralight leading-none tracking-[-0.05em] max-sm:text-[72px]">
          {bio.toFixed(1)}
        </span>
        <span className="mb-2 text-[17px] text-white">years</span>
      </div>
      <div className="mt-auto pt-8">
        {delta !== null && previous && (
          <span className="mb-4 inline-flex h-7 items-center gap-1.5 rounded-full border border-[var(--dock-line)] bg-[rgba(20,20,19,0.6)] px-2.5 text-[12px] backdrop-blur-sm">
            {delta <= 0 ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
            {Math.abs(delta)} since {previous.short}
          </span>
        )}
        <div className="relative h-5" aria-hidden>
          <span className="absolute inset-x-0 top-1/2 h-px bg-[rgba(255,255,255,0.28)]" />
          <span className="absolute left-0 top-1/2 h-[5px] w-[5px] -translate-y-1/2 bg-[rgba(255,255,255,0.7)]" />
          <span className="absolute right-0 top-1/2 h-[5px] w-[5px] -translate-y-1/2 bg-[rgba(255,255,255,0.7)]" />
          <span className="absolute left-1/2 top-0 h-full w-px bg-[rgba(255,255,255,0.4)]" />
          <span
            className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#141413] bg-[var(--color-lime)]"
            style={{ left: `${marker}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[10px] font-medium uppercase tracking-[0.1em] text-[var(--dock-muted)]">
          <span>Younger</span>
          <span className="tabular">You {age}</span>
          <span>Older</span>
        </div>
      </div>
    </Link>
  );
}

function arcPoint(t: number) {
  const arc = { cx: 150, cy: 215.78125, r: 207.78125, half: Math.asin(0.7219130696345315) };
  const angle = -Math.PI / 2 - arc.half + 2 * Math.max(0, Math.min(1, t)) * arc.half;
  return [arc.cx + arc.r * Math.cos(angle), arc.cy + arc.r * Math.sin(angle)];
}

function arcPath(from: number, to: number) {
  const [x1, y1] = arcPoint(from);
  const [x2, y2] = arcPoint(to);
  const r = 207.78125.toFixed(2);
  return `M${x1.toFixed(2)} ${y1.toFixed(2)}A${r} ${r} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

function Priority({ onOpen }: { onOpen: (marker: Marker) => void }) {
  const { markers, isLatest } = useDraw();
  const marker = isLatest
    ? markers.find((item) => item.name === "Apolipoprotein B (ApoB)")
    : [...markers].sort((a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status])[0];
  if (!marker) return null;
  const layout = layoutRange(marker.value, marker.range, marker.optimal);
  if (!layout) return null;
  const [amount, ...unit] = marker.value.split(" ");
  const outside = layout.position < layout.bandStart || layout.position > layout.bandEnd;
  const edge = layout.position > layout.bandEnd ? layout.bandEnd : layout.bandStart;
  const [cx, cy] = arcPoint(layout.position);
  const color =
    marker.status === "optimal" ? "var(--color-optimal)" : `var(--color-${marker.status})`;
  const bound = layout.position > layout.bandEnd ? layout.hi : layout.lo;
  const [labelX, labelY] = arcPoint(edge);
  return (
    <button
      type="button"
      onClick={() => onOpen(marker)}
      className="card group flex h-full min-h-[300px] flex-col p-6 text-left"
    >
      <span className="flex w-full items-start justify-between gap-3">
        <span>
          <span className="block text-[20px] font-light leading-tight tracking-[-0.015em]">
            {marker.short}
          </span>
          <span className="mt-1 block text-[13px] text-[var(--color-muted)]">
            {isLatest ? "Your clearest priority" : marker.system}
          </span>
        </span>
        <Chevron />
      </span>
      <svg viewBox="-8 0 316 94" className="mt-6 w-full overflow-visible" role="img" aria-label={`${marker.short}: ${marker.value}`}>
        <path d={arcPath(0, 1)} fill="none" stroke="rgba(17,17,16,0.07)" strokeWidth="12" strokeLinecap="round" />
        <path d={arcPath(layout.bandStart, layout.bandEnd)} fill="none" stroke="rgba(14,159,110,0.22)" strokeWidth="12" strokeLinecap="round" />
        {outside && (
          <path
            className="arc-draw"
            pathLength={1}
            d={edge < layout.position ? arcPath(edge, layout.position) : arcPath(layout.position, edge)}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
          />
        )}
        {Number.isFinite(bound) && bound > 0 && (
          <text x={labelX} y={labelY + 26} textAnchor="middle" className="tabular" fontSize="11" fill="var(--color-muted)">
            {bound}
          </text>
        )}
        <circle cx={cx} cy={cy} r="7" fill={color} stroke="#fff" strokeWidth="3" />
      </svg>
      <span className="mt-auto flex w-full items-end justify-between gap-3 pt-4">
        <span className="flex items-baseline gap-1.5">
          <span className="tabular text-[56px] font-extralight leading-none tracking-[-0.04em]">{amount}</span>
          <span className="text-[14px] text-[var(--color-muted)]">{unit.join(" ")}</span>
        </span>
        <span className="flex flex-col items-end gap-1 pb-1 text-[12px] text-[var(--color-muted)]">
          <span className="flex items-center gap-1.5 text-[var(--color-ink)]">
            <ToneMark marker={marker} word size={12} />
          </span>
          <span className="tabular">Target {marker.range}</span>
        </span>
      </span>
    </button>
  );
}

export function HomeScreen({
  onAsk,
  onMarker,
  onGroup,
}: {
  onAsk: (question?: string, about?: string) => void;
  onMarker: (marker: Marker) => void;
  onGroup: (key: string) => void;
}) {
  const { markers, isLatest, draw } = useDraw();
  const done = PROTOCOL.filter((step) => step.done).length;
  const plan = PROTOCOL.filter((step) => step.horizon !== "retest")
    .sort((a, b) => Number(Boolean(a.done)) - Number(Boolean(b.done)))
    .slice(0, 4);
  const highlights = isLatest
    ? markers
        .filter((marker) => marker.name !== "Apolipoprotein B (ApoB)" && marker.history.length > 1)
        .map((marker) => {
          const history = marker.history;
          const change =
            Math.abs(history[history.length - 1] - history[history.length - 2]) /
            (Math.abs(history[history.length - 2]) || 1);
          return { marker, change };
        })
        .filter((item) => item.change > 0)
        .sort(
          (a, b) =>
            STATUS_RANK[a.marker.status] - STATUS_RANK[b.marker.status] || b.change - a.change,
        )
        .slice(0, 3)
    : [];

  return (
    <>
      <header className="mb-6">
        <div className="flex min-h-10 flex-wrap items-end gap-x-4 gap-y-2">
          <div className="min-w-0 flex-1">
            <h1 className="text-[30px] font-light leading-tight tracking-[-0.025em]">
              Good morning, {PERSONA.firstName}
            </h1>
            <div className="mt-3">
              <Facts
                items={[
                  { label: isLatest ? "Latest results" : "Viewing", value: draw.label },
                  { label: "Next test", value: NEXT_TEST.date },
                ]}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onAsk()}
              className="flex h-9 items-center gap-2 rounded-full bg-[var(--color-ink)] px-4 text-[13px] text-white transition-opacity hover:opacity-90"
            >
              <Agent size={15} />
              Ask about my results
            </button>
          </div>
        </div>
      </header>
      <div className="rise grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-3">
        <Spectrum onOpen={onMarker} />
        <BioAge />
      </div>
      <div className="rise mt-3 grid grid-cols-3 gap-3" style={{ animationDelay: "60ms" }}>
        <section className="card flex h-full min-h-[300px] flex-col p-6">
          <h2 className="text-[20px] font-light leading-tight tracking-[-0.015em]">
            {isLatest ? "Today's read" : `Viewing ${draw.label}`}
          </h2>
          <p className="mt-1 text-[13px] text-[var(--color-muted)]">From your {draw.short} results</p>
          <p className="mt-auto pt-6 text-[16px] leading-[1.55] tracking-[-0.005em]">
            {isLatest ? (
              <GlossaryText text="Most systems are steady. Your clearest priority is ApoB, the cholesterol particle count. Ferritin is low, and inflammation keeps improving." />
            ) : (
              "These are older results. The read and highlights describe your latest test."
            )}
          </p>
          <div className="mt-5 flex items-center gap-2 border-t border-[var(--color-line)] pt-4 text-[13px]">
            <button
              type="button"
              onClick={() => onAsk("Summarise my latest results")}
              className="flex h-8 items-center gap-1.5 rounded-full bg-[var(--color-subtle)] px-3 transition-colors hover:bg-[#ebebe7]"
            >
              <Agent size={14} />
              Ask about this
            </button>
            <Link
              href="/data"
              className="group ml-auto flex h-8 items-center gap-2 text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)]"
            >
              All {markers.length} results
              <Chevron />
            </Link>
          </div>
        </section>
        <Priority onOpen={onMarker} />
        <section className="card flex h-full min-h-[300px] flex-col p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-[20px] font-light leading-tight tracking-[-0.015em]">Your plan</h2>
              <p className="mt-1 text-[13px] text-[var(--color-muted)]">
                {done} of {PROTOCOL.length} steps done
              </p>
            </div>
            <Link href="/protocol" aria-label="Open your protocol" className="group -m-1 p-1">
              <Chevron />
            </Link>
          </div>
          <ul className="mt-auto flex flex-col gap-1.5 pt-6">
            {plan.map((step) => {
              const marker = markers.find((item) => item.name === step.targets[0]);
              const Icon = marker ? SYSTEM_FILL[marker.system] : undefined;
              return (
                <li key={step.id}>
                  <Link
                    href="/protocol"
                    className="flex h-11 items-center gap-3 rounded-[var(--radius-inner)] bg-[var(--color-subtle)] px-3 text-[13px] transition-colors hover:bg-[#ebebe7]"
                  >
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center"
                      style={{ color: marker ? toneOf(marker).light : undefined }}
                    >
                      {Icon && <Icon size={13} />}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{step.title}</span>
                    <span className="tabular shrink-0 text-[12px] text-[var(--color-muted)]">
                      {step.progress
                        ? `${step.progress.done} of ${step.progress.of} ${step.progress.unit}`
                        : (step.due ?? "")}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
      <div className="rise mt-3" style={{ animationDelay: "120ms" }}>
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {GROUPS.map((group) => {
            const groupMarkers = markers.filter((marker) => marker.group === group.key);
            const counts = tally(groupMarkers);
            const Icon = GROUP_ICON[group.key as keyof typeof GROUP_ICON];
            return (
              <button
                key={group.key}
                type="button"
                onClick={() => onGroup(group.key)}
                className="card group flex flex-col p-4 text-left transition-colors hover:border-[var(--color-line-strong)]"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-subtle)]">
                    <Icon size={16} />
                  </span>
                  <Chevron />
                </div>
                <h3 className="mt-3 truncate text-[14px] font-medium">{group.title}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="tabular text-[28px] font-light leading-none tracking-[-0.02em]">
                    {counts.optimal}
                  </span>
                  <span className="text-[13px] text-[var(--color-muted)]">
                    of {counts.total} optimal
                  </span>
                </div>
                <div className="mt-3">
                  <ToneBar markers={groupMarkers} />
                </div>
                <div className="mt-3">
                  <ToneLegend markers={groupMarkers} />
                </div>
              </button>
            );
          })}
        </section>
      </div>
      {highlights.length > 0 && (
        <div className="rise mt-8" style={{ animationDelay: "180ms" }}>
          <section>
            <h2 className="caption mb-2 font-medium">Highlights</h2>
            <div className="grid gap-3 md:grid-cols-3">
              {highlights.map(({ marker }) => {
                const history = marker.history;
                const latest = history[history.length - 1];
                const previous = history[history.length - 2];
                const draws = DRAWS.slice(0, history.length);
                const ceiling = 1.1 * Math.max(latest, previous);
                const tone = toneOf(marker);
                const rows = [
                  {
                    label: draws[draws.length - 1].short,
                    value: latest,
                    color: tone.hollow ? "transparent" : tone.light,
                    ring: tone.hollow ? `inset 0 0 0 1.5px ${tone.light}` : undefined,
                  },
                  { label: draws[draws.length - 2].short, value: previous, color: "#d9d9d6" },
                ];
                const unit = marker.value.replace(/^\s*-?\d+(?:\.\d+)?\s*/, "").trim();
                return (
                  <article key={marker.name} className="card flex flex-col">
                    <button
                      type="button"
                      onClick={() => onMarker(marker)}
                      className="group flex flex-1 flex-col p-4 text-left"
                    >
                      <span className="flex items-center gap-1.5 text-[12px] text-[var(--color-muted)]">
                        <ToneMark marker={marker} />
                        {marker.system}
                        <Chevron className="ml-auto" />
                      </span>
                      <h3 className="mt-2 text-[18px] font-light leading-snug tracking-[-0.015em]">
                        {marker.short} is {sinceLast(marker)}.
                      </h3>
                      <div className="mt-4 flex flex-col gap-2.5" aria-hidden>
                        {rows.map((row) => (
                          <div
                            key={row.label}
                            className="grid grid-cols-[28px_1fr_auto] items-center gap-2.5"
                          >
                            <span className="text-[12px] text-[var(--color-muted)]">{row.label}</span>
                            <span className="h-2 rounded-full bg-[var(--color-subtle)]">
                              <span
                                className="grow-x block h-full rounded-full"
                                style={{
                                  width: `${(row.value / ceiling) * 100}%`,
                                  background: row.color,
                                  boxShadow: row.ring,
                                  animationDelay: "240ms",
                                }}
                              />
                            </span>
                            <span className="tabular text-[13px]">
                              {row.value}
                              <span className="ml-1 text-[11px] text-[var(--color-muted)]">{unit}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onAsk(
                          `What does the change in my ${marker.short.toLowerCase()} mean?`,
                          marker.short,
                        )
                      }
                      className="flex h-10 items-center gap-1.5 border-t border-[var(--color-line)] px-4 text-[13px] text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)]"
                    >
                      <Agent size={16} /> Ask about this
                    </button>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
