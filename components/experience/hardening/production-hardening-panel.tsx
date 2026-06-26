"use client";

import { useEffect, useMemo } from "react";
import {
  CreateHardeningRuntimeSnapshot,
  ENTERPRISE_HARDENING_CONTEXT,
  ENTERPRISE_HARDENING_REPORT,
  HARDENING_ACCESSIBILITY_CONTROLS,
  HARDENING_MONITORING_CONTROLS,
  HARDENING_OPTIMIZATION_CONTROLS,
  HARDENING_REPORT_ARTIFACTS,
  HARDENING_SECURITY_CONTROLS,
  HARDENING_TEST_CONTROLS,
} from "@/lib/experience/hardening";
import { useHardeningStore, usePerformanceStore, useSettingsStore } from "@/lib/experience/stores";
import type { HardeningReadinessStatus, HardeningReportKind } from "@/types/experience";
import styles from "@/styles/experience/experience.module.css";

const QUALITY_TIERS = ["high", "balanced", "performance"] as const;
const REPORT_KINDS: readonly HardeningReportKind[] = ["performance", "security", "accessibility", "test-coverage", "monitoring"] as const;

function formatLabel(value: string) {
  return value.replace(/-/g, " ");
}

function statusClass(status: HardeningReadinessStatus) {
  if (status === "ready" || status === "configured") return "bg-emerald-300/15 text-emerald-100";
  if (status === "needs-runtime-service") return "bg-amber-300/15 text-amber-100";
  return "bg-rose-300/15 text-rose-100";
}

function statusTone(status: HardeningReadinessStatus) {
  if (status === "ready" || status === "configured") return "Ready";
  if (status === "needs-runtime-service") return "Runtime";
  return "Review";
}

