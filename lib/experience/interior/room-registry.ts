import type {
  FutureRoomCapability,
  InteriorFloorLevel,
  InteriorFloorMaterial,
  InteriorRoom,
  InteriorRoomQuoteMapping,
} from "@/types/experience";

const FUTURE_READY_CAPABILITIES: readonly FutureRoomCapability[] = [
  "lighting",
  "curtains",
  "air-conditioning",
  "cctv",
  "sensors",
  "locks",
  "voice-assistant",
  "ai",
  "quotation",
];

const AREA_SCALE_FACTOR = 1.86;

interface RoomInput {
  readonly id: string;
  readonly name: string;
  readonly floorLevel: InteriorFloorLevel;
  readonly bounds: readonly [number, number, number, number];
  readonly yMin: number;
  readonly ceilingHeight: number;
  readonly floorMaterial: InteriorFloorMaterial;
  readonly energyZone: InteriorRoom["futureEnergyConsumption"]["zone"];
  readonly energyProfile: InteriorRoom["futureEnergyConsumption"]["profile"];
  readonly quoteCategory: InteriorRoomQuoteMapping["category"];
  readonly allowanceCode: string;
  readonly futureDeviceAllowance: number;
}

function room({
  id,
  name,
  floorLevel,
  bounds,
  yMin,
  ceilingHeight,
  floorMaterial,
  energyZone,
  energyProfile,
  quoteCategory,
  allowanceCode,
  futureDeviceAllowance,
}: RoomInput): InteriorRoom {
  const [xMin, xMax, zMin, zMax] = bounds;
  const width = Math.abs(xMax - xMin);
  const depth = Math.abs(zMax - zMin);
  const areaSqm = Number((width * depth * AREA_SCALE_FACTOR).toFixed(1));
  const volumeCbm = Number((areaSqm * ceilingHeight).toFixed(1));
  const centerX = (xMin + xMax) / 2;
  const centerZ = (zMin + zMax) / 2;
  const centerY = yMin + ceilingHeight / 2;
  const cameraDistance = Math.max(5.2, Math.max(width, depth) * 1.15);

  return {
    id,
    name,
    floorLevel,
    areaSqm,
    volumeCbm,
    ceilingHeight,
    floorMaterial,
    boundingBox: {
      min: { x: xMin, y: yMin, z: zMin },
      max: { x: xMax, y: yMin + ceilingHeight, z: zMax },
    },
    futureSmartDevices: FUTURE_READY_CAPABILITIES,
    futureEnergyConsumption: {
      zone: energyZone,
      profile: energyProfile,
      baselineKwhPerDay: energyProfile === "high" ? 18 : energyProfile === "medium" ? 9 : 4,
    },
    futureQuoteMapping: {
      category: quoteCategory,
      allowanceCode,
      futureDeviceAllowance,
    },
    cameraFocus: {
      position: { x: centerX + cameraDistance, y: centerY + 2.4, z: centerZ + cameraDistance },
      target: { x: centerX, y: centerY, z: centerZ },
    },
  };
}

const groundY = 0.18;
const firstY = 4.42;

