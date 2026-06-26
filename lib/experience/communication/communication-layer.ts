import { SMART_DEVICES } from "@/lib/experience/devices/device-catalog";
import { LIGHTING_FIXTURES, ELECTRICAL_SWITCHES, ELECTRICAL_SOCKETS } from "@/lib/experience/lighting/lighting-catalog";
import { SECURITY_DEVICES } from "@/lib/experience/security/security-catalog";
import type {
  CommunicationHealthSnapshot,
  CommunicationMode,
  CommunicationVersionSummary,
  DeviceDriverEndpoint,
  DriverHealthStatus,
  DriverSource,
  ProtocolDiscoveryResult,
  ProtocolPlugin,
  SmartDeviceConnectivity,
  SmartHomeProtocol,
  UniversalCommunicationReport,
} from "@/types/experience";

export const SUPPORTED_SMART_HOME_PROTOCOLS: readonly SmartHomeProtocol[] = [
  "matter",
  "thread",
  "zigbee",
  "z-wave",
  "wifi",
  "bluetooth-le",
  "knx",
  "modbus",
  "bacnet",
  "mqtt",
  "home-assistant",
  "tuya",
  "shelly",
  "sonoff",
  "control4",
  "lutron",
  "crestron",
  "savant",
] as const;

const PROTOCOL_LABELS: Record<SmartHomeProtocol, string> = {
  matter: "Matter",
  thread: "Thread",
  zigbee: "Zigbee",
  "z-wave": "Z-Wave",
  wifi: "WiFi",
  "bluetooth-le": "Bluetooth LE",
  knx: "KNX",
  modbus: "Modbus",
  bacnet: "BACnet",
  mqtt: "MQTT",
  "home-assistant": "Home Assistant",
  tuya: "Tuya",
  shelly: "Shelly",
  sonoff: "Sonoff",
  control4: "Control4",
  lutron: "Lutron",
  crestron: "Crestron",
  savant: "Savant",
};

const PROTOCOL_FAMILY: Record<SmartHomeProtocol, ProtocolPlugin["family"]> = {
  matter: "ip",
  thread: "mesh",
  zigbee: "mesh",
  "z-wave": "mesh",
  wifi: "ip",
  "bluetooth-le": "mesh",
  knx: "fieldbus",
  modbus: "fieldbus",
  bacnet: "fieldbus",
  mqtt: "ip",
  "home-assistant": "platform",
  tuya: "platform",
  shelly: "vendor",
  sonoff: "vendor",
  control4: "vendor",
  lutron: "vendor",
  crestron: "vendor",
  savant: "vendor",
};

const PROTOCOL_TRANSPORTS: Record<SmartHomeProtocol, readonly string[]> = {
  matter: ["Thread", "WiFi", "Ethernet"],
  thread: ["IEEE 802.15.4 mesh"],
  zigbee: ["IEEE 802.15.4 mesh"],
  "z-wave": ["Sub-GHz mesh"],
  wifi: ["WiFi LAN"],
  "bluetooth-le": ["Bluetooth LE"],
  knx: ["KNX TP", "KNX IP"],
  modbus: ["RS-485", "TCP"],
  bacnet: ["BACnet/IP", "MS/TP"],
  mqtt: ["TCP", "WebSocket"],
  "home-assistant": ["REST", "WebSocket", "MQTT"],
  tuya: ["Cloud", "LAN"],
  shelly: ["CoAP", "MQTT", "HTTP"],
  sonoff: ["eWeLink LAN", "MQTT"],
  control4: ["Composer driver bus"],
  lutron: ["LEAP", "Telnet bridge"],
  crestron: ["CIP", "REST bridge"],
  savant: ["Savant host bridge"],
};

const CONNECTIVITY_PROTOCOL_MAP: Record<SmartDeviceConnectivity, SmartHomeProtocol> = {
  matter: "matter",
  thread: "thread",
  zigbee: "zigbee",
  "z-wave": "z-wave",
  wifi: "wifi",
  ethernet: "mqtt",
  bluetooth: "bluetooth-le",
  knx: "knx",
  rs485: "modbus",
  "dry-contact": "control4",
};

