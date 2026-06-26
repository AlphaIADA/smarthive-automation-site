"use client";

import { useMemo } from "react";
import {
  CONFIGURATION_CATEGORIES,
  CONFIGURATION_CATEGORY_LABELS,
  CONFIGURATION_ITEMS,
  CONFIGURATION_PACKAGES,
  CONFIGURATION_REPORT,
  calculateConfigurationCost,
  createConfigurationCrmLeadPayload,
  createConfigurationDesignSnapshot,
  createConfigurationExportArtifacts,
  createConfigurationProposal,
  getConfigurationItem,
} from "@/lib/experience/configuration/configuration-catalog";
import { useConfigurationStore } from "@/lib/experience/stores";
import styles from "@/styles/experience/experience.module.css";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function formatLabel(value: string) {
  return value.replace(/-/g, " ");
}

function packageClass(active: boolean) {
  return active ? "border-emerald-200/40 bg-emerald-200/15 text-emerald-100" : "border-white/10 bg-black/15 text-white/65 hover:bg-white/10";
}

export function ConfigurationPanel() {
  const selectedPackageId = useConfigurationStore((state) => state.selectedPackageId);
  const selectedItemIds = useConfigurationStore((state) => state.selectedItemIds);
  const activeCategory = useConfigurationStore((state) => state.activeCategory);
  const selectedConfigurationItemId = useConfigurationStore((state) => state.selectedConfigurationItemId);
  const selectPackage = useConfigurationStore((state) => state.selectPackage);
  const toggleItem = useConfigurationStore((state) => state.toggleItem);
  const selectItem = useConfigurationStore((state) => state.selectItem);
  const setActiveCategory = useConfigurationStore((state) => state.setActiveCategory);
  const reset = useConfigurationStore((state) => state.reset);
  const selectedSet = useMemo(() => new Set(selectedItemIds), [selectedItemIds]);
  const cost = useMemo(() => calculateConfigurationCost(selectedItemIds, selectedPackageId), [selectedItemIds, selectedPackageId]);
  const designSnapshot = useMemo(() => createConfigurationDesignSnapshot(selectedItemIds, selectedPackageId), [selectedItemIds, selectedPackageId]);
  const proposal = useMemo(() => createConfigurationProposal(selectedItemIds, selectedPackageId), [selectedItemIds, selectedPackageId]);
  const exports = useMemo(() => createConfigurationExportArtifacts(selectedItemIds), [selectedItemIds]);
  const crmLead = useMemo(() => createConfigurationCrmLeadPayload(selectedItemIds, selectedPackageId), [selectedItemIds, selectedPackageId]);
  const selectedItem = selectedConfigurationItemId ? getConfigurationItem(selectedConfigurationItemId) : null;
  const visibleItems = useMemo(
    () => CONFIGURATION_ITEMS.filter((item) => activeCategory === "all" || item.category === activeCategory).slice(0, 42),
    [activeCategory],
  );

  return (
    <div className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-medium">Customer Configurator</div>
          <div className={`${styles.muted} text-[10px]`}>
            {CONFIGURATION_REPORT.itemCount} selectable items / {cost.selectedItemCount} selected
          </div>
        </div>
        <span className="rounded-full bg-emerald-300/15 px-2 py-1 text-[9px] font-semibold uppercase text-emerald-100">Live Cost</span>
      </div>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Real-Time Cost</div>
        <dl className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
          <div><dt className={styles.muted}>Equipment</dt><dd>{formatCurrency(cost.equipmentCost)}</dd></div>
          <div><dt className={styles.muted}>Installation</dt><dd>{formatCurrency(cost.installationCost)}</dd></div>
          <div><dt className={styles.muted}>Labour</dt><dd>{formatCurrency(cost.labourCost)}</dd></div>
          <div><dt className={styles.muted}>Tax</dt><dd>{formatCurrency(cost.taxCost)}</dd></div>
          <div><dt className={styles.muted}>Discount</dt><dd>{formatCurrency(cost.discountAmount)} ({cost.discountPercent}%)</dd></div>
          <div><dt className={styles.muted}>Grand Total</dt><dd className="font-semibold text-emerald-100">{formatCurrency(cost.grandTotal)}</dd></div>
        </dl>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Package Comparison</div>
        <div className="mt-2 grid grid-cols-1 gap-1">
          {CONFIGURATION_PACKAGES.map((configurationPackage) => (
            <button
              key={configurationPackage.id}
              type="button"
              onClick={() => selectPackage(configurationPackage.id)}
              className={`rounded-xl border px-2 py-2 text-left text-[10px] transition ${packageClass(selectedPackageId === configurationPackage.id)}`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="font-semibold">{configurationPackage.name}</span>
                <span>{formatCurrency(configurationPackage.grandTotal)}</span>
              </span>
              <span className={`${styles.muted} mt-1 block`}>
                {configurationPackage.itemIds.length} items / {configurationPackage.discountPercent}% discount
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Configuration Categories</div>
        <div className="mt-2 grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={`rounded-xl border px-2 py-2 text-[9px] font-semibold uppercase transition ${activeCategory === "all" ? "border-emerald-200/40 bg-emerald-200/15 text-emerald-100" : "border-white/10 bg-black/15 text-white/65 hover:bg-white/10"}`}
          >
            All
          </button>
          {CONFIGURATION_CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`rounded-xl border px-2 py-2 text-[9px] font-semibold uppercase transition ${activeCategory === category ? "border-emerald-200/40 bg-emerald-200/15 text-emerald-100" : "border-white/10 bg-black/15 text-white/65 hover:bg-white/10"}`}
            >
              {CONFIGURATION_CATEGORY_LABELS[category]}
            </button>
          ))}
        </div>
      </section>

      {selectedItem ? (
        <section className="mt-3 rounded-2xl border border-emerald-200/20 bg-emerald-200/10 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-xs font-semibold">{selectedItem.name}</div>
              <div className={`${styles.muted} text-[10px]`}>{CONFIGURATION_CATEGORY_LABELS[selectedItem.category]} / {selectedItem.roomName ?? "Site"}</div>
            </div>
            <span className="rounded-full bg-black/20 px-2 py-1 text-[9px] font-semibold uppercase">
              {selectedSet.has(selectedItem.id) ? "Selected" : "Optional"}
            </span>
          </div>
          <p className={`${styles.muted} mt-2 text-[10px] leading-relaxed`}>{selectedItem.description}</p>
          <dl className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
            <div><dt className={styles.muted}>Maker</dt><dd>{selectedItem.manufacturer}</dd></div>
            <div><dt className={styles.muted}>Model</dt><dd>{selectedItem.model}</dd></div>
            <div><dt className={styles.muted}>Equipment</dt><dd>{formatCurrency(selectedItem.pricing.equipmentCost)}</dd></div>
            <div><dt className={styles.muted}>Install + Labour</dt><dd>{formatCurrency(selectedItem.pricing.installationCost + selectedItem.pricing.labourCost)}</dd></div>
          </dl>
        </section>
      ) : null}

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Clickable Items</div>
          <button type="button" onClick={reset} className={`${styles.muted} text-[10px] hover:text-white`}>Reset</button>
        </div>
        <div className="mt-2 max-h-52 space-y-1 overflow-y-auto pr-1">
          {visibleItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                toggleItem(item.id);
                selectItem(item.id);
              }}
              className={`flex w-full items-center gap-2 rounded-xl border px-2 py-2 text-left text-[10px] transition ${selectedSet.has(item.id) ? "border-emerald-200/40 bg-emerald-200/15" : "border-white/10 bg-black/10 hover:bg-white/10"}`}
            >
              <span className={`size-2 shrink-0 rounded-full ${selectedSet.has(item.id) ? "bg-emerald-300" : "bg-white/30"}`} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{item.name}</span>
                <span className={`${styles.muted} block truncate`}>{CONFIGURATION_CATEGORY_LABELS[item.category]} / {item.roomName ?? "Site"}</span>
              </span>
              <span>{formatCurrency(item.pricing.equipmentCost + item.pricing.installationCost + item.pricing.labourCost)}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Save / Share / Load Later</div>
        <dl className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
          <div><dt className={styles.muted}>Design ID</dt><dd className="truncate">{designSnapshot.id}</dd></div>
          <div><dt className={styles.muted}>Share Token</dt><dd className="truncate">{designSnapshot.shareToken}</dd></div>
          <div><dt className={styles.muted}>Account</dt><dd>{designSnapshot.customerAccountReady ? "Ready" : "No"}</dd></div>
          <div><dt className={styles.muted}>Load Later</dt><dd>{designSnapshot.loadLaterReady ? "Ready" : "No"}</dd></div>
        </dl>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Generate</div>
        <div className={`${styles.muted} mt-2 space-y-1 text-[10px]`}>
          {exports.map((artifact) => (
            <div key={artifact.id} className="flex justify-between gap-2">
              <span className="truncate">{artifact.title}</span>
              <span>{artifact.itemCount}</span>
            </div>
          ))}
        </div>
        <p className={`${styles.muted} mt-2 text-[10px] leading-relaxed`}>
          Proposal sections: {proposal.sections.slice(0, 4).join(", ")}. PDF payload ready; existing PDF engine untouched.
        </p>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">CRM Lead Payload</div>
        <dl className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
          <div><dt className={styles.muted}>Lead ID</dt><dd className="truncate">{crmLead.id}</dd></div>
          <div><dt className={styles.muted}>Status</dt><dd className="capitalize">{formatLabel(crmLead.status)}</dd></div>
          <div><dt className={styles.muted}>Assigned</dt><dd className="truncate">{crmLead.assignedSalesStaff}</dd></div>
          <div><dt className={styles.muted}>Value</dt><dd>{formatCurrency(crmLead.estimatedValue)}</dd></div>
        </dl>
        <p className={`${styles.muted} mt-2 text-[10px] leading-relaxed`}>
          CRM handoff payload is ready. Existing CRM, API, and database remain untouched.
        </p>
      </section>
    </div>
  );
}
