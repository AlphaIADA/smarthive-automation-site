import type { DriverHealthStatus, DriverRuntimeStatus, DriverSource, SmartHomeProtocol } from "./communication";

export type EnterpriseInstallationStatus = "installed" | "pending" | "rejected" | "replacement";
export type EnterpriseMaintenanceStatus = "normal" | "maintenance-due" | "maintenance-scheduled" | "replacement-required";
export type EnterpriseAlertType = "low-battery" | "offline" | "fault" | "tampering" | "power-failure";
export type EnterpriseAlertSeverity = "info" | "warning" | "critical";
export type EnterpriseDeviceAction = "restart" | "reset" | "diagnostics" | "maintenance" | "replacement" | "rollback";
export type EnterpriseOtaStatus = "available" | "scheduled" | "installing" | "completed" | "rolled-back";
export type EnterpriseGroupType = "building" | "floor" | "room" | "manufacturer" | "protocol" | "customer";

export interface EnterpriseProperty {
  readonly id: string;
  readonly name: string;
  readonly customerId: string;
  readonly customerName: string;
  readonly buildingName: string;
  readonly locationLabel: string;
}

export interface EnterpriseFirmwareState {
  readonly currentVersion: string;
  readonly latestVersion: string;
  readonly updateAvailable: boolean;
  readonly rollbackVersion: string;
  readonly versionHistory: readonly string[];
}

export interface EnterpriseOtaPlan {
  readonly id: string;
  readonly inventoryId: string;
  readonly targetVersion: string;
  readonly scheduledWindowLabel: string;
  readonly status: EnterpriseOtaStatus;
  readonly rollbackReady: true;
}

export interface EnterpriseDeviceLog {
  readonly id: string;
  readonly inventoryId: string;
  readonly timestampLabel: string;
  readonly level: "info" | "warning" | "critical";
  readonly message: string;
}

export interface EnterpriseDiagnosticsSnapshot {
  readonly signalStrength: number;
  readonly latencyMs: number;
  readonly packetLossPercent: number;
  readonly uptimeHours: number;
  readonly lastDiagnosticLabel: string;
  readonly restartReady: true;
  readonly resetReady: true;
}

export interface EnterpriseInventoryCost {
  readonly equipmentCost: number;
  readonly installationCost: number;
  readonly maintenanceReserve: number;
  readonly replacementReserve: number;
  readonly totalInventoryCost: number;
  readonly currency: "USD";
}

export interface EnterpriseDeviceRecord {
  readonly id: string;
  readonly propertyId: string;
  readonly propertyName: string;
  readonly customerId: string;
  readonly customerName: string;
  readonly buildingName: string;
  readonly floorLabel: string;
  readonly roomId: string;
  readonly roomName: string;
  readonly source: DriverSource;
  readonly sourceId: string;
  readonly deviceName: string;
  readonly manufacturer: string;
  readonly model: string;
  readonly protocol: SmartHomeProtocol;
  readonly bridgeProtocol: SmartHomeProtocol | null;
  readonly healthStatus: DriverHealthStatus;
  readonly runtimeStatus: DriverRuntimeStatus;
  readonly batteryPercent: number | null;
  readonly connectivityPercent: number;
  readonly installationStatus: EnterpriseInstallationStatus;
  readonly maintenanceStatus: EnterpriseMaintenanceStatus;
  readonly firmware: EnterpriseFirmwareState;
  readonly diagnostics: EnterpriseDiagnosticsSnapshot;
  readonly cost: EnterpriseInventoryCost;
}

export interface EnterpriseDeviceGroup {
  readonly id: string;
  readonly type: EnterpriseGroupType;
  readonly label: string;
  readonly deviceCount: number;
  readonly onlineCount: number;
  readonly alertCount: number;
  readonly inventoryCost: number;
}

export interface EnterpriseDeviceAlert {
  readonly id: string;
  readonly inventoryId: string;
  readonly type: EnterpriseAlertType;
  readonly severity: EnterpriseAlertSeverity;
  readonly title: string;
  readonly description: string;
  readonly acknowledged: boolean;
  readonly timestampLabel: string;
}

export interface EnterpriseDeviceCommandResult {
  readonly id: string;
  readonly inventoryId: string;
  readonly action: EnterpriseDeviceAction;
  readonly accepted: boolean;
  readonly simulated: true;
  readonly message: string;
  readonly timestampLabel: string;
}

export interface EnterpriseInventoryQuoteSummary {
  readonly inventoryCount: number;
  readonly equipmentCost: number;
  readonly installationCost: number;
  readonly maintenanceReserve: number;
  readonly replacementReserve: number;
  readonly totalCost: number;
  readonly currency: "USD";
  readonly source: "experience-enterprise-device-management-internal-cost-model";
  readonly existingQuotationEngineModified: false;
}

export interface EnterpriseDeviceManagementReport {
  readonly propertyCount: number;
  readonly inventoryCount: number;
  readonly groupCount: number;
  readonly alertCount: number;
  readonly otaPlanCount: number;
  readonly logCount: number;
  readonly health: {
    readonly healthyCount: number;
    readonly warningCount: number;
    readonly criticalCount: number;
    readonly offlineCount: number;
    readonly lowBatteryCount: number;
  };
  readonly installation: {
    readonly installedCount: number;
    readonly pendingCount: number;
    readonly rejectedCount: number;
    readonly replacementCount: number;
  };
  readonly ota: {
    readonly updateAvailableCount: number;
    readonly scheduledCount: number;
    readonly rollbackReadyCount: number;
    readonly versionHistoryReady: true;
  };
  readonly grouping: {
    readonly byBuilding: true;
    readonly byFloor: true;
    readonly byRoom: true;
    readonly byManufacturer: true;
    readonly byProtocol: true;
    readonly byCustomer: true;
  };
  readonly quote: EnterpriseInventoryQuoteSummary;
  readonly constraints: {
    readonly websiteFunctionality: "untouched";
    readonly apiRoutes: "untouched";
    readonly database: "untouched";
    readonly realDeviceActions: "not-executed";
    readonly externalQuoteEngine: "untouched";
  };
}
