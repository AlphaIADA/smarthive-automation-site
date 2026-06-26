import { INTERIOR_ROOMS, getInteriorRoom } from "@/lib/experience/interior/room-registry";
import type {
  InteriorRoom,
  SmartDeviceAutomationHooks,
  SmartDeviceCategory,
  SmartDeviceConnectivity,
  SmartDeviceFrameworkReport,
  SmartDevicePlaceholder,
  SmartDevicePowerConsumption,
  SmartDevicePricing,
  SmartDeviceRoomRegistry,
  SmartDeviceSnapshot,
  SmartDeviceSpec,
  SmartDeviceWarranty,
} from "@/types/experience";
import { CENTRAL_DEVICE_REGISTRY } from "./device-registry";
import { RegisteredSmartDevice } from "./smart-device";

export const SMART_DEVICE_CATEGORIES: readonly SmartDeviceCategory[] = [
  "lighting",
  "switches",
  "sockets",
  "curtains",
  "blinds",
  "thermostats",
  "hvac",
  "cctv",
  "doorbells",
  "smart-locks",
  "motion-sensors",
  "door-sensors",
  "window-sensors",
  "smoke-detector",
  "gas-detector",
  "water-leak-sensor",
  "temperature-sensor",
  "humidity-sensor",
  "ir-blaster",
  "smart-hub",
  "voice-assistant",
  "garage-controller",
  "gate-controller",
  "pool-controller",
  "garden-irrigation",
  "solar-inverter",
  "battery-storage",
  "ups",
  "ev-charger",
  "smart-tv",
  "audio-system",
  "coffee-machine",
  "dishwasher",
  "refrigerator",
  "water-heater",
  "smart-mirror",
] as const;

export const DEVICE_CATEGORY_LABELS: Record<SmartDeviceCategory, string> = {
  lighting: "Lighting",
  switches: "Switches",
  sockets: "Sockets",
  curtains: "Curtains",
  blinds: "Blinds",
  thermostats: "Thermostats",
  hvac: "HVAC",
  cctv: "CCTV",
  doorbells: "Doorbells",
  "smart-locks": "Smart Locks",
  "motion-sensors": "Motion Sensors",
  "door-sensors": "Door Sensors",
  "window-sensors": "Window Sensors",
  "smoke-detector": "Smoke Detector",
  "gas-detector": "Gas Detector",
  "water-leak-sensor": "Water Leak Sensor",
  "temperature-sensor": "Temperature Sensor",
  "humidity-sensor": "Humidity Sensor",
  "ir-blaster": "IR Blaster",
  "smart-hub": "Smart Hub",
  "voice-assistant": "Voice Assistant",
  "garage-controller": "Garage Controller",
  "gate-controller": "Gate Controller",
  "pool-controller": "Pool Controller",
  "garden-irrigation": "Garden Irrigation",
  "solar-inverter": "Solar Inverter",
  "battery-storage": "Battery Storage",
  ups: "UPS",
  "ev-charger": "EV Charger",
  "smart-tv": "Smart TV",
  "audio-system": "Audio System",
  "coffee-machine": "Coffee Machine",
  dishwasher: "Dishwasher",
  refrigerator: "Refrigerator",
  "water-heater": "Water Heater",
  "smart-mirror": "Smart Mirror",
};

export const DEVICE_CATEGORY_COLORS: Record<SmartDeviceCategory, string> = {
  lighting: "#f8d88a",
  switches: "#d8e5f1",
  sockets: "#c9d1d8",
  curtains: "#b8a180",
  blinds: "#a9b5bd",
  thermostats: "#f0a85f",
  hvac: "#70c2ff",
  cctv: "#8a94ff",
  doorbells: "#d8b35f",
  "smart-locks": "#d3a96e",
  "motion-sensors": "#90e3cb",
  "door-sensors": "#88d8b0",
  "window-sensors": "#82c9e8",
  "smoke-detector": "#f2f4f5",
  "gas-detector": "#ffb26b",
  "water-leak-sensor": "#5fc9ff",
  "temperature-sensor": "#ff9b72",
  "humidity-sensor": "#8ed7ff",
  "ir-blaster": "#2f3740",
  "smart-hub": "#6bd6ff",
  "voice-assistant": "#b48cff",
  "garage-controller": "#8b99a8",
  "gate-controller": "#91a47f",
  "pool-controller": "#3ec6d3",
  "garden-irrigation": "#5fbf75",
  "solar-inverter": "#f2c05f",
  "battery-storage": "#88d67c",
  ups: "#a6b0b8",
  "ev-charger": "#7bd6f2",
  "smart-tv": "#111820",
  "audio-system": "#20262d",
  "coffee-machine": "#3c3028",
  dishwasher: "#cfd5d8",
  refrigerator: "#bfc7ca",
  "water-heater": "#d8d0c2",
  "smart-mirror": "#bdefff",
};

