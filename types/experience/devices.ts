import type { CameraVector } from "./camera";

export type SmartDeviceCategory =
  | "lighting"
  | "switches"
  | "sockets"
  | "curtains"
  | "blinds"
  | "thermostats"
  | "hvac"
  | "cctv"
  | "doorbells"
  | "smart-locks"
  | "motion-sensors"
  | "door-sensors"
  | "window-sensors"
  | "smoke-detector"
  | "gas-detector"
  | "water-leak-sensor"
  | "temperature-sensor"
  | "humidity-sensor"
  | "ir-blaster"
  | "smart-hub"
  | "voice-assistant"
  | "garage-controller"
  | "gate-controller"
  | "pool-controller"
  | "garden-irrigation"
  | "solar-inverter"
  | "battery-storage"
  | "ups"
  | "ev-charger"
  | "smart-tv"
  | "audio-system"
  | "coffee-machine"
  | "dishwasher"
  | "refrigerator"
  | "water-heater"
  | "smart-mirror";

export type SmartDevicePowerState = "on" | "off" | "standby";
export type SmartDeviceHealthStatus = "healthy" | "warning" | "service-required";
export type SmartDeviceOnlineStatus = "online" | "offline";
export type SmartDeviceConnectivity = "zigbee" | "z-wave" | "matter" | "thread" | "wifi" | "ethernet" | "bluetooth" | "knx" | "rs485" | "dry-contact";

export interface SmartDeviceBatteryStatus {
  readonly levelPercent: number;
  readonly charging: boolean;
  readonly replaceable: boolean;
}

export interface SmartDeviceWarranty {
  readonly years: number;
  readonly coverage: string;
}

export interface SmartDevicePowerConsumption {
  readonly standbyWatts: number;
  readonly activeWatts: number;
  readonly estimatedKwhPerYear: number;
}

export interface SmartDevicePricing {
  readonly equipmentPrice: number;
  readonly installationPrice: number;
  readonly currency: "USD";
}

export interface SmartDeviceAutomationHooks {
  readonly triggerHooks: readonly string[];
  readonly conditionHooks: readonly string[];
  readonly actionHooks: readonly string[];
  readonly automationReady: true;
  readonly implemented: false;
}

export interface SmartDevicePlaceholder {
  readonly position: [number, number, number];
  readonly size: [number, number, number];
  readonly color: string;
  readonly shape: "cube" | "panel" | "sensor" | "tower" | "disc";
  readonly icon: SmartDeviceCategory;
}

export interface SmartDeviceSpec {
  readonly uniqueId: string;
  readonly name: string;
  readonly category: SmartDeviceCategory;
  readonly manufacturer: string;
  readonly model: string;
  readonly firmwareVersion: string;
  readonly roomId: string;
  readonly roomName: string;
  readonly powerState: SmartDevicePowerState;
  readonly healthStatus: SmartDeviceHealthStatus;
  readonly batteryStatus: SmartDeviceBatteryStatus | null;
  readonly signalStrength: number;
  readonly onlineStatus: SmartDeviceOnlineStatus;
  readonly connectivity: SmartDeviceConnectivity;
  readonly pricing: SmartDevicePricing;
  readonly warranty: SmartDeviceWarranty;
  readonly powerConsumption: SmartDevicePowerConsumption;
  readonly futureAutomationHooks: SmartDeviceAutomationHooks;
  readonly placeholder: SmartDevicePlaceholder;
  readonly imagePlaceholder: {
    readonly label: string;
    readonly icon: SmartDeviceCategory;
  };
}

export interface SmartDeviceSnapshot extends SmartDeviceSpec {
  readonly room: {
    readonly id: string;
    readonly name: string;
  };
}

export interface SmartDeviceRoomRegistry {
  readonly roomId: string;
  readonly roomName: string;
  readonly devices: readonly SmartDeviceSnapshot[];
  readonly categoryCounts: Readonly<Record<SmartDeviceCategory, number>>;
}

export interface SmartDeviceSearchFilters {
  readonly query: string;
  readonly category: SmartDeviceCategory | "all";
  readonly manufacturer: string | "all";
  readonly roomId: string | "all";
  readonly onlineStatus: SmartDeviceOnlineStatus | "all";
}

export interface SmartDeviceApiResult {
  readonly ok: boolean;
  readonly device: SmartDeviceSnapshot | null;
  readonly message: string;
}

export interface SmartDeviceFrameworkReport {
  readonly deviceCount: number;
  readonly roomRegistryCount: number;
  readonly categoryCount: number;
  readonly manufacturerCount: number;
  readonly onlineCount: number;
  readonly offlineCount: number;
  readonly totalEquipmentPrice: number;
  readonly totalInstallationPrice: number;
  readonly totalActiveWatts: number;
  readonly everyRoomHasRegistry: boolean;
  readonly categories: readonly SmartDeviceCategory[];
  readonly constraints: {
    readonly automationLogic: "excluded";
    readonly ai: "excluded";
    readonly animation: "excluded";
    readonly externalApiRoutes: "excluded";
    readonly database: "excluded";
  };
}

export interface SmartDeviceSelectionTarget {
  readonly deviceId: string;
  readonly position: CameraVector;
}
