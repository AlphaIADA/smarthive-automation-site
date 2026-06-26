"use client";

import {
  CLOUD_AUDIT_LOGS,
  CLOUD_CONFLICTS,
  CLOUD_OFFLINE_CACHE,
  CLOUD_REMOTE_ACCESS_PROFILES,
  SMARTHIVE_CLOUD_REPORT,
} from "@/lib/experience/cloud";
import { useCloudStore } from "@/lib/experience/stores";
import type { CloudBackupKind, CloudClientDevice, CloudConflictStrategy, CloudEntityKind, CloudSyncStatus } from "@/types/experience";
import styles from "@/styles/experience/experience.module.css";

const TARGET_FILTERS: readonly (CloudEntityKind | "all")[] = ["all", "customer-profile", "property-profile", "project", "digital-twin", "building", "room", "device", "automation", "scene", "security", "energy", "history"] as const;
const BACKUP_KINDS: readonly CloudBackupKind[] = ["project", "device", "automation", "scene", "customer-profile", "property-profile", "digital-twin"] as const;
const CLIENT_DEVICES: readonly CloudClientDevice[] = ["desktop", "tablet", "mobile", "future-native-ios", "future-native-android"] as const;
const CONFLICT_STRATEGIES: readonly CloudConflictStrategy[] = ["cloud-wins", "local-wins", "merge-by-timestamp", "manual-review"] as const;

function formatLabel(value: string) {
  return value.replace(/-/g, " ");
}

