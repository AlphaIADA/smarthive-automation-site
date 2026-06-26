import { INTERIOR_ROOMS } from "@/lib/experience/interior/room-registry";
import type {
  ElectricalSocketSpec,
  ElectricalSocketType,
  ElectricalSwitchSpec,
  ElectricalSwitchType,
  InteriorRoom,
  LightingEngineReport,
  LightingFixtureSpec,
  LightingFixtureType,
  LightingGroupSpec,
  LightingMounting,
  LightingPlaceholderShape,
  LightingPricing,
  LightingRealisticEffects,
  LightingShadowQuality,
  RoomLightGroupName,
} from "@/types/experience";
import { calculateLightingPowerSummary, calculateLightingQuoteSummary } from "./lighting-power";

const VOLTAGE = 230;

export const LIGHTING_FIXTURE_TYPES: readonly LightingFixtureType[] = [
  "downlights",
  "pendant",
  "track-lights",
  "wall-lights",
  "garden-lights",
  "pool-lights",
  "led-strip",
  "stair-lights",
  "ceiling-lights",
  "emergency-lights",
  "decorative-lights",
  "cabinet-lights",
  "mirror-lights",
  "spotlights",
] as const;

export const ELECTRICAL_SWITCH_TYPES: readonly ElectricalSwitchType[] = [
  "1-gang",
  "2-gang",
  "3-gang",
  "4-gang",
  "dimmer",
  "scene-switch",
  "touch-switch",
  "wireless-switch",
] as const;

export const ELECTRICAL_SOCKET_TYPES: readonly ElectricalSocketType[] = [
  "normal-socket",
  "usb-socket",
  "smart-socket",
  "outdoor-socket",
  "ups-socket",
  "solar-socket",
] as const;

export const ROOM_LIGHT_GROUPS: readonly RoomLightGroupName[] = [
  "living-room",
  "kitchen",
  "dining",
  "bedrooms",
  "cinema",
  "gym",
  "garden",
  "garage",
  "pool",
] as const;

export const LIGHTING_FIXTURE_LABELS: Record<LightingFixtureType, string> = {
  downlights: "Downlights",
  pendant: "Pendant",
  "track-lights": "Track Lights",
  "wall-lights": "Wall Lights",
  "garden-lights": "Garden Lights",
  "pool-lights": "Pool Lights",
  "led-strip": "LED Strip",
  "stair-lights": "Stair Lights",
  "ceiling-lights": "Ceiling Lights",
  "emergency-lights": "Emergency Lights",
  "decorative-lights": "Decorative Lights",
  "cabinet-lights": "Cabinet Lights",
  "mirror-lights": "Mirror Lights",
  spotlights: "Spotlights",
};

export const ELECTRICAL_SWITCH_LABELS: Record<ElectricalSwitchType, string> = {
  "1-gang": "1 Gang",
  "2-gang": "2 Gang",
  "3-gang": "3 Gang",
  "4-gang": "4 Gang",
  dimmer: "Dimmer",
  "scene-switch": "Scene Switch",
  "touch-switch": "Touch Switch",
  "wireless-switch": "Wireless Switch",
};

export const ELECTRICAL_SOCKET_LABELS: Record<ElectricalSocketType, string> = {
  "normal-socket": "Normal Socket",
  "usb-socket": "USB Socket",
  "smart-socket": "Smart Socket",
  "outdoor-socket": "Outdoor Socket",
  "ups-socket": "UPS Socket",
  "solar-socket": "Solar Socket",
};

export const ROOM_LIGHT_GROUP_LABELS: Record<RoomLightGroupName, string> = {
  "living-room": "Living Room",
  kitchen: "Kitchen",
  dining: "Dining",
  bedrooms: "Bedrooms",
  cinema: "Cinema",
  gym: "Gym",
  garden: "Garden",
  garage: "Garage",
  pool: "Pool",
};

export const LIGHTING_FIXTURE_COLORS: Record<LightingFixtureType, string> = {
  downlights: "#fff3cf",
  pendant: "#ffd98a",
  "track-lights": "#f7fbff",
  "wall-lights": "#ffe1b0",
  "garden-lights": "#b9ffca",
  "pool-lights": "#64dcff",
  "led-strip": "#f6d5ff",
  "stair-lights": "#ffe4b5",
  "ceiling-lights": "#fff8e8",
  "emergency-lights": "#6cff8f",
  "decorative-lights": "#ffc778",
  "cabinet-lights": "#fff0c2",
  "mirror-lights": "#e9fbff",
  spotlights: "#ffffff",
};

