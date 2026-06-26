import { BAS_SYSTEM_REPORT } from "@/lib/experience/automation/bas-system";
import { ExportTwin, TWIN_REGISTRY_SUMMARY } from "@/lib/experience/digital-twin";
import { ENTERPRISE_DEVICE_MANAGEMENT_REPORT } from "@/lib/experience/device-management";
import { ENERGY_SYSTEM_REPORT } from "@/lib/experience/energy/energy-catalog";
import { ESTATE_CUSTOMERS, ESTATE_MANAGEMENT_REPORT, ESTATE_PROPERTIES, ESTATE_ROLE_POLICIES } from "@/lib/experience/estate-management";
import { SECURITY_PLATFORM_REPORT } from "@/lib/experience/security/security-catalog";
import type {
  CloudAuditLogEntry,
  CloudBackupKind,
  CloudBackupPackage,
  CloudClientProfile,
  CloudConflictRecord,
  CloudConflictStrategy,
  CloudEntityKind,
  CloudOfflineCacheEntry,
  CloudPermissionRole,
  CloudRemoteAccessCapability,
  CloudRemoteAccessProfile,
  CloudSecurityPolicy,
  CloudSyncReport,
  CloudSyncResult,
  CloudSyncStatus,
  CloudSyncTarget,
} from "@/types/experience";

