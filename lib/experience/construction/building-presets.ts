import type { ConstructionBuildingProgram } from "@/types/experience";

export interface ConstructionBuildingPreset {
  readonly program: ConstructionBuildingProgram;
  readonly label: string;
  readonly typicalLevels: number;
  readonly targetAreaRangeSqm: readonly [number, number];
  readonly supportedByBuilder: boolean;
}

export const CONSTRUCTION_BUILDING_PRESETS: readonly ConstructionBuildingPreset[] = [
  { program: "2-bedroom", label: "2 Bedroom", typicalLevels: 1, targetAreaRangeSqm: [110, 180], supportedByBuilder: true },
  { program: "3-bedroom", label: "3 Bedroom", typicalLevels: 1, targetAreaRangeSqm: [170, 260], supportedByBuilder: true },
  { program: "4-bedroom", label: "4 Bedroom", typicalLevels: 2, targetAreaRangeSqm: [260, 420], supportedByBuilder: true },
  { program: "5-bedroom", label: "5 Bedroom", typicalLevels: 2, targetAreaRangeSqm: [420, 700], supportedByBuilder: true },
  { program: "duplex", label: "Duplex", typicalLevels: 2, targetAreaRangeSqm: [220, 650], supportedByBuilder: true },
  { program: "bungalow", label: "Bungalow", typicalLevels: 1, targetAreaRangeSqm: [140, 360], supportedByBuilder: true },
  { program: "penthouse", label: "Penthouse", typicalLevels: 1, targetAreaRangeSqm: [180, 520], supportedByBuilder: true },
  { program: "office", label: "Office", typicalLevels: 3, targetAreaRangeSqm: [600, 5000], supportedByBuilder: true },
  { program: "mall", label: "Mall", typicalLevels: 3, targetAreaRangeSqm: [5000, 80000], supportedByBuilder: true },
  { program: "hospital", label: "Hospital", typicalLevels: 5, targetAreaRangeSqm: [8000, 120000], supportedByBuilder: true },
] as const;

export function getConstructionBuildingPreset(program: ConstructionBuildingProgram): ConstructionBuildingPreset {
  return CONSTRUCTION_BUILDING_PRESETS.find((preset) => preset.program === program) ?? CONSTRUCTION_BUILDING_PRESETS[0];
}