interface FixtureDefaults {
  readonly manufacturer: string;
  readonly model: string;
  readonly powerWatts: number;
  readonly beamAngle: number;
  readonly mounting: LightingMounting;
  readonly shape: LightingPlaceholderShape;
  readonly size: [number, number, number];
  readonly intensity: number;
  readonly temperatureKelvin: number;
  readonly brightnessPercent: number;
  readonly colour: string;
  readonly shadowQuality: LightingShadowQuality;
  readonly equipmentCost: number;
  readonly installationCost: number;
  readonly labourCost: number;
  readonly monthlyHours: number;
  readonly realLight: boolean;
}

const FIXTURE_DEFAULTS: Record<LightingFixtureType, FixtureDefaults> = {
  downlights: fixtureDefaults("Ketra", "D3 Premium Downlight", 9, 42, "ceiling", "disc", [0.18, 0.035, 0.18], 0.74, 3000, 82, "#fff2cf", "soft", 118, 58, 42, 150, true),
  pendant: fixtureDefaults("Bocci", "28 Smart Pendant", 22, 130, "ceiling", "pendant", [0.25, 0.42, 0.25], 1.28, 2700, 88, "#ffdca3", "premium", 420, 140, 90, 120, true),
  "track-lights": fixtureDefaults("Flos", "Infra-Structure Track Spot", 14, 24, "ceiling", "bar", [0.55, 0.08, 0.08], 0.96, 3200, 80, "#fff8ec", "standard", 210, 85, 54, 110, true),
  "wall-lights": fixtureDefaults("Astro", "Architectural Wall Sconce", 8, 110, "wall", "panel", [0.12, 0.34, 0.06], 0.58, 2900, 76, "#ffe4b8", "soft", 145, 64, 48, 135, false),
  "garden-lights": fixtureDefaults("Hunza", "Exterior Spike Spot", 7, 38, "landscape", "stake", [0.12, 0.55, 0.12], 0.68, 2700, 70, "#caffd1", "standard", 150, 72, 52, 210, true),
  "pool-lights": fixtureDefaults("Pentair", "IntelliBrite Micro", 18, 120, "pool-shell", "disc", [0.24, 0.04, 0.24], 1.15, 5000, 78, "#62d9ff", "soft", 240, 120, 80, 160, true),
  "led-strip": fixtureDefaults("Ketra", "Linear Cove RGBW", 18, 160, "ceiling", "tube", [1.2, 0.035, 0.035], 0.82, 3000, 64, "#f4d4ff", "soft", 180, 70, 46, 180, false),
  "stair-lights": fixtureDefaults("iGuzzini", "Step Marker Micro", 3, 85, "stair", "panel", [0.14, 0.07, 0.04], 0.32, 2700, 64, "#ffd8a6", "soft", 55, 42, 28, 120, false),
  "ceiling-lights": fixtureDefaults("Kreon", "Aplis Ceiling Module", 16, 90, "ceiling", "sphere", [0.22, 0.08, 0.22], 0.95, 3000, 82, "#fff8ea", "soft", 260, 92, 60, 130, true),
  "emergency-lights": fixtureDefaults("Zumtobel", "Resclite Pro", 4, 100, "ceiling", "panel", [0.26, 0.06, 0.1], 0.38, 4200, 100, "#dfffe7", "none", 95, 50, 35, 720, false),
  "decorative-lights": fixtureDefaults("Tom Dixon", "Melt Accent", 10, 180, "ceiling", "sphere", [0.2, 0.2, 0.2], 0.68, 2400, 74, "#ffc170", "soft", 310, 90, 62, 100, false),
  "cabinet-lights": fixtureDefaults("Hafele", "Loox Linear Cabinet", 6, 120, "cabinet", "bar", [0.7, 0.035, 0.035], 0.44, 3000, 70, "#fff0c2", "soft", 80, 45, 28, 90, false),
  "mirror-lights": fixtureDefaults("Keuco", "Royal Lumos Mirror Light", 12, 140, "mirror", "bar", [0.58, 0.05, 0.05], 0.62, 4000, 72, "#e9fbff", "soft", 175, 70, 44, 80, false),
  spotlights: fixtureDefaults("Occhio", "Sento Spot", 12, 22, "ceiling", "disc", [0.16, 0.045, 0.16], 0.9, 3200, 84, "#ffffff", "premium", 240, 82, 58, 105, true),
};

function fixtureDefaults(
  manufacturer: string,
  model: string,
  powerWatts: number,
  beamAngle: number,
  mounting: LightingMounting,
  shape: LightingPlaceholderShape,
  size: [number, number, number],
  intensity: number,
  temperatureKelvin: number,
  brightnessPercent: number,
  colour: string,
  shadowQuality: LightingShadowQuality,
  equipmentCost: number,
  installationCost: number,
  labourCost: number,
  monthlyHours: number,
  realLight: boolean,
): FixtureDefaults {
  return {
    manufacturer,
    model,
    powerWatts,
    beamAngle,
    mounting,
    shape,
    size,
    intensity,
    temperatureKelvin,
    brightnessPercent,
    colour,
    shadowQuality,
    equipmentCost,
    installationCost,
    labourCost,
    monthlyHours,
    realLight,
  };
}