function round(value: number, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function checksum(seed: string) {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `sha256-ready-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function bytesFor(entityCount: number, weight = 920) {
  return Math.max(4096, Math.round(entityCount * weight));
}

function mb(bytes: number) {
  return round(bytes / 1024 / 1024);
}

function syncStatus(kind: CloudEntityKind, entityCount: number): CloudSyncStatus {
  if (kind === "history" || kind === "automation") return "queued";
  if (kind === "device" && entityCount > 2500) return "pending";
  if (kind === "security" && SECURITY_PLATFORM_REPORT.registrySummary.offlineCount > 0) return "offline-cached";
  if (kind === "property-profile" && ESTATE_MANAGEMENT_REPORT.dashboard.warningPropertyCount > 0) return "conflict";
  return "synced";
}

function target(kind: CloudEntityKind, label: string, sourceSystem: string, entityCount: number, weight?: number): CloudSyncTarget {
  const payloadBytes = bytesFor(entityCount, weight);
  return {
    id: `cloud-target-${kind}`,
    kind,
    label,
    sourceSystem,
    entityCount,
    payloadBytes,
    status: syncStatus(kind, entityCount),
    lastSyncedLabel: syncStatus(kind, entityCount) === "synced" ? "Cloud mirror current" : "Pending background sync",
    encryptionEnabled: true,
    offlineCacheEnabled: true,
  };
}

export const CLOUD_SYNC_TARGETS: readonly CloudSyncTarget[] = [
  target("customer-profile", "Customer Profiles", "estate-management", ESTATE_CUSTOMERS.length, 1100),
  target("property-profile", "Property Profiles", "estate-management", ESTATE_PROPERTIES.length, 1600),
  target("project", "Projects", "digital-twin-project-registry", TWIN_REGISTRY_SUMMARY.projectCount, 2200),
  target("digital-twin", "Digital Twin Export", "dtie", ExportTwin().entityCount, 1280),
  target("building", "Buildings", "dtie-estate-graph", TWIN_REGISTRY_SUMMARY.buildingCount + ESTATE_MANAGEMENT_REPORT.buildingCount, 1450),
  target("room", "Rooms", "dtie-estate-graph", TWIN_REGISTRY_SUMMARY.roomCount + ESTATE_MANAGEMENT_REPORT.roomCount, 960),
  target("device", "Devices", "enterprise-device-management", ENTERPRISE_DEVICE_MANAGEMENT_REPORT.inventoryCount, 1250),
  target("automation", "Automation Rules", "building-automation-system", BAS_SYSTEM_REPORT.ruleCount, 1800),
  target("scene", "Scenes", "building-automation-system", BAS_SYSTEM_REPORT.sceneCount, 1800),
  target("security", "Security State", "security-platform", SECURITY_PLATFORM_REPORT.registrySummary.deviceCount + SECURITY_PLATFORM_REPORT.registrySummary.notificationCount, 1500),
  target("energy", "Energy State", "enterprise-energy-management", ENERGY_SYSTEM_REPORT.smartDeviceMonitorCount + ENERGY_SYSTEM_REPORT.circuitMonitorCount + ENERGY_SYSTEM_REPORT.roomMonitorCount, 1250),
  target("history", "Twin History", "dtie-time-machine", TWIN_REGISTRY_SUMMARY.historyEntryCount, 760),
] as const;

function backup(kind: CloudBackupKind, label: string, sourceSystem: string, itemCount: number, retainedVersions: number): CloudBackupPackage {
  const sizeMb = round(Math.max(0.25, itemCount * 0.018 + retainedVersions * 0.04));
  return {
    id: `cloud-backup-${kind}`,
    kind,
    label,
    sourceSystem,
    itemCount,
    sizeMb,
    checksum: checksum(`${kind}:${label}:${itemCount}:${retainedVersions}`),
    retainedVersions,
    encrypted: true,
    restorable: true,
  };
}

export const CLOUD_BACKUP_PACKAGES: readonly CloudBackupPackage[] = [
  backup("project", "Project Backup", "dtie-project-registry", TWIN_REGISTRY_SUMMARY.projectCount, 14),
  backup("device", "Device Backup", "enterprise-device-management", ENTERPRISE_DEVICE_MANAGEMENT_REPORT.inventoryCount, 21),
  backup("automation", "Automation Backup", "building-automation-system", BAS_SYSTEM_REPORT.ruleCount, 21),
  backup("scene", "Scene Backup", "building-automation-system", BAS_SYSTEM_REPORT.sceneCount, 21),
  backup("customer-profile", "Customer Profile Backup", "estate-management", ESTATE_CUSTOMERS.length, 12),
  backup("property-profile", "Property Profile Backup", "estate-management", ESTATE_PROPERTIES.length, 12),
  backup("digital-twin", "Digital Twin Backup", "dtie-export", ExportTwin().entityCount, 28),
] as const;

function cacheEntry(targetItem: CloudSyncTarget): CloudOfflineCacheEntry {
  const dirty = targetItem.status === "pending" || targetItem.status === "conflict" || targetItem.status === "queued";
  return {
    id: `offline-cache-${targetItem.id}`,
    targetId: targetItem.id,
    entityKind: targetItem.kind,
    label: targetItem.label,
    cacheKey: `she-cloud-cache:${targetItem.kind}`,
    sizeMb: mb(targetItem.payloadBytes),
    ttlHours: targetItem.kind === "history" ? 168 : 72,
    dirty,
    backgroundSyncQueued: dirty || targetItem.status === "offline-cached",
  };
}

export const CLOUD_OFFLINE_CACHE: readonly CloudOfflineCacheEntry[] = CLOUD_SYNC_TARGETS.map(cacheEntry);

function conflict(targetItem: CloudSyncTarget, index: number, strategy: CloudConflictStrategy): CloudConflictRecord {
  return {
    id: `cloud-conflict-${targetItem.kind}-${index}`,
    targetId: targetItem.id,
    entityKind: targetItem.kind,
    label: `${targetItem.label} conflict ${index + 1}`,
    localVersion: 100 + index,
    cloudVersion: 104 + index,
    strategy,
    resolved: strategy !== "manual-review",
    resolutionLabel: strategy === "manual-review" ? "Queued for installer review" : `Resolved by ${strategy.replace(/-/g, " ")}`,
  };
}

export const CLOUD_CONFLICTS: readonly CloudConflictRecord[] = [
  conflict(CLOUD_SYNC_TARGETS.find((item) => item.kind === "property-profile") ?? CLOUD_SYNC_TARGETS[0], 0, "merge-by-timestamp"),
  conflict(CLOUD_SYNC_TARGETS.find((item) => item.kind === "device") ?? CLOUD_SYNC_TARGETS[0], 1, "local-wins"),
  conflict(CLOUD_SYNC_TARGETS.find((item) => item.kind === "automation") ?? CLOUD_SYNC_TARGETS[0], 2, "manual-review"),
] as const;

export const CLOUD_REMOTE_ACCESS_PROFILES: readonly CloudRemoteAccessProfile[] = ESTATE_PROPERTIES.map((property) => ({
  propertyId: property.id,
  propertyName: property.name,
  capabilities: ["view-property", "control-devices", "receive-alerts", "generate-reports"] satisfies readonly CloudRemoteAccessCapability[],
  futureReady: true,
  liveControlImplemented: false,
}));

export const CLOUD_CLIENT_PROFILES: readonly CloudClientProfile[] = [
  { id: "cloud-client-desktop", device: "desktop", label: "Desktop Browser", supported: true, syncOptimized: true, offlineCache: true, futureNativeAppReady: false },
  { id: "cloud-client-tablet", device: "tablet", label: "Tablet Browser", supported: true, syncOptimized: true, offlineCache: true, futureNativeAppReady: false },
  { id: "cloud-client-mobile", device: "mobile", label: "Mobile Browser", supported: true, syncOptimized: true, offlineCache: true, futureNativeAppReady: false },
  { id: "cloud-client-native-ios", device: "future-native-ios", label: "Future Native iOS App", supported: true, syncOptimized: true, offlineCache: true, futureNativeAppReady: true },
  { id: "cloud-client-native-android", device: "future-native-android", label: "Future Native Android App", supported: true, syncOptimized: true, offlineCache: true, futureNativeAppReady: true },
] as const;

function rolePermission(role: string): CloudPermissionRole {
  if (role === "facility-manager") return "facility-manager";
  if (role === "security") return "security";
  if (role === "installer") return "installer";
  if (role === "technician") return "technician";
  if (role === "guest") return "guest";
  if (role === "tenant") return "tenant";
  return "owner";
}

export const CLOUD_SECURITY_POLICY: CloudSecurityPolicy = {
  endToEndEncryption: true,
  encryptionAlgorithm: "xchacha20-poly1305-ready",
  deviceAuthentication: true,
  rolePermissions: ESTATE_ROLE_POLICIES.map((policy) => ({
    role: rolePermission(policy.role),
    permissions: policy.permissions,
  })),
  auditLogs: true,
  routeHandlersCreated: false,
  databaseModified: false,
};

export const CLOUD_AUDIT_LOGS: readonly CloudAuditLogEntry[] = [
  {
    id: "cloud-audit-sync-dtie",
    actor: "SmartHive Cloud Sync",
    action: "Queued Digital Twin export",
    targetId: "cloud-target-digital-twin",
    severity: "info",
    timestampLabel: "Cloud simulation cycle",
    tamperEvident: true,
  },
  {
    id: "cloud-audit-offline-cache",
    actor: "Offline Engine",
    action: "Cached property profiles for offline access",
    targetId: "cloud-target-property-profile",
    severity: "warning",
    timestampLabel: "Offline readiness cycle",
    tamperEvident: true,
  },
  {
    id: "cloud-audit-conflict",
    actor: "Conflict Resolver",
    action: "Detected automation conflict requiring review",
    targetId: "cloud-target-automation",
    severity: "critical",
    timestampLabel: "Conflict simulation cycle",
    tamperEvident: true,
  },
] as const;

export function SyncCloudTarget(targetId: string): CloudSyncResult {
  const syncTarget = CLOUD_SYNC_TARGETS.find((item) => item.id === targetId);
  return {
    targetId,
    accepted: Boolean(syncTarget),
    simulated: true,
    status: syncTarget?.status ?? "pending",
    message: syncTarget ? `${syncTarget.label} sync accepted for SmartHive Cloud simulation. No real cloud connection was created.` : "Unknown cloud sync target.",
  };
}

export function ResolveCloudConflict(conflictId: string, strategy: CloudConflictStrategy): CloudConflictRecord | null {
  const existingConflict = CLOUD_CONFLICTS.find((item) => item.id === conflictId);
  if (!existingConflict) return null;
  return {
    ...existingConflict,
    strategy,
    resolved: strategy !== "manual-review",
    resolutionLabel: strategy === "manual-review" ? "Queued for manual review" : `Resolved by ${strategy.replace(/-/g, " ")}`,
  };
}

export const SmartHiveCloudApi = {
  SyncCloudTarget,
  ResolveCloudConflict,
} as const;

const statusCount = (status: CloudSyncStatus) => CLOUD_SYNC_TARGETS.filter((item) => item.status === status).length;

export const SMARTHIVE_CLOUD_REPORT: CloudSyncReport = {
  targetCount: CLOUD_SYNC_TARGETS.length,
  syncedCount: statusCount("synced"),
  pendingCount: statusCount("pending"),
  queuedCount: statusCount("queued"),
  conflictCount: CLOUD_CONFLICTS.length,
  offlineCachedCount: CLOUD_OFFLINE_CACHE.filter((item) => item.backgroundSyncQueued).length,
  backupCount: CLOUD_BACKUP_PACKAGES.length,
  offlineCacheCount: CLOUD_OFFLINE_CACHE.length,
  remoteAccessProfileCount: CLOUD_REMOTE_ACCESS_PROFILES.length,
  clientProfileCount: CLOUD_CLIENT_PROFILES.length,
  auditLogCount: CLOUD_AUDIT_LOGS.length,
  totalPayloadMb: round(CLOUD_SYNC_TARGETS.reduce((total, item) => total + item.payloadBytes, 0) / 1024 / 1024),
  cloudStores: {
    buildings: true,
    rooms: true,
    devices: true,
    automation: true,
    scenes: true,
    security: true,
    energy: true,
    history: true,
  },
  features: {
    cloudSync: true,
    projectBackup: true,
    deviceBackup: true,
    automationBackup: true,
    sceneBackup: true,
    customerProfiles: true,
    propertyProfiles: true,
  },
  remoteAccess: {
    viewProperty: true,
    controlDevices: true,
    receiveAlerts: true,
    generateReports: true,
    futureReady: true,
  },
  offline: {
    localCache: true,
    conflictResolution: true,
    backgroundSync: true,
  },
  security: CLOUD_SECURITY_POLICY,
  constraints: {
    websiteFunctionality: "untouched",
    apiRoutes: "untouched",
    database: "untouched",
    authentication: "untouched",
    realCloudConnection: "not-created",
    externalCrm: "untouched",
  },
};
