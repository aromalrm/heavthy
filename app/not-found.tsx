import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[var(--color-app)] p-6">
      <div className="card flex max-w-[420px] flex-col items-center p-8 text-center">
        <p className="caption font-mono">404</p>
        <h1 className="mt-2 text-[17px] font-medium">Nothing lives at this address</h1>
        <p className="mt-1 text-[13px] text-[var(--color-muted)]">
          It may be a system or result that is not part of your panel.
        </p>
        <Link
          href="/home"
          className="mt-5 h-9 rounded-full bg-[var(--color-ink)] px-4 text-[13px] leading-9 text-white"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