function pricing(equipmentCost: number, installationCost: number, labourCost: number): LightingPricing {
  return {
    equipmentCost,
    installationCost,
    labourCost,
    currency: "USD",
  };
}

const FULL_EFFECTS: LightingRealisticEffects = {
  softShadow: true,
  bounceLight: true,
  reflection: true,
  hdrSupport: true,
  bloomReady: true,
  volumetricReady: true,
};

function limitedEffects(type: LightingFixtureType): LightingRealisticEffects {
  if (type === "emergency-lights") {
    return {
      softShadow: false,
      bounceLight: false,
      reflection: false,
      hdrSupport: true,
      bloomReady: false,
      volumetricReady: false,
    };
  }

  return FULL_EFFECTS;
}

function groupForRoom(roomId: string, roomName: string, type?: LightingFixtureType): RoomLightGroupName {
  const name = roomName.toLowerCase();

  if (roomId.includes("pool") || name.includes("pool")) return "pool";
  if (roomId.includes("garden") || name.includes("garden")) return "garden";
  if (roomId.includes("garage")) return "garage";
  if (roomId.includes("cinema")) return "cinema";
  if (roomId.includes("gym")) return "gym";
  if (roomId.includes("dining")) return "dining";
  if (roomId.includes("kitchen") || roomId.includes("pantry") || roomId.includes("wine") || roomId.includes("laundry") || roomId.includes("utility")) return "kitchen";
  if (roomId.includes("bedroom") || roomId.includes("closet") || name.includes("bathroom") || name.includes("powder")) return "bedrooms";
  if (roomId.includes("patio") || roomId.includes("balcony") || roomId.includes("terrace") || type === "garden-lights") return "garden";

  return "living-room";
}

function roomCenter(room: InteriorRoom): [number, number, number] {
  return [
    (room.boundingBox.min.x + room.boundingBox.max.x) / 2,
    room.boundingBox.min.y,
    (room.boundingBox.min.z + room.boundingBox.max.z) / 2,
  ];
}

function roomSize(room: InteriorRoom) {
  return {
    width: Math.max(0.4, room.boundingBox.max.x - room.boundingBox.min.x),
    depth: Math.max(0.4, room.boundingBox.max.z - room.boundingBox.min.z),
    height: room.boundingBox.max.y - room.boundingBox.min.y,
  };
}

function ceilingY(room: InteriorRoom) {
  return room.boundingBox.max.y - 0.08;
}

function distributeInRoom(room: InteriorRoom, count: number, y: number, margin = 0.42): readonly [number, number, number][] {
  const { width, depth } = roomSize(room);
  const columns = Math.max(1, Math.ceil(Math.sqrt(count * (width / depth))));
  const rows = Math.max(1, Math.ceil(count / columns));
  const xSpan = Math.max(0.1, width - margin * 2);
  const zSpan = Math.max(0.1, depth - margin * 2);
  const positions: [number, number, number][] = [];

  for (let index = 0; index < count; index += 1) {
    const col = index % columns;
    const row = Math.floor(index / columns);
    const x = room.boundingBox.min.x + margin + (xSpan * (col + 0.5)) / columns;
    const z = room.boundingBox.min.z + margin + (zSpan * (row + 0.5)) / rows;
    positions.push([Number(x.toFixed(2)), Number(y.toFixed(2)), Number(z.toFixed(2))]);
  }

  return positions;
}

