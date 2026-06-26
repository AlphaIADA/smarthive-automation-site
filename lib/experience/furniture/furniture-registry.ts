import { INTERIOR_ROOMS, getInteriorRoom } from "@/lib/experience/interior/room-registry";
import type { FurnitureAssetStatistics, FurnitureCategory, FurniturePlacementSpec, InteriorRoom, LuxuryFurnitureReport } from "@/types/experience";
import { FURNITURE_ASSETS, FURNITURE_ASSET_BY_ID } from "./furniture-assets";
import { FURNITURE_MATERIAL_NAMES } from "./furniture-materials";

type PlacementInput = {
  readonly assetId: string;
  readonly label: string;
  readonly local: [number, number, number];
  readonly rotation?: [number, number, number];
  readonly scale?: [number, number, number];
};

const ROOM_ALIASES = {
  formalLiving: "gf-formal-living",
  familyLounge: "gf-family-lounge",
  dining: "gf-dining",
  openKitchen: "gf-open-kitchen",
  dirtyKitchen: "gf-dirty-kitchen",
  pantry: "gf-pantry",
  wineCellar: "gf-wine-cellar",
  laundry: "gf-laundry",
  guestBedroom: "gf-guest-bedroom",
  guestBathroom: "gf-guest-bathroom",
  powderRoom: "gf-powder-room",
  prayerRoom: "gf-prayer-room",
  cinema: "gf-cinema",
  gym: "gf-gym",
  homeOffice: "gf-home-office",
  storage: "gf-storage",
  utility: "gf-smart-utility",
  staircase: "gf-staircase",
  elevator: "gf-elevator-shaft",
  garageConnection: "gf-garage-connection",
  patio: "gf-patio-access",
  masterBedroom: "ff-master-bedroom",
  walkInCloset: "ff-walk-in-closet",
  luxuryBathroom: "ff-luxury-bathroom",
  privateLounge: "ff-private-lounge",
  bedroom2: "ff-bedroom-2",
  bedroom3: "ff-bedroom-3",
  bedroom4: "ff-bedroom-4",
  familyLoungeFirst: "ff-family-lounge",
  library: "ff-library",
  studyArea: "ff-study-area",
  bridge: "ff-circulation-bridge",
  balcony: "ff-front-balcony",
  terrace: "ff-rear-terrace",
} as const;

function round(value: number) {
  return Number(value.toFixed(3));
}

function tuple(x: number, y: number, z: number): [number, number, number] {
  return [round(x), round(y), round(z)];
}

function requiredRoom(roomId: string): InteriorRoom {
  const room = getInteriorRoom(roomId);

  if (!room) {
    throw new Error(`Unknown furniture room: ${roomId}`);
  }

  return room;
}

function roomCenter(room: InteriorRoom) {
  return {
    x: (room.boundingBox.min.x + room.boundingBox.max.x) / 2,
    z: (room.boundingBox.min.z + room.boundingBox.max.z) / 2,
  };
}

function roomPlacements(roomId: string, placements: readonly PlacementInput[]): readonly FurniturePlacementSpec[] {
  const room = requiredRoom(roomId);
  const center = roomCenter(room);
  const floorY = room.boundingBox.min.y + 0.08;

  return placements.map((placement, index) => {
    const asset = FURNITURE_ASSET_BY_ID.get(placement.assetId);

    if (!asset) {
      throw new Error(`Unknown furniture asset: ${placement.assetId}`);
    }

    return {
      id: `${room.id}-${placement.assetId}-${index + 1}`,
      assetId: placement.assetId,
      roomId: room.id,
      roomName: room.name,
      label: placement.label,
      category: asset.category,
      position: tuple(center.x + placement.local[0], floorY + placement.local[1], center.z + placement.local[2]),
      rotation: placement.rotation,
      scale: placement.scale,
      interaction: {
        selectable: true,
        futureDragReady: true,
        futureConfigureReady: true,
        futureQuoteReady: true,
      },
      constraints: {
        smartDevice: false,
        automation: false,
        ai: false,
        cctv: false,
        lightingLogic: false,
      },
    } satisfies FurniturePlacementSpec;
  });
}

