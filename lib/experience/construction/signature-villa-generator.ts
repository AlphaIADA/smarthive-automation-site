import type {
  ConstructionCeilingType,
  ConstructionComponentNode,
  ConstructionDoorPosition,
  ConstructionFloorBuilderInput,
  ConstructionMaterial,
  ConstructionRoomBuilderInput,
  ConstructionVillaBuilderInput,
  InteriorFloorMaterial,
  InteriorRoom,
} from "@/types/experience";
import { INTERIOR_ROOMS } from "@/lib/experience/interior/room-registry";
import { createConstructionComponent } from "./component-registry";
import { buildVilla } from "./villa-builder";

function mapFloorMaterial(material: InteriorFloorMaterial): ConstructionMaterial {
  if (material === "engineered-wood") return "wood";
  if (material === "polished-concrete") return "concrete";
  if (material === "bathroom-tile") return "marble";
  if (material === "outdoor-decking") return "wood";
  if (material === "acoustic-floor") return "black-steel";
  return "marble";
}

function ceilingTypeForRoom(room: InteriorRoom): ConstructionCeilingType {
  if (room.id === "gf-foyer" || room.id === "gf-staircase") return "double-height";
  if (room.id.includes("cinema")) return "acoustic";
  if (room.id.includes("kitchen")) return "recessed";
  if (room.name.includes("Living") || room.name.includes("Lounge")) return "bulkhead";
  return "standard";
}

function doorKindForRoom(room: InteriorRoom): ConstructionDoorPosition["kind"] {
  if (room.id === "gf-foyer") return "pivot-door";
  if (room.id.includes("patio") || room.id.includes("balcony") || room.id.includes("terrace")) return "sliding-door";
  if (room.id.includes("garage")) return "garage-door";
  return "door";
}

function roomToBuilderInput(room: InteriorRoom): ConstructionRoomBuilderInput {
  const { min, max } = room.boundingBox;
  const width = Number((max.x - min.x).toFixed(2));
  const length = Number((max.z - min.z).toFixed(2));
  const height = Number((max.y - min.y).toFixed(2));
  const position = [
    Number(((min.x + max.x) / 2).toFixed(2)),
    min.y,
    Number(((min.z + max.z) / 2).toFixed(2)),
  ] as const;
  const isOutdoor = room.futureEnergyConsumption.zone === "outdoor";
  const doorPositions: readonly ConstructionDoorPosition[] = isOutdoor
    ? []
    : [
        {
          id: `${room.id}-primary-door`,
          wall: "south",
          offset: 0,
          width: doorKindForRoom(room) === "pivot-door" ? 1.6 : 0.95,
          height: doorKindForRoom(room) === "pivot-door" ? 2.9 : 2.15,
          kind: doorKindForRoom(room),
        },
      ];
  const windowPositions = isOutdoor
    ? []
    : [
        {
          id: `${room.id}-primary-window`,
          wall: "north" as const,
          offset: 0,
          width: Math.max(1.1, Math.min(width * 0.54, 3.6)),
          height: room.name.includes("Bathroom") || room.name.includes("Powder") ? 0.8 : 1.6,
          sillHeight: room.name.includes("Bathroom") || room.name.includes("Powder") ? 1.65 : 0.7,
          kind: room.name.includes("Living") || room.name.includes("Lounge") ? ("curtain-wall" as const) : ("window" as const),
        },
      ];

  return {
    roomId: room.id,
    roomName: room.name,
    length,
    width,
    height,
    position,
    doorPositions,
    windowPositions,
    ceilingType: ceilingTypeForRoom(room),
    floorMaterial: mapFloorMaterial(room.floorMaterial),
    wallMaterial: "concrete",
  };
}

function createSiteComponents(): readonly ConstructionComponentNode[] {
  return [
    createConstructionComponent({
      id: "signature-villa-driveway-system",
      kind: "driveway",
      position: [8.3, 0.02, 22.1],
      parameters: { width: 8.4, height: 0.1, depth: 23.5, thickness: 0.1, material: "concrete" },
    }),
    createConstructionComponent({
      id: "signature-villa-pool-system",
      kind: "swimming-pool",
      position: [2.5, 0.02, -20.3],
      parameters: { width: 15.8, height: 0.42, depth: 6.4, thickness: 0.42, material: "water" },
    }),
    createConstructionComponent({
      id: "signature-villa-water-feature-system",
      kind: "water-feature",
      position: [8.2, 0.95, -25],
      parameters: { width: 3.7, height: 1.4, depth: 0.22, thickness: 0.16, material: "water" },
    }),
    createConstructionComponent({
      id: "signature-villa-fence-system",
      kind: "fence",
      position: [0, 0.68, 0],
      parameters: { width: 72, height: 1.35, depth: 70, thickness: 0.12, material: "black-steel" },
    }),
    createConstructionComponent({
      id: "signature-villa-gate-system",
      kind: "gate",
      position: [0, 0.68, 35],
      parameters: { width: 7.6, height: 1.2, depth: 0.16, thickness: 0.16, material: "black-steel" },
    }),
    createConstructionComponent({
      id: "signature-villa-garden-system",
      kind: "garden",
      position: [0, -0.05, 0],
      parameters: { width: 78, height: 0.08, depth: 74, thickness: 0.08, material: "landscape" },
    }),
    createConstructionComponent({
      id: "signature-villa-landscape-system",
      kind: "landscape",
      position: [0, -0.08, 0],
      parameters: { width: 82, height: 0.08, depth: 78, thickness: 0.08, material: "landscape" },
    }),
    createConstructionComponent({
      id: "signature-villa-front-balcony-system",
      kind: "balcony",
      position: [-1.8, 4.34, 4.52],
      parameters: { width: 9.4, height: 0.2, depth: 2.3, thickness: 0.2, material: "travertine" },
    }),
    createConstructionComponent({
      id: "signature-villa-rear-terrace-system",
      kind: "terrace",
      position: [0.8, 4.34, -6.2],
      parameters: { width: 12.2, height: 0.22, depth: 4.8, thickness: 0.22, material: "travertine" },
    }),
    createConstructionComponent({
      id: "signature-villa-glass-balustrade-system",
      kind: "balustrade",
      position: [-1.8, 5.02, 5.74],
      parameters: { width: 9.5, height: 1.02, depth: 0.12, thickness: 0.12, material: "tempered-glass" },
    }),
  ];
}

export function createSignatureVillaConstructionInput(): ConstructionVillaBuilderInput {
  const groundRooms = INTERIOR_ROOMS.filter((room) => room.floorLevel === "ground").map(roomToBuilderInput);
  const firstFloorRooms = INTERIOR_ROOMS.filter((room) => room.floorLevel === "first").map(roomToBuilderInput);
  const floors: readonly ConstructionFloorBuilderInput[] = [
    {
      floorId: "signature-villa-ground-floor",
      level: 0,
      elevation: 0.18,
      slabThickness: 0.22,
      rooms: groundRooms,
    },
    {
      floorId: "signature-villa-first-floor",
      level: 1,
      elevation: 4.42,
      slabThickness: 0.2,
      rooms: firstFloorRooms,
    },
  ];

  return {
    buildingId: "smart-hive-signature-villa",
    program: "5-bedroom",
    floors,
    siteComponents: createSiteComponents(),
  };
}

export function buildSignatureVillaConstructionSystem() {
  return buildVilla(createSignatureVillaConstructionInput());
}