function createFixture(
  type: LightingFixtureType,
  room: Pick<InteriorRoom, "id" | "name" | "boundingBox">,
  index: number,
  position: [number, number, number],
  options: {
    readonly groupId?: RoomLightGroupName;
    readonly name?: string;
    readonly rotation?: [number, number, number];
    readonly size?: [number, number, number];
    readonly realLight?: boolean;
    readonly lod?: "near" | "mid" | "far";
    readonly shadow?: boolean;
  } = {},
): LightingFixtureSpec {
  const defaults = FIXTURE_DEFAULTS[type];
  const groupId = options.groupId ?? groupForRoom(room.id, room.name, type);
  const powerWatts = defaults.powerWatts;
  const brightness = defaults.brightnessPercent;
  const consumptionWatts = Number(((powerWatts * brightness) / 100).toFixed(2));
  const fixtureId = `she-light-${room.id}-${type}-${String(index).padStart(2, "0")}`;

  return {
    id: fixtureId,
    name: options.name ?? `${room.name} ${LIGHTING_FIXTURE_LABELS[type]} ${index + 1}`,
    type,
    manufacturer: defaults.manufacturer,
    model: defaults.model,
    roomId: room.id,
    roomName: room.name,
    mounting: defaults.mounting,
    beamAngle: defaults.beamAngle,
    falloff: type === "garden-lights" || type === "pool-lights" || type === "spotlights" ? "inverse-square" : "quadratic",
    shadowQuality: defaults.shadowQuality,
    intensity: defaults.intensity,
    powerWatts,
    load: {
      voltage: VOLTAGE,
      currentAmps: Number((consumptionWatts / VOLTAGE).toFixed(3)),
      powerWatts,
      consumptionWatts,
      estimatedMonthlyHours: defaults.monthlyHours,
      estimatedMonthlyKwh: Number(((consumptionWatts * defaults.monthlyHours) / 1000).toFixed(2)),
      peakLoadWatts: powerWatts,
    },
    controls: {
      enabled: true,
      displayName: options.name ?? `${room.name} ${LIGHTING_FIXTURE_LABELS[type]} ${index + 1}`,
      brightnessPercent: brightness,
      temperatureKelvin: defaults.temperatureKelvin,
      colour: defaults.colour,
      groupId,
    },
    effects: limitedEffects(type),
    pricing: pricing(defaults.equipmentCost, defaults.installationCost, defaults.labourCost),
    render: {
      position,
      rotation: options.rotation,
      size: options.size ?? defaults.size,
      shape: defaults.shape,
      visibility: true,
      lod: options.lod ?? (type === "downlights" || type === "stair-lights" ? "mid" : "near"),
      collision: false,
      shadow: options.shadow ?? defaults.shadowQuality !== "none",
      reflection: type !== "emergency-lights",
      realLight: options.realLight ?? defaults.realLight,
    },
    futureHooks: {
      grouping: true,
      automationReady: true,
      implementedAutomation: false,
      ai: false,
      voice: false,
      sceneLogic: false,
    },
  };
}

function downlightCount(room: InteriorRoom) {
  if (room.futureEnergyConsumption.zone === "outdoor") return Math.max(2, Math.round(room.areaSqm / 28));
  if (room.futureEnergyConsumption.zone === "service") return Math.max(1, Math.round(room.areaSqm / 20));
  if (room.futureEnergyConsumption.zone === "circulation") return Math.max(2, Math.round(room.areaSqm / 18));
  return Math.max(3, Math.min(10, Math.round(room.areaSqm / 16)));
}

