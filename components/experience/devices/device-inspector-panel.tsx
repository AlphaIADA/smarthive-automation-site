"use client";

import { useMemo, useState } from "react";
import {
  DEVICE_CATEGORY_LABELS,
  ROOM_DEVICE_REGISTRIES,
  SMART_DEVICE_CATEGORIES,
  SMART_DEVICE_FRAMEWORK_REPORT,
  SMART_DEVICES,
  getSmartDevice,
} from "@/lib/experience/devices/device-catalog";
import { DEFAULT_DEVICE_SEARCH_FILTERS, filterSmartDevices } from "@/lib/experience/devices/device-search";
import type { EventBus } from "@/lib/experience/event-bus";
import { useSelectionStore } from "@/lib/experience/stores";
import type { SmartDeviceCategory, SmartDeviceOnlineStatus, SmartDeviceSearchFilters, SmartDeviceSnapshot } from "@/types/experience";
import styles from "@/styles/experience/experience.module.css";
import { DeviceCategoryIcon } from "./device-icons";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function statusClass(status: SmartDeviceSnapshot["onlineStatus"]) {
  return status === "online" ? "bg-emerald-300/15 text-emerald-200" : "bg-rose-300/15 text-rose-100";
}

function DeviceInspectorDetails({ device }: { readonly device: SmartDeviceSnapshot }) {
  return (
    <section className="mt-4 rounded-2xl border border-sky-300/20 bg-sky-300/10 p-3">
      <div className="flex items-start gap-3">
        <div className="grid size-12 shrink-0 place-items-center rounded-2xl border border-white/10 bg-black/20 text-sky-100">
          <DeviceCategoryIcon category={device.category} className="size-6" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-xs font-semibold">{device.name}</div>
          <div className={`${styles.muted} mt-0.5 text-[10px]`}>{DEVICE_CATEGORY_LABELS[device.category]} / {device.roomName}</div>
          <span className={`mt-2 inline-flex rounded-full px-2 py-1 text-[9px] font-semibold uppercase ${statusClass(device.onlineStatus)}`}>{device.onlineStatus}</span>
        </div>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
        <div><dt className={styles.muted}>Manufacturer</dt><dd>{device.manufacturer}</dd></div>
        <div><dt className={styles.muted}>Model</dt><dd>{device.model}</dd></div>
        <div><dt className={styles.muted}>Firmware</dt><dd>{device.firmwareVersion}</dd></div>
        <div><dt className={styles.muted}>Connectivity</dt><dd className="capitalize">{device.connectivity}</dd></div>
        <div><dt className={styles.muted}>Power</dt><dd className="capitalize">{device.powerState}</dd></div>
        <div><dt className={styles.muted}>Health</dt><dd className="capitalize">{device.healthStatus.replace("-", " ")}</dd></div>
        <div><dt className={styles.muted}>Signal</dt><dd>{device.signalStrength}%</dd></div>
        <div><dt className={styles.muted}>Battery</dt><dd>{device.batteryStatus ? `${device.batteryStatus.levelPercent}%` : "N/A"}</dd></div>
        <div><dt className={styles.muted}>Equipment</dt><dd>{formatCurrency(device.pricing.equipmentPrice)}</dd></div>
        <div><dt className={styles.muted}>Install</dt><dd>{formatCurrency(device.pricing.installationPrice)}</dd></div>
        <div><dt className={styles.muted}>Warranty</dt><dd>{device.warranty.years} years</dd></div>
        <div><dt className={styles.muted}>Active W</dt><dd>{device.powerConsumption.activeWatts}W</dd></div>
      </dl>

      <div className="mt-3 rounded-xl border border-white/10 bg-black/15 p-2">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Future Automation Rules</div>
        <p className={`${styles.muted} mt-1 text-[10px] leading-relaxed`}>
          Hooks exposed: {device.futureAutomationHooks.triggerHooks.length} triggers, {device.futureAutomationHooks.conditionHooks.length} conditions, {device.futureAutomationHooks.actionHooks.length} actions. Logic not implemented.
        </p>
      </div>
    </section>
  );
}