const diningChairOffsets: readonly [number, number, number][] = [
  [-0.95, 0, -0.76],
  [-0.32, 0, -0.76],
  [0.32, 0, -0.76],
  [0.95, 0, -0.76],
  [-0.95, 0, 0.76],
  [-0.32, 0, 0.76],
  [0.32, 0, 0.76],
  [0.95, 0, 0.76],
];

function diningChairs(roomId: string, labelPrefix: string): readonly FurniturePlacementSpec[] {
  return roomPlacements(
    roomId,
    diningChairOffsets.map((local, index) => ({
      assetId: "dining-chair",
      label: `${labelPrefix} dining chair ${index + 1}`,
      local,
      rotation: [0, index < 4 ? Math.PI : 0, 0] as [number, number, number],
    })),
  );
}

function bedroomSuite(roomId: string, bedAssetId: "king-bed" | "queen-bed", label: string): readonly FurniturePlacementSpec[] {
  return roomPlacements(roomId, [
    { assetId: bedAssetId, label, local: [0, 0, -0.54] },
    { assetId: "night-stand", label: "Left night stand", local: [-1.1, 0, -0.7] },
    { assetId: "night-stand", label: "Right night stand", local: [1.1, 0, -0.7] },
    { assetId: "reading-lamp", label: "Left passive reading lamp", local: [-1.1, 0.58, -0.7] },
    { assetId: "reading-lamp", label: "Right passive reading lamp", local: [1.1, 0.58, -0.7] },
    { assetId: "wardrobe", label: "Premium wardrobe", local: [1.32, 0, 0.64], rotation: [0, -Math.PI / 2, 0], scale: [0.82, 0.92, 0.82] },
    { assetId: "tv-85", label: "Passive bedroom TV panel", local: [0, 0, 1.02], rotation: [0, Math.PI, 0], scale: [0.56, 0.56, 0.56] },
    { assetId: "study-desk", label: "Bedroom study desk", local: [-1.18, 0, 0.58], rotation: [0, Math.PI / 2, 0], scale: [0.72, 0.72, 0.72] },
    { assetId: "task-chair", label: "Bedroom study chair", local: [-0.78, 0, 0.58], rotation: [0, -Math.PI / 2, 0], scale: [0.74, 0.74, 0.74] },
  ]);
}

const outdoorChairOffsets: readonly [number, number, number][] = [
  [-0.72, 0, -0.62],
  [0.72, 0, -0.62],
  [-0.72, 0, 0.62],
  [0.72, 0, 0.62],
];

function outdoorDining(roomId: string, localOffset: [number, number, number], labelPrefix: string): readonly FurniturePlacementSpec[] {
  return roomPlacements(roomId, [
    { assetId: "outdoor-dining-table", label: `${labelPrefix} outdoor dining table`, local: localOffset },
    ...outdoorChairOffsets.map((offset, index) => ({
      assetId: "outdoor-chair",
      label: `${labelPrefix} outdoor dining chair ${index + 1}`,
      local: tuple(localOffset[0] + offset[0], localOffset[1] + offset[1], localOffset[2] + offset[2]),
      rotation: [0, index < 2 ? Math.PI : 0, 0] as [number, number, number],
    })),
  ]);
}

