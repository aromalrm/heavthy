"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { Marker } from "@/lib/data";
import { DRAWS } from "@/lib/data";
import {
  chartDomain,
  isWithin,
  kindsOf,
  KIND_WORD,
  layoutRange,
  parseTarget,
  toneOf,
  unitOf,
  type Kind,
} from "@/lib/metrics";

export function Chevron({
  on = "light",
  className = "",
}: {
  on?: "light" | "dark";
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={`chevron flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${on === "dark" ? "chevron-dark" : ""} ${className}`}
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path
          d="M3.9 1.9 7.1 5 3.9 8.1"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function CloseMark() {
  return (
    <span
      aria-hidden
      className="chevron flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path
          d="M2.2 2.2 7.8 7.8M7.8 2.2 2.2 7.8"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export function ToneBlock({
  tone,
  size = 14,
}: {
  tone: { light: string; hollow: boolean };
  size?: number;
}) {
  return (
    <span
      aria-hidden
      className="inline-block shrink-0 rounded-[2px]"
      style={{
        width: Math.max(5, Math.round(0.4 * size)),
        height: size,
        background: tone.hollow ? "transparent" : tone.light,
        boxShadow: tone.hollow ? `inset 0 0 0 1.5px ${tone.light}` : undefined,
      }}
    />
  );
}

export function ToneMark({
  marker,
  word = false,
  size = 14,
}: {
  marker: Marker;
  word?: boolean;
  size?: number;
}) {
  const tone = toneOf(marker);
  return (
    <span className="inline-flex items-center gap-2">
      <ToneBlock tone={tone} size={size} />
      {word ? tone.word : <span className="sr-only">{tone.word}</span>}
    </span>
  );
}

export function ToneTag({ marker }: { marker: Marker }) {
  return (
    <span className="inline-flex h-6 shrink-0 items-center rounded-full bg-[var(--color-subtle)] pl-2 pr-2.5 text-[12px] font-medium text-[var(--color-ink)]">
      <ToneMark marker={marker} word size={12} />
    </span>
  );
}

export function ToneBar({
  markers,
  height = 6,
}: {
  markers: Marker[];
  height?: number;
}) {
  return (
    <div className="flex w-full gap-[3px]" style={{ height }}>
      {kindsOf(markers).map((group, index) => (
        <span
          key={group.kind}
          title={`${group.names.length} ${KIND_WORD[group.kind as Kind].toLowerCase()}`}
          className="grow-x h-full rounded-full"
          style={{
            animationDelay: `${160 + 70 * index}ms`,
            flexGrow: group.names.length,
            background: group.tone.hollow ? "transparent" : group.tone.light,
            boxShadow: group.tone.hollow
              ? `inset 0 0 0 1.5px ${group.tone.light}`
              : undefined,
          }}
        />
      ))}
    </div>
  );
}

export function ToneLegend({ markers }: { markers: Marker[] }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[var(--color-muted)]">
      {kindsOf(markers).map((group) => (
        <li key={group.kind} className="flex items-center gap-2">
          <ToneBlock tone={group.tone} size={10} />
          {group.names.length} {KIND_WORD[group.kind as Kind].toLowerCase()}
        </li>
      ))}
    </ul>
  );
}

export function SetSummary({ markers }: { markers: Marker[] }) {
  const groups = kindsOf(markers);
  const flagged = groups
    .filter((group) => group.kind !== "optimal")
    .sort(
      (a, b) =>
        Number(a.kind.startsWith("slightly")) - Number(b.kind.startsWith("slightly")),
    );
  if (groups.length === 0) return null;
  const lead = flagged[0];
  if (!lead) {
    return (
      <span className="inline-flex items-center gap-2">
        <ToneBlock tone={{ light: "#0e9f6e", hollow: false }} size={12} />
        All optimal
      </span>
    );
  }
  const extra = flagged.slice(1).reduce((sum, group) => sum + group.names.length, 0);
  return (
    <span className="inline-flex items-center gap-2">
      <ToneBlock tone={lead.tone} size={12} />
      {lead.names.length} {KIND_WORD[lead.kind as Kind].toLowerCase()}
      {extra > 0 && <span className="text-[var(--color-faint)]">+{extra}</span>}
    </span>
  );
}

export function PageHeader({
  title,
  meta,
  children,
}: {
  title: string;
  meta?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <header className="mb-6">
      <div className="flex min-h-10 flex-wrap items-end gap-x-4 gap-y-2">
        <div className="min-w-0 flex-1">
          <h1 className="text-[30px] font-light leading-tight tracking-[-0.025em]">{title}</h1>
          {meta && <div className="mt-3">{meta}</div>}
        </div>
      </div>
      {children}
    </header>
  );
}

export function Facts({
  items,
}: {
  items: { label: string; value: React.ReactNode }[];
}) {
  return (
    <dl className="flex flex-wrap gap-x-8 gap-y-2">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col gap-1">
          <dt className="text-[10px] font-medium uppercase leading-3 tracking-[0.1em] text-[var(--color-faint)]">
            {item.label}
          </dt>
          <dd className="tabular text-[13px] leading-4 text-[var(--color-ink)]">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

const GLOSSARY = [
  {
    name: "ApoB",
    aliases: ["cholesterol particle count", "ApoB"],
    meaning:
      "A protein used to estimate how many cholesterol-carrying particles can enter artery walls.",
    result: "112 mg/dL",
    target: "Under 80 mg/dL",
    resultSummary: "Above this panel's target",
    resultTone: "attention" as const,
    benefitLabel: "Why this matters",
    benefit:
      "Over many years, these particles can leave cholesterol in artery walls. That buildup can narrow an artery or interrupt blood flow, increasing the chance of a heart attack or stroke. A lower count means fewer opportunities for that process to begin.",
    nextStep:
      "Review this with your full cholesterol panel, family history, and a clinician before choosing an intervention.",
    note: "This result does not mean your arteries are blocked. Everyone has ApoB, and this is one long-term risk signal considered with the rest of your health history.",
  },
  {
    name: "Ferritin",
    aliases: ["Ferritin"],
    meaning: "A marker that estimates how much iron your body has stored.",
    result: "18 ng/mL",
    target: "30 - 150 ng/mL",
    resultSummary: "Below this panel's preferred range",
    resultTone: "attention" as const,
    benefitLabel: "Why a healthy range helps",
    benefit:
      "Enough stored iron supports energy, exercise, and healthy blood cells. Too little or too much needs context.",
    nextStep:
      "Confirm the result with your blood count and full iron panel before considering supplements.",
  },
  {
    name: "High-sensitivity CRP",
    aliases: ["High-sensitivity CRP", "hs-CRP"],
    meaning: "A blood marker that can signal inflammation in your body.",
    result: "0.8 mg/L",
    target: "Under 1.0 mg/L",
    resultSummary: "Inside the lower-risk range",
    resultTone: "optimal" as const,
    benefitLabel: "Why a healthy range helps",
    benefit:
      "A lower result suggests less background inflammation. The trend matters more than one reading.",
    nextStep: "Keep the sleep routine that has tracked with this improvement.",
  },
];

const glossaryMap = new Map(
  GLOSSARY.flatMap((entry) => entry.aliases.map((alias) => [alias.toLocaleLowerCase(), entry])),
);
const glossaryPattern = new RegExp(
  `(${GLOSSARY.flatMap((entry) => entry.aliases)
    .sort((a, b) => b.length - a.length)
    .map((alias) => alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|")})`,
  "gi",
);

function GlossaryTerm({
  label,
  entry,
}: {
  label: string;
  entry: (typeof GLOSSARY)[number];
}) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const cardRef = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const anchor = buttonRef.current?.getBoundingClientRect();
      const card = cardRef.current?.getBoundingClientRect();
      if (!anchor || !card) return;
      const above = anchor.top - card.height - 10;
      const below = anchor.bottom + 10;
      const top =
        above >= 12 || window.innerHeight - anchor.bottom < card.height + 10
          ? Math.max(12, above)
          : below;
      setPos({
        top,
        left: Math.max(12, Math.min(anchor.left, window.innerWidth - card.width - 12)),
      });
    };
    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open]);
  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="pointer-events-auto cursor-help border-b border-dotted border-[var(--color-faint)] text-[var(--color-ink)] transition-colors hover:border-[var(--color-ink)]"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        {label}
      </button>
      {open && (
        <span
          ref={cardRef}
          className="pointer-events-none fixed z-[100] w-[min(320px,calc(100vw-24px))] rounded-[14px] border border-[var(--color-line)] bg-[var(--color-card)] p-4 text-left shadow-[0_12px_32px_rgba(0,0,0,0.14)]"
          style={pos}
        >
          <span className="block text-[14px] text-[var(--color-ink)]">{entry.name}</span>
          <span className="mt-1 block text-[13px] leading-relaxed text-[var(--color-muted)]">
            {entry.meaning}
          </span>
          <span className="mt-3 block rounded-[10px] bg-[var(--color-app)] p-3">
            <span className="grid grid-cols-2 gap-3">
              <span className="block">
                <span className="block text-[11px] uppercase tracking-[0.06em] text-[var(--color-faint)]">
                  Your result
                </span>
                <span
                  className="mt-0.5 block text-[14px]"
                  style={{
                    color:
                      entry.resultTone === "optimal"
                        ? "var(--color-optimal)"
                        : "var(--color-attention)",
                  }}
                >
                  {entry.result}
                </span>
              </span>
              <span className="block">
                <span className="block text-[11px] uppercase tracking-[0.06em] text-[var(--color-faint)]">
                  Panel target
                </span>
                <span className="mt-0.5 block text-[14px] text-[var(--color-ink)]">
                  {entry.target}
                </span>
              </span>
            </span>
            <span
              className="mt-2 block text-[12px]"
              style={{
                color:
                  entry.resultTone === "optimal"
                    ? "var(--color-optimal)"
                    : "var(--color-attention)",
              }}
            >
              {entry.resultSummary}
            </span>
          </span>
          <span className="my-3 block h-px bg-[var(--color-line)]" />
          <span className="block text-[11px] uppercase tracking-[0.08em] text-[var(--color-faint)]">
            {entry.benefitLabel}
          </span>
          <span className="mt-1 block text-[13px] leading-relaxed text-[var(--color-ink)]">
            {entry.benefit}
          </span>
          <span className="mt-3 block text-[11px] uppercase tracking-[0.08em] text-[var(--color-faint)]">
            What to do next
          </span>
          <span className="mt-1 block text-[13px] leading-relaxed text-[var(--color-ink)]">
            {entry.nextStep}
          </span>
          {entry.note && (
            <span className="mt-2 block text-[12px] leading-relaxed text-[var(--color-faint)]">
              {entry.note}
            </span>
          )}
        </span>
      )}
    </>
  );
}

