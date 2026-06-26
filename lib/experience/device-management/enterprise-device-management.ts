import { DEVICE_DRIVER_ENDPOINTS } from "@/lib/experience/communication";
import type {
  DeviceDriverEndpoint,
  DriverHealthStatus,
  EnterpriseAlertSeverity,
  EnterpriseAlertType,
  EnterpriseDeviceAction,
  EnterpriseDeviceAlert,
  EnterpriseDeviceCommandResult,
  EnterpriseDeviceGroup,
  EnterpriseDeviceLog,
  EnterpriseDeviceManagementReport,
  EnterpriseDeviceRecord,
  EnterpriseFirmwareState,
  EnterpriseInstallationStatus,
  EnterpriseInventoryCost,
  EnterpriseInventoryQuoteSummary,
  EnterpriseMaintenanceStatus,
  EnterpriseOtaPlan,
  EnterpriseProperty,
  SmartHomeProtocol,
} from "@/types/experience";

export const ENTERPRISE_PROPERTIES: readonly EnterpriseProperty[] = [
  {
    id: "property-signature-villa",
    name: "SmartHive Signature Villa",
    customerId: "customer-ultra-luxury",
    customerName: "Ultra Luxury Residential Client",
    buildingName: "Signature Villa",
    locationLabel: "Dubai Hills",
  },
  {
    id: "property-palm-estate",
    name: "Palm Jumeirah Smart Estate",
    customerId: "customer-palm-estate",
    customerName: "Palm Estate Owner",
    buildingName: "Palm Estate",
    locationLabel: "Palm Jumeirah",
  },
  {
    id: "property-executive-villa",
    name: "Riyadh Executive Villa",
    customerId: "customer-executive-villa",
    customerName: "Executive Villa Client",
    buildingName: "Executive Villa",
    locationLabel: "Riyadh",
  },
] as const;

