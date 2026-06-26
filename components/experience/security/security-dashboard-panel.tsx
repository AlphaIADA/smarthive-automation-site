"use client";

import { useMemo, useState } from "react";
import {
  SECURITY_ACCESS_CONTROLS,
  SECURITY_CAMERAS,
  SECURITY_CATEGORY_LABELS,
  SECURITY_DASHBOARD_MODE_LABELS,
  SECURITY_DASHBOARD_MODES,
  SECURITY_DEVICE_LABELS,
  SECURITY_DEVICES,
  SECURITY_MAP_LAYERS,
  SECURITY_NOTIFICATIONS,
  SECURITY_PLATFORM_REPORT,
  SECURITY_QUOTE_SUMMARY,
  getSecurityDevice,
} from "@/lib/experience/security/security-catalog";
import { DEFAULT_SECURITY_NOTIFICATION_FILTERS, filterSecurityNotifications, summarizeSecurityNotifications, type SecurityNotificationFilters } from "@/lib/experience/security/security-notification-engine";
import { useSecurityStore } from "@/lib/experience/stores";
import type { SecurityDeviceCategory, SecurityDeviceSpec } from "@/types/experience";
import styles from "@/styles/experience/experience.module.css";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function formatMode(mode: string) {
  return mode.replace(/-/g, " ");
}

function statusClass(status: SecurityDeviceSpec["onlineStatus"] | SecurityDeviceSpec["healthStatus"]) {
  if (status === "online" || status === "healthy") return "bg-emerald-300/15 text-emerald-100";
  if (status === "warning") return "bg-amber-300/15 text-amber-100";
  return "bg-rose-300/15 text-rose-100";
}

function selectedDeviceDetails(device: SecurityDeviceSpec | null) {
  if (!device) {
    return (
      <div className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3 text-[10px] leading-relaxed">
        <div className="font-medium">No security device selected</div>
        <p className={`${styles.muted} mt-1`}>Click a camera, sensor, lock, or alarm marker in the villa map, or choose a registry item below.</p>
      </div>
    );
  }

  return (
    <section className="mt-3 rounded-2xl border border-rose-200/20 bg-rose-200/10 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-xs font-semibold">{device.name}</div>
          <div className={`${styles.muted} text-[10px]`}>
            {SECURITY_DEVICE_LABELS[device.type]} / {device.roomName}
          </div>
        </div>
        <span className={`rounded-full px-2 py-1 text-[9px] font-semibold uppercase ${statusClass(device.onlineStatus)}`}>{device.onlineStatus}</span>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
        <div><dt className={styles.muted}>Category</dt><dd>{SECURITY_CATEGORY_LABELS[device.category]}</dd></div>
        <div><dt className={styles.muted}>Health</dt><dd className="capitalize">{formatMode(device.healthStatus)}</dd></div>
        <div><dt className={styles.muted}>Manufacturer</dt><dd>{device.manufacturer}</dd></div>
        <div><dt className={styles.muted}>Model</dt><dd>{device.model}</dd></div>
        <div><dt className={styles.muted}>Firmware</dt><dd>{device.firmwareVersion}</dd></div>
        <div><dt className={styles.muted}>Signal</dt><dd>{device.signalStrength}%</dd></div>
        <div><dt className={styles.muted}>Battery</dt><dd>{device.batteryPercent === null ? "Wired" : `${device.batteryPercent}%`}</dd></div>
        <div><dt className={styles.muted}>Cost</dt><dd>{formatCurrency(device.pricing.equipmentCost + device.pricing.installationCost + device.pricing.labourCost)}</dd></div>
      </dl>

      {"fovDegrees" in device ? (
        <div className="mt-3 rounded-xl border border-white/10 bg-black/15 p-2">
          <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Live Camera View</div>
          <dl className={`${styles.muted} mt-2 grid grid-cols-2 gap-1 text-[10px]`}>
            <div><dt>FOV</dt><dd>{device.fovDegrees} deg</dd></div>
            <div><dt>Zoom</dt><dd>{device.zoom.optical}x optical</dd></div>
            <div><dt>Night</dt><dd>{device.nightVision ? "Enabled" : "Disabled"}</dd></div>
            <div><dt>Recording</dt><dd className="capitalize">{device.recordingStatus}</dd></div>
            <div><dt>Storage</dt><dd className="capitalize">{formatMode(device.storageStatus)}</dd></div>
            <div><dt>Live</dt><dd>{device.liveView.resolution} / {device.liveView.fps}fps</dd></div>
          </dl>
        </div>
      ) : null}

      {"accessZone" in device ? (
        <div className="mt-3 rounded-xl border border-white/10 bg-black/15 p-2">
          <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Access Control</div>
          <p className={`${styles.muted} mt-1 text-[10px] leading-relaxed`}>
            Zone {formatMode(device.accessZone)} / method {formatMode(device.accessMethod)} / state {formatMode(device.lockState)}. Audit trail ready, no automation rule implemented.
          </p>
        </div>
      ) : null}

      {"notificationType" in device ? (
        <div className="mt-3 rounded-xl border border-white/10 bg-black/15 p-2">
          <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Sensor</div>
          <p className={`${styles.muted} mt-1 text-[10px] leading-relaxed`}>
            Notification {formatMode(device.notificationType)}, radius {device.detectionRadiusMeters}m, tamper protected. Last event: {device.lastEvent}.
          </p>
        </div>
      ) : null}
    </section>
  );
}

