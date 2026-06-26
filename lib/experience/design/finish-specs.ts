import { getInteriorRoom } from "@/lib/experience/interior/room-registry";
import type {
  InteriorRoom,
  LuxuryInteriorDesignReport,
  LuxuryInteriorFinishKind,
  LuxuryInteriorFinishSpec,
  LuxuryInteriorMaterialName,
} from "@/types/experience";
import { LUXURY_INTERIOR_MATERIAL_NAMES } from "./luxury-materials";

type WallSide = "north" | "south" | "east" | "west";

interface WallFinishOptions {
  readonly widthScale?: number;
  readonly height?: number;
  readonly yOffset?: number;
  readonly centerOffset?: number;
  readonly thickness?: number;
  readonly lod?: LuxuryInteriorFinishSpec["lod"];
}

interface CeilingFinishOptions {
  readonly inset?: number;
  readonly drop?: number;
  readonly thickness?: number;
  readonly lod?: LuxuryInteriorFinishSpec["lod"];
}

interface FloorFinishOptions {
  readonly inset?: number;
  readonly thickness?: number;
  readonly lod?: LuxuryInteriorFinishSpec["lod"];
}

const PANEL_THICKNESS = 0.055;

function round(value: number) {
  return Number(value.toFixed(3));
}

function tuple(x: number, y: number, z: number): [number, number, number] {
  return [round(x), round(y), round(z)];
}

function requiredRoom(roomId: string): InteriorRoom {
  const room = getInteriorRoom(roomId);

  if (!room) {
    throw new Error(`Unknown interior room: ${roomId}`);
  }

  return room;
}

function roomWidth(room: InteriorRoom) {
  return Math.abs(room.boundingBox.max.x - room.boundingBox.min.x);
}

function roomDepth(room: InteriorRoom) {
  return Math.abs(room.boundingBox.max.z - room.boundingBox.min.z);
}

function roomCenter(room: InteriorRoom) {
  return {
    x: (room.boundingBox.min.x + room.boundingBox.max.x) / 2,
    z: (room.boundingBox.min.z + room.boundingBox.max.z) / 2,
  };
}

function defaultLighting(kind: LuxuryInteriorFinishKind) {
  const hiddenLight = kind === "led-ceiling-profile" || kind === "hidden-lighting" || kind === "mirror-lighting";

  return {
    naturalDaylight: true,
    artificialLightingReady: true,
    hiddenLight,
    globalIlluminationReady: true,
    hdrReady: true,
    reflectionReady: true,
  };
}

function finish(
  room: InteriorRoom,
  kind: LuxuryInteriorFinishKind,
  label: string,
  material: LuxuryInteriorMaterialName,
  position: [number, number, number],
  size: [number, number, number],
  options: {
    readonly idSuffix?: string;
    readonly rotation?: [number, number, number];
    readonly castShadow?: boolean;
    readonly receiveShadow?: boolean;
    readonly lod?: LuxuryInteriorFinishSpec["lod"];
  } = {},
): LuxuryInteriorFinishSpec {
  return {
    id: `${room.id}-${kind}${options.idSuffix ? `-${options.idSuffix}` : ""}`,
    roomId: room.id,
    roomName: room.name,
    kind,
    label,
    material,
    position,
    size,
    rotation: options.rotation,
    castShadow: options.castShadow ?? true,
    receiveShadow: options.receiveShadow ?? true,
    lod: options.lod ?? "standard",
    pbr: {
      normalMap: true,
      roughnessMap: true,
      aoMap: true,
      reflection: true,
    },
    lighting: defaultLighting(kind),
  };
}

function wallFinish(
  roomId: string,
  side: WallSide,
  kind: LuxuryInteriorFinishKind,
  label: string,
  material: LuxuryInteriorMaterialName,
  options: WallFinishOptions = {},
): LuxuryInteriorFinishSpec {
  const room = requiredRoom(roomId);
  const { min, max } = room.boundingBox;
  const width = roomWidth(room);
  const depth = roomDepth(room);
  const center = roomCenter(room);
  const height = options.height ?? Math.min(room.ceilingHeight - 0.55, 2.55);
  const yOffset = options.yOffset ?? 0.48;
  const thickness = options.thickness ?? PANEL_THICKNESS;
  const y = min.y + yOffset + height / 2;
  const idSuffix = side;

  if (side === "north" || side === "south") {
    const z = side === "north" ? min.z + thickness / 2 + 0.02 : max.z - thickness / 2 - 0.02;
    return finish(room, kind, label, material, tuple(center.x + (options.centerOffset ?? 0), y, z), tuple(width * (options.widthScale ?? 0.76), height, thickness), {
      idSuffix,
      lod: options.lod,
    });
  }

  const x = side === "west" ? min.x + thickness / 2 + 0.02 : max.x - thickness / 2 - 0.02;
  return finish(room, kind, label, material, tuple(x, y, center.z + (options.centerOffset ?? 0)), tuple(thickness, height, depth * (options.widthScale ?? 0.76)), {
    idSuffix,
    lod: options.lod,
  });
}

