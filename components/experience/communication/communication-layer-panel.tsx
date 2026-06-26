"use client";

import {
  DEVICE_DRIVER_ENDPOINTS,
  PROTOCOL_PLUGINS,
  SUPPORTED_SMART_HOME_PROTOCOLS,
  UNIVERSAL_COMMUNICATION_REPORT,
} from "@/lib/experience/communication";
import { useCommunicationStore } from "@/lib/experience/stores";
import type { DriverHealthStatus } from "@/types/experience";
import styles from "@/styles/experience/experience.module.css";

function formatLabel(value: string) {
  return value.replace(/-/g, " ");
}

function healthClass(health: DriverHealthStatus) {
  if (health === "critical") return "bg-rose-300/15 text-rose-100";
  if (health === "warning") return "bg-amber-300/15 text-amber-100";
  return "bg-emerald-300/15 text-emerald-100";
}

export function CommunicationLayerPanel() {
  const mode = useCommunicationStore((state) => state.mode);
  const selectedProtocol = useCommunicationStore((state) => state.selectedProtocol);
  const selectedEndpointId = useCommunicationStore((state) => state.selectedEndpointId);
  const discoveryResults = useCommunicationStore((state) => state.discoveryResults);
  const healthSnapshot = useCommunicationStore((state) => state.healthSnapshot);
  const liveSyncPreview = useCommunicationStore((state) => state.liveSyncPreview);
  const simulatedEndpoint = useCommunicationStore((state) => state.simulatedEndpoint);
  const setMode = useCommunicationStore((state) => state.setMode);
  const selectProtocol = useCommunicationStore((state) => state.selectProtocol);
  const selectEndpoint = useCommunicationStore((state) => state.selectEndpoint);
  const runDiscovery = useCommunicationStore((state) => state.runDiscovery);
  const monitorHealth = useCommunicationStore((state) => state.monitorHealth);
  const simulateSelectedEndpoint = useCommunicationStore((state) => state.simulateSelectedEndpoint);
  const prepareLiveSync = useCommunicationStore((state) => state.prepareLiveSync);
  const endpointList = selectedProtocol === "all" ? DEVICE_DRIVER_ENDPOINTS.slice(0, 36) : DEVICE_DRIVER_ENDPOINTS.filter((endpoint) => endpoint.protocol === selectedProtocol || endpoint.bridgeProtocol === selectedProtocol).slice(0, 36);
  const selectedEndpoint = DEVICE_DRIVER_ENDPOINTS.find((endpoint) => endpoint.id === selectedEndpointId) ?? DEVICE_DRIVER_ENDPOINTS[0];

  return (
    <div className="mt-4 rounded-2xl border border-fuchsia-300/20 bg-fuchsia-300/10 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-medium">Universal Communication</div>
          <div className={`${styles.muted} text-[10px]`}>
            {UNIVERSAL_COMMUNICATION_REPORT.pluginCount} protocol plugins / {UNIVERSAL_COMMUNICATION_REPORT.driverEndpointCount} drivers
          </div>
        </div>
        <span className="rounded-full bg-emerald-300/15 px-2 py-1 text-[9px] font-semibold uppercase text-emerald-100">
          {mode === "simulation" ? "Simulation" : "Live Ready"}
        </span>
      </div>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Protocol Plugins</div>
        <div className="mt-2 grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => selectProtocol("all")}
            className={`rounded-xl border px-2 py-2 text-[9px] font-semibold uppercase transition ${selectedProtocol === "all" ? "border-fuchsia-200/40 bg-fuchsia-200/15 text-fuchsia-100" : "border-white/10 bg-black/15 text-white/65 hover:bg-white/10"}`}
          >
            All
          </button>
          {SUPPORTED_SMART_HOME_PROTOCOLS.map((protocol) => (
            <button
              key={protocol}
              type="button"
              onClick={() => selectProtocol(protocol)}
              className={`rounded-xl border px-2 py-2 text-[9px] font-semibold uppercase transition ${selectedProtocol === protocol ? "border-fuchsia-200/40 bg-fuchsia-200/15 text-fuchsia-100" : "border-white/10 bg-black/15 text-white/65 hover:bg-white/10"}`}
            >
              {formatLabel(protocol)}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Discovery</div>
          <button type="button" onClick={runDiscovery} className={`${styles.muted} text-[10px] hover:text-white`}>Run</button>
        </div>
        <div className="mt-2 max-h-32 space-y-1 overflow-y-auto pr-1">
          {discoveryResults.map((result) => (
            <div key={result.protocol} className="rounded-xl border border-white/10 bg-black/15 p-2 text-[10px]">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium capitalize">{formatLabel(result.protocol)}</span>
                <span className={`rounded-full px-2 py-0.5 text-[8px] uppercase ${healthClass(result.healthStatus)}`}>{result.healthStatus}</span>
              </div>
              <div className={styles.muted}>{result.discoveredEndpointCount} endpoints / {result.simulatedEndpointCount} simulated</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Health Monitor</div>
          <button type="button" onClick={monitorHealth} className={`${styles.muted} text-[10px] hover:text-white`}>Refresh</button>
        </div>
        <dl className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
          <div><dt className={styles.muted}>Online</dt><dd>{healthSnapshot.onlineCount}</dd></div>
          <div><dt className={styles.muted}>Offline</dt><dd>{healthSnapshot.offlineCount}</dd></div>
          <div><dt className={styles.muted}>Simulated</dt><dd>{healthSnapshot.simulatedCount}</dd></div>
          <div><dt className={styles.muted}>Avg Signal</dt><dd>{healthSnapshot.averageSignalStrength}%</dd></div>
          <div><dt className={styles.muted}>Warnings</dt><dd>{healthSnapshot.warningCount}</dd></div>
          <div><dt className={styles.muted}>Critical</dt><dd>{healthSnapshot.criticalCount}</dd></div>
        </dl>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Version Management</div>
        <dl className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
          <div><dt className={styles.muted}>Plugins</dt><dd>{UNIVERSAL_COMMUNICATION_REPORT.versions.pluginCount}</dd></div>
          <div><dt className={styles.muted}>Updates</dt><dd>{UNIVERSAL_COMMUNICATION_REPORT.versions.updateAvailableCount}</dd></div>
        </dl>
        <div className="mt-2 max-h-28 space-y-1 overflow-y-auto pr-1 text-[10px]">
          {PROTOCOL_PLUGINS.filter((plugin) => plugin.version.updateAvailable).map((plugin) => (
            <div key={plugin.id} className="rounded-xl border border-white/10 bg-black/15 px-2 py-2">
              {plugin.name}: {plugin.version.current} to {plugin.version.latest}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Simulation / Live</div>
        <div className="mt-2 grid grid-cols-2 gap-1">
          <button type="button" onClick={() => setMode("simulation")} className={`rounded-xl border px-2 py-2 text-[9px] font-semibold uppercase ${mode === "simulation" ? "border-fuchsia-200/40 bg-fuchsia-200/15 text-fuchsia-100" : "border-white/10 bg-black/15 text-white/65 hover:bg-white/10"}`}>Simulate</button>
          <button type="button" onClick={prepareLiveSync} className={`rounded-xl border px-2 py-2 text-[9px] font-semibold uppercase ${mode === "live-ready" ? "border-fuchsia-200/40 bg-fuchsia-200/15 text-fuchsia-100" : "border-white/10 bg-black/15 text-white/65 hover:bg-white/10"}`}>Live Ready</button>
        </div>
        <p className={`${styles.muted} mt-2 text-[10px] leading-relaxed`}>
          {liveSyncPreview.length > 0 ? `${liveSyncPreview.length} endpoints prepared for future live sync.` : "Physical devices are not required; every endpoint runs in simulation mode now."}
        </p>
      </section>

      {selectedEndpoint ? (
        <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Drivers</div>
            <button type="button" onClick={simulateSelectedEndpoint} className={`${styles.muted} text-[10px] hover:text-white`}>Sim</button>
          </div>
          <div className="mt-2 max-h-40 space-y-1 overflow-y-auto pr-1">
            {endpointList.map((endpoint) => (
              <button
                key={endpoint.id}
                type="button"
                onClick={() => selectEndpoint(endpoint.id)}
                className={`flex w-full items-center justify-between gap-2 rounded-xl border px-2 py-2 text-left text-[10px] transition ${selectedEndpointId === endpoint.id ? "border-fuchsia-200/40 bg-fuchsia-200/15" : "border-white/10 bg-black/10 hover:bg-white/10"}`}
              >
                <span className="min-w-0 flex-1 truncate">{endpoint.name}</span>
                <span className="shrink-0 capitalize text-white/55">{formatLabel(endpoint.protocol)}</span>
              </button>
            ))}
          </div>
          <p className={`${styles.muted} mt-2 text-[10px] leading-relaxed`}>
            Selected: {selectedEndpoint.name}. {simulatedEndpoint ? `${simulatedEndpoint.runtimeStatus} via ${formatLabel(simulatedEndpoint.protocol)}.` : "Simulation ready."}
          </p>
        </section>
      ) : null}
    </div>
  );
}