function formatMb(value: number) {
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value)}MB`;
}

function statusClass(status: CloudSyncStatus) {
  if (status === "synced") return "bg-emerald-300/15 text-emerald-100";
  if (status === "pending" || status === "queued") return "bg-amber-300/15 text-amber-100";
  if (status === "offline-cached") return "bg-sky-300/15 text-sky-100";
  return "bg-rose-300/15 text-rose-100";
}

export function CloudSyncPanel() {
  const selectedTargetId = useCloudStore((state) => state.selectedTargetId);
  const targetFilter = useCloudStore((state) => state.targetFilter);
  const visibleTargets = useCloudStore((state) => state.visibleTargets);
  const selectedTarget = useCloudStore((state) => state.selectedTarget);
  const selectedBackupKind = useCloudStore((state) => state.selectedBackupKind);
  const selectedClientDevice = useCloudStore((state) => state.selectedClientDevice);
  const selectedConflictId = useCloudStore((state) => state.selectedConflictId);
  const selectedBackup = useCloudStore((state) => state.selectedBackup);
  const selectedClient = useCloudStore((state) => state.selectedClient);
  const selectedConflict = useCloudStore((state) => state.selectedConflict);
  const syncResult = useCloudStore((state) => state.syncResult);
  const resolvedConflict = useCloudStore((state) => state.resolvedConflict);
  const selectTarget = useCloudStore((state) => state.selectTarget);
  const setTargetFilter = useCloudStore((state) => state.setTargetFilter);
  const selectBackupKind = useCloudStore((state) => state.selectBackupKind);
  const selectClientDevice = useCloudStore((state) => state.selectClientDevice);
  const selectConflict = useCloudStore((state) => state.selectConflict);
  const runSync = useCloudStore((state) => state.runSync);
  const resolveConflict = useCloudStore((state) => state.resolveConflict);

  return (
    <div className="mt-4 rounded-2xl border border-blue-300/20 bg-blue-300/10 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-medium">SmartHive Cloud</div>
          <div className={`${styles.muted} text-[10px]`}>
            {SMARTHIVE_CLOUD_REPORT.targetCount} sync targets / {SMARTHIVE_CLOUD_REPORT.backupCount} backups
          </div>
        </div>
        <span className="rounded-full bg-blue-300/15 px-2 py-1 text-[9px] font-semibold uppercase text-blue-100">Cloud Ready</span>
      </div>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Cloud Sync Layer</div>
        <dl className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
          <div><dt className={styles.muted}>Synced</dt><dd>{SMARTHIVE_CLOUD_REPORT.syncedCount}</dd></div>
          <div><dt className={styles.muted}>Pending</dt><dd>{SMARTHIVE_CLOUD_REPORT.pendingCount}</dd></div>
          <div><dt className={styles.muted}>Queued</dt><dd>{SMARTHIVE_CLOUD_REPORT.queuedCount}</dd></div>
          <div><dt className={styles.muted}>Conflicts</dt><dd>{SMARTHIVE_CLOUD_REPORT.conflictCount}</dd></div>
          <div><dt className={styles.muted}>Offline</dt><dd>{SMARTHIVE_CLOUD_REPORT.offlineCachedCount}</dd></div>
          <div><dt className={styles.muted}>Payload</dt><dd>{formatMb(SMARTHIVE_CLOUD_REPORT.totalPayloadMb)}</dd></div>
        </dl>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Sync Targets</div>
        <div className="mt-2 grid grid-cols-2 gap-1">
          {TARGET_FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setTargetFilter(filter)}
              className={`rounded-xl border px-2 py-2 text-[9px] font-semibold uppercase transition ${targetFilter === filter ? "border-blue-200/40 bg-blue-200/15 text-blue-100" : "border-white/10 bg-black/15 text-white/65 hover:bg-white/10"}`}
            >
              {formatLabel(filter)}
            </button>
          ))}
        </div>
        <div className="mt-2 max-h-44 space-y-1 overflow-y-auto pr-1">
          {visibleTargets.map((target) => (
            <button
              key={target.id}
              type="button"
              onClick={() => selectTarget(target.id)}
              className={`w-full rounded-xl border px-2 py-2 text-left text-[10px] transition ${selectedTargetId === target.id ? "border-blue-200/40 bg-blue-200/15" : "border-white/10 bg-black/10 hover:bg-white/10"}`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="truncate font-medium">{target.label}</span>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[8px] uppercase ${statusClass(target.status)}`}>{formatLabel(target.status)}</span>
              </span>
              <span className={`${styles.muted} mt-1 flex justify-between gap-2`}>
                <span>{target.entityCount.toLocaleString()} records</span>
                <span>{formatMb(target.payloadBytes / 1024 / 1024)}</span>
              </span>
            </button>
          ))}
        </div>
        <button type="button" onClick={runSync} className="mt-2 w-full rounded-xl border border-blue-200/30 bg-blue-200/10 px-3 py-2 text-[10px] font-semibold uppercase text-blue-100 hover:bg-blue-200/15">
          Simulate Sync
        </button>
        <p className={`${styles.muted} mt-2 text-[10px] leading-relaxed`}>
          {syncResult ? syncResult.message : selectedTarget ? `${selectedTarget.label} is encrypted, offline-cache enabled, and ready for future SmartHive Cloud sync.` : "Select a sync target."}
        </p>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Project Backup</div>
        <div className="mt-2 grid grid-cols-2 gap-1">
          {BACKUP_KINDS.map((kind) => (
            <button
              key={kind}
              type="button"
              onClick={() => selectBackupKind(kind)}
              className={`rounded-xl border px-2 py-2 text-[9px] font-semibold uppercase transition ${selectedBackupKind === kind ? "border-blue-200/40 bg-blue-200/15 text-blue-100" : "border-white/10 bg-black/15 text-white/65 hover:bg-white/10"}`}
            >
              {formatLabel(kind)}
            </button>
          ))}
        </div>
        {selectedBackup ? (
          <dl className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
            <div><dt className={styles.muted}>Items</dt><dd>{selectedBackup.itemCount.toLocaleString()}</dd></div>
            <div><dt className={styles.muted}>Size</dt><dd>{formatMb(selectedBackup.sizeMb)}</dd></div>
            <div><dt className={styles.muted}>Versions</dt><dd>{selectedBackup.retainedVersions}</dd></div>
            <div><dt className={styles.muted}>Restore</dt><dd>{selectedBackup.restorable ? "Ready" : "No"}</dd></div>
          </dl>
        ) : null}
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Offline Engine</div>
        <dl className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
          <div><dt className={styles.muted}>Cache Entries</dt><dd>{CLOUD_OFFLINE_CACHE.length}</dd></div>
          <div><dt className={styles.muted}>Dirty</dt><dd>{CLOUD_OFFLINE_CACHE.filter((cache) => cache.dirty).length}</dd></div>
          <div><dt className={styles.muted}>Background</dt><dd>{CLOUD_OFFLINE_CACHE.filter((cache) => cache.backgroundSyncQueued).length}</dd></div>
          <div><dt className={styles.muted}>Local Cache</dt><dd>Ready</dd></div>
        </dl>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Conflict Resolution</div>
        <div className="mt-2 space-y-1">
          {CLOUD_CONFLICTS.map((conflict) => (
            <button
              key={conflict.id}
              type="button"
              onClick={() => selectConflict(conflict.id)}
              className={`w-full rounded-xl border px-2 py-2 text-left text-[10px] transition ${selectedConflictId === conflict.id ? "border-blue-200/40 bg-blue-200/15" : "border-white/10 bg-black/10 hover:bg-white/10"}`}
            >
              <span className="flex justify-between gap-2">
                <span className="font-medium">{conflict.label}</span>
                <span className={styles.muted}>{formatLabel(conflict.strategy)}</span>
              </span>
            </button>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-2 gap-1">
          {CONFLICT_STRATEGIES.map((strategy) => (
            <button key={strategy} type="button" onClick={() => resolveConflict(strategy)} className="rounded-xl border border-white/10 bg-black/15 px-2 py-2 text-[9px] font-semibold uppercase hover:bg-white/10">
              {formatLabel(strategy)}
            </button>
          ))}
        </div>
        <p className={`${styles.muted} mt-2 text-[10px] leading-relaxed`}>
          {resolvedConflict ? resolvedConflict.resolutionLabel : selectedConflict ? selectedConflict.resolutionLabel : "Select a conflict and resolution strategy."}
        </p>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Live Remote Access</div>
        <dl className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
          <div><dt className={styles.muted}>Properties</dt><dd>{CLOUD_REMOTE_ACCESS_PROFILES.length}</dd></div>
          <div><dt className={styles.muted}>View</dt><dd>Ready</dd></div>
          <div><dt className={styles.muted}>Control</dt><dd>Future</dd></div>
          <div><dt className={styles.muted}>Reports</dt><dd>Ready</dd></div>
        </dl>
        <p className={`${styles.muted} mt-2 text-[10px] leading-relaxed`}>
          Remote access payloads are future-ready for property viewing, device control, alerts, and reports. No real remote control is enabled.
        </p>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Multi Device</div>
        <div className="mt-2 grid grid-cols-2 gap-1">
          {CLIENT_DEVICES.map((device) => (
            <button
              key={device}
              type="button"
              onClick={() => selectClientDevice(device)}
              className={`rounded-xl border px-2 py-2 text-[9px] font-semibold uppercase transition ${selectedClientDevice === device ? "border-blue-200/40 bg-blue-200/15 text-blue-100" : "border-white/10 bg-black/15 text-white/65 hover:bg-white/10"}`}
            >
              {formatLabel(device)}
            </button>
          ))}
        </div>
        <p className={`${styles.muted} mt-2 text-[10px] leading-relaxed`}>
          {selectedClient ? `${selectedClient.label}: sync optimized, offline cache enabled${selectedClient.futureNativeAppReady ? ", future native app ready" : ""}.` : "Select a client profile."}
        </p>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Security</div>
        <dl className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
          <div><dt className={styles.muted}>Encryption</dt><dd>E2E Ready</dd></div>
          <div><dt className={styles.muted}>Device Auth</dt><dd>Ready</dd></div>
          <div><dt className={styles.muted}>Roles</dt><dd>{SMARTHIVE_CLOUD_REPORT.security.rolePermissions.length}</dd></div>
          <div><dt className={styles.muted}>Audit Logs</dt><dd>{CLOUD_AUDIT_LOGS.length}</dd></div>
        </dl>
        <div className={`${styles.muted} mt-2 space-y-1 text-[10px]`}>
          {CLOUD_AUDIT_LOGS.map((log) => (
            <div key={log.id} className="rounded-xl border border-white/10 bg-black/15 p-2">
              {log.action} / {log.severity}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