const BATTERY_CATEGORIES = new Set<SmartDeviceCategory>([
  "motion-sensors",
  "door-sensors",
  "window-sensors",
  "smoke-detector",
  "gas-detector",
  "water-leak-sensor",
  "temperature-sensor",
  "humidity-sensor",
  "doorbells",
  "smart-locks",
]);

const CEILING_CATEGORIES = new Set<SmartDeviceCategory>(["lighting", "smoke-detector", "gas-detector", "motion-sensors"]);
const FLOOR_EQUIPMENT_CATEGORIES = new Set<SmartDeviceCategory>([
  "hvac",
  "solar-inverter",
  "battery-storage",
  "ups",
  "ev-charger",
  "refrigerator",
  "dishwasher",
  "water-heater",
  "coffee-machine",
  "pool-controller",
  "garden-irrigation",
]);

interface CategoryDefaults {
  readonly manufacturer: string;
  readonly model: string;
  readonly firmwareVersion: string;
  readonly connectivity: SmartDeviceConnectivity;
  readonly pricing: SmartDevicePricing;
  readonly warranty: SmartDeviceWarranty;
  readonly powerConsumption: SmartDevicePowerConsumption;
}

const CATEGORY_DEFAULTS: Record<SmartDeviceCategory, CategoryDefaults> = {
  lighting: defaults("Lutron", "Ketra Architectural Node", "7.4.1", "matter", 180, 120, 0.4, 9, 22),
  switches: defaults("Basalte", "Sentido Pro", "4.8.2", "knx", 220, 95, 0.2, 1.4, 4),
  sockets: defaults("Schneider Electric", "Odace Smart Outlet", "3.2.0", "matter", 90, 65, 0.2, 2.2, 8),
  curtains: defaults("Somfy", "Glydea Ultra", "6.1.3", "zigbee", 520, 210, 0.7, 85, 42),
  blinds: defaults("Somfy", "Sonesse Blind Drive", "6.0.8", "zigbee", 410, 180, 0.6, 55, 32),
  thermostats: defaults("Ecobee", "Smart Thermostat Premium", "5.6.0", "wifi", 249, 140, 0.5, 3, 12),
  hvac: defaults("Daikin", "VRV Smart Indoor Unit", "8.2.4", "rs485", 1800, 550, 2, 1200, 640),
  cctv: defaults("Axis", "P3265-LV", "11.7.1", "ethernet", 620, 220, 4.5, 9, 62),
  doorbells: defaults("DoorBird", "D1101V", "5.18.2", "ethernet", 540, 180, 1.2, 7, 38),
  "smart-locks": defaults("Yale", "Linus L2", "3.9.5", "matter", 320, 160, 0.1, 4, 7),
  "motion-sensors": defaults("Aqara", "FP2 Presence Sensor", "2.2.7", "wifi", 82, 65, 0.3, 2.5, 10),
  "door-sensors": defaults("Aqara", "Door Sensor P2", "1.2.1", "thread", 39, 35, 0.02, 0.1, 1),
  "window-sensors": defaults("Aqara", "Window Sensor P2", "1.2.1", "thread", 39, 35, 0.02, 0.1, 1),
  "smoke-detector": defaults("Nest", "Protect Wired", "3.5.2", "wifi", 129, 90, 0.3, 1.8, 7),
  "gas-detector": defaults("Shelly", "Gas LPG", "2.1.9", "wifi", 64, 55, 0.4, 1.5, 6),
  "water-leak-sensor": defaults("Fibaro", "Flood Sensor", "5.1.4", "z-wave", 72, 55, 0.03, 0.1, 1),
  "temperature-sensor": defaults("Aqara", "Climate Sensor", "1.9.8", "zigbee", 34, 28, 0.02, 0.1, 1),
  "humidity-sensor": defaults("Aqara", "Climate Sensor", "1.9.8", "zigbee", 34, 28, 0.02, 0.1, 1),
  "ir-blaster": defaults("Sensibo", "Air Pro", "4.6.3", "wifi", 149, 70, 0.5, 2.2, 9),
  "smart-hub": defaults("SmartThings", "Station", "1.7.4", "matter", 80, 80, 1.1, 3.2, 18),
  "voice-assistant": defaults("Josh.ai", "Micro", "6.4.2", "wifi", 599, 150, 0.8, 4, 24),
  "garage-controller": defaults("LiftMaster", "myQ Pro", "4.3.0", "wifi", 120, 110, 0.6, 4, 18),
  "gate-controller": defaults("Came", "Connect Gateway", "3.7.0", "dry-contact", 310, 220, 0.6, 12, 42),
  "pool-controller": defaults("Hayward", "OmniLogic", "5.2.8", "ethernet", 1450, 480, 3, 90, 310),
  "garden-irrigation": defaults("Rachio", "3 Pro Controller", "5.1.3", "wifi", 230, 180, 0.7, 9, 30),
  "solar-inverter": defaults("SolarEdge", "Home Hub Inverter", "4.18.6", "ethernet", 2200, 620, 8, 38, 160),
  "battery-storage": defaults("Tesla", "Powerwall 3", "24.12.1", "wifi", 9200, 1800, 6, 25, 120),
  ups: defaults("APC", "Smart-UPS SRT", "15.3.2", "ethernet", 1800, 360, 7, 40, 180),
  "ev-charger": defaults("Wallbox", "Pulsar Plus", "6.5.4", "wifi", 699, 450, 1.8, 7400, 1900),
  "smart-tv": defaults("Samsung", "Neo QLED 85", "1622.4", "wifi", 3200, 180, 0.5, 210, 300),
  "audio-system": defaults("Bang & Olufsen", "Beosound Theatre", "3.8.9", "wifi", 8900, 400, 0.8, 650, 220),
  "coffee-machine": defaults("Miele", "CM 7750 CoffeeSelect", "2.4.1", "wifi", 6200, 280, 1, 1450, 220),
  dishwasher: defaults("Miele", "G 7966 SCVi", "4.2.8", "wifi", 3200, 320, 0.5, 1800, 250),
  refrigerator: defaults("Sub-Zero", "Designer IT-36", "5.1.0", "wifi", 11200, 650, 2, 180, 520),
  "water-heater": defaults("Rinnai", "Sensei Smart", "3.9.1", "wifi", 2400, 420, 1.2, 95, 260),
  "smart-mirror": defaults("Kohler", "Verdera Voice", "2.8.2", "wifi", 1600, 260, 1, 80, 130),
};

