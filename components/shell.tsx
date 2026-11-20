"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CORE_HEALTH,
  DRAWS,
  FEATURED_BIOMARKERS,
  LATEST_DRAW,
  NAV,
  NEXT_TEST,
  PERSONA,
  PROTOCOL,
} from "@/lib/data";
import { DrawProvider, resolveAt, useDraw } from "@/lib/draw";
import { markerKey, STATUS_RANK } from "@/lib/metrics";
import { InspectorProvider, useInspector } from "./inspector";
import { useAssistant, AskDrawer, GroupDrawer, MarkerDrawer } from "./drawers";
import {
  Agent,
  BagFill,
  CaretDown,
  ChartFill,
  Check,
  HouseFill,
  People,
  ProtocolFill,
  SearchIcon,
} from "./icons";
import { Menu, ToneBar, ToneMark } from "./parts";

const NAV_ICONS = {
  Home: HouseFill,
  Data: ChartFill,
  Protocol: ProtocolFill,
  Marketplace: BagFill,
} as const;

function matches(value: string, query: string) {
  const tokens = value.toLowerCase().split(/[^a-z0-9]+/);
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => tokens.some((token) => token.startsWith(word)));
}

function DateMenu() {
  const { index, draw, setIndex, isLatest } = useDraw();
  return (
    <Menu
      width={300}
      trigger={() => (
        <span className="dock-item flex h-9 items-center gap-2 rounded-full px-3.5 text-[13px]">
          <span className="tabular text-white">{draw.label}</span>
          {!isLatest && <span className="text-[11px] text-[var(--dock-muted)]">Earlier</span>}
          <CaretDown size={11} className="text-[var(--dock-muted)]" />
        </span>
      )}
    >
      {(close) => (
        <>
          <div className="px-3 pb-1.5 pt-2 text-[10px] font-medium uppercase tracking-[0.1em] text-[var(--color-faint)]">
            Your tests
          </div>
          {[...DRAWS].reverse().map((item) => {
            const drawIndex = DRAWS.indexOf(item);
            const results = FEATURED_BIOMARKERS.map((marker) => resolveAt(marker, drawIndex));
            const inTarget = results.filter((marker) => marker.status !== "attention").length;
            return (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                onClick={() => {
                  setIndex(drawIndex);
                  close();
                }}
                className="grid h-10 w-full cursor-pointer grid-cols-[minmax(0,1fr)_56px_36px_14px] items-center gap-3 rounded-[10px] px-3 text-left text-[13px] outline-none hover:bg-[var(--hover)]"
              >
                <span className="tabular truncate">
                  {item.label}
                  {drawIndex === LATEST_DRAW && (
                    <span className="ml-2 text-[11px] text-[var(--color-faint)]">Latest</span>
                  )}
                </span>
                <ToneBar markers={results} height={4} />
                <span className="tabular text-right text-[11px] text-[var(--color-muted)]">
                  {inTarget}/{results.length}
                </span>
                <span className="flex justify-end">
                  {drawIndex === index && <Check size={12} />}
                </span>
              </button>
            );
          })}
          <div className="mx-1.5 mt-1.5 flex h-10 items-center justify-between border-t border-[var(--color-line)] px-1.5 text-[12px] text-[var(--color-muted)]">
            <span>Next test</span>
            <span className="tabular">{NEXT_TEST.date}</span>
          </div>
        </>
      )}
    </Menu>
  );
}

