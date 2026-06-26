import { BAS_ENDPOINTS } from "@/lib/experience/automation/bas-registry";
import { SMART_DEVICES } from "@/lib/experience/devices/device-catalog";
import { INTERIOR_ROOMS } from "@/lib/experience/interior/room-registry";
import { ELECTRICAL_SOCKETS, ELECTRICAL_SWITCHES, LIGHTING_FIXTURES } from "@/lib/experience/lighting/lighting-catalog";
import { SECURITY_DEVICES } from "@/lib/experience/security/security-catalog";
import type {
  EnergyCircuitMonitor,
  EnergyFloorMonitor,
  EnergyHeatmapLevel,
  EnergyHeatmapRoom,
  EnergyPowerFlowEdge,
  EnergyQuoteSummary,
  EnergyRecommendation,
  EnergyRoomMonitor,
  EnergySmartDeviceMonitor,
  EnergySource,
  EnergySystemReport,
  EnergyVillaMonitor,
  InteriorRoom,
} from "@/types/experience";
import { combineEnergyMetrics, metricsFromDailyUsage, metricsFromWatts } from "./energy-calculations";

function round(value: number, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function getRoom(roomId: string) {
  return INTERIOR_ROOMS.find((room) => room.id === roomId) ?? null;
}

function devicePowerFactor(category: string) {
  if (category.includes("hvac") || category.includes("motor") || category.includes("pump")) return 0.88;
  if (category.includes("lighting")) return 0.96;
  if (category.includes("battery") || category.includes("solar") || category.includes("ups")) return 0.98;
  return 0.93;
}

export const ENERGY_SMART_DEVICE_MONITORS: readonly EnergySmartDeviceMonitor[] = SMART_DEVICES.map((device) => ({
  id: `energy-smart-${device.uniqueId}`,
  sourceDeviceId: device.uniqueId,
  deviceName: device.name,
  roomId: device.roomId,
  roomName: device.roomName,
  category: device.category,
  scope: "smart-device",
  metrics: {
    ...metricsFromDailyUsage(device.powerConsumption.estimatedKwhPerYear / 365, device.powerConsumption.activeWatts / 1000, devicePowerFactor(device.category)),
    instantConsumptionWatts: device.powerConsumption.activeWatts,
  },
}));

function lightingDailyKwh(roomId: string) {
  return LIGHTING_FIXTURES.filter((fixture) => fixture.roomId === roomId).reduce((total, fixture) => total + fixture.load.estimatedMonthlyKwh / 30, 0);
}

function lightingWatts(roomId: string) {
  const fixtureWatts = LIGHTING_FIXTURES.filter((fixture) => fixture.roomId === roomId).reduce((total, fixture) => total + fixture.load.consumptionWatts, 0);
  const switchWatts = ELECTRICAL_SWITCHES.filter((switchSpec) => switchSpec.roomId === roomId).reduce((total, switchSpec) => total + switchSpec.standbyWatts, 0);
  const socketWatts = ELECTRICAL_SOCKETS.filter((socket) => socket.roomId === roomId).reduce((total, socket) => total + socket.standbyWatts, 0);

  return fixtureWatts + switchWatts + socketWatts;
}

function securityWatts(roomId: string) {
  return SECURITY_DEVICES.filter((device) => device.roomId === roomId).reduce((total, device) => {
    if (device.category === "camera" || device.category === "intercom") return total + 9;
    if (device.category === "alarm") return total + 4;
    if (device.category === "access-control") return total + 3;
    return total + 0.8;
  }, 0);
}

function smartDeviceMetrics(roomId: string) {
  return ENERGY_SMART_DEVICE_MONITORS.filter((monitor) => monitor.roomId === roomId).map((monitor) => monitor.metrics);
}

function roomMetrics(room: InteriorRoom) {
  const baseline = metricsFromDailyUsage(room.futureEnergyConsumption.baselineKwhPerDay, room.futureEnergyConsumption.baselineKwhPerDay / 4, room.futureEnergyConsumption.profile === "high" ? 0.9 : 0.94);
  const lighting = metricsFromDailyUsage(lightingDailyKwh(room.id), lightingWatts(room.id) / 1000, 0.96);
  const security = metricsFromWatts(securityWatts(room.id), 24, 1.15, 0.91);
  return combineEnergyMetrics([baseline, lighting, security, ...smartDeviceMetrics(room.id)]);
}

export const ENERGY_ROOM_MONITORS: readonly EnergyRoomMonitor[] = INTERIOR_ROOMS.map((room) => ({
  id: `energy-room-${room.id}`,
  roomId: room.id,
  roomName: room.name,
  scope: "room",
  floorLevel: room.floorLevel,
  areaSqm: room.areaSqm,
  deviceCount:
    ENERGY_SMART_DEVICE_MONITORS.filter((monitor) => monitor.roomId === room.id).length +
    LIGHTING_FIXTURES.filter((fixture) => fixture.roomId === room.id).length +
    SECURITY_DEVICES.filter((device) => device.roomId === room.id).length,
  circuitIds: [`energy-circuit-${room.id}`],
  metrics: roomMetrics(room),
}));

function circuitTypeForRoom(room: InteriorRoom): EnergyCircuitMonitor["circuitType"] {
  if (room.futureEnergyConsumption.zone === "outdoor") return "outdoor";
  if (room.futureEnergyConsumption.zone === "service") return room.futureQuoteMapping.category === "kitchen" ? "appliance" : "critical";
  if (room.futureEnergyConsumption.zone === "wellness" || room.futureEnergyConsumption.zone === "entertainment") return "hvac";
  return "lighting";
}

export const ENERGY_CIRCUIT_MONITORS: readonly EnergyCircuitMonitor[] = [
  ...INTERIOR_ROOMS.map((room) => {
    const roomMonitor = ENERGY_ROOM_MONITORS.find((monitor) => monitor.roomId === room.id);
    const metrics = roomMonitor?.metrics ?? metricsFromDailyUsage(0, 0);
    const breakerRatingAmps = room.futureEnergyConsumption.profile === "high" ? 32 : room.futureEnergyConsumption.profile === "medium" ? 20 : 16;
    const loadPercent = Math.min(142, (metrics.peakDemandKw * 1000) / (breakerRatingAmps * 230) * 100);

    return {
      id: `energy-circuit-${room.id}`,
      name: `${room.name} Circuit`,
      scope: "circuit" as const,
      floorLevel: room.floorLevel,
      roomIds: [room.id],
      circuitType: circuitTypeForRoom(room),
      breakerRatingAmps,
      loadPercent: round(loadPercent),
      upgradeRecommended: loadPercent > 78,
      metrics,
    };
  }),
  {
    id: "energy-circuit-solar-inverter",
    name: "Solar Inverter Circuit",
    scope: "circuit",
    floorLevel: "site",
    roomIds: [],
    circuitType: "renewable",
    breakerRatingAmps: 63,
    loadPercent: 58,
    upgradeRecommended: false,
    metrics: metricsFromWatts(840, 6, 1.8, 0.98),
  },
  {
    id: "energy-circuit-ups-critical",
    name: "UPS Critical Loads",
    scope: "circuit",
    floorLevel: "site",
    roomIds: [],
    circuitType: "critical",
    breakerRatingAmps: 40,
    loadPercent: 64,
    upgradeRecommended: false,
    metrics: metricsFromWatts(620, 24, 1.5, 0.97),
  },
  {
    id: "energy-circuit-generator-transfer",
    name: "Generator Transfer Circuit",
    scope: "circuit",
    floorLevel: "site",
    roomIds: [],
    circuitType: "critical",
    breakerRatingAmps: 125,
    loadPercent: 42,
    upgradeRecommended: false,
    metrics: metricsFromWatts(180, 2, 3.2, 0.92),
  },
] as const;

export const ENERGY_FLOOR_MONITORS: readonly EnergyFloorMonitor[] = (["ground", "first", "site"] as const).map((level) => {
  const roomIds = level === "site" ? [] : INTERIOR_ROOMS.filter((room) => room.floorLevel === level).map((room) => room.id);
  const circuits = ENERGY_CIRCUIT_MONITORS.filter((circuit) => circuit.floorLevel === level);

  return {
    id: `energy-floor-${level}`,
    floorLevel: level,
    name: level === "ground" ? "Ground Floor" : level === "first" ? "First Floor" : "Site Infrastructure",
    scope: "floor",
    roomIds,
    circuitIds: circuits.map((circuit) => circuit.id),
    metrics: combineEnergyMetrics(circuits.map((circuit) => circuit.metrics)),
  };
});

export const ENERGY_VILLA_MONITOR: EnergyVillaMonitor = {
  id: "energy-villa-total",
  scope: "villa",
  roomCount: ENERGY_ROOM_MONITORS.length,
  circuitCount: ENERGY_CIRCUIT_MONITORS.length,
  smartDeviceCount: ENERGY_SMART_DEVICE_MONITORS.length,
  floorCount: ENERGY_FLOOR_MONITORS.length,
  metrics: combineEnergyMetrics(ENERGY_FLOOR_MONITORS.map((floor) => floor.metrics)),
};

export const ENERGY_SOURCES: readonly EnergySource[] = [
  { id: "energy-source-solar", type: "solar", name: "Solar Panels", status: "active", capacityKw: 28.8, currentKw: 18.7, priority: 1, automaticSourceSwitching: true },
  { id: "energy-source-battery", type: "battery", name: "Battery Storage", status: "discharging", capacityKw: 15, currentKw: 6.4, stateOfChargePercent: 74, runtimeHours: 7.8, priority: 2, automaticSourceSwitching: true },
  { id: "energy-source-grid", type: "grid", name: "Grid", status: "standby", capacityKw: 80, currentKw: 3.2, priority: 3, automaticSourceSwitching: true },
  { id: "energy-source-generator", type: "generator", name: "Generator", status: "standby", capacityKw: 45, currentKw: 0, runtimeHours: 0, priority: 4, automaticSourceSwitching: true },
  { id: "energy-source-ups", type: "ups", name: "UPS", status: "active", capacityKw: 12, currentKw: 2.1, stateOfChargePercent: 92, runtimeHours: 1.9, priority: 5, automaticSourceSwitching: true },
] as const;

export const ENERGY_POWER_FLOWS: readonly EnergyPowerFlowEdge[] = [
  { id: "flow-solar-battery", from: "solar", to: "battery", kw: 7.1, animated: true, label: "Solar charging battery" },
  { id: "flow-solar-grid", from: "solar", to: "grid", kw: 1.8, animated: true, label: "Solar export" },
  { id: "flow-solar-devices", from: "solar", to: "devices", kw: 9.8, animated: true, label: "Solar to devices" },
  { id: "flow-battery-devices", from: "battery", to: "devices", kw: 6.4, animated: true, label: "Battery support" },
  { id: "flow-grid-devices", from: "grid", to: "devices", kw: 3.2, animated: true, label: "Grid support" },
  { id: "flow-generator-ups", from: "generator", to: "ups", kw: 0, animated: true, label: "Generator standby" },
  { id: "flow-ups-devices", from: "ups", to: "devices", kw: 2.1, animated: true, label: "UPS critical loads" },
] as const;

function heatmapLevel(intensity: number): EnergyHeatmapLevel {
  if (intensity >= 0.82) return "critical";
  if (intensity >= 0.62) return "high";
  if (intensity >= 0.34) return "medium";
  return "low";
}

function heatmapColor(level: EnergyHeatmapLevel) {
  if (level === "critical") return "#ff4d5f";
  if (level === "high") return "#ffb347";
  if (level === "medium") return "#f6e27f";
  return "#69e6a3";
}

export const ENERGY_HEATMAP_ROOMS: readonly EnergyHeatmapRoom[] = ENERGY_ROOM_MONITORS.map((monitor) => {
  const room = getRoom(monitor.roomId);
  const maxWatts = Math.max(...ENERGY_ROOM_MONITORS.map((roomMonitor) => roomMonitor.metrics.instantConsumptionWatts));
  const intensity = maxWatts > 0 ? monitor.metrics.instantConsumptionWatts / maxWatts : 0;
  const level = heatmapLevel(intensity);
  const x = room ? (room.boundingBox.min.x + room.boundingBox.max.x) / 2 : 0;
  const z = room ? (room.boundingBox.min.z + room.boundingBox.max.z) / 2 : 0;
  const y = room ? room.boundingBox.min.y + 0.045 : 0.12;
  const width = room ? Math.abs(room.boundingBox.max.x - room.boundingBox.min.x) : 1;
  const depth = room ? Math.abs(room.boundingBox.max.z - room.boundingBox.min.z) : 1;

  return {
    roomId: monitor.roomId,
    roomName: monitor.roomName,
    floorLevel: monitor.floorLevel,
    level,
    color: heatmapColor(level),
    intensity: round(intensity, 3),
    position: [x, y, z],
    size: [width, depth],
    metrics: monitor.metrics,
  };
});

export const ENERGY_RECOMMENDATIONS: readonly EnergyRecommendation[] = [
  {
    id: "energy-rec-solar-size",
    type: "solar-size",
    title: "Solar Size",
    recommendation: "Install a 32kW premium monocrystalline solar array.",
    reason: `Villa projected annual usage is ${ENERGY_VILLA_MONITOR.metrics.yearlyUsageKwh.toLocaleString()}kWh with daytime load suitable for larger PV coverage.`,
    equipmentCost: 52000,
    installationCost: 14000,
    labourCost: 6500,
    priority: "high",
  },
  {
    id: "energy-rec-battery-size",
    type: "battery-size",
    title: "Battery Size",
    recommendation: "Use 60kWh lithium battery storage.",
    reason: "Supports evening peak shaving, UPS bridge, and generator delay strategy.",
    equipmentCost: 42000,
    installationCost: 9500,
    labourCost: 4800,
    priority: "high",
  },
  {
    id: "energy-rec-ups",
    type: "ups",
    title: "UPS",
    recommendation: "Add 15kVA online UPS for BAS, network, security, gate, and critical lighting.",
    reason: "Critical loads require clean power during source transitions.",
    equipmentCost: 11800,
    installationCost: 3200,
    labourCost: 1800,
    priority: "high",
  },
  {
    id: "energy-rec-circuit-upgrade",
    type: "circuit-upgrade",
    title: "Circuit Upgrade",
    recommendation: "Upgrade high-load kitchen, HVAC, cinema, and utility circuits.",
    reason: `${ENERGY_CIRCUIT_MONITORS.filter((circuit) => circuit.upgradeRecommended).length} circuits exceed the preferred load planning threshold.`,
    equipmentCost: 8500,
    installationCost: 6100,
    labourCost: 3900,
    priority: "medium",
  },
  {
    id: "energy-rec-energy-products",
    type: "energy-product",
    title: "Energy Products",
    recommendation: "Add smart meters, CT clamps, source transfer controller, and panel-level monitoring.",
    reason: "Required for real-time monitoring of every device, room, floor, and source path.",
    equipmentCost: 16400,
    installationCost: 5400,
    labourCost: 3200,
    priority: "high",
  },
] as const;

export const ENERGY_QUOTE_SUMMARY: EnergyQuoteSummary = {
  equipmentCost: ENERGY_RECOMMENDATIONS.reduce((total, item) => total + item.equipmentCost, 0),
  installationCost: ENERGY_RECOMMENDATIONS.reduce((total, item) => total + item.installationCost, 0),
  labourCost: ENERGY_RECOMMENDATIONS.reduce((total, item) => total + item.labourCost, 0),
  totalCost: ENERGY_RECOMMENDATIONS.reduce((total, item) => total + item.equipmentCost + item.installationCost + item.labourCost, 0),
  recommendations: ENERGY_RECOMMENDATIONS,
  currency: "USD",
  source: "experience-energy-internal-model",
  existingQuotationEngineModified: false,
};

export const ENERGY_SYSTEM_REPORT: EnergySystemReport = {
  smartDeviceMonitorCount: ENERGY_SMART_DEVICE_MONITORS.length,
  circuitMonitorCount: ENERGY_CIRCUIT_MONITORS.length,
  roomMonitorCount: ENERGY_ROOM_MONITORS.length,
  floorMonitorCount: ENERGY_FLOOR_MONITORS.length,
  sourceCount: ENERGY_SOURCES.length,
  heatmapRoomCount: ENERGY_HEATMAP_ROOMS.length,
  recommendationCount: ENERGY_RECOMMENDATIONS.length,
  villa: ENERGY_VILLA_MONITOR,
  sources: ENERGY_SOURCES,
  quoteSummary: ENERGY_QUOTE_SUMMARY,
  capabilities: {
    monitorsEverySmartDevice: true,
    monitorsEveryCircuit: true,
    monitorsEveryRoom: true,
    monitorsEveryFloor: true,
    monitorsEntireVilla: true,
    powerFlowAnimated: true,
    automaticSourceSwitching: true,
    heatmapReady: true,
  },
  constraints: {
    externalQuotationEngine: "untouched",
    api: "untouched",
    database: "untouched",
    authentication: "untouched",
  },
};

export function getEnergyRoomMonitor(roomId: string) {
  return ENERGY_ROOM_MONITORS.find((monitor) => monitor.roomId === roomId) ?? null;
}

export function getEnergyCircuitMonitor(circuitId: string) {
  return ENERGY_CIRCUIT_MONITORS.find((monitor) => monitor.id === circuitId) ?? null;
}

export function basEnergyEndpointCount() {
  return BAS_ENDPOINTS.filter((endpoint) => endpoint.domain === "energy").length;
}
