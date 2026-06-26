import { SMART_DEVICES } from "@/lib/experience/devices/device-catalog";
import { INTERIOR_ROOMS } from "@/lib/experience/interior/room-registry";
import { ELECTRICAL_SOCKETS, ELECTRICAL_SWITCHES, LIGHTING_FIXTURES, LIGHTING_POWER_SUMMARY } from "@/lib/experience/lighting/lighting-catalog";
import { SECURITY_DEVICES } from "@/lib/experience/security/security-catalog";
import type { BasActionKind, BasDomain, BasEndpoint, SmartDeviceCategory } from "@/types/experience";

export const BAS_DOMAINS: readonly BasDomain[] = [
  "lighting",
  "curtains",
  "hvac",
  "audio",
  "security",
  "energy",
  "pool",
  "garden",
  "garage",
  "gate",
  "water",
  "appliances",
  "future-devices",
] as const;

const SMART_DEVICE_DOMAIN_MAP: Record<SmartDeviceCategory, BasDomain> = {
  lighting: "lighting",
  switches: "lighting",
  sockets: "energy",
  curtains: "curtains",
  blinds: "curtains",
  thermostats: "hvac",
  hvac: "hvac",
  cctv: "security",
  doorbells: "security",
  "smart-locks": "security",
  "motion-sensors": "security",
  "door-sensors": "security",
  "window-sensors": "security",
  "smoke-detector": "security",
  "gas-detector": "security",
  "water-leak-sensor": "water",
  "temperature-sensor": "hvac",
  "humidity-sensor": "hvac",
  "ir-blaster": "future-devices",
  "smart-hub": "future-devices",
  "voice-assistant": "future-devices",
  "garage-controller": "garage",
  "gate-controller": "gate",
  "pool-controller": "pool",
  "garden-irrigation": "garden",
  "solar-inverter": "energy",
  "battery-storage": "energy",
  ups: "energy",
  "ev-charger": "energy",
  "smart-tv": "audio",
  "audio-system": "audio",
  "coffee-machine": "appliances",
  dishwasher: "appliances",
  refrigerator: "appliances",
  "water-heater": "water",
  "smart-mirror": "future-devices",
};

function capabilitiesForDomain(domain: BasDomain): readonly BasActionKind[] {
  if (domain === "lighting") return ["set-device-state", "set-lighting", "notify"];
  if (domain === "curtains") return ["set-device-state", "set-curtains", "notify"];
  if (domain === "hvac") return ["set-device-state", "set-hvac", "notify"];
  if (domain === "audio") return ["set-device-state", "set-audio", "notify"];
  if (domain === "security") return ["set-device-state", "set-security-mode", "notify", "fail-safe"];
  if (domain === "energy") return ["set-device-state", "notify", "fail-safe"];
  if (domain === "pool") return ["set-device-state", "set-pool", "notify"];
  if (domain === "garden") return ["set-device-state", "set-garden", "notify"];
  if (domain === "garage") return ["set-device-state", "set-garage", "notify"];
  if (domain === "gate") return ["set-device-state", "set-gate", "notify"];
  if (domain === "water") return ["set-device-state", "set-water", "notify", "fail-safe"];
  if (domain === "appliances") return ["set-device-state", "set-appliance", "notify"];
  return ["set-device-state", "notify"];
}

function smartDeviceEndpoints(): readonly BasEndpoint[] {
  return SMART_DEVICES.map((device) => {
    const domain = SMART_DEVICE_DOMAIN_MAP[device.category];

    return {
      id: `bas-smart-${device.uniqueId}`,
      name: device.name,
      domain,
      source: "smart-device-framework",
      sourceId: device.uniqueId,
      roomId: device.roomId,
      roomName: device.roomName,
      status: device.onlineStatus === "online" ? "online" : "offline",
      capabilities: capabilitiesForDomain(domain),
      telemetry: {
        powerWatts: device.powerConsumption.activeWatts,
        batteryPercent: device.batteryStatus?.levelPercent ?? null,
        signalStrength: device.signalStrength,
      },
      futureReady: true,
    };
  });
}

