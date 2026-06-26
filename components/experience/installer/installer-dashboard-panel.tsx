"use client";

import {
  INSTALLER_COMPLETION_SIGN_OFF,
  INSTALLER_PHOTOS,
  INSTALLER_PLATFORM_CONTEXT,
  INSTALLER_PLATFORM_REPORT,
  INSTALLER_PROJECT_WORKFLOWS,
  INSTALLER_REPORTS,
  INSTALLER_SCHEDULES,
  INSTALLER_TASKS,
  INSTALLER_TECHNICIANS,
  INSTALLER_WIRING_PLANS,
} from "@/lib/experience/installer";
import { useInstallerStore } from "@/lib/experience/stores";
import type { InstallerReportType, InstallerWarehouseStatus } from "@/types/experience";
import styles from "@/styles/experience/experience.module.css";

const MATERIAL_FILTERS: readonly (InstallerWarehouseStatus | "all")[] = ["all", "in-stock", "low-stock", "ordered", "backordered"] as const;
const REPORT_TYPES: readonly InstallerReportType[] = ["installation-report", "material-plan", "wiring-plan", "handover-pack", "maintenance-plan"] as const;

function formatLabel(value: string) {
  return value.replace(/-/g, " ");
}

function formatCurrency(value: number) {
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

function statusClass(status: string) {
  if (status === "complete" || status === "in-stock" || status === "handover-ready") return "bg-emerald-300/15 text-emerald-100";
  if (status === "active" || status === "in-progress" || status === "low-stock" || status === "ready-for-testing") return "bg-amber-300/15 text-amber-100";
  if (status === "blocked" || status === "backordered") return "bg-rose-300/15 text-rose-100";
  return "bg-sky-300/15 text-sky-100";
}

export function InstallerDashboardPanel() {
  const selectedProjectId = useInstallerStore((state) => state.selectedProjectId);
  const selectedRoomId = useInstallerStore((state) => state.selectedRoomId);
  const selectedTaskId = useInstallerStore((state) => state.selectedTaskId);
  const selectedReportType = useInstallerStore((state) => state.selectedReportType);
  const materialFilter = useInstallerStore((state) => state.materialFilter);
  const selectedWorkflow = useInstallerStore((state) => state.selectedWorkflow);
  const selectedRoomChecklist = useInstallerStore((state) => state.selectedRoomChecklist);
  const selectedTask = useInstallerStore((state) => state.selectedTask);
  const selectedReport = useInstallerStore((state) => state.selectedReport);
  const visibleMaterials = useInstallerStore((state) => state.visibleMaterials);
  const completedTask = useInstallerStore((state) => state.completedTask);
  const qrRegistration = useInstallerStore((state) => state.qrRegistration);
  const selectProject = useInstallerStore((state) => state.selectProject);
  const selectRoom = useInstallerStore((state) => state.selectRoom);
  const selectTask = useInstallerStore((state) => state.selectTask);
  const selectReportType = useInstallerStore((state) => state.selectReportType);
  const setMaterialFilter = useInstallerStore((state) => state.setMaterialFilter);
  const completeSelectedTask = useInstallerStore((state) => state.completeSelectedTask);
  const registerFirstRoomDevice = useInstallerStore((state) => state.registerFirstRoomDevice);

  return (
    <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-medium">Installer Platform</div>
          <div className={`${styles.muted} text-[10px]`}>
            {INSTALLER_PLATFORM_REPORT.dashboard.projectCount} projects / {INSTALLER_PLATFORM_REPORT.dashboard.taskCount} tasks
          </div>
        </div>
        <span className="rounded-full bg-amber-300/15 px-2 py-1 text-[9px] font-semibold uppercase text-amber-100">Milestone 23</span>
      </div>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Installer Dashboard</div>
        <dl className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
          <div><dt className={styles.muted}>Schedules</dt><dd>{INSTALLER_PLATFORM_REPORT.dashboard.scheduleCount}</dd></div>
          <div><dt className={styles.muted}>Jobs</dt><dd>{INSTALLER_PLATFORM_REPORT.dashboard.assignedJobCount}</dd></div>
          <div><dt className={styles.muted}>Photos</dt><dd>{INSTALLER_PLATFORM_REPORT.dashboard.photoCount}</dd></div>
          <div><dt className={styles.muted}>Progress</dt><dd>{INSTALLER_PLATFORM_REPORT.dashboard.averageProgressPercent}%</dd></div>
          <div><dt className={styles.muted}>Completion</dt><dd>{INSTALLER_PLATFORM_REPORT.dashboard.completionPercent}%</dd></div>
          <div><dt className={styles.muted}>Reports</dt><dd>{INSTALLER_PLATFORM_REPORT.reportCount}</dd></div>
        </dl>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Project Workflow</div>
        <div className="mt-2 space-y-1">
          {INSTALLER_PROJECT_WORKFLOWS.map((workflow) => (
            <button
              key={workflow.id}
              type="button"
              onClick={() => selectProject(workflow.projectId)}
              className={`w-full rounded-xl border px-2 py-2 text-left text-[10px] transition ${selectedProjectId === workflow.projectId ? "border-amber-200/40 bg-amber-200/15" : "border-white/10 bg-black/10 hover:bg-white/10"}`}
            >
              <span className="flex justify-between gap-2">
                <span className="font-medium">{workflow.projectName}</span>
                <span className={styles.muted}>{workflow.progressPercent}%</span>
              </span>
              <span className={`${styles.muted} mt-1 block`}>{formatLabel(workflow.currentStage)} / {workflow.propertyName}</span>
            </button>
          ))}
        </div>
        {selectedWorkflow ? (
          <div className="mt-2 grid grid-cols-2 gap-1">
            {selectedWorkflow.lifecycle.map((step) => (
              <span key={step.stage} className={`rounded-xl px-2 py-1 text-[8px] font-semibold uppercase ${statusClass(step.status)}`}>
                {formatLabel(step.stage)}
              </span>
            ))}
          </div>
        ) : null}
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Schedules</div>
          <span className={styles.muted}>{INSTALLER_SCHEDULES.length}</span>
        </div>
        <div className="mt-2 space-y-1">
          {INSTALLER_SCHEDULES.map((schedule) => (
            <div key={schedule.id} className="rounded-xl border border-white/10 bg-black/10 p-2 text-[10px]">
              <span className="flex justify-between gap-2">
                <span className="font-medium">{schedule.label}</span>
                <span className={`rounded-full px-2 py-0.5 text-[8px] uppercase ${statusClass(schedule.status)}`}>{formatLabel(schedule.status)}</span>
              </span>
              <span className={`${styles.muted} mt-1 block`}>{schedule.windowLabel} / {schedule.assignedTeam} / {schedule.estimatedHours}h</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Installation Mode</div>
        <div className="mt-2 max-h-36 space-y-1 overflow-y-auto pr-1">
          {INSTALLER_TASKS.slice(0, 16).map((task) => (
            <button
              key={task.id}
              type="button"
              onClick={() => {
                selectTask(task.id);
                if (task.roomId) selectRoom(task.roomId);
              }}
              className={`w-full rounded-xl border px-2 py-2 text-left text-[10px] transition ${selectedTaskId === task.id ? "border-amber-200/40 bg-amber-200/15" : "border-white/10 bg-black/10 hover:bg-white/10"}`}
            >
              <span className="flex justify-between gap-2">
                <span className="truncate font-medium">{task.title}</span>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[8px] uppercase ${statusClass(task.status)}`}>{formatLabel(task.status)}</span>
              </span>
              <span className={`${styles.muted} mt-1 block`}>{task.estimatedHours}h / {task.priority}</span>
            </button>
          ))}
        </div>
        <button type="button" onClick={completeSelectedTask} className="mt-2 w-full rounded-xl border border-amber-200/30 bg-amber-200/10 px-3 py-2 text-[10px] font-semibold uppercase text-amber-100 hover:bg-amber-200/15">
          Simulate Task Completion
        </button>
        <p className={`${styles.muted} mt-2 text-[10px] leading-relaxed`}>
          {completedTask ? `${completedTask.title} marked complete in local installer simulation.` : selectedTask ? selectedTask.notes : "Select an installation task."}
        </p>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Room Checklist</div>
        <div className="mt-2 grid grid-cols-2 gap-1">
          {["gf-foyer", "gf-formal-living", "gf-open-kitchen", "gf-cinema", "ff-master-bedroom", "ff-family-lounge"].map((roomId) => (
            <button
              key={roomId}
              type="button"
              onClick={() => selectRoom(roomId)}
              className={`rounded-xl border px-2 py-2 text-[9px] font-semibold uppercase transition ${selectedRoomId === roomId ? "border-amber-200/40 bg-amber-200/15 text-amber-100" : "border-white/10 bg-black/15 text-white/65 hover:bg-white/10"}`}
            >
              {formatLabel(roomId.replace(/^gf-|^ff-/, ""))}
            </button>
          ))}
        </div>
        {selectedRoomChecklist ? (
          <>
            <dl className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
              <div><dt className={styles.muted}>Devices</dt><dd>{selectedRoomChecklist.requiredDeviceCount}</dd></div>
              <div><dt className={styles.muted}>Cable Runs</dt><dd>{selectedRoomChecklist.cableRuns}</dd></div>
              <div><dt className={styles.muted}>Labour</dt><dd>{selectedRoomChecklist.labourHours}h</dd></div>
              <div><dt className={styles.muted}>Floor</dt><dd>{selectedRoomChecklist.floorLevel}</dd></div>
            </dl>
            <div className={`${styles.muted} mt-2 space-y-1 text-[10px]`}>
              {selectedRoomChecklist.checklistItems.slice(0, 4).map((item) => (
                <div key={item.id} className="rounded-xl border border-white/10 bg-black/15 p-2">
                  {item.label} / {formatLabel(item.status)}
                </div>
              ))}
            </div>
            <button type="button" onClick={registerFirstRoomDevice} className="mt-2 w-full rounded-xl border border-white/10 bg-black/15 px-3 py-2 text-[10px] font-semibold uppercase hover:bg-white/10">
              Register First Device QR
            </button>
            <p className={`${styles.muted} mt-2 text-[10px] leading-relaxed`}>
              {qrRegistration ? `${qrRegistration.qrPayload} ready. Physical binding is still future-only.` : "QR registration is ready for technician app workflows."}
            </p>
          </>
        ) : null}
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Wiring Planner</div>
        <dl className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
          <div><dt className={styles.muted}>Plans</dt><dd>{INSTALLER_PLATFORM_REPORT.wiringPlanCount}</dd></div>
          <div><dt className={styles.muted}>Power</dt><dd>{INSTALLER_WIRING_PLANS.reduce((total, plan) => total + plan.powerWatts, 0).toLocaleString()}W</dd></div>
          <div><dt className={styles.muted}>Conduit</dt><dd>Ready</dd></div>
          <div><dt className={styles.muted}>Rack</dt><dd>{INSTALLER_WIRING_PLANS.filter((plan) => plan.rackUnits > 0).reduce((total, plan) => total + plan.rackUnits, 0)}U</dd></div>
        </dl>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Materials</div>
        <div className="mt-2 grid grid-cols-2 gap-1">
          {MATERIAL_FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setMaterialFilter(filter)}
              className={`rounded-xl border px-2 py-2 text-[9px] font-semibold uppercase transition ${materialFilter === filter ? "border-amber-200/40 bg-amber-200/15 text-amber-100" : "border-white/10 bg-black/15 text-white/65 hover:bg-white/10"}`}
            >
              {formatLabel(filter)}
            </button>
          ))}
        </div>
        <dl className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
          <div><dt className={styles.muted}>BOM</dt><dd>{formatCurrency(INSTALLER_PLATFORM_REPORT.billOfMaterialsCost)}</dd></div>
          <div><dt className={styles.muted}>Purchase</dt><dd>{formatCurrency(INSTALLER_PLATFORM_REPORT.purchaseListCost)}</dd></div>
          <div><dt className={styles.muted}>Supplier</dt><dd>{formatCurrency(INSTALLER_PLATFORM_REPORT.supplierCost)}</dd></div>
          <div><dt className={styles.muted}>Profit</dt><dd>{formatCurrency(INSTALLER_PLATFORM_REPORT.projectedProfit)}</dd></div>
        </dl>
        <div className="mt-2 max-h-28 space-y-1 overflow-y-auto pr-1">
          {visibleMaterials.slice(0, 6).map((materialLine) => (
            <div key={materialLine.id} className="rounded-xl border border-white/10 bg-black/10 p-2 text-[10px]">
              <span className="flex justify-between gap-2">
                <span className="truncate font-medium">{materialLine.name}</span>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[8px] uppercase ${statusClass(materialLine.warehouseStatus)}`}>{formatLabel(materialLine.warehouseStatus)}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Technician App Ready</div>
        <dl className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
          <div><dt className={styles.muted}>QR Codes</dt><dd>{INSTALLER_PLATFORM_REPORT.technicianApp.qrCodeCount}</dd></div>
          <div><dt className={styles.muted}>Techs</dt><dd>{INSTALLER_TECHNICIANS.length}</dd></div>
          <div><dt className={styles.muted}>Photos</dt><dd>{INSTALLER_PHOTOS.length}</dd></div>
          <div><dt className={styles.muted}>Sign-Off</dt><dd>{INSTALLER_COMPLETION_SIGN_OFF.signedOffCount}/{INSTALLER_COMPLETION_SIGN_OFF.requiredApprovals.length}</dd></div>
        </dl>
        <p className={`${styles.muted} mt-2 text-[10px] leading-relaxed`}>
          Device registration, photo upload, GPS check-in, and completion sign-off payloads are ready for a future technician app.
        </p>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Installation Reports</div>
        <div className="mt-2 grid grid-cols-2 gap-1">
          {REPORT_TYPES.map((reportType) => (
            <button
              key={reportType}
              type="button"
              onClick={() => selectReportType(reportType)}
              className={`rounded-xl border px-2 py-2 text-[9px] font-semibold uppercase transition ${selectedReportType === reportType ? "border-amber-200/40 bg-amber-200/15 text-amber-100" : "border-white/10 bg-black/15 text-white/65 hover:bg-white/10"}`}
            >
              {formatLabel(reportType)}
            </button>
          ))}
        </div>
        <p className={`${styles.muted} mt-2 text-[10px] leading-relaxed`}>
          {selectedReport ? `${selectedReport.title}: ${selectedReport.itemCount} items ready.` : `${INSTALLER_REPORTS.length} report payloads ready.`}
        </p>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">CRM Payload</div>
        <dl className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
          <div><dt className={styles.muted}>Lead</dt><dd>{INSTALLER_PLATFORM_CONTEXT.crmLeadId}</dd></div>
          <div><dt className={styles.muted}>Stage</dt><dd>{formatLabel(INSTALLER_PLATFORM_REPORT.crmUpdatePayload.lifecycleStage)}</dd></div>
          <div><dt className={styles.muted}>CRM</dt><dd>Payload</dd></div>
          <div><dt className={styles.muted}>API/DB</dt><dd>Untouched</dd></div>
        </dl>
      </section>
    </div>
  );
}
