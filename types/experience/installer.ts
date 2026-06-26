export type InstallerLifecycleStage =
  | "lead"
  | "quotation"
  | "approval"
  | "planning"
  | "installation"
  | "testing"
  | "handover"
  | "maintenance";

export type InstallerStageStatus = "complete" | "active" | "pending" | "blocked";
export type InstallerJobStatus = "scheduled" | "in-progress" | "blocked" | "ready-for-testing" | "handover-ready" | "maintenance";
export type InstallerTaskStatus = "pending" | "in-progress" | "complete" | "blocked";
export type InstallerTaskCategory = "survey" | "wiring" | "device-install" | "configuration" | "testing" | "handover" | "maintenance";
export type InstallerMaterialCategory = "device" | "cable" | "conduit" | "rack" | "switchgear" | "mounting" | "labour" | "consumable";
export type InstallerWarehouseStatus = "in-stock" | "low-stock" | "ordered" | "backordered";
export type InstallerWiringPlanType = "conduit-layout" | "cable-path" | "switch-location" | "rack-layout" | "power-requirement";
export type InstallerReportType = "installation-report" | "material-plan" | "wiring-plan" | "handover-pack" | "maintenance-plan";
export type InstallerPhotoCategory = "before" | "during" | "after" | "defect" | "handover";

export interface InstallerLifecycleStep {
  readonly stage: InstallerLifecycleStage;
  readonly label: string;
  readonly status: InstallerStageStatus;
  readonly ownerRole: "sales" | "project-manager" | "lead-installer" | "technician" | "support";
  readonly completionPercent: number;
}

export interface InstallerCrmUpdatePayload {
  readonly id: string;
  readonly customerId: string;
  readonly projectId: string;
  readonly propertyId: string;
  readonly lifecycleStage: InstallerLifecycleStage;
  readonly progressPercent: number;
  readonly nextAction: string;
  readonly crmUpdateReady: true;
  readonly externalCrmModified: false;
  readonly apiModified: false;
  readonly databaseModified: false;
}

export interface InstallerProjectWorkflow {
  readonly id: string;
  readonly projectId: string;
  readonly projectName: string;
  readonly customerId: string;
  readonly customerName: string;
  readonly propertyId: string;
  readonly propertyName: string;
  readonly currentStage: InstallerLifecycleStage;
  readonly progressPercent: number;
  readonly lifecycle: readonly InstallerLifecycleStep[];
  readonly crmUpdate: InstallerCrmUpdatePayload;
}

export interface InstallerScheduleItem {
  readonly id: string;
  readonly projectId: string;
  readonly label: string;
  readonly windowLabel: string;
  readonly assignedTeam: string;
  readonly status: InstallerJobStatus;
  readonly roomCount: number;
  readonly estimatedHours: number;
}

export interface InstallerTechnician {
  readonly id: string;
  readonly name: string;
  readonly role: "lead-installer" | "electrician" | "network-technician" | "security-technician" | "qa-engineer";
  readonly certifications: readonly string[];
  readonly assignedJobIds: readonly string[];
  readonly gpsCheckInReady: true;
}

export interface InstallerTask {
  readonly id: string;
  readonly projectId: string;
  readonly roomId: string | null;
  readonly roomName: string | null;
  readonly title: string;
  readonly category: InstallerTaskCategory;
  readonly status: InstallerTaskStatus;
  readonly priority: "low" | "medium" | "high" | "critical";
  readonly assignedTechnicianId: string;
  readonly estimatedHours: number;
  readonly notes: string;
}

export interface InstallerChecklistItem {
  readonly id: string;
  readonly label: string;
  readonly status: InstallerTaskStatus;
  readonly required: true;
}

export interface InstallerRoomChecklist {
  readonly id: string;
  readonly roomId: string;
  readonly roomName: string;
  readonly floorLevel: "ground" | "first";
  readonly requiredDeviceIds: readonly string[];
  readonly requiredDeviceCount: number;
  readonly requiredMaterials: readonly string[];
  readonly cableRuns: number;
  readonly labourHours: number;
  readonly installationNotes: readonly string[];
  readonly checklistItems: readonly InstallerChecklistItem[];
}

