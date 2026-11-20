"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { PROTOCOL } from "./data";

const KEY = "sp-plan-v1";
const EVENT = "sp-plan";

type Plan = { done: string[]; added: string[] };

const fallback: Plan = {
  done: PROTOCOL.filter((step) => step.done).map((step) => step.id),
  added: ["iron-panel"],
};

let cache = JSON.stringify(fallback);
let snapshot: Plan = fallback;

function read(): Plan {
  let raw = cache;
  try {
    raw = window.localStorage.getItem(KEY) ?? JSON.stringify(fallback);
  } catch {
    raw = JSON.stringify(fallback);
  }
  if (raw !== cache) {
    cache = raw;
    try {
      snapshot = { ...fallback, ...JSON.parse(raw) };
    } catch {
      snapshot = fallback;
    }
  }
  return snapshot;
}

function write(next: Plan) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    cache = JSON.stringify(next);
    snapshot = next;
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener(EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function toggle(list: string[], id: string) {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
}

export function usePlan() {
  const plan = useSyncExternalStore(subscribe, read, () => fallback);
  const done = useMemo(() => new Set(plan.done), [plan]);
  const added = useMemo(() => new Set(plan.added), [plan]);
  const toggleDone = useCallback((id: string) => {
    const current = read();
    write({ ...current, done: toggle(current.done, id) });
  }, []);
  const toggleAdded = useCallback((id: string) => {
    const current = read();
    write({ ...current, added: toggle(current.added, id) });
  }, []);
  return { done, added, toggleDone, toggleAdded };
}
