"use client";

import { NEXT_TEST } from "@/lib/data";
import { TESTS, type Test } from "@/lib/catalog";
import { useDraw } from "@/lib/draw";
import { toneOf } from "@/lib/metrics";
import { usePlan } from "@/lib/plan";
import { Check, Drop, Heartbeat, Leaf } from "./icons";
import { Cube, Microscope, Plus, Smoke, Spores, StarOfLife } from "./glyphs";
import { MiniSpectrum } from "./marker-table";
import { Facts, PageHeader, ToneBlock } from "./parts";

const ICONS = {
  drop: Drop,
  heart: Heartbeat,
  leaf: Leaf,
  flask: Smoke,
  dna: StarOfLife,
  wind: Spores,
  atom: Cube,
  microscope: Microscope,
} as const;

function AddButton({ name, on, toggle }: { name: string; on: boolean; toggle: () => void }) {
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? `Remove ${name} from your ${NEXT_TEST.short} draw` : `Add ${name} to your ${NEXT_TEST.short} draw`}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors"
      style={{ background: on ? "var(--color-ink)" : "var(--color-subtle)", color: on ? "#fff" : "var(--color-ink)" }}
    >
      {on ? <Check size={13} /> : <Plus size={13} />}
    </button>
  );
}

function NextDraw({ added }: { added: Test[] }) {
  const total = added.reduce((sum, test) => sum + test.price, 0);
  const [month, day] = NEXT_TEST.short.split(" ");
  return (
    <section className="tile-dark flex min-h-[300px] flex-col rounded-[var(--radius-card)] p-6 text-white">
      <p className="text-[13px] text-[var(--dock-muted)]">Your next draw</p>
      <p className="mt-2 flex items-baseline gap-2">
        <span className="tabular text-[56px] font-extralight leading-none tracking-[-0.04em]">{day}</span>
        <span className="text-[17px] text-[var(--dock-muted)]">
          {month} 2026
        </span>
      </p>
      <p className="mt-2 text-[13px] text-[var(--dock-muted)]">Your core panel is included.</p>
      <ul className="mt-auto flex flex-col pt-6 text-[13px]">
        {added.length === 0 ? (
          <li className="text-[var(--dock-muted)]">Nothing added yet</li>
        ) : (
          added.map((test) => (
            <li key={test.id} className="overflow-hidden">
              <span className="flex items-baseline justify-between gap-3 border-t border-[rgba(255,255,255,0.1)] py-2">
                <span className="truncate">{test.name}</span>
                <span className="tabular text-[var(--dock-muted)]">${test.price}</span>
              </span>
            </li>
          ))
        )}
      </ul>
      {added.length > 0 && (
        <p className="mt-2 flex items-baseline justify-between border-t border-[rgba(255,255,255,0.18)] pt-3 text-[13px]">
          <span className="text-[var(--dock-muted)]">Added to your draw</span>
          <span className="tabular text-[17px]">${total}</span>
        </p>
      )}
    </section>
  );
}

function Suggested({ test, on, toggle }: { test: Test; on: boolean; toggle: () => void }) {
  const { markers } = useDraw();
  const marker = markers.find((item) => item.name === test.follows);
  const tone = marker ? toneOf(marker) : null;
  return (
    <article className="card flex min-h-[300px] flex-col p-6">
      <h3 className="text-[20px] font-light leading-tight tracking-[-0.015em]">{test.name}</h3>
      <p className="mt-1 text-[13px] leading-[1.5] text-[var(--color-muted)]">{test.measures}</p>
      {marker && tone && (
        <div className="mt-6 rounded-[var(--radius-inner)] bg-[var(--color-subtle)] px-4 py-3">
          <p className="flex items-start gap-2 text-[13px] leading-[18px]">
            <span className="mt-[3px]">
              <ToneBlock tone={tone} size={12} />
            </span>
            <span className="min-w-0 flex-1">
              Because {marker.short.toLowerCase()} is {tone.word.toLowerCase()}
            </span>
            <span className="tabular whitespace-nowrap text-[12px] text-[var(--color-muted)]">{marker.value}</span>
          </p>
          <div className="mt-2">
            <MiniSpectrum tone={tone} />
          </div>
        </div>
      )}
      <div className="mt-auto flex items-end justify-between pt-6">
        <span>
          <span className="tabular text-[32px] font-extralight leading-none tracking-[-0.03em]">${test.price}</span>
          <span className="mt-1 block text-[12px] text-[var(--color-muted)]">{test.sample}</span>
        </span>
        <AddButton name={test.name} on={on} toggle={toggle} />
      </div>
    </article>
  );
}

function Specialty({ test, on, toggle }: { test: Test; on: boolean; toggle: () => void }) {
  const Icon = ICONS[test.icon];
  return (
    <article className="card flex flex-col p-5">
      <div className="flex items-start justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-subtle)] text-[var(--color-muted)]">
          <Icon size={17} />
        </span>
        <AddButton name={test.name} on={on} toggle={toggle} />
      </div>
      <h3 className="mt-4 text-[15px] font-medium tracking-[-0.005em]">{test.name}</h3>
      <p className="mt-1 text-[13px] leading-[1.5] text-[var(--color-muted)]">{test.measures}</p>
      <div className="mt-auto flex items-end justify-between gap-3 pt-5">
        <Facts
          items={[
            { label: "Collection", value: test.sample.split(",")[0] },
            { label: "Results", value: test.turnaround },
          ]}
        />
        <span className="tabular text-[15px]">${test.price}</span>
      </div>
    </article>
  );
}

export function MarketplaceScreen() {
  const { added, toggleAdded } = usePlan();
  const suggested = TESTS.filter((test) => test.shelf === "suggested");
  const addons = TESTS.filter((test) => test.shelf === "addon");
  return (
    <>
      <PageHeader
        title="Marketplace"
        meta={
          <Facts
            items={[
              { label: "Available", value: `${TESTS.length} tests` },
              { label: "For your results", value: suggested.length },
              { label: "Added", value: `${added.size} ${added.size === 1 ? "test" : "tests"}` },
            ]}
          />
        }
      />
      <div className="rise grid grid-cols-1 gap-3 lg:grid-cols-3">
        <NextDraw added={TESTS.filter((test) => added.has(test.id))} />
        {suggested.map((test) => (
          <Suggested key={test.id} test={test} on={added.has(test.id)} toggle={() => toggleAdded(test.id)} />
        ))}
      </div>
      <section className="rise mt-8" style={{ animationDelay: "60ms" }}>
        <h2 className="caption mb-2 font-medium">Specialty tests</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {addons.map((test) => (
            <Specialty key={test.id} test={test} on={added.has(test.id)} toggle={() => toggleAdded(test.id)} />
          ))}
        </div>
      </section>
    </>
  );
}
