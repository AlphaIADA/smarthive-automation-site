"use client";

import {
  ENTERPRISE_DEVICE_ALERTS,
  ENTERPRISE_DEVICE_INVENTORY,
  ENTERPRISE_DEVICE_LOGS,
  ENTERPRISE_DEVICE_MANAGEMENT_REPORT,
  ENTERPRISE_OTA_PLANS,
} from "@/lib/experience/device-management";
import { useEnterpriseDeviceManagementStore } from "@/lib/experience/stores";
import type { EnterpriseAlertSeverity, EnterpriseGroupType, EnterpriseInstallationStatus } from "@/types/experience";
import styles from "@/styles/experience/experience.module.css";

const GROUP_TYPES: readonly EnterpriseGroupType[] = ["building", "floor", "room", "manufacturer", "protocol", "customer"] as const;
const INSTALLATION_STATUSES: readonly EnterpriseInstallationStatus[] = ["installed", "pending", "rejected", "replacement"] as const;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function formatLabel(value: string) {
  return value.replace(/-/g, " ");
}

function severityClass(severity: EnterpriseAlertSeverity) {
  if (severity === "critical") return "bg-rose-300/15 text-rose-100";
  if (severity === "warning") return "bg-amber-300/15 text-amber-100";
  return "bg-sky-300/15 text-sky-100";
}

