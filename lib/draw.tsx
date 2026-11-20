"use client";

import { createContext, useContext, useMemo, useState } from "react";
import {
  DRAWS,
  FEATURED_BIOMARKERS,
  LATEST_DRAW,
  type Marker,
  type Status,
} from "./data";
import { isWithin, parseTarget, unitOf } from "./metrics";

function pointText(marker: Marker, value: number) {
  const unit = unitOf(marker.value);
  const text = Number.isInteger(value)
    ? String(value)
    : String(Math.round(value * 100) / 100);
  if (unit === "%") return `${text}%`;
  return unit ? `${text} ${unit}` : text;
}

export function resolveAt(marker: Marker, index: number): Marker {
  if (marker.history.length === 0) return marker;
  const offset = index - (DRAWS.length - marker.history.length);
  if (offset < 0) return { ...marker, value: "", history: [] };
  if (index === LATEST_DRAW) return marker;
  const value = marker.history[offset];
  const within = isWithin(value, parseTarget(marker.range));
  const kept: Status = marker.status === "attention" ? "optimal" : marker.status;
  return {
    ...marker,
    value: pointText(marker, value),
    status: within ? kept : "attention",
    history: marker.history.slice(0, offset + 1),
  };
}

type DrawValue = {
  index: number;
  draw: (typeof DRAWS)[number];
  isLatest: boolean;
  setIndex: (index: number) => void;
  markers: Marker[];
};

const DrawContext = createContext<DrawValue | null>(null);

export function DrawProvider({ children }: { children: React.ReactNode }) {
  const [index, setIndex] = useState(LATEST_DRAW);
  const value = useMemo<DrawValue>(
    () => ({
      index,
      draw: DRAWS[index],
      isLatest: index === LATEST_DRAW,
      setIndex,
      markers: FEATURED_BIOMARKERS.map((marker) => resolveAt(marker, index)),
    }),
    [index],
  );
  return <DrawContext.Provider value={value}>{children}</DrawContext.Provider>;
}

export function useDraw() {
  const value = useContext(DrawContext);
  if (!value) throw new Error("useDraw outside DrawProvider");
  return value;
}
