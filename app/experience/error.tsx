"use client";

export default function ExperienceError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950 px-6 text-white">
      <div className="max-w-md text-center">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-sky-300">SmartHive SHE</p>
        <h1 className="mt-3 text-2xl font-semibold">The experience runtime could not start.</h1>
        <p className="mt-2 text-sm text-slate-400">The rest of SmartHive is unaffected. Retry the isolated experience module.</p>
        <button type="button" onClick={reset} className="mt-6 rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-950">Retry experience</button>
      </div>
    </div>
  );
}
