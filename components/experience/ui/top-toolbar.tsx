"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CAMERA_PRESETS } from "@/lib/experience/camera-presets";
import type { EventBus } from "@/lib/experience/event-bus";
import { useCameraStore, useExperienceStore, useThemeStore } from "@/lib/experience/stores";
import styles from "@/styles/experience/experience.module.css";
import { CameraIcon, HomeIcon, MoonIcon, SunIcon } from "./icons";

export function TopToolbar({ eventBus }: { eventBus: EventBus }) {
  const preset = useCameraStore((state) => state.preset);
  const status = useExperienceStore((state) => state.status);
  const theme = useThemeStore((state) => state.theme);

  const changeTheme = () => {
    eventBus.emit("THEME_CHANGED", { theme: theme === "dark" ? "light" : "dark" });
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${styles.glass} absolute inset-x-3 top-3 z-20 flex h-14 items-center gap-3 rounded-2xl px-3 md:inset-x-5 md:px-4`}
    >
      <Link href="/" aria-label="Return to SmartHive home" className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/10 text-inherit hover:bg-white/10 hover:no-underline">
        <HomeIcon />
      </Link>
      <div className="min-w-0 shrink-0 border-r border-white/10 pr-3">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold tracking-tight">SmartHive SHE</span>
          <span className={`size-1.5 rounded-full ${status === "ready" ? "bg-emerald-300" : status === "degraded" ? "bg-amber-300" : "bg-sky-300 animate-pulse"}`} />
        </div>
        <div className={`${styles.muted} hidden text-[10px] uppercase tracking-[0.18em] sm:block`}>Foundation runtime</div>
      </div>
      <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <CameraIcon className={`${styles.muted} mx-1 shrink-0`} />
        {CAMERA_PRESETS.map((cameraPreset) => (
          <button
            key={cameraPreset.id}
            type="button"
            disabled={!cameraPreset.enabled}
            aria-pressed={preset === cameraPreset.id}
            onClick={() => eventBus.emit("CAMERA_CHANGED", { preset: cameraPreset.id })}
            className={`shrink-0 rounded-xl px-3 py-1.5 text-xs transition ${preset === cameraPreset.id ? "bg-white text-slate-950 shadow-sm" : "text-inherit hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"}`}
            title={cameraPreset.enabled ? `Switch to ${cameraPreset.label} camera` : `${cameraPreset.label} is reserved for a later milestone`}
          >
            {cameraPreset.label}
          </button>
        ))}
      </div>
      <button type="button" onClick={changeTheme} aria-label={`Use ${theme === "dark" ? "light" : "dark"} mode`} className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/10 text-inherit hover:bg-white/10">
        {theme === "dark" ? <SunIcon /> : <MoonIcon />}
      </button>
    </motion.header>
  );
}
