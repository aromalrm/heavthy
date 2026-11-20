import type { Metadata } from "next";
import { MarketplaceScreen } from "@/components/marketplace-screen";

export const metadata: Metadata = { title: "Marketplace" };

export default function Page() {
  return <MarketplaceScreen />;
}
