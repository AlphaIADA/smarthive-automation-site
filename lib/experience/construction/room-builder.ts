import type {
  ConstructionComponentKind,
  ConstructionComponentNode,
  ConstructionDoorPosition,
  ConstructionOpening,
  ConstructionRoomBuilderInput,
  ConstructionRoomOutput,
  ConstructionVector3,
  ConstructionWindowPosition,
} from "@/types/experience";
import { createConstructionComponent } from "./component-registry";

const WALL_THICKNESS = 0.16;
const SKIRTING_HEIGHT = 0.12;
const SKIRTING_DEPTH = 0.04;

function wallPosition(
  roomPosition: ConstructionVector3,
  wall: ConstructionDoorPosition["wall"],
  offset: number,
  width: number,
  length: number,
  height: number,
): ConstructionVector3 {
  const [x, y, z] = roomPosition;
  const halfWidth = width / 2;
  const halfLength = length / 2;

  if (wall === "north") return [x + offset, y + height / 2, z - halfLength];
  if (wall === "south") return [x + offset, y + height / 2, z + halfLength];
  if (wall === "east") return [x + halfWidth, y + height / 2, z + offset];
  return [x - halfWidth, y + height / 2, z + offset];
}

function openingForDoor(door: ConstructionDoorPosition): ConstructionOpening {
  return {
    id: door.id,
    kind: "door",
    position: [door.offset, door.height / 2, 0],
    width: door.width,
    height: door.height,
  };
}

function openingForWindow(windowPosition: ConstructionWindowPosition): ConstructionOpening {
  return {
    id: windowPosition.id,
    kind: windowPosition.wall === "ceiling" ? "skylight" : "window",
    position: [windowPosition.offset, windowPosition.sillHeight + windowPosition.height / 2, 0],
    width: windowPosition.width,
    height: windowPosition.height,
    sillHeight: windowPosition.sillHeight,
  };
}

function wallOpenings(input: ConstructionRoomBuilderInput, wall: ConstructionDoorPosition["wall"]): readonly ConstructionOpening[] {
  return [
    ...input.doorPositions.filter((door) => door.wall === wall).map(openingForDoor),
    ...input.windowPositions.filter((windowPosition) => windowPosition.wall === wall).map(openingForWindow),
  ];
}

function createWallComponents(input: ConstructionRoomBuilderInput): readonly ConstructionComponentNode[] {
  const { roomId, width, length, height, position, wallMaterial = "concrete" } = input;
  const [x, y, z] = position;
  const halfWidth = width / 2;
  const halfLength = length / 2;

  return [
    createConstructionComponent({
      id: `${roomId}-wall-north`,
      kind: "internal-wall",
      roomId,
      position: [x, y + height / 2, z - halfLength],
      openings: wallOpenings(input, "north"),
      parameters: { width, height, depth: WALL_THICKNESS, thickness: WALL_THICKNESS, material: wallMaterial },
    }),
    createConstructionComponent({
      id: `${roomId}-wall-south`,
      kind: "internal-wall",
      roomId,
      position: [x, y + height / 2, z + halfLength],
      openings: wallOpenings(input, "south"),
      parameters: { width, height, depth: WALL_THICKNESS, thickness: WALL_THICKNESS, material: wallMaterial },
    }),
    createConstructionComponent({
      id: `${roomId}-wall-east`,
      kind: "internal-wall",
      roomId,
      position: [x + halfWidth, y + height / 2, z],
      openings: wallOpenings(input, "east"),
      parameters: { width: WALL_THICKNESS, height, depth: length, thickness: WALL_THICKNESS, material: wallMaterial },
    }),
    createConstructionComponent({
      id: `${roomId}-wall-west`,
      kind: "internal-wall",
      roomId,
      position: [x - halfWidth, y + height / 2, z],
      openings: wallOpenings(input, "west"),
      parameters: { width: WALL_THICKNESS, height, depth: length, thickness: WALL_THICKNESS, material: wallMaterial },
    }),
  ];
}

function createDoorComponents(input: ConstructionRoomBuilderInput): readonly ConstructionComponentNode[] {
  return input.doorPositions.map((door) => {
    const kind: ConstructionComponentKind = door.kind;

    return createConstructionComponent({
      id: `${input.roomId}-${door.id}`,
      kind,
      roomId: input.roomId,
      position: wallPosition(input.position, door.wall, door.offset, input.width, input.length, door.height),
      parameters: {
        width: door.width,
        height: door.height,
        depth: 0.12,
        thickness: 0.12,
        material: door.kind === "sliding-door" ? "tempered-glass" : door.kind === "garage-door" ? "brushed-aluminium" : "wood",
        rotation: door.wall === "east" || door.wall === "west" ? [0, Math.PI / 2, 0] : [0, 0, 0],
      },
    });
  });
}

