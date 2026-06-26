import type { ConstructionComponentNode, ConstructionFloorBuilderInput, ConstructionFloorOutput } from "@/types/experience";
import { createConstructionComponent } from "./component-registry";
import { buildRoom } from "./room-builder";

function floorBounds(rooms: ConstructionFloorOutput["rooms"]) {
  const minX = Math.min(...rooms.map((room) => room.bounds.min[0]));
  const minZ = Math.min(...rooms.map((room) => room.bounds.min[2]));
  const maxX = Math.max(...rooms.map((room) => room.bounds.max[0]));
  const maxZ = Math.max(...rooms.map((room) => room.bounds.max[2]));

  return {
    width: Number((maxX - minX).toFixed(2)),
    depth: Number((maxZ - minZ).toFixed(2)),
    centerX: Number(((minX + maxX) / 2).toFixed(2)),
    centerZ: Number(((minZ + maxZ) / 2).toFixed(2)),
  };
}

export function buildFloor(input: ConstructionFloorBuilderInput): ConstructionFloorOutput {
  const rooms = input.rooms.map(buildRoom);
  const bounds = floorBounds(rooms);
  const structuralComponents: readonly ConstructionComponentNode[] = [
    createConstructionComponent({
      id: `${input.floorId}-concrete-slab`,
      kind: "concrete-slab",
      floorId: input.floorId,
      position: [bounds.centerX, input.elevation, bounds.centerZ],
      parameters: {
        width: bounds.width + 0.5,
        height: input.slabThickness,
        depth: bounds.depth + 0.5,
        thickness: input.slabThickness,
        material: "concrete",
      },
    }),
    createConstructionComponent({
      id: `${input.floorId}-flat-roof-panel`,
      kind: input.level === 0 ? "roof-panel" : "flat-roof",
      floorId: input.floorId,
      position: [bounds.centerX, input.elevation + 3.42, bounds.centerZ],
      parameters: {
        width: bounds.width + 0.72,
        height: 0.18,
        depth: bounds.depth + 0.72,
        thickness: 0.18,
        material: "black-steel",
      },
    }),
  ];

  return {
    floorId: input.floorId,
    level: input.level,
    elevation: input.elevation,
    rooms,
    components: [...structuralComponents, ...rooms.flatMap((room) => room.components)],
  };
}
