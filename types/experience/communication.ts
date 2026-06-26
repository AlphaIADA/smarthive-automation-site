export type SmartHomeProtocol =
  | "matter"
  | "thread"
  | "zigbee"
  | "z-wave"
  | "wifi"
  | "bluetooth-le"
  | "knx"
  | "modbus"
  | "bacnet"
  | "mqtt"
  | "home-assistant"
  | "tuya"
  | "shelly"
  | "sonoff"
  | "control4"
  | "lutron"
  | "crestron"
  | "savant";

export type CommunicationMode = "simulation" | "live-ready";
export type ProtocolPluginStatus = "active" | "degraded" | "offline" | "live-ready";
export type DriverHealthStatus = "healthy" | "warning" | "critical" | "simulated";
export type DriverRuntimeStatus = "online" | "offline" | "simulated" | "pending-live-sync";
export type DriverSource = "smart-device" | "security-device" | "lighting" | "switch" | "socket" | "virtual-bridge";

export interface ProtocolPluginVersion {
  readonly current: string;
  readonly latest: string;
  readonly updateAvailable: boolean;
  readonly managedBy: "experience-communication-layer";
}

export interface ProtocolPlugin {
  readonly id: SmartHomeProtocol;
  readonly name: string;
  readonly family: "ip" | "mesh" | "fieldbus" | "platform" | "vendor";
  readonly transport: readonly string[];
  readonly autoDiscovery: true;
  readonly healthMonitoring: true;
  readonly versionManagement: true;
  readonly simulationSupported: true;
  readonly liveModeSupported: "future";
  readonly status: ProtocolPluginStatus;
  readonly version: ProtocolPluginVersion;
}

export interface DeviceDriverEndpoint {
  readonly id: string;
  readonly name: string;
  readonly source: DriverSource;
  readonly sourceId: string;
  readonly roomId: string;
  readonly roomName: string;
  readonly manufacturer: string;
  readonly model: string;
  readonly firmwareVersion: string;
  readonly protocol: SmartHomeProtocol;
  readonly bridgeProtocol: SmartHomeProtocol | null;
  readonly position: readonly [number, number, number];
  readonly signalStrength: number;
  readonly online: boolean;
  readonly simulated: boolean;
  readonly liveSyncReady: boolean;
  readonly runtimeStatus: DriverRuntimeStatus;
  readonly healthStatus: DriverHealthStatus;
}

export interface ProtocolDiscoveryResult {
  readonly protocol: SmartHomeProtocol;
  readonly pluginId: SmartHomeProtocol;
  readonly discoveredEndpointCount: number;
  readonly simulatedEndpointCount: number;
  readonly liveEndpointCount: number;
  readonly healthStatus: DriverHealthStatus;
  readonly statusMessage: string;
}

export interface CommunicationHealthSnapshot {
  readonly endpointCount: number;
  readonly onlineCount: number;
  readonly offlineCount: number;
  readonly simulatedCount: number;
  readonly warningCount: number;
  readonly criticalCount: number;
  readonly averageSignalStrength: number;
  readonly lastCheckedLabel: string;
}

export interface CommunicationVersionSummary {
  readonly pluginCount: number;
  readonly currentCount: number;
  readonly updateAvailableCount: number;
  readonly managedVersioning: true;
}

export interface CommunicationLayerApi {
  readonly RegisterProtocolPlugin: "available";
  readonly DiscoverDevices: "available";
  readonly MonitorHealth: "available";
  readonly SimulateDevice: "available";
  readonly SwitchMode: "available";
  readonly PrepareLiveSync: "available";
  readonly routeHandlersCreated: false;
}

export interface UniversalCommunicationReport {
  readonly supportedProtocols: readonly SmartHomeProtocol[];
  readonly pluginCount: number;
  readonly driverEndpointCount: number;
  readonly discoveryResults: readonly ProtocolDiscoveryResult[];
  readonly health: CommunicationHealthSnapshot;
  readonly versions: CommunicationVersionSummary;
  readonly mode: {
    readonly simulationMode: true;
    readonly liveModeFutureSupport: true;
    readonly physicalDevicesRequiredNow: false;
  };
  readonly api: CommunicationLayerApi;
  readonly constraints: {
    readonly websiteFunctionality: "untouched";
    readonly apiRoutes: "untouched";
    readonly database: "untouched";
    readonly authentication: "untouched";
    readonly realDeviceConnections: "not-created";
  };
}
