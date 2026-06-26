import {
  DEFAULT_CONFIGURATION_CRM_LEAD,
  DEFAULT_CONFIGURATION_PROPOSAL,
} from "@/lib/experience/configuration";
import { SMART_DEVICES } from "@/lib/experience/devices/device-catalog";
import { INTERIOR_ROOMS } from "@/lib/experience/interior/room-registry";
import { ELECTRICAL_SOCKETS, ELECTRICAL_SWITCHES, LIGHTING_FIXTURES, LIGHTING_POWER_SUMMARY } from "@/lib/experience/lighting/lighting-catalog";
import { ESTATE_CUSTOMERS, ESTATE_PROPERTIES } from "@/lib/experience/estate-management";
import type {
  InstallerChecklistItem,
  InstallerCompletionSignOff,
  InstallerCrmUpdatePayload,
  InstallerDashboardSummary,
  InstallerLifecycleStage,
  InstallerLifecycleStep,
  InstallerMaterialCategory,
  InstallerMaterialLineItem,
  InstallerPhotoRecord,
  InstallerProjectWorkflow,
  InstallerQrRegistration,
  InstallerReportArtifact,
  InstallerReportType,
  InstallerRoomChecklist,
  InstallerScheduleItem,
  InstallerStageStatus,
  InstallerTask,
  InstallerTaskCategory,
  InstallerTaskStatus,
  InstallerTechnician,
  InstallerWarehouseStatus,
  InstallerWiringPlanType,
  InstallerWiringPlannerItem,
  InstallerPlatformReport,
} from "@/types/experience";

const LIFECYCLE_STAGES: readonly InstallerLifecycleStage[] = ["lead", "quotation", "approval", "planning", "installation", "testing", "handover", "maintenance"] as const;
const PRIMARY_PROPERTY = ESTATE_PROPERTIES.find((property) => property.id === "property-signature-villa") ?? ESTATE_PROPERTIES[0];
const PRIMARY_CUSTOMER = ESTATE_CUSTOMERS.find((customer) => customer.id === PRIMARY_PROPERTY.customerId) ?? ESTATE_CUSTOMERS[0];
const PRIMARY_PROJECT_ID = "installer-project-signature-villa";

