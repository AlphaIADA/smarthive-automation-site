"use client";

import { motion } from "framer-motion";
import { usePerformanceStore } from "@/lib/experience/stores";
import styles from "@/styles/experience/experience.module.css";

export function BottomStatusBar() {
  const snapshot = usePerformanceStore((state) => state.snapshot);

  return (
    <motion.footer initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={`${styles.glass} absolute bottom-3 left-3 right-16 z-20 flex h-10 items-center gap-4 overflow-hidden rounded-2xl px-4 text-[10px] md:left-5 md:right-20`}>
      <span className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-emerald-300" /><span className="font-medium">SmartHive OS 1.0 ready</span></span>
      <span className={`${styles.muted} hidden sm:inline`}>FPS <b className="font-medium text-inherit">{snapshot.fps}</b></span>
      <span className={`${styles.muted} hidden sm:inline`}>Calls <b className="font-medium text-inherit">{snapshot.drawCalls}</b></span>
      <span className={`${styles.muted} hidden md:inline`}>Triangles <b className="font-medium text-inherit">{snapshot.triangles.toLocaleString()}</b></span>
      <span className={`${styles.muted} ml-auto hidden md:inline`}>Shift + D for diagnostics</span>
      <span className={`${styles.accent} ml-auto font-medium md:ml-0`}>60 FPS target</span>
    </motion.footer>
  );
}