function createRoomFixtures(room: InteriorRoom): readonly LightingFixtureSpec[] {
  const fixtures: LightingFixtureSpec[] = [];
  const y = ceilingY(room);
  const center = roomCenter(room);
  const groupId = groupForRoom(room.id, room.name);
  const baseCount = downlightCount(room);

  distributeInRoom(room, baseCount, y).forEach((position, index) => {
    fixtures.push(createFixture("downlights", room, index, position, { groupId, realLight: index < 2 && room.futureEnergyConsumption.profile !== "low" }));
  });

  if (room.floorMaterial === "large-format-marble" || room.id.includes("lounge") || room.id.includes("living")) {
    fixtures.push(createFixture("led-strip", room, fixtures.length, [center[0], y - 0.02, center[2]], { groupId, size: [Math.min(roomSize(room).width, 4.8), 0.035, 0.035], realLight: false }));
    fixtures.push(createFixture("spotlights", room, fixtures.length, [center[0] - 0.8, y - 0.05, center[2] - 0.45], { groupId, realLight: true }));
    fixtures.push(createFixture("wall-lights", room, fixtures.length, [room.boundingBox.min.x + 0.08, center[1] + 2.1, center[2]], { groupId, rotation: [0, Math.PI / 2, 0], realLight: false }));
  }

  if (room.id.includes("foyer") || room.id.includes("dining")) {
    fixtures.push(createFixture("pendant", room, fixtures.length, [center[0], y - 0.75, center[2]], { groupId, realLight: true, shadow: true }));
  }

  if (room.id.includes("kitchen")) {
    fixtures.push(createFixture("track-lights", room, fixtures.length, [center[0], y - 0.04, center[2] - 0.45], { groupId: "kitchen", size: [1.2, 0.08, 0.08], realLight: true }));
    fixtures.push(createFixture("cabinet-lights", room, fixtures.length, [center[0], room.boundingBox.min.y + 1.55, room.boundingBox.max.z - 0.2], { groupId: "kitchen", size: [1.25, 0.035, 0.035], realLight: false }));
  }

  if (room.id.includes("bathroom") || room.id.includes("powder")) {
    fixtures.push(createFixture("mirror-lights", room, fixtures.length, [room.boundingBox.max.x - 0.12, room.boundingBox.min.y + 2, center[2]], { groupId: "bedrooms", rotation: [0, -Math.PI / 2, 0], realLight: false }));
    fixtures.push(createFixture("ceiling-lights", room, fixtures.length, [center[0], y - 0.06, center[2]], { groupId: "bedrooms", realLight: true }));
  }

  if (room.id.includes("bedroom") || room.id.includes("closet")) {
    fixtures.push(createFixture("decorative-lights", room, fixtures.length, [center[0] - 0.7, y - 0.2, center[2] + 0.5], { groupId: "bedrooms", realLight: false }));
    fixtures.push(createFixture("wall-lights", room, fixtures.length, [room.boundingBox.min.x + 0.08, room.boundingBox.min.y + 2, center[2]], { groupId: "bedrooms", rotation: [0, Math.PI / 2, 0], realLight: false }));
  }

  if (room.id.includes("cinema")) {
    fixtures.push(createFixture("led-strip", room, fixtures.length, [center[0], y - 0.02, center[2]], { groupId: "cinema", size: [3.6, 0.035, 0.035], realLight: false }));
    fixtures.push(createFixture("spotlights", room, fixtures.length, [center[0] + 0.8, y - 0.05, center[2] - 0.3], { groupId: "cinema", realLight: true }));
  }

  if (room.id.includes("gym")) {
    fixtures.push(createFixture("track-lights", room, fixtures.length, [center[0], y - 0.04, center[2]], { groupId: "gym", size: [1.35, 0.08, 0.08], realLight: true }));
    fixtures.push(createFixture("mirror-lights", room, fixtures.length, [room.boundingBox.min.x + 0.08, room.boundingBox.min.y + 2, center[2]], { groupId: "gym", rotation: [0, Math.PI / 2, 0], realLight: false }));
  }

  if (room.id.includes("staircase")) {
    const steps = distributeInRoom(room, 8, room.boundingBox.min.y + 0.55, 0.25);
    steps.forEach((position, index) => {
      fixtures.push(createFixture("stair-lights", room, fixtures.length + index, [position[0], position[1] + index * 0.12, position[2]], { groupId: "living-room", realLight: false }));
    });
    fixtures.push(createFixture("pendant", room, fixtures.length, [center[0], y - 1.05, center[2]], { groupId: "living-room", realLight: true }));
  }

  if (room.futureEnergyConsumption.zone === "service" || room.futureEnergyConsumption.zone === "circulation" || room.id.includes("cinema")) {
    fixtures.push(createFixture("emergency-lights", room, fixtures.length, [room.boundingBox.min.x + 0.45, y - 0.04, room.boundingBox.min.z + 0.45], { groupId, realLight: false }));
  }

  if (room.futureEnergyConsumption.zone === "outdoor") {
    fixtures.push(createFixture("wall-lights", room, fixtures.length, [center[0], room.boundingBox.min.y + 2.2, room.boundingBox.max.z - 0.08], { groupId: "garden", realLight: false }));
    fixtures.push(createFixture("decorative-lights", room, fixtures.length, [center[0] + 1, y - 0.22, center[2]], { groupId: "garden", realLight: false }));
  }

  return fixtures;
}

const SITE_POOL_ROOM = {
  id: "site-pool",
  name: "Swimming Pool",
  boundingBox: {
    min: { x: -9.8, y: 0.08, z: -13.6 },
    max: { x: 1.2, y: 1.1, z: -7.3 },
  },
} satisfies Pick<InteriorRoom, "id" | "name" | "boundingBox">;

const SITE_GARDEN_ROOM = {
  id: "site-garden",
  name: "Garden",
  boundingBox: {
    min: { x: -21.5, y: 0.08, z: -17.5 },
    max: { x: 21.5, y: 1.4, z: 9.8 },
  },
} satisfies Pick<InteriorRoom, "id" | "name" | "boundingBox">;

const SITE_GARAGE_ROOM = {
  id: "site-garage",
  name: "Covered Garage",
  boundingBox: {
    min: { x: 10.8, y: 0.08, z: 0.8 },
    max: { x: 17.2, y: 3.2, z: 6.2 },
  },
} satisfies Pick<InteriorRoom, "id" | "name" | "boundingBox">;