export function ProductionHardeningPanel() {
  const performanceSnapshot = usePerformanceStore((state) => state.snapshot);
  const quality = usePerformanceStore((state) => state.quality);
  const setQuality = usePerformanceStore((state) => state.setQuality);
  const reducedMotion = useSettingsStore((state) => state.reducedMotion);
  const pixelRatio = useSettingsStore((state) => state.pixelRatio);
  const setPixelRatio = useSettingsStore((state) => state.setPixelRatio);
  const selectedReportKind = useHardeningStore((state) => state.selectedReportKind);
  const selectedOptimizationId = useHardeningStore((state) => state.selectedOptimizationId);
  const selectedSecurityId = useHardeningStore((state) => state.selectedSecurityId);
  const selectedTestId = useHardeningStore((state) => state.selectedTestId);
  const selectedReport = useHardeningStore((state) => state.selectedReport);
  const selectedOptimization = useHardeningStore((state) => state.selectedOptimization);
  const selectedSecurityControl = useHardeningStore((state) => state.selectedSecurityControl);
  const selectedTestControl = useHardeningStore((state) => state.selectedTestControl);
  const runtimeTargets = useHardeningStore((state) => state.runtimeTargets);
  const selectReportKind = useHardeningStore((state) => state.selectReportKind);
  const selectOptimization = useHardeningStore((state) => state.selectOptimization);
  const selectSecurityControl = useHardeningStore((state) => state.selectSecurityControl);
  const selectTestControl = useHardeningStore((state) => state.selectTestControl);
  const updateRuntimeSnapshot = useHardeningStore((state) => state.updateRuntimeSnapshot);

  const runtimeSnapshot = useMemo(
    () =>
      CreateHardeningRuntimeSnapshot(performanceSnapshot, {
        qualityTier: quality,
        reducedMotion,
        pixelRatio,
      }),
    [performanceSnapshot, pixelRatio, quality, reducedMotion],
  );

  useEffect(() => {
    updateRuntimeSnapshot(runtimeSnapshot);
  }, [runtimeSnapshot, updateRuntimeSnapshot]);

  return (
    <div className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-medium">Production Hardening</div>
          <div className={`${styles.muted} text-[10px]`}>
            {ENTERPRISE_HARDENING_REPORT.readinessScore}% enterprise readiness / {ENTERPRISE_HARDENING_REPORT.summary.reportCount} reports
          </div>
        </div>
        <span className="rounded-full bg-emerald-300/15 px-2 py-1 text-[9px] font-semibold uppercase text-emerald-100">Milestone 24</span>
      </div>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Runtime Snapshot</div>
        <dl className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
          <div><dt className={styles.muted}>FPS</dt><dd>{runtimeSnapshot.fps}</dd></div>
          <div><dt className={styles.muted}>Memory</dt><dd>{runtimeSnapshot.memoryMb === null ? "n/a" : `${runtimeSnapshot.memoryMb}MB`}</dd></div>
          <div><dt className={styles.muted}>Draw Calls</dt><dd>{runtimeSnapshot.drawCalls}</dd></div>
          <div><dt className={styles.muted}>Triangles</dt><dd>{runtimeSnapshot.triangles.toLocaleString()}</dd></div>
          <div><dt className={styles.muted}>Textures</dt><dd>{runtimeSnapshot.textures}</dd></div>
          <div><dt className={styles.muted}>Geometries</dt><dd>{runtimeSnapshot.geometries}</dd></div>
        </dl>
        <div className="mt-2 grid grid-cols-3 gap-1">
          {QUALITY_TIERS.map((tier) => (
            <button
              key={tier}
              type="button"
              onClick={() => setQuality(tier)}
              className={`rounded-xl border px-2 py-2 text-[9px] font-semibold uppercase transition ${quality === tier ? "border-emerald-200/40 bg-emerald-200/15 text-emerald-100" : "border-white/10 bg-black/15 text-white/65 hover:bg-white/10"}`}
            >
              {tier}
            </button>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-2 gap-1">
          <button type="button" onClick={() => setPixelRatio(1)} className="rounded-xl border border-white/10 bg-black/15 px-2 py-2 text-[9px] font-semibold uppercase hover:bg-white/10">
            DPR 1.0
          </button>
          <button type="button" onClick={() => setPixelRatio(1.5)} className="rounded-xl border border-white/10 bg-black/15 px-2 py-2 text-[9px] font-semibold uppercase hover:bg-white/10">
            DPR 1.5
          </button>
        </div>
        <p className={`${styles.muted} mt-2 text-[10px] leading-relaxed`}>
          Reduced motion: {reducedMotion ? "enabled" : "not requested"} / pixel ratio {pixelRatio}
        </p>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Performance Targets</div>
        <div className="mt-2 space-y-1">
          {runtimeTargets.map((target) => (
            <div key={target.id} className="rounded-xl border border-white/10 bg-black/10 p-2 text-[10px]">
              <span className="flex justify-between gap-2">
                <span className="font-medium">{target.label}</span>
                <span className={`rounded-full px-2 py-0.5 text-[8px] uppercase ${statusClass(target.status)}`}>{statusTone(target.status)}</span>
              </span>
              <span className={`${styles.muted} mt-1 block`}>
                target {target.targetFps} FPS / minimum {target.minimumFps} FPS / current {target.currentFps ?? "pending"}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Optimization</div>
        <div className="mt-2 grid grid-cols-2 gap-1">
          {HARDENING_OPTIMIZATION_CONTROLS.map((control) => (
            <button
              key={control.id}
              type="button"
              onClick={() => selectOptimization(control.id)}
              className={`rounded-xl border px-2 py-2 text-[9px] font-semibold uppercase transition ${selectedOptimizationId === control.id ? "border-emerald-200/40 bg-emerald-200/15 text-emerald-100" : "border-white/10 bg-black/15 text-white/65 hover:bg-white/10"}`}
            >
              {formatLabel(control.id)}
            </button>
          ))}
        </div>
        <p className={`${styles.muted} mt-2 text-[10px] leading-relaxed`}>
          {selectedOptimization ? `${selectedOptimization.label}: ${selectedOptimization.reportLabel}` : `${ENTERPRISE_HARDENING_REPORT.summary.optimizationCount} optimization controls ready.`}
        </p>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Quality Gates</div>
        <div className="mt-2 space-y-1">
          {ENTERPRISE_HARDENING_REPORT.qualityGates.map((gate) => (
            <div key={gate.id} className="rounded-xl border border-white/10 bg-black/10 p-2 text-[10px]">
              <span className="flex justify-between gap-2">
                <span className="font-medium">{gate.label}</span>
                <span className={`rounded-full px-2 py-0.5 text-[8px] uppercase ${statusClass(gate.status)}`}>{formatLabel(gate.status)}</span>
              </span>
              <span className={`${styles.muted} mt-1 block`}>{gate.current}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Security</div>
        <div className="mt-2 grid grid-cols-2 gap-1">
          {HARDENING_SECURITY_CONTROLS.map((control) => (
            <button
              key={control.id}
              type="button"
              onClick={() => selectSecurityControl(control.id)}
              className={`rounded-xl border px-2 py-2 text-[9px] font-semibold uppercase transition ${selectedSecurityId === control.id ? "border-emerald-200/40 bg-emerald-200/15 text-emerald-100" : "border-white/10 bg-black/15 text-white/65 hover:bg-white/10"}`}
            >
              {control.label}
            </button>
          ))}
        </div>
        <p className={`${styles.muted} mt-2 text-[10px] leading-relaxed`}>
          {selectedSecurityControl ? `${selectedSecurityControl.evidence} Recommendation: ${selectedSecurityControl.recommendation}` : "Select a security control."}
        </p>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Accessibility</div>
        <div className="mt-2 space-y-1">
          {HARDENING_ACCESSIBILITY_CONTROLS.map((control) => (
            <div key={control.id} className="rounded-xl border border-white/10 bg-black/10 p-2 text-[10px]">
              <span className="flex justify-between gap-2">
                <span className="font-medium">{control.label}</span>
                <span className={`rounded-full px-2 py-0.5 text-[8px] uppercase ${statusClass(control.status)}`}>{formatLabel(control.status)}</span>
              </span>
              <span className={`${styles.muted} mt-1 block`}>{control.evidence}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Testing</div>
        <div className="mt-2 grid grid-cols-2 gap-1">
          {HARDENING_TEST_CONTROLS.map((control) => (
            <button
              key={control.id}
              type="button"
              onClick={() => selectTestControl(control.id)}
              className={`rounded-xl border px-2 py-2 text-[9px] font-semibold uppercase transition ${selectedTestId === control.id ? "border-emerald-200/40 bg-emerald-200/15 text-emerald-100" : "border-white/10 bg-black/15 text-white/65 hover:bg-white/10"}`}
            >
              {control.label}
            </button>
          ))}
        </div>
        <p className={`${styles.muted} mt-2 text-[10px] leading-relaxed`}>
          {selectedTestControl ? `${selectedTestControl.coverageLabel}: ${selectedTestControl.command}` : "Select a test control."}
        </p>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Monitoring</div>
        <dl className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
          {HARDENING_MONITORING_CONTROLS.map((control) => (
            <div key={control.id}>
              <dt className={styles.muted}>{control.label}</dt>
              <dd>{statusTone(control.status)}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Reports</div>
        <div className="mt-2 grid grid-cols-2 gap-1">
          {REPORT_KINDS.map((kind) => (
            <button
              key={kind}
              type="button"
              onClick={() => selectReportKind(kind)}
              className={`rounded-xl border px-2 py-2 text-[9px] font-semibold uppercase transition ${selectedReportKind === kind ? "border-emerald-200/40 bg-emerald-200/15 text-emerald-100" : "border-white/10 bg-black/15 text-white/65 hover:bg-white/10"}`}
            >
              {formatLabel(kind)}
            </button>
          ))}
        </div>
        <p className={`${styles.muted} mt-2 text-[10px] leading-relaxed`}>
          {selectedReport ? `${selectedReport.title}: ${selectedReport.itemCount} items ready at ${selectedReport.path}.` : `${HARDENING_REPORT_ARTIFACTS.length} hardening reports ready.`}
        </p>
        <p className={`${styles.muted} mt-2 text-[10px] leading-relaxed`}>
          Next {ENTERPRISE_HARDENING_CONTEXT.nextVersion} / React {ENTERPRISE_HARDENING_CONTEXT.reactVersion} / global headers {ENTERPRISE_HARDENING_REPORT.constraints.globalHeaders}.
        </p>
      </section>
    </div>
  );
}
