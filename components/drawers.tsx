"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  DRAWS,
  FEATURED_BIOMARKERS,
  GROUPS,
  LATEST_DRAW,
  protocolFor,
} from "@/lib/data";
import { useDraw } from "@/lib/draw";
import { SUGGESTED, answerFor, latestLabel, type Segment } from "@/lib/answers";
import { markerKey, sinceFirst, tally, unitOf } from "@/lib/metrics";
import {
  Agent,
  ArrowUpRight,
  Brain,
  Check,
  Drop,
  Fire,
  Heartbeat,
  Hormone,
  Kidney,
  Leaf,
  Lightning,
  ListChecks,
  Liver,
  ShieldCheck,
  Thyroid,
} from "./icons";
import {
  Facts,
  GlossaryText,
  RangeBar,
  SetSummary,
  Sheet,
  Sparkline,
  ToneBar,
  ToneLegend,
  ToneMark,
  ToneTag,
  Chevron,
} from "./parts";
import { useInspector } from "./inspector";

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

const CLIENTS = ["Claude", "ChatGPT", "Cursor"] as const;
type ClientName = (typeof CLIENTS)[number];

const STEPS: Record<ClientName, string[]> = {
  Claude: [
    "Open Settings, then Connectors.",
    "Add a custom connector and paste the Helios address.",
    "Ask about your results in any chat.",
  ],
  ChatGPT: [
    "Open Settings, then Connectors.",
    "Create a connector with the Helios address.",
    "Turn Helios on in a chat and ask.",
  ],
  Cursor: ["Open Settings, then MCP.", "Add a server with the Helios address.", "Ask in the agent panel."],
};

const ASSISTANT_KEY = "sp-assistant-v1";
const ASSISTANT_EVENT = "sp-assistant";
const defaultAssistant: { client: ClientName; connected: boolean } = {
  client: "Claude",
  connected: false,
};

function readAssistant() {
  if (typeof window === "undefined") return defaultAssistant;
  try {
    const saved = window.localStorage.getItem(ASSISTANT_KEY);
    return saved ? { ...defaultAssistant, ...JSON.parse(saved) } : defaultAssistant;
  } catch {
    return defaultAssistant;
  }
}

function writeAssistant(next: { client: ClientName; connected: boolean }) {
  try {
    window.localStorage.setItem(ASSISTANT_KEY, JSON.stringify(next));
  } catch {
    /* ignore private mode */
  }
  window.dispatchEvent(new Event(ASSISTANT_EVENT));
}

