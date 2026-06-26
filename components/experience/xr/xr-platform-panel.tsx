"use client";

import {
  XR_AR_PLACEMENT_ANCHORS,
  XR_CAPABILITY_PROFILES,
  XR_FRAMEWORK_REPORT,
  XR_MODE_PROFILES,
  XR_PRESENTATION_STEPS,
  XR_VR_CONTROLLER_PROFILES,
} from "@/lib/experience/xr";
import { useXrStore } from "@/lib/experience/stores";
import type { XrMode, XrQualityLevel } from "@/types/experience";
import styles from "@/styles/experience/experience.module.css";

const QUALITY_LEVELS: readonly XrQualityLevel[] = ["ultra", "high", "balanced", "performance", "battery-saver"] as const;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function formatLabel(value: string) {
  return value.replace(/-/g, " ");
}

function modeClass(mode: XrMode, activeMode: XrMode) {
  return mode === activeMode ? "border-fuchsia-200/40 bg-fuchsia-200/15 text-fuchsia-100" : "border-white/10 bg-black/15 text-white/65 hover:bg-white/10";
}

export function XrPlatformPanel() {
  const mode = useXrStore((state) => state.mode);
  const deviceClass = useXrStore((state) => state.deviceClass);
  const qualityLevel = useXrStore((state) => state.qualityLevel);
  const selectedAnchorIds = useXrStore((state) => state.selectedAnchorIds);
  const selectedPresentationStep = useXrStore((state) => state.selectedPresentationStep);
  const quotationUpdate = useXrStore((state) => state.quotationUpdate);
  const modeProfile = useXrStore((state) => state.modeProfile);
  const setMode = useXrStore((state) => state.setMode);
  const setDeviceClass = useXrStore((state) => state.setDeviceClass);
  const setQualityLevel = useXrStore((state) => state.setQualityLevel);
  const toggleAnchor = useXrStore((state) => state.toggleAnchor);
  const selectPresentationStep = useXrStore((state) => state.selectPresentationStep);
  const resetPlacement = useXrStore((state) => state.resetPlacement);
  const visibleAnchors = XR_AR_PLACEMENT_ANCHORS.slice(0, 36);

  return (
    <div className="mt-4 rounded-2xl border border-fuchsia-300/20 bg-fuchsia-300/10 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-medium">Extended Reality</div>
          <div className={`${styles.muted} text-[10px]`}>
            {XR_FRAMEWORK_REPORT.modeCount} modes / {XR_FRAMEWORK_REPORT.deviceClassCount} device classes
          </div>
        </div>
        <span className="rounded-full bg-fuchsia-300/15 px-2 py-1 text-[9px] font-semibold uppercase text-fuchsia-100">XR Ready</span>
      </div>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">XR Modes</div>
        <div className="mt-2 grid grid-cols-2 gap-1">
          {XR_MODE_PROFILES.map((profile) => (
            <button
              key={profile.mode}
              type="button"
              onClick={() => setMode(profile.mode)}
              className={`rounded-xl border px-2 py-2 text-[9px] font-semibold uppercase transition ${modeClass(profile.mode, mode)}`}
            >
              {formatLabel(profile.mode)}
            </button>
          ))}
        </div>
        <p className={`${styles.muted} mt-2 text-[10px] leading-relaxed`}>
          {modeProfile.label}: {modeProfile.supportedDevices.map(formatLabel).slice(0, 4).join(", ")}. Voice commands {modeProfile.voiceCommandsReady ? "ready" : "reserved"}.
        </p>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Device Classes</div>
        <div className="mt-2 grid grid-cols-2 gap-1">
          {XR_CAPABILITY_PROFILES.map((profile) => (
            <button
              key={profile.deviceClass}
              type="button"
              onClick={() => setDeviceClass(profile.deviceClass)}
              className={`rounded-xl border px-2 py-2 text-[9px] font-semibold uppercase transition ${deviceClass === profile.deviceClass ? "border-fuchsia-200/40 bg-fuchsia-200/15 text-fuchsia-100" : "border-white/10 bg-black/15 text-white/65 hover:bg-white/10"}`}
            >
              {formatLabel(profile.deviceClass)}
            </button>
          ))}
        </div>
        <p className={`${styles.muted} mt-2 text-[10px] leading-relaxed`}>
          {XR_CAPABILITY_PROFILES.find((profile) => profile.deviceClass === deviceClass)?.notes}
        </p>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">AR Placement</div>
        <dl className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
          <div><dt className={styles.muted}>Anchors</dt><dd>{XR_FRAMEWORK_REPORT.arPlacementCount}</dd></div>
          <div><dt className={styles.muted}>Selected</dt><dd>{selectedAnchorIds.length}</dd></div>
          <div><dt className={styles.muted}>Categories</dt><dd>10</dd></div>
          <div><dt className={styles.muted}>Install Zones</dt><dd>Estimated</dd></div>
        </dl>
        <div className="mt-2 flex items-center justify-between">
          <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Placement List</div>
          <button type="button" onClick={resetPlacement} className={`${styles.muted} text-[10px] hover:text-white`}>Reset</button>
        </div>
        <div className="mt-2 max-h-40 space-y-1 overflow-y-auto pr-1">
          {visibleAnchors.map((anchor) => (
            <button
              key={anchor.id}
              type="button"
              onClick={() => toggleAnchor(anchor.id)}
              className={`flex w-full items-center justify-between gap-2 rounded-xl border px-2 py-2 text-left text-[10px] transition ${selectedAnchorIds.includes(anchor.id) ? "border-fuchsia-200/40 bg-fuchsia-200/15" : "border-white/10 bg-black/10 hover:bg-white/10"}`}
            >
              <span className="min-w-0">
                <span className="block truncate font-medium">{anchor.label}</span>
                <span className={`${styles.muted} block truncate`}>{formatLabel(anchor.category)} / {anchor.roomName ?? "Customer room"}</span>
              </span>
              <span>{formatCurrency(anchor.pricing.equipmentCost)}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">VR Controllers</div>
        <div className="mt-2 space-y-1">
          {XR_VR_CONTROLLER_PROFILES.map((controller) => (
            <div key={controller.id} className="rounded-xl border border-white/10 bg-black/15 p-2 text-[10px]">
              <div className="flex justify-between gap-2">
                <span className="font-medium">{controller.label}</span>
                <span className={styles.muted}>{controller.hand}</span>
              </div>
              <div className={styles.muted}>{controller.locomotion.map(formatLabel).join(", ")} / laser pointer / haptics ready</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Presentation Mode</div>
        <div className="mt-2 max-h-36 space-y-1 overflow-y-auto pr-1">
          {XR_PRESENTATION_STEPS.map((step) => (
            <button
              key={step.id}
              type="button"
              onClick={() => selectPresentationStep(step.id)}
              className={`w-full rounded-xl border px-2 py-2 text-left text-[10px] transition ${selectedPresentationStep?.id === step.id ? "border-fuchsia-200/40 bg-fuchsia-200/15" : "border-white/10 bg-black/10 hover:bg-white/10"}`}
            >
              <span className="flex justify-between gap-2">
                <span className="font-medium">{step.title}</span>
                <span className={styles.muted}>{formatLabel(step.type)}</span>
              </span>
              <span className={`${styles.muted} mt-1 block`}>{step.recommendation}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Performance</div>
        <dl className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
          <div><dt className={styles.muted}>Desktop</dt><dd>{XR_FRAMEWORK_REPORT.performance.targetDesktopFps} FPS</dd></div>
          <div><dt className={styles.muted}>Mobile</dt><dd>{XR_FRAMEWORK_REPORT.performance.targetMobileFps} FPS</dd></div>
          <div><dt className={styles.muted}>VR</dt><dd>{XR_FRAMEWORK_REPORT.performance.targetVrFps} FPS</dd></div>
          <div><dt className={styles.muted}>Foveated</dt><dd>Ready</dd></div>
        </dl>
        <div className="mt-2 grid grid-cols-2 gap-1">
          {QUALITY_LEVELS.map((candidate) => (
            <button
              key={candidate}
              type="button"
              onClick={() => setQualityLevel(candidate)}
              className={`rounded-xl border px-2 py-2 text-[9px] font-semibold uppercase transition ${qualityLevel === candidate ? "border-fuchsia-200/40 bg-fuchsia-200/15 text-fuchsia-100" : "border-white/10 bg-black/15 text-white/65 hover:bg-white/10"}`}
            >
              {formatLabel(candidate)}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">XR Quote Update</div>
        <dl className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
          <div><dt className={styles.muted}>Equipment</dt><dd>{formatCurrency(quotationUpdate.equipmentCost)}</dd></div>
          <div><dt className={styles.muted}>Install</dt><dd>{formatCurrency(quotationUpdate.installationCost)}</dd></div>
          <div><dt className={styles.muted}>Labour</dt><dd>{formatCurrency(quotationUpdate.labourCost)}</dd></div>
          <div><dt className={styles.muted}>Total</dt><dd>{formatCurrency(quotationUpdate.totalCost)}</dd></div>
        </dl>
        <p className={`${styles.muted} mt-2 text-[10px] leading-relaxed`}>
          XR selections update an internal placement quote payload. Existing quotation engine remains untouched.
        </p>
      </section>
    </div>
  );
}