function createSiteFixtures(): readonly LightingFixtureSpec[] {
  const fixtures: LightingFixtureSpec[] = [];
  const poolPositions: readonly [number, number, number][] = [
    [-8.8, 0.38, -12.8],
    [-5.7, 0.38, -12.8],
    [-2.6, 0.38, -12.8],
    [0.4, 0.38, -12.8],
    [-8.8, 0.38, -8.2],
    [-5.7, 0.38, -8.2],
    [-2.6, 0.38, -8.2],
    [0.4, 0.38, -8.2],
  ];
  poolPositions.forEach((position, index) => {
    fixtures.push(createFixture("pool-lights", SITE_POOL_ROOM, index, position, { groupId: "pool", rotation: [Math.PI / 2, 0, 0], realLight: index < 4 }));
  });

  const gardenPositions: readonly [number, number, number][] = [
    [-19, 0.42, -13.8],
    [-15.5, 0.42, 6.8],
    [-8.5, 0.42, 7.6],
    [0, 0.42, 8.1],
    [8.5, 0.42, 7.2],
    [16.5, 0.42, 5.4],
    [18.7, 0.42, -4.4],
    [14.8, 0.42, -13.2],
    [-16.4, 0.42, -6.8],
    [-3.4, 0.42, -15.2],
  ];
  gardenPositions.forEach((position, index) => {
    fixtures.push(createFixture("garden-lights", SITE_GARDEN_ROOM, index, position, { groupId: "garden", realLight: index < 4, lod: "far" }));
  });

  fixtures.push(createFixture("ceiling-lights", SITE_GARAGE_ROOM, 0, [13.9, 3.02, 2.2], { groupId: "garage", realLight: true }));
  fixtures.push(createFixture("ceiling-lights", SITE_GARAGE_ROOM, 1, [13.9, 3.02, 4.8], { groupId: "garage", realLight: true }));
  fixtures.push(createFixture("emergency-lights", SITE_GARAGE_ROOM, 2, [11.6, 2.94, 5.6], { groupId: "garage", realLight: false }));

  return fixtures;
}

export const LIGHTING_FIXTURES: readonly LightingFixtureSpec[] = [
  ...INTERIOR_ROOMS.flatMap((room) => createRoomFixtures(room)),
  ...createSiteFixtures(),
] as const;

export const MAX_REAL_LIGHTS = 32;
export const LIGHTING_REAL_LIGHTS: readonly LightingFixtureSpec[] = LIGHTING_FIXTURES.filter((fixture) => fixture.render.realLight).slice(0, MAX_REAL_LIGHTS);

function switchTypeForRoom(room: InteriorRoom, index: number): ElectricalSwitchType {
  if (room.id.includes("staircase") && index === 1) return "wireless-switch";
  if (room.id.includes("cinema")) return "scene-switch";
  if (room.id.includes("foyer") || room.id.includes("living") || room.id.includes("lounge") || room.id.includes("bedroom")) return index === 0 ? "dimmer" : "touch-switch";
  if (room.futureEnergyConsumption.zone === "service") return "2-gang";
  if (room.futureEnergyConsumption.zone === "outdoor") return "1-gang";
  return "3-gang";
}

function gangCount(type: ElectricalSwitchType) {
  if (type === "1-gang" || type === "dimmer" || type === "scene-switch" || type === "touch-switch" || type === "wireless-switch") return 1;
  if (type === "2-gang") return 2;
  if (type === "3-gang") return 3;
  return 4;
}

function createSwitch(room: InteriorRoom, type: ElectricalSwitchType, index: number, fixtureIds: readonly string[]): ElectricalSwitchSpec {
  const center = roomCenter(room);
  const groupId = groupForRoom(room.id, room.name);

  return {
    id: `she-switch-${room.id}-${type}-${index}`,
    type,
    name: `${room.name} ${ELECTRICAL_SWITCH_LABELS[type]}`,
    manufacturer: type === "touch-switch" || type === "dimmer" ? "Basalte" : "Lutron",
    model: type === "scene-switch" ? "Alisse Keypad Hardware" : type === "wireless-switch" ? "Pico Wireless Wall Control" : "Palladiom Architectural Control",
    roomId: room.id,
    roomName: room.name,
    groupId,
    position: [room.boundingBox.min.x + 0.16, room.boundingBox.min.y + 1.18, center[2]],
    gangCount: gangCount(type),
    supportsDimming: type === "dimmer" || type === "touch-switch" || type === "scene-switch",
    wireless: type === "wireless-switch",
    touch: type === "touch-switch",
    controlsFixtureIds: fixtureIds,
    standbyWatts: type === "wireless-switch" ? 0.02 : type === "scene-switch" ? 0.8 : 0.35,
    pricing: pricing(type === "scene-switch" ? 310 : type === "touch-switch" ? 260 : type === "dimmer" ? 220 : 95, 60, 42),
  };
}