function defaults(
  manufacturer: string,
  model: string,
  firmwareVersion: string,
  connectivity: SmartDeviceConnectivity,
  equipmentPrice: number,
  installationPrice: number,
  standbyWatts: number,
  activeWatts: number,
  estimatedKwhPerYear: number,
): CategoryDefaults {
  return {
    manufacturer,
    model,
    firmwareVersion,
    connectivity,
    pricing: {
      equipmentPrice,
      installationPrice,
      currency: "USD",
    },
    warranty: {
      years: equipmentPrice > 1500 ? 5 : 3,
      coverage: "Equipment, installation workmanship, and firmware support readiness",
    },
    powerConsumption: {
      standbyWatts,
      activeWatts,
      estimatedKwhPerYear,
    },
  };
}

interface DeviceRequest {
  readonly category: SmartDeviceCategory;
  readonly role?: string;
  readonly name?: string;
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function seededNumber(value: string) {
  return value.split("").reduce((total, character) => total + character.charCodeAt(0), 0);
}

function batteryStatus(uniqueId: string, category: SmartDeviceCategory) {
  if (!BATTERY_CATEGORIES.has(category)) return null;
  const seed = seededNumber(uniqueId);

  return {
    levelPercent: 62 + (seed % 34),
    charging: false,
    replaceable: category !== "smart-locks",
  };
}

function automationHooks(category: SmartDeviceCategory): SmartDeviceAutomationHooks {
  return {
    triggerHooks: [`${category}:status-changed`, `${category}:health-changed`],
    conditionHooks: [`${category}:is-online`, `${category}:room-occupied`],
    actionHooks: [`${category}:enable`, `${category}:disable`, `${category}:set-mode`],
    automationReady: true,
    implemented: false,
  };
}

function roomCenter(room: InteriorRoom) {
  return {
    x: (room.boundingBox.min.x + room.boundingBox.max.x) / 2,
    z: (room.boundingBox.min.z + room.boundingBox.max.z) / 2,
  };
}

function placeholderShape(category: SmartDeviceCategory): SmartDevicePlaceholder["shape"] {
  if (category === "lighting" || category.endsWith("sensor") || category.includes("detector")) return "disc";
  if (category === "smart-tv" || category === "smart-mirror" || category === "cctv") return "panel";
  if (FLOOR_EQUIPMENT_CATEGORIES.has(category)) return "tower";
  if (category === "smart-hub" || category === "voice-assistant") return "cube";
  return "sensor";
}

function placeholderSize(category: SmartDeviceCategory): [number, number, number] {
  if (category === "smart-tv") return [0.46, 0.3, 0.035];
  if (category === "smart-mirror") return [0.3, 0.42, 0.035];
  if (category === "hvac") return [0.38, 0.2, 0.16];
  if (category === "solar-inverter" || category === "battery-storage" || category === "ups" || category === "ev-charger") return [0.34, 0.5, 0.18];
  if (FLOOR_EQUIPMENT_CATEGORIES.has(category)) return [0.24, 0.36, 0.2];
  if (category === "cctv") return [0.16, 0.12, 0.12];
  if (category === "lighting" || category.includes("detector")) return [0.16, 0.045, 0.16];
  return [0.14, 0.14, 0.08];
}

function devicePosition(room: InteriorRoom, category: SmartDeviceCategory, index: number, total: number): [number, number, number] {
  const center = roomCenter(room);
  const width = Math.abs(room.boundingBox.max.x - room.boundingBox.min.x);
  const depth = Math.abs(room.boundingBox.max.z - room.boundingBox.min.z);
  const lane = index % 4;
  const offsetX = ((index % Math.max(1, Math.min(total, 5))) - Math.min(total - 1, 4) / 2) * Math.min(0.52, width * 0.12);
  const offsetZ = ((Math.floor(index / 4) % 3) - 1) * Math.min(0.42, depth * 0.12);

  if (CEILING_CATEGORIES.has(category)) {
    return [round(center.x + offsetX), round(room.boundingBox.max.y - 0.28), round(center.z + offsetZ)];
  }

  if (FLOOR_EQUIPMENT_CATEGORIES.has(category)) {
    return [
      round(room.boundingBox.max.x - 0.36 - lane * 0.16),
      round(room.boundingBox.min.y + 0.32),
      round(center.z + offsetZ),
    ];
  }

  const wallY = category === "sockets" ? room.boundingBox.min.y + 0.45 : room.boundingBox.min.y + 1.35;
  const wallZ = lane < 2 ? room.boundingBox.min.z + 0.12 : room.boundingBox.max.z - 0.12;
  const wallX = lane % 2 === 0 ? center.x + offsetX : room.boundingBox.max.x - 0.22;

  return [round(wallX), round(wallY), round(wallZ)];
}

function round(value: number) {
  return Number(value.toFixed(3));
}

function isOutdoor(room: InteriorRoom) {
  return room.futureEnergyConsumption.zone === "outdoor";
}

function isComfortRoom(room: InteriorRoom) {
  return room.futureEnergyConsumption.zone === "comfort" || room.futureEnergyConsumption.zone === "entertainment" || room.futureEnergyConsumption.zone === "wellness";
}

function isWetRoom(room: InteriorRoom) {
  return room.id.includes("bathroom") || room.id.includes("powder") || room.id.includes("kitchen") || room.id.includes("laundry") || room.id.includes("pantry");
}

function baseRequestsForRoom(room: InteriorRoom): readonly DeviceRequest[] {
  const requests: DeviceRequest[] = [
    { category: "lighting" },
    { category: "switches" },
    { category: "sockets" },
    { category: "motion-sensors" },
  ];

  if (!isOutdoor(room)) {
    requests.push({ category: "temperature-sensor" }, { category: "humidity-sensor" }, { category: "smoke-detector" }, { category: "door-sensors" });
  }

  if (isComfortRoom(room)) {
    requests.push({ category: "thermostats" }, { category: "hvac" }, { category: "curtains" }, { category: "window-sensors" });
  }

  if (isWetRoom(room)) {
    requests.push({ category: "water-leak-sensor" });
  }

  if (room.id.includes("kitchen") || room.id.includes("utility")) {
    requests.push({ category: "gas-detector" });
  }

  if (isOutdoor(room)) {
    requests.push({ category: "cctv" }, { category: "garden-irrigation" });
  }

  return requests;
}

const ROOM_SPECIFIC_REQUESTS: Record<string, readonly DeviceRequest[]> = {
  "gf-foyer": [
    { category: "doorbells", name: "Front Door Smart Doorbell" },
    { category: "smart-locks", name: "Main Pivot Door Smart Lock" },
    { category: "cctv", name: "Arrival CCTV Camera" },
    { category: "voice-assistant", name: "Foyer Voice Assistant" },
    { category: "smart-hub", name: "Primary Smart Hub" },
    { category: "gate-controller", name: "Front Gate Controller" },
  ],
  "gf-formal-living": [
    { category: "smart-tv", name: "Formal Living Smart TV" },
    { category: "audio-system", name: "Formal Living Audio System" },
    { category: "ir-blaster", name: "Formal Living IR Blaster" },
    { category: "blinds", name: "Formal Living Motorized Blinds" },
  ],
  "gf-family-lounge": [
    { category: "smart-tv", name: "Family Lounge Smart TV" },
    { category: "audio-system", name: "Family Lounge Audio System" },
    { category: "voice-assistant", name: "Family Lounge Voice Assistant" },
  ],
  "gf-dining": [{ category: "audio-system", name: "Dining Ambient Audio System" }, { category: "blinds", name: "Dining Motorized Blinds" }],
  "gf-open-kitchen": [
    { category: "coffee-machine", name: "Open Kitchen Coffee Machine" },
    { category: "dishwasher", name: "Open Kitchen Dishwasher" },
    { category: "refrigerator", name: "Open Kitchen Refrigerator" },
    { category: "water-heater", name: "Kitchen Water Heater" },
  ],
  "gf-dirty-kitchen": [
    { category: "dishwasher", name: "Dirty Kitchen Dishwasher" },
    { category: "refrigerator", name: "Dirty Kitchen Refrigerator" },
    { category: "water-heater", name: "Dirty Kitchen Water Heater" },
  ],
  "gf-wine-cellar": [{ category: "temperature-sensor", name: "Wine Cellar Precision Temperature Sensor" }, { category: "humidity-sensor", name: "Wine Cellar Humidity Sensor" }],
  "gf-cinema": [
    { category: "smart-tv", name: "Cinema Large Smart Display" },
    { category: "audio-system", name: "Cinema Surround Audio System" },
    { category: "ir-blaster", name: "Cinema IR Blaster" },
  ],
  "gf-gym": [{ category: "audio-system", name: "Gym Audio System" }, { category: "smart-mirror", name: "Gym Smart Mirror" }],
  "gf-home-office": [{ category: "voice-assistant", name: "Office Voice Assistant" }, { category: "smart-tv", name: "Office Presentation Display" }],
  "gf-smart-utility": [
    { category: "smart-hub", name: "Utility Smart Hub Rack" },
    { category: "solar-inverter", name: "Solar Inverter" },
    { category: "battery-storage", name: "Battery Storage" },
    { category: "ups", name: "Critical Load UPS" },
    { category: "ev-charger", name: "EV Charger Controller" },
    { category: "water-heater", name: "Plant Room Water Heater" },
  ],
  "gf-garage-connection": [{ category: "garage-controller", name: "Garage Door Controller" }, { category: "ev-charger", name: "Garage EV Charger" }, { category: "cctv", name: "Garage CCTV Camera" }],
  "gf-patio-access": [{ category: "pool-controller", name: "Pool Controller" }, { category: "audio-system", name: "Patio Audio System" }],
  "ff-master-bedroom": [{ category: "smart-tv", name: "Master Bedroom Smart TV" }, { category: "smart-mirror", name: "Master Dressing Smart Mirror" }, { category: "voice-assistant", name: "Master Bedroom Voice Assistant" }],
  "ff-walk-in-closet": [{ category: "lighting", name: "Closet Display Lighting" }, { category: "motion-sensors", name: "Closet Occupancy Sensor" }],
  "ff-luxury-bathroom": [{ category: "smart-mirror", name: "Luxury Bathroom Smart Mirror" }, { category: "water-heater", name: "Bathroom Water Heater" }],
  "ff-private-lounge": [{ category: "smart-tv", name: "Private Lounge Smart TV" }, { category: "audio-system", name: "Private Lounge Audio System" }],
  "ff-bedroom-2": [{ category: "smart-tv", name: "Bedroom 2 Smart TV" }],
  "ff-bedroom-3": [{ category: "smart-tv", name: "Bedroom 3 Smart TV" }],
  "ff-bedroom-4": [{ category: "smart-tv", name: "Bedroom 4 Smart TV" }],
  "ff-family-lounge": [{ category: "smart-tv", name: "Upper Lounge Smart TV" }, { category: "audio-system", name: "Upper Lounge Audio System" }],
  "ff-library": [{ category: "voice-assistant", name: "Library Voice Assistant" }],
  "ff-study-area": [{ category: "voice-assistant", name: "Study Area Voice Assistant" }],
  "ff-front-balcony": [{ category: "audio-system", name: "Balcony Audio System" }, { category: "blinds", name: "Balcony Solar Blinds" }],
  "ff-rear-terrace": [{ category: "pool-controller", name: "Terrace Pool Controller" }, { category: "audio-system", name: "Terrace Audio System" }, { category: "gate-controller", name: "Service Gate Controller" }],
};

function deviceName(room: InteriorRoom, request: DeviceRequest, ordinal: number) {
  return request.name ?? `${room.name} ${DEVICE_CATEGORY_LABELS[request.category]} ${ordinal}`;
}

function createDevice(room: InteriorRoom, request: DeviceRequest, index: number, total: number, ordinal: number): RegisteredSmartDevice {
  const defaults = CATEGORY_DEFAULTS[request.category];
  const role = request.role ?? slug(request.name ?? DEVICE_CATEGORY_LABELS[request.category]);
  const uniqueId = `she-${room.id}-${request.category}-${ordinal}-${role}`;
  const signalSeed = seededNumber(uniqueId);
  const onlineStatus = signalSeed % 23 === 0 ? "offline" : "online";
  const placeholder: SmartDevicePlaceholder = {
    position: devicePosition(room, request.category, index, total),
    size: placeholderSize(request.category),
    color: DEVICE_CATEGORY_COLORS[request.category],
    shape: placeholderShape(request.category),
    icon: request.category,
  };
  const spec: SmartDeviceSpec = {
    uniqueId,
    name: deviceName(room, request, ordinal),
    category: request.category,
    manufacturer: defaults.manufacturer,
    model: defaults.model,
    firmwareVersion: defaults.firmwareVersion,
    roomId: room.id,
    roomName: room.name,
    powerState: onlineStatus === "online" ? "standby" : "off",
    healthStatus: signalSeed % 31 === 0 ? "warning" : "healthy",
    batteryStatus: batteryStatus(uniqueId, request.category),
    signalStrength: onlineStatus === "online" ? 68 + (signalSeed % 30) : 0,
    onlineStatus,
    connectivity: defaults.connectivity,
    pricing: defaults.pricing,
    warranty: defaults.warranty,
    powerConsumption: defaults.powerConsumption,
    futureAutomationHooks: automationHooks(request.category),
    placeholder,
    imagePlaceholder: {
      label: `${DEVICE_CATEGORY_LABELS[request.category]} SVG placeholder`,
      icon: request.category,
    },
  };

  return new RegisteredSmartDevice(spec);
}

function buildRoomRequests(room: InteriorRoom) {
  return [...baseRequestsForRoom(room), ...(ROOM_SPECIFIC_REQUESTS[room.id] ?? [])];
}

function buildDevices() {
  CENTRAL_DEVICE_REGISTRY.clear();

  const snapshots: SmartDeviceSnapshot[] = [];

  INTERIOR_ROOMS.forEach((room) => {
    const requests = buildRoomRequests(room);
    const categoryOrdinals = new Map<SmartDeviceCategory, number>();

    requests.forEach((request, index) => {
      const ordinal = (categoryOrdinals.get(request.category) ?? 0) + 1;
      categoryOrdinals.set(request.category, ordinal);
      const device = createDevice(room, request, index, requests.length, ordinal);
      snapshots.push(CENTRAL_DEVICE_REGISTRY.register(device));
    });
  });

  return snapshots;
}

export const SMART_DEVICES: readonly SmartDeviceSnapshot[] = buildDevices();

export const ROOM_DEVICE_REGISTRIES: readonly SmartDeviceRoomRegistry[] = INTERIOR_ROOMS.map((room) => {
  const existing = CENTRAL_DEVICE_REGISTRY.roomRegistries().find((registry) => registry.roomId === room.id);

  return (
    existing ?? {
      roomId: room.id,
      roomName: room.name,
      devices: [],
      categoryCounts: Object.fromEntries(SMART_DEVICE_CATEGORIES.map((category) => [category, 0])) as Record<SmartDeviceCategory, number>,
    }
  );
});

export const ROOM_DEVICE_REGISTRY_BY_ID = new Map(ROOM_DEVICE_REGISTRIES.map((registry) => [registry.roomId, registry]));

export function getRoomDeviceRegistry(roomId: string): SmartDeviceRoomRegistry | null {
  return ROOM_DEVICE_REGISTRY_BY_ID.get(roomId) ?? null;
}

export function getSmartDevice(deviceId: string): SmartDeviceSnapshot | null {
  return CENTRAL_DEVICE_REGISTRY.getSnapshot(deviceId);
}

export function getSmartDeviceRoomName(roomId: string) {
  return getInteriorRoom(roomId)?.name ?? roomId;
}

const manufacturers = new Set(SMART_DEVICES.map((device) => device.manufacturer));
const onlineCount = SMART_DEVICES.filter((device) => device.onlineStatus === "online").length;

export const SMART_DEVICE_FRAMEWORK_REPORT: SmartDeviceFrameworkReport = {
  deviceCount: SMART_DEVICES.length,
  roomRegistryCount: ROOM_DEVICE_REGISTRIES.length,
  categoryCount: SMART_DEVICE_CATEGORIES.length,
  manufacturerCount: manufacturers.size,
  onlineCount,
  offlineCount: SMART_DEVICES.length - onlineCount,
  totalEquipmentPrice: SMART_DEVICES.reduce((total, device) => total + device.pricing.equipmentPrice, 0),
  totalInstallationPrice: SMART_DEVICES.reduce((total, device) => total + device.pricing.installationPrice, 0),
  totalActiveWatts: Number(SMART_DEVICES.reduce((total, device) => total + device.powerConsumption.activeWatts, 0).toFixed(1)),
  everyRoomHasRegistry: INTERIOR_ROOMS.every((room) => ROOM_DEVICE_REGISTRY_BY_ID.has(room.id)),
  categories: SMART_DEVICE_CATEGORIES,
  constraints: {
    automationLogic: "excluded",
    ai: "excluded",
    animation: "excluded",
    externalApiRoutes: "excluded",
    database: "excluded",
  },
} as const;