export const FURNITURE_PLACEMENTS: readonly FurniturePlacementSpec[] = [
  ...roomPlacements("gf-foyer", [
    { assetId: "foyer-console", label: "Foyer travertine console", local: [0, 0, 0.96] },
    { assetId: "decor-vase", label: "Foyer decor vase", local: [-0.36, 0.82, 0.96] },
    { assetId: "plant-pot", label: "Foyer architectural plant", local: [1.55, 0, -0.74] },
    { assetId: "elevator-bench", label: "Foyer arrival bench", local: [-1.42, 0, -0.8], rotation: [0, Math.PI / 2, 0] },
  ]),
  ...roomPlacements(ROOM_ALIASES.formalLiving, [
    { assetId: "luxury-sofa", label: "Formal living luxury sofa", local: [-0.2, 0, 0.78], rotation: [0, Math.PI, 0], scale: [1.08, 1.08, 1.08] },
    { assetId: "accent-chair", label: "Formal living accent chair left", local: [-1.55, 0, -0.28], rotation: [0, Math.PI / 2, 0] },
    { assetId: "accent-chair", label: "Formal living accent chair right", local: [1.42, 0, -0.28], rotation: [0, -Math.PI / 2, 0] },
    { assetId: "coffee-table", label: "Formal living coffee table", local: [-0.08, 0, 0.1] },
    { assetId: "side-table", label: "Formal living side table", local: [-2.0, 0, 0.82] },
    { assetId: "tv-console", label: "Formal living TV console", local: [0.12, 0, -1.55] },
    { assetId: "tv-85", label: "Formal living passive 85-inch TV", local: [0.12, 0.3, -1.72] },
    { assetId: "soundbar", label: "Formal living passive soundbar", local: [0.12, 0.84, -1.38] },
    { assetId: "speaker-tower", label: "Formal living speaker left", local: [-1.28, 0, -1.45] },
    { assetId: "speaker-tower", label: "Formal living speaker right", local: [1.52, 0, -1.45] },
    { assetId: "area-rug", label: "Formal living designer rug", local: [-0.1, 0, 0.12], scale: [1.12, 1, 1.05] },
    { assetId: "designer-floor-lamp", label: "Formal living designer lamp object", local: [2.05, 0, 0.86] },
    { assetId: "plant-pot", label: "Formal living plant", local: [-2.25, 0, -1.42] },
    { assetId: "decor-vase", label: "Formal living decor object", local: [0.48, 0.54, 0.08] },
  ]),
  ...roomPlacements(ROOM_ALIASES.familyLounge, [
    { assetId: "luxury-sofa", label: "Family lounge luxury sofa", local: [-0.5, 0, 0.82], rotation: [0, Math.PI, 0] },
    { assetId: "coffee-table", label: "Family lounge coffee table", local: [-0.5, 0, 0.08], scale: [0.88, 0.88, 0.88] },
    { assetId: "tv-console", label: "Family lounge console", local: [0.72, 0, -1.58] },
    { assetId: "tv-85", label: "Family lounge passive 85-inch TV", local: [0.72, 0.24, -1.76], scale: [0.58, 0.58, 0.58] },
    { assetId: "soundbar", label: "Family lounge passive soundbar", local: [0.72, 0.76, -1.44], scale: [0.72, 0.72, 0.72] },
    { assetId: "area-rug", label: "Family lounge area rug", local: [-0.5, 0, 0.1] },
    { assetId: "side-table", label: "Family lounge side table", local: [-1.86, 0, 0.78] },
    { assetId: "plant-pot", label: "Family lounge plant", local: [1.88, 0, 1.38] },
  ]),
  ...roomPlacements(ROOM_ALIASES.dining, [
    { assetId: "dining-table", label: "Luxury dining table", local: [0, 0, 0] },
    { assetId: "pendant-light", label: "Dining passive pendant object left", local: [-0.55, 1.52, 0] },
    { assetId: "pendant-light", label: "Dining passive pendant object right", local: [0.55, 1.52, 0] },
    { assetId: "buffet-console", label: "Dining buffet console", local: [1.62, 0, 0.84], rotation: [0, -Math.PI / 2, 0] },
    { assetId: "plant-pot", label: "Dining architectural plant", local: [-1.6, 0, 0.82] },
  ]),
  ...diningChairs(ROOM_ALIASES.dining, "Luxury"),
  ...roomPlacements(ROOM_ALIASES.openKitchen, [
    { assetId: "kitchen-cabinet", label: "Open kitchen cabinet run left", local: [1.1, 0, -0.82], scale: [1.12, 1, 1] },
    { assetId: "kitchen-cabinet", label: "Open kitchen cabinet run right", local: [1.1, 0, -0.2], scale: [1.12, 1, 1] },
    { assetId: "bar-chair", label: "Kitchen island bar chair 1", local: [-0.86, 0, 0.72] },
    { assetId: "bar-chair", label: "Kitchen island bar chair 2", local: [-0.28, 0, 0.72] },
    { assetId: "bar-chair", label: "Kitchen island bar chair 3", local: [0.3, 0, 0.72] },
    { assetId: "refrigerator", label: "Integrated refrigerator", local: [1.48, 0, 0.56], rotation: [0, -Math.PI / 2, 0], scale: [0.78, 0.86, 0.78] },
    { assetId: "wine-cooler", label: "Integrated wine cooler", local: [0.62, 0, 1.0], scale: [0.78, 0.78, 0.78] },
    { assetId: "oven", label: "Built-in oven", local: [1.55, 0, -0.1], rotation: [0, -Math.PI / 2, 0] },
    { assetId: "microwave", label: "Built-in microwave", local: [1.55, 0.72, -0.1], rotation: [0, -Math.PI / 2, 0] },
    { assetId: "dishwasher", label: "Integrated dishwasher", local: [0.58, 0, -0.92] },
    { assetId: "coffee-machine", label: "Countertop coffee machine", local: [0.72, 0.94, -0.92], scale: [0.7, 0.7, 0.7] },
    { assetId: "sink", label: "Inset kitchen sink", local: [-0.42, 0.98, -0.16] },
    { assetId: "extractor", label: "Minimal extractor object", local: [0.5, 0, -0.36] },
  ]),
  ...roomPlacements(ROOM_ALIASES.dirtyKitchen, [
    { assetId: "kitchen-cabinet", label: "Dirty kitchen cabinet run", local: [0, 0, -0.56], scale: [1.2, 1, 1] },
    { assetId: "refrigerator", label: "Service refrigerator", local: [0.72, 0, 0.46], scale: [0.7, 0.82, 0.7] },
    { assetId: "oven", label: "Service oven", local: [-0.62, 0, 0.52], scale: [0.82, 0.82, 0.82] },
    { assetId: "dishwasher", label: "Service dishwasher", local: [0.02, 0, 0.58], scale: [0.82, 0.82, 0.82] },
    { assetId: "sink", label: "Service sink", local: [-0.48, 0.92, -0.56], scale: [0.82, 0.82, 0.82] },
    { assetId: "extractor", label: "Service extractor", local: [0.42, 0, -0.56], scale: [0.76, 0.76, 0.76] },
  ]),
  ...roomPlacements(ROOM_ALIASES.pantry, [
    { assetId: "storage-rack", label: "Pantry premium storage rack left", local: [-0.48, 0, 0], scale: [0.72, 0.82, 0.82] },
    { assetId: "storage-rack", label: "Pantry premium storage rack right", local: [0.48, 0, 0], scale: [0.72, 0.82, 0.82] },
    { assetId: "kitchen-cabinet", label: "Pantry preparation cabinet", local: [0, 0, 0.72], scale: [0.82, 0.82, 0.82] },
  ]),
  ...roomPlacements(ROOM_ALIASES.wineCellar, [
    { assetId: "wine-cooler", label: "Wine cellar cooler left", local: [-0.42, 0, -0.48], scale: [0.82, 0.82, 0.82] },
    { assetId: "wine-cooler", label: "Wine cellar cooler right", local: [0.42, 0, -0.48], scale: [0.82, 0.82, 0.82] },
    { assetId: "side-table", label: "Wine tasting side table", local: [0, 0, 0.48], scale: [0.82, 0.82, 0.82] },
  ]),
  ...roomPlacements(ROOM_ALIASES.laundry, [
    { assetId: "laundry-counter", label: "Laundry folding counter", local: [0, 0, -0.42], scale: [1.0, 0.9, 0.9] },
    { assetId: "storage-rack", label: "Laundry storage rack", local: [0.72, 0, 0.48], rotation: [0, -Math.PI / 2, 0], scale: [0.72, 0.82, 0.72] },
  ]),
  ...bedroomSuite(ROOM_ALIASES.guestBedroom, "queen-bed", "Guest queen bed"),
  ...roomPlacements(ROOM_ALIASES.guestBathroom, [
    { assetId: "bathroom-stool", label: "Guest bathroom stool", local: [0.36, 0, 0.46] },
    { assetId: "storage-rack", label: "Guest bathroom linen shelf", local: [-0.48, 0, -0.28], rotation: [0, Math.PI / 2, 0], scale: [0.45, 0.58, 0.45] },
  ]),
  ...roomPlacements(ROOM_ALIASES.powderRoom, [
    { assetId: "bathroom-stool", label: "Powder room stool", local: [0, 0, 0.34], scale: [0.72, 0.72, 0.72] },
    { assetId: "decor-vase", label: "Powder room decor vase", local: [0.42, 0.82, -0.22], scale: [0.72, 0.72, 0.72] },
  ]),
  ...roomPlacements(ROOM_ALIASES.prayerRoom, [
    { assetId: "prayer-rug", label: "Minimal prayer rug", local: [0, 0, 0], rotation: [0, Math.PI, 0] },
    { assetId: "side-table", label: "Prayer room side table", local: [0.6, 0, 0.58], scale: [0.72, 0.72, 0.72] },
  ]),
  ...roomPlacements(ROOM_ALIASES.cinema, [
    { assetId: "projector-screen", label: "Cinema large passive screen", local: [0, 0.15, -0.96], scale: [0.9, 0.9, 0.9] },
    { assetId: "projector", label: "Cinema passive projector", local: [0, 0, 0.54] },
    { assetId: "cinema-recliner", label: "Cinema recliner 1", local: [-0.95, 0, 0.56] },
    { assetId: "cinema-recliner", label: "Cinema recliner 2", local: [0, 0, 0.56] },
    { assetId: "cinema-recliner", label: "Cinema recliner 3", local: [0.95, 0, 0.56] },
    { assetId: "speaker-tower", label: "Cinema surround speaker left", local: [-1.54, 0, -0.84], scale: [0.8, 0.8, 0.8] },
    { assetId: "speaker-tower", label: "Cinema surround speaker right", local: [1.54, 0, -0.84], scale: [0.8, 0.8, 0.8] },
    { assetId: "speaker-tower", label: "Cinema rear speaker left", local: [-1.54, 0, 0.88], rotation: [0, Math.PI, 0], scale: [0.72, 0.72, 0.72] },
    { assetId: "speaker-tower", label: "Cinema rear speaker right", local: [1.54, 0, 0.88], rotation: [0, Math.PI, 0], scale: [0.72, 0.72, 0.72] },
  ]),
  ...roomPlacements(ROOM_ALIASES.gym, [
    { assetId: "treadmill", label: "Gym treadmill", local: [-1.05, 0, 0.2] },
    { assetId: "exercise-bike", label: "Gym exercise bike", local: [0, 0, 0.54] },
    { assetId: "bench-press", label: "Gym bench press", local: [1.06, 0, 0.18], rotation: [0, Math.PI / 2, 0] },
    { assetId: "weights-rack", label: "Gym weights rack", local: [1.04, 0, -0.78], rotation: [0, Math.PI, 0] },
    { assetId: "yoga-mat", label: "Gym yoga area", local: [-0.88, 0, -0.74], rotation: [0, Math.PI / 2, 0] },
  ]),
  ...roomPlacements(ROOM_ALIASES.homeOffice, [
    { assetId: "executive-desk", label: "Home office executive desk", local: [0, 0, -0.12] },
    { assetId: "task-chair", label: "Home office executive chair", local: [0, 0, 0.48], rotation: [0, Math.PI, 0] },
    { assetId: "bookshelf", label: "Home office bookshelf left", local: [-1.12, 0, -0.42], rotation: [0, Math.PI / 2, 0], scale: [0.78, 0.88, 0.78] },
    { assetId: "bookshelf", label: "Home office bookshelf right", local: [1.12, 0, -0.42], rotation: [0, -Math.PI / 2, 0], scale: [0.78, 0.88, 0.78] },
    { assetId: "meeting-table", label: "Home office meeting table", local: [0, 0, 0.78], scale: [0.75, 0.75, 0.75] },
    { assetId: "accent-chair", label: "Home office meeting chair 1", local: [-0.62, 0, 0.78], rotation: [0, Math.PI / 2, 0], scale: [0.72, 0.72, 0.72] },
    { assetId: "accent-chair", label: "Home office meeting chair 2", local: [0.62, 0, 0.78], rotation: [0, -Math.PI / 2, 0], scale: [0.72, 0.72, 0.72] },
  ]),
  ...roomPlacements(ROOM_ALIASES.storage, [
    { assetId: "storage-rack", label: "Storage room rack left", local: [-0.42, 0, 0], scale: [0.72, 0.82, 0.72] },
    { assetId: "storage-rack", label: "Storage room rack right", local: [0.42, 0, 0], scale: [0.72, 0.82, 0.72] },
  ]),
  ...roomPlacements(ROOM_ALIASES.utility, [
    { assetId: "utility-cabinet", label: "Utility cabinet without smart devices", local: [-0.46, 0, 0], scale: [0.75, 0.82, 0.75] },
    { assetId: "laundry-counter", label: "Utility work counter", local: [0.48, 0, 0], scale: [0.72, 0.72, 0.72] },
  ]),
  ...roomPlacements(ROOM_ALIASES.staircase, [
    { assetId: "elevator-bench", label: "Stair landing bench", local: [0.44, 0, 0.84], rotation: [0, Math.PI / 2, 0], scale: [0.72, 0.72, 0.72] },
    { assetId: "plant-pot", label: "Staircase sculptural plant", local: [-0.76, 0, 0.82], scale: [0.74, 0.74, 0.74] },
  ]),
  ...roomPlacements(ROOM_ALIASES.elevator, [
    { assetId: "elevator-bench", label: "Elevator waiting bench", local: [0, 0, 0.42], scale: [0.62, 0.62, 0.62] },
  ]),
  ...roomPlacements(ROOM_ALIASES.garageConnection, [
    { assetId: "storage-rack", label: "Garage connection storage rack", local: [0.52, 0, 0], scale: [0.62, 0.72, 0.62] },
    { assetId: "elevator-bench", label: "Garage connection bench", local: [-0.52, 0, 0.24], rotation: [0, Math.PI / 2, 0], scale: [0.62, 0.62, 0.62] },
  ]),
  ...roomPlacements(ROOM_ALIASES.patio, [
    { assetId: "outdoor-lounger", label: "Pool patio lounger left", local: [-1.72, 0, 0], rotation: [0, Math.PI / 2, 0] },
    { assetId: "outdoor-lounger", label: "Pool patio lounger right", local: [-0.72, 0, 0], rotation: [0, Math.PI / 2, 0] },
    { assetId: "fire-pit", label: "Outdoor fire pit", local: [1.36, 0, 0.1] },
    { assetId: "garden-bench", label: "Patio garden bench", local: [0.18, 0, -0.28], scale: [0.82, 0.82, 0.82] },
  ]),
  ...bedroomSuite(ROOM_ALIASES.masterBedroom, "king-bed", "Master king bed"),
  ...roomPlacements(ROOM_ALIASES.masterBedroom, [
    { assetId: "dressing-table", label: "Master dressing table", local: [-1.46, 0, 0.68], rotation: [0, Math.PI / 2, 0], scale: [0.82, 0.82, 0.82] },
    { assetId: "bed-bench", label: "Master bed bench", local: [0, 0, 0.72] },
  ]),
  ...roomPlacements(ROOM_ALIASES.walkInCloset, [
    { assetId: "wardrobe", label: "Walk-in closet wardrobe wall left", local: [-0.62, 0, -0.32], scale: [0.72, 0.88, 0.72] },
    { assetId: "wardrobe", label: "Walk-in closet wardrobe wall right", local: [0.62, 0, -0.32], scale: [0.72, 0.88, 0.72] },
    { assetId: "dressing-table", label: "Walk-in closet dressing table", local: [0, 0, 0.62], scale: [0.72, 0.72, 0.72] },
    { assetId: "bed-bench", label: "Walk-in closet center bench", local: [0, 0, 0], scale: [0.82, 0.82, 0.82] },
  ]),
  ...roomPlacements(ROOM_ALIASES.luxuryBathroom, [
    { assetId: "bathroom-stool", label: "Luxury bathroom stool", local: [0.34, 0, 0.45] },
    { assetId: "storage-rack", label: "Luxury bathroom linen shelf", local: [-0.42, 0, -0.26], rotation: [0, Math.PI / 2, 0], scale: [0.45, 0.58, 0.45] },
  ]),
  ...roomPlacements(ROOM_ALIASES.privateLounge, [
    { assetId: "luxury-sofa", label: "Private lounge sofa", local: [0, 0, 0.58], rotation: [0, Math.PI, 0], scale: [0.86, 0.86, 0.86] },
    { assetId: "coffee-table", label: "Private lounge coffee table", local: [0, 0, -0.08], scale: [0.76, 0.76, 0.76] },
    { assetId: "tv-console", label: "Private lounge TV console", local: [0, 0, -1.12], scale: [0.76, 0.76, 0.76] },
    { assetId: "tv-85", label: "Private lounge passive TV", local: [0, 0.2, -1.28], scale: [0.48, 0.48, 0.48] },
    { assetId: "area-rug", label: "Private lounge rug", local: [0, 0, 0.08], scale: [0.78, 1, 0.78] },
  ]),
  ...bedroomSuite(ROOM_ALIASES.bedroom2, "queen-bed", "Bedroom 2 queen bed"),
  ...bedroomSuite(ROOM_ALIASES.bedroom3, "queen-bed", "Bedroom 3 queen bed"),
  ...bedroomSuite(ROOM_ALIASES.bedroom4, "queen-bed", "Bedroom 4 queen bed"),
  ...roomPlacements(ROOM_ALIASES.familyLoungeFirst, [
    { assetId: "luxury-sofa", label: "Upper family lounge sofa", local: [0, 0, 0.46], rotation: [0, Math.PI, 0], scale: [0.86, 0.86, 0.86] },
    { assetId: "coffee-table", label: "Upper family lounge table", local: [0, 0, -0.16], scale: [0.72, 0.72, 0.72] },
    { assetId: "tv-console", label: "Upper family lounge console", local: [0.86, 0, -0.76], scale: [0.72, 0.72, 0.72] },
    { assetId: "tv-85", label: "Upper family lounge passive TV", local: [0.86, 0.18, -0.92], scale: [0.44, 0.44, 0.44] },
    { assetId: "plant-pot", label: "Upper family lounge plant", local: [-2.4, 0, 0.46], scale: [0.72, 0.72, 0.72] },
  ]),
  ...roomPlacements(ROOM_ALIASES.library, [
    { assetId: "bookshelf", label: "Library bookshelf left", local: [-0.56, 0, -0.54], scale: [0.74, 0.82, 0.74] },
    { assetId: "bookshelf", label: "Library bookshelf right", local: [0.56, 0, -0.54], scale: [0.74, 0.82, 0.74] },
    { assetId: "accent-chair", label: "Library reading chair", local: [-0.54, 0, 0.5], rotation: [0, Math.PI / 4, 0], scale: [0.76, 0.76, 0.76] },
    { assetId: "side-table", label: "Library reading side table", local: [0.25, 0, 0.48], scale: [0.72, 0.72, 0.72] },
    { assetId: "designer-floor-lamp", label: "Library passive floor lamp", local: [0.88, 0, 0.54], scale: [0.74, 0.74, 0.74] },
  ]),
  ...roomPlacements(ROOM_ALIASES.studyArea, [
    { assetId: "study-desk", label: "Study area desk", local: [-0.42, 0, -0.34], scale: [0.82, 0.82, 0.82] },
    { assetId: "task-chair", label: "Study area chair", local: [-0.42, 0, 0.16], rotation: [0, Math.PI, 0], scale: [0.76, 0.76, 0.76] },
    { assetId: "bookshelf", label: "Study area shelf", local: [0.64, 0, -0.28], rotation: [0, -Math.PI / 2, 0], scale: [0.62, 0.72, 0.62] },
  ]),
  ...roomPlacements(ROOM_ALIASES.bridge, [
    { assetId: "elevator-bench", label: "Upper bridge bench", local: [1.38, 0, 0.18], rotation: [0, Math.PI / 2, 0], scale: [0.78, 0.78, 0.78] },
    { assetId: "plant-pot", label: "Upper bridge plant left", local: [-1.9, 0, 0.18], scale: [0.68, 0.68, 0.68] },
    { assetId: "plant-pot", label: "Upper bridge plant right", local: [-1.2, 0, 0.18], scale: [0.68, 0.68, 0.68] },
  ]),
  ...outdoorDining(ROOM_ALIASES.balcony, [0, 0, 0], "Balcony"),
  ...roomPlacements(ROOM_ALIASES.balcony, [
    { assetId: "garden-bench", label: "Balcony garden bench", local: [-3.2, 0, 0.22], scale: [0.82, 0.82, 0.82] },
    { assetId: "plant-pot", label: "Balcony planter left", local: [3.8, 0, 0.28], scale: [0.7, 0.7, 0.7] },
  ]),
  ...outdoorDining(ROOM_ALIASES.terrace, [-1.8, 0, 0.1], "Terrace"),
  ...roomPlacements(ROOM_ALIASES.terrace, [
    { assetId: "outdoor-kitchen", label: "Terrace outdoor kitchen", local: [2.8, 0, 0.3], rotation: [0, -Math.PI / 2, 0] },
    { assetId: "outdoor-lounger", label: "Terrace lounger left", local: [-4.0, 0, -0.35], rotation: [0, Math.PI / 2, 0] },
    { assetId: "outdoor-lounger", label: "Terrace lounger right", local: [-3.05, 0, -0.35], rotation: [0, Math.PI / 2, 0] },
    { assetId: "fire-pit", label: "Terrace fire pit", local: [0.82, 0, -0.3] },
    { assetId: "garden-bench", label: "Terrace garden bench", local: [4.5, 0, -0.1] },
  ]),
] as const;