function DeviceRegistryList({ categoryFilter }: { readonly categoryFilter: SecurityDeviceCategory | "all" }) {
  const selectedSecurityDeviceId = useSecurityStore((state) => state.selectedSecurityDeviceId);
  const selectSecurityDevice = useSecurityStore((state) => state.selectSecurityDevice);
  const devices = useMemo(() => SECURITY_DEVICES.filter((device) => categoryFilter === "all" || device.category === categoryFilter), [categoryFilter]);

  return (
    <div className="mt-3 max-h-56 space-y-1 overflow-y-auto pr-1">
      {devices.slice(0, 42).map((device) => (
        <button
          key={device.id}
          type="button"
          onClick={() => selectSecurityDevice(device.id)}
          className={`flex w-full items-center gap-2 rounded-xl border px-2 py-2 text-left text-[10px] transition ${selectedSecurityDeviceId === device.id ? "border-rose-200/40 bg-rose-200/15" : "border-white/10 bg-black/10 hover:bg-white/10"}`}
        >
          <span className={`size-2 shrink-0 rounded-full ${device.onlineStatus === "online" ? "bg-emerald-300" : "bg-rose-300"}`} />
          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium">{device.name}</span>
            <span className={`${styles.muted} block truncate`}>{SECURITY_CATEGORY_LABELS[device.category]} / {SECURITY_DEVICE_LABELS[device.type]}</span>
          </span>
          <span className={styles.muted}>{device.signalStrength}%</span>
        </button>
      ))}
    </div>
  );
}