export interface InstallerWiringPlannerItem {
  readonly id: string;
  readonly projectId: string;
  readonly roomId: string | null;
  readonly roomName: string | null;
  readonly type: InstallerWiringPlanType;
  readonly label: string;
  readonly source: readonly [number, number, number];
  readonly target: readonly [number, number, number];
  readonly lengthMeters: number;
  readonly conduitSizeMm: number;
  readonly cableType: "cat6a" | "speaker" | "knx-bus" | "low-voltage" | "mains" | "fiber";
  readonly switchLocations: number;
  readonly rackUnits: number;
  readonly powerWatts: number;
  readonly futureReady: true;
}

export interface InstallerMaterialLineItem {
  readonly id: string;
  readonly category: InstallerMaterialCategory;
  readonly sku: string;
  readonly name: string;
  readonly quantity: number;
  readonly unitCost: number;
  readonly supplierCost: number;
  readonly retailCost: number;
  readonly profitMarginPercent: number;
  readonly warehouseStatus: InstallerWarehouseStatus;
  readonly purchaseRequired: boolean;
  readonly linkedRoomIds: readonly string[];
}

export interface InstallerPhotoRecord {
  readonly id: string;
  readonly projectId: string;
  readonly roomId: string | null;
  readonly category: InstallerPhotoCategory;
  readonly label: string;
  readonly uploadReady: true;
  readonly storageMode: "placeholder-metadata";
}

export interface InstallerQrRegistration {
  readonly id: string;
  readonly deviceId: string;
  readonly roomId: string;
  readonly qrPayload: string;
  readonly registrationReady: true;
  readonly physicalDeviceBound: false;
}

export interface InstallerCompletionSignOff {
  readonly id: string;
  readonly projectId: string;
  readonly requiredApprovals: readonly string[];
  readonly signedOffCount: number;
  readonly handoverReady: boolean;
  readonly signatureCaptureReady: true;
}

export interface InstallerTechnicianAppProfile {
  readonly qrCodeCount: number;
  readonly deviceRegistrationReady: true;
  readonly photoUploadReady: true;
  readonly gpsCheckInReady: true;
  readonly completionSignOffReady: true;
  readonly nativeAppFutureReady: true;
}

export interface InstallerReportArtifact {
  readonly id: string;
  readonly type: InstallerReportType;
  readonly title: string;
  readonly description: string;
  readonly itemCount: number;
  readonly ready: true;
}

export interface InstallerDashboardSummary {
  readonly projectCount: number;
  readonly scheduleCount: number;
  readonly taskCount: number;
  readonly assignedJobCount: number;
  readonly photoCount: number;
  readonly averageProgressPercent: number;
  readonly completionPercent: number;
}

export interface InstallerPlatformReport {
  readonly dashboard: InstallerDashboardSummary;
  readonly lifecycleStageCount: number;
  readonly roomChecklistCount: number;
  readonly wiringPlanCount: number;
  readonly materialLineCount: number;
  readonly billOfMaterialsCost: number;
  readonly purchaseListCost: number;
  readonly supplierCost: number;
  readonly projectedProfit: number;
  readonly averageProfitMarginPercent: number;
  readonly technicianApp: InstallerTechnicianAppProfile;
  readonly reportCount: number;
  readonly crmUpdatePayload: InstallerCrmUpdatePayload;
  readonly capabilities: {
    readonly installerDashboard: true;
    readonly projectWorkflow: true;
    readonly roomInstallationMode: true;
    readonly wiringPlanner: true;
    readonly materialPlanner: true;
    readonly technicianAppReady: true;
    readonly installationReports: true;
    readonly crmUpdatePayloadReady: true;
  };
  readonly constraints: {
    readonly externalCrm: "payload-only";
    readonly api: "untouched";
    readonly database: "untouched";
    readonly authentication: "untouched";
    readonly existingWebsiteFunctionality: "untouched";
  };
}
