"use client";

import {
  COMMERCIAL_BUSINESS_PLANS,
  COMMERCIAL_DEPLOYMENT,
  COMMERCIAL_DOCUMENTATION,
  COMMERCIAL_LAUNCH_REPORT,
  COMMERCIAL_PORTALS,
  COMMERCIAL_SUCCESS_CRITERIA,
  SMARTHIVE_OS_VERSION_1_CONTEXT,
} from "@/lib/experience/commercial-launch";
import { useCommercialLaunchStore } from "@/lib/experience/stores";
import type { CommercialLaunchFeatureStatus, CommercialLaunchStatus } from "@/types/experience";
import styles from "@/styles/experience/experience.module.css";

function formatLabel(value: string) {
  return value.replace(/-/g, " ");
}

function surfaceStatusClass(status: CommercialLaunchStatus) {
  if (status === "production-ready" || status === "experience-ready") return "bg-emerald-300/15 text-emerald-100";
  if (status === "integration-ready") return "bg-amber-300/15 text-amber-100";
  return "bg-rose-300/15 text-rose-100";
}

function featureStatusClass(status: CommercialLaunchFeatureStatus) {
  if (status === "ready") return "bg-emerald-300/15 text-emerald-100";
  if (status === "payload-ready") return "bg-sky-300/15 text-sky-100";
  if (status === "documented") return "bg-amber-300/15 text-amber-100";
  return "bg-rose-300/15 text-rose-100";
}