function createSwitches(): readonly ElectricalSwitchSpec[] {
  const switches: ElectricalSwitchSpec[] = [];

  INTERIOR_ROOMS.forEach((room) => {
    const roomFixtureIds = LIGHTING_FIXTURES.filter((fixture) => fixture.roomId === room.id).map((fixture) => fixture.id);
    const switchCount = room.areaSqm > 44 || room.id.includes("staircase") ? 2 : 1;

    for (let index = 0; index < switchCount; index += 1) {
      switches.push(createSwitch(room, switchTypeForRoom(room, index), index, roomFixtureIds));
    }
  });

  switches.push(createSwitch({ ...INTERIOR_ROOMS[0], id: "site-garden", name: "Garden" }, "4-gang", 0, LIGHTING_FIXTURES.filter((fixture) => fixture.roomId === "site-garden").map((fixture) => fixture.id)));
  switches.push(createSwitch({ ...INTERIOR_ROOMS[0], id: "site-pool", name: "Swimming Pool" }, "scene-switch", 0, LIGHTING_FIXTURES.filter((fixture) => fixture.roomId === "site-pool").map((fixture) => fixture.id)));
  switches.push(createSwitch({ ...INTERIOR_ROOMS[0], id: "site-garage", name: "Covered Garage" }, "2-gang", 0, LIGHTING_FIXTURES.filter((fixture) => fixture.roomId === "site-garage").map((fixture) => fixture.id)));

  return switches;
}

export const ELECTRICAL_SWITCHES: readonly ElectricalSwitchSpec[] = createSwitches();

function socketProfile(type: ElectricalSocketType) {
  if (type === "usb-socket") return { standbyWatts: 0.25, peakLoadWatts: 360, ups: false, solar: false, outdoor: false, cost: 80 };
  if (type === "smart-socket") return { standbyWatts: 0.7, peakLoadWatts: 2300, ups: false, solar: false, outdoor: false, cost: 110 };
  if (type === "outdoor-socket") return { standbyWatts: 0.15, peakLoadWatts: 2300, ups: false, solar: false, outdoor: true, cost: 130 };
  if (type === "ups-socket") return { standbyWatts: 0.2, peakLoadWatts: 1800, ups: true, solar: false, outdoor: false, cost: 145 };
  if (type === "solar-socket") return { standbyWatts: 0.2, peakLoadWatts: 1800, ups: false, solar: true, outdoor: false, cost: 160 };
  return { standbyWatts: 0.08, peakLoadWatts: 2300, ups: false, solar: false, outdoor: false, cost: 48 };
}

function socketTypesForRoom(room: InteriorRoom): readonly ElectricalSocketType[] {
  if (room.id.includes("utility")) return ["normal-socket", "ups-socket", "solar-socket", "smart-socket"];
  if (room.id.includes("kitchen")) return ["normal-socket", "usb-socket", "smart-socket", "ups-socket"];
  if (room.id.includes("garage")) return ["normal-socket", "smart-socket", "ups-socket"];
  if (room.futureEnergyConsumption.zone === "outdoor") return ["outdoor-socket", "smart-socket"];
  if (room.id.includes("bedroom") || room.id.includes("office") || room.id.includes("library") || room.id.includes("study")) return ["normal-socket", "usb-socket", "smart-socket"];
  if (room.id.includes("cinema") || room.id.includes("gym")) return ["normal-socket", "smart-socket", "ups-socket"];
  return ["normal-socket", "usb-socket"];
}

function createSocket(room: InteriorRoom | typeof SITE_POOL_ROOM | typeof SITE_GARDEN_ROOM | typeof SITE_GARAGE_ROOM, type: ElectricalSocketType, index: number): ElectricalSocketSpec {
  const profile = socketProfile(type);
  const centerX = (room.boundingBox.min.x + room.boundingBox.max.x) / 2;
  const zSpan = room.boundingBox.max.z - room.boundingBox.min.z;
  const z = room.boundingBox.min.z + (zSpan * (index + 1)) / 4;

  return {
    id: `she-socket-${room.id}-${type}-${index}`,
    type,
    name: `${room.name} ${ELECTRICAL_SOCKET_LABELS[type]}`,
    manufacturer: type === "smart-socket" ? "Schneider Electric" : "Legrand",
    model: type === "outdoor-socket" ? "Plexo IP66" : type === "ups-socket" ? "Arteor UPS Dedicated" : type === "solar-socket" ? "GreenUp Solar Dedicated" : "Arteor Premium Outlet",
    roomId: room.id,
    roomName: room.name,
    groupId: groupForRoom(room.id, room.name),
    position: [centerX, room.boundingBox.min.y + 0.42, Number(z.toFixed(2))],
    ratedVoltage: VOLTAGE,
    ratedAmps: type === "usb-socket" ? 6 : 13,
    standbyWatts: profile.standbyWatts,
    peakLoadWatts: profile.peakLoadWatts,
    upsBacked: profile.ups,
    solarBacked: profile.solar,
    outdoorRated: profile.outdoor,
    pricing: pricing(profile.cost, type === "outdoor-socket" ? 70 : 45, type === "outdoor-socket" ? 38 : 28),
  };
}