function DeviceSearchFilters({
  filters,
  setFilters,
}: {
  readonly filters: SmartDeviceSearchFilters;
  readonly setFilters: (filters: SmartDeviceSearchFilters) => void;
}) {
  const manufacturers = useMemo(() => Array.from(new Set(SMART_DEVICES.map((device) => device.manufacturer))).sort(), []);

  return (
    <div className="mt-4 space-y-2">
      <input
        type="search"
        value={filters.query}
        onChange={(event) => setFilters({ ...filters, query: event.target.value })}
        placeholder="Search devices"
        className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs outline-none placeholder:text-white/35 focus:border-sky-300/40"
      />
      <div className="grid grid-cols-2 gap-2">
        <select className="rounded-xl border border-white/10 bg-black/20 px-2 py-2 text-[10px] outline-none" value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value as SmartDeviceCategory | "all" })}>
          <option value="all">All categories</option>
          {SMART_DEVICE_CATEGORIES.map((category) => (
            <option key={category} value={category}>{DEVICE_CATEGORY_LABELS[category]}</option>
          ))}
        </select>
        <select className="rounded-xl border border-white/10 bg-black/20 px-2 py-2 text-[10px] outline-none" value={filters.manufacturer} onChange={(event) => setFilters({ ...filters, manufacturer: event.target.value })}>
          <option value="all">All makers</option>
          {manufacturers.map((manufacturer) => (
            <option key={manufacturer} value={manufacturer}>{manufacturer}</option>
          ))}
        </select>
        <select className="rounded-xl border border-white/10 bg-black/20 px-2 py-2 text-[10px] outline-none" value={filters.roomId} onChange={(event) => setFilters({ ...filters, roomId: event.target.value })}>
          <option value="all">All rooms</option>
          {ROOM_DEVICE_REGISTRIES.map((registry) => (
            <option key={registry.roomId} value={registry.roomId}>{registry.roomName}</option>
          ))}
        </select>
        <select className="rounded-xl border border-white/10 bg-black/20 px-2 py-2 text-[10px] outline-none" value={filters.onlineStatus} onChange={(event) => setFilters({ ...filters, onlineStatus: event.target.value as SmartDeviceOnlineStatus | "all" })}>
          <option value="all">All status</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
        </select>
      </div>
    </div>
  );
}

export function DeviceInspectorPanel({ eventBus }: { readonly eventBus: EventBus }) {
  const selectedId = useSelectionStore((state) => (state.kind === "device" ? state.selectedId : null));
  const selectedDevice = selectedId ? getSmartDevice(selectedId) : null;
  const [filters, setFilters] = useState<SmartDeviceSearchFilters>(DEFAULT_DEVICE_SEARCH_FILTERS);
  const results = useMemo(() => filterSmartDevices(SMART_DEVICES, filters), [filters]);

  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-black/10 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-medium">Device Framework</div>
          <div className={`${styles.muted} text-[10px]`}>{SMART_DEVICE_FRAMEWORK_REPORT.deviceCount} devices / {SMART_DEVICE_FRAMEWORK_REPORT.roomRegistryCount} rooms</div>
        </div>
        <span className="rounded-full bg-sky-300/15 px-2 py-1 text-[9px] font-semibold uppercase text-sky-100">Digital Twin</span>
      </div>

      {selectedDevice ? <DeviceInspectorDetails device={selectedDevice} /> : (
        <div className="mt-4 rounded-2xl border border-white/10 bg-black/15 p-3 text-[10px] leading-relaxed">
          <div className="font-medium">No device selected</div>
          <p className={`${styles.muted} mt-1`}>Click a 3D placeholder or choose a result below to inspect specifications. Device control and automation are intentionally disabled.</p>
        </div>
      )}

      <DeviceSearchFilters filters={filters} setFilters={setFilters} />

      <div className="mt-3 max-h-64 space-y-1 overflow-y-auto pr-1">
        {results.slice(0, 28).map((device) => (
          <button
            key={device.uniqueId}
            type="button"
            onClick={() => {
              eventBus.emit("DEVICE_SELECTED", { deviceId: device.uniqueId });
              eventBus.emit("SELECTION_CHANGED", { kind: "device", id: device.uniqueId });
            }}
            className={`flex w-full items-center gap-2 rounded-xl border px-2 py-2 text-left text-[10px] transition ${selectedId === device.uniqueId ? "border-sky-300/40 bg-sky-300/15" : "border-white/10 bg-black/10 hover:bg-white/10"}`}
          >
            <DeviceCategoryIcon category={device.category} className="size-4 shrink-0" />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{device.name}</span>
              <span className={`${styles.muted} block truncate`}>{device.roomName} / {device.manufacturer}</span>
            </span>
            <span className={`size-1.5 shrink-0 rounded-full ${device.onlineStatus === "online" ? "bg-emerald-300" : "bg-rose-300"}`} />
          </button>
        ))}
        {results.length === 0 ? <div className={`${styles.muted} rounded-xl border border-white/10 bg-black/10 p-3 text-[10px]`}>No matching devices.</div> : null}
      </div>
    </div>
  );
}
