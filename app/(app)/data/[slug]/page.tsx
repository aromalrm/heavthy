import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SystemScreen } from "@/components/system-screen";
import { systemBySlug, SYSTEMS } from "@/lib/systems";

export function generateStaticParams() {
  return SYSTEMS.map((story) => ({ slug: story.system.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const story = systemBySlug(slug);
  if (!story) return { title: "Nothing lives at this address" };
  return { title: story.system };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const story = systemBySlug(slug);
  if (!story) notFound();
  return <SystemScreen story={story} />;
}
