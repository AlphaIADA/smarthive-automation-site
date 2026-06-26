import type { SmartHomeProtocol } from "./communication";

export type EstatePropertyType =
  | "villa"
  | "apartment"
  | "duplex"
  | "penthouse"
  | "estate"
  | "office"
  | "hotel"
  | "school"
  | "hospital"
  | "shopping-mall"
  | "warehouse"
  | "factory";

export type EstateOperationalStatus = "online" | "warning" | "critical" | "maintenance";
export type EstateDeviceStatus = "online" | "offline" | "warning" | "fault";
export type EstateRole = "owner" | "installer" | "technician" | "facility-manager" | "security" | "guest" | "tenant";
export type EstateReportType = "building-health" | "security-score" | "energy-score" | "automation-score" | "maintenance-cost" | "asset-value";

export interface EstateLocation {
  readonly label: string;
  readonly latitude: number;
  readonly longitude: number;
}

export interface EstateManagedDeviceRef {
  readonly id: string;
  readonly propertyId: string;
  readonly buildingId: string;
  readonly floorId: string;
  readonly roomId: string;
  readonly name: string;
  readonly category: string;
  readonly manufacturer: string;
  readonly protocol: SmartHomeProtocol;
  readonly status: EstateDeviceStatus;
  readonly connectivityPercent: number;
}

export interface EstateRoomNode {
  readonly id: string;
  readonly propertyId: string;
  readonly buildingId: string;
  readonly floorId: string;
  readonly name: string;
  readonly deviceIds: readonly string[];
  readonly deviceCount: number;
}

export interface EstateFloorNode {
  readonly id: string;
  readonly propertyId: string;
  readonly buildingId: string;
  readonly name: string;
  readonly roomIds: readonly string[];
  readonly roomCount: number;
  readonly deviceCount: number;
}

export interface EstateBuildingNode {
  readonly id: string;
  readonly propertyId: string;
  readonly blockId: string;
  readonly name: string;
  readonly floorIds: readonly string[];
  readonly floorCount: number;
  readonly roomCount: number;
  readonly deviceCount: number;
  readonly healthScore: number;
  readonly securityScore: number;
  readonly energyScore: number;
  readonly automationScore: number;
}

export interface EstateBlockNode {
  readonly id: string;
  readonly propertyId: string;
  readonly name: string;
  readonly buildingIds: readonly string[];
  readonly buildingCount: number;
  readonly floorCount: number;
  readonly roomCount: number;
  readonly deviceCount: number;
}

export interface EstateCrmProjectHistory {
  readonly id: string;
  readonly title: string;
  readonly status: "completed" | "active" | "planned";
  readonly value: number;
  readonly dateLabel: string;
}

export interface EstateCrmServiceHistory {
  readonly id: string;
  readonly title: string;
  readonly status: "closed" | "open" | "scheduled";
  readonly technicianTeam: string;
  readonly dateLabel: string;
}

export interface EstateWarrantySummary {
  readonly id: string;
  readonly coverageLabel: string;
  readonly expiryLabel: string;
  readonly coveredAssetValue: number;
  readonly active: boolean;
}

export interface EstateMaintenanceContract {
  readonly id: string;
  readonly level: "standard" | "premium" | "enterprise" | "mission-critical";
  readonly renewalLabel: string;
  readonly annualCost: number;
  readonly responseSlaHours: number;
}

export interface EstateCrmLink {
  readonly customerProfileId: string;
  readonly projectHistory: readonly EstateCrmProjectHistory[];
  readonly serviceHistory: readonly EstateCrmServiceHistory[];
  readonly warranty: EstateWarrantySummary;
  readonly maintenanceContract: EstateMaintenanceContract;
}

export interface EstatePropertyScores {
  readonly health: number;
  readonly security: number;
  readonly energy: number;
  readonly automation: number;
}

export interface EstatePropertyOperations {
  readonly powerKw: number;
  readonly monthlyEnergyKwh: number;
  readonly alertCount: number;
  readonly criticalAlertCount: number;
  readonly maintenanceCost: number;
  readonly assetValue: number;
}