export function GlossaryText({ text }: { text: string }) {
  const parts = text.split(glossaryPattern);
  return (
    <>
      {parts.map((part, index) => {
        const previous = index > 0 ? glossaryMap.get(parts[index - 1].toLocaleLowerCase()) : undefined;
        const content = previous ? part.replace(/^[.,;:!?)]+/, "") : part;
        const entry = glossaryMap.get(part.toLocaleLowerCase());
        if (!entry) return <span key={`${part}-${index}`}>{content}</span>;
        const punctuation = parts[index + 1]?.match(/^[.,;:!?)]+/)?.[0] ?? "";
        return (
          <span key={`${part}-${index}`} className="whitespace-nowrap">
            <GlossaryTerm label={part} entry={entry} />
            {punctuation}
          </span>
        );
      })}
    </>
  );
}

export function RangeBar({ marker }: { marker: Marker }) {
  const layout = layoutRange(marker.value, marker.range, marker.optimal);
  const tone = toneOf(marker);
  if (!layout) return null;
  const band = layout.optimal ?? {
    start: layout.bandStart,
    end: layout.bandEnd,
    lo: layout.lo,
    hi: layout.hi,
  };
  const labels = [
    ...(layout.optimal
      ? [
          { at: layout.bandStart, v: layout.lo },
          { at: layout.bandEnd, v: layout.hi },
        ]
      : []),
    { at: band.start, v: band.lo },
    { at: band.end, v: band.hi },
  ].filter((item) => Number.isFinite(item.v) && item.at > 0.01 && item.at < 0.99);
  const seen = new Set<string>();
  const unique = labels.filter((item) => {
    const key = `${item.at}-${item.v}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return (
    <div className="w-full">
      <div className="relative h-2 w-full rounded-full bg-[var(--color-subtle)]">
        {layout.optimal && (
          <div
            className="absolute inset-y-0 rounded-full bg-[rgba(17,17,16,0.07)]"
            style={{
              left: `${layout.bandStart * 100}%`,
              width: `${(layout.bandEnd - layout.bandStart) * 100}%`,
            }}
          />
        )}
        <div
          className="absolute inset-y-0 rounded-full bg-[var(--color-optimal-soft)]"
          style={{
            left: `${band.start * 100}%`,
            width: `${(band.end - band.start) * 100}%`,
            boxShadow: "inset 0 0 0 1px rgba(14,159,110,0.35)",
          }}
        />
        <span
          className="absolute top-1/2 rounded-full border-2 border-white"
          style={{
            left: `calc(${layout.position * 100}% - 7px)`,
            width: 14,
            height: 14,
            marginTop: -7,
            background: tone.hollow ? "#fff" : tone.light,
            boxShadow: tone.hollow
              ? `inset 0 0 0 2px ${tone.light}, 0 0 0 1px rgba(17,17,16,0.08)`
              : "0 0 0 1px rgba(17,17,16,0.08)",
          }}
        />
      </div>
      <div className="relative mt-1.5 h-5 text-[11px] text-[var(--color-muted)]">
        {unique.map((item) => (
          <span
            key={`${item.at}-${item.v}`}
            className="absolute top-0 flex -translate-x-1/2 flex-col items-center"
            style={{ left: `${item.at * 100}%` }}
          >
            <span className="h-1.5 w-px bg-[var(--color-line-strong)]" />
            <span className="tabular leading-none">
              {Number.isInteger(item.v) ? String(item.v) : item.v.toFixed(1)}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function Sparkline({ marker }: { marker: Marker }) {
  const history = marker.history;
  if (history.length < 2) return null;
  const draws = DRAWS.slice(0, history.length);
  const unit = unitOf(marker.value);
  const target = parseTarget(marker.optimal ?? marker.range);
  const domain = chartDomain(history, target);
  const x = (index: number) => 26 + (320 * index) / (history.length - 1);
  const y = (value: number) => 20 + ((domain.hi - value) / (domain.hi - domain.lo)) * 124;
  const top = target ? y(Math.min(target.hi, domain.hi)) : 0;
  const bottom = target ? y(Math.max(target.lo, domain.lo)) : 0;
  const path = history
    .map((value, index) => `${index ? "L" : "M"}${x(index)},${y(value)}`)
    .join(" ");
  const label = (marker.optimal ? `Optimal ${marker.optimal}` : `Target ${marker.range}`).toUpperCase();
  const tone = toneOf(marker);
  return (
    <svg viewBox="0 0 400 172" className="w-full" role="img" aria-label={`${marker.short} trend`}>
      {domain.ticks.map((tick) => (
        <g key={tick}>
          <line x1="12" x2="360" y1={y(tick)} y2={y(tick)} stroke="rgba(17,17,16,0.06)" />
          <text x="366" y={y(tick) + 3.5} fontSize="11" fill="var(--color-muted)" className="tabular">
            {Number.isInteger(tick) ? tick : tick.toFixed(1)}
          </text>
        </g>
      ))}
      {target && bottom > top && (
        <rect x="12" width="348" y={top} height={bottom - top} fill="var(--color-optimal-soft)" />
      )}
      {domain.near !== undefined && (
        <g>
          <line
            x1="12"
            x2="360"
            y1={y(domain.near)}
            y2={y(domain.near)}
            stroke="var(--color-optimal)"
            strokeDasharray="3 3"
          />
          <text
            x="14"
            y={y(domain.near) - 5}
            fontSize="9.5"
            fontWeight="500"
            letterSpacing="0.1em"
            fill="var(--color-muted)"
            className="tabular"
          >
            {label}
          </text>
        </g>
      )}
      <path d={path} fill="none" stroke="rgba(17,17,16,0.55)" strokeWidth="1.5" strokeLinejoin="round" />
      {history.map((value, index) => {
        const latest = index === history.length - 1;
        const outside = !!target && !isWithin(value, target);
        const size = latest ? 5.5 : 4;
        const fill = outside
          ? latest
            ? tone.light
            : value > (target?.hi ?? Infinity)
              ? "#df3fbf"
              : "#a68100"
          : latest
            ? "var(--color-ink)"
            : "var(--color-card)";
        return (
          <g key={draws[index].id}>
            {outside ? (
              <rect
                x={x(index) - size}
                y={y(value) - size}
                width={size * 2}
                height={size * 2}
                transform={`rotate(45 ${x(index)} ${y(value)})`}
                fill={fill}
                stroke="#fff"
                strokeWidth="1.5"
              />
            ) : (
              <circle
                cx={x(index)}
                cy={y(value)}
                r={size}
                fill={fill}
                stroke={latest ? "#fff" : "var(--color-ink)"}
                strokeWidth={latest ? 2 : 1.25}
              />
            )}
            <text
              x={x(index)}
              y="164"
              textAnchor="middle"
              fontSize="11"
              fill="var(--color-muted)"
            >
              {draws[index].short}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function Sheet({
  open,
  title,
  eyebrow,
  onClose,
  wide = false,
  footer,
  children,
}: {
  open: boolean;
  title: string;
  eyebrow?: string;
  onClose: () => void;
  wide?: boolean;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  const titleId = useId();
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40">
      <button
        type="button"
        aria-label="Close"
        className="sheet-overlay absolute inset-0 bg-[var(--scrim)]"
        data-state="open"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-state="open"
        className={`sheet fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col rounded-t-[20px] border border-[var(--color-line)] bg-[var(--color-card)] outline-none md:inset-y-2 md:left-auto md:right-2 md:max-h-none md:rounded-[18px] ${wide ? "md:w-[560px]" : "md:w-[460px]"}`}
      >
        <header className="flex items-start gap-3 border-b border-[var(--color-line)] px-6 pb-4 pt-5">
          <div className="min-w-0 flex-1">
            {eyebrow && <div className="caption mb-1">{eyebrow}</div>}
            <h2
              id={titleId}
              className="text-[26px] font-light leading-tight tracking-[-0.02em]"
            >
              {title}
            </h2>
          </div>
          <button type="button" aria-label="Close" className="group -m-1 flex shrink-0 p-1" onClick={onClose}>
            <CloseMark />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">{children}</div>
        {footer && (
          <footer className="border-t border-[var(--color-line)] px-6 py-3">{footer}</footer>
        )}
      </section>
    </div>
  );
}

export function Menu({
  label,
  align = "start",
  width,
  trigger,
  children,
}: {
  label?: string;
  align?: "start" | "end";
  width: number;
  trigger: (props: { open: boolean }) => React.ReactNode;
  children: (close: () => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        data-state={open ? "open" : "closed"}
        className="border-0 bg-transparent p-0 text-inherit"
        onClick={() => setOpen((value) => !value)}
      >
        {trigger({ open })}
      </button>
      {open && (
        <div
          role="menu"
          data-state="open"
          className={`pop-in absolute top-[calc(100%+8px)] z-50 rounded-[12px] border border-[var(--color-line)] bg-[var(--color-card)] p-1.5 text-[var(--color-ink)] shadow-[var(--pop)] ${align === "end" ? "right-0" : "left-0"}`}
          style={{ width, ["--pop-origin" as string]: align === "end" ? "100% 0" : "0 0" }}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}
