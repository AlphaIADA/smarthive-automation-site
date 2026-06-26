"use client";

import {
  ENERGY_CIRCUIT_MONITORS,
  ENERGY_FLOOR_MONITORS,
  ENERGY_POWER_FLOWS,
  ENERGY_QUOTE_SUMMARY,
  ENERGY_RECOMMENDATIONS,
  ENERGY_ROOM_MONITORS,
  ENERGY_SOURCES,
  ENERGY_SYSTEM_REPORT,
  basEnergyEndpointCount,
  getEnergyCircuitMonitor,
  getEnergyRoomMonitor,
} from "@/lib/experience/energy/energy-catalog";
import { useEnergyStore } from "@/lib/experience/stores";
import type { EnergySourceType } from "@/types/experience";
import styles from "@/styles/experience/experience.module.css";

function formatNumber(value: number, maximumFractionDigits = 1) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits }).format(value);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function formatLabel(value: string) {
  return value.replace(/-/g, " ");
}

function sourceStatusClass(status: string) {
  if (status === "active" || status === "charging" || status === "discharging") return "bg-emerald-300/15 text-emerald-100";
  if (status === "standby") return "bg-sky-300/15 text-sky-100";
  return "bg-white/10 text-white/60";
}

export function EnergyDashboardPanel() {
  const heatmapVisible = useEnergyStore((state) => state.heatmapVisible);
  const powerFlowVisible = useEnergyStore((state) => state.powerFlowVisible);
  const selectedRoomId = useEnergyStore((state) => state.selectedRoomId);
  const selectedCircuitId = useEnergyStore((state) => state.selectedCircuitId);
  const selectedSourceType = useEnergyStore((state) => state.selectedSourceType);
  const setHeatmapVisible = useEnergyStore((state) => state.setHeatmapVisible);
  const setPowerFlowVisible = useEnergyStore((state) => state.setPowerFlowVisible);
  const selectRoom = useEnergyStore((state) => state.selectRoom);
  const selectCircuit = useEnergyStore((state) => state.selectCircuit);
  const selectSource = useEnergyStore((state) => state.selectSource);
  const selectedRoom = getEnergyRoomMonitor(selectedRoomId) ?? ENERGY_ROOM_MONITORS[0];
  const selectedCircuit = getEnergyCircuitMonitor(selectedCircuitId) ?? ENERGY_CIRCUIT_MONITORS[0];
  const selectedSource = ENERGY_SOURCES.find((source) => source.type === selectedSourceType) ?? ENERGY_SOURCES[0];
  const villa = ENERGY_SYSTEM_REPORT.villa.metrics;

  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-black/10 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-medium">Energy Management</div>
          <div className={`${styles.muted} text-[10px]`}>
            {ENERGY_SYSTEM_REPORT.smartDeviceMonitorCount} devices / {ENERGY_SYSTEM_REPORT.circuitMonitorCount} circuits / {ENERGY_SYSTEM_REPORT.roomMonitorCount} rooms
          </div>
        </div>
        <span className="rounded-full bg-emerald-300/15 px-2 py-1 text-[9px] font-semibold uppercase text-emerald-100">Live</span>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
        <div><dt className={styles.muted}>Instant</dt><dd>{formatNumber(villa.instantConsumptionWatts)}W</dd></div>
        <div><dt className={styles.muted}>Daily</dt><dd>{formatNumber(villa.dailyUsageKwh)}kWh</dd></div>
        <div><dt className={styles.muted}>Monthly</dt><dd>{formatNumber(villa.monthlyUsageKwh)}kWh</dd></div>
        <div><dt className={styles.muted}>Yearly</dt><dd>{formatNumber(villa.yearlyUsageKwh)}kWh</dd></div>
        <div><dt className={styles.muted}>Cost</dt><dd>{formatCurrency(villa.costUsd)}/mo</dd></div>
        <div><dt className={styles.muted}>Projected</dt><dd>{formatCurrency(villa.projectedCostUsd)}/yr</dd></div>
        <div><dt className={styles.muted}>Peak</dt><dd>{formatNumber(villa.peakDemandKw)}kW</dd></div>
        <div><dt className={styles.muted}>Power Factor</dt><dd>{villa.powerFactor}</dd></div>
      </dl>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-black/15 px-2 py-2 text-[10px]">
          Heatmap
          <input className="accent-emerald-200" type="checkbox" checked={heatmapVisible} onChange={(event) => setHeatmapVisible(event.target.checked)} />
        </label>
        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-black/15 px-2 py-2 text-[10px]">
          Power Flow
          <input className="accent-emerald-200" type="checkbox" checked={powerFlowVisible} onChange={(event) => setPowerFlowVisible(event.target.checked)} />
        </label>
      </div>

      <div className="mt-3 rounded-2xl border border-emerald-200/20 bg-emerald-200/10 p-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Automatic Source Switching</div>
            <div className={`${styles.muted} text-[10px]`}>Solar {"->"} Battery {"->"} Grid {"->"} Generator {"->"} UPS</div>
          </div>
          <span className={`rounded-full px-2 py-1 text-[9px] font-semibold uppercase ${sourceStatusClass(selectedSource.status)}`}>{selectedSource.status}</span>
        </div>
        <select value={selectedSourceType} onChange={(event) => selectSource(event.target.value as EnergySourceType)} className="mt-3 w-full rounded-xl border border-white/10 bg-black/20 px-2 py-2 text-[10px] outline-none">
          {ENERGY_SOURCES.map((source) => (
            <option key={source.id} value={source.type}>{source.name}</option>
          ))}
        </select>
        <dl className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
          <div><dt className={styles.muted}>Capacity</dt><dd>{selectedSource.capacityKw}kW</dd></div>
          <div><dt className={styles.muted}>Current</dt><dd>{selectedSource.currentKw}kW</dd></div>
          <div><dt className={styles.muted}>Priority</dt><dd>{selectedSource.priority}</dd></div>
          <div><dt className={styles.muted}>SOC</dt><dd>{selectedSource.stateOfChargePercent ?? "N/A"}{typeof selectedSource.stateOfChargePercent === "number" ? "%" : ""}</dd></div>
        </dl>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <select value={selectedRoomId} onChange={(event) => selectRoom(event.target.value)} className="rounded-xl border border-white/10 bg-black/20 px-2 py-2 text-[10px] outline-none">
          {ENERGY_ROOM_MONITORS.map((room) => (
            <option key={room.roomId} value={room.roomId}>{room.roomName}</option>
          ))}
        </select>
        <select value={selectedCircuitId} onChange={(event) => selectCircuit(event.target.value)} className="rounded-xl border border-white/10 bg-black/20 px-2 py-2 text-[10px] outline-none">
          {ENERGY_CIRCUIT_MONITORS.map((circuit) => (
            <option key={circuit.id} value={circuit.id}>{circuit.name}</option>
          ))}
        </select>
      </div>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Selected Room</div>
        <dl className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
          <div><dt className={styles.muted}>Room</dt><dd className="truncate">{selectedRoom.roomName}</dd></div>
          <div><dt className={styles.muted}>Devices</dt><dd>{selectedRoom.deviceCount}</dd></div>
          <div><dt className={styles.muted}>Instant</dt><dd>{formatNumber(selectedRoom.metrics.instantConsumptionWatts)}W</dd></div>
          <div><dt className={styles.muted}>Monthly</dt><dd>{formatNumber(selectedRoom.metrics.monthlyUsageKwh)}kWh</dd></div>
        </dl>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Selected Circuit</div>
        <dl className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
          <div><dt className={styles.muted}>Type</dt><dd className="capitalize">{formatLabel(selectedCircuit.circuitType)}</dd></div>
          <div><dt className={styles.muted}>Breaker</dt><dd>{selectedCircuit.breakerRatingAmps}A</dd></div>
          <div><dt className={styles.muted}>Load</dt><dd>{formatNumber(selectedCircuit.loadPercent)}%</dd></div>
          <div><dt className={styles.muted}>Upgrade</dt><dd>{selectedCircuit.upgradeRecommended ? "Yes" : "No"}</dd></div>
        </dl>
      </section>

      <div className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Floor Monitors</div>
        <div className={`${styles.muted} mt-2 space-y-1 text-[10px]`}>
          {ENERGY_FLOOR_MONITORS.map((floor) => (
            <div key={floor.id} className="flex justify-between gap-2">
              <span>{floor.name}</span>
              <span>{formatNumber(floor.metrics.monthlyUsageKwh)}kWh/mo</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Power Flow</div>
        <div className={`${styles.muted} mt-2 space-y-1 text-[10px]`}>
          {ENERGY_POWER_FLOWS.map((flow) => (
            <div key={flow.id} className="flex justify-between gap-2">
              <span className="capitalize">{formatLabel(flow.from)} {"->"} {formatLabel(flow.to)}</span>
              <span>{flow.kw}kW</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Recommendations</div>
        <div className={`${styles.muted} mt-2 space-y-2 text-[10px]`}>
          {ENERGY_RECOMMENDATIONS.map((item) => (
            <div key={item.id}>
              <div className="font-medium text-white/85">{item.title}</div>
              <div>{item.recommendation}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Energy Quote</div>
        <p className={`${styles.muted} mt-1 text-[10px] leading-relaxed`}>
          Recommends solar, battery, UPS, circuit upgrades, and panel monitoring. Internal total {formatCurrency(ENERGY_QUOTE_SUMMARY.totalCost)}; existing quote engine untouched. BAS energy endpoints: {basEnergyEndpointCount()}.
        </p>
      </div>
    </div>
  );
}