function round(value: number, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function protocolVersion(protocol: SmartHomeProtocol, index: number) {
  const major = 1 + (index % 4);
  const minor = 2 + (index % 7);
  const patch = index % 9;
  const updateAvailable = index % 6 === 0;

  return {
    current: `${major}.${minor}.${patch}`,
    latest: updateAvailable ? `${major}.${minor + 1}.0` : `${major}.${minor}.${patch}`,
    updateAvailable,
    managedBy: "experience-communication-layer" as const,
  };
}

export const PROTOCOL_PLUGINS: readonly ProtocolPlugin[] = SUPPORTED_SMART_HOME_PROTOCOLS.map((protocol, index) => ({
  id: protocol,
  name: `${PROTOCOL_LABELS[protocol]} Plugin`,
  family: PROTOCOL_FAMILY[protocol],
  transport: PROTOCOL_TRANSPORTS[protocol],
  autoDiscovery: true,
  healthMonitoring: true,
  versionManagement: true,
  simulationSupported: true,
  liveModeSupported: "future",
  status: index % 11 === 0 ? "degraded" : "active",
  version: protocolVersion(protocol, index),
}));

function driverHealth(online: boolean, signalStrength: number, warning: boolean): DriverHealthStatus {
  if (!online) return "critical";
  if (warning || signalStrength < 68) return "warning";
  return "simulated";
}

function vendorBridgeProtocol(manufacturer: string, preferred: SmartHomeProtocol): SmartHomeProtocol | null {
  const normalized = manufacturer.toLowerCase();
  if (normalized.includes("lutron")) return "lutron";
  if (normalized.includes("shelly")) return "shelly";
  if (normalized.includes("sonoff")) return "sonoff";
  if (normalized.includes("tuya")) return "tuya";
  if (normalized.includes("basalte") || normalized.includes("schneider")) return "knx";
  if (normalized.includes("crestron")) return "crestron";
  if (normalized.includes("savant")) return "savant";
  if (normalized.includes("control4")) return "control4";
  if (preferred === "wifi" || preferred === "mqtt") return "home-assistant";
  return null;
}

function endpoint(
  source: DriverSource,
  sourceId: string,
  name: string,
  roomId: string,
  roomName: string,
  manufacturer: string,
  model: string,
  firmwareVersion: string,
  protocol: SmartHomeProtocol,
  position: readonly [number, number, number],
  options: {
    readonly signalStrength?: number;
    readonly online?: boolean;
    readonly warning?: boolean;
    readonly bridgeProtocol?: SmartHomeProtocol | null;
  } = {},
): DeviceDriverEndpoint {
  const signalStrength = options.signalStrength ?? 82;
  const online = options.online ?? true;
  const healthStatus = driverHealth(online, signalStrength, options.warning ?? false);

  return {
    id: `driver-${source}-${sourceId}`,
    name,
    source,
    sourceId,
    roomId,
    roomName,
    manufacturer,
    model,
    firmwareVersion,
    protocol,
    bridgeProtocol: options.bridgeProtocol ?? vendorBridgeProtocol(manufacturer, protocol),
    position,
    signalStrength,
    online,
    simulated: true,
    liveSyncReady: true,
    runtimeStatus: online ? "simulated" : "offline",
    healthStatus,
  };
}

function smartDeviceEndpoints(): readonly DeviceDriverEndpoint[] {
  return SMART_DEVICES.map((device) => {
    const protocol = CONNECTIVITY_PROTOCOL_MAP[device.connectivity];
    return endpoint(
      "smart-device",
      device.uniqueId,
      device.name,
      device.roomId,
      device.roomName,
      device.manufacturer,
      device.model,
      device.firmwareVersion,
      protocol,
      device.placeholder.position,
      {
        signalStrength: device.signalStrength,
        online: device.onlineStatus === "online",
        warning: device.healthStatus !== "healthy",
      },
    );
  });
}

function securityProtocol(manufacturer: string): SmartHomeProtocol {
  const normalized = manufacturer.toLowerCase();
  if (normalized.includes("axis") || normalized.includes("doorbird") || normalized.includes("2n")) return "mqtt";
  if (normalized.includes("aqara")) return "thread";
  if (normalized.includes("ajax")) return "mqtt";
  if (normalized.includes("honeywell") || normalized.includes("bosch")) return "z-wave";
  if (normalized.includes("yale")) return "matter";
  if (normalized.includes("hid")) return "knx";
  return "home-assistant";
}

function securityEndpoints(): readonly DeviceDriverEndpoint[] {
  return SECURITY_DEVICES.map((device) =>
    endpoint(
      "security-device",
      device.id,
      device.name,
      device.roomId,
      device.roomName,
      device.manufacturer,
      device.model,
      device.firmwareVersion,
      securityProtocol(device.manufacturer),
      device.render.position,
      {
        signalStrength: device.signalStrength,
        online: device.onlineStatus === "online",
        warning: device.healthStatus !== "healthy",
      },
    ),
  );
}

function lightingEndpoints(): readonly DeviceDriverEndpoint[] {
  const fixtureEndpoints = LIGHTING_FIXTURES.map((fixture) =>
    endpoint(
      "lighting",
      fixture.id,
      fixture.name,
      fixture.roomId,
      fixture.roomName,
      fixture.manufacturer,
      fixture.model,
      "1.0.0",
      fixture.manufacturer.toLowerCase().includes("lutron") ? "lutron" : "matter",
      fixture.render.position,
      {
        signalStrength: fixture.render.lod === "near" ? 91 : fixture.render.lod === "mid" ? 83 : 76,
        bridgeProtocol: "home-assistant",
      },
    ),
  );
  const switchEndpoints = ELECTRICAL_SWITCHES.map((switchSpec) =>
    endpoint(
      "switch",
      switchSpec.id,
      switchSpec.name,
      switchSpec.roomId,
      switchSpec.roomName,
      switchSpec.manufacturer,
      switchSpec.model,
      "1.0.0",
      switchSpec.manufacturer.toLowerCase().includes("lutron") ? "lutron" : switchSpec.manufacturer.toLowerCase().includes("basalte") ? "knx" : "matter",
      switchSpec.position,
      { signalStrength: switchSpec.wireless ? 78 : 94 },
    ),
  );
  const socketEndpoints = ELECTRICAL_SOCKETS.map((socket) =>
    endpoint(
      "socket",
      socket.id,
      socket.name,
      socket.roomId,
      socket.roomName,
      socket.manufacturer,
      socket.model,
      "1.0.0",
      socket.solarBacked ? "modbus" : socket.upsBacked ? "bacnet" : socket.type === "smart-socket" ? "matter" : "knx",
      socket.position,
      { signalStrength: socket.type === "outdoor-socket" ? 73 : 88 },
    ),
  );

  return [...fixtureEndpoints, ...switchEndpoints, ...socketEndpoints];
}

function virtualBridgeEndpoints(): readonly DeviceDriverEndpoint[] {
  return SUPPORTED_SMART_HOME_PROTOCOLS.map((protocol, index) =>
    endpoint(
      "virtual-bridge",
      protocol,
      `${PROTOCOL_LABELS[protocol]} Virtual Bridge`,
      "dtie-root",
      "SmartHive Digital Twin",
      "SmartHive",
      `${PROTOCOL_LABELS[protocol]} Bridge`,
      PROTOCOL_PLUGINS[index]?.version.current ?? "1.0.0",
      protocol,
      [16 + (index % 6) * 0.55, 8.2, -10 + Math.floor(index / 6) * 0.55],
      {
        signalStrength: 100,
        bridgeProtocol: null,
      },
    ),
  );
}

export const DEVICE_DRIVER_ENDPOINTS: readonly DeviceDriverEndpoint[] = [
  ...smartDeviceEndpoints(),
  ...securityEndpoints(),
  ...lightingEndpoints(),
  ...virtualBridgeEndpoints(),
];

export function RegisterProtocolPlugin(plugin: ProtocolPlugin): readonly ProtocolPlugin[] {
  if (PROTOCOL_PLUGINS.some((existingPlugin) => existingPlugin.id === plugin.id)) return PROTOCOL_PLUGINS;
  return [...PROTOCOL_PLUGINS, plugin];
}

export function DiscoverDevices(protocol: SmartHomeProtocol | "all" = "all"): readonly ProtocolDiscoveryResult[] {
  const protocols = protocol === "all" ? SUPPORTED_SMART_HOME_PROTOCOLS : [protocol];

  return protocols.map((currentProtocol) => {
    const endpoints = DEVICE_DRIVER_ENDPOINTS.filter((endpoint) => endpoint.protocol === currentProtocol || endpoint.bridgeProtocol === currentProtocol);
    const criticalCount = endpoints.filter((endpoint) => endpoint.healthStatus === "critical").length;
    const warningCount = endpoints.filter((endpoint) => endpoint.healthStatus === "warning").length;
    const healthStatus: DriverHealthStatus = criticalCount > 0 ? "critical" : warningCount > 0 ? "warning" : "simulated";

    return {
      protocol: currentProtocol,
      pluginId: currentProtocol,
      discoveredEndpointCount: endpoints.length,
      simulatedEndpointCount: endpoints.filter((endpoint) => endpoint.simulated).length,
      liveEndpointCount: 0,
      healthStatus,
      statusMessage: endpoints.length > 0 ? `${PROTOCOL_LABELS[currentProtocol]} discovery simulated with ${endpoints.length} endpoints.` : `${PROTOCOL_LABELS[currentProtocol]} plugin ready; no endpoints discovered yet.`,
    };
  });
}

export function MonitorHealth(): CommunicationHealthSnapshot {
  const endpointCount = DEVICE_DRIVER_ENDPOINTS.length;
  const onlineCount = DEVICE_DRIVER_ENDPOINTS.filter((endpoint) => endpoint.online).length;
  const warningCount = DEVICE_DRIVER_ENDPOINTS.filter((endpoint) => endpoint.healthStatus === "warning").length;
  const criticalCount = DEVICE_DRIVER_ENDPOINTS.filter((endpoint) => endpoint.healthStatus === "critical").length;

  return {
    endpointCount,
    onlineCount,
    offlineCount: endpointCount - onlineCount,
    simulatedCount: DEVICE_DRIVER_ENDPOINTS.filter((endpoint) => endpoint.simulated).length,
    warningCount,
    criticalCount,
    averageSignalStrength: round(DEVICE_DRIVER_ENDPOINTS.reduce((total, endpoint) => total + endpoint.signalStrength, 0) / endpointCount),
    lastCheckedLabel: "Simulation health snapshot",
  };
}

export function SimulateDevice(endpointId: string): DeviceDriverEndpoint | null {
  const endpoint = DEVICE_DRIVER_ENDPOINTS.find((candidate) => candidate.id === endpointId);
  if (!endpoint) return null;
  return {
    ...endpoint,
    simulated: true,
    runtimeStatus: "simulated",
    healthStatus: endpoint.online ? "simulated" : "critical",
  };
}

export function SwitchMode(mode: CommunicationMode): CommunicationMode {
  return mode;
}

export function PrepareLiveSync(): readonly DeviceDriverEndpoint[] {
  return DEVICE_DRIVER_ENDPOINTS.map((endpoint) => ({
    ...endpoint,
    runtimeStatus: "pending-live-sync" as const,
    liveSyncReady: true,
  }));
}

export const CommunicationLayerApi = {
  RegisterProtocolPlugin,
  DiscoverDevices,
  MonitorHealth,
  SimulateDevice,
  SwitchMode,
  PrepareLiveSync,
} as const;

export const COMMUNICATION_DISCOVERY_RESULTS: readonly ProtocolDiscoveryResult[] = DiscoverDevices();
export const COMMUNICATION_HEALTH_SNAPSHOT = MonitorHealth();
export const COMMUNICATION_VERSION_SUMMARY: CommunicationVersionSummary = {
  pluginCount: PROTOCOL_PLUGINS.length,
  currentCount: PROTOCOL_PLUGINS.filter((plugin) => !plugin.version.updateAvailable).length,
  updateAvailableCount: PROTOCOL_PLUGINS.filter((plugin) => plugin.version.updateAvailable).length,
  managedVersioning: true,
};

export const UNIVERSAL_COMMUNICATION_REPORT: UniversalCommunicationReport = {
  supportedProtocols: SUPPORTED_SMART_HOME_PROTOCOLS,
  pluginCount: PROTOCOL_PLUGINS.length,
  driverEndpointCount: DEVICE_DRIVER_ENDPOINTS.length,
  discoveryResults: COMMUNICATION_DISCOVERY_RESULTS,
  health: COMMUNICATION_HEALTH_SNAPSHOT,
  versions: COMMUNICATION_VERSION_SUMMARY,
  mode: {
    simulationMode: true,
    liveModeFutureSupport: true,
    physicalDevicesRequiredNow: false,
  },
  api: {
    RegisterProtocolPlugin: "available",
    DiscoverDevices: "available",
    MonitorHealth: "available",
    SimulateDevice: "available",
    SwitchMode: "available",
    PrepareLiveSync: "available",
    routeHandlersCreated: false,
  },
  constraints: {
    websiteFunctionality: "untouched",
    apiRoutes: "untouched",
    database: "untouched",
    authentication: "untouched",
    realDeviceConnections: "not-created",
  },
};