function ceilingFinish(
  roomId: string,
  kind: LuxuryInteriorFinishKind,
  label: string,
  material: LuxuryInteriorMaterialName,
  options: CeilingFinishOptions = {},
): LuxuryInteriorFinishSpec {
  const room = requiredRoom(roomId);
  const center = roomCenter(room);
  const width = roomWidth(room) * (options.inset ?? 0.74);
  const depth = roomDepth(room) * (options.inset ?? 0.74);
  const thickness = options.thickness ?? 0.055;

  return finish(room, kind, label, material, tuple(center.x, room.boundingBox.max.y - (options.drop ?? 0.18), center.z), tuple(width, thickness, depth), {
    castShadow: false,
    receiveShadow: true,
    lod: options.lod,
  });
}

function floorFinish(
  roomId: string,
  kind: LuxuryInteriorFinishKind,
  label: string,
  material: LuxuryInteriorMaterialName,
  options: FloorFinishOptions = {},
): LuxuryInteriorFinishSpec {
  const room = requiredRoom(roomId);
  const center = roomCenter(room);
  const width = roomWidth(room) * (options.inset ?? 0.9);
  const depth = roomDepth(room) * (options.inset ?? 0.9);
  const thickness = options.thickness ?? 0.035;

  return finish(room, kind, label, material, tuple(center.x, room.boundingBox.min.y + 0.11, center.z), tuple(width, thickness, depth), {
    castShadow: false,
    receiveShadow: true,
    lod: options.lod,
  });
}

function centeredVolume(
  roomId: string,
  kind: LuxuryInteriorFinishKind,
  label: string,
  material: LuxuryInteriorMaterialName,
  localPosition: [number, number, number],
  size: [number, number, number],
  idSuffix: string,
  lod: LuxuryInteriorFinishSpec["lod"] = "standard",
): LuxuryInteriorFinishSpec {
  const room = requiredRoom(roomId);
  const center = roomCenter(room);

  return finish(room, kind, label, material, tuple(center.x + localPosition[0], room.boundingBox.min.y + localPosition[1], center.z + localPosition[2]), size, {
    idSuffix,
    lod,
  });
}

function ledProfile(roomId: string, side: WallSide, kind: "led-ceiling-profile" | "hidden-lighting", label: string): LuxuryInteriorFinishSpec {
  const room = requiredRoom(roomId);
  const { min, max } = room.boundingBox;
  const width = roomWidth(room);
  const depth = roomDepth(room);
  const center = roomCenter(room);
  const y = max.y - 0.3;
  const thickness = 0.035;

  if (side === "north" || side === "south") {
    const z = side === "north" ? min.z + 0.22 : max.z - 0.22;
    return finish(room, kind, label, "brass", tuple(center.x, y, z), tuple(width * 0.84, thickness, thickness), {
      idSuffix: side,
      castShadow: false,
      receiveShadow: false,
      lod: "hero",
    });
  }

  const x = side === "west" ? min.x + 0.22 : max.x - 0.22;
  return finish(room, kind, label, "brass", tuple(x, y, center.z), tuple(thickness, thickness, depth * 0.84), {
    idSuffix: side,
    castShadow: false,
    receiveShadow: false,
    lod: "hero",
  });
}

const bedroomIds = ["gf-guest-bedroom", "ff-master-bedroom", "ff-bedroom-2", "ff-bedroom-3", "ff-bedroom-4"] as const;
const bathroomIds = ["gf-guest-bathroom", "gf-powder-room", "ff-luxury-bathroom"] as const;

