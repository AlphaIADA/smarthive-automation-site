"use client";

import Link from "next/link";
import { EXPERIENCE_HOTSPOTS, HOTSPOT_TYPE_LABELS, getExperienceHotspot } from "@/lib/experience/assets/hotspots";
import { EXPERIENCE_MODEL_ASSETS } from "@/lib/experience/assets/model-manifest";
import {
  useConfigurationStore,
  useExperienceQuoteStore,
  useModelAssetStore,
} from "@/lib/experience/stores";
import styles from "@/styles/experience/experience.module.css";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function formatLabel(value: string) {
  return value.replace(/-/g, " ");
}

function statusClass(status: string) {
  if (status === "available" || status === "online" || status === "installed") return "bg-emerald-300/15 text-emerald-100";
  if (status === "missing" || status === "recommended") return "bg-amber-300/15 text-amber-100";
  if (status === "error" || status === "offline") return "bg-rose-300/15 text-rose-100";
  return "bg-white/10 text-white/65";
}

export function HotspotInspectorPanel() {
  const renderMode = useModelAssetStore((state) => state.renderMode);
  const setRenderMode = useModelAssetStore((state) => state.setRenderMode);
  const assetStatuses = useModelAssetStore((state) => state.assetStatuses);
  const selectedHotspotId = useModelAssetStore((state) => state.selectedHotspotId);
  const selectHotspot = useModelAssetStore((state) => state.selectHotspot);
  const guidedTourActive = useModelAssetStore((state) => state.guidedTourActive);
  const guidedTourIndex = useModelAssetStore((state) => state.guidedTourIndex);
  const setGuidedTour = useModelAssetStore((state) => state.setGuidedTour);
  const quoteItems = useExperienceQuoteStore((state) => state.items);
  const addHotspotToQuote = useExperienceQuoteStore((state) => state.addHotspotToQuote);
  const addConfigurationItem = useConfigurationStore((state) => state.addItem);
  const selectConfigurationItem = useConfigurationStore((state) => state.selectItem);
  const hotspot = getExperienceHotspot(selectedHotspotId);
  const quoteItem = hotspot ? quoteItems.find((item) => item.quoteItemId === hotspot.quoteMapping.quoteItemId) : null;
  const quoteTotal = quoteItems.reduce((total, item) => total + item.quantity * (item.unitPrice + item.installationCost + item.labourCost), 0);
  const tourStepLabel = (guidedTourIndex % 9) + 1;

  return (
    <div className="mt-4 rounded-2xl border border-sky-300/20 bg-sky-300/10 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-medium">Production GLB Pipeline</div>
          <div className={`${styles.muted} text-[10px]`}>{EXPERIENCE_HOTSPOTS.length} quote-ready hotspots / {quoteItems.length} quote lines</div>
        </div>
        <span className={`rounded-full px-2 py-1 text-[9px] font-semibold uppercase ${renderMode === "production-glb" ? "bg-sky-300/15 text-sky-100" : "bg-amber-300/15 text-amber-100"}`}>
          {renderMode === "production-glb" ? "GLB" : "Fallback"}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-1">
        <button
          type="button"
          onClick={() => setRenderMode("production-glb")}
          className={`rounded-xl border px-2 py-2 text-[9px] font-semibold uppercase transition ${renderMode === "production-glb" ? "border-sky-200/40 bg-sky-200/15 text-sky-100" : "border-white/10 bg-black/15 text-white/65 hover:bg-white/10"}`}
        >
          GLB Mode
        </button>
        <button
          type="button"
          onClick={() => setRenderMode("procedural-fallback")}
          className={`rounded-xl border px-2 py-2 text-[9px] font-semibold uppercase transition ${renderMode === "procedural-fallback" ? "border-amber-200/40 bg-amber-200/15 text-amber-100" : "border-white/10 bg-black/15 text-white/65 hover:bg-white/10"}`}
        >
          Dev Fallback
        </button>
      </div>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Guided Tour</div>
          <span className={`${styles.muted} text-[10px]`}>Step {tourStepLabel}/9</span>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-1">
          <button type="button" onClick={() => setGuidedTour(!guidedTourActive, guidedTourIndex)} className="rounded-xl border border-white/10 bg-black/15 px-2 py-2 text-[9px] font-semibold uppercase text-white/75 hover:bg-white/10">
            {guidedTourActive ? "Pause" : "Start"}
          </button>
          <button type="button" onClick={() => setGuidedTour(true, (guidedTourIndex + 1) % 9)} className="rounded-xl border border-white/10 bg-black/15 px-2 py-2 text-[9px] font-semibold uppercase text-white/75 hover:bg-white/10">
            Next View
          </button>
        </div>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Asset Status</div>
        <div className="mt-2 space-y-1">
          {EXPERIENCE_MODEL_ASSETS.slice(0, 5).map((asset) => {
            const status = assetStatuses[asset.id]?.status ?? "idle";
            return (
              <div key={asset.id} className="flex items-center justify-between gap-2 text-[10px]">
                <span className="truncate">{asset.fileName}</span>
                <span className={`rounded-full px-2 py-0.5 font-semibold uppercase ${statusClass(status)}`}>{status}</span>
              </div>
            );
          })}
        </div>
      </section>

      {hotspot ? (
        <section className="mt-3 rounded-2xl border border-sky-200/20 bg-sky-200/10 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-xs font-semibold">{hotspot.label}</div>
              <div className={`${styles.muted} text-[10px]`}>{HOTSPOT_TYPE_LABELS[hotspot.type]} / {hotspot.room}</div>
            </div>
            <span className={`rounded-full px-2 py-1 text-[9px] font-semibold uppercase ${statusClass(hotspot.status)}`}>{formatLabel(hotspot.status)}</span>
          </div>
          <p className={`${styles.muted} mt-2 text-[10px] leading-relaxed`}>{hotspot.description}</p>
          <dl className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
            <div><dt className={styles.muted}>Device</dt><dd>{hotspot.manufacturer}</dd></div>
            <div><dt className={styles.muted}>Model</dt><dd>{hotspot.model}</dd></div>
            <div><dt className={styles.muted}>Equipment</dt><dd>{formatCurrency(hotspot.quoteMapping.equipmentPrice)}</dd></div>
            <div><dt className={styles.muted}>Install</dt><dd>{formatCurrency(hotspot.quoteMapping.installationCost)}</dd></div>
            <div><dt className={styles.muted}>Labour</dt><dd>{formatCurrency(hotspot.quoteMapping.labourCost)}</dd></div>
            <div><dt className={styles.muted}>Quote Status</dt><dd>{quoteItem ? `${quoteItem.quantity} selected` : "Not added"}</dd></div>
          </dl>
          <div className={`${styles.muted} mt-2 text-[10px]`}>
            Catalog: {hotspot.quoteMapping.catalogSlug ?? "Experience-only"} / Config: {hotspot.quoteMapping.configurationItemId ?? "pending"}
          </div>
          <button
            type="button"
            onClick={() => {
              addHotspotToQuote(hotspot);
              if (hotspot.quoteMapping.configurationItemId) {
                addConfigurationItem(hotspot.quoteMapping.configurationItemId);
                selectConfigurationItem(hotspot.quoteMapping.configurationItemId);
              }
            }}
            className="mt-3 w-full rounded-xl border border-sky-200/30 bg-sky-200/15 px-3 py-2 text-[10px] font-semibold uppercase text-sky-100 hover:bg-sky-200/20"
          >
            {quoteItem ? `Add Again (${quoteItem.quantity})` : "Add to Quote"}
          </button>
          <button type="button" onClick={() => selectHotspot(null)} className={`${styles.muted} mt-2 w-full text-[10px] hover:text-white`}>
            Clear hotspot selection
          </button>
        </section>
      ) : (
        <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
          <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Hotspot Inspector</div>
          <p className={`${styles.muted} mt-2 text-[10px] leading-relaxed`}>
            Select any GLB hotspot to inspect room, device pricing, installation cost, and quote mapping.
          </p>
        </section>
      )}

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="flex items-center justify-between gap-2 text-[10px]">
          <span className="font-medium uppercase tracking-[0.14em]">Experience Quote</span>
          <span>{formatCurrency(quoteTotal)}</span>
        </div>
        <p className={`${styles.muted} mt-2 text-[10px] leading-relaxed`}>
          Catalog-backed lines prefill the existing quote builder. Experience-only lines remain here until matching catalog rows are added.
        </p>
        <Link href="/quote" className="mt-2 block rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-center text-[10px] font-semibold uppercase text-white hover:bg-white/15 hover:no-underline">
          Open Quote Builder
        </Link>
      </section>
    </div>
  );
}