function round(value: number, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function seed(value: string) {
  return value.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
}

function floorLabel(roomId: string) {
  if (roomId.startsWith("ff-")) return "First Floor";
  if (roomId.startsWith("gf-")) return "Ground Floor";
  if (roomId.includes("site") || roomId === "dtie-root") return "Site";
  return "Building";
}

function installationStatus(endpoint: DeviceDriverEndpoint, propertyIndex: number): EnterpriseInstallationStatus {
  const value = seed(`${endpoint.id}:${propertyIndex}`);
  if (!endpoint.online || endpoint.healthStatus === "critical") return "replacement";
  if (value % 29 === 0) return "rejected";
  if (value % 11 === 0) return "pending";
  return "installed";
}

function maintenanceStatus(health: DriverHealthStatus, installStatus: EnterpriseInstallationStatus, endpointId: string): EnterpriseMaintenanceStatus {
  if (installStatus === "replacement" || health === "critical") return "replacement-required";
  if (health === "warning") return "maintenance-due";
  if (seed(endpointId) % 17 === 0) return "maintenance-scheduled";
  return "normal";
}

function batteryPercent(endpoint: DeviceDriverEndpoint, propertyIndex: number) {
  if (endpoint.source === "virtual-bridge" || endpoint.source === "lighting" || endpoint.source === "switch" || endpoint.source === "socket") return null;
  const value = seed(`${endpoint.id}:battery:${propertyIndex}`);
  if (endpoint.source === "security-device" || endpoint.name.toLowerCase().includes("sensor") || endpoint.name.toLowerCase().includes("lock")) return 18 + (value % 79);
  if (value % 5 === 0) return 35 + (value % 55);
  return null;
}

function firmware(endpoint: DeviceDriverEndpoint, propertyIndex: number): EnterpriseFirmwareState {
  const value = seed(`${endpoint.id}:firmware:${propertyIndex}`);
  const major = Number(endpoint.firmwareVersion.split(".")[0]) || 1;
  const minor = value % 9;
  const patch = value % 6;
  const updateAvailable = value % 4 === 0 || endpoint.healthStatus === "warning";
  const currentVersion = endpoint.firmwareVersion || `${major}.${minor}.${patch}`;
  const latestVersion = updateAvailable ? `${major}.${minor + 1}.0` : currentVersion;

  return {
    currentVersion,
    latestVersion,
    updateAvailable,
    rollbackVersion: `${Math.max(1, major - 1)}.${minor}.${patch}`,
    versionHistory: [`${Math.max(1, major - 1)}.${minor}.${patch}`, currentVersion, latestVersion],
  };
}

function cost(endpoint: DeviceDriverEndpoint): EnterpriseInventoryCost {
  const sourceMultiplier = endpoint.source === "security-device" ? 1.25 : endpoint.source === "lighting" ? 0.65 : endpoint.source === "virtual-bridge" ? 0.35 : endpoint.source === "socket" ? 0.45 : endpoint.source === "switch" ? 0.5 : 1;
  const protocolMultiplier: Record<SmartHomeProtocol, number> = {
    matter: 1,
    thread: 0.92,
    zigbee: 0.82,
    "z-wave": 0.88,
    wifi: 0.78,
    "bluetooth-le": 0.72,
    knx: 1.32,
    modbus: 1.22,
    bacnet: 1.35,
    mqtt: 0.9,
    "home-assistant": 0.75,
    tuya: 0.68,
    shelly: 0.66,
    sonoff: 0.6,
    control4: 1.55,
    lutron: 1.5,
    crestron: 1.7,
    savant: 1.85,
  };
  const equipmentCost = round((120 + endpoint.model.length * 7 + endpoint.manufacturer.length * 5) * sourceMultiplier * protocolMultiplier[endpoint.protocol]);
  const installationCost = round(Math.max(55, equipmentCost * 0.38));
  const maintenanceReserve = round(equipmentCost * 0.08);
  const replacementReserve = round(equipmentCost * (endpoint.healthStatus === "critical" ? 0.25 : 0.12));

  return {
    equipmentCost,
    installationCost,
    maintenanceReserve,
    replacementReserve,
    totalInventoryCost: round(equipmentCost + installationCost + maintenanceReserve + replacementReserve),
    currency: "USD",
  };
}

function inventoryRecord(endpoint: DeviceDriverEndpoint, property: EnterpriseProperty, propertyIndex: number): EnterpriseDeviceRecord {
  const id = `enterprise-${property.id}-${endpoint.id}`;
  const installStatus = installationStatus(endpoint, propertyIndex);
  const deviceFirmware = firmware(endpoint, propertyIndex);
  const deviceBattery = batteryPercent(endpoint, propertyIndex);
  const endpointSeed = seed(id);

  return {
    id,
    propertyId: property.id,
    propertyName: property.name,
    customerId: property.customerId,
    customerName: property.customerName,
    buildingName: property.buildingName,
    floorLabel: floorLabel(endpoint.roomId),
    roomId: endpoint.roomId,
    roomName: endpoint.roomName,
    source: endpoint.source,
    sourceId: endpoint.sourceId,
    deviceName: endpoint.name,
    manufacturer: endpoint.manufacturer,
    model: endpoint.model,
    protocol: endpoint.protocol,
    bridgeProtocol: endpoint.bridgeProtocol,
    healthStatus: endpoint.healthStatus,
    runtimeStatus: endpoint.runtimeStatus,
    batteryPercent: deviceBattery,
    connectivityPercent: endpoint.signalStrength,
    installationStatus: installStatus,
    maintenanceStatus: maintenanceStatus(endpoint.healthStatus, installStatus, id),
    firmware: deviceFirmware,
    diagnostics: {
      signalStrength: endpoint.signalStrength,
      latencyMs: 12 + (endpointSeed % 170),
      packetLossPercent: round(endpoint.online ? (endpointSeed % 9) / 10 : 12.5),
      uptimeHours: endpoint.online ? 240 + (endpointSeed % 3200) : 0,
      lastDiagnosticLabel: "Enterprise simulation diagnostic",
      restartReady: true,
      resetReady: true,
    },
    cost: cost(endpoint),
  };
}

export const ENTERPRISE_DEVICE_INVENTORY: readonly EnterpriseDeviceRecord[] = ENTERPRISE_PROPERTIES.flatMap((property, propertyIndex) =>
  DEVICE_DRIVER_ENDPOINTS.map((endpoint) => inventoryRecord(endpoint, property, propertyIndex)),
);

function alertFor(record: EnterpriseDeviceRecord, type: EnterpriseAlertType, severity: EnterpriseAlertSeverity, title: string, description: string): EnterpriseDeviceAlert {
  return {
    id: `alert-${record.id}-${type}`,
    inventoryId: record.id,
    type,
    severity,
    title,
    description,
    acknowledged: false,
    timestampLabel: "Enterprise monitor snapshot",
  };
}

function alertsForRecord(record: EnterpriseDeviceRecord): readonly EnterpriseDeviceAlert[] {
  const alerts: EnterpriseDeviceAlert[] = [];

  if (record.batteryPercent !== null && record.batteryPercent < 28) {
    alerts.push(alertFor(record, "low-battery", "warning", "Low battery", `${record.deviceName} battery is ${record.batteryPercent}%.`));
  }
  if (record.runtimeStatus === "offline" || record.healthStatus === "critical") {
    alerts.push(alertFor(record, "offline", "critical", "Offline device", `${record.deviceName} is offline or critically unhealthy.`));
  }
  if (record.healthStatus === "warning" || record.maintenanceStatus === "maintenance-due") {
    alerts.push(alertFor(record, "fault", "warning", "Device fault", `${record.deviceName} requires maintenance diagnostics.`));
  }
  if (seed(`${record.id}:tamper`) % 113 === 0) {
    alerts.push(alertFor(record, "tampering", "critical", "Tampering risk", `${record.deviceName} reported simulated tamper risk.`));
  }
  if ((record.protocol === "bacnet" || record.protocol === "modbus" || record.source === "socket") && record.connectivityPercent < 75) {
    alerts.push(alertFor(record, "power-failure", "critical", "Power failure risk", `${record.deviceName} is mapped to a critical power path.`));
  }

  return alerts;
}

export const ENTERPRISE_DEVICE_ALERTS: readonly EnterpriseDeviceAlert[] = ENTERPRISE_DEVICE_INVENTORY.flatMap((record) => alertsForRecord(record));

export const ENTERPRISE_DEVICE_LOGS: readonly EnterpriseDeviceLog[] = ENTERPRISE_DEVICE_INVENTORY.flatMap((record, index) => [
  {
    id: `log-${record.id}-health`,
    inventoryId: record.id,
    timestampLabel: "Health polling cycle",
    level: record.healthStatus === "critical" ? "critical" : record.healthStatus === "warning" ? "warning" : "info",
    message: `${record.deviceName} health ${record.healthStatus} over ${record.protocol}.`,
  },
  {
    id: `log-${record.id}-connectivity`,
    inventoryId: record.id,
    timestampLabel: "Connectivity polling cycle",
    level: record.connectivityPercent < 70 ? "warning" : "info",
    message: `${record.connectivityPercent}% connectivity with ${record.diagnostics.latencyMs}ms latency.`,
  },
  ...(index % 6 === 0
    ? [
        {
          id: `log-${record.id}-ota`,
          inventoryId: record.id,
          timestampLabel: "OTA readiness cycle",
          level: record.firmware.updateAvailable ? "warning" : "info",
          message: record.firmware.updateAvailable ? `Firmware ${record.firmware.latestVersion} available.` : "Firmware current.",
        } satisfies EnterpriseDeviceLog,
      ]
    : []),
]);

export const ENTERPRISE_OTA_PLANS: readonly EnterpriseOtaPlan[] = ENTERPRISE_DEVICE_INVENTORY.filter((record) => record.firmware.updateAvailable).map((record, index) => ({
  id: `ota-${record.id}`,
  inventoryId: record.id,
  targetVersion: record.firmware.latestVersion,
  scheduledWindowLabel: `Maintenance Window ${1 + (index % 7)} 02:00`,
  status: index % 5 === 0 ? "scheduled" : "available",
  rollbackReady: true,
}));

function groupRecords(type: EnterpriseDeviceGroup["type"], label: (record: EnterpriseDeviceRecord) => string): readonly EnterpriseDeviceGroup[] {
  const groups = new Map<string, EnterpriseDeviceRecord[]>();

  ENTERPRISE_DEVICE_INVENTORY.forEach((record) => {
    const key = label(record);
    const records = groups.get(key) ?? [];
    records.push(record);
    groups.set(key, records);
  });

  return Array.from(groups.entries()).map(([key, records]) => {
    const alertInventoryIds = new Set(ENTERPRISE_DEVICE_ALERTS.map((alert) => alert.inventoryId));
    return {
      id: `group-${type}-${key.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      type,
      label: key,
      deviceCount: records.length,
      onlineCount: records.filter((record) => record.runtimeStatus !== "offline" && record.healthStatus !== "critical").length,
      alertCount: records.filter((record) => alertInventoryIds.has(record.id)).length,
      inventoryCost: round(records.reduce((total, record) => total + record.cost.totalInventoryCost, 0)),
    };
  });
}

export const ENTERPRISE_DEVICE_GROUPS: readonly EnterpriseDeviceGroup[] = [
  ...groupRecords("building", (record) => record.buildingName),
  ...groupRecords("floor", (record) => `${record.buildingName} / ${record.floorLabel}`),
  ...groupRecords("room", (record) => `${record.buildingName} / ${record.roomName}`),
  ...groupRecords("manufacturer", (record) => record.manufacturer),
  ...groupRecords("protocol", (record) => record.protocol),
  ...groupRecords("customer", (record) => record.customerName),
];

export function RunDeviceDiagnostics(inventoryId: string): EnterpriseDeviceCommandResult {
  return command(inventoryId, "diagnostics");
}

export function RestartDevice(inventoryId: string): EnterpriseDeviceCommandResult {
  return command(inventoryId, "restart");
}

export function ResetDevice(inventoryId: string): EnterpriseDeviceCommandResult {
  return command(inventoryId, "reset");
}

export function ScheduleMaintenance(inventoryId: string): EnterpriseDeviceCommandResult {
  return command(inventoryId, "maintenance");
}

export function MarkReplacement(inventoryId: string): EnterpriseDeviceCommandResult {
  return command(inventoryId, "replacement");
}

function command(inventoryId: string, action: EnterpriseDeviceAction): EnterpriseDeviceCommandResult {
  const record = ENTERPRISE_DEVICE_INVENTORY.find((candidate) => candidate.id === inventoryId);

  return {
    id: `command-${action}-${inventoryId}`,
    inventoryId,
    action,
    accepted: Boolean(record),
    simulated: true,
    message: record ? `${action} command recorded for ${record.deviceName}. No real device action was executed.` : "Unknown inventory device.",
    timestampLabel: "Enterprise command simulation",
  };
}

export function UpdateInstallationStatus(inventoryId: string, installationStatus: EnterpriseInstallationStatus): EnterpriseDeviceRecord | null {
  const record = ENTERPRISE_DEVICE_INVENTORY.find((candidate) => candidate.id === inventoryId);
  if (!record) return null;
  return {
    ...record,
    installationStatus,
    maintenanceStatus: installationStatus === "replacement" ? "replacement-required" : record.maintenanceStatus,
  };
}

export function ScheduleFirmwareUpdate(inventoryId: string): EnterpriseOtaPlan | null {
  return ENTERPRISE_OTA_PLANS.find((plan) => plan.inventoryId === inventoryId) ?? null;
}

export function RollbackFirmware(inventoryId: string): EnterpriseDeviceCommandResult {
  return command(inventoryId, "rollback");
}

export const EnterpriseDeviceManagementApi = {
  RunDeviceDiagnostics,
  RestartDevice,
  ResetDevice,
  ScheduleMaintenance,
  MarkReplacement,
  UpdateInstallationStatus,
  ScheduleFirmwareUpdate,
  RollbackFirmware,
} as const;

export const ENTERPRISE_INVENTORY_QUOTE_SUMMARY: EnterpriseInventoryQuoteSummary = {
  inventoryCount: ENTERPRISE_DEVICE_INVENTORY.length,
  equipmentCost: round(ENTERPRISE_DEVICE_INVENTORY.reduce((total, record) => total + record.cost.equipmentCost, 0)),
  installationCost: round(ENTERPRISE_DEVICE_INVENTORY.reduce((total, record) => total + record.cost.installationCost, 0)),
  maintenanceReserve: round(ENTERPRISE_DEVICE_INVENTORY.reduce((total, record) => total + record.cost.maintenanceReserve, 0)),
  replacementReserve: round(ENTERPRISE_DEVICE_INVENTORY.reduce((total, record) => total + record.cost.replacementReserve, 0)),
  totalCost: round(ENTERPRISE_DEVICE_INVENTORY.reduce((total, record) => total + record.cost.totalInventoryCost, 0)),
  currency: "USD",
  source: "experience-enterprise-device-management-internal-cost-model",
  existingQuotationEngineModified: false,
};

function countHealth(health: DriverHealthStatus) {
  return ENTERPRISE_DEVICE_INVENTORY.filter((record) => record.healthStatus === health).length;
}

function countInstall(status: EnterpriseInstallationStatus) {
  return ENTERPRISE_DEVICE_INVENTORY.filter((record) => record.installationStatus === status).length;
}

export const ENTERPRISE_DEVICE_MANAGEMENT_REPORT: EnterpriseDeviceManagementReport = {
  propertyCount: ENTERPRISE_PROPERTIES.length,
  inventoryCount: ENTERPRISE_DEVICE_INVENTORY.length,
  groupCount: ENTERPRISE_DEVICE_GROUPS.length,
  alertCount: ENTERPRISE_DEVICE_ALERTS.length,
  otaPlanCount: ENTERPRISE_OTA_PLANS.length,
  logCount: ENTERPRISE_DEVICE_LOGS.length,
  health: {
    healthyCount: countHealth("simulated") + countHealth("healthy"),
    warningCount: countHealth("warning"),
    criticalCount: countHealth("critical"),
    offlineCount: ENTERPRISE_DEVICE_INVENTORY.filter((record) => record.runtimeStatus === "offline").length,
    lowBatteryCount: ENTERPRISE_DEVICE_INVENTORY.filter((record) => record.batteryPercent !== null && record.batteryPercent < 28).length,
  },
  installation: {
    installedCount: countInstall("installed"),
    pendingCount: countInstall("pending"),
    rejectedCount: countInstall("rejected"),
    replacementCount: countInstall("replacement"),
  },
  ota: {
    updateAvailableCount: ENTERPRISE_DEVICE_INVENTORY.filter((record) => record.firmware.updateAvailable).length,
    scheduledCount: ENTERPRISE_OTA_PLANS.filter((plan) => plan.status === "scheduled").length,
    rollbackReadyCount: ENTERPRISE_OTA_PLANS.filter((plan) => plan.rollbackReady).length,
    versionHistoryReady: true,
  },
  grouping: {
    byBuilding: true,
    byFloor: true,
    byRoom: true,
    byManufacturer: true,
    byProtocol: true,
    byCustomer: true,
  },
  quote: ENTERPRISE_INVENTORY_QUOTE_SUMMARY,
  constraints: {
    websiteFunctionality: "untouched",
    apiRoutes: "untouched",
    database: "untouched",
    realDeviceActions: "not-executed",
    externalQuoteEngine: "untouched",
  },
};
