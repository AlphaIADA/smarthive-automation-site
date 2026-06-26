"use client";

import { useEffect } from "react";
import { VISION_AI_CONFIGURATION_SYNC, VISION_AI_REPORT, VisionAiApi } from "@/lib/experience/vision-ai";
import { useSelectionStore, useVisionAiStore } from "@/lib/experience/stores";
import type { VisionRating, VisionRecognitionCategory } from "@/types/experience";
import styles from "@/styles/experience/experience.module.css";

const RECOGNITION_LABELS: Record<VisionRecognitionCategory, string> = {
  object: "Objects",
  room: "Room",
  furniture: "Furniture",
  lighting: "Lighting",
  security: "Security",
  device: "Devices",
  power: "Power",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function formatHours(value: number) {
  if (value === 0) return "0h";
  return `${value.toFixed(value % 1 === 0 ? 0 : 1)}h`;
}

function ratingClass(rating: VisionRating) {
  if (rating === "A+") return "bg-emerald-300/20 text-emerald-100";
  if (rating === "A") return "bg-sky-300/20 text-sky-100";
  if (rating === "B") return "bg-amber-300/20 text-amber-100";
  return "bg-rose-300/20 text-rose-100";
}

export function VisionAiPanel() {
  const selectedKind = useSelectionStore((state) => state.kind);
  const selectedId = useSelectionStore((state) => state.selectedId);
  const selectedRoomId = useVisionAiStore((state) => state.selectedRoomId);
  const scanMode = useVisionAiStore((state) => state.scanMode);
  const activeAnalysis = useVisionAiStore((state) => state.activeAnalysis);
  const quoteDraft = useVisionAiStore((state) => state.quoteDraft);
  const lastScanLabel = useVisionAiStore((state) => state.lastScanLabel);
  const scanRoom = useVisionAiStore((state) => state.scanRoom);
  const startCameraModeScan = useVisionAiStore((state) => state.startCameraModeScan);
  const preparePhotoImport = useVisionAiStore((state) => state.preparePhotoImport);
  const generateQuote = useVisionAiStore((state) => state.generateQuote);
  const apiEntries = Object.keys(VisionAiApi);

  useEffect(() => {
    if (selectedKind !== "room" || !selectedId || selectedId === selectedRoomId) return;
    scanRoom(selectedId, "room-click");
  }, [scanRoom, selectedId, selectedKind, selectedRoomId]);

  return (
    <div className="mt-4 rounded-2xl border border-violet-300/20 bg-violet-300/10 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-medium">SmartHive Vision AI</div>
          <div className={`${styles.muted} text-[10px]`}>
            {VISION_AI_REPORT.roomAnalysisCount} room scans / {VISION_AI_REPORT.detectionCount} detections
          </div>
        </div>
        <span className="rounded-full bg-emerald-300/15 px-2 py-1 text-[9px] font-semibold uppercase text-emerald-100">Photo Ready</span>
      </div>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate text-xs font-semibold">{activeAnalysis.roomName}</div>
            <div className={`${styles.muted} text-[10px] capitalize`}>
              {scanMode.replace(/-/g, " ")} / {lastScanLabel}
            </div>
          </div>
          <div className="flex gap-1">
            <span className={`rounded-full px-2 py-1 text-[9px] font-semibold ${ratingClass(activeAnalysis.energyRating)}`}>E {activeAnalysis.energyRating}</span>
            <span className={`rounded-full px-2 py-1 text-[9px] font-semibold ${ratingClass(activeAnalysis.securityRating)}`}>S {activeAnalysis.securityRating}</span>
          </div>
        </div>
        <p className={`${styles.muted} mt-2 text-[10px] leading-relaxed`}>{activeAnalysis.summary}</p>
        <div className="mt-2 grid grid-cols-3 gap-1">
          <button type="button" onClick={() => scanRoom(activeAnalysis.roomId, "room-click")} className="rounded-xl border border-white/10 bg-black/15 px-2 py-2 text-[9px] font-semibold uppercase hover:bg-white/10">Scan</button>
          <button type="button" onClick={startCameraModeScan} className="rounded-xl border border-white/10 bg-black/15 px-2 py-2 text-[9px] font-semibold uppercase hover:bg-white/10">Camera</button>
          <button type="button" onClick={preparePhotoImport} className="rounded-xl border border-white/10 bg-black/15 px-2 py-2 text-[9px] font-semibold uppercase hover:bg-white/10">Photo</button>
        </div>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Recognition</div>
        <div className="mt-2 grid grid-cols-2 gap-1 text-[10px]">
          {activeAnalysis.recognitions.map((recognition) => (
            <div key={recognition.id} className="rounded-xl border border-white/10 bg-black/15 p-2">
              <div className="flex items-center justify-between gap-2">
                <span>{RECOGNITION_LABELS[recognition.category]}</span>
                <span className={styles.muted}>{Math.round(recognition.confidence * 100)}%</span>
              </div>
              <div className={`${styles.muted} mt-1`}>{recognition.count} detected</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Installed Devices</div>
        <div className="mt-2 max-h-32 space-y-1 overflow-y-auto pr-1 text-[10px]">
          {activeAnalysis.installedDevices.slice(0, 10).map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/10 px-2 py-2">
              <span className="min-w-0 truncate">{item.name}</span>
              <span className={`${styles.muted} shrink-0 capitalize`}>{item.category}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Missing / Improvements</div>
        <div className="mt-2 space-y-2">
          {activeAnalysis.missingDevices.slice(0, 4).map((item) => (
            <div key={item.id} className="rounded-xl border border-amber-200/15 bg-amber-200/10 p-2 text-[10px]">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{item.title}</span>
                <span className="uppercase text-amber-100">{item.priority}</span>
              </div>
              <p className={`${styles.muted} mt-1 leading-relaxed`}>{item.reason}</p>
            </div>
          ))}
          {activeAnalysis.missingDevices.length === 0 ? <p className={`${styles.muted} text-[10px]`}>No immediate missing devices detected for this room.</p> : null}
        </div>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Vision Quote</div>
        <dl className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
          <div><dt className={styles.muted}>Estimated Cost</dt><dd>{formatCurrency(activeAnalysis.estimatedCost.totalCost)}</dd></div>
          <div><dt className={styles.muted}>Install Time</dt><dd>{formatHours(activeAnalysis.installationTimeHours)}</dd></div>
          <div><dt className={styles.muted}>Line Items</dt><dd>{quoteDraft.lineItems.length}</dd></div>
          <div><dt className={styles.muted}>Catalog Sync</dt><dd>{VISION_AI_CONFIGURATION_SYNC.selectedConfigurationCatalogItems}</dd></div>
        </dl>
        <button type="button" onClick={generateQuote} className="mt-2 w-full rounded-xl border border-violet-200/30 bg-violet-200/10 px-3 py-2 text-[10px] font-semibold uppercase text-violet-100 hover:bg-violet-200/15">
          Generate Vision Quote
        </button>
        <p className={`${styles.muted} mt-2 text-[10px] leading-relaxed`}>
          Quote is generated directly from Vision AI analysis. Existing quote engine remains untouched.
        </p>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Camera Mode</div>
        <dl className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
          <div><dt className={styles.muted}>Detections</dt><dd>{activeAnalysis.cameraDetections.length}</dd></div>
          <div><dt className={styles.muted}>Photo Import</dt><dd className="capitalize">{VISION_AI_REPORT.photoImport.status.replace(/-/g, " ")}</dd></div>
        </dl>
        <div className={`${styles.muted} mt-2 grid grid-cols-2 gap-1 text-[10px]`}>
          {apiEntries.map((name) => (
            <div key={name} className="rounded-xl border border-white/10 bg-black/15 px-2 py-2">{name}()</div>
          ))}
        </div>
      </section>
    </div>
  );
}