export function CommercialLaunchPanel() {
  const selectedSurfaceId = useCommercialLaunchStore((state) => state.selectedSurfaceId);
  const selectedPortalId = useCommercialLaunchStore((state) => state.selectedPortalId);
  const selectedBusinessPlanId = useCommercialLaunchStore((state) => state.selectedBusinessPlanId);
  const selectedDocumentationKind = useCommercialLaunchStore((state) => state.selectedDocumentationKind);
  const selectedDeploymentId = useCommercialLaunchStore((state) => state.selectedDeploymentId);
  const selectedSegmentId = useCommercialLaunchStore((state) => state.selectedSegmentId);
  const selectedSurface = useCommercialLaunchStore((state) => state.selectedSurface);
  const selectedPortal = useCommercialLaunchStore((state) => state.selectedPortal);
  const selectedBusinessPlan = useCommercialLaunchStore((state) => state.selectedBusinessPlan);
  const selectedDocumentation = useCommercialLaunchStore((state) => state.selectedDocumentation);
  const selectedDeployment = useCommercialLaunchStore((state) => state.selectedDeployment);
  const selectedSegment = useCommercialLaunchStore((state) => state.selectedSegment);
  const selectSurface = useCommercialLaunchStore((state) => state.selectSurface);
  const selectPortal = useCommercialLaunchStore((state) => state.selectPortal);
  const selectBusinessPlan = useCommercialLaunchStore((state) => state.selectBusinessPlan);
  const selectDocumentation = useCommercialLaunchStore((state) => state.selectDocumentation);
  const selectDeployment = useCommercialLaunchStore((state) => state.selectDeployment);
  const selectSegment = useCommercialLaunchStore((state) => state.selectSegment);

  return (
    <div className="mt-4 rounded-2xl border border-white/20 bg-white/10 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-medium">{COMMERCIAL_LAUNCH_REPORT.releaseLabel}</div>
          <div className={`${styles.muted} text-[10px]`}>
            {COMMERCIAL_LAUNCH_REPORT.launchScore}% launch score / {COMMERCIAL_LAUNCH_REPORT.metrics.supportedSegmentCount} segments
          </div>
        </div>
        <span className="rounded-full bg-emerald-300/15 px-2 py-1 text-[9px] font-semibold uppercase text-emerald-100">Commercial Ready</span>
      </div>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Final Deliverable</div>
        <dl className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
          <div><dt className={styles.muted}>Version</dt><dd>{COMMERCIAL_LAUNCH_REPORT.finalDeliverable.smartHiveOsVersion}</dd></div>
          <div><dt className={styles.muted}>Status</dt><dd>{formatLabel(COMMERCIAL_LAUNCH_REPORT.releaseStatus)}</dd></div>
          <div><dt className={styles.muted}>Enterprise</dt><dd>{COMMERCIAL_LAUNCH_REPORT.finalDeliverable.enterpriseReady ? "Ready" : "No"}</dd></div>
          <div><dt className={styles.muted}>Production</dt><dd>{COMMERCIAL_LAUNCH_REPORT.finalDeliverable.productionReady ? "Ready" : "No"}</dd></div>
          <div><dt className={styles.muted}>Twin Entities</dt><dd>{COMMERCIAL_LAUNCH_REPORT.metrics.digitalTwinEntityCount.toLocaleString()}</dd></div>
          <div><dt className={styles.muted}>Devices</dt><dd>{COMMERCIAL_LAUNCH_REPORT.metrics.deviceCount.toLocaleString()}</dd></div>
        </dl>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Launch Surfaces</div>
        <div className="mt-2 grid grid-cols-2 gap-1">
          {COMMERCIAL_LAUNCH_REPORT.surfaces.map((surface) => (
            <button
              key={surface.id}
              type="button"
              onClick={() => selectSurface(surface.id)}
              className={`rounded-xl border px-2 py-2 text-[9px] font-semibold uppercase transition ${selectedSurfaceId === surface.id ? "border-white/40 bg-white/20 text-white" : "border-white/10 bg-black/15 text-white/65 hover:bg-white/10"}`}
            >
              {formatLabel(surface.id)}
            </button>
          ))}
        </div>
        {selectedSurface ? (
          <>
            <div className="mt-2 rounded-xl border border-white/10 bg-black/10 p-2 text-[10px]">
              <span className="flex justify-between gap-2">
                <span className="font-medium">{selectedSurface.label}</span>
                <span className={`rounded-full px-2 py-0.5 text-[8px] uppercase ${surfaceStatusClass(selectedSurface.status)}`}>{formatLabel(selectedSurface.status)}</span>
              </span>
              <span className={`${styles.muted} mt-1 block`}>{selectedSurface.completionPercent}% / {selectedSurface.notes}</span>
            </div>
            <div className="mt-2 space-y-1">
              {selectedSurface.features.slice(0, 5).map((feature) => (
                <div key={feature.id} className="rounded-xl border border-white/10 bg-black/10 p-2 text-[10px]">
                  <span className="flex justify-between gap-2">
                    <span className="font-medium">{feature.label}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[8px] uppercase ${featureStatusClass(feature.status)}`}>{formatLabel(feature.status)}</span>
                  </span>
                  <span className={`${styles.muted} mt-1 block`}>{feature.evidence}</span>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Portals</div>
        <div className="mt-2 grid grid-cols-2 gap-1">
          {COMMERCIAL_PORTALS.map((portal) => (
            <button
              key={portal.id}
              type="button"
              onClick={() => selectPortal(portal.id)}
              className={`rounded-xl border px-2 py-2 text-[9px] font-semibold uppercase transition ${selectedPortalId === portal.id ? "border-sky-200/40 bg-sky-200/15 text-sky-100" : "border-white/10 bg-black/15 text-white/65 hover:bg-white/10"}`}
            >
              {formatLabel(portal.id)}
            </button>
          ))}
        </div>
        <p className={`${styles.muted} mt-2 text-[10px] leading-relaxed`}>
          {selectedPortal ? `${selectedPortal.label}: ${selectedPortal.modules.length} modules ready. Auth modified: ${selectedPortal.existingAuthModified ? "yes" : "no"}, database modified: ${selectedPortal.databaseModified ? "yes" : "no"}.` : "Select a portal."}
        </p>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Business</div>
        <div className="mt-2 space-y-1">
          {COMMERCIAL_BUSINESS_PLANS.map((plan) => (
            <button
              key={plan.id}
              type="button"
              onClick={() => selectBusinessPlan(plan.id)}
              className={`w-full rounded-xl border px-2 py-2 text-left text-[10px] transition ${selectedBusinessPlanId === plan.id ? "border-violet-200/40 bg-violet-200/15" : "border-white/10 bg-black/10 hover:bg-white/10"}`}
            >
              <span className="flex justify-between gap-2">
                <span className="font-medium">{plan.label}</span>
                <span className={styles.muted}>{formatLabel(plan.billingModel)}</span>
              </span>
            </button>
          ))}
        </div>
        <p className={`${styles.muted} mt-2 text-[10px] leading-relaxed`}>
          {selectedBusinessPlan ? `${selectedBusinessPlan.audience}: ${selectedBusinessPlan.features.join(", ")}.` : "Select a business plan."}
        </p>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Documentation</div>
        <div className="mt-2 grid grid-cols-2 gap-1">
          {COMMERCIAL_DOCUMENTATION.map((doc) => (
            <button
              key={doc.id}
              type="button"
              onClick={() => selectDocumentation(doc.kind)}
              className={`rounded-xl border px-2 py-2 text-[9px] font-semibold uppercase transition ${selectedDocumentationKind === doc.kind ? "border-white/40 bg-white/20 text-white" : "border-white/10 bg-black/15 text-white/65 hover:bg-white/10"}`}
            >
              {formatLabel(doc.kind)}
            </button>
          ))}
        </div>
        <p className={`${styles.muted} mt-2 text-[10px] leading-relaxed`}>
          {selectedDocumentation ? `${selectedDocumentation.title}: ${selectedDocumentation.sectionCount} sections at ${selectedDocumentation.path}.` : "Select documentation."}
        </p>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Deployment</div>
        <div className="mt-2 grid grid-cols-2 gap-1">
          {COMMERCIAL_DEPLOYMENT.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => selectDeployment(item.id)}
              className={`rounded-xl border px-2 py-2 text-[9px] font-semibold uppercase transition ${selectedDeploymentId === item.id ? "border-emerald-200/40 bg-emerald-200/15 text-emerald-100" : "border-white/10 bg-black/15 text-white/65 hover:bg-white/10"}`}
            >
              {formatLabel(item.id)}
            </button>
          ))}
        </div>
        <p className={`${styles.muted} mt-2 text-[10px] leading-relaxed`}>
          {selectedDeployment ? `${selectedDeployment.label}: ${selectedDeployment.evidence}` : "Select deployment item."}
        </p>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Success Criteria</div>
        <div className="mt-2 grid grid-cols-2 gap-1">
          {COMMERCIAL_SUCCESS_CRITERIA.map((criterion) => (
            <button
              key={criterion.id}
              type="button"
              onClick={() => selectSegment(criterion.id)}
              className={`rounded-xl border px-2 py-2 text-[9px] font-semibold uppercase transition ${selectedSegmentId === criterion.id ? "border-emerald-200/40 bg-emerald-200/15 text-emerald-100" : "border-white/10 bg-black/15 text-white/65 hover:bg-white/10"}`}
            >
              {criterion.label}
            </button>
          ))}
        </div>
        <p className={`${styles.muted} mt-2 text-[10px] leading-relaxed`}>
          {selectedSegment ? `${selectedSegment.label}: ${selectedSegment.evidence}` : "Select a supported segment."}
        </p>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Launch Context</div>
        <dl className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
          <div><dt className={styles.muted}>Protocols</dt><dd>{SMARTHIVE_OS_VERSION_1_CONTEXT.communicationProtocolCount}</dd></div>
          <div><dt className={styles.muted}>Cloud Targets</dt><dd>{SMARTHIVE_OS_VERSION_1_CONTEXT.cloudTargets}</dd></div>
          <div><dt className={styles.muted}>Energy Monitors</dt><dd>{SMARTHIVE_OS_VERSION_1_CONTEXT.energyMonitors}</dd></div>
          <div><dt className={styles.muted}>Lighting</dt><dd>{SMARTHIVE_OS_VERSION_1_CONTEXT.lightingEndpoints}</dd></div>
          <div><dt className={styles.muted}>Vision AI</dt><dd>{SMARTHIVE_OS_VERSION_1_CONTEXT.visionAnalyses}</dd></div>
          <div><dt className={styles.muted}>API/DB</dt><dd>Untouched</dd></div>
        </dl>
      </section>
    </div>
  );
}
