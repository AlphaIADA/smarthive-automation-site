import { create } from "zustand";
import {
  COMMERCIAL_BUSINESS_PLANS,
  COMMERCIAL_DEPLOYMENT,
  COMMERCIAL_DOCUMENTATION,
  COMMERCIAL_LAUNCH_REPORT,
  COMMERCIAL_PORTALS,
  COMMERCIAL_SUCCESS_CRITERIA,
  GetCommercialLaunchSurface,
  GetCommercialPortal,
} from "@/lib/experience/commercial-launch";
import type {
  CommercialBusinessPlan,
  CommercialDeploymentChecklistItem,
  CommercialDocumentationArtifact,
  CommercialDocumentationKind,
  CommercialLaunchSurface,
  CommercialLaunchSurfaceReadiness,
  CommercialPortalReadiness,
  CommercialPropertySegment,
  CommercialSuccessCriterion,
} from "@/types/experience";

interface CommercialLaunchStoreState {
  selectedSurfaceId: CommercialLaunchSurface;
  selectedPortalId: CommercialPortalReadiness["id"];
  selectedBusinessPlanId: string;
  selectedDocumentationKind: CommercialDocumentationKind;
  selectedDeploymentId: CommercialDeploymentChecklistItem["id"];
  selectedSegmentId: CommercialPropertySegment;
  selectedSurface: CommercialLaunchSurfaceReadiness | null;
  selectedPortal: CommercialPortalReadiness | null;
  selectedBusinessPlan: CommercialBusinessPlan | null;
  selectedDocumentation: CommercialDocumentationArtifact | null;
  selectedDeployment: CommercialDeploymentChecklistItem | null;
  selectedSegment: CommercialSuccessCriterion | null;
  selectSurface: (surfaceId: CommercialLaunchSurface) => void;
  selectPortal: (portalId: CommercialPortalReadiness["id"]) => void;
  selectBusinessPlan: (planId: string) => void;
  selectDocumentation: (kind: CommercialDocumentationKind) => void;
  selectDeployment: (deploymentId: CommercialDeploymentChecklistItem["id"]) => void;
  selectSegment: (segmentId: CommercialPropertySegment) => void;
}

const initialSurface = COMMERCIAL_LAUNCH_REPORT.surfaces[0] ?? null;
const initialPortal = COMMERCIAL_PORTALS[0] ?? null;
const initialBusinessPlan = COMMERCIAL_BUSINESS_PLANS[0] ?? null;
const initialDocumentation = COMMERCIAL_DOCUMENTATION[0] ?? null;
const initialDeployment = COMMERCIAL_DEPLOYMENT[0] ?? null;
const initialSegment = COMMERCIAL_SUCCESS_CRITERIA[0] ?? null;

export const useCommercialLaunchStore = create<CommercialLaunchStoreState>((set) => ({
  selectedSurfaceId: initialSurface?.id ?? "website",
  selectedPortalId: initialPortal?.id ?? "customer-portal",
  selectedBusinessPlanId: initialBusinessPlan?.id ?? "",
  selectedDocumentationKind: initialDocumentation?.kind ?? "developer-documentation",
  selectedDeploymentId: initialDeployment?.id ?? "production-build",
  selectedSegmentId: initialSegment?.id ?? "residential-homes",
  selectedSurface: initialSurface,
  selectedPortal: initialPortal,
  selectedBusinessPlan: initialBusinessPlan,
  selectedDocumentation: initialDocumentation,
  selectedDeployment: initialDeployment,
  selectedSegment: initialSegment,
  selectSurface: (selectedSurfaceId) =>
    set({
      selectedSurfaceId,
      selectedSurface: GetCommercialLaunchSurface(selectedSurfaceId),
    }),
  selectPortal: (selectedPortalId) =>
    set({
      selectedPortalId,
      selectedPortal: GetCommercialPortal(selectedPortalId),
    }),
  selectBusinessPlan: (selectedBusinessPlanId) =>
    set({
      selectedBusinessPlanId,
      selectedBusinessPlan: COMMERCIAL_BUSINESS_PLANS.find((plan) => plan.id === selectedBusinessPlanId) ?? null,
    }),
  selectDocumentation: (selectedDocumentationKind) =>
    set({
      selectedDocumentationKind,
      selectedDocumentation: COMMERCIAL_DOCUMENTATION.find((doc) => doc.kind === selectedDocumentationKind) ?? null,
    }),
  selectDeployment: (selectedDeploymentId) =>
    set({
      selectedDeploymentId,
      selectedDeployment: COMMERCIAL_DEPLOYMENT.find((item) => item.id === selectedDeploymentId) ?? null,
    }),
  selectSegment: (selectedSegmentId) =>
    set({
      selectedSegmentId,
      selectedSegment: COMMERCIAL_SUCCESS_CRITERIA.find((criterion) => criterion.id === selectedSegmentId) ?? null,
    }),
}));