const bedroomFinishes = bedroomIds.flatMap((roomId, index) => [
  wallFinish(roomId, "north", "headboard-wall", "Feature headboard wall", index === 0 ? "oak" : "walnut", { widthScale: 0.7, height: 2.2, lod: "hero" }),
  wallFinish(roomId, "east", "wardrobe", "Integrated wardrobe wall", index === 0 ? "teak" : "oak", { widthScale: 0.68, height: 2.45 }),
  ceilingFinish(roomId, "luxury-ceiling", "Bedroom recessed ceiling plane", "premium-paint", { inset: 0.7, drop: 0.22 }),
  ledProfile(roomId, "south", "led-ceiling-profile", "Bedroom warm architectural LED profile"),
]);

const bathroomFinishes = bathroomIds.flatMap((roomId) => [
  floorFinish(roomId, "bathroom-tile", "Bookmatched luxury bathroom tile floor", "italian-marble", { inset: 0.94, lod: "hero" }),
  wallFinish(roomId, "west", "floating-vanity", "Floating vanity architectural block", "walnut", { widthScale: 0.46, height: 0.74, yOffset: 0.74, lod: "hero" }),
  wallFinish(roomId, "north", "glass-shower", "Tempered glass shower enclosure", "glass", { widthScale: 0.52, height: 2.08, yOffset: 0.34 }),
  wallFinish(roomId, "east", "mirror-lighting", "Backlit mirror plane", "glass", { widthScale: 0.45, height: 1.2, yOffset: 1.05, thickness: 0.035 }),
  ledProfile(roomId, "east", "hidden-lighting", "Bathroom concealed linear light channel"),
]);