function lightingEndpoints(): readonly BasEndpoint[] {
  const fixtures: BasEndpoint[] = LIGHTING_FIXTURES.map((fixture) => ({
    id: `bas-light-${fixture.id}`,
    name: fixture.name,
    domain: "lighting",
    source: "lighting-engine",
    sourceId: fixture.id,
    roomId: fixture.roomId,
    roomName: fixture.roomName,
    status: "online",
    capabilities: ["set-device-state", "set-lighting", "notify"],
    telemetry: {
      powerWatts: fixture.load.consumptionWatts,
    },
    futureReady: true,
  }));

  const switches: BasEndpoint[] = ELECTRICAL_SWITCHES.map((switchSpec) => ({
    id: `bas-switch-${switchSpec.id}`,
    name: switchSpec.name,
    domain: "lighting",
    source: "lighting-engine",
    sourceId: switchSpec.id,
    roomId: switchSpec.roomId,
    roomName: switchSpec.roomName,
    status: "online",
    capabilities: ["set-device-state", "set-lighting", "notify"],
    telemetry: {
      powerWatts: switchSpec.standbyWatts,
    },
    futureReady: true,
  }));

  const sockets: BasEndpoint[] = ELECTRICAL_SOCKETS.map((socket) => ({
    id: `bas-socket-${socket.id}`,
    name: socket.name,
    domain: "energy",
    source: "lighting-engine",
    sourceId: socket.id,
    roomId: socket.roomId,
    roomName: socket.roomName,
    status: "online",
    capabilities: ["set-device-state", "notify", "fail-safe"],
    telemetry: {
      powerWatts: socket.standbyWatts,
    },
    futureReady: true,
  }));

  return [...fixtures, ...switches, ...sockets];
}

function securityEndpoints(): readonly BasEndpoint[] {
  return SECURITY_DEVICES.map((device) => ({
    id: `bas-security-${device.id}`,
    name: device.name,
    domain: device.type === "water-leak-sensor" ? "water" : device.type === "garage-sensor" ? "garage" : device.type === "gate-sensor" ? "gate" : "security",
    source: "security-platform",
    sourceId: device.id,
    roomId: device.roomId,
    roomName: device.roomName,
    status: device.onlineStatus === "online" ? "online" : "offline",
    capabilities: ["set-device-state", "set-security-mode", "notify", "fail-safe"],
    telemetry: {
      batteryPercent: device.batteryPercent,
      signalStrength: device.signalStrength,
    },
    futureReady: true,
  }));
}

function virtualEndpoints(): readonly BasEndpoint[] {
  const rooms = INTERIOR_ROOMS.flatMap((room): BasEndpoint[] => [
    {
      id: `bas-room-presence-${room.id}`,
      name: `${room.name} Presence`,
      domain: "future-devices",
      source: "room-registry",
      sourceId: room.id,
      roomId: room.id,
      roomName: room.name,
      status: "virtual",
      capabilities: ["notify"],
      telemetry: {
        powerWatts: room.futureEnergyConsumption.baselineKwhPerDay * 1000,
      },
      futureReady: true,
    },
    {
      id: `bas-room-energy-${room.id}`,
      name: `${room.name} Energy Zone`,
      domain: "energy",
      source: "room-registry",
      sourceId: room.id,
      roomId: room.id,
      roomName: room.name,
      status: "virtual",
      capabilities: ["notify", "fail-safe"],
      telemetry: {
        powerWatts: room.futureEnergyConsumption.baselineKwhPerDay * 1000,
      },
      futureReady: true,
    },
  ]);

  return [
    ...rooms,
    {
      id: "bas-virtual-internet-status",
      name: "Internet Status",
      domain: "future-devices",
      source: "bas-virtual",
      sourceId: "internet-status",
      roomId: null,
      roomName: null,
      status: "virtual",
      capabilities: ["notify", "fail-safe"],
      telemetry: {},
      futureReady: true,
    },
    {
      id: "bas-virtual-weather",
      name: "Weather Service",
      domain: "future-devices",
      source: "bas-virtual",
      sourceId: "weather",
      roomId: null,
      roomName: null,
      status: "virtual",
      capabilities: ["notify"],
      telemetry: {
        temperatureC: 28,
        humidityPercent: 62,
      },
      futureReady: true,
    },
    {
      id: "bas-virtual-total-power",
      name: "Total Power Consumption",
      domain: "energy",
      source: "bas-virtual",
      sourceId: "total-power",
      roomId: null,
      roomName: null,
      status: "virtual",
      capabilities: ["notify", "fail-safe"],
      telemetry: {
        powerWatts: LIGHTING_POWER_SUMMARY.totalWattage,
      },
      futureReady: true,
    },
  ];
}

export const BAS_ENDPOINTS: readonly BasEndpoint[] = [
  ...smartDeviceEndpoints(),
  ...lightingEndpoints(),
  ...securityEndpoints(),
  ...virtualEndpoints(),
] as const;

export const BAS_ENDPOINT_BY_ID = new Map(BAS_ENDPOINTS.map((endpoint) => [endpoint.id, endpoint]));

export function getBasEndpoint(endpointId: string) {
  return BAS_ENDPOINT_BY_ID.get(endpointId) ?? null;
}

export function endpointsByDomain(domain: BasDomain) {
  return BAS_ENDPOINTS.filter((endpoint) => endpoint.domain === domain);
}