const populatedRooms = Array.from(new Set(FURNITURE_PLACEMENTS.map((placement) => placement.roomId))).sort();
const categories = Array.from(new Set(FURNITURE_ASSETS.map((asset) => asset.category))).sort() as readonly FurnitureCategory[];
const usedAssetIds = new Set(FURNITURE_PLACEMENTS.map((placement) => placement.assetId));
const usedTriangleCount = FURNITURE_PLACEMENTS.reduce((total, placement) => {
  const asset = FURNITURE_ASSET_BY_ID.get(placement.assetId);
  return total + (asset?.approximateTriangleCount ?? 0);
}, 0);

export const FURNITURE_ASSET_STATISTICS: FurnitureAssetStatistics = {
  materialCount: FURNITURE_MATERIAL_NAMES.length,
  assetTemplateCount: FURNITURE_ASSETS.length,
  placementCount: FURNITURE_PLACEMENTS.length,
  populatedRoomCount: populatedRooms.length,
  reusableAssetCount: usedAssetIds.size,
  totalApproximateTriangles: usedTriangleCount,
  categories,
} as const;

export const LUXURY_FURNITURE_REPORT: LuxuryFurnitureReport = {
  library: FURNITURE_ASSET_STATISTICS,
  populatedRooms,
  deliverables: ["Luxury Furniture Library", "Scene Population System", "Furniture Registry", "Performance Report", "Asset Statistics"],
  constraints: {
    smartDevices: "excluded",
    ai: "excluded",
    automation: "excluded",
    cctv: "excluded",
    lightingLogic: "excluded",
  },
  performance: {
    reusableAssets: true,
    sharedMaterials: true,
    shadowEnabled: true,
    lodReady: true,
    futureInteractionReady: true,
    externalAssets: "none",
  },
} as const;

export const FURNITURE_UNPOPULATED_ROOM_IDS = INTERIOR_ROOMS.map((room) => room.id).filter((roomId) => !populatedRooms.includes(roomId));
