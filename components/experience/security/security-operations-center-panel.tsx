"use client";

import {
  SOC_CAMERA_WALL_TILES,
  SOC_COMMAND_CENTER_STATUS,
  SOC_EVENT_LABELS,
  SOC_EVENT_TIMELINE,
  SOC_INCIDENTS,
  SOC_MAP_LAYERS,
  SOC_MAP_LAYER_LABELS,
  SOC_OPERATIONS_REPORT,
  SOC_QUOTE_SUMMARY,
  SOC_SECURITY_LEVEL_LABELS,
  SOC_SECURITY_LEVELS,
  SOC_VIDEO_BOOKMARKS,
  getSocCameraTile,
  getSocIncident,
  getSocMapAsset,
} from "@/lib/experience/security/security-operations-center";
import { useSecurityOperationsStore, useSecurityStore } from "@/lib/experience/stores";
import type { SocMapLayer, SocSecurityLevel, SocVideoMode } from "@/types/experience";
import styles from "@/styles/experience/experience.module.css";

const SOC_VIDEO_MODES: readonly SocVideoMode[] = ["live", "playback", "snapshot"] as const;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function formatLabel(value: string) {
  return value.replace(/-/g, " ");
}

function statusClass(status: string) {
  if (status === "normal") return "bg-emerald-300/15 text-emerald-100";
  if (status === "warning") return "bg-amber-300/15 text-amber-100";
  if (status === "critical") return "bg-rose-300/15 text-rose-100";
  return "bg-white/10 text-white/60";
}

function severityClass(severity: string) {
  if (severity === "critical") return "bg-rose-300";
  if (severity === "warning") return "bg-amber-300";
  return "bg-sky-300";
}

