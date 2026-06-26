"use client";

import {
  DIGITAL_TWIN_INTELLIGENCE_REPORT,
  DigitalTwinApi,
  TWIN_OBJECT_GRAPH,
  TWIN_SUPPORTED_STATES,
  TWIN_YESTERDAY_TODAY_COMPARISON,
  getTwinEntity,
} from "@/lib/experience/digital-twin/twin-registry";
import { useDigitalTwinStore } from "@/lib/experience/stores";
import type { TwinHistoryFrame, TwinLifecycleState } from "@/types/experience";
import styles from "@/styles/experience/experience.module.css";

const TIMELINE_FRAMES: readonly TwinHistoryFrame[] = ["yesterday", "today", "simulation"] as const;

function formatLabel(value: string) {
  return value.replace(/-/g, " ");
}

function stateClass(state: TwinLifecycleState) {
  if (state === "online" || state === "enabled") return "bg-emerald-300/15 text-emerald-100";
  if (state === "fault" || state === "replacement-required") return "bg-rose-300/15 text-rose-100";
  if (state === "maintenance" || state === "installation-pending") return "bg-amber-300/15 text-amber-100";
  return "bg-white/10 text-white/65";
}

export function DigitalTwinPanel() {
  const selectedTwinUuid = useDigitalTwinStore((state) => state.selectedTwinUuid);
  const timelineFrame = useDigitalTwinStore((state) => state.timelineFrame);
  const timelineSnapshot = useDigitalTwinStore((state) => state.timelineSnapshot);
  const comparison = useDigitalTwinStore((state) => state.comparison);
  const clonedScene = useDigitalTwinStore((state) => state.clonedScene);
  const exportPayload = useDigitalTwinStore((state) => state.exportPayload);
  const importResult = useDigitalTwinStore((state) => state.importResult);
  const selectTwinEntity = useDigitalTwinStore((state) => state.selectTwinEntity);
  const setTimelineFrame = useDigitalTwinStore((state) => state.setTimelineFrame);
  const updateSelectedState = useDigitalTwinStore((state) => state.updateSelectedState);
  const cloneScene = useDigitalTwinStore((state) => state.cloneScene);
  const exportTwin = useDigitalTwinStore((state) => state.exportTwin);
  const importTwin = useDigitalTwinStore((state) => state.importTwin);
  const selectedEntity = getTwinEntity(selectedTwinUuid);
  const apiEntries = Object.entries(DigitalTwinApi);
  const visibleEntities = TWIN_OBJECT_GRAPH.entities.slice(0, 42);

  return (
    <div className="mt-4 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-medium">Digital Twin Intelligence</div>
          <div className={`${styles.muted} text-[10px]`}>
            {DIGITAL_TWIN_INTELLIGENCE_REPORT.summary.entityCount} entities / {DIGITAL_TWIN_INTELLIGENCE_REPORT.summary.edgeCount} graph edges
          </div>
        </div>
        <span className="rounded-full bg-emerald-300/15 px-2 py-1 text-[9px] font-semibold uppercase text-emerald-100">Live Twin</span>
      </div>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Twin Registry</div>
        <dl className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
          <div><dt className={styles.muted}>Rooms</dt><dd>{DIGITAL_TWIN_INTELLIGENCE_REPORT.summary.roomCount}</dd></div>
          <div><dt className={styles.muted}>Devices</dt><dd>{DIGITAL_TWIN_INTELLIGENCE_REPORT.summary.deviceCount}</dd></div>
          <div><dt className={styles.muted}>Sensors</dt><dd>{DIGITAL_TWIN_INTELLIGENCE_REPORT.summary.sensorCount}</dd></div>
          <div><dt className={styles.muted}>Furniture</dt><dd>{DIGITAL_TWIN_INTELLIGENCE_REPORT.summary.furnitureCount}</dd></div>
          <div><dt className={styles.muted}>Quotes</dt><dd>{DIGITAL_TWIN_INTELLIGENCE_REPORT.summary.quoteCount}</dd></div>
          <div><dt className={styles.muted}>History</dt><dd>{DIGITAL_TWIN_INTELLIGENCE_REPORT.summary.historyEntryCount}</dd></div>
        </dl>
      </section>

      {selectedEntity ? (
        <section className="mt-3 rounded-2xl border border-cyan-200/20 bg-cyan-200/10 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-xs font-semibold">{selectedEntity.name}</div>
              <div className={`${styles.muted} text-[10px]`}>{formatLabel(selectedEntity.kind)} / {selectedEntity.stableId}</div>
            </div>
            <span className={`rounded-full px-2 py-1 text-[9px] font-semibold uppercase ${stateClass(selectedEntity.state)}`}>{formatLabel(selectedEntity.state)}</span>
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
            <div><dt className={styles.muted}>UUID</dt><dd className="truncate">{selectedEntity.uuid}</dd></div>
            <div><dt className={styles.muted}>Health</dt><dd className="capitalize">{selectedEntity.health}</dd></div>
            <div><dt className={styles.muted}>Children</dt><dd>{selectedEntity.childUuids.length}</dd></div>
            <div><dt className={styles.muted}>History</dt><dd>{selectedEntity.history.length}</dd></div>
          </dl>
          <div className="mt-2 grid grid-cols-2 gap-1">
            {TWIN_SUPPORTED_STATES.slice(0, 6).map((state) => (
              <button
                key={state}
                type="button"
                onClick={() => updateSelectedState(state)}
                className={`rounded-xl border px-2 py-2 text-[9px] font-semibold uppercase transition ${selectedEntity.state === state ? "border-cyan-200/40 bg-cyan-200/15 text-cyan-100" : "border-white/10 bg-black/15 text-white/65 hover:bg-white/10"}`}
              >
                {formatLabel(state)}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Time Machine</div>
        <div className="mt-2 grid grid-cols-3 gap-1">
          {TIMELINE_FRAMES.map((frame) => (
            <button
              key={frame}
              type="button"
              onClick={() => setTimelineFrame(frame)}
              className={`rounded-xl border px-2 py-2 text-[9px] font-semibold uppercase transition ${timelineFrame === frame ? "border-cyan-200/40 bg-cyan-200/15 text-cyan-100" : "border-white/10 bg-black/15 text-white/65 hover:bg-white/10"}`}
            >
              {frame}
            </button>
          ))}
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
          <div><dt className={styles.muted}>Frame</dt><dd className="capitalize">{timelineSnapshot.frame}</dd></div>
          <div><dt className={styles.muted}>States</dt><dd>{timelineSnapshot.entityStates.length}</dd></div>
          <div><dt className={styles.muted}>Changed</dt><dd>{comparison.changedCount}</dd></div>
          <div><dt className={styles.muted}>Online Delta</dt><dd>{comparison.onlineCountDelta}</dd></div>
        </dl>
        <p className={`${styles.muted} mt-2 text-[10px] leading-relaxed`}>
          Yesterday vs today changed {TWIN_YESTERDAY_TODAY_COMPARISON.changedCount} entities. Predictive simulation is ready.
        </p>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Digital Twin API</div>
        <div className={`${styles.muted} mt-2 grid grid-cols-2 gap-1 text-[10px]`}>
          {apiEntries.map(([name]) => (
            <div key={name} className="rounded-xl border border-white/10 bg-black/15 px-2 py-2">{name}()</div>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-3 gap-1">
          <button type="button" onClick={cloneScene} className="rounded-xl border border-white/10 bg-black/15 px-2 py-2 text-[9px] font-semibold uppercase hover:bg-white/10">Clone</button>
          <button type="button" onClick={exportTwin} className="rounded-xl border border-white/10 bg-black/15 px-2 py-2 text-[9px] font-semibold uppercase hover:bg-white/10">Export</button>
          <button type="button" onClick={importTwin} className="rounded-xl border border-white/10 bg-black/15 px-2 py-2 text-[9px] font-semibold uppercase hover:bg-white/10">Import</button>
        </div>
        <p className={`${styles.muted} mt-2 text-[10px] leading-relaxed`}>
          Clone {clonedScene ? `${clonedScene.entityCount} entities` : "ready"} / export {exportPayload ? `${exportPayload.entityCount} entities` : "ready"} / import {importResult?.ok ? "accepted" : "ready"}. No route handlers were created.
        </p>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Quote Synchronization</div>
        <dl className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
          <div><dt className={styles.muted}>Selected Items</dt><dd>{DIGITAL_TWIN_INTELLIGENCE_REPORT.quoteIntegration.selectedConfiguratorItemsRegistered}</dd></div>
          <div><dt className={styles.muted}>Quote Entities</dt><dd>{DIGITAL_TWIN_INTELLIGENCE_REPORT.quoteIntegration.quoteEntitiesRegistered}</dd></div>
        </dl>
        <p className={`${styles.muted} mt-2 text-[10px] leading-relaxed`}>
          Every selected configurator item is represented inside DTIE. Existing quote engine remains untouched.
        </p>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Entity Index</div>
        <div className="mt-2 max-h-48 space-y-1 overflow-y-auto pr-1">
          {visibleEntities.map((entity) => (
            <button
              key={entity.uuid}
              type="button"
              onClick={() => selectTwinEntity(entity.uuid)}
              className={`flex w-full items-center gap-2 rounded-xl border px-2 py-2 text-left text-[10px] transition ${selectedTwinUuid === entity.uuid ? "border-cyan-200/40 bg-cyan-200/15" : "border-white/10 bg-black/10 hover:bg-white/10"}`}
            >
              <span className={`size-2 shrink-0 rounded-full ${entity.health === "critical" ? "bg-rose-300" : entity.health === "warning" ? "bg-amber-300" : "bg-emerald-300"}`} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{entity.name}</span>
                <span className={`${styles.muted} block truncate`}>{formatLabel(entity.kind)} / {formatLabel(entity.state)}</span>
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