function ProfileMenu() {
  return (
    <Menu
      label="Profile"
      align="end"
      width={280}
      trigger={() => (
        <span className="flex h-9 w-9 items-center justify-center rounded-full outline-offset-2 transition-opacity hover:opacity-85">
          <img src="/maya.jpg" alt="" width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
        </span>
      )}
    >
      {() => (
        <>
          <div className="flex items-center gap-3 px-3 pb-3 pt-2.5">
            <img src="/maya.jpg" alt="" width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
            <span className="min-w-0 leading-tight">
              <span className="block text-[14px] font-medium">{PERSONA.name}</span>
              <span className="mt-0.5 block text-[12px] text-[var(--color-muted)]">
                Member since {PERSONA.memberSince}
              </span>
            </span>
          </div>
          <div className="mx-1.5 mb-1.5 h-px bg-[var(--color-line)]" />
          <div
            aria-disabled="true"
            className="flex h-10 cursor-default items-center gap-3 rounded-[10px] px-3 text-[13px] text-[var(--color-faint)]"
          >
            <People size={16} className="text-[var(--color-faint)]" />
            <span className="flex-1">Add a family member</span>
            <span className="text-[10px] font-medium uppercase tracking-[0.1em]">Soon</span>
          </div>
        </>
      )}
    </Menu>
  );
}

function ConnectButton() {
  const { openAsk } = useInspector();
  const { client, connected } = useAssistant();
  return (
    <button
      type="button"
      onClick={() => openAsk()}
      className="dock-item flex h-9 items-center gap-2 rounded-full px-3 text-[13px]"
    >
      {connected ? (
        <>
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[var(--color-optimal)]" />
          {client}
        </>
      ) : (
        <>
          <Agent size={16} />
          Connect AI
        </>
      )}
    </button>
  );
}

