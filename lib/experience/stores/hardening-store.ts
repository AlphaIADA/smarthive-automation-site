import { create } from "zustand";
import {
  ENTERPRISE_HARDENING_REPORT,
  EvaluateRuntimePerformance,
  HARDENING_OPTIMIZATION_CONTROLS,
  HARDENING_REPORT_ARTIFACTS,
  HARDENING_SECURITY_CONTROLS,
  HARDENING_TEST_CONTROLS,
} from "@/lib/experience/hardening";
import type {
  HardeningOptimizationControl,
  HardeningPerformanceTarget,
  HardeningReportArtifact,
  HardeningReportKind,
  HardeningRuntimeSnapshot,
  HardeningSecurityControl,
  HardeningTestControl,
} from "@/types/experience";

interface HardeningStoreState {
  selectedReportKind: HardeningReportKind;
  selectedOptimizationId: HardeningOptimizationControl["id"];
  selectedSecurityId: string;
  selectedTestId: string;
  runtimeSnapshot: HardeningRuntimeSnapshot | null;
  runtimeTargets: readonly HardeningPerformanceTarget[];
  selectedReport: HardeningReportArtifact | null;
  selectedOptimization: HardeningOptimizationControl | null;
  selectedSecurityControl: HardeningSecurityControl | null;
  selectedTestControl: HardeningTestControl | null;
  selectReportKind: (kind: HardeningReportKind) => void;
  selectOptimization: (optimizationId: HardeningOptimizationControl["id"]) => void;
  selectSecurityControl: (controlId: string) => void;
  selectTestControl: (controlId: string) => void;
  updateRuntimeSnapshot: (snapshot: HardeningRuntimeSnapshot) => void;
}

const initialReport = HARDENING_REPORT_ARTIFACTS[0] ?? null;
const initialOptimization = HARDENING_OPTIMIZATION_CONTROLS[0] ?? null;
const initialSecurity = HARDENING_SECURITY_CONTROLS[0] ?? null;
const initialTest = HARDENING_TEST_CONTROLS[0] ?? null;

export const useHardeningStore = create<HardeningStoreState>((set) => ({
  selectedReportKind: initialReport?.kind ?? "performance",
  selectedOptimizationId: initialOptimization?.id ?? "lod",
  selectedSecurityId: initialSecurity?.id ?? "",
  selectedTestId: initialTest?.id ?? "",
  runtimeSnapshot: null,
  runtimeTargets: ENTERPRISE_HARDENING_REPORT.performanceTargets,
  selectedReport: initialReport,
  selectedOptimization: initialOptimization,
  selectedSecurityControl: initialSecurity,
  selectedTestControl: initialTest,
  selectReportKind: (selectedReportKind) =>
    set({
      selectedReportKind,
      selectedReport: HARDENING_REPORT_ARTIFACTS.find((report) => report.kind === selectedReportKind) ?? null,
    }),
  selectOptimization: (selectedOptimizationId) =>
    set({
      selectedOptimizationId,
      selectedOptimization: HARDENING_OPTIMIZATION_CONTROLS.find((control) => control.id === selectedOptimizationId) ?? null,
    }),
  selectSecurityControl: (selectedSecurityId) =>
    set({
      selectedSecurityId,
      selectedSecurityControl: HARDENING_SECURITY_CONTROLS.find((control) => control.id === selectedSecurityId) ?? null,
    }),
  selectTestControl: (selectedTestId) =>
    set({
      selectedTestId,
      selectedTestControl: HARDENING_TEST_CONTROLS.find((control) => control.id === selectedTestId) ?? null,
    }),
  updateRuntimeSnapshot: (runtimeSnapshot) =>
    set({
      runtimeSnapshot,
      runtimeTargets: EvaluateRuntimePerformance(runtimeSnapshot),
    }),
}));