function round(value: number, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function label(value: string) {
  return value.replace(/-/g, " ");
}

function roomCenter(roomId: string): readonly [number, number, number] {
  const room = INTERIOR_ROOMS.find((candidate) => candidate.id === roomId);
  if (!room) return [0, 0, 0] as const;
  return [
    round((room.boundingBox.min.x + room.boundingBox.max.x) / 2),
    round((room.boundingBox.min.y + room.boundingBox.max.y) / 2),
    round((room.boundingBox.min.z + room.boundingBox.max.z) / 2),
  ] as const;
}

function stageStatus(stage: InstallerLifecycleStage, currentStage: InstallerLifecycleStage): InstallerStageStatus {
  const currentIndex = LIFECYCLE_STAGES.indexOf(currentStage);
  const stageIndex = LIFECYCLE_STAGES.indexOf(stage);
  if (stageIndex < currentIndex) return "complete";
  if (stageIndex === currentIndex) return "active";
  return "pending";
}

function stageOwner(stage: InstallerLifecycleStage): InstallerLifecycleStep["ownerRole"] {
  if (stage === "lead" || stage === "quotation" || stage === "approval") return "sales";
  if (stage === "planning") return "project-manager";
  if (stage === "installation") return "lead-installer";
  if (stage === "testing" || stage === "handover") return "technician";
  return "support";
}

function lifecycle(currentStage: InstallerLifecycleStage): readonly InstallerLifecycleStep[] {
  return LIFECYCLE_STAGES.map((stage) => {
    const status = stageStatus(stage, currentStage);
    return {
      stage,
      label: label(stage),
      status,
      ownerRole: stageOwner(stage),
      completionPercent: status === "complete" ? 100 : status === "active" ? 62 : 0,
    };
  });
}

function crmUpdate(projectId: string, currentStage: InstallerLifecycleStage, progressPercent: number): InstallerCrmUpdatePayload {
  return {
    id: `crm-update-${projectId}`,
    customerId: PRIMARY_CUSTOMER.id,
    projectId,
    propertyId: PRIMARY_PROPERTY.id,
    lifecycleStage: currentStage,
    progressPercent,
    nextAction: "Installer progress payload ready for future CRM synchronization.",
    crmUpdateReady: true,
    externalCrmModified: false,
    apiModified: false,
    databaseModified: false,
  };
}

function workflow(projectId: string, currentStage: InstallerLifecycleStage, progressPercent: number): InstallerProjectWorkflow {
  return {
    id: `workflow-${projectId}`,
    projectId,
    projectName: "SmartHive Signature Villa Installation",
    customerId: PRIMARY_CUSTOMER.id,
    customerName: PRIMARY_CUSTOMER.name,
    propertyId: PRIMARY_PROPERTY.id,
    propertyName: PRIMARY_PROPERTY.name,
    currentStage,
    progressPercent,
    lifecycle: lifecycle(currentStage),
    crmUpdate: crmUpdate(projectId, currentStage, progressPercent),
  };
}

export const INSTALLER_PROJECT_WORKFLOWS: readonly InstallerProjectWorkflow[] = [
  workflow(PRIMARY_PROJECT_ID, "installation", 68),
  workflow("installer-project-estate-maintenance", "planning", 44),
  workflow("installer-project-office-fitout", "testing", 86),
] as const;

export const INSTALLER_SCHEDULES: readonly InstallerScheduleItem[] = [
  { id: "schedule-rough-in-gf", projectId: PRIMARY_PROJECT_ID, label: "Ground Floor Rough-In", windowLabel: "Week 1 / Days 1-3", assignedTeam: "Team Alpha", status: "in-progress", roomCount: 12, estimatedHours: 96 },
  { id: "schedule-rough-in-ff", projectId: PRIMARY_PROJECT_ID, label: "First Floor Rough-In", windowLabel: "Week 1 / Days 4-6", assignedTeam: "Team Alpha", status: "scheduled", roomCount: 10, estimatedHours: 84 },
  { id: "schedule-device-fitoff", projectId: PRIMARY_PROJECT_ID, label: "Device Fit-Off", windowLabel: "Week 2 / Days 1-4", assignedTeam: "Team Beta", status: "scheduled", roomCount: INTERIOR_ROOMS.length, estimatedHours: 132 },
  { id: "schedule-testing-handover", projectId: PRIMARY_PROJECT_ID, label: "Testing and Handover", windowLabel: "Week 2 / Days 5-6", assignedTeam: "QA Cell", status: "ready-for-testing", roomCount: INTERIOR_ROOMS.length, estimatedHours: 46 },
] as const;

export const INSTALLER_TECHNICIANS: readonly InstallerTechnician[] = [
  { id: "tech-lead-amina", name: "Amina Yusuf", role: "lead-installer", certifications: ["KNX Partner", "Matter Installer", "SmartHive Lead"], assignedJobIds: ["schedule-rough-in-gf", "schedule-rough-in-ff"], gpsCheckInReady: true },
  { id: "tech-electrician-daniel", name: "Daniel Okoro", role: "electrician", certifications: ["LV Cabling", "DB Dressing", "Load Testing"], assignedJobIds: ["schedule-rough-in-gf"], gpsCheckInReady: true },
  { id: "tech-network-maya", name: "Maya Haddad", role: "network-technician", certifications: ["Cat6A", "Fiber", "Rack Build"], assignedJobIds: ["schedule-device-fitoff"], gpsCheckInReady: true },
  { id: "tech-security-omar", name: "Omar Rahman", role: "security-technician", certifications: ["CCTV", "Access Control", "NVR"], assignedJobIds: ["schedule-device-fitoff"], gpsCheckInReady: true },
  { id: "tech-qa-lina", name: "Lina Mensah", role: "qa-engineer", certifications: ["Commissioning", "Handover QA"], assignedJobIds: ["schedule-testing-handover"], gpsCheckInReady: true },
] as const;

function devicesForRoom(roomId: string) {
  return SMART_DEVICES.filter((device) => device.roomId === roomId);
}

function cableRunsForRoom(roomId: string) {
  const deviceCount = devicesForRoom(roomId).length;
  const lightCount = LIGHTING_FIXTURES.filter((fixture) => fixture.roomId === roomId).length;
  const switchCount = ELECTRICAL_SWITCHES.filter((switchSpec) => switchSpec.roomId === roomId).length;
  const socketCount = ELECTRICAL_SOCKETS.filter((socket) => socket.roomId === roomId).length;
  return Math.max(2, Math.ceil(deviceCount * 0.58 + lightCount * 0.35 + switchCount + socketCount * 0.42));
}

function checklistItems(roomId: string, cableRuns: number): readonly InstallerChecklistItem[] {
  const deviceCount = devicesForRoom(roomId).length;
  const status: InstallerTaskStatus = roomId.endsWith("foyer") || roomId.includes("living") ? "in-progress" : "pending";
  return [
    { id: `${roomId}-survey`, label: "Verify room dimensions and ceiling access", status: "complete", required: true },
    { id: `${roomId}-conduit`, label: `Install ${cableRuns} conduit/cable runs`, status, required: true },
    { id: `${roomId}-devices`, label: `Register ${deviceCount} required devices`, status, required: true },
    { id: `${roomId}-test`, label: "Complete power, network, and signal tests", status: "pending", required: true },
    { id: `${roomId}-photos`, label: "Upload before, during, and after photos", status: "pending", required: true },
  ];
}

function roomChecklist(roomId: string): InstallerRoomChecklist {
  const room = INTERIOR_ROOMS.find((candidate) => candidate.id === roomId) ?? INTERIOR_ROOMS[0];
  const devices = devicesForRoom(room.id);
  const cableRuns = cableRunsForRoom(room.id);
  const labourHours = round(1.2 + devices.length * 0.42 + cableRuns * 0.55);

  return {
    id: `install-checklist-${room.id}`,
    roomId: room.id,
    roomName: room.name,
    floorLevel: room.floorLevel,
    requiredDeviceIds: devices.map((device) => device.uniqueId),
    requiredDeviceCount: devices.length,
    requiredMaterials: ["Cat6A cable", "Low-voltage conduit", "Back boxes", "Label sleeves", "Mounting hardware"],
    cableRuns,
    labourHours,
    installationNotes: [
      `Use ${room.futureQuoteMapping.allowanceCode} as the future quote mapping reference.`,
      `Respect ${room.ceilingHeight}m ceiling height and ${room.floorMaterial.replace(/-/g, " ")} finish.`,
      "Capture photo evidence before closing ceiling or wall access.",
    ],
    checklistItems: checklistItems(room.id, cableRuns),
  };
}

export const INSTALLER_ROOM_CHECKLISTS: readonly InstallerRoomChecklist[] = INTERIOR_ROOMS.map((room) => roomChecklist(room.id));

function technicianForTask(index: number) {
  return INSTALLER_TECHNICIANS[index % INSTALLER_TECHNICIANS.length]?.id ?? "tech-lead-amina";
}

function taskStatus(index: number): InstallerTaskStatus {
  if (index < 6) return "complete";
  if (index < 15) return "in-progress";
  return "pending";
}

function taskCategory(index: number): InstallerTaskCategory {
  const categories: readonly InstallerTaskCategory[] = ["survey", "wiring", "device-install", "configuration", "testing", "handover"];
  return categories[index % categories.length] ?? "wiring";
}

export const INSTALLER_TASKS: readonly InstallerTask[] = INSTALLER_ROOM_CHECKLISTS.slice(0, 24).map((checklist, index) => ({
  id: `installer-task-${slug(checklist.roomName)}-${index + 1}`,
  projectId: PRIMARY_PROJECT_ID,
  roomId: checklist.roomId,
  roomName: checklist.roomName,
  title: `${label(taskCategory(index))} / ${checklist.roomName}`,
  category: taskCategory(index),
  status: taskStatus(index),
  priority: checklist.requiredDeviceCount > 14 ? "critical" : checklist.requiredDeviceCount > 10 ? "high" : "medium",
  assignedTechnicianId: technicianForTask(index),
  estimatedHours: checklist.labourHours,
  notes: `${checklist.requiredDeviceCount} devices, ${checklist.cableRuns} cable runs, QR registration required.`,
}));

function wiringType(index: number): InstallerWiringPlanType {
  const types: readonly InstallerWiringPlanType[] = ["conduit-layout", "cable-path", "switch-location", "rack-layout", "power-requirement"];
  return types[index % types.length] ?? "cable-path";
}

function cableTypeForWiring(type: InstallerWiringPlanType): InstallerWiringPlannerItem["cableType"] {
  if (type === "rack-layout") return "fiber";
  if (type === "switch-location") return "knx-bus";
  if (type === "power-requirement") return "mains";
  if (type === "conduit-layout") return "low-voltage";
  return "cat6a";
}

export const INSTALLER_WIRING_PLANS: readonly InstallerWiringPlannerItem[] = INTERIOR_ROOMS.slice(0, 32).flatMap((room, index) => {
  const type = wiringType(index);
  const center = roomCenter(room.id);
  const deviceCount = devicesForRoom(room.id).length;
  const powerRoomLoad = LIGHTING_POWER_SUMMARY.roomLoads.find((load) => load.roomId === room.id);
  const baseLength = round(Math.max(6, Math.sqrt(room.areaSqm) * 2.2 + deviceCount * 0.45));
  const target: readonly [number, number, number] = [round(center[0] + 0.8), round(center[1] - 0.6), round(center[2] - 0.8)] as const;

  return [
    {
      id: `installer-wiring-${room.id}-${type}`,
      projectId: PRIMARY_PROJECT_ID,
      roomId: room.id,
      roomName: room.name,
      type,
      label: `${label(type)} / ${room.name}`,
      source: center,
      target,
      lengthMeters: baseLength,
      conduitSizeMm: type === "rack-layout" ? 32 : type === "power-requirement" ? 25 : 20,
      cableType: cableTypeForWiring(type),
      switchLocations: ELECTRICAL_SWITCHES.filter((switchSpec) => switchSpec.roomId === room.id).length,
      rackUnits: room.id === "gf-smart-utility" ? 18 : type === "rack-layout" ? 4 : 0,
      powerWatts: Math.round(powerRoomLoad?.peakLoadWatts ?? deviceCount * 28),
      futureReady: true,
    },
  ];
});

function material(
  category: InstallerMaterialCategory,
  sku: string,
  name: string,
  quantity: number,
  unitCost: number,
  margin: number,
  warehouseStatus: InstallerWarehouseStatus,
  linkedRoomIds: readonly string[],
): InstallerMaterialLineItem {
  const supplierCost = round(quantity * unitCost);
  const retailCost = round(supplierCost * (1 + margin / 100));
  return {
    id: `material-${slug(sku)}`,
    category,
    sku,
    name,
    quantity,
    unitCost,
    supplierCost,
    retailCost,
    profitMarginPercent: margin,
    warehouseStatus,
    purchaseRequired: warehouseStatus === "ordered" || warehouseStatus === "backordered" || warehouseStatus === "low-stock",
    linkedRoomIds,
  };
}

const totalCableMeters = Math.ceil(INSTALLER_WIRING_PLANS.reduce((total, plan) => total + plan.lengthMeters, 0));
const totalDevices = SMART_DEVICES.length;
const totalSwitches = ELECTRICAL_SWITCHES.length;
const totalSockets = ELECTRICAL_SOCKETS.length;
const primaryRoomIds = INTERIOR_ROOMS.slice(0, 18).map((room) => room.id);

export const INSTALLER_MATERIALS: readonly InstallerMaterialLineItem[] = [
  material("device", "SHE-DEV-KIT", "Smart device installation kit", totalDevices, 34, 32, "ordered", INTERIOR_ROOMS.map((room) => room.id)),
  material("cable", "CAT6A-LSZH", "Cat6A LSZH cable meters", totalCableMeters, 1.25, 42, "in-stock", primaryRoomIds),
  material("cable", "LV-CTRL-2C", "Low-voltage control cable meters", Math.ceil(totalCableMeters * 0.72), 0.86, 45, "in-stock", primaryRoomIds),
  material("conduit", "CONDUIT-20MM", "20mm flexible conduit meters", Math.ceil(totalCableMeters * 0.65), 1.1, 38, "low-stock", primaryRoomIds),
  material("conduit", "CONDUIT-25MM", "25mm mains conduit meters", Math.ceil(totalCableMeters * 0.18), 1.8, 35, "ordered", ["gf-smart-utility", "gf-garage-connection"]),
  material("rack", "RACK-27U-PREMIUM", "27U smart home rack with ventilation", 1, 1850, 28, "ordered", ["gf-smart-utility"]),
  material("switchgear", "DIN-SMART-PANEL", "Smart panel breakers and relay modules", 18, 76, 34, "backordered", ["gf-smart-utility"]),
  material("mounting", "BACKBOX-PREM", "Premium switch and socket back boxes", totalSwitches + totalSockets, 4.8, 40, "in-stock", primaryRoomIds),
  material("consumable", "LABEL-HEATSHRINK", "Heat-shrink cable labels", totalDevices + totalSwitches + totalSockets, 0.35, 52, "in-stock", INTERIOR_ROOMS.map((room) => room.id)),
  material("labour", "LABOUR-INSTALL", "Certified installer labour hours", Math.ceil(INSTALLER_ROOM_CHECKLISTS.reduce((total, checklist) => total + checklist.labourHours, 0)), 48, 30, "in-stock", INTERIOR_ROOMS.map((room) => room.id)),
] as const;

function photoRecord(roomId: string, category: InstallerPhotoRecord["category"], labelText: string): InstallerPhotoRecord {
  return {
    id: `photo-${category}-${roomId}`,
    projectId: PRIMARY_PROJECT_ID,
    roomId,
    category,
    label: labelText,
    uploadReady: true,
    storageMode: "placeholder-metadata",
  };
}

export const INSTALLER_PHOTOS: readonly InstallerPhotoRecord[] = INTERIOR_ROOMS.flatMap((room, index) => [
  photoRecord(room.id, "before", `Before photo / ${room.name}`),
  ...(index < 12 ? [photoRecord(room.id, "during", `During installation / ${room.name}`)] : []),
]);

export const INSTALLER_QR_REGISTRATIONS: readonly InstallerQrRegistration[] = SMART_DEVICES.map((device) => ({
  id: `qr-${device.uniqueId}`,
  deviceId: device.uniqueId,
  roomId: device.roomId,
  qrPayload: `smarthive://installer/register/${device.uniqueId}`,
  registrationReady: true,
  physicalDeviceBound: false,
}));

export const INSTALLER_COMPLETION_SIGN_OFF: InstallerCompletionSignOff = {
  id: "installer-signoff-signature-villa",
  projectId: PRIMARY_PROJECT_ID,
  requiredApprovals: ["Lead Installer", "Project Manager", "Customer Representative", "SmartHive QA"],
  signedOffCount: 1,
  handoverReady: false,
  signatureCaptureReady: true,
};

function report(type: InstallerReportType, title: string, description: string, itemCount: number): InstallerReportArtifact {
  return {
    id: `installer-report-${type}`,
    type,
    title,
    description,
    itemCount,
    ready: true,
  };
}

export const INSTALLER_REPORTS: readonly InstallerReportArtifact[] = [
  report("installation-report", "Installation Progress Report", "Projects, schedules, assigned jobs, room checklists, photos, and completion status.", INSTALLER_TASKS.length),
  report("material-plan", "Material Planner", "Bill of materials, purchase list, warehouse status, supplier cost, and profit margin.", INSTALLER_MATERIALS.length),
  report("wiring-plan", "Wiring Planner", "Conduit layout, cable paths, switch locations, rack layout, and power requirements.", INSTALLER_WIRING_PLANS.length),
  report("handover-pack", "Handover Pack", "QR device records, photo evidence, completion sign-off, and customer-ready summary.", INSTALLER_QR_REGISTRATIONS.length),
  report("maintenance-plan", "Maintenance Plan", "Future-ready maintenance lifecycle from handover into service support.", INSTALLER_PROJECT_WORKFLOWS.length),
] as const;

function dashboardSummary(): InstallerDashboardSummary {
  const averageProgressPercent = round(INSTALLER_PROJECT_WORKFLOWS.reduce((total, item) => total + item.progressPercent, 0) / INSTALLER_PROJECT_WORKFLOWS.length);
  const completedTasks = INSTALLER_TASKS.filter((task) => task.status === "complete").length;
  return {
    projectCount: INSTALLER_PROJECT_WORKFLOWS.length,
    scheduleCount: INSTALLER_SCHEDULES.length,
    taskCount: INSTALLER_TASKS.length,
    assignedJobCount: INSTALLER_SCHEDULES.filter((schedule) => schedule.status === "in-progress" || schedule.status === "scheduled").length,
    photoCount: INSTALLER_PHOTOS.length,
    averageProgressPercent,
    completionPercent: round((completedTasks / INSTALLER_TASKS.length) * 100),
  };
}

const supplierCost = round(INSTALLER_MATERIALS.reduce((total, materialLine) => total + materialLine.supplierCost, 0));
const retailCost = round(INSTALLER_MATERIALS.reduce((total, materialLine) => total + materialLine.retailCost, 0));
const purchaseCost = round(INSTALLER_MATERIALS.filter((materialLine) => materialLine.purchaseRequired).reduce((total, materialLine) => total + materialLine.supplierCost, 0));

export function CompleteInstallerTask(taskId: string): InstallerTask | null {
  const task = INSTALLER_TASKS.find((candidate) => candidate.id === taskId);
  if (!task) return null;
  return {
    ...task,
    status: "complete",
    notes: `${task.notes} Completion simulated locally for installer workflow review.`,
  };
}

export function GenerateInstallationReport(reportType: InstallerReportType): InstallerReportArtifact | null {
  return INSTALLER_REPORTS.find((reportArtifact) => reportArtifact.type === reportType) ?? null;
}

export function RegisterInstallerDevice(deviceId: string): InstallerQrRegistration | null {
  return INSTALLER_QR_REGISTRATIONS.find((registration) => registration.deviceId === deviceId) ?? null;
}

export const InstallerPlatformApi = {
  CompleteInstallerTask,
  GenerateInstallationReport,
  RegisterInstallerDevice,
} as const;

export const INSTALLER_PLATFORM_REPORT: InstallerPlatformReport = {
  dashboard: dashboardSummary(),
  lifecycleStageCount: LIFECYCLE_STAGES.length,
  roomChecklistCount: INSTALLER_ROOM_CHECKLISTS.length,
  wiringPlanCount: INSTALLER_WIRING_PLANS.length,
  materialLineCount: INSTALLER_MATERIALS.length,
  billOfMaterialsCost: retailCost,
  purchaseListCost: purchaseCost,
  supplierCost,
  projectedProfit: round(retailCost - supplierCost),
  averageProfitMarginPercent: round(((retailCost - supplierCost) / Math.max(1, supplierCost)) * 100),
  technicianApp: {
    qrCodeCount: INSTALLER_QR_REGISTRATIONS.length,
    deviceRegistrationReady: true,
    photoUploadReady: true,
    gpsCheckInReady: true,
    completionSignOffReady: true,
    nativeAppFutureReady: true,
  },
  reportCount: INSTALLER_REPORTS.length,
  crmUpdatePayload: INSTALLER_PROJECT_WORKFLOWS[0]?.crmUpdate ?? crmUpdate(PRIMARY_PROJECT_ID, "installation", 68),
  capabilities: {
    installerDashboard: true,
    projectWorkflow: true,
    roomInstallationMode: true,
    wiringPlanner: true,
    materialPlanner: true,
    technicianAppReady: true,
    installationReports: true,
    crmUpdatePayloadReady: true,
  },
  constraints: {
    externalCrm: "payload-only",
    api: "untouched",
    database: "untouched",
    authentication: "untouched",
    existingWebsiteFunctionality: "untouched",
  },
};

export const INSTALLER_PLATFORM_CONTEXT = {
  proposalId: DEFAULT_CONFIGURATION_PROPOSAL.id,
  crmLeadId: DEFAULT_CONFIGURATION_CRM_LEAD.id,
  source: "experience-engine-internal-installer-platform",
  externalCrmModified: false,
} as const;