export const INTERIOR_ROOMS: readonly InteriorRoom[] = [
  room({ id: "gf-foyer", name: "Luxury Foyer", floorLevel: "ground", bounds: [-3.2, 1.0, 1.85, 4.78], yMin: groundY, ceilingHeight: 7.1, floorMaterial: "large-format-marble", energyZone: "circulation", energyProfile: "medium", quoteCategory: "entry", allowanceCode: "SHE-GF-ENTRY", futureDeviceAllowance: 10 }),
  room({ id: "gf-formal-living", name: "Formal Living Room", floorLevel: "ground", bounds: [-8.65, -3.25, 0.35, 4.35], yMin: groundY, ceilingHeight: 3.72, floorMaterial: "large-format-marble", energyZone: "comfort", energyProfile: "high", quoteCategory: "living", allowanceCode: "SHE-GF-LIVING-FORMAL", futureDeviceAllowance: 14 }),
  room({ id: "gf-family-lounge", name: "Family Lounge", floorLevel: "ground", bounds: [-0.95, 4.2, -3.9, 0.45], yMin: groundY, ceilingHeight: 3.52, floorMaterial: "engineered-wood", energyZone: "comfort", energyProfile: "high", quoteCategory: "living", allowanceCode: "SHE-GF-LOUNGE-FAMILY", futureDeviceAllowance: 14 }),
  room({ id: "gf-dining", name: "Dining Room", floorLevel: "ground", bounds: [4.2, 8.65, -3.9, -0.85], yMin: groundY, ceilingHeight: 3.48, floorMaterial: "large-format-marble", energyZone: "comfort", energyProfile: "medium", quoteCategory: "living", allowanceCode: "SHE-GF-DINING", futureDeviceAllowance: 10 }),
  room({ id: "gf-open-kitchen", name: "Open Kitchen", floorLevel: "ground", bounds: [4.2, 8.65, -0.85, 2.0], yMin: groundY, ceilingHeight: 3.28, floorMaterial: "large-format-marble", energyZone: "service", energyProfile: "high", quoteCategory: "kitchen", allowanceCode: "SHE-GF-KITCHEN-OPEN", futureDeviceAllowance: 16 }),
  room({ id: "gf-dirty-kitchen", name: "Dirty Kitchen", floorLevel: "ground", bounds: [6.15, 8.65, 2.0, 4.35], yMin: groundY, ceilingHeight: 3.05, floorMaterial: "polished-concrete", energyZone: "service", energyProfile: "high", quoteCategory: "kitchen", allowanceCode: "SHE-GF-KITCHEN-DIRTY", futureDeviceAllowance: 10 }),
  room({ id: "gf-pantry", name: "Pantry", floorLevel: "ground", bounds: [4.2, 6.15, 2.0, 4.35], yMin: groundY, ceilingHeight: 3.05, floorMaterial: "polished-concrete", energyZone: "service", energyProfile: "low", quoteCategory: "service", allowanceCode: "SHE-GF-PANTRY", futureDeviceAllowance: 6 }),
  room({ id: "gf-wine-cellar", name: "Wine Cellar", floorLevel: "ground", bounds: [1.0, 3.05, 2.0, 4.35], yMin: groundY, ceilingHeight: 2.72, floorMaterial: "polished-concrete", energyZone: "service", energyProfile: "medium", quoteCategory: "service", allowanceCode: "SHE-GF-WINE", futureDeviceAllowance: 8 }),
  room({ id: "gf-laundry", name: "Laundry", floorLevel: "ground", bounds: [-8.65, -6.25, -3.9, -1.6], yMin: groundY, ceilingHeight: 3.05, floorMaterial: "polished-concrete", energyZone: "service", energyProfile: "medium", quoteCategory: "service", allowanceCode: "SHE-GF-LAUNDRY", futureDeviceAllowance: 8 }),
  room({ id: "gf-guest-bedroom", name: "Guest Bedroom", floorLevel: "ground", bounds: [-16.25, -12.45, -3.9, 0.0], yMin: groundY, ceilingHeight: 3.2, floorMaterial: "engineered-wood", energyZone: "comfort", energyProfile: "medium", quoteCategory: "bedroom", allowanceCode: "SHE-GF-GUEST-BED", futureDeviceAllowance: 12 }),
  room({ id: "gf-guest-bathroom", name: "Guest Bathroom", floorLevel: "ground", bounds: [-12.45, -10.55, -3.9, -1.5], yMin: groundY, ceilingHeight: 2.95, floorMaterial: "bathroom-tile", energyZone: "service", energyProfile: "medium", quoteCategory: "bathroom", allowanceCode: "SHE-GF-GUEST-BATH", futureDeviceAllowance: 8 }),
  room({ id: "gf-powder-room", name: "Powder Room", floorLevel: "ground", bounds: [1.0, 2.5, 0.45, 2.0], yMin: groundY, ceilingHeight: 2.95, floorMaterial: "bathroom-tile", energyZone: "service", energyProfile: "low", quoteCategory: "bathroom", allowanceCode: "SHE-GF-POWDER", futureDeviceAllowance: 6 }),
  room({ id: "gf-prayer-room", name: "Prayer Room", floorLevel: "ground", bounds: [-10.55, -8.65, -3.9, -1.5], yMin: groundY, ceilingHeight: 3.05, floorMaterial: "engineered-wood", energyZone: "comfort", energyProfile: "low", quoteCategory: "living", allowanceCode: "SHE-GF-PRAYER", futureDeviceAllowance: 7 }),
  room({ id: "gf-cinema", name: "Cinema", floorLevel: "ground", bounds: [-16.25, -12.45, 0.0, 2.35], yMin: groundY, ceilingHeight: 2.78, floorMaterial: "acoustic-floor", energyZone: "entertainment", energyProfile: "high", quoteCategory: "wellness", allowanceCode: "SHE-GF-CINEMA", futureDeviceAllowance: 18 }),
  room({ id: "gf-gym", name: "Gym", floorLevel: "ground", bounds: [-12.45, -8.65, 0.0, 2.35], yMin: groundY, ceilingHeight: 3.15, floorMaterial: "polished-concrete", energyZone: "wellness", energyProfile: "medium", quoteCategory: "wellness", allowanceCode: "SHE-GF-GYM", futureDeviceAllowance: 10 }),
  room({ id: "gf-home-office", name: "Home Office", floorLevel: "ground", bounds: [-8.65, -5.45, -1.6, 0.35], yMin: groundY, ceilingHeight: 3.05, floorMaterial: "engineered-wood", energyZone: "comfort", energyProfile: "medium", quoteCategory: "office", allowanceCode: "SHE-GF-OFFICE", futureDeviceAllowance: 10 }),
  room({ id: "gf-storage", name: "Storage", floorLevel: "ground", bounds: [-5.45, -3.35, -3.9, -1.6], yMin: groundY, ceilingHeight: 2.95, floorMaterial: "polished-concrete", energyZone: "service", energyProfile: "low", quoteCategory: "service", allowanceCode: "SHE-GF-STORAGE", futureDeviceAllowance: 4 }),
  room({ id: "gf-smart-utility", name: "Smart Utility Room", floorLevel: "ground", bounds: [-3.35, -1.25, -3.9, -1.6], yMin: groundY, ceilingHeight: 2.95, floorMaterial: "polished-concrete", energyZone: "service", energyProfile: "high", quoteCategory: "service", allowanceCode: "SHE-GF-UTILITY", futureDeviceAllowance: 16 }),
  room({ id: "gf-staircase", name: "Staircase", floorLevel: "ground", bounds: [-3.2, -0.85, -1.6, 1.85], yMin: groundY, ceilingHeight: 7.1, floorMaterial: "large-format-marble", energyZone: "circulation", energyProfile: "medium", quoteCategory: "circulation", allowanceCode: "SHE-GF-STAIR", futureDeviceAllowance: 8 }),
  room({ id: "gf-elevator-shaft", name: "Elevator Shaft", floorLevel: "ground", bounds: [-0.85, 0.45, -1.6, 0.1], yMin: groundY, ceilingHeight: 7.45, floorMaterial: "polished-concrete", energyZone: "circulation", energyProfile: "medium", quoteCategory: "circulation", allowanceCode: "SHE-GF-ELEVATOR", futureDeviceAllowance: 8 }),
  room({ id: "gf-garage-connection", name: "Garage Connection", floorLevel: "ground", bounds: [8.65, 11.05, 2.0, 4.35], yMin: groundY, ceilingHeight: 3.05, floorMaterial: "polished-concrete", energyZone: "circulation", energyProfile: "low", quoteCategory: "circulation", allowanceCode: "SHE-GF-GARAGE-CONNECTION", futureDeviceAllowance: 6 }),
  room({ id: "gf-patio-access", name: "Outdoor Patio Access", floorLevel: "ground", bounds: [-0.95, 4.2, -5.2, -3.9], yMin: groundY, ceilingHeight: 3.1, floorMaterial: "outdoor-decking", energyZone: "outdoor", energyProfile: "low", quoteCategory: "outdoor", allowanceCode: "SHE-GF-PATIO", futureDeviceAllowance: 8 }),
  room({ id: "ff-master-bedroom", name: "Master Bedroom", floorLevel: "first", bounds: [-8.25, -3.95, -4.45, -1.2], yMin: firstY, ceilingHeight: 3.25, floorMaterial: "engineered-wood", energyZone: "comfort", energyProfile: "high", quoteCategory: "bedroom", allowanceCode: "SHE-FF-MASTER-BED", futureDeviceAllowance: 16 }),
  room({ id: "ff-walk-in-closet", name: "Luxury Walk-in Closet", floorLevel: "first", bounds: [-8.25, -5.75, -1.2, 1.0], yMin: firstY, ceilingHeight: 3.0, floorMaterial: "engineered-wood", energyZone: "comfort", energyProfile: "medium", quoteCategory: "bedroom", allowanceCode: "SHE-FF-MASTER-CLOSET", futureDeviceAllowance: 10 }),
  room({ id: "ff-luxury-bathroom", name: "Luxury Bathroom", floorLevel: "first", bounds: [-5.75, -3.95, -1.2, 1.0], yMin: firstY, ceilingHeight: 3.0, floorMaterial: "bathroom-tile", energyZone: "service", energyProfile: "medium", quoteCategory: "bathroom", allowanceCode: "SHE-FF-MASTER-BATH", futureDeviceAllowance: 10 }),
  room({ id: "ff-private-lounge", name: "Private Lounge", floorLevel: "first", bounds: [-3.95, -0.6, -4.45, -1.2], yMin: firstY, ceilingHeight: 3.15, floorMaterial: "engineered-wood", energyZone: "comfort", energyProfile: "medium", quoteCategory: "living", allowanceCode: "SHE-FF-PRIVATE-LOUNGE", futureDeviceAllowance: 10 }),
  room({ id: "ff-bedroom-2", name: "Bedroom 2", floorLevel: "first", bounds: [-0.6, 2.5, -4.45, -1.2], yMin: firstY, ceilingHeight: 3.05, floorMaterial: "engineered-wood", energyZone: "comfort", energyProfile: "medium", quoteCategory: "bedroom", allowanceCode: "SHE-FF-BED-2", futureDeviceAllowance: 12 }),
  room({ id: "ff-bedroom-3", name: "Bedroom 3", floorLevel: "first", bounds: [2.5, 6.25, -4.45, -1.2], yMin: firstY, ceilingHeight: 3.05, floorMaterial: "engineered-wood", energyZone: "comfort", energyProfile: "medium", quoteCategory: "bedroom", allowanceCode: "SHE-FF-BED-3", futureDeviceAllowance: 12 }),
  room({ id: "ff-bedroom-4", name: "Bedroom 4", floorLevel: "first", bounds: [2.5, 6.25, 0.8, 3.05], yMin: firstY, ceilingHeight: 3.05, floorMaterial: "engineered-wood", energyZone: "comfort", energyProfile: "medium", quoteCategory: "bedroom", allowanceCode: "SHE-FF-BED-4", futureDeviceAllowance: 12 }),
  room({ id: "ff-family-lounge", name: "Shared Family Lounge", floorLevel: "first", bounds: [-3.95, 2.5, -1.2, 0.8], yMin: firstY, ceilingHeight: 3.28, floorMaterial: "engineered-wood", energyZone: "comfort", energyProfile: "high", quoteCategory: "living", allowanceCode: "SHE-FF-FAMILY-LOUNGE", futureDeviceAllowance: 14 }),
  room({ id: "ff-library", name: "Library", floorLevel: "first", bounds: [-8.25, -5.55, 1.0, 3.05], yMin: firstY, ceilingHeight: 3.05, floorMaterial: "engineered-wood", energyZone: "comfort", energyProfile: "medium", quoteCategory: "office", allowanceCode: "SHE-FF-LIBRARY", futureDeviceAllowance: 10 }),
  room({ id: "ff-study-area", name: "Study Area", floorLevel: "first", bounds: [-5.55, -3.0, 1.0, 3.05], yMin: firstY, ceilingHeight: 3.05, floorMaterial: "engineered-wood", energyZone: "comfort", energyProfile: "medium", quoteCategory: "office", allowanceCode: "SHE-FF-STUDY", futureDeviceAllowance: 10 }),
  room({ id: "ff-circulation-bridge", name: "Upper Circulation Bridge", floorLevel: "first", bounds: [-3.0, 2.5, 0.8, 3.05], yMin: firstY, ceilingHeight: 3.1, floorMaterial: "large-format-marble", energyZone: "circulation", energyProfile: "medium", quoteCategory: "circulation", allowanceCode: "SHE-FF-BRIDGE", futureDeviceAllowance: 8 }),
  room({ id: "ff-front-balcony", name: "Balconies", floorLevel: "first", bounds: [-5.85, 3.85, 3.05, 5.45], yMin: firstY, ceilingHeight: 2.65, floorMaterial: "outdoor-decking", energyZone: "outdoor", energyProfile: "low", quoteCategory: "outdoor", allowanceCode: "SHE-FF-BALCONIES", futureDeviceAllowance: 8 }),
  room({ id: "ff-rear-terrace", name: "Terraces", floorLevel: "first", bounds: [-5.35, 6.35, -8.65, -5.2], yMin: firstY, ceilingHeight: 2.65, floorMaterial: "outdoor-decking", energyZone: "outdoor", energyProfile: "low", quoteCategory: "outdoor", allowanceCode: "SHE-FF-TERRACES", futureDeviceAllowance: 8 }),
] as const;