export function useAssistant() {
  const [state, setState] = useState(defaultAssistant);
  useEffect(() => {
    const sync = () => setState(readAssistant());
    sync();
    window.addEventListener(ASSISTANT_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(ASSISTANT_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return {
    ...state,
    setClient: (client: ClientName) => writeAssistant({ ...readAssistant(), client }),
    connect: () => writeAssistant({ ...readAssistant(), connected: true }),
    disconnect: () => writeAssistant({ ...readAssistant(), connected: false }),
  };
}

function ReadingDots() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" aria-hidden>
      {Array.from({ length: 8 }, (_, index) => {
        const angle = ((-90 + 45 * index) * Math.PI) / 180;
        return (
          <circle
            key={index}
            className="agent-dot"
            cx={Math.round((12 + 8.6 * Math.cos(angle)) * 100) / 100}
            cy={Math.round((12 + 8.6 * Math.sin(angle)) * 100) / 100}
            r="2.3"
            fill="currentColor"
            style={{ animationDelay: `${(index - 8) * 110}ms` }}
          />
        );
      })}
    </svg>
  );
}

function segmentLength(segment: Segment) {
  return typeof segment === "string" ? segment.length : segment.label.length;
}

function AnswerBody({ question }: { question: string }) {
  const { openMarker, openAsk } = useInspector();
  const answer = answerFor(question);
  const total = answer.segments.reduce((sum, segment) => sum + segmentLength(segment), 0);
  const [shown, setShown] = useState(total);
  const [hover, setHover] = useState<number | null>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(total);
      return;
    }
    setShown(0);
    const timer = window.setInterval(() => {
      setShown((value) => {
        if (value >= total) {
          window.clearInterval(timer);
          return value;
        }
        return value + 5;
      });
    }, 18);
    return () => window.clearInterval(timer);
  }, [question, total]);
  const offsets = answer.segments.reduce<number[]>((list, segment, index) => {
    const start = index === 0 ? 0 : list[index - 1] + segmentLength(answer.segments[index - 1]);
    return [...list, start];
  }, []);
  const done = shown >= total;
  const cited = FEATURED_BIOMARKERS.find((marker) => marker.name === answer.cites[0]);
  const followups = (cited?.askQuestions ?? []).filter((item) => item !== question).slice(0, 3);
  const firstMonth = new Date(`${DRAWS[0].id}-01T00:00:00`).toLocaleString("en-US", {
    month: "long",
  });
  return (
    <article className="flex flex-col gap-4">
      <p className="text-[14px] leading-[1.65]">
        {answer.segments.map((segment, index) => {
          const visible = shown - offsets[index];
          if (visible <= 0) return null;
          if (typeof segment === "string") {
            return <span key={index}>{segment.slice(0, visible)}</span>;
          }
          const marker = FEATURED_BIOMARKERS.find((item) => item.name === segment.marker);
          return (
            <button
              key={index}
              type="button"
              onClick={() => marker && openMarker(marker)}
              className="mx-0.5 inline-flex translate-y-[-1px] items-center gap-1 rounded-full border border-[var(--color-line)] px-2 align-baseline text-[13px] leading-[22px] transition-colors hover:border-[var(--color-line-strong)]"
            >
              {marker && <ToneMark marker={marker} size={12} />}
              {segment.label}
            </button>
          );
        })}
        {!done && (
          <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-[3px] animate-pulse bg-[var(--color-ink)]" />
        )}
      </p>
      {done && cited && cited.history.length > 1 && (
        <div className="rise rounded-[var(--radius-inner)] border border-[var(--color-line)] p-4">
          <div className="flex items-baseline justify-between gap-3">
            <p className="caption">{cited.short}</p>
            <p className="flex flex-col items-end gap-1">
              <span className="text-[10px] font-medium uppercase leading-3 tracking-[0.1em] text-[var(--color-faint)]">
                {hover === null ? "Latest test" : DRAWS[hover].label}
              </span>
              <span className="tabular text-[13px]">
                {hover === null ? cited.value.split(" ")[0] : cited.history[hover]}
                <span className="ml-1 text-[11px] text-[var(--color-muted)]">{unitOf(cited.value)}</span>
              </span>
            </p>
          </div>
          <h4 className="mt-0.5 text-[14px] font-medium">{sinceFirst(cited, firstMonth)}</h4>
          <div
            className="mt-2"
            onMouseLeave={() => setHover(null)}
            onMouseMove={(event) => {
              const rect = event.currentTarget.getBoundingClientRect();
              const ratio = (event.clientX - rect.left) / rect.width;
              const index = Math.round(ratio * (cited.history.length - 1));
              setHover(Math.max(0, Math.min(cited.history.length - 1, index)));
            }}
          >
            <Sparkline marker={cited} />
          </div>
        </div>
      )}
      {done && (
        <div className="rise flex flex-col gap-3">
          <div className="rounded-[var(--radius-inner)] bg-[var(--color-subtle)] px-4 py-3">
            <p className="caption font-medium">Next step</p>
            <p className="mt-1 text-[14px] leading-[1.5]">{answer.next}</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="caption">Read from</span>
            {answer.cites.map((name) => {
              const marker = FEATURED_BIOMARKERS.find((item) => item.name === name);
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
      )}
      {done && followups.length > 0 && (
        <div className="rise flex flex-wrap gap-1.5">
          {followups.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => openAsk(item, cited?.short)}
              className="rounded-full border border-[var(--color-line)] px-3 py-1.5 text-[13px] text-[var(--color-muted)] transition-colors hover:border-[var(--color-line-strong)] hover:text-[var(--color-ink)]"
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </article>
  );
}

function AskPreview({ question, about }: { question: string; about?: string | null }) {
  const assistant = useAssistant();
  const answer = answerFor(question, about);
  const reads = answer.cites
    .map((name) => FEATURED_BIOMARKERS.find((marker) => marker.name === name)?.short)
    .filter(Boolean);
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    setReady(false);
    const timer = window.setTimeout(() => setReady(true), 900);
    return () => window.clearTimeout(timer);
  }, [question]);
  const prompt = `${question} (Helios results, ${latestLabel()})`;
  const href =
    assistant.client === "Claude"
      ? `https://claude.ai/new?q=${encodeURIComponent(prompt)}`
      : `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;
  return (
    <div className="flex flex-col gap-3">
      <section className="flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)]">
        <header className="flex h-10 items-center gap-3 border-b border-[var(--color-line)] bg-[var(--color-app)] px-4 text-[12px] text-[var(--color-muted)]">
          <span className="flex-1">{assistant.client}</span>
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full"
              style={{
                background: assistant.connected ? "var(--color-optimal)" : "var(--color-faint)",
              }}
            />
            {assistant.connected ? "Helios connected" : "Preview"}
          </span>
        </header>
        <div className="flex flex-col gap-4 px-5 py-5">
          <p className="ml-auto max-w-[85%] rounded-[16px] rounded-br-[6px] bg-[var(--color-subtle)] px-4 py-2.5 text-[14px] leading-[1.5]">
            {question}
          </p>
          <p className="flex flex-wrap items-center gap-2 text-[12px] text-[var(--color-muted)]">
            <span className="flex h-5 items-center gap-1.5 rounded-full border border-[var(--color-line)] px-2">
              {ready ? <Check size={10} /> : <ReadingDots />}
              {ready ? "Read from Helios" : "Reading from Helios"}
            </span>
            {ready && (
              <span className="rise">
                {reads.join(", ")} from your {latestLabel()} results
              </span>
            )}
          </p>
          {ready && <AnswerBody question={question} />}
        </div>
      </section>
      {assistant.client === "Cursor" ? (
        <button
          type="button"
          className="flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[var(--color-ink)] text-[13px] text-white transition-opacity hover:opacity-90"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(prompt);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1400);
            } catch {
              setCopied(false);
            }
          }}
        >
          {copied ? "Copied, paste it in Cursor" : "Copy this question for Cursor"}
        </button>
      ) : (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[var(--color-ink)] text-[13px] text-white transition-opacity hover:opacity-90"
        >
          Ask this in {assistant.client}
          <ArrowUpRight size={14} />
        </a>
      )}
      <div className="flex flex-wrap gap-1.5">
        {SUGGESTED.filter((item) => item !== question).map((item) => (
          <AskChip key={item} question={item} />
        ))}
      </div>
    </div>
  );
}

function AskChip({ question }: { question: string }) {
  const { openAsk } = useInspector();
  return (
    <button
      type="button"
      onClick={() => openAsk(question)}
      className="rounded-full border border-[var(--color-line)] px-3 py-1.5 text-[12px] text-[var(--color-muted)] transition-colors hover:border-[var(--color-line-strong)] hover:text-[var(--color-ink)]"
    >
      {question}
    </button>
  );
}

function ConnectSection() {
  const assistant = useAssistant();
  const [copied, setCopied] = useState(false);
  return (
    <section>
      <h2 className="text-[17px] font-light leading-tight tracking-[-0.01em]">Connect your assistant</h2>
      <p className="mt-1 text-[13px] leading-[1.5] text-[var(--color-muted)]">
        Helios works inside the AI you already use, with your results one question away.
      </p>
      <div role="tablist" aria-label="Assistant" className="mt-5 flex rounded-full bg-[var(--color-subtle)] p-[3px]">
        {CLIENTS.map((name) => (
          <button
            key={name}
            type="button"
            role="tab"
            aria-selected={assistant.client === name}
            onClick={() => assistant.setClient(name)}
            className="relative flex h-8 flex-1 items-center justify-center rounded-full text-[13px]"
            style={{ color: assistant.client === name ? "var(--color-ink)" : "var(--color-muted)" }}
          >
            {assistant.client === name && (
              <span className="absolute inset-0 rounded-full bg-[var(--color-card)] shadow-[0_0_0_1px_var(--color-line)]" />
            )}
            <span className="relative">{name}</span>
          </button>
        ))}
      </div>
      <ol className="mt-5 flex flex-col gap-3">
        {STEPS[assistant.client].map((step, index) => (
          <li key={step} className="flex gap-3 text-[14px] leading-[1.45]">
            <span className="tabular flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-subtle)] text-[11px] text-[var(--color-muted)]">
              {index + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
      <div className="mt-5 flex h-10 items-center gap-2 rounded-[var(--radius-inner)] border border-[var(--color-line)] pl-3 pr-1">
        <code className="min-w-0 flex-1 truncate font-mono text-[12px]">https://mcp.helios.health</code>
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText("https://mcp.helios.health");
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1400);
            } catch {
              setCopied(false);
            }
          }}
          className="flex h-8 items-center gap-1.5 rounded-[8px] px-2.5 text-[12px] text-[var(--color-muted)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--color-ink)]"
        >
          {copied && <Check size={12} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      {assistant.connected ? (
        <div className="mt-4 flex h-10 items-center gap-2 rounded-full bg-[var(--color-subtle)] pl-4 pr-1.5 text-[13px]">
          <span aria-hidden className="h-2 w-2 rounded-full bg-[var(--color-optimal)]" />
          <span className="flex-1">Connected to {assistant.client}</span>
          <button
            type="button"
            onClick={assistant.disconnect}
            className="h-7 rounded-full px-3 text-[12px] text-[var(--color-muted)] transition-colors hover:bg-[var(--color-card)] hover:text-[var(--color-ink)]"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={assistant.connect}
          className="mt-4 flex h-10 w-full items-center justify-center rounded-full bg-[var(--color-ink)] text-[13px] text-white transition-opacity hover:opacity-90"
        >
          Connect {assistant.client}
        </button>
      )}
    </section>
  );
}

export function AskDrawer() {
  const { askParam, aboutParam, close } = useInspector();
  const { markers } = useDraw();
  const question = askParam && askParam !== "1" ? askParam : SUGGESTED[0];
  return (
    <Sheet
      open={Boolean(askParam)}
      onClose={close}
      title="Ask in your AI"
      eyebrow="Your results, in the assistant you use"
      wide
    >
      {askParam && (
        <div className="flex flex-col gap-8 pt-5">
          <AskPreview question={question} about={aboutParam} />
          <div className="border-t border-[var(--color-line)] pt-6">
            <ConnectSection />
          </div>
          <div className="border-t border-[var(--color-line)] pt-6">
            <h2 className="text-[17px] font-light tracking-[-0.01em]">What it can read</h2>
            <ul className="mt-3 flex flex-col">
              {[
                ["Your results", `${markers.length} biomarkers, each with its target`],
                ["Every test", `Trends since ${DRAWS[0].label.replace(/ \d+,/, "")}`],
                ["Biological age", "And what moves it"],
                ["Your plan", "Steps and your next test"],
              ].map(([title, detail]) => (
                <li
                  key={title}
                  className="flex items-baseline justify-between gap-4 border-t border-[var(--color-line)] py-2.5 text-[13px] first:border-t-0"
                >
                  <span>{title}</span>
                  <span className="text-right text-[var(--color-muted)]">{detail}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[12px] leading-[1.5] text-[var(--color-muted)]">
              Read-only. Your conversations stay with your assistant, and you can disconnect at any time.
            </p>
          </div>
        </div>
      )}
    </Sheet>
  );
}

export function MarkerDrawer() {
  const { markerParam, close, openAsk } = useInspector();
  const { markers, draw } = useDraw();
  const marker = markers.find((item) => markerKey(item.name) === markerParam);
  const [science, setScience] = useState(false);
  const source = FEATURED_BIOMARKERS.find((item) => markerKey(item.name) === markerParam) ?? marker;
  const steps = source ? protocolFor(source.name) : [];
  const firstMonth = new Date(`${DRAWS[0].id}-01T00:00:00`).toLocaleString("en-US", {
    month: "long",
  });
  return (
    <Sheet
      open={Boolean(marker)}
      onClose={close}
      title={marker?.short ?? ""}
      eyebrow={marker?.name}
      footer={
        <p className="text-[12px] text-[var(--color-muted)]">
          For information, not medical advice. Discuss changes with your clinician.
        </p>
      }
    >
      {marker && source && (
        <div className="flex flex-col gap-6 pt-5">
          <section>
            <div className="flex items-start justify-between gap-3">
              <ToneTag marker={marker} />
              <span className="flex flex-col items-end gap-1">
                <span className="text-[10px] font-medium uppercase leading-3 tracking-[0.1em] text-[var(--color-faint)]">
                  Latest test
                </span>
                <span className="tabular text-[13px] text-[var(--color-ink)]">{draw.label}</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-1.5">
              <span className="text-[36px] font-light tracking-[-0.02em]">
                {marker.value.replace(unitOf(marker.value), "").trim()}
              </span>
              <span className="text-[14px] text-[var(--color-muted)]">{unitOf(marker.value)}</span>
            </div>
            <div className="mt-5">
              <RangeBar marker={marker} />
            </div>
            <div className="mt-4">
              <Facts
                items={[
                  ...(marker.optimal
                    ? [
                        { label: "Optimal", value: marker.optimal },
                        { label: "Lab range", value: marker.range },
                      ]
                    : [{ label: "Target", value: marker.range }]),
                  { label: "Collected", value: draw.label },
                  { label: "System", value: marker.system.replace(" Health", "") },
                ]}
              />
            </div>
            {source.history.length > 1 && (
              <div className="mt-6">
                <h3 className="text-[14px] font-medium">{sinceFirst(source, firstMonth)}</h3>
                <p className="caption">
                  {source.history.length} tests, {DRAWS[0].label} to {DRAWS[LATEST_DRAW].label}
                </p>
                <div className="mt-2">
                  <Sparkline marker={source} />
                </div>
              </div>
            )}
          </section>
          <section>
            <h3 className="caption mb-2 font-medium">What this means for you</h3>
            <p className="text-[14px] leading-[1.6]">
              <GlossaryText text={source.plain} />
            </p>
          </section>
          {source.action && (
            <section>
              <h3 className="caption mb-2 font-medium">Your next step</h3>
              <p className="text-[14px] leading-[1.55]">{source.action}</p>
              {steps.length > 0 && (
                <ul className="mt-3 flex flex-col gap-1.5">
                  {steps.map((step) => (
                    <li key={step.id}>
                      <Link
                        href={`/protocol#${step.id}`}
                        className="row-hover flex items-center gap-2.5 rounded-[var(--radius-inner)] border border-[var(--color-line)] px-3 py-2.5 text-[13px]"
                      >
                        <ListChecks size={16} className="text-[var(--color-muted)]" />
                        <span className="flex-1">{step.title}</span>
                        <span className="caption">In protocol</span>
                        <Chevron />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
          {source.habits && source.habits.length > 0 && (
            <section>
              <h3 className="caption mb-2 font-medium">What generally helps</h3>
              <ul className="flex flex-col">
                {source.habits.map((habit) => (
                  <li
                    key={habit}
                    className="border-t border-[var(--color-line)] py-2.5 text-[14px] leading-[1.5] first:border-t-0 first:pt-0"
                  >
                    {habit}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {source.askQuestions && source.askQuestions.length > 0 && (
            <section>
              <h3 className="caption mb-2 font-medium">Ask about this</h3>
              <div className="flex flex-col gap-1.5">
                {source.askQuestions.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => openAsk(question, source.short)}
                    className="row-hover group flex items-center gap-2.5 rounded-[var(--radius-inner)] border border-[var(--color-line)] px-3 py-2.5 text-left text-[13px]"
                  >
                    <Agent size={16} className="text-[var(--color-muted)]" />
                    <span className="flex-1">{question}</span>
                    <Chevron />
                  </button>
                ))}
              </div>
            </section>
          )}
          {source.science && source.science.length > 0 && (
            <section className="border-t border-[var(--color-line)] pt-4">
              <button
                type="button"
                onClick={() => setScience((value) => !value)}
                aria-expanded={science}
                className="flex w-full items-center justify-between text-[14px]"
              >
                The science
                <span className={`transition-transform ${science ? "rotate-180" : ""}`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M12.01 18.26C12.33 18.26 12.65 18.13 12.86 17.88L22.77 7.74C22.98 7.52 23.11 7.24 23.11 6.92C23.11 6.26 22.61 5.74 21.95 5.74C21.63 5.74 21.33 5.87 21.12 6.08L12.01 15.39L2.88 6.08C2.68 5.87 2.39 5.74 2.05 5.74C1.39 5.74.89 6.26.89 6.92C.89 7.24 1.02 7.52 1.23 7.75L11.14 17.88C11.38 18.13 11.67 18.26 12.01 18.26Z" />
                  </svg>
                </span>
              </button>
              {science && (
                <ul className="mt-3 flex flex-col gap-2 text-[13px] leading-[1.6] text-[var(--color-muted)]">
                  {source.science.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </div>
      )}
    </Sheet>
  );
}

export function GroupDrawer() {
  const { groupParam, close } = useInspector();
  const { markers, isLatest } = useDraw();
  const group = GROUPS.find((item) => item.key === groupParam);
  const groupMarkers = group ? markers.filter((marker) => marker.group === group.key) : [];
  const counts = tally(groupMarkers);
  return (
    <Sheet open={Boolean(group)} onClose={close} title={group?.title ?? ""} eyebrow="Group">
      {group && (
        <div className="flex flex-col gap-6 pt-5">
          <div className="flex items-center justify-between">
            <span className="text-[13px]">
              <SetSummary markers={groupMarkers} />
            </span>
            <span className="caption tabular">
              {counts.optimal} of {counts.total} optimal
            </span>
          </div>
          <div className="flex flex-col gap-3">
            <ToneBar markers={groupMarkers} height={8} />
            <ToneLegend markers={groupMarkers} />
          </div>
          {isLatest && (
            <p className="text-[14px] leading-[1.6]">
              <GlossaryText text={group.summary} />
            </p>
          )}
          <section className="rounded-[var(--radius-inner)] bg-[var(--color-subtle)] p-4">
            <h3 className="caption mb-1.5 font-medium">Focus</h3>
            <p className="text-[14px] leading-[1.55]">
              <GlossaryText text={group.focus} />
            </p>
          </section>
          <section>
            <h3 className="caption mb-2 font-medium">Systems in this group</h3>
            <ul className="overflow-hidden rounded-[var(--radius-inner)] border border-[var(--color-line)]">
              {group.systems.map((system) => {
                const systemMarkers = markers.filter((marker) => marker.system === system);
                const worst = systemMarkers.some((marker) => marker.status !== "optimal");
                const Icon = SYSTEM_ICON[system];
                return (
                  <li key={system} className="border-t border-[var(--color-line)] first:border-t-0">
                    <Link
                      href={`/data/${system.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`}
                      onClick={close}
                      className="row-hover flex h-11 items-center gap-3 px-3 text-[14px]"
                    >
                      {Icon && <Icon size={16} className="text-[var(--color-muted)]" />}
                      <span className="flex-1">{system}</span>
                      {worst && (
                        <span className="text-[12px] text-[var(--color-muted)]">
                          <SetSummary markers={systemMarkers} />
                        </span>
                      )}
                      <Chevron />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
          <p className="text-[13px] leading-[1.6] text-[var(--color-muted)]">{group.whyItMatters}</p>
        </div>
      )}
    </Sheet>
  );
}
