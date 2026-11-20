"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createContext, useContext, useMemo } from "react";
import type { Marker } from "@/lib/data";
import { markerKey } from "@/lib/metrics";

type InspectorValue = {
  openMarker: (marker: Marker) => void;
  openGroup: (key: string) => void;
  openAsk: (question?: string, about?: string) => void;
  close: () => void;
  markerParam: string | null;
  groupParam: string | null;
  askParam: string | null;
  aboutParam: string | null;
};

const InspectorContext = createContext<InspectorValue | null>(null);

export function InspectorProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const value = useMemo<InspectorValue>(() => {
    const open = (key: string, nextValue: string | null, about?: string) => {
      const query = new URLSearchParams(params.toString());
      for (const name of ["marker", "group", "ask", "about"]) query.delete(name);
      if (nextValue) query.set(key, nextValue);
      if (nextValue && about) query.set("about", about);
      const text = query.toString();
      router.push(text ? `${pathname}?${text}` : pathname, { scroll: false });
    };
    return {
      openMarker: (marker) => open("marker", markerKey(marker.name)),
      openGroup: (key) => open("group", key),
      openAsk: (question, about) => open("ask", question ?? "1", about),
      close: () => open("marker", null),
      markerParam: params.get("marker"),
      groupParam: params.get("group"),
      askParam: params.get("ask"),
      aboutParam: params.get("about"),
    };
  }, [params, pathname, router]);
  return <InspectorContext.Provider value={value}>{children}</InspectorContext.Provider>;
}

export function useInspector() {
  const value = useContext(InspectorContext);
  if (!value) throw new Error("useInspector outside provider");
  return value;
}
