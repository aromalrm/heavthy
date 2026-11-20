"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DRAWS, GROUPS, NEXT_TEST, PERSONA, type Marker } from "@/lib/data";
import { useDraw } from "@/lib/draw";
import { kindsOf, niceScale, STATUS_RANK, tally } from "@/lib/metrics";
import { slugify } from "@/lib/systems";
import { BioAge, Spectrum } from "./home-screen";
import { useInspector } from "./inspector";
import {
  Bolt,
  Brain,
  Drop,
  Fire,
  Flask,
  Heart,
  Heartbeat,
  Hormone,
  Kidney,
  Leaf,
  Lightning,
  Liver,
  SearchIcon,
  Shield,
  ShieldCheck,
  Thyroid,
} from "./icons";
import { MarkerHead, MarkerRow, rowKeys } from "./marker-table";
import { Chevron, Facts, PageHeader, SetSummary, ToneBar, ToneBlock } from "./parts";

const FILTERS = ["all", "attention", "inrange", "optimal"] as const;
const FILTER_LABEL = {
  all: "All",
  attention: "Low or high",
  inrange: "Slightly off",
  optimal: "Optimal",
} as const;

const YEARS = [
  { name: "High-sensitivity CRP", years: -1.2 },
  { name: "Fasting Insulin", years: -0.9 },
  { name: "Apolipoprotein B (ApoB)", years: 0.8 },
  { name: "Hemoglobin A1c", years: -0.7 },
  { name: "Ferritin", years: 0.4 },
];

const WASH = {
  heart: "#dde2fb",
  metabolism: "#cfebe5",
  organs: "#e3d8f5",
  vitality: "#efe2cc",
} as const;

const GROUP_ICON = {
  heart: Heart,
  metabolism: Bolt,
  organs: Flask,
  vitality: Shield,
} as const;

const SYSTEM_ICON: Record<string, typeof Heartbeat> = {
  "Heart & Vascular Health": Heartbeat,
  "Metabolic Health": Drop,
  Energy: Lightning,
  "Thyroid Health": Thyroid,
  "Liver Health": Liver,
  "Kidney Health": Kidney,
  Inflammation: Fire,
  "Immune System": ShieldCheck,
  "Sex Hormones": Hormone,
  Nutrients: Leaf,
  "Brain Health": Brain,
};

const LIST =
  "grid-cols-[28px_minmax(0,1fr)_auto_16px] sm:grid-cols-[28px_minmax(0,1fr)_96px_160px_16px]";

function Biomarkers() {
  const { markers } = useDraw();
  const { openMarker } = useInspector();
  const [status, setStatus] = useState<(typeof FILTERS)[number]>("all");
  const [query, setQuery] = useState("");
  const counts = tally(markers);
  const text = query.trim().toLowerCase();
  const rows = markers
    .filter((marker) => status === "all" || marker.status === status)
    .filter((marker) => !text || `${marker.short} ${marker.name} ${marker.system}`.toLowerCase().includes(text))
    .sort((a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status]);
  return (
    <div className="flex flex-col gap-3">
      <Spectrum compact onOpen={openMarker} />
      <section className="mt-3 flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
        <div className="flex w-full min-w-0 flex-wrap items-center justify-between gap-2">
          <div
            role="tablist"
            aria-label="Filter by status"
            className="flex max-w-full overflow-x-auto rounded-full bg-[var(--color-subtle)] p-[3px] [scrollbar-width:none]"
          >
            {FILTERS.map((key) => {
              const selected = status === key;
              const count = key === "all" ? counts.total : counts[key];
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setStatus(key)}
                  className="relative flex h-7 shrink-0 items-center gap-1.5 rounded-full px-3 text-[12px] transition-colors"
                  style={{ color: selected ? "var(--color-ink)" : "var(--color-muted)" }}
                >
                  {selected && (
                    <span className="absolute inset-0 rounded-full bg-[var(--color-card)] shadow-[0_0_0_1px_var(--color-line)]" />
                  )}
                  <span className="relative">{FILTER_LABEL[key]}</span>
                  <span className="tabular relative text-[11px] text-[var(--color-muted)]">{count}</span>
                </button>
              );
            })}
          </div>
          <label className="flex h-[34px] w-[240px] items-center gap-2 rounded-full bg-[var(--color-subtle)] px-3.5 shadow-[inset_0_0_0_1px_transparent] transition-[background-color,box-shadow] duration-200 focus-within:bg-[var(--color-card)] focus-within:shadow-[inset_0_0_0_1px_var(--color-line-strong)]">
            <SearchIcon size={14} className="text-[var(--color-muted)]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter results"
              aria-label="Filter results"
              className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-[var(--color-faint)]"
            />
          </label>
        </div>
      </section>
      <section onKeyDown={rowKeys} className="card overflow-hidden">
        <MarkerHead />
        {rows.length === 0 && (
          <p className="px-4 py-10 text-center text-[13px] text-[var(--color-muted)]">
            No results match.{" "}
            <button
              type="button"
              className="underline"
              onClick={() => {
                setQuery("");
                setStatus("all");
              }}
            >
              Clear filters
            </button>
          </p>
        )}
        {rows.map((marker) => (
          <MarkerRow key={marker.name} marker={marker} />
        ))}
      </section>
    </div>
  );
}

