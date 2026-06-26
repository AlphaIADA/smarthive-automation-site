import type { ConstructionBuildingOutput, ConstructionComponentNode, ConstructionVillaBuilderInput } from "@/types/experience";
import { createConstructionComponent, flattenConstructionComponents } from "./component-registry";
import { buildFloor } from "./floor-builder";

function countOcclusionGroups(components: readonly ConstructionComponentNode[]): number {
  return new Set(components.map((component) => component.metadata.floorId ?? component.metadata.roomId ?? component.metadata.system)).size;
}

export function buildVilla(input: ConstructionVillaBuilderInput): ConstructionBuildingOutput {
  const floors = input.floors.map(buildFloor);
  const foundation = createConstructionComponent({
    id: `${input.buildingId}-foundation`,
    kind: "foundation",
    position: [0, -0.24, 0],
    parameters: {
      width: 24,
      height: 0.48,
      depth: 18,
      thickness: 0.48,
      material: "concrete",
    },
  });
  const verticalSystems = [
    createConstructionComponent({
      id: `${input.buildingId}-construction-staircase`,
      kind: "staircase",
      position: [-2.2, 1.8, -0.2],
      parameters: { width: 2.8, height: 4.2, depth: 4.2, thickness: 0.16, material: "marble" },
    }),
    createConstructionComponent({
      id: `${input.buildingId}-construction-elevator`,
      kind: "elevator",
      position: [0, 3.4, -0.85],
      parameters: { width: 1.7, height: 7.2, depth: 1.9, thickness: 0.18, material: "tempered-glass" },
    }),
  ];
  const components = [
    foundation,
    ...floors.flatMap((floor) => floor.components),
    ...verticalSystems,
    ...input.siteComponents,
  ];
  const flattened = flattenConstructionComponents(components);
  const totalAreaSqm = Number(floors.reduce((sum, floor) => sum + floor.rooms.reduce((floorSum, room) => floorSum + room.areaSqm, 0), 0).toFixed(1));
  const totalVolumeCbm = Number(floors.reduce((sum, floor) => sum + floor.rooms.reduce((floorSum, room) => floorSum + room.volumeCbm, 0), 0).toFixed(1));

  return {
    buildingId: input.buildingId,
    program: input.program,
    floors,
    components,
    metrics: {
      componentCount: flattened.length,
      roomCount: floors.reduce((sum, floor) => sum + floor.rooms.length, 0),
      totalAreaSqm,
      totalVolumeCbm,
      instancingCandidates: flattened.filter((component) => component.parameters.lod.instanceEligible).length,
      mergeCandidates: flattened.filter((component) => component.parameters.lod.mergeEligible).length,
      occlusionGroups: countOcclusionGroups(flattened),
    },
  };
}