function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { markers } = useDraw();
  const { openMarker, openAsk } = useInspector();
  const [query, setQuery] = useState("");
  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  const typed = query.trim().length > 0;
  const worth = useMemo(
    () =>
      [...markers]
        .filter((marker) => marker.status !== "optimal")
        .sort((a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status])
        .slice(0, 3),
    [markers],
  );
  if (!open) return null;
  const go = (action: () => void) => {
    onClose();
    action();
  };
  const row =
    "flex h-11 w-full cursor-pointer items-center gap-3 rounded-[10px] px-3 text-left text-[14px] outline-none hover:bg-[var(--hover)]";
  const heading = "px-3 pb-1.5 pt-3 text-[12px] text-[var(--color-faint)]";
  const visibleMarkers = typed ? markers.filter((marker) => matches(`${marker.short} ${marker.name}`, query)) : worth;
  const systems = typed ? CORE_HEALTH.filter((system) => matches(`system ${system.name}`, query)) : [];
  const steps = typed ? PROTOCOL.filter((step) => matches(`plan ${step.title}`, query)) : [];
  const pages = NAV.filter((item) => !typed || matches(`page ${item.label}`, query));
  const nothing =
    typed &&
    visibleMarkers.length === 0 &&
    systems.length === 0 &&
    steps.length === 0 &&
    pages.length === 0;
  return (
    <div className="fixed inset-0 z-50">
      <button type="button" aria-label="Close search" className="absolute inset-0 bg-[var(--scrim)]" onClick={onClose} />
      <div
        role="dialog"
        aria-label="Search"
        data-state="open"
        className="pop-in fixed left-1/2 top-[16vh] z-50 w-[min(560px,calc(100vw-32px))] -translate-x-1/2 overflow-hidden rounded-[20px] border border-[var(--color-line)] bg-[var(--color-card)] shadow-[var(--pop)]"
      >
        <div className="flex items-center gap-3 px-5">
          <SearchIcon size={18} className="text-[var(--color-faint)]" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search your results"
            className="h-14 flex-1 bg-transparent text-[16px] outline-none placeholder:text-[var(--color-faint)]"
          />
        </div>
        <div className="max-h-[52vh] overflow-y-auto border-t border-[var(--color-line)] px-2 pb-2">
          {nothing && (
            <p className="px-3 py-8 text-center text-[13px] text-[var(--color-muted)]">Nothing matches that.</p>
          )}
          {(typed ? visibleMarkers.length > 0 : true) && (
            <div>
              <div className={heading}>{typed ? "Results" : "Worth a look"}</div>
              {(typed ? visibleMarkers : worth).map((marker) => (
                <button
                  key={marker.name}
                  type="button"
                  className={row}
                  onClick={() => go(() => openMarker(marker))}
                >
                  <span className="flex w-4 justify-center">
                    <ToneMark marker={marker} size={12} />
                  </span>
                  <span className="flex-1 truncate">{marker.short}</span>
                  <span className="tabular text-[13px] text-[var(--color-muted)]">{marker.value}</span>
                </button>
              ))}
              {!typed && (
                <button type="button" className={row} onClick={() => go(() => openAsk())}>
                  <Agent size={16} className="text-[var(--color-muted)]" />
                  <span className="flex-1">Ask about your results in your AI</span>
                </button>
              )}
            </div>
          )}
          {typed && systems.length > 0 && (
            <div>
              <div className={heading}>Systems</div>
              {systems.map((system) => (
                <button
                  key={system.name}
                  type="button"
                  className={row}
                  onClick={() => go(() => router.push(`/data/${markerKey(system.name)}`))}
                >
                  <span className="flex-1">{system.name}</span>
                </button>
              ))}
            </div>
          )}
          {typed && steps.length > 0 && (
            <div>
              <div className={heading}>Plan</div>
              {steps.map((step) => (
                <button
                  key={step.id}
                  type="button"
                  className={row}
                  onClick={() => go(() => router.push(`/protocol#${step.id}`))}
                >
                  <ProtocolFill size={16} className="text-[var(--color-muted)]" />
                  <span className="flex-1 truncate">{step.title}</span>
                </button>
              ))}
            </div>
          )}
          {pages.length > 0 && (
            <div>
              <div className={heading}>Go to</div>
              {pages.map((item) => {
                const Icon = NAV_ICONS[item.label];
                return (
                  <button
                    key={item.href}
                    type="button"
                    className={row}
                    onClick={() => go(() => router.push(item.href))}
                  >
                    <Icon size={16} className="text-[var(--color-muted)]" />
                    <span className="flex-1">{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Dock({ onSearch }: { onSearch: () => void }) {
  const pathname = usePathname();
  return (
    <header className="grid h-[var(--dock)] shrink-0 grid-cols-[1fr_auto_1fr] items-center px-3 text-white">
      <div className="flex items-center gap-5">
        <Link href="/home" className="pl-2 text-[17px] font-medium tracking-[-0.03em]">
          Heavthy
        </Link>
        <DateMenu />
      </div>
      <nav className="flex items-center gap-1" aria-label="Main">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = NAV_ICONS[item.label];
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              data-active={active ? "true" : undefined}
              className="dock-item relative flex h-9 items-center gap-2 rounded-full px-3.5 text-[13px]"
            >
              {active && <span className="absolute inset-0 rounded-full bg-[rgba(255,255,255,0.12)]" />}
              <Icon size={16} className="relative" />
              <span className="relative">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="flex items-center justify-end gap-2">
        <ConnectButton />
        <button
          type="button"
          onClick={onSearch}
          className="dock-item flex h-9 items-center gap-2 rounded-full px-3 text-[13px]"
        >
          <SearchIcon size={16} />
          Search
          <kbd className="ml-0.5 flex h-[18px] items-center gap-px rounded-[5px] border border-[var(--dock-line)] px-1.5 font-sans text-[10.5px] font-medium leading-none text-[var(--dock-faint)]">
            <span className="text-[11px]">⌘</span>K
          </kbd>
        </button>
        <ProfileMenu />
      </div>
    </header>
  );
}

function ShellFrame({ children }: { children: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return (
    <>
      <div className="frame flex h-dvh flex-col overflow-hidden px-2.5 pb-2.5">
        <Dock onSearch={() => setSearchOpen(true)} />
        <main className="panel min-h-0 flex-1 overflow-y-auto rounded-[var(--radius-panel)] bg-[var(--color-app)]">
          <div className="mx-auto w-full max-w-[1280px] px-10 pb-12 pt-9">{children}</div>
        </main>
      </div>
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
      <AskDrawer />
      <MarkerDrawer />
      <GroupDrawer />
    </>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <DrawProvider>
      <InspectorProvider>
        <ShellFrame>{children}</ShellFrame>
      </InspectorProvider>
    </DrawProvider>
  );
}
