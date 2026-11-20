"use client";

import Link from "next/link";
import { HORIZONS, NEXT_TEST, PROTOCOL } from "@/lib/data";
import { useDraw } from "@/lib/draw";
import { TESTS } from "@/lib/catalog";
import { usePlan } from "@/lib/plan";
import { useInspector } from "./inspector";
import { Check, Drop, ListChecks } from "./icons";
import { Chevron, Facts, PageHeader, RangeBar, ToneMark } from "./parts";

function Step({
  item,
  done,
  onToggle,
}: {
  item: (typeof PROTOCOL)[number];
  done: boolean;
  onToggle: () => void;
}) {
  const { markers } = useDraw();
  const { openMarker } = useInspector();
  return (
    <div
      id={item.id}
      className="grid scroll-mt-24 grid-cols-[24px_minmax(0,1fr)] gap-x-3 border-t border-[var(--color-line)] px-4 py-3.5 first-of-type:border-t-0 target:bg-[var(--color-optimal-soft)] sm:grid-cols-[24px_minmax(0,1fr)_auto]"
    >
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={done}
        aria-label={done ? `Mark "${item.title}" not done` : `Mark "${item.title}" done`}
        className="mt-px flex h-6 w-6 items-center justify-center rounded-full border transition-colors"
        style={{
          borderColor: done ? "var(--color-ink)" : "var(--color-line-strong)",
          background: done ? "var(--color-ink)" : "transparent",
        }}
      >
        {done && <Check size={14} className="text-white" />}
      </button>
      <div className="min-w-0">
        <p
          className="text-[14px] font-medium"
          style={{ color: done ? "var(--color-muted)" : undefined, textDecoration: done ? "line-through" : undefined }}
        >
          {item.title}
        </p>
        <p className="mt-0.5 text-[13px] leading-[1.5] text-[var(--color-muted)]">{item.why}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {item.targets.map((name) => {
            const marker = markers.find((entry) => entry.name === name);
            if (!marker) return null;
            return (
              <button
                key={name}
                type="button"
                onClick={() => openMarker(marker)}
                className="flex h-6 items-center gap-1.5 rounded-full border border-[var(--color-line)] px-2 text-[12px] transition-colors hover:border-[var(--color-line-strong)]"
              >
                <ToneMark marker={marker} size={12} />
                {marker.short}
                <span className="tabular text-[11px] text-[var(--color-muted)]">{marker.value}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="col-start-2 mt-3 sm:col-start-3 sm:mt-0 sm:text-right">
        {item.progress ? (
          <div className="flex flex-col gap-1.5 sm:items-end">
            <div className="flex gap-[3px]" aria-hidden>
              {Array.from({ length: item.progress.of }, (_, index) => {
                const filled = index < item.progress!.done;
                return (
                  <span
                    key={index}
                    className="h-2 w-2 rounded-full"
                    style={{
                      background: filled ? "var(--color-ink)" : "transparent",
                      boxShadow: filled ? undefined : "inset 0 0 0 1px var(--color-line-strong)",
                    }}
                  />
                );
              })}
            </div>
            <span className="caption tabular">
              {item.progress.done} of {item.progress.of} {item.progress.unit}
            </span>
          </div>
        ) : (
          item.due && <span className="caption">{item.due}</span>
        )}
      </div>
    </div>
  );
}

export function ProtocolScreen() {
  const { done, added, toggleDone } = usePlan();
  const names = TESTS.filter((test) => added.has(test.id)).map((test) => test.name);
  const { markers, isLatest, draw } = useDraw();
  const { openMarker } = useInspector();
  const movers = ["Apolipoprotein B (ApoB)", "Ferritin", "High-sensitivity CRP"]
    .map((name) => markers.find((marker) => marker.name === name))
    .filter((marker) => marker !== undefined);
  return (
    <>
      <PageHeader
        title="Protocol"
        meta={
          <Facts
            items={[
              { label: "Built from", value: "Jul 8, 2026" },
              ...(isLatest ? [] : [{ label: "Values from", value: draw.label }]),
              { label: "Retest", value: NEXT_TEST.date },
              { label: "Done", value: `${done.size} of ${PROTOCOL.length}` },
            ]}
          />
        }
      />
      <div className="rise grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-3">
          {HORIZONS.map((horizon) => {
            const steps = PROTOCOL.filter((step) => step.horizon === horizon.key);
            return (
              <section key={horizon.key} className="card overflow-hidden">
                <header className="flex h-10 items-center justify-between border-b border-[var(--color-line)] px-4">
                  <h2 className="text-[14px] font-medium">{horizon.label}</h2>
                  <span className="caption tabular">
                    {steps.filter((step) => done.has(step.id)).length}/{steps.length}
                  </span>
                </header>
                {steps.map((step) => (
                  <Step key={step.id} item={step} done={done.has(step.id)} onToggle={() => toggleDone(step.id)} />
                ))}
              </section>
            );
          })}
        </div>
        <aside className="flex flex-col gap-3">
          <section className="card overflow-hidden">
            <h2 className="caption flex h-9 items-center px-4 font-medium">What it should move</h2>
            {movers.map((marker) => (
              <button
                key={marker.name}
                type="button"
                onClick={() => openMarker(marker)}
                className="row-hover flex w-full flex-col gap-2 border-t border-[var(--color-line)] px-4 py-3 text-left"
              >
                <span className="flex items-center gap-2 text-[13px]">
                  <ToneMark marker={marker} size={12} />
                  <span className="flex-1">{marker.short}</span>
                  <span className="tabular text-[13px]">{marker.value}</span>
                </span>
                <RangeBar marker={marker} />
                <span className="caption">Target {marker.range}</span>
              </button>
            ))}
          </section>
          <Link
            href="/marketplace"
            className="card group flex items-center gap-3 p-4 transition-colors hover:border-[var(--color-line-strong)]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-subtle)]">
              <Drop size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-medium">Next test, {NEXT_TEST.date}</span>
              <span className="block text-[13px] text-[var(--color-muted)]">
                {names.length ? `Added: ${names.join(", ")}` : "Add tests to this draw"}
              </span>
            </span>
            <Chevron />
          </Link>
        </aside>
      </div>
    </>
  );
}
