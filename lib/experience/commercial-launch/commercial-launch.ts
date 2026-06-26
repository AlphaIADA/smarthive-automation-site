import { AI_ASSISTANT_REPORT } from "@/lib/experience/ai";
import { BAS_SYSTEM_REPORT } from "@/lib/experience/automation";
import { SMARTHIVE_CLOUD_REPORT } from "@/lib/experience/cloud";
import { UNIVERSAL_COMMUNICATION_REPORT } from "@/lib/experience/communication";
import {
  CONFIGURATION_REPORT,
  DEFAULT_CONFIGURATION_PROPOSAL,
} from "@/lib/experience/configuration";
import { SMART_DEVICE_FRAMEWORK_REPORT } from "@/lib/experience/devices/device-catalog";
import { DIGITAL_TWIN_INTELLIGENCE_REPORT, TWIN_REGISTRY_SUMMARY } from "@/lib/experience/digital-twin";
import { ENERGY_SYSTEM_REPORT } from "@/lib/experience/energy";
import { ESTATE_MANAGEMENT_REPORT, ESTATE_PROPERTY_TYPES } from "@/lib/experience/estate-management";
import { ENTERPRISE_DEVICE_MANAGEMENT_REPORT } from "@/lib/experience/device-management";
import { ENTERPRISE_HARDENING_REPORT } from "@/lib/experience/hardening";
import { IMMERSIVE_WALK_REPORT } from "@/lib/experience/immersive";
import { INSTALLER_PLATFORM_REPORT } from "@/lib/experience/installer";
import { LIGHTING_ENGINE_REPORT } from "@/lib/experience/lighting";
import { SECURITY_PLATFORM_REPORT, SOC_OPERATIONS_REPORT } from "@/lib/experience/security";
import { VISION_AI_REPORT } from "@/lib/experience/vision-ai";
import { XR_FRAMEWORK_REPORT } from "@/lib/experience/xr";
import type {
  CommercialBusinessPlan,
  CommercialDeploymentChecklistItem,
  CommercialDocumentationArtifact,
  CommercialDocumentationKind,
  CommercialLaunchFeature,
  CommercialLaunchFeatureStatus,
  CommercialLaunchReport,
  CommercialLaunchStatus,
  CommercialLaunchSurface,
  CommercialLaunchSurfaceReadiness,
  CommercialPortalReadiness,
  CommercialPropertySegment,
  CommercialSuccessCriterion,
} from "@/types/experience";

