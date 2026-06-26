"use client";

import { useMemo } from "react";
import {
  BAS_AUTOMATION_GRAPHS,
  BAS_AUTOMATION_RULES,
  BAS_SCENES,
  BAS_SCHEDULES,
  BAS_SYSTEM_REPORT,
  executeBasRule,
  summarizeBasDomains,
} from "@/lib/experience/automation";
import { useAutomationStore } from "@/lib/experience/stores";
import styles from "@/styles/experience/experience.module.css";

function formatLabel(value: string) {
  return value.replace(/-/g, " ");
}

function statusClass(status: string) {
  if (status === "enabled" || status === "online" || status === "success") return "bg-emerald-300/15 text-emerald-100";
  if (status === "virtual" || status === "skipped") return "bg-sky-300/15 text-sky-100";
  if (status === "degraded" || status === "failed-gracefully") return "bg-amber-300/15 text-amber-100";
  return "bg-white/10 text-white/60";
}

function AutomationGraphPreview({ graphId }: { readonly graphId: string }) {
  const graph = BAS_AUTOMATION_GRAPHS.find((candidate) => candidate.id === graphId) ?? BAS_AUTOMATION_GRAPHS[0];

  return (
    <div className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Automation Graph</div>
        <span className="rounded-full bg-cyan-300/15 px-2 py-1 text-[9px] font-semibold uppercase text-cyan-100">Visual Ready</span>
      </div>
      <div className="relative mt-3 h-52 overflow-hidden rounded-xl border border-white/10 bg-slate-950/60">
        {graph.edges.map((edge) => {
          const from = graph.nodes.find((node) => node.id === edge.from);
          const to = graph.nodes.find((node) => node.id === edge.to);
          if (!from || !to) return null;
          const width = Math.max(24, Math.abs(to.position[0] - from.position[0]));
          const left = Math.min(from.position[0], to.position[0]) / 2.4 + 8;
          const top = (from.position[1] + to.position[1]) / 4.8 + 12;

          return <span key={edge.id} className="absolute h-px bg-cyan-200/25" style={{ left, top, width: width / 2.4 }} title={edge.label} />;
        })}
        {graph.nodes.map((node) => (
          <div
            key={node.id}
            className={`absolute max-w-[86px] rounded-lg border px-2 py-1 text-[8px] leading-tight ${node.type === "action" ? "border-emerald-200/25 bg-emerald-200/10" : node.type === "fail-safe" ? "border-amber-200/25 bg-amber-200/10" : node.type === "logic" ? "border-cyan-200/25 bg-cyan-200/10" : "border-white/10 bg-black/40"}`}
            style={{ left: node.position[0] / 2.4, top: node.position[1] / 2.4 }}
          >
            <div className="font-semibold uppercase">{node.type}</div>
            <div className={styles.muted}>{node.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BasDashboardPanel() {
  const selectedRuleId = useAutomationStore((state) => state.selectedRuleId);
  const selectedSceneId = useAutomationStore((state) => state.selectedSceneId);
  const selectedScheduleId = useAutomationStore((state) => state.selectedScheduleId);
  const lastExecution = useAutomationStore((state) => state.lastExecution);
  const selectRule = useAutomationStore((state) => state.selectRule);
  const selectScene = useAutomationStore((state) => state.selectScene);
  const selectSchedule = useAutomationStore((state) => state.selectSchedule);
  const evaluateSelectedRule = useAutomationStore((state) => state.evaluateSelectedRule);
  const selectedRule = BAS_AUTOMATION_RULES.find((rule) => rule.id === selectedRuleId) ?? BAS_AUTOMATION_RULES[0];
  const selectedScene = BAS_SCENES.find((scene) => scene.id === selectedSceneId) ?? BAS_SCENES[0];
  const selectedSchedule = BAS_SCHEDULES.find((schedule) => schedule.id === selectedScheduleId) ?? BAS_SCHEDULES[0];
  const domainSummaries = useMemo(() => summarizeBasDomains(), []);
  const simulatedResult = useMemo(() => executeBasRule(selectedRule), [selectedRule]);

  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-black/10 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-medium">Building Automation System</div>
          <div className={`${styles.muted} text-[10px]`}>
            {BAS_SYSTEM_REPORT.endpointCount} endpoints / {BAS_SYSTEM_REPORT.ruleCount} rules / {BAS_SYSTEM_REPORT.sceneCount} scenes
          </div>
        </div>
        <span className="rounded-full bg-cyan-300/15 px-2 py-1 text-[9px] font-semibold uppercase text-cyan-100">BAS</span>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
        <div><dt className={styles.muted}>Smart Devices</dt><dd>{BAS_SYSTEM_REPORT.smartDeviceEndpointCount}</dd></div>
        <div><dt className={styles.muted}>Lighting</dt><dd>{BAS_SYSTEM_REPORT.lightingEndpointCount}</dd></div>
        <div><dt className={styles.muted}>Security</dt><dd>{BAS_SYSTEM_REPORT.securityEndpointCount}</dd></div>
        <div><dt className={styles.muted}>Virtual</dt><dd>{BAS_SYSTEM_REPORT.virtualEndpointCount}</dd></div>
        <div><dt className={styles.muted}>Schedules</dt><dd>{BAS_SYSTEM_REPORT.scheduleCount}</dd></div>
        <div><dt className={styles.muted}>Fail Safe</dt><dd>{BAS_SYSTEM_REPORT.failSafeCoveragePercent}%</dd></div>
      </dl>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <select value={selectedRuleId} onChange={(event) => selectRule(event.target.value)} className="rounded-xl border border-white/10 bg-black/20 px-2 py-2 text-[10px] outline-none">
          {BAS_AUTOMATION_RULES.map((rule) => (
            <option key={rule.id} value={rule.id}>{rule.name}</option>
          ))}
        </select>
        <button type="button" onClick={evaluateSelectedRule} className="rounded-xl border border-cyan-200/25 bg-cyan-200/10 px-2 py-2 text-[10px] font-semibold uppercase text-cyan-100 hover:bg-cyan-200/15">
          Evaluate
        </button>
      </div>

      <section className="mt-3 rounded-2xl border border-cyan-200/20 bg-cyan-200/10 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate text-xs font-semibold">{selectedRule.name}</div>
            <div className={`${styles.muted} text-[10px]`}>{selectedRule.trigger.label}</div>
          </div>
          <span className={`rounded-full px-2 py-1 text-[9px] font-semibold uppercase ${statusClass(selectedRule.status)}`}>{selectedRule.status}</span>
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
          <div><dt className={styles.muted}>Logic</dt><dd className="uppercase">{selectedRule.condition.operator}</dd></div>
          <div><dt className={styles.muted}>Actions</dt><dd>{selectedRule.actions.length}</dd></div>
          <div><dt className={styles.muted}>Fail Safe</dt><dd className="capitalize">{formatLabel(selectedRule.failSafe.strategy)}</dd></div>
          <div><dt className={styles.muted}>Graph</dt><dd>{selectedRule.graphId.replace("bas-graph-", "")}</dd></div>
        </dl>
        <p className={`${styles.muted} mt-3 text-[10px] leading-relaxed`}>
          Simulated result: {simulatedResult.message}
        </p>
        {lastExecution ? (
          <div className={`mt-3 rounded-xl px-2 py-2 text-[10px] ${statusClass(lastExecution.status)}`}>
            Last execution: {lastExecution.status}; actions ready {lastExecution.actionCount}; fail-safe {lastExecution.failSafeApplied ? "applied" : "not needed"}.
          </div>
        ) : null}
      </section>

      <AutomationGraphPreview graphId={selectedRule.graphId} />

      <div className="mt-3 grid grid-cols-2 gap-2">
        <select value={selectedSceneId} onChange={(event) => selectScene(event.target.value)} className="rounded-xl border border-white/10 bg-black/20 px-2 py-2 text-[10px] outline-none">
          {BAS_SCENES.map((scene) => (
            <option key={scene.id} value={scene.id}>{scene.name}</option>
          ))}
        </select>
        <select value={selectedScheduleId} onChange={(event) => selectSchedule(event.target.value)} className="rounded-xl border border-white/10 bg-black/20 px-2 py-2 text-[10px] outline-none">
          {BAS_SCHEDULES.map((schedule) => (
            <option key={schedule.id} value={schedule.id}>{schedule.name}</option>
          ))}
        </select>
      </div>

      <div className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Scene Engine</div>
        <p className={`${styles.muted} mt-1 text-[10px] leading-relaxed`}>
          {selectedScene.name}: {selectedScene.actions.length} actions, graph-ready, {selectedScene.customEditable ? "custom editable" : "preset"}.
        </p>
      </div>

      <div className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Scheduler</div>
        <p className={`${styles.muted} mt-1 text-[10px] leading-relaxed`}>
          {selectedSchedule.name}: {formatLabel(selectedSchedule.type)} / {selectedSchedule.expression}
          {typeof selectedSchedule.randomizedWindowMinutes === "number" ? ` / randomized ${selectedSchedule.randomizedWindowMinutes}m` : ""}.
        </p>
      </div>

      <div className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Domain Connectivity</div>
        <div className={`${styles.muted} mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]`}>
          {domainSummaries.map((summary) => (
            <div key={summary.domain} className="capitalize">{formatLabel(summary.domain)}: {summary.endpoints}</div>
          ))}
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">No AI</div>
        <p className={`${styles.muted} mt-1 text-[10px] leading-relaxed`}>
          BAS is rules, scenes, schedules, graph metadata, and fail-safe evaluation only. AI remains excluded.
        </p>
      </div>
    </div>
  );
}
