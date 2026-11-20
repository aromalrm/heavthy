"use client";

import Link from "next/link";
import { GROUPS, PROTOCOL } from "@/lib/data";
import { useDraw } from "@/lib/draw";
import { STATUS_RANK, tally } from "@/lib/metrics";
import { panelForSystem } from "@/lib/panel";
import type { SystemStory } from "@/lib/systems";
import { useInspector } from "./inspector";
import { Agent, CaretDown, ListChecks } from "./icons";
import { MarkerHead, MarkerRow, rowKeys } from "./marker-table";
import { Chevron, Facts, GlossaryText, PageHeader, ToneBar, ToneLegend } from "./parts";

const WASH = {
  heart: "#e9ebfb",
  metabolism: "#e2f2ef",
  organs: "#efe8f8",
  vitality: "#f4eee3",
} as const;

export function SystemScreen({ story }: { story: SystemStory }) {
  const { markers, isLatest, draw } = useDraw();
  const { openMarker, openAsk } = useInspector();
  const rows = markers
    .filter((marker) => marker.system === story.system)
    .sort((a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status]);
  const extra = panelForSystem(story.system);
  const counts = tally(rows);
  const names = new Set(rows.map((marker) => marker.name));
  const steps = PROTOCOL.filter((step) => step.targets.some((target) => names.has(target)));
  const questions = rows.flatMap((marker) => marker.askQuestions ?? []).slice(0, 3);
  const group = GROUPS.find((item) => item.key === story.group);
  return (
    <>
      <PageHeader
        title={story.system}
        meta={
          <Facts
            items={[
              {
                label: "Group",
                value: (
                  <Link
                    href="/data?tab=systems"
                    className="underline decoration-[var(--color-line-strong)] underline-offset-[3px] hover:decoration-[var(--color-ink)]"
                  >
                    {group?.title}
                  </Link>
                ),
              },
              { label: "Optimal", value: `${counts.optimal} of ${counts.total}` },
              { label: "Tested", value: draw.label },
            ]}
          />
        }
      />
      <div className="rise grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-3">
          {isLatest && (
            <section
              className="card p-5"
              style={{ background: `linear-gradient(135deg, ${WASH[story.group]} 0%, #ffffff 70%)` }}
            >
              <h2 className="caption font-medium">What this system says</h2>
              <p className="mt-2 text-[17px] leading-[1.55]">
                <GlossaryText text={story.story} />
              </p>
            </section>
          )}
          <section onKeyDown={rowKeys} className="card overflow-hidden">
            <MarkerHead />
            {rows.length === 0 ? (
              <p className="px-4 py-8 text-center text-[13px] text-[var(--color-muted)]">
                No results for this system in the {draw.label} test.
              </p>
            ) : (
              rows.map((marker) => <MarkerRow key={marker.name} marker={marker} />)
            )}
          </section>
          {extra.length > 0 && (
            <details className="card group p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-[13px]">
                <span>
                  {extra.length} more measured in your panel
                  <span className="ml-2 text-[var(--color-muted)]">Not in this test</span>
                </span>
                <CaretDown size={14} className="text-[var(--color-muted)] transition-transform group-open:rotate-180" />
              </summary>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {extra.map((marker) => (
                  <button
                    key={marker.name}
                    type="button"
                    onClick={() => openMarker(marker)}
                    className="h-7 rounded-full border border-[var(--color-line)] px-2.5 text-[13px] text-[var(--color-muted)] transition-colors hover:border-[var(--color-line-strong)] hover:text-[var(--color-ink)]"
                  >
                    {marker.name}
                  </button>
                ))}
              </div>
            </details>
          )}
        </div>
        <aside className="flex flex-col gap-3">
          <section className="card p-4">
            <h2 className="caption font-medium">Results</h2>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="tabular text-[44px] font-extralight leading-none tracking-[-0.03em]">{counts.optimal}</span>
              <span className="text-[13px] text-[var(--color-muted)]">of {counts.total} optimal</span>
            </div>
            <div className="mt-3">
              <ToneBar markers={rows} height={8} />
            </div>
            <div className="mt-4">
              <ToneLegend markers={rows} />
            </div>
          </section>
          {isLatest && (
            <section className="card p-4">
              <h2 className="caption font-medium">Focus</h2>
              <p className="mt-2 text-[14px] leading-[1.55]">
                <GlossaryText text={story.focus} />
              </p>
            </section>
          )}
          {steps.length > 0 && (
            <section className="card overflow-hidden">
              <h2 className="caption flex h-9 items-center px-4 font-medium">In your protocol</h2>
              {steps.map((step) => (
                <Link
                  key={step.id}
                  href={`/protocol#${step.id}`}
                  className="row-hover flex min-h-11 items-center gap-2.5 border-t border-[var(--color-line)] px-4 py-2 text-[13px]"
                >
                  <ListChecks size={16} className="shrink-0 text-[var(--color-muted)]" />
                  <span className="flex-1">{step.title}</span>
                  <Chevron />
                </Link>
              ))}
            </section>
          )}
          {questions.length > 0 && (
            <section className="card overflow-hidden">
              <h2 className="caption flex h-9 items-center px-4 font-medium">Ask about this system</h2>
              {questions.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => openAsk(question, story.system)}
                  className="row-hover flex min-h-11 w-full items-center gap-2.5 border-t border-[var(--color-line)] px-4 py-2 text-left text-[13px]"
                >
                  <Agent size={16} className="shrink-0 text-[var(--color-muted)]" />
                  <span className="flex-1">{question}</span>
                </button>
              ))}
            </section>
          )}
        </aside>
      </div>
    </>
  );
}