function flagOf(markers: Marker[], system: string) {
  const lead = kindsOf(markers.filter((marker) => marker.system === system))
    .filter((group) => group.kind !== "optimal")
    .sort((a, b) => Number(a.kind.startsWith("slightly")) - Number(b.kind.startsWith("slightly")))[0];
  if (!lead) return null;
  return { tone: lead.tone, title: `${lead.names.length} ${lead.kind.replace("-", " ")}`, names: lead.names };
}

function lanes(count: number) {
  const span = (count - 1) * 28;
  return Array.from({ length: count }, (_, index) => 148 - span / 2 + 28 * index);
}

function SystemMap() {
  const { markers } = useDraw();
  const { openGroup } = useInspector();
  const [hover, setHover] = useState<{ group: string; system?: string } | null>(null);
  const lit = (group: string, system?: string) =>
    !hover || (hover.group === group && (!hover.system || !system || hover.system === system));
  const fade = (on: boolean) => ({ opacity: on ? 1 : 0.28, transition: "opacity 200ms var(--ease)" });
  return (
    <div
      className="card relative overflow-hidden"
      style={{ height: 240 }}
      aria-label="Map of body systems by group"
      onPointerLeave={() => setHover(null)}
    >
      {GROUPS.map((group, index) => (
        <span
          key={group.key}
          aria-hidden
          className="pointer-events-none absolute h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            left: `${25 * index + 12.5}%`,
            top: "58%",
            background: `radial-gradient(closest-side, ${WASH[group.key as keyof typeof WASH]} 0%, rgba(255,255,255,0) 100%)`,
            ...fade(lit(group.key)),
          }}
        />
      ))}
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 240" preserveAspectRatio="none" aria-hidden>
        {GROUPS.map((group, index) => {
          const ys = lanes(group.systems.length);
          const mid = ys.reduce((sum, value) => sum + value, 0) / ys.length;
          const x1 = 25 * index + 5;
          const x2 = 25 * index + 12.5;
          const bend = (x2 - x1) * 0.55;
          return group.systems.map((system, systemIndex) => {
            const flag = flagOf(markers, system);
            const y = ys[systemIndex];
            return (
              <path
                key={system}
                d={`M${x1} ${mid}C${x1 + bend} ${mid} ${x2 - bend} ${y} ${x2 - 0.4} ${y}`}
                fill="none"
                stroke={flag ? flag.tone.light : "rgba(17,17,16,0.2)"}
                strokeOpacity={flag ? 0.8 : 1}
                strokeDasharray={flag?.tone.hollow ? "3 3" : undefined}
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
                style={fade(lit(group.key, system))}
              />
            );
          });
        })}
      </svg>
      {GROUPS.map((group, index) => {
        const ys = lanes(group.systems.length);
        const mid = ys.reduce((sum, value) => sum + value, 0) / ys.length;
        const members = markers.filter((marker) => marker.group === group.key);
        const optimal = members.filter((marker) => marker.status === "optimal").length;
        return (
          <div key={group.key} onPointerEnter={() => setHover({ group: group.key })}>
            <button
              type="button"
              onClick={() => openGroup(group.key)}
              className="group absolute text-left"
              style={{ left: `calc(${25 * index + 5}% - 5px)`, top: 24, ...fade(lit(group.key)) }}
            >
              <span className="block whitespace-nowrap text-[13px] font-medium">{group.title}</span>
              <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-[0.1em] text-[var(--color-faint)]">
                {optimal} of {members.length} optimal
              </span>
            </button>
            <span
              aria-hidden
              className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--color-ink)] bg-[var(--color-card)]"
              style={{ left: `${25 * index + 5}%`, top: mid, ...fade(lit(group.key)) }}
            />
            {group.systems.map((system, systemIndex) => {
              const flag = flagOf(markers, system);
              const members = markers.filter((marker) => marker.system === system);
              return (
                <Link
                  key={system}
                  href={`/data/${slugify(system)}`}
                  onPointerEnter={() => setHover({ group: group.key, system })}
                  className="group absolute flex -translate-y-1/2 items-center gap-2"
                  style={{ left: `calc(${25 * index + 12.5}% - 5px)`, top: ys[systemIndex], ...fade(lit(group.key, system)) }}
                >
                  {flag ? (
                    <span className="group/tip relative flex w-2.5 justify-center" title={[flag.title, ...flag.names].join("\n")}>
                      <ToneBlock tone={flag.tone} size={12} />
                    </span>
                  ) : (
                    <span className="h-2.5 w-2.5 shrink-0 rounded-[2px] border border-[rgba(17,17,16,0.4)] bg-[var(--color-card)] transition-colors group-hover:bg-[var(--color-ink)]" />
                  )}
                  <span className="whitespace-nowrap text-[12px]" style={{ color: flag ? "var(--color-ink)" : "var(--color-muted)" }}>
                    {system.replace(" Health", "")}
                    <span className="ml-1.5 text-[11px] text-[var(--color-faint)]">
                      {members.filter((marker) => marker.status === "optimal").length}/{members.length}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function Systems() {
  const { markers } = useDraw();
  return (
    <div className="flex flex-col gap-3">
      <SystemMap />
      <section className="card overflow-hidden">
        <div className={`caption hidden h-9 items-center gap-x-4 border-b border-[var(--color-line)] px-4 sm:grid ${LIST}`}>
          <span />
          <span>System</span>
          <span className="text-right">Optimal</span>
          <span>Results</span>
          <span />
        </div>
        {GROUPS.map((group) => {
          const Icon = GROUP_ICON[group.key as keyof typeof GROUP_ICON];
          const counts = tally(markers.filter((marker) => marker.group === group.key));
          return (
            <div key={group.key}>
              <div className={`grid h-10 items-center gap-x-4 border-t border-[var(--color-line)] bg-[var(--color-app)] px-4 first:border-t-0 ${LIST}`}>
                <span className="flex w-7 justify-center">{Icon && <Icon size={16} />}</span>
                <span className="text-[13px] font-medium">{group.title}</span>
                <span className="caption tabular hidden text-right sm:block">
                  {group.systems.length > 1 ? `${counts.optimal} of ${counts.total}` : ""}
                </span>
                <span className="hidden sm:block" />
                <span />
              </div>
              {group.systems.map((system) => {
                const members = markers.filter((marker) => marker.system === system);
                const counts = tally(members);
                const Icon = SYSTEM_ICON[system];
                return (
                  <Link
                    key={system}
                    href={`/data/${slugify(system)}`}
                    className={`row-hover grid h-12 items-center gap-x-4 border-t border-[var(--color-line)] px-4 ${LIST}`}
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[var(--color-subtle)]">
                      {Icon && <Icon size={16} />}
                    </span>
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="truncate text-[14px]">{system}</span>
                      {members.some((marker) => marker.status !== "optimal") && (
                        <span className="text-[12px] text-[var(--color-muted)]">
                          <SetSummary markers={members} />
                        </span>
                      )}
                    </span>
                    <span className="tabular hidden text-right text-[13px] sm:block">
                      {counts.optimal} of {counts.total}
                    </span>
                    <span className="hidden sm:block">
                      <ToneBar markers={members} />
                    </span>
                    <Chevron />
                  </Link>
                );
              })}
            </div>
          );
        })}
      </section>
    </div>
  );
}

function AgeChart({ upTo }: { upTo: number }) {
  const age = PERSONA.age;
  const values = [...DRAWS.map((draw) => draw.bioAge), age];
  const scale = niceScale(Math.min(...values) - 0.5, Math.max(...values) + 0.5, 4);
  const color = DRAWS[upTo].bioAge <= age ? "var(--color-optimal)" : "var(--color-inrange)";
  const x = (index: number) => 44 + (416 * index) / (DRAWS.length - 1);
  const y = (value: number) => 18 + ((scale.hi - value) / (scale.hi - scale.lo)) * 108;
  const shown = DRAWS.slice(0, upTo + 1);
  return (
    <svg viewBox="0 0 520 150" className="mt-2 w-full" role="img" aria-label={shown.map((draw) => `${draw.short} ${draw.bioAge}`).join(", ")}>
      {scale.ticks.map((tick) => (
        <g key={tick}>
          <line x1={44} x2={460} y1={y(tick)} y2={y(tick)} stroke="rgba(17,17,16,0.06)" />
          <text x={24} y={y(tick) + 3.5} textAnchor="end" fontSize={10} className="tabular" fill="var(--color-muted)">
            {tick}
          </text>
        </g>
      ))}
      <line x1={44} x2={460} y1={y(age)} y2={y(age)} stroke="var(--color-ink)" strokeDasharray="3 4" opacity={0.5} />
      <text x={466} y={y(age) + 3.5} fontSize={10.5} fill="var(--color-muted)">
        You, {age}
      </text>
      <polyline
        points={shown.map((draw, index) => `${x(index)},${y(draw.bioAge)}`).join(" ")}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {DRAWS.map((draw, index) => (
        <g key={draw.id}>
          {index <= upTo && (
            <>
              <circle cx={x(index)} cy={y(draw.bioAge)} r={index === upTo ? 4.5 : 3} fill={index === upTo ? color : "#fff"} stroke={color} strokeWidth={1.5} />
              <text x={x(index)} y={y(draw.bioAge) - 9} textAnchor="middle" fontSize={10.5} className="tabular" fill="var(--color-ink)">
                {draw.bioAge}
              </text>
            </>
          )}
          <text x={x(index)} y={144} textAnchor="middle" fontSize={10.5} fill="var(--color-muted)">
            {draw.short}
          </text>
        </g>
      ))}
    </svg>
  );
}

function Age() {
  const { markers, index, isLatest } = useDraw();
  const { openMarker } = useInspector();
  const younger = Math.round((DRAWS[0].bioAge - DRAWS[index].bioAge) * 10) / 10;
  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <BioAge size="large" />
      <div className="flex flex-col gap-3">
        <section className="card p-4">
          <h2 className="caption font-medium">Across your tests</h2>
          <p className="mt-0.5 text-[14px] font-medium">
            {younger > 0 ? `${younger} years younger than in October` : "Your first test"}
          </p>
          <AgeChart upTo={index} />
        </section>
        <section className="card overflow-hidden" onKeyDown={rowKeys}>
          <h2 className="caption flex h-9 items-center px-4 font-medium">What moves it, in years</h2>
          {!isLatest && (
            <p className="border-t border-[var(--color-line)] px-4 py-3 text-[13px] text-[var(--color-muted)]">
              Contributions are worked out for your latest test.
            </p>
          )}
          {isLatest &&
            YEARS.map((item) => {
              const marker = markers.find((entry) => entry.name === item.name);
              if (!marker) return null;
              const adds = item.years > 0;
              return (
                <button
                  key={item.name}
                  type="button"
                  data-row
                  onClick={() => openMarker(marker)}
                  className="row-hover grid h-11 w-full grid-cols-[8px_minmax(0,1fr)_auto_96px_14px] items-center gap-x-3 border-t border-[var(--color-line)] px-4 text-left"
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: adds ? "var(--color-attention)" : "var(--color-optimal)" }} />
                  <span className="truncate text-[14px]">{marker.short}</span>
                  <span className="tabular text-[13px] text-[var(--color-muted)]">{marker.value}</span>
                  <span className="tabular text-right text-[13px]">
                    {adds ? "+" : "−"}
                    {Math.abs(item.years)} yrs
                  </span>
                  <Chevron />
                </button>
              );
            })}
          {isLatest && (
            <div className="grid h-11 grid-cols-[8px_minmax(0,1fr)_96px_14px] items-center gap-x-3 border-t border-[var(--color-line)] px-4">
              <span className="h-2 w-2 rounded-full bg-[var(--color-line-strong)]" />
              <span className="text-[14px] text-[var(--color-muted)]">Everything else</span>
              <span className="tabular text-right text-[13px] text-[var(--color-muted)]">−0.6 yrs</span>
              <span />
            </div>
          )}
          <p className="caption border-t border-[var(--color-line)] px-4 py-3">
            An estimate from {markers.length} blood biomarkers. Not a diagnosis.
          </p>
        </section>
      </div>
    </div>
  );
}

const TABS = [
  { key: "biomarkers", label: "Biomarkers" },
  { key: "systems", label: "Systems" },
  { key: "age", label: "Biological age" },
] as const;

export function DataScreen() {
  const params = useSearchParams();
  const { draw, markers } = useDraw();
  const tab = TABS.find((item) => item.key === params.get("tab"))?.key ?? "biomarkers";
  return (
    <>
      <PageHeader
        title="Data"
        meta={
          <Facts
            items={[
              { label: "Tested", value: draw.label },
              { label: "Results", value: markers.length },
              { label: "Next test", value: NEXT_TEST.date },
            ]}
          />
        }
      >
        <nav role="tablist" className="mt-4 flex w-fit gap-1 rounded-full bg-[var(--color-subtle)] p-[3px]">
          {TABS.map((item) => {
            const selected = item.key === tab;
            return (
              <Link
                key={item.key}
                role="tab"
                aria-selected={selected}
                href={item.key === "biomarkers" ? "/data" : `/data?tab=${item.key}`}
                scroll={false}
                className="relative flex h-7 items-center rounded-full px-3.5 text-[13px] transition-colors"
                style={{ color: selected ? "#fff" : "var(--color-muted)" }}
              >
                {selected && <span className="absolute inset-0 rounded-full bg-[var(--color-ink)]" />}
                <span className="relative">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </PageHeader>
      <div className="rise" key={tab}>
        {tab === "biomarkers" && <Biomarkers />}
        {tab === "systems" && <Systems />}
        {tab === "age" && <Age />}
      </div>
      <p className="caption mt-6">For information, not medical advice.</p>
    </>
  );
}