function createWindowComponents(input: ConstructionRoomBuilderInput): readonly ConstructionComponentNode[] {
  return input.windowPositions.map((windowPosition) => {
    const kind: ConstructionComponentKind = windowPosition.kind;
    const position =
      windowPosition.wall === "ceiling"
        ? ([input.position[0] + windowPosition.offset, input.position[1] + input.height, input.position[2]] as const)
        : wallPosition(input.position, windowPosition.wall, windowPosition.offset, input.width, input.length, windowPosition.sillHeight + windowPosition.height);

    return createConstructionComponent({
      id: `${input.roomId}-${windowPosition.id}`,
      kind,
      roomId: input.roomId,
      position,
      parameters: {
        width: windowPosition.width,
        height: windowPosition.height,
        depth: 0.1,
        thickness: 0.1,
        material: "tempered-glass",
        rotation: windowPosition.wall === "east" || windowPosition.wall === "west" ? [0, Math.PI / 2, 0] : [0, 0, 0],
      },
    });
  });
}

function createCeilingComponents(input: ConstructionRoomBuilderInput): readonly ConstructionComponentNode[] {
  const { roomId, width, length, height, position, ceilingType } = input;
  const [x, y, z] = position;
  const ceiling = createConstructionComponent({
    id: `${roomId}-ceiling-${ceilingType}`,
    kind: "ceiling",
    roomId,
    position: [x, y + height, z],
    parameters: {
      width,
      height: 0.08,
      depth: length,
      thickness: 0.08,
      material: ceilingType === "acoustic" ? "black-steel" : "marble",
      collision: { enabled: false, layer: "none" },
    },
  });

  if (ceilingType !== "recessed" && ceilingType !== "bulkhead" && ceilingType !== "acoustic") return [ceiling];

  return [
    ceiling,
    createConstructionComponent({
      id: `${roomId}-ceiling-recess`,
      kind: "ceiling-recess",
      roomId,
      position: [x, y + height - 0.16, z],
      parameters: { width: width * 0.82, height: 0.08, depth: length * 0.82, thickness: 0.08, material: "marble" },
    }),
  ];
}

function createSkirtingComponents(input: ConstructionRoomBuilderInput): readonly ConstructionComponentNode[] {
  const { roomId, width, length, position } = input;
  const [x, y, z] = position;

  return [
    createConstructionComponent({
      id: `${roomId}-skirting-north`,
      kind: "skirting",
      roomId,
      position: [x, y + SKIRTING_HEIGHT / 2, z - length / 2 + SKIRTING_DEPTH],
      parameters: { width, height: SKIRTING_HEIGHT, depth: SKIRTING_DEPTH, thickness: SKIRTING_DEPTH, material: "black-steel" },
    }),
    createConstructionComponent({
      id: `${roomId}-skirting-south`,
      kind: "skirting",
      roomId,
      position: [x, y + SKIRTING_HEIGHT / 2, z + length / 2 - SKIRTING_DEPTH],
      parameters: { width, height: SKIRTING_HEIGHT, depth: SKIRTING_DEPTH, thickness: SKIRTING_DEPTH, material: "black-steel" },
    }),
    createConstructionComponent({
      id: `${roomId}-skirting-east`,
      kind: "skirting",
      roomId,
      position: [x + width / 2 - SKIRTING_DEPTH, y + SKIRTING_HEIGHT / 2, z],
      parameters: { width: SKIRTING_DEPTH, height: SKIRTING_HEIGHT, depth: length, thickness: SKIRTING_DEPTH, material: "black-steel" },
    }),
    createConstructionComponent({
      id: `${roomId}-skirting-west`,
      kind: "skirting",
      roomId,
      position: [x - width / 2 + SKIRTING_DEPTH, y + SKIRTING_HEIGHT / 2, z],
      parameters: { width: SKIRTING_DEPTH, height: SKIRTING_HEIGHT, depth: length, thickness: SKIRTING_DEPTH, material: "black-steel" },
    }),
  ];
}

export function buildRoom(input: ConstructionRoomBuilderInput): ConstructionRoomOutput {
  const { roomId, roomName, length, width, height, position } = input;
  const [x, y, z] = position;
  const floor = createConstructionComponent({
    id: `${roomId}-floor`,
    kind: "floor",
    roomId,
    position: [x, y, z],
    parameters: { width, height: 0.08, depth: length, thickness: 0.08, material: input.floorMaterial },
  });
  const components = [
    floor,
    ...createWallComponents(input),
    ...createDoorComponents(input),
    ...createWindowComponents(input),
    ...createCeilingComponents(input),
    ...createSkirtingComponents(input),
  ];

  return {
    roomId,
    roomName,
    areaSqm: Number((length * width).toFixed(1)),
    volumeCbm: Number((length * width * height).toFixed(1)),
    components,
    bounds: {
      min: [x - width / 2, y, z - length / 2],
      max: [x + width / 2, y + height, z + length / 2],
    },
  };
}
