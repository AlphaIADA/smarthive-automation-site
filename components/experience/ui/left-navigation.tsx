"use client";

import { motion } from "framer-motion";
import styles from "@/styles/experience/experience.module.css";
import { CompassIcon, LayersIcon, SettingsIcon, SparkIcon } from "./icons";

const navigation = [
  { label: "Explore", detail: "OS 1.0", icon: CompassIcon, active: true },
  { label: "Scene", detail: "Launch graph", icon: LayersIcon, active: false },
  { label: "Plugins", detail: "Registered plans", icon: SparkIcon, active: false },
  { label: "Settings", detail: "Runtime controls", icon: SettingsIcon, active: false },
] as const;

export function LeftNavigation() {
  return (
    <motion.nav
      aria-label="Experience navigation"
      initial={{ opacity: 0, x: -18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.08 }}
      className={`${styles.glass} absolute bottom-16 left-5 top-20 z-10 hidden w-52 rounded-3xl p-3 md:block`}
    >
      <div className={`${styles.muted} px-3 pb-2 pt-1 text-[10px] font-medium uppercase tracking-[0.2em]`}>Experience</div>
      <div className="space-y-1">
        {navigation.map(({ label, detail, icon: Icon, active }) => (
          <button key={label} type="button" disabled={!active} aria-current={active ? "page" : undefined} className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${active ? "bg-white text-slate-950 shadow-sm" : "cursor-not-allowed opacity-55"}`}>
            <Icon className="shrink-0" />
            <span>
              <span className="block text-xs font-semibold">{label}</span>
              <span className={`block text-[10px] ${active ? "text-slate-500" : styles.muted}`}>{detail}</span>
            </span>
          </button>
        ))}
      </div>
      <div className="absolute inset-x-3 bottom-3 rounded-2xl border border-white/10 bg-black/10 p-3">
        <div className="text-xs font-medium">SmartHive OS 1.0</div>
        <p className={`${styles.muted} mt-1 text-[10px] leading-relaxed`}>Website, Digital Twin, quotation, portals, business plans, AI, documentation, deployment, and supported segments are packaged for commercial launch.</p>
      </div>
    </motion.nav>
  );
}