export function SecurityOperationsCenterPanel() {
  const securityLevel = useSecurityOperationsStore((state) => state.securityLevel);
  const selectedCameraId = useSecurityOperationsStore((state) => state.selectedCameraId);
  const selectedIncidentId = useSecurityOperationsStore((state) => state.selectedIncidentId);
  const selectedMapAssetId = useSecurityOperationsStore((state) => state.selectedMapAssetId);
  const visibleLayers = useSecurityOperationsStore((state) => state.visibleLayers);
  const videoMode = useSecurityOperationsStore((state) => state.videoMode);
  const setSecurityLevel = useSecurityOperationsStore((state) => state.setSecurityLevel);
  const selectCamera = useSecurityOperationsStore((state) => state.selectCamera);
  const selectIncident = useSecurityOperationsStore((state) => state.selectIncident);
  const toggleLayer = useSecurityOperationsStore((state) => state.toggleLayer);
  const setVideoMode = useSecurityOperationsStore((state) => state.setVideoMode);
  const selectSecurityDevice = useSecurityStore((state) => state.selectSecurityDevice);
  const selectedCamera = getSocCameraTile(selectedCameraId) ?? SOC_CAMERA_WALL_TILES[0];
  const selectedIncident = getSocIncident(selectedIncidentId) ?? SOC_INCIDENTS[0];
  const selectedAsset = getSocMapAsset(selectedMapAssetId);
  const cameraBookmarks = selectedCamera ? SOC_VIDEO_BOOKMARKS.filter((bookmark) => bookmark.cameraId === selectedCamera.cameraId) : [];
  const commandCenterStatuses = Object.values(SOC_COMMAND_CENTER_STATUS);

  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-black/10 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-medium">Security Operations Center</div>
          <div className={`${styles.muted} text-[10px]`}>
            {SOC_OPERATIONS_REPORT.cameraWallTileCount} camera channels / {SOC_OPERATIONS_REPORT.incidentCount} incidents
          </div>
        </div>
        <span className={`rounded-full px-2 py-1 text-[9px] font-semibold uppercase ${securityLevel === "emergency" ? "bg-rose-300/20 text-rose-100" : "bg-sky-300/15 text-sky-100"}`}>
          {SOC_SECURITY_LEVEL_LABELS[securityLevel]}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-1">
        {SOC_SECURITY_LEVELS.map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => setSecurityLevel(level as SocSecurityLevel)}
            className={`rounded-xl border px-2 py-2 text-[9px] font-semibold uppercase transition ${securityLevel === level ? "border-sky-200/40 bg-sky-200/15 text-sky-100" : "border-white/10 bg-black/15 text-white/65 hover:bg-white/10"}`}
          >
            {SOC_SECURITY_LEVEL_LABELS[level]}
          </button>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {commandCenterStatuses.map((status) => (
          <section key={status.id} className="rounded-xl border border-white/10 bg-black/15 p-2">
            <div className="flex items-center justify-between gap-2">
              <div className="truncate text-[10px] font-medium">{status.name}</div>
              <span className={`size-2 rounded-full ${severityClass(status.status === "normal" ? "info" : status.status)}`} />
            </div>
            <div className={`${styles.muted} mt-1 text-[10px]`}>
              {status.onlineCount}/{status.totalCount} online / {status.criticalCount} critical
            </div>
          </section>
        ))}
      </div>

      <section className="mt-3 rounded-2xl border border-sky-200/20 bg-sky-200/10 p-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Camera Wall</div>
            <div className={`${styles.muted} text-[10px]`}>Playback / snapshot / timeline / bookmarks ready</div>
          </div>
          {selectedCamera ? <span className={`rounded-full px-2 py-1 text-[9px] font-semibold uppercase ${statusClass(selectedCamera.status)}`}>{selectedCamera.status}</span> : null}
        </div>
        <select value={selectedCameraId} onChange={(event) => selectCamera(event.target.value)} className="mt-3 w-full rounded-xl border border-white/10 bg-black/20 px-2 py-2 text-[10px] outline-none">
          {SOC_CAMERA_WALL_TILES.map((tile) => (
            <option key={tile.id} value={tile.cameraId}>{tile.name}</option>
          ))}
        </select>
        <div className="mt-2 grid grid-cols-3 gap-1">
          {SOC_VIDEO_MODES.map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setVideoMode(mode)}
              className={`rounded-xl border px-2 py-2 text-[9px] font-semibold uppercase transition ${videoMode === mode ? "border-sky-200/40 bg-sky-200/15 text-sky-100" : "border-white/10 bg-black/15 text-white/65 hover:bg-white/10"}`}
            >
              {mode}
            </button>
          ))}
        </div>
        {selectedCamera ? (
          <dl className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
            <div><dt className={styles.muted}>Channel</dt><dd>{selectedCamera.channel}</dd></div>
            <div><dt className={styles.muted}>Mode</dt><dd className="capitalize">{videoMode}</dd></div>
            <div><dt className={styles.muted}>Resolution</dt><dd>{selectedCamera.resolution}</dd></div>
            <div><dt className={styles.muted}>Latency</dt><dd>{selectedCamera.latencyMs}ms</dd></div>
            <div><dt className={styles.muted}>Storage</dt><dd className="capitalize">{formatLabel(selectedCamera.storageStatus)}</dd></div>
            <div><dt className={styles.muted}>Bookmarks</dt><dd>{cameraBookmarks.length}</dd></div>
          </dl>
        ) : null}
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Live Map</div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {SOC_MAP_LAYERS.map((layer) => (
            <label key={layer} className="flex cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-black/15 px-2 py-2 text-[10px]">
              {SOC_MAP_LAYER_LABELS[layer]}
              <input className="accent-sky-200" type="checkbox" checked={visibleLayers[layer]} onChange={(event) => toggleLayer(layer as SocMapLayer, event.target.checked)} />
            </label>
          ))}
        </div>
        <p className={`${styles.muted} mt-2 text-[10px] leading-relaxed`}>
          Displays every camera, sensor, lock, and alarm endpoint. Selected: {selectedAsset ? `${selectedAsset.label} / ${selectedAsset.roomName}` : "none"}.
        </p>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Event Timeline</div>
          <span className={styles.muted}>{SOC_EVENT_TIMELINE.length}</span>
        </div>
        <div className="mt-2 max-h-44 space-y-1 overflow-y-auto pr-1">
          {SOC_EVENT_TIMELINE.slice(0, 18).map((event) => (
            <button
              key={event.id}
              type="button"
              onClick={() => {
                selectIncident(event.incidentId);
                if (event.sourceDeviceId.startsWith("she-security")) selectSecurityDevice(event.sourceDeviceId);
              }}
              className={`flex w-full items-center gap-2 rounded-xl border px-2 py-2 text-left text-[10px] transition ${selectedIncidentId === event.incidentId ? "border-sky-200/40 bg-sky-200/15" : "border-white/10 bg-black/10 hover:bg-white/10"}`}
            >
              <span className={`size-2 shrink-0 rounded-full ${severityClass(event.severity)}`} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{event.title}</span>
                <span className={`${styles.muted} block truncate`}>{SOC_EVENT_LABELS[event.type]} / {event.timestampLabel}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      {selectedIncident ? (
        <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-[10px] font-medium uppercase tracking-[0.14em]">Incident Management</div>
              <div className="mt-1 truncate text-xs font-semibold">{selectedIncident.title}</div>
            </div>
            <span className={`rounded-full px-2 py-1 text-[9px] font-semibold uppercase ${statusClass(selectedIncident.severity === "critical" ? "critical" : selectedIncident.status === "open" ? "warning" : "normal")}`}>
              {formatLabel(selectedIncident.status)}
            </span>
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
            <div><dt className={styles.muted}>Queue</dt><dd>{selectedIncident.assignedQueue}</dd></div>
            <div><dt className={styles.muted}>Room</dt><dd className="truncate">{selectedIncident.roomName}</dd></div>
            <div><dt className={styles.muted}>Severity</dt><dd className="capitalize">{selectedIncident.severity}</dd></div>
            <div><dt className={styles.muted}>Created</dt><dd>{selectedIncident.createdAtLabel}</dd></div>
          </dl>
          <p className={`${styles.muted} mt-2 text-[10px] leading-relaxed`}>{selectedIncident.responsePlaybook}</p>
        </section>
      ) : null}

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Video Bookmarks</div>
        <div className={`${styles.muted} mt-2 space-y-1 text-[10px]`}>
          {(cameraBookmarks.length > 0 ? cameraBookmarks : SOC_VIDEO_BOOKMARKS.slice(0, 3)).map((bookmark) => (
            <div key={bookmark.id} className="flex justify-between gap-2">
              <span className="truncate">{bookmark.label}</span>
              <span>{bookmark.timestampLabel}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">SOC Hardware Quote</div>
        <p className={`${styles.muted} mt-1 text-[10px] leading-relaxed`}>
          Recommends command workstations, video wall displays, failover NVR, access controllers, sensor packs, network health hardware, and response keypads.
          Internal SOC total {formatCurrency(SOC_QUOTE_SUMMARY.totalCost)}; existing quote engine untouched.
        </p>
      </section>
    </div>
  );
}