export const LUXURY_INTERIOR_FINISHES: readonly LuxuryInteriorFinishSpec[] = [
  floorFinish("gf-foyer", "feature-wall", "Large format Italian marble foyer floor", "italian-marble", { inset: 0.92, lod: "hero" }),
  wallFinish("gf-foyer", "north", "feature-wall", "Double height travertine arrival wall", "travertine", { widthScale: 0.88, height: 5.6, yOffset: 0.62, lod: "hero" }),
  wallFinish("gf-foyer", "west", "wall-panel", "Bronze trimmed foyer wall panels", "bronze", { widthScale: 0.62, height: 4.8, yOffset: 0.72, lod: "hero" }),
  ceilingFinish("gf-foyer", "luxury-ceiling", "Double height floating foyer ceiling", "premium-paint", { inset: 0.68, drop: 0.34, lod: "hero" }),
  ledProfile("gf-foyer", "north", "led-ceiling-profile", "Foyer recessed LED ceiling profile"),
  ledProfile("gf-foyer", "south", "led-ceiling-profile", "Foyer perimeter LED ceiling profile"),

  floorFinish("gf-formal-living", "feature-wall", "Formal living Italian marble floor finish", "italian-marble", { inset: 0.94, lod: "hero" }),
  wallFinish("gf-formal-living", "west", "fireplace-wall", "Natural stone architectural fireplace wall", "natural-stone", { widthScale: 0.74, height: 2.65, lod: "hero" }),
  wallFinish("gf-formal-living", "south", "tv-wall", "Device-free TV feature wall surface", "travertine", { widthScale: 0.74, height: 2.35, lod: "hero" }),
  wallFinish("gf-formal-living", "north", "floating-shelf", "Floating stone shelf ledge", "bronze", { widthScale: 0.54, height: 0.16, yOffset: 1.14, thickness: 0.16 }),
  wallFinish("gf-formal-living", "east", "built-in-niche", "Integrated display niche wall", "walnut", { widthScale: 0.48, height: 1.75, yOffset: 0.78 }),
  ceilingFinish("gf-formal-living", "luxury-ceiling", "Formal living designer ceiling tray", "premium-paint", { inset: 0.78, drop: 0.22, lod: "hero" }),
  ledProfile("gf-formal-living", "south", "hidden-lighting", "Formal living concealed cove light channel"),

  floorFinish("gf-family-lounge", "feature-wall", "Family lounge oak floor overlay", "oak", { inset: 0.92 }),
  wallFinish("gf-family-lounge", "south", "tv-wall", "Family lounge warm stone media wall", "natural-stone", { widthScale: 0.76, height: 2.26, lod: "hero" }),
  wallFinish("gf-family-lounge", "east", "wall-panel", "Walnut linear wall panelling", "walnut", { widthScale: 0.64, height: 2.32 }),
  ceilingFinish("gf-family-lounge", "luxury-ceiling", "Family lounge recessed ceiling", "premium-paint", { inset: 0.74, drop: 0.2 }),
  ledProfile("gf-family-lounge", "south", "hidden-lighting", "Family lounge hidden linear light slot"),

  floorFinish("gf-dining", "feature-wall", "Dining marble floor field", "italian-marble", { inset: 0.9 }),
  wallFinish("gf-dining", "east", "feature-wall", "Dining room bookmatched granite wall", "granite", { widthScale: 0.72, height: 2.42, lod: "hero" }),
  wallFinish("gf-dining", "south", "wall-panel", "Bronze dining wall reveals", "bronze", { widthScale: 0.74, height: 2.2 }),
  ceilingFinish("gf-dining", "luxury-ceiling", "Dining ceiling island recess", "premium-paint", { inset: 0.7, drop: 0.2 }),
  ledProfile("gf-dining", "east", "led-ceiling-profile", "Dining brass LED profile"),

  centeredVolume("gf-open-kitchen", "kitchen-island", "Built-in luxury kitchen island block", "walnut", [0, 0.55, -0.16], [2.9, 0.9, 0.86], "island", "hero"),
  centeredVolume("gf-open-kitchen", "quartz-countertop", "Quartz waterfall countertop slab", "quartz", [0, 1.03, -0.16], [3.06, 0.09, 1.02], "countertop", "hero"),
  wallFinish("gf-open-kitchen", "east", "hidden-storage", "Flush concealed kitchen storage wall", "oak", { widthScale: 0.82, height: 2.42, lod: "hero" }),
  wallFinish("gf-open-kitchen", "north", "wall-panel", "Microcement kitchen service wall", "microcement", { widthScale: 0.8, height: 2.2 }),
  ceilingFinish("gf-open-kitchen", "luxury-ceiling", "Kitchen recessed ceiling plane", "premium-paint", { inset: 0.78, drop: 0.2 }),
  ledProfile("gf-open-kitchen", "north", "led-ceiling-profile", "Kitchen integrated task light channel"),

  wallFinish("gf-dirty-kitchen", "east", "hidden-storage", "Dirty kitchen flush utility storage wall", "teak", { widthScale: 0.82, height: 2.16 }),
  centeredVolume("gf-dirty-kitchen", "quartz-countertop", "Durable granite preparation counter", "granite", [0, 0.92, 0.42], [2.0, 0.08, 0.52], "prep-counter"),
  ceilingFinish("gf-dirty-kitchen", "luxury-ceiling", "Service kitchen clean ceiling plane", "premium-paint", { inset: 0.78, drop: 0.18 }),

  wallFinish("gf-pantry", "east", "pantry-finish", "Teak pantry liner and shelving wall", "teak", { widthScale: 0.86, height: 2.18 }),
  wallFinish("gf-pantry", "north", "hidden-storage", "Flush pantry storage plane", "oak", { widthScale: 0.76, height: 2.16 }),
  ceilingFinish("gf-pantry", "luxury-ceiling", "Pantry premium paint ceiling", "premium-paint", { inset: 0.74, drop: 0.16 }),

  wallFinish("gf-wine-cellar", "north", "feature-wall", "Bronze wine cellar architectural wall", "bronze", { widthScale: 0.76, height: 2.05 }),
  wallFinish("gf-wine-cellar", "east", "wall-panel", "Natural stone cellar liner", "natural-stone", { widthScale: 0.72, height: 2.12 }),
  ledProfile("gf-wine-cellar", "north", "hidden-lighting", "Wine cellar concealed light slot"),

  wallFinish("gf-laundry", "north", "wall-panel", "Microcement laundry wall finish", "microcement", { widthScale: 0.78, height: 2.05 }),
  ceilingFinish("gf-laundry", "luxury-ceiling", "Laundry clean ceiling finish", "premium-paint", { inset: 0.78, drop: 0.16 }),

  wallFinish("gf-prayer-room", "east", "feature-wall", "Minimal natural stone prayer wall", "natural-stone", { widthScale: 0.72, height: 2.16 }),
  wallFinish("gf-prayer-room", "south", "wall-panel", "Quiet oak wall panel field", "oak", { widthScale: 0.72, height: 2.06 }),
  ceilingFinish("gf-prayer-room", "luxury-ceiling", "Soft recessed prayer room ceiling", "premium-paint", { inset: 0.72, drop: 0.18 }),

  wallFinish("gf-cinema", "north", "cinema-acoustic-wall", "Cinema acoustic front wall", "fabric", { widthScale: 0.86, height: 2.18, lod: "hero" }),
  wallFinish("gf-cinema", "west", "acoustic-panel", "Leather wrapped acoustic side panels", "leather", { widthScale: 0.78, height: 2.02, lod: "hero" }),
  wallFinish("gf-cinema", "east", "acoustic-panel", "Fabric acoustic side panels", "fabric", { widthScale: 0.78, height: 2.02 }),
  ceilingFinish("gf-cinema", "floating-ceiling", "Cinema floating acoustic ceiling raft", "fabric", { inset: 0.72, drop: 0.22, thickness: 0.08, lod: "hero" }),
  ledProfile("gf-cinema", "south", "hidden-lighting", "Cinema perimeter concealed light slot"),

  floorFinish("gf-gym", "rubber-floor", "Premium gym rubber floor overlay", "rubber", { inset: 0.94, lod: "hero" }),
  wallFinish("gf-gym", "north", "mirror-wall", "Full height gym mirror wall", "glass", { widthScale: 0.86, height: 2.38, yOffset: 0.42, lod: "hero" }),
  wallFinish("gf-gym", "east", "wall-panel", "Concrete wellness wall finish", "concrete", { widthScale: 0.76, height: 2.18 }),
  ledProfile("gf-gym", "north", "hidden-lighting", "Gym concealed reflection light slot"),

  wallFinish("gf-home-office", "north", "bookshelf-wall", "Built-in walnut office library wall", "walnut", { widthScale: 0.82, height: 2.32, lod: "hero" }),
  wallFinish("gf-home-office", "west", "acoustic-panel", "Leather office acoustic panels", "leather", { widthScale: 0.68, height: 1.88 }),
  ceilingFinish("gf-home-office", "luxury-ceiling", "Office quiet ceiling recess", "premium-paint", { inset: 0.72, drop: 0.18 }),
  ledProfile("gf-home-office", "north", "led-ceiling-profile", "Office linear ceiling profile"),

  wallFinish("gf-storage", "north", "wall-panel", "Microcement storage wall finish", "microcement", { widthScale: 0.76, height: 1.94, lod: "background" }),
  ceilingFinish("gf-storage", "luxury-ceiling", "Storage premium paint ceiling", "premium-paint", { inset: 0.74, drop: 0.14, lod: "background" }),
  wallFinish("gf-smart-utility", "north", "wall-panel", "Concrete utility wall finish without devices", "concrete", { widthScale: 0.76, height: 1.94, lod: "background" }),
  ceilingFinish("gf-smart-utility", "luxury-ceiling", "Utility premium paint ceiling", "premium-paint", { inset: 0.74, drop: 0.14, lod: "background" }),

  wallFinish("gf-staircase", "east", "glass-railing", "Floating stair tempered glass balustrade", "glass", { widthScale: 0.76, height: 1.18, yOffset: 1.22, thickness: 0.045, lod: "hero" }),
  wallFinish("gf-staircase", "west", "wall-panel", "Travertine stair gallery wall", "travertine", { widthScale: 0.76, height: 4.6, yOffset: 0.68, lod: "hero" }),
  ledProfile("gf-staircase", "west", "hidden-lighting", "Stair gallery concealed wall wash"),
  ceilingFinish("gf-staircase", "luxury-ceiling", "Double height stair ceiling plane", "premium-paint", { inset: 0.62, drop: 0.3, lod: "hero" }),

  wallFinish("gf-elevator-shaft", "south", "wall-panel", "Bronze elevator reveal wall", "bronze", { widthScale: 0.82, height: 5.8, yOffset: 0.7, lod: "hero" }),
  wallFinish("gf-elevator-shaft", "east", "glass-railing", "Glass elevator enclosure finish", "glass", { widthScale: 0.82, height: 5.8, yOffset: 0.7, thickness: 0.045, lod: "hero" }),
  wallFinish("gf-garage-connection", "north", "wall-panel", "Garage connection durable microcement wall", "microcement", { widthScale: 0.78, height: 2.02 }),
  ceilingFinish("gf-garage-connection", "luxury-ceiling", "Garage connection clean ceiling finish", "premium-paint", { inset: 0.74, drop: 0.16 }),

  ...bedroomFinishes,

  wallFinish("ff-walk-in-closet", "north", "closet-finish", "Luxury walnut walk-in closet finish", "walnut", { widthScale: 0.86, height: 2.38, lod: "hero" }),
  wallFinish("ff-walk-in-closet", "south", "closet-finish", "Bronze closet reveal system", "bronze", { widthScale: 0.82, height: 2.28, lod: "hero" }),
  wallFinish("ff-walk-in-closet", "west", "hidden-storage", "Flush oak closet storage wall", "oak", { widthScale: 0.74, height: 2.28 }),
  ceilingFinish("ff-walk-in-closet", "luxury-ceiling", "Closet soft ceiling tray", "premium-paint", { inset: 0.72, drop: 0.18 }),
  ledProfile("ff-walk-in-closet", "north", "led-ceiling-profile", "Closet display lighting channel"),

  ...bathroomFinishes,

  wallFinish("ff-private-lounge", "south", "tv-wall", "Private lounge stone media wall without device", "travertine", { widthScale: 0.78, height: 2.2, lod: "hero" }),
  wallFinish("ff-private-lounge", "west", "wall-panel", "Private lounge walnut panel field", "walnut", { widthScale: 0.7, height: 2.16 }),
  ceilingFinish("ff-private-lounge", "luxury-ceiling", "Private lounge recessed ceiling", "premium-paint", { inset: 0.72, drop: 0.2 }),
  ledProfile("ff-private-lounge", "south", "hidden-lighting", "Private lounge concealed light channel"),

  wallFinish("ff-family-lounge", "north", "tv-wall", "Upper lounge feature wall plane", "natural-stone", { widthScale: 0.78, height: 2.14, lod: "hero" }),
  wallFinish("ff-family-lounge", "south", "floating-shelf", "Upper lounge floating shelf ledge", "bronze", { widthScale: 0.56, height: 0.14, yOffset: 1.12, thickness: 0.14 }),
  ceilingFinish("ff-family-lounge", "luxury-ceiling", "Upper family lounge ceiling recess", "premium-paint", { inset: 0.76, drop: 0.2 }),
  ledProfile("ff-family-lounge", "north", "hidden-lighting", "Upper lounge concealed light channel"),

  wallFinish("ff-library", "north", "bookshelf-wall", "Built-in oak library wall", "oak", { widthScale: 0.86, height: 2.28, lod: "hero" }),
  wallFinish("ff-library", "west", "acoustic-panel", "Fabric reading acoustic panels", "fabric", { widthScale: 0.68, height: 1.94 }),
  ceilingFinish("ff-library", "luxury-ceiling", "Library recessed reading ceiling", "premium-paint", { inset: 0.72, drop: 0.18 }),
  ledProfile("ff-library", "north", "led-ceiling-profile", "Library shelf wash light channel"),

  wallFinish("ff-study-area", "north", "bookshelf-wall", "Integrated study shelving wall", "walnut", { widthScale: 0.82, height: 2.2 }),
  wallFinish("ff-study-area", "east", "acoustic-panel", "Study acoustic wall panels", "fabric", { widthScale: 0.68, height: 1.9 }),
  ceilingFinish("ff-study-area", "luxury-ceiling", "Study area ceiling recess", "premium-paint", { inset: 0.72, drop: 0.18 }),
  ledProfile("ff-study-area", "north", "led-ceiling-profile", "Study ceiling profile"),

  wallFinish("ff-circulation-bridge", "south", "glass-railing", "Upper bridge glass railing finish", "glass", { widthScale: 0.88, height: 1.05, yOffset: 0.72, thickness: 0.045, lod: "hero" }),
  wallFinish("ff-circulation-bridge", "north", "wall-panel", "Upper bridge premium paint gallery wall", "premium-paint", { widthScale: 0.84, height: 2.02 }),
  ledProfile("ff-circulation-bridge", "south", "hidden-lighting", "Bridge concealed linear light channel"),
] as const;

const coveredRooms = Array.from(new Set(LUXURY_INTERIOR_FINISHES.map((spec) => spec.roomId))).sort();

export const LUXURY_INTERIOR_DESIGN_REPORT: LuxuryInteriorDesignReport = {
  finishCount: LUXURY_INTERIOR_FINISHES.length,
  materialCount: LUXURY_INTERIOR_MATERIAL_NAMES.length,
  coveredRooms,
  designLanguage: ["Apple", "Tesla", "Bugatti Homes", "Dubai Luxury", "Modern Scandinavian", "Japanese Minimalism"],
  constraints: {
    furniture: "excluded",
    smartDevices: "excluded",
    automation: "excluded",
  },
  pbrPipeline: {
    proceduralNormalMaps: true,
    proceduralRoughnessMaps: true,
    proceduralAoMaps: true,
    reflectionReadyMaterials: true,
  },
} as const;
