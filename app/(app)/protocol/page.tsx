import type { Metadata } from "next";
import { ProtocolScreen } from "@/components/protocol-screen";

export const metadata: Metadata = { title: "Protocol" };

export default function Page() {
  return <ProtocolScreen />;
}
