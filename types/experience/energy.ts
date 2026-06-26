export type EnergyMonitorScope = "smart-device" | "circuit" | "room" | "floor" | "villa";
export type EnergyFloorLevel = "ground" | "first" | "site";
export type EnergySourceType = "solar" | "battery" | "grid" | "generator" | "ups";
export type EnergySourceStatus = "active" | "standby" | "charging" | "discharging" | "offline";
export type EnergyFlowNodeType = EnergySourceType | "devices";
export type EnergyRecommendationType = "solar-size" | "battery-size" | "ups" | "circuit-upgrade" | "energy-product";
export type EnergyHeatmapLevel = "low" | "medium" | "high" | "critical";

export interface EnergyMetricSet {
  readonly instantConsumptionWatts: number;
  readonly dailyUsageKwh: number;
  readonly monthlyUsageKwh: number;
  readonly yearlyUsageKwh: number;
  readonly costUsd: number;
  readonly projectedCostUsd: number;
  readonly peakDemandKw: number;
  readonly powerFactor: number;
}

export interface EnergySmartDeviceMonitor {
  readonly id: string;
  readonly sourceDeviceId: string;
  readonly deviceName: string;
  readonly roomId: string;
  readonly roomName: string;
  readonly category: string;
  readonly scope: "smart-device";
  readonly metrics: EnergyMetricSet;
}

export interface EnergyCircuitMonitor {
  readonly id: string;
  readonly name: string;
  readonly scope: "circuit";
  readonly floorLevel: EnergyFloorLevel;
  readonly roomIds: readonly string[];
  readonly circuitType: "lighting" | "sockets" | "hvac" | "security" | "appliance" | "critical" | "outdoor" | "renewable";
  readonly breakerRatingAmps: number;
  readonly loadPercent: number;
  readonly upgradeRecommended: boolean;
  readonly metrics: EnergyMetricSet;
}

export interface EnergyRoomMonitor {
  readonly id: string;
  readonly roomId: string;
  readonly roomName: string;
  readonly scope: "room";
  readonly floorLevel: EnergyFloorLevel;
  readonly areaSqm: number;
  readonly deviceCount: number;
  readonly circuitIds: readonly string[];
  readonly metrics: EnergyMetricSet;
}

export interface EnergyFloorMonitor {
  readonly id: string;
  readonly floorLevel: EnergyFloorLevel;
  readonly name: string;
  readonly scope: "floor";
  readonly roomIds: readonly string[];
  readonly circuitIds: readonly string[];
  readonly metrics: EnergyMetricSet;
}

export interface EnergyVillaMonitor {
  readonly id: "energy-villa-total";
  readonly scope: "villa";
  readonly roomCount: number;
  readonly circuitCount: number;
  readonly smartDeviceCount: number;
  readonly floorCount: number;
  readonly metrics: EnergyMetricSet;
}

export interface EnergySource {
  readonly id: string;
  readonly type: EnergySourceType;
  readonly name: string;
  readonly status: EnergySourceStatus;
  readonly capacityKw: number;
  readonly currentKw: number;
  readonly stateOfChargePercent?: number;
  readonly runtimeHours?: number;
  readonly priority: number;
  readonly automaticSourceSwitching: boolean;
}

export interface EnergyPowerFlowEdge {
  readonly id: string;
  readonly from: EnergyFlowNodeType;
  readonly to: EnergyFlowNodeType;
  readonly kw: number;
  readonly animated: true;
  readonly label: string;
}

export interface EnergyHeatmapRoom {
  readonly roomId: string;
  readonly roomName: string;
  readonly floorLevel: EnergyFloorLevel;
  readonly level: EnergyHeatmapLevel;
  readonly color: string;
  readonly intensity: number;
  readonly position: readonly [number, number, number];
  readonly size: readonly [number, number];
  readonly metrics: EnergyMetricSet;
}

export interface EnergyRecommendation {
  readonly id: string;
  readonly type: EnergyRecommendationType;
  readonly title: string;
  readonly recommendation: string;
  readonly reason: string;
  readonly equipmentCost: number;
  readonly installationCost: number;
  readonly labourCost: number;
  readonly priority: "low" | "medium" | "high";
}

export interface EnergyQuoteSummary {
  readonly equipmentCost: number;
  readonly installationCost: number;
  readonly labourCost: number;
  readonly totalCost: number;
  readonly recommendations: readonly EnergyRecommendation[];
  readonly currency: "USD";
  readonly source: "experience-energy-internal-model";
  readonly existingQuotationEngineModified: false;
}

export interface EnergySystemReport {
  readonly smartDeviceMonitorCount: number;
  readonly circuitMonitorCount: number;
  readonly roomMonitorCount: number;
  readonly floorMonitorCount: number;
  readonly sourceCount: number;
  readonly heatmapRoomCount: number;
  readonly recommendationCount: number;
  readonly villa: EnergyVillaMonitor;
  readonly sources: readonly EnergySource[];
  readonly quoteSummary: EnergyQuoteSummary;
  readonly capabilities: {
    readonly monitorsEverySmartDevice: true;
    readonly monitorsEveryCircuit: true;
    readonly monitorsEveryRoom: true;
    readonly monitorsEveryFloor: true;
    readonly monitorsEntireVilla: true;
    readonly powerFlowAnimated: true;
    readonly automaticSourceSwitching: true;
    readonly heatmapReady: true;
  };
  readonly constraints: {
    readonly externalQuotationEngine: "untouched";
    readonly api: "untouched";
    readonly database: "untouched";
    readonly authentication: "untouched";
  };
}