export type InteriorRoomId = (typeof INTERIOR_ROOMS)[number]["id"];

export const INTERIOR_ROOM_BY_ID = new Map(INTERIOR_ROOMS.map((registryRoom) => [registryRoom.id, registryRoom]));

export function getInteriorRoom(roomId: string): InteriorRoom | null {
  return INTERIOR_ROOM_BY_ID.get(roomId) ?? null;
}

export function detectInteriorRoomAtPoint(point: { readonly x: number; readonly y: number; readonly z: number }): InteriorRoom | null {
  return (
    INTERIOR_ROOMS.find(
      ({ boundingBox }) =>
        point.x >= boundingBox.min.x &&
        point.x <= boundingBox.max.x &&
        point.y >= boundingBox.min.y &&
        point.y <= boundingBox.max.y &&
        point.z >= boundingBox.min.z &&
        point.z <= boundingBox.max.z,
    ) ?? null
  );
}

export const INTERIOR_TOTAL_AREA_SQM = Number(INTERIOR_ROOMS.reduce((total, registryRoom) => total + registryRoom.areaSqm, 0).toFixed(1));
export const INTERIOR_TOTAL_VOLUME_CBM = Number(INTERIOR_ROOMS.reduce((total, registryRoom) => total + registryRoom.volumeCbm, 0).toFixed(1));