export function EnterpriseDeviceManagementPanel() {
  const selectedInventoryId = useEnterpriseDeviceManagementStore((state) => state.selectedInventoryId);
  const selectedGroupType = useEnterpriseDeviceManagementStore((state) => state.selectedGroupType);
  const visibleGroups = useEnterpriseDeviceManagementStore((state) => state.visibleGroups);
  const selectedDevice = useEnterpriseDeviceManagementStore((state) => state.selectedDevice);
  const commandResult = useEnterpriseDeviceManagementStore((state) => state.commandResult);
  const otaPlan = useEnterpriseDeviceManagementStore((state) => state.otaPlan);
  const updatedInstallationDevice = useEnterpriseDeviceManagementStore((state) => state.updatedInstallationDevice);
  const selectInventory = useEnterpriseDeviceManagementStore((state) => state.selectInventory);
  const setGroupType = useEnterpriseDeviceManagementStore((state) => state.setGroupType);
  const runDiagnostics = useEnterpriseDeviceManagementStore((state) => state.runDiagnostics);
  const restart = useEnterpriseDeviceManagementStore((state) => state.restart);
  const reset = useEnterpriseDeviceManagementStore((state) => state.reset);
  const scheduleMaintenance = useEnterpriseDeviceManagementStore((state) => state.scheduleMaintenance);
  const markReplacement = useEnterpriseDeviceManagementStore((state) => state.markReplacement);
  const setInstallationStatus = useEnterpriseDeviceManagementStore((state) => state.setInstallationStatus);
  const scheduleOta = useEnterpriseDeviceManagementStore((state) => state.scheduleOta);
  const rollbackFirmware = useEnterpriseDeviceManagementStore((state) => state.rollbackFirmware);
  const visibleInventory = ENTERPRISE_DEVICE_INVENTORY.slice(0, 42);
  const selectedLogs = selectedDevice ? ENTERPRISE_DEVICE_LOGS.filter((log) => log.inventoryId === selectedDevice.id).slice(0, 4) : [];
  const selectedAlerts = selectedDevice ? ENTERPRISE_DEVICE_ALERTS.filter((alert) => alert.inventoryId === selectedDevice.id).slice(0, 3) : [];
  const selectedOta = selectedDevice ? ENTERPRISE_OTA_PLANS.find((plan) => plan.inventoryId === selectedDevice.id) : null;

  return (
    <div className="mt-4 rounded-2xl border border-orange-300/20 bg-orange-300/10 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-medium">Enterprise Devices</div>
          <div className={`${styles.muted} text-[10px]`}>
            {ENTERPRISE_DEVICE_MANAGEMENT_REPORT.inventoryCount} devices / {ENTERPRISE_DEVICE_MANAGEMENT_REPORT.propertyCount} properties
          </div>
        </div>
        <span className="rounded-full bg-emerald-300/15 px-2 py-1 text-[9px] font-semibold uppercase text-emerald-100">Safe Ops</span>
      </div>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Inventory Health</div>
        <dl className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
          <div><dt className={styles.muted}>Healthy</dt><dd>{ENTERPRISE_DEVICE_MANAGEMENT_REPORT.health.healthyCount}</dd></div>
          <div><dt className={styles.muted}>Warnings</dt><dd>{ENTERPRISE_DEVICE_MANAGEMENT_REPORT.health.warningCount}</dd></div>
          <div><dt className={styles.muted}>Critical</dt><dd>{ENTERPRISE_DEVICE_MANAGEMENT_REPORT.health.criticalCount}</dd></div>
          <div><dt className={styles.muted}>Low Battery</dt><dd>{ENTERPRISE_DEVICE_MANAGEMENT_REPORT.health.lowBatteryCount}</dd></div>
          <div><dt className={styles.muted}>Alerts</dt><dd>{ENTERPRISE_DEVICE_MANAGEMENT_REPORT.alertCount}</dd></div>
          <div><dt className={styles.muted}>Logs</dt><dd>{ENTERPRISE_DEVICE_MANAGEMENT_REPORT.logCount}</dd></div>
        </dl>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Installation Mode</div>
        <dl className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
          <div><dt className={styles.muted}>Installed</dt><dd>{ENTERPRISE_DEVICE_MANAGEMENT_REPORT.installation.installedCount}</dd></div>
          <div><dt className={styles.muted}>Pending</dt><dd>{ENTERPRISE_DEVICE_MANAGEMENT_REPORT.installation.pendingCount}</dd></div>
          <div><dt className={styles.muted}>Rejected</dt><dd>{ENTERPRISE_DEVICE_MANAGEMENT_REPORT.installation.rejectedCount}</dd></div>
          <div><dt className={styles.muted}>Replacement</dt><dd>{ENTERPRISE_DEVICE_MANAGEMENT_REPORT.installation.replacementCount}</dd></div>
        </dl>
        <div className="mt-2 grid grid-cols-2 gap-1">
          {INSTALLATION_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setInstallationStatus(status)}
              className={`rounded-xl border px-2 py-2 text-[9px] font-semibold uppercase transition ${updatedInstallationDevice?.installationStatus === status ? "border-orange-200/40 bg-orange-200/15 text-orange-100" : "border-white/10 bg-black/15 text-white/65 hover:bg-white/10"}`}
            >
              {status}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">OTA Firmware</div>
        <dl className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
          <div><dt className={styles.muted}>Updates</dt><dd>{ENTERPRISE_DEVICE_MANAGEMENT_REPORT.ota.updateAvailableCount}</dd></div>
          <div><dt className={styles.muted}>Scheduled</dt><dd>{ENTERPRISE_DEVICE_MANAGEMENT_REPORT.ota.scheduledCount}</dd></div>
          <div><dt className={styles.muted}>Rollback</dt><dd>{ENTERPRISE_DEVICE_MANAGEMENT_REPORT.ota.rollbackReadyCount}</dd></div>
          <div><dt className={styles.muted}>History</dt><dd>Ready</dd></div>
        </dl>
        <div className="mt-2 grid grid-cols-2 gap-1">
          <button type="button" onClick={scheduleOta} className="rounded-xl border border-orange-200/30 bg-orange-200/10 px-3 py-2 text-[10px] font-semibold uppercase text-orange-100 hover:bg-orange-200/15">
            Schedule OTA
          </button>
          <button type="button" onClick={rollbackFirmware} className="rounded-xl border border-white/10 bg-black/15 px-3 py-2 text-[10px] font-semibold uppercase text-white/75 hover:bg-white/10">
            Rollback
          </button>
        </div>
        <p className={`${styles.muted} mt-2 text-[10px] leading-relaxed`}>
          {otaPlan ? `${otaPlan.targetVersion} scheduled in ${otaPlan.scheduledWindowLabel}.` : selectedOta ? `${selectedOta.targetVersion} available for selected device.` : "No OTA package selected."}
        </p>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Groups</div>
        <div className="mt-2 grid grid-cols-2 gap-1">
          {GROUP_TYPES.map((groupType) => (
            <button
              key={groupType}
              type="button"
              onClick={() => setGroupType(groupType)}
              className={`rounded-xl border px-2 py-2 text-[9px] font-semibold uppercase transition ${selectedGroupType === groupType ? "border-orange-200/40 bg-orange-200/15 text-orange-100" : "border-white/10 bg-black/15 text-white/65 hover:bg-white/10"}`}
            >
              {groupType}
            </button>
          ))}
        </div>
        <div className="mt-2 max-h-32 space-y-1 overflow-y-auto pr-1">
          {visibleGroups.slice(0, 12).map((group) => (
            <div key={group.id} className="rounded-xl border border-white/10 bg-black/15 p-2 text-[10px]">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-medium">{group.label}</span>
                <span className={styles.muted}>{group.deviceCount}</span>
              </div>
              <div className={styles.muted}>{group.alertCount} alerts / {formatCurrency(group.inventoryCost)}</div>
            </div>
          ))}
        </div>
      </section>

      {selectedDevice ? (
        <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
          <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Selected Device</div>
          <div className="mt-2 text-xs font-semibold">{selectedDevice.deviceName}</div>
          <dl className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
            <div><dt className={styles.muted}>Property</dt><dd className="truncate">{selectedDevice.propertyName}</dd></div>
            <div><dt className={styles.muted}>Protocol</dt><dd className="capitalize">{formatLabel(selectedDevice.protocol)}</dd></div>
            <div><dt className={styles.muted}>Battery</dt><dd>{selectedDevice.batteryPercent ?? "Wired"}</dd></div>
            <div><dt className={styles.muted}>Signal</dt><dd>{selectedDevice.connectivityPercent}%</dd></div>
            <div><dt className={styles.muted}>Firmware</dt><dd>{selectedDevice.firmware.currentVersion}</dd></div>
            <div><dt className={styles.muted}>Cost</dt><dd>{formatCurrency(selectedDevice.cost.totalInventoryCost)}</dd></div>
          </dl>
          <div className="mt-2 grid grid-cols-2 gap-1">
            <button type="button" onClick={runDiagnostics} className="rounded-xl border border-white/10 bg-black/15 px-2 py-2 text-[9px] font-semibold uppercase hover:bg-white/10">Diagnostics</button>
            <button type="button" onClick={restart} className="rounded-xl border border-white/10 bg-black/15 px-2 py-2 text-[9px] font-semibold uppercase hover:bg-white/10">Restart</button>
            <button type="button" onClick={reset} className="rounded-xl border border-white/10 bg-black/15 px-2 py-2 text-[9px] font-semibold uppercase hover:bg-white/10">Reset</button>
            <button type="button" onClick={scheduleMaintenance} className="rounded-xl border border-white/10 bg-black/15 px-2 py-2 text-[9px] font-semibold uppercase hover:bg-white/10">Maintain</button>
            <button type="button" onClick={markReplacement} className="col-span-2 rounded-xl border border-white/10 bg-black/15 px-2 py-2 text-[9px] font-semibold uppercase hover:bg-white/10">Replacement</button>
          </div>
          <p className={`${styles.muted} mt-2 text-[10px] leading-relaxed`}>
            {commandResult ? commandResult.message : "Restart, reset, diagnostics, maintenance, and replacement are simulated command records only."}
          </p>
        </section>
      ) : null}

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Inventory Index</div>
        <div className="mt-2 max-h-40 space-y-1 overflow-y-auto pr-1">
          {visibleInventory.map((record) => (
            <button
              key={record.id}
              type="button"
              onClick={() => selectInventory(record.id)}
              className={`flex w-full items-center justify-between gap-2 rounded-xl border px-2 py-2 text-left text-[10px] transition ${selectedInventoryId === record.id ? "border-orange-200/40 bg-orange-200/15" : "border-white/10 bg-black/10 hover:bg-white/10"}`}
            >
              <span className="min-w-0 flex-1 truncate">{record.deviceName}</span>
              <span className="shrink-0 capitalize text-white/55">{record.installationStatus}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Alerts / Logs</div>
        <div className="mt-2 space-y-1">
          {selectedAlerts.length > 0 ? selectedAlerts.map((alert) => (
            <div key={alert.id} className={`rounded-xl px-2 py-2 text-[10px] ${severityClass(alert.severity)}`}>
              {alert.title}: {alert.description}
            </div>
          )) : <div className={`${styles.muted} text-[10px]`}>No selected-device alerts.</div>}
          {selectedLogs.map((log) => (
            <div key={log.id} className="rounded-xl border border-white/10 bg-black/15 px-2 py-2 text-[10px]">
              {log.message}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Quote Sync</div>
        <dl className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
          <div><dt className={styles.muted}>Equipment</dt><dd>{formatCurrency(ENTERPRISE_DEVICE_MANAGEMENT_REPORT.quote.equipmentCost)}</dd></div>
          <div><dt className={styles.muted}>Install</dt><dd>{formatCurrency(ENTERPRISE_DEVICE_MANAGEMENT_REPORT.quote.installationCost)}</dd></div>
          <div><dt className={styles.muted}>Reserve</dt><dd>{formatCurrency(ENTERPRISE_DEVICE_MANAGEMENT_REPORT.quote.maintenanceReserve + ENTERPRISE_DEVICE_MANAGEMENT_REPORT.quote.replacementReserve)}</dd></div>
          <div><dt className={styles.muted}>Total</dt><dd>{formatCurrency(ENTERPRISE_DEVICE_MANAGEMENT_REPORT.quote.totalCost)}</dd></div>
        </dl>
        <p className={`${styles.muted} mt-2 text-[10px] leading-relaxed`}>Inventory costs update through an internal Experience Engine cost model. Existing quote engine remains untouched.</p>
      </section>
    </div>
  );
}
