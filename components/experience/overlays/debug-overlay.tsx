"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePerformanceStore } from "@/lib/experience/stores";
import styles from "@/styles/experience/experience.module.css";

export function DebugOverlay({ visible }: { visible: boolean }) {
  const snapshot = usePerformanceStore((state) => state.snapshot);
  const rows: readonly [string, string][] = [
    ["FPS", String(snapshot.fps)],
    ["Memory", snapshot.memoryMb === null ? "Unavailable" : `${snapshot.memoryMb.toFixed(1)} MB`],
    ["Draw calls", String(snapshot.drawCalls)],
    ["Triangles", snapshot.triangles.toLocaleString()],
    ["Camera", `${snapshot.cameraPosition.x.toFixed(2)}, ${snapshot.cameraPosition.y.toFixed(2)}, ${snapshot.cameraPosition.z.toFixed(2)}`],
    ["Scene objects", String(snapshot.sceneObjects)],
    ["Geometries", String(snapshot.geometries)],
    ["Textures", String(snapshot.textures)],
  ];

  return (
    <AnimatePresence>
      {visible ? (
        <motion.aside
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          className={`${styles.glass} ${styles.glassStrong} absolute bottom-16 right-3 z-40 w-[min(22rem,calc(100vw-1.5rem))] rounded-3xl p-4 md:right-5`}
          aria-label="Experience diagnostics"
        >
          <div className="flex items-center justify-between">
            <div><div className="text-sm font-semibold">Engine diagnostics</div><div className={`${styles.muted} text-[10px] uppercase tracking-[0.18em]`}>Live renderer telemetry</div></div>
            <kbd className="rounded-lg border border-white/10 bg-black/10 px-2 py-1 text-[10px]">Shift + D</kbd>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-2">
            {rows.map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-black/10 p-3">
                <dt className={`${styles.muted} text-[10px] uppercase tracking-wider`}>{label}</dt>
                <dd className="mt-1 truncate font-mono text-xs font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