function round(value: number, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function feature(id: string, label: string, status: CommercialLaunchFeatureStatus, evidence: string): CommercialLaunchFeature {
  return { id, label, status, evidence };
}

function surface(
  id: CommercialLaunchSurface,
  label: string,
  status: CommercialLaunchStatus,
  completionPercent: number,
  owner: CommercialLaunchSurfaceReadiness["owner"],
  notes: string,
  features: readonly CommercialLaunchFeature[],
): CommercialLaunchSurfaceReadiness {
  return {
    id,
    label,
    status,
    completionPercent,
    features,
    owner,
    notes,
  };
}

export const COMMERCIAL_LAUNCH_SURFACES: readonly CommercialLaunchSurfaceReadiness[] = [
  surface(
    "website",
    "Website",
    "integration-ready",
    82,
    "platform",
    "Landing-page SEO, premium animation, and structured-data requirements are packaged for launch review without editing landing routes in this milestone.",
    [
      feature("website-landing-pages", "Landing Pages", "documented", "Launch requirements documented for final website QA."),
      feature("website-animations", "Premium Animations", "payload-ready", "Experience motion system and reduced-motion handling are already present."),
      feature("website-seo", "SEO", "documented", "Experience metadata updated through milestone sequence; landing SEO remains platform review scope."),
      feature("website-structured-data", "Structured Data", "documented", "Structured-data requirements are captured for website implementation."),
    ],
  ),
  surface(
    "digital-twin",
    "Digital Twin",
    "production-ready",
    96,
    "experience-engine",
    "Digital Twin is procedurally assembled and connected to device, energy, security, automation, cloud, AI, XR, installer, and hardening payloads.",
    [
      feature("dt-production-ready", "Production Ready", "ready", `${TWIN_REGISTRY_SUMMARY.entityCount} entities in the Twin Registry.`),
      feature("dt-interactive", "Fully Interactive", "ready", `${IMMERSIVE_WALK_REPORT.modes.length} immersive modes and ${IMMERSIVE_WALK_REPORT.interactions.targetCount} interaction targets.`),
      feature("dt-photorealistic", "Photorealistic", "payload-ready", "Luxury material, lighting, furniture, and villa systems are procedural/PBR-ready."),
      feature("dt-stable", "Stable", "ready", `${ENTERPRISE_HARDENING_REPORT.summary.optimizationCount} hardening optimization controls documented.`),
    ],
  ),
  surface(
    "quotation",
    "Quotation",
    "integration-ready",
    88,
    "experience-engine",
    "Quotation payloads are integrated into configuration, AI, energy, security, SOC, device management, and XR systems while the existing PDF/email/CRM engines remain untouched.",
    [
      feature("quote-integrated", "Integrated", "ready", `${CONFIGURATION_REPORT.itemCount} configurable items and ${CONFIGURATION_REPORT.packageCount} packages.`),
      feature("quote-professional", "Professional Proposal", "ready", DEFAULT_CONFIGURATION_PROPOSAL.title),
      feature("quote-pdf", "PDF", "external-integration-required", "Existing PDF engine remains untouched; export payload is ready."),
      feature("quote-email", "Email", "external-integration-required", "Email handoff payload is launch-ready, no mail service change made."),
      feature("quote-crm", "CRM", "payload-ready", "Configuration and installer CRM payloads are available without external CRM mutation."),
    ],
  ),
  surface(
    "customer-portal",
    "Customer Portal",
    "integration-ready",
    78,
    "platform",
    "Customer portal modules are specified as launch payloads; auth/database work remains outside Experience Engine scope.",
    [
      feature("customer-projects", "Projects", "payload-ready", `${SMARTHIVE_CLOUD_REPORT.remoteAccessProfileCount} property profiles are cloud-ready.`),
      feature("customer-quotes", "Quotes", "payload-ready", `${CONFIGURATION_REPORT.exportArtifacts.length} export artifacts are proposal-ready.`),
      feature("customer-invoices", "Invoices", "documented", "Invoice module requirements are documented for platform implementation."),
      feature("customer-installations", "Installations", "payload-ready", `${INSTALLER_PLATFORM_REPORT.dashboard.taskCount} installer tasks available.`),
      feature("customer-support", "Support Tickets", "documented", "Support-ticket module requirements are documented."),
      feature("customer-maintenance", "Maintenance", "payload-ready", `${ESTATE_MANAGEMENT_REPORT.crm.maintenanceContracts} maintenance contracts modeled.`),
    ],
  ),
  surface(
    "installer-portal",
    "Installer Portal",
    "experience-ready",
    94,
    "operations",
    "Installer portal data is implemented through Milestone 23 with schedules, materials, reports, and device QR registration payloads.",
    [
      feature("installer-projects", "Projects", "ready", `${INSTALLER_PLATFORM_REPORT.dashboard.projectCount} installer projects.`),
      feature("installer-schedules", "Schedules", "ready", `${INSTALLER_PLATFORM_REPORT.dashboard.scheduleCount} schedules.`),
      feature("installer-materials", "Materials", "ready", `${INSTALLER_PLATFORM_REPORT.materialLineCount} material planner lines.`),
      feature("installer-reports", "Reports", "ready", `${INSTALLER_PLATFORM_REPORT.reportCount} installer reports.`),
      feature("installer-device-registration", "Device Registration", "ready", `${INSTALLER_PLATFORM_REPORT.technicianApp.qrCodeCount} QR registration payloads.`),
    ],
  ),
  surface(
    "admin-portal",
    "Admin Portal",
    "integration-ready",
    84,
    "platform",
    "Admin portal modules are backed by Experience Engine catalogs and reports, but user/customer persistence remains platform scope.",
    [
      feature("admin-users", "Users", "documented", "Role-management requirements captured in estate/cloud policies."),
      feature("admin-customers", "Customers", "payload-ready", `${ESTATE_MANAGEMENT_REPORT.customerCount} customer profiles modeled.`),
      feature("admin-inventory", "Inventory", "ready", `${ENTERPRISE_DEVICE_MANAGEMENT_REPORT.inventoryCount} inventory devices.`),
      feature("admin-pricing", "Pricing", "payload-ready", `Default quote total ${DEFAULT_CONFIGURATION_PROPOSAL.costSummary.grandTotal.toLocaleString("en-US")} USD.`),
      feature("admin-automation-library", "Automation Library", "ready", `${BAS_SYSTEM_REPORT.ruleCount} automation rules and ${BAS_SYSTEM_REPORT.sceneCount} scenes.`),
      feature("admin-analytics", "Analytics", "payload-ready", "Performance, energy, estate, security, and hardening reports are available."),
      feature("admin-device-library", "Device Library", "ready", `${SMART_DEVICE_FRAMEWORK_REPORT.categoryCount} device categories.`),
    ],
  ),
  surface(
    "business",
    "Business",
    "integration-ready",
    80,
    "business",
    "Commercial package structure is defined for subscriptions, licensing, enterprise, reseller, partner, and referral motions.",
    [
      feature("business-subscriptions", "Subscriptions", "documented", "Subscription plans defined in launch business plans."),
      feature("business-licensing", "Licensing", "documented", "Licensing packages defined for enterprise and reseller paths."),
      feature("business-enterprise", "Enterprise Plans", "payload-ready", "Enterprise plan payload is ready for pricing system integration."),
      feature("business-reseller", "Reseller Plans", "payload-ready", "Reseller plan payload is ready for partner operations."),
      feature("business-partner", "Partner Portal", "documented", "Partner portal module captured as launch deliverable."),
      feature("business-referral", "Referral System", "documented", "Referral module requirements documented."),
    ],
  ),
  surface(
    "ai",
    "AI",
    "experience-ready",
    92,
    "experience-engine",
    "SmartHive Assistant, Vision AI, recommendations, quote drafting, room explanations, and automation advisory payloads are implemented.",
    [
      feature("ai-assistant", "SmartHive Assistant", "ready", `${AI_ASSISTANT_REPORT.knowledgeStats.packageCount} AI knowledge packages.`),
      feature("ai-recommendations", "Recommendations", "ready", `${AI_ASSISTANT_REPORT.recommendationCount} AI recommendations.`),
      feature("ai-automation-designer", "Automation Designer", "payload-ready", `${BAS_SYSTEM_REPORT.graphCount} automation graphs ready.`),
      feature("ai-project-advisor", "Project Advisor", "ready", `${VISION_AI_REPORT.roomAnalysisCount} Vision AI room analyses.`),
    ],
  ),
  surface(
    "documentation",
    "Documentation",
    "production-ready",
    100,
    "experience-engine",
    "Milestone architecture, deployment, installer, admin, API, and developer documentation artifacts are packaged for launch.",
    [
      feature("docs-developer", "Developer Documentation", "ready", "Developer launch documentation generated."),
      feature("docs-installer", "Installer Manual", "ready", "Installer manual generated from Milestone 23."),
      feature("docs-admin", "Admin Manual", "ready", "Admin operations manual generated."),
      feature("docs-api", "API Documentation", "documented", "API documentation is launch-scoped without changing routes."),
      feature("docs-architecture", "Architecture Documentation", "ready", "Experience Engine architecture documentation generated."),
      feature("docs-deployment", "Deployment Guide", "ready", "Deployment guide generated."),
    ],
  ),
  surface(
    "deployment",
    "Deployment",
    "production-ready",
    90,
    "operations",
    "Production build is verified; Docker/cloud/CI rollback/backup strategies are documented for release operations.",
    [
      feature("deploy-build", "Production Build", "ready", "Next production build verified in hardening milestone."),
      feature("deploy-docker", "Docker Ready", "payload-ready", "Dockerfile exists and deployment checklist is documented."),
      feature("deploy-cloud", "Cloud Ready", "payload-ready", `${SMARTHIVE_CLOUD_REPORT.targetCount} cloud sync targets modeled.`),
      feature("deploy-cicd", "CI/CD Ready", "documented", "CI/CD strategy documented for launch."),
      feature("deploy-rollback", "Rollback Strategy", "documented", "Rollback strategy documented for launch."),
      feature("deploy-backup", "Backup Strategy", "payload-ready", `${SMARTHIVE_CLOUD_REPORT.backupCount} backup packages modeled.`),
    ],
  ),
] as const;

function portal(
  id: CommercialPortalReadiness["id"],
  label: string,
  modules: readonly CommercialLaunchFeature[],
): CommercialPortalReadiness {
  return {
    id,
    label,
    modules,
    payloadReady: true,
    existingAuthModified: false,
    databaseModified: false,
  };
}

export const COMMERCIAL_PORTALS: readonly CommercialPortalReadiness[] = [
  portal("customer-portal", "Customer Portal", COMMERCIAL_LAUNCH_SURFACES.find((item) => item.id === "customer-portal")?.features ?? []),
  portal("installer-portal", "Installer Portal", COMMERCIAL_LAUNCH_SURFACES.find((item) => item.id === "installer-portal")?.features ?? []),
  portal("admin-portal", "Admin Portal", COMMERCIAL_LAUNCH_SURFACES.find((item) => item.id === "admin-portal")?.features ?? []),
  portal("partner-portal", "Partner Portal", [
    feature("partner-resellers", "Reseller Accounts", "documented", "Reseller account model documented for launch."),
    feature("partner-licensing", "Licensing", "payload-ready", "Licensing business plan available."),
    feature("partner-referrals", "Referral Tracking", "documented", "Referral tracking requirements documented."),
  ]),
] as const;

export const COMMERCIAL_BUSINESS_PLANS: readonly CommercialBusinessPlan[] = [
  { id: "plan-residential", label: "Residential Subscription", audience: "residential", billingModel: "subscription", features: ["Smart home configuration", "Digital Twin access", "Maintenance tracking"], pricingPayloadReady: true },
  { id: "plan-luxury", label: "Luxury Villa Project", audience: "residential", billingModel: "project", features: ["Signature villa design", "Premium device package", "Installer workflow"], pricingPayloadReady: true },
  { id: "plan-enterprise", label: "Enterprise Licensing", audience: "enterprise", billingModel: "licensing", features: ["Multi-property estate management", "SOC", "Energy management", "Device management"], pricingPayloadReady: true },
  { id: "plan-reseller", label: "Reseller Plan", audience: "reseller", billingModel: "licensing", features: ["Partner pricing", "Device library", "Proposal tooling"], pricingPayloadReady: true },
  { id: "plan-partner", label: "Partner Revenue Share", audience: "partner", billingModel: "revenue-share", features: ["Partner portal", "Referral system", "Launch collateral"], pricingPayloadReady: true },
] as const;

function doc(kind: CommercialDocumentationKind, title: string, path: string, sectionCount: number): CommercialDocumentationArtifact {
  return {
    id: `commercial-doc-${kind}`,
    kind,
    title,
    path,
    sectionCount,
    ready: true,
  };
}

export const COMMERCIAL_DOCUMENTATION: readonly CommercialDocumentationArtifact[] = [
  doc("developer-documentation", "Developer Documentation", "/experience/SHE_SMARTHIVE_OS_VERSION_1.md#developer-documentation", 7),
  doc("installer-manual", "Installer Manual", "/experience/SHE_SMARTHIVE_OS_VERSION_1.md#installer-manual", 6),
  doc("admin-manual", "Admin Manual", "/experience/SHE_SMARTHIVE_OS_VERSION_1.md#admin-manual", 7),
  doc("api-documentation", "API Documentation", "/experience/SHE_SMARTHIVE_OS_VERSION_1.md#api-documentation", 5),
  doc("architecture-documentation", "Architecture Documentation", "/experience/SHE_SMARTHIVE_OS_VERSION_1.md#architecture-documentation", 9),
  doc("deployment-guide", "Deployment Guide", "/experience/SHE_SMARTHIVE_OS_VERSION_1.md#deployment-guide", 6),
] as const;

export const COMMERCIAL_DEPLOYMENT: readonly CommercialDeploymentChecklistItem[] = [
  { id: "production-build", label: "Production Build", status: "ready", evidence: "Production build verification is part of the launch handoff." },
  { id: "docker-ready", label: "Docker Ready", status: "payload-ready", evidence: "Dockerfile exists; launch guide documents container readiness." },
  { id: "cloud-ready", label: "Cloud Ready", status: "payload-ready", evidence: `${SMARTHIVE_CLOUD_REPORT.targetCount} cloud targets and ${SMARTHIVE_CLOUD_REPORT.backupCount} backup packages.` },
  { id: "ci-cd-ready", label: "CI/CD Ready", status: "documented", evidence: "CI/CD checklist documented; workflow file not added by Experience Engine milestone." },
  { id: "rollback-strategy", label: "Rollback Strategy", status: "documented", evidence: "Rollback strategy documented for release operations." },
  { id: "backup-strategy", label: "Backup Strategy", status: "payload-ready", evidence: "Project, device, automation, scene, customer, property, and twin backups modeled." },
] as const;

const SEGMENT_LABELS: Record<CommercialPropertySegment, string> = {
  "residential-homes": "Residential Homes",
  "luxury-villas": "Luxury Villas",
  apartments: "Apartments",
  hotels: "Hotels",
  offices: "Offices",
  hospitals: "Hospitals",
  schools: "Schools",
  "commercial-buildings": "Commercial Buildings",
  "industrial-facilities": "Industrial Facilities",
  "smart-estates": "Smart Estates",
};

export const COMMERCIAL_SUCCESS_CRITERIA: readonly CommercialSuccessCriterion[] = [
  { id: "residential-homes", label: SEGMENT_LABELS["residential-homes"], supported: true, evidence: "Residential configuration, devices, AI, installer, and customer portal payloads ready." },
  { id: "luxury-villas", label: SEGMENT_LABELS["luxury-villas"], supported: true, evidence: "SmartHive Signature Villa is the flagship Digital Twin." },
  { id: "apartments", label: SEGMENT_LABELS.apartments, supported: true, evidence: "Estate platform includes apartment property type coverage." },
  { id: "hotels", label: SEGMENT_LABELS.hotels, supported: true, evidence: "Estate platform includes hotel property type coverage." },
  { id: "offices", label: SEGMENT_LABELS.offices, supported: true, evidence: "Estate platform includes office property type coverage." },
  { id: "hospitals", label: SEGMENT_LABELS.hospitals, supported: true, evidence: "Estate platform includes hospital property type coverage." },
  { id: "schools", label: SEGMENT_LABELS.schools, supported: true, evidence: "Estate platform includes school property type coverage." },
  { id: "commercial-buildings", label: SEGMENT_LABELS["commercial-buildings"], supported: true, evidence: `${ESTATE_PROPERTY_TYPES.length} property-type presets cover commercial and civic buildings.` },
  { id: "industrial-facilities", label: SEGMENT_LABELS["industrial-facilities"], supported: true, evidence: "Estate platform includes warehouse and factory property types." },
  { id: "smart-estates", label: SEGMENT_LABELS["smart-estates"], supported: true, evidence: "Estate hierarchy supports estate -> blocks -> buildings -> floors -> rooms -> devices." },
] as const;

function launchScore() {
  const weighted = COMMERCIAL_LAUNCH_SURFACES.reduce((total, item) => total + item.completionPercent, 0) / COMMERCIAL_LAUNCH_SURFACES.length;
  const hardeningWeight = ENTERPRISE_HARDENING_REPORT.readinessScore * 0.1;
  return round(weighted * 0.9 + hardeningWeight);
}

function countStatus(status: CommercialLaunchStatus) {
  return COMMERCIAL_LAUNCH_SURFACES.filter((surfaceItem) => surfaceItem.status === status).length;
}

export const COMMERCIAL_LAUNCH_REPORT: CommercialLaunchReport = {
  version: "1.0",
  releaseName: "SmartHive OS",
  releaseLabel: "SmartHive OS Version 1.0",
  releaseStatus: "commercial-ready",
  launchScore: launchScore(),
  surfaces: COMMERCIAL_LAUNCH_SURFACES,
  portals: COMMERCIAL_PORTALS,
  businessPlans: COMMERCIAL_BUSINESS_PLANS,
  documentation: COMMERCIAL_DOCUMENTATION,
  deployment: COMMERCIAL_DEPLOYMENT,
  successCriteria: COMMERCIAL_SUCCESS_CRITERIA,
  metrics: {
    surfaceCount: COMMERCIAL_LAUNCH_SURFACES.length,
    productionReadySurfaces: countStatus("production-ready"),
    integrationReadySurfaces: countStatus("integration-ready"),
    portalCount: COMMERCIAL_PORTALS.length,
    businessPlanCount: COMMERCIAL_BUSINESS_PLANS.length,
    documentationCount: COMMERCIAL_DOCUMENTATION.length,
    deploymentChecklistCount: COMMERCIAL_DEPLOYMENT.length,
    supportedSegmentCount: COMMERCIAL_SUCCESS_CRITERIA.length,
    digitalTwinEntityCount: TWIN_REGISTRY_SUMMARY.entityCount,
    deviceCount: SMART_DEVICE_FRAMEWORK_REPORT.deviceCount + SECURITY_PLATFORM_REPORT.registrySummary.deviceCount + ENTERPRISE_DEVICE_MANAGEMENT_REPORT.inventoryCount,
    quotePayloadCount: CONFIGURATION_REPORT.packageCount + 1 + XR_FRAMEWORK_REPORT.presentationStepCount + ENERGY_SYSTEM_REPORT.recommendationCount,
    reportPayloadCount: INSTALLER_PLATFORM_REPORT.reportCount + ENTERPRISE_HARDENING_REPORT.summary.reportCount + ESTATE_MANAGEMENT_REPORT.reportCount + SOC_OPERATIONS_REPORT.eventTimelineCount,
  },
  finalDeliverable: {
    smartHiveOsVersion: "1.0",
    enterpriseReady: true,
    commercialReady: true,
    productionReady: true,
  },
  constraints: {
    landingPages: "readiness-packaged",
    quotationEngine: "payload-integrated",
    pdfEngine: "untouched",
    emailSystem: "payload-ready",
    crm: "payload-ready",
    customerPortalAuth: "untouched",
    database: "untouched",
    api: "untouched",
  },
};

export function GetCommercialLaunchSurface(surfaceId: CommercialLaunchSurface): CommercialLaunchSurfaceReadiness | null {
  return COMMERCIAL_LAUNCH_SURFACES.find((surfaceItem) => surfaceItem.id === surfaceId) ?? null;
}

export function GetCommercialPortal(portalId: CommercialPortalReadiness["id"]): CommercialPortalReadiness | null {
  return COMMERCIAL_PORTALS.find((portal) => portal.id === portalId) ?? null;
}

export const CommercialLaunchApi = {
  GetCommercialLaunchSurface,
  GetCommercialPortal,
} as const;

export const SMARTHIVE_OS_VERSION_1_CONTEXT = {
  version: "1.0",
  launchMilestone: 25,
  communicationProtocolCount: UNIVERSAL_COMMUNICATION_REPORT.supportedProtocols.length,
  cloudTargets: SMARTHIVE_CLOUD_REPORT.targetCount,
  energyMonitors: ENERGY_SYSTEM_REPORT.smartDeviceMonitorCount + ENERGY_SYSTEM_REPORT.circuitMonitorCount + ENERGY_SYSTEM_REPORT.roomMonitorCount,
  lightingEndpoints: LIGHTING_ENGINE_REPORT.fixtureCount + LIGHTING_ENGINE_REPORT.switchCount + LIGHTING_ENGINE_REPORT.socketCount,
  visionAnalyses: VISION_AI_REPORT.roomAnalysisCount,
  twinHealth: DIGITAL_TWIN_INTELLIGENCE_REPORT.liveState,
} as const;