export function SecurityDashboardPanel() {
  const dashboardMode = useSecurityStore((state) => state.dashboardMode);
  const setDashboardMode = useSecurityStore((state) => state.setDashboardMode);
  const selectedSecurityDeviceId = useSecurityStore((state) => state.selectedSecurityDeviceId);
  const visibleLayers = useSecurityStore((state) => state.visibleLayers);
  const toggleLayer = useSecurityStore((state) => state.toggleLayer);
  const [categoryFilter, setCategoryFilter] = useState<SecurityDeviceCategory | "all">("all");
  const [notificationFilters, setNotificationFilters] = useState<SecurityNotificationFilters>(DEFAULT_SECURITY_NOTIFICATION_FILTERS);
  const selectedDevice = selectedSecurityDeviceId ? getSecurityDevice(selectedSecurityDeviceId) : null;
  const notifications = useMemo(() => filterSecurityNotifications(SECURITY_NOTIFICATIONS, notificationFilters), [notificationFilters]);
  const notificationSummary = useMemo(() => summarizeSecurityNotifications(SECURITY_NOTIFICATIONS), []);

  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-black/10 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-medium">Security Platform</div>
          <div className={`${styles.muted} text-[10px]`}>
            {SECURITY_PLATFORM_REPORT.registrySummary.deviceCount} devices / {SECURITY_PLATFORM_REPORT.registrySummary.cameraCount} cameras
          </div>
        </div>
        <span className={`rounded-full px-2 py-1 text-[9px] font-semibold uppercase ${dashboardMode === "emergency" ? "bg-rose-300/20 text-rose-100" : "bg-emerald-300/15 text-emerald-100"}`}>
          {SECURITY_DASHBOARD_MODE_LABELS[dashboardMode]}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-1">
        {SECURITY_DASHBOARD_MODES.map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setDashboardMode(mode)}
            className={`rounded-xl border px-2 py-2 text-[9px] font-semibold uppercase transition ${dashboardMode === mode ? "border-rose-200/40 bg-rose-200/15 text-rose-100" : "border-white/10 bg-black/15 text-white/65 hover:bg-white/10"}`}
          >
            {SECURITY_DASHBOARD_MODE_LABELS[mode]}
          </button>
        ))}
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
        <div><dt className={styles.muted}>Sensors</dt><dd>{SECURITY_PLATFORM_REPORT.registrySummary.sensorCount}</dd></div>
        <div><dt className={styles.muted}>Locks</dt><dd>{SECURITY_PLATFORM_REPORT.registrySummary.accessControlCount}</dd></div>
        <div><dt className={styles.muted}>Recording</dt><dd>{SECURITY_PLATFORM_REPORT.registrySummary.recordingCameraCount}</dd></div>
        <div><dt className={styles.muted}>Offline</dt><dd>{SECURITY_PLATFORM_REPORT.registrySummary.offlineCount}</dd></div>
        <div><dt className={styles.muted}>Alerts</dt><dd>{notificationSummary.unacknowledged}</dd></div>
        <div><dt className={styles.muted}>Quote</dt><dd>{formatCurrency(SECURITY_QUOTE_SUMMARY.totalCost)}</dd></div>
      </dl>

      <div className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Security Map</div>
        <div className="mt-2 space-y-2">
          {SECURITY_MAP_LAYERS.map((layer) => (
            <label key={layer} className="flex cursor-pointer items-center justify-between text-[10px]">
              <span className="capitalize">{formatMode(layer)}</span>
              <input className="accent-rose-200" type="checkbox" checked={visibleLayers[layer]} onChange={(event) => toggleLayer(layer, event.target.checked)} />
            </label>
          ))}
        </div>
      </div>

      {selectedDeviceDetails(selectedDevice)}

      <div className="mt-3 grid grid-cols-2 gap-2">
        <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value as SecurityDeviceCategory | "all")} className="rounded-xl border border-white/10 bg-black/20 px-2 py-2 text-[10px] outline-none">
          <option value="all">All devices</option>
          {Object.entries(SECURITY_CATEGORY_LABELS).map(([category, label]) => (
            <option key={category} value={category}>{label}</option>
          ))}
        </select>
        <select value={notificationFilters.severity} onChange={(event) => setNotificationFilters({ ...notificationFilters, severity: event.target.value as SecurityNotificationFilters["severity"] })} className="rounded-xl border border-white/10 bg-black/20 px-2 py-2 text-[10px] outline-none">
          <option value="all">All alerts</option>
          <option value="critical">Critical</option>
          <option value="warning">Warning</option>
          <option value="info">Info</option>
        </select>
      </div>

      <DeviceRegistryList categoryFilter={categoryFilter} />

      <div className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Notifications</div>
        <div className="mt-2 max-h-40 space-y-1 overflow-y-auto pr-1">
          {notifications.slice(0, 18).map((notification) => (
            <button
              key={notification.id}
              type="button"
              onClick={() => useSecurityStore.getState().selectSecurityDevice(notification.deviceId)}
              className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-black/10 px-2 py-2 text-left text-[10px] hover:bg-white/10"
            >
              <span className={`size-2 shrink-0 rounded-full ${notification.severity === "critical" ? "bg-rose-300" : notification.severity === "warning" ? "bg-amber-300" : "bg-sky-300"}`} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{notification.title}</span>
                <span className={`${styles.muted} block truncate`}>{notification.roomName} / {formatMode(notification.type)}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Camera Registry</div>
        <div className={`${styles.muted} mt-2 space-y-1 text-[10px]`}>
          {SECURITY_CAMERAS.slice(0, 6).map((camera) => (
            <div key={camera.id} className="flex justify-between gap-2">
              <span className="truncate">{camera.name}</span>
              <span>{camera.liveView.resolution}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Access Control</div>
        <div className={`${styles.muted} mt-2 space-y-1 text-[10px]`}>
          {SECURITY_ACCESS_CONTROLS.slice(0, 6).map((access) => (
            <div key={access.id} className="flex justify-between gap-2">
              <span className="truncate">{access.name}</span>
              <span className="capitalize">{formatMode(access.accessZone)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Security Quote</div>
        <p className={`${styles.muted} mt-1 text-[10px] leading-relaxed`}>
          Recommends NVR, hard drives, UPS, PoE switches, cabling, conduit, and labour. Internal total {formatCurrency(SECURITY_QUOTE_SUMMARY.totalCost)}; existing quote engine untouched.
        </p>
      </div>
    </div>
  );
}
