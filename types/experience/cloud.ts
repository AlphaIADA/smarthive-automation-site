export type CloudEntityKind =
  | "customer-profile"
  | "property-profile"
  | "project"
  | "digital-twin"
  | "building"
  | "room"
  | "device"
  | "automation"
  | "scene"
  | "security"
  | "energy"
  | "history";

export type CloudSyncStatus = "synced" | "pending" | "queued" | "conflict" | "offline-cached";
export type CloudBackupKind = "project" | "device" | "automation" | "scene" | "customer-profile" | "property-profile" | "digital-twin";
export type CloudClientDevice = "desktop" | "tablet" | "mobile" | "future-native-ios" | "future-native-android";
export type CloudConflictStrategy = "cloud-wins" | "local-wins" | "merge-by-timestamp" | "manual-review";
export type CloudPermissionRole = "owner" | "installer" | "technician" | "facility-manager" | "security" | "guest" | "tenant";
export type CloudRemoteAccessCapability = "view-property" | "control-devices" | "receive-alerts" | "generate-reports";

export interface CloudSyncTarget {
  readonly id: string;
  readonly kind: CloudEntityKind;
  readonly label: string;
  readonly sourceSystem: string;
  readonly entityCount: number;
  readonly payloadBytes: number;
  readonly status: CloudSyncStatus;
  readonly lastSyncedLabel: string;
  readonly encryptionEnabled: true;
  readonly offlineCacheEnabled: true;
}

export interface CloudBackupPackage {
  readonly id: string;
  readonly kind: CloudBackupKind;
  readonly label: string;
  readonly sourceSystem: string;
  readonly itemCount: number;
  readonly sizeMb: number;
  readonly checksum: string;
  readonly retainedVersions: number;
  readonly encrypted: true;
  readonly restorable: true;
}

export interface CloudOfflineCacheEntry {
  readonly id: string;
  readonly targetId: string;
  readonly entityKind: CloudEntityKind;
  readonly label: string;
  readonly cacheKey: string;
  readonly sizeMb: number;
  readonly ttlHours: number;
  readonly dirty: boolean;
  readonly backgroundSyncQueued: boolean;
}

export interface CloudConflictRecord {
  readonly id: string;
  readonly targetId: string;
  readonly entityKind: CloudEntityKind;
  readonly label: string;
  readonly localVersion: number;
  readonly cloudVersion: number;
  readonly strategy: CloudConflictStrategy;
  readonly resolved: boolean;
  readonly resolutionLabel: string;
}

export interface CloudRemoteAccessProfile {
  readonly propertyId: string;
  readonly propertyName: string;
  readonly capabilities: readonly CloudRemoteAccessCapability[];
  readonly futureReady: true;
  readonly liveControlImplemented: false;
}

export interface CloudClientProfile {
  readonly id: string;
  readonly device: CloudClientDevice;
  readonly label: string;
  readonly supported: true;
  readonly syncOptimized: true;
  readonly offlineCache: true;
  readonly futureNativeAppReady: boolean;
}

export interface CloudSecurityPolicy {
  readonly endToEndEncryption: true;
  readonly encryptionAlgorithm: "xchacha20-poly1305-ready";
  readonly deviceAuthentication: true;
  readonly rolePermissions: readonly {
    readonly role: CloudPermissionRole;
    readonly permissions: readonly string[];
  }[];
  readonly auditLogs: true;
  readonly routeHandlersCreated: false;
  readonly databaseModified: false;
}

export interface CloudAuditLogEntry {
  readonly id: string;
  readonly actor: string;
  readonly action: string;
  readonly targetId: string;
  readonly severity: "info" | "warning" | "critical";
  readonly timestampLabel: string;
  readonly tamperEvident: true;
}

export interface CloudSyncResult {
  readonly targetId: string;
  readonly accepted: boolean;
  readonly simulated: true;
  readonly status: CloudSyncStatus;
  readonly message: string;
}

export interface CloudSyncReport {
  readonly targetCount: number;
  readonly syncedCount: number;
  readonly pendingCount: number;
  readonly queuedCount: number;
  readonly conflictCount: number;
  readonly offlineCachedCount: number;
  readonly backupCount: number;
  readonly offlineCacheCount: number;
  readonly remoteAccessProfileCount: number;
  readonly clientProfileCount: number;
  readonly auditLogCount: number;
  readonly totalPayloadMb: number;
  readonly cloudStores: {
    readonly buildings: true;
    readonly rooms: true;
    readonly devices: true;
    readonly automation: true;
    readonly scenes: true;
    readonly security: true;
    readonly energy: true;
    readonly history: true;
  };
  readonly features: {
    readonly cloudSync: true;
    readonly projectBackup: true;
    readonly deviceBackup: true;
    readonly automationBackup: true;
    readonly sceneBackup: true;
    readonly customerProfiles: true;
    readonly propertyProfiles: true;
  };
  readonly remoteAccess: {
    readonly viewProperty: true;
    readonly controlDevices: true;
    readonly receiveAlerts: true;
    readonly generateReports: true;
    readonly futureReady: true;
  };
  readonly offline: {
    readonly localCache: true;
    readonly conflictResolution: true;
    readonly backgroundSync: true;
  };
  readonly security: CloudSecurityPolicy;
  readonly constraints: {
    readonly websiteFunctionality: "untouched";
    readonly apiRoutes: "untouched";
    readonly database: "untouched";
    readonly authentication: "untouched";
    readonly realCloudConnection: "not-created";
    readonly externalCrm: "untouched";
  };
}