function createSockets(): readonly ElectricalSocketSpec[] {
  const sockets = INTERIOR_ROOMS.flatMap((room) => socketTypesForRoom(room).map((type, index) => createSocket(room, type, index)));

  return [
    ...sockets,
    createSocket(SITE_GARDEN_ROOM, "outdoor-socket", 0),
    createSocket(SITE_GARDEN_ROOM, "smart-socket", 1),
    createSocket(SITE_POOL_ROOM, "outdoor-socket", 0),
    createSocket(SITE_POOL_ROOM, "smart-socket", 1),
    createSocket(SITE_GARAGE_ROOM, "normal-socket", 0),
    createSocket(SITE_GARAGE_ROOM, "ups-socket", 1),
  ];
}

export const ELECTRICAL_SOCKETS: readonly ElectricalSocketSpec[] = createSockets();

function createLightingGroups(): readonly LightingGroupSpec[] {
  return ROOM_LIGHT_GROUPS.map((groupId) => {
    const fixtureIds = LIGHTING_FIXTURES.filter((fixture) => fixture.controls.groupId === groupId).map((fixture) => fixture.id);
    const switchIds = ELECTRICAL_SWITCHES.filter((switchSpec) => switchSpec.groupId === groupId).map((switchSpec) => switchSpec.id);
    const socketIds = ELECTRICAL_SOCKETS.filter((socket) => socket.groupId === groupId).map((socket) => socket.id);
    const fixtures = LIGHTING_FIXTURES.filter((fixture) => fixture.controls.groupId === groupId);
    const roomIds = Array.from(new Set([...fixtures.map((fixture) => fixture.roomId), ...ELECTRICAL_SWITCHES.filter((switchSpec) => switchSpec.groupId === groupId).map((switchSpec) => switchSpec.roomId)]));

    return {
      id: groupId,
      name: ROOM_LIGHT_GROUP_LABELS[groupId],
      roomIds,
      fixtureIds,
      switchIds,
      socketIds,
      totalWattage: Number(fixtures.reduce((total, fixture) => total + fixture.load.consumptionWatts, 0).toFixed(2)),
      estimatedMonthlyKwh: Number(fixtures.reduce((total, fixture) => total + fixture.load.estimatedMonthlyKwh, 0).toFixed(2)),
    };
  });
}

export const LIGHTING_GROUPS: readonly LightingGroupSpec[] = createLightingGroups();
export const LIGHTING_POWER_SUMMARY = calculateLightingPowerSummary(LIGHTING_FIXTURES, ELECTRICAL_SWITCHES, ELECTRICAL_SOCKETS);
export const LIGHTING_QUOTE_SUMMARY = calculateLightingQuoteSummary(LIGHTING_FIXTURES, ELECTRICAL_SWITCHES, ELECTRICAL_SOCKETS);

export const LIGHTING_ENGINE_REPORT: LightingEngineReport = {
  fixtureCount: LIGHTING_FIXTURES.length,
  switchCount: ELECTRICAL_SWITCHES.length,
  socketCount: ELECTRICAL_SOCKETS.length,
  lightTypesCovered: LIGHTING_FIXTURE_TYPES,
  switchTypesCovered: ELECTRICAL_SWITCH_TYPES,
  socketTypesCovered: ELECTRICAL_SOCKET_TYPES,
  roomLightGroupsCovered: ROOM_LIGHT_GROUPS,
  actualLightCount: LIGHTING_REAL_LIGHTS.length,
  instancedPlaceholderCount: LIGHTING_FIXTURES.length,
  powerSummary: LIGHTING_POWER_SUMMARY,
  quoteSummary: LIGHTING_QUOTE_SUMMARY,
  performance: {
    instancedGeometry: true,
    automaticLodReady: true,
    shadowOptimization: true,
    occlusionReady: true,
    realLightsLimitedFor60Fps: true,
  },
  constraints: {
    ai: "excluded",
    scenes: "excluded",
    voice: "excluded",
    externalQuotationEngine: "untouched",
    api: "untouched",
    database: "untouched",
  },
};

export function getLightingFixture(fixtureId: string) {
  return LIGHTING_FIXTURES.find((fixture) => fixture.id === fixtureId) ?? null;
}
