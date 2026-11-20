"use client";

import { HomeScreen } from "./home-screen";
import { useInspector } from "./inspector";

export function HomePage() {
  const { openAsk, openMarker, openGroup } = useInspector();
  return <HomeScreen onAsk={openAsk} onMarker={openMarker} onGroup={openGroup} />;
}
