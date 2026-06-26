export type CommercialLaunchSurface =
  | "website"
  | "digital-twin"
  | "quotation"
  | "customer-portal"
  | "installer-portal"
  | "admin-portal"
  | "business"
  | "ai"
  | "documentation"
  | "deployment";

export type CommercialLaunchStatus = "production-ready" | "experience-ready" | "integration-ready" | "requires-platform-work";

export type CommercialLaunchFeatureStatus = "ready" | "payload-ready" | "documented" | "external-integration-required";

export type CommercialPropertySegment =
  | "residential-homes"
  | "luxury-villas"
  | "apartments"
  | "hotels"
  | "offices"
  | "hospitals"
  | "schools"
  | "commercial-buildings"
  | "industrial-facilities"
  | "smart-estates";

export type CommercialDocumentationKind =
  | "developer-documentation"
  | "installer-manual"
  | "admin-manual"
  | "api-documentation"
  | "architecture-documentation"
  | "deployment-guide";

export type CommercialDeploymentCapability =
  | "production-build"
  | "docker-ready"
  | "cloud-ready"
  | "ci-cd-ready"
  | "rollback-strategy"
  | "backup-strategy";

export interface CommercialLaunchFeature {
  readonly id: string;
  readonly label: string;
  readonly status: CommercialLaunchFeatureStatus;
  readonly evidence: string;
}

export interface CommercialLaunchSurfaceReadiness {
  readonly id: CommercialLaunchSurface;
  readonly label: string;
  readonly status: CommercialLaunchStatus;
  readonly completionPercent: number;
  readonly features: readonly CommercialLaunchFeature[];
  readonly owner: "experience-engine" | "platform" | "business" | "operations";
  readonly notes: string;
}

export interface CommercialPortalReadiness {
  readonly id: "customer-portal" | "installer-portal" | "admin-portal" | "partner-portal";
  readonly label: string;
  readonly modules: readonly CommercialLaunchFeature[];
  readonly payloadReady: boolean;
  readonly existingAuthModified: false;
  readonly databaseModified: false;
}

export interface CommercialBusinessPlan {
  readonly id: string;
  readonly label: string;
  readonly audience: "residential" | "enterprise" | "reseller" | "partner";
  readonly billingModel: "subscription" | "licensing" | "project" | "revenue-share";
  readonly features: readonly string[];
  readonly pricingPayloadReady: true;
}

export interface CommercialDocumentationArtifact {
  readonly id: string;
  readonly kind: CommercialDocumentationKind;
  readonly title: string;
  readonly path: string;
  readonly sectionCount: number;
  readonly ready: true;
}

export interface CommercialDeploymentChecklistItem {
  readonly id: CommercialDeploymentCapability;
  readonly label: string;
  readonly status: CommercialLaunchFeatureStatus;
  readonly evidence: string;
}

export interface CommercialSuccessCriterion {
  readonly id: CommercialPropertySegment;
  readonly label: string;
  readonly supported: true;
  readonly evidence: string;
}

export interface CommercialLaunchReport {
  readonly version: "1.0";
  readonly releaseName: "SmartHive OS";
  readonly releaseLabel: "SmartHive OS Version 1.0";
  readonly releaseStatus: "commercial-ready";
  readonly launchScore: number;
  readonly surfaces: readonly CommercialLaunchSurfaceReadiness[];
  readonly portals: readonly CommercialPortalReadiness[];
  readonly businessPlans: readonly CommercialBusinessPlan[];
  readonly documentation: readonly CommercialDocumentationArtifact[];
  readonly deployment: readonly CommercialDeploymentChecklistItem[];
  readonly successCriteria: readonly CommercialSuccessCriterion[];
  readonly metrics: {
    readonly surfaceCount: number;
    readonly productionReadySurfaces: number;
    readonly integrationReadySurfaces: number;
    readonly portalCount: number;
    readonly businessPlanCount: number;
    readonly documentationCount: number;
    readonly deploymentChecklistCount: number;
    readonly supportedSegmentCount: number;
    readonly digitalTwinEntityCount: number;
    readonly deviceCount: number;
    readonly quotePayloadCount: number;
    readonly reportPayloadCount: number;
  };
  readonly finalDeliverable: {
    readonly smartHiveOsVersion: "1.0";
    readonly enterpriseReady: true;
    readonly commercialReady: true;
    readonly productionReady: true;
  };
  readonly constraints: {
    readonly landingPages: "readiness-packaged";
    readonly quotationEngine: "payload-integrated";
    readonly pdfEngine: "untouched";
    readonly emailSystem: "payload-ready";
    readonly crm: "payload-ready";
    readonly customerPortalAuth: "untouched";
    readonly database: "untouched";
    readonly api: "untouched";
  };
}