export interface EstateMapPoint {
  readonly id: string;
  readonly propertyId: string;
  readonly label: string;
  readonly propertyType: EstatePropertyType;
  readonly location: EstateLocation;
  readonly status: EstateOperationalStatus;
  readonly healthScore: number;
  readonly connectivityPercent: number;
}

export interface EstatePropertyRecord {
  readonly id: string;
  readonly name: string;
  readonly propertyType: EstatePropertyType;
  readonly customerId: string;
  readonly customerName: string;
  readonly crmProfileId: string;
  readonly location: EstateLocation;
  readonly status: EstateOperationalStatus;
  readonly connectivityPercent: number;
  readonly blocks: readonly EstateBlockNode[];
  readonly buildings: readonly EstateBuildingNode[];
  readonly floors: readonly EstateFloorNode[];
  readonly rooms: readonly EstateRoomNode[];
  readonly devices: readonly EstateManagedDeviceRef[];
  readonly scores: EstatePropertyScores;
  readonly operations: EstatePropertyOperations;
  readonly crm: EstateCrmLink;
  readonly mapPoint: EstateMapPoint;
}

export interface EstateCustomerProfile {
  readonly id: string;
  readonly name: string;
  readonly crmProfileId: string;
  readonly propertyIds: readonly string[];
  readonly propertyCount: number;
  readonly activeProjectCount: number;
  readonly openServiceCount: number;
  readonly warrantyAssetValue: number;
  readonly maintenanceContractValue: number;
}

export interface EstateRolePolicy {
  readonly role: EstateRole;
  readonly label: string;
  readonly propertyScope: "all-properties" | "assigned-properties" | "guest-limited";
  readonly permissions: readonly string[];
  readonly propertyIds: readonly string[];
}

export interface EstateGlobalDashboard {
  readonly powerKw: number;
  readonly monthlyEnergyKwh: number;
  readonly securityScore: number;
  readonly automationScore: number;
  readonly alertCount: number;
  readonly criticalAlertCount: number;
  readonly maintenanceCost: number;
  readonly assetValue: number;
  readonly onlinePropertyCount: number;
  readonly warningPropertyCount: number;
  readonly criticalPropertyCount: number;
}

export interface EstateReportCard {
  readonly id: string;
  readonly propertyId: string;
  readonly type: EstateReportType;
  readonly title: string;
  readonly score: number | null;
  readonly value: number;
  readonly valueLabel: string;
  readonly trendLabel: string;
}

export interface EstateManagementReport {
  readonly propertyTypeCoverage: readonly EstatePropertyType[];
  readonly customerCount: number;
  readonly propertyCount: number;
  readonly blockCount: number;
  readonly buildingCount: number;
  readonly floorCount: number;
  readonly roomCount: number;
  readonly deviceCount: number;
  readonly mapPointCount: number;
  readonly roleCount: number;
  readonly reportCount: number;
  readonly dashboard: EstateGlobalDashboard;
  readonly crm: {
    readonly linkedCustomerProfiles: number;
    readonly projectHistoryEntries: number;
    readonly serviceHistoryEntries: number;
    readonly warrantyRecords: number;
    readonly maintenanceContracts: number;
    readonly externalCrmModified: false;
  };
  readonly hierarchy: {
    readonly estateToBlocks: true;
    readonly blocksToBuildings: true;
    readonly buildingsToFloors: true;
    readonly floorsToRooms: true;
    readonly roomsToDevices: true;
  };
  readonly reports: {
    readonly buildingHealth: true;
    readonly securityScore: true;
    readonly energyScore: true;
    readonly automationScore: true;
    readonly maintenanceCost: true;
    readonly assetValue: true;
  };
  readonly constraints: {
    readonly websiteFunctionality: "untouched";
    readonly authentication: "untouched";
    readonly apiRoutes: "untouched";
    readonly database: "untouched";
    readonly externalCrm: "untouched";
    readonly externalQuoteEngine: "untouched";
  };
}
