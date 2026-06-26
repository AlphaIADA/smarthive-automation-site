import type {
  ConstructionCollisionPolicy,
  ConstructionComponentKind,
  ConstructionComponentNode,
  ConstructionComponentParameters,
  ConstructionLodPolicy,
  ConstructionMaterial,
  ConstructionOpening,
  ConstructionReflectionPolicy,
  ConstructionShadowPolicy,
  ConstructionVector3,
} from "@/types/experience";

const DEFAULT_LOD: ConstructionLodPolicy = {
  enabled: true,
  level: 0,
  distances: [18, 42, 78],
  mergeEligible: true,
  instanceEligible: false,
};

const DEFAULT_COLLISION: ConstructionCollisionPolicy = {
  enabled: true,
  layer: "structure",
};

const DEFAULT_SHADOW: ConstructionShadowPolicy = {
  cast: true,
  receive: true,
};

const DEFAULT_REFLECTION: ConstructionReflectionPolicy = {
  enabled: false,
  intensity: 0,
};

export const CONSTRUCTION_MATERIAL_LIBRARY: Record<ConstructionMaterial, { readonly label: string; readonly pbrReady: boolean }> = {
  concrete: { label: "Concrete", pbrReady: true },
  travertine: { label: "Travertine", pbrReady: true },
  marble: { label: "Marble", pbrReady: true },
  wood: { label: "Engineered Wood", pbrReady: true },
  "tempered-glass": { label: "Tempered Glass", pbrReady: true },
  "brushed-aluminium": { label: "Brushed Aluminium", pbrReady: true },
  "black-steel": { label: "Black Steel", pbrReady: true },
  "natural-stone": { label: "Natural Stone", pbrReady: true },
  water: { label: "Water", pbrReady: true },
  landscape: { label: "Landscape", pbrReady: true },
};

const componentDefaults: Record<
  ConstructionComponentKind,
  {
    readonly label: string;
    readonly material: ConstructionMaterial;
    readonly thickness: number;
    readonly collision: ConstructionCollisionPolicy["layer"];
    readonly reflection?: number;
    readonly system: ConstructionComponentNode["metadata"]["system"];
    readonly instanceEligible?: boolean;
  }
> = {
  foundation: { label: "Foundation", material: "concrete", thickness: 0.45, collision: "structure", system: "structure", instanceEligible: false },
  "concrete-slab": { label: "Concrete Slab", material: "concrete", thickness: 0.22, collision: "structure", system: "structure" },
  wall: { label: "Wall", material: "concrete", thickness: 0.18, collision: "structure", system: "enclosure" },
  "internal-wall": { label: "Internal Wall", material: "concrete", thickness: 0.14, collision: "structure", system: "enclosure" },
  "external-wall": { label: "External Wall", material: "travertine", thickness: 0.28, collision: "structure", system: "enclosure" },
  "glass-wall": { label: "Glass Wall", material: "tempered-glass", thickness: 0.12, collision: "structure", reflection: 1.3, system: "enclosure" },
  column: { label: "Column", material: "black-steel", thickness: 0.24, collision: "structure", system: "structure", instanceEligible: true },
  beam: { label: "Beam", material: "concrete", thickness: 0.26, collision: "structure", system: "structure", instanceEligible: true },
  "roof-panel": { label: "Roof Panel", material: "black-steel", thickness: 0.18, collision: "structure", system: "structure" },
  "flat-roof": { label: "Flat Roof", material: "black-steel", thickness: 0.28, collision: "structure", system: "structure" },
  "floating-roof": { label: "Floating Roof", material: "black-steel", thickness: 0.2, collision: "structure", system: "structure" },
  ceiling: { label: "Ceiling", material: "marble", thickness: 0.08, collision: "none", system: "finish" },
  "ceiling-recess": { label: "Ceiling Recess", material: "marble", thickness: 0.08, collision: "none", system: "finish", instanceEligible: true },
  floor: { label: "Floor", material: "marble", thickness: 0.08, collision: "structure", system: "finish" },
  skirting: { label: "Skirting", material: "black-steel", thickness: 0.04, collision: "none", system: "finish", instanceEligible: true },
  door: { label: "Door", material: "wood", thickness: 0.08, collision: "opening", system: "opening" },
  "sliding-door": { label: "Sliding Door", material: "tempered-glass", thickness: 0.08, collision: "opening", reflection: 1.1, system: "opening" },
  "pivot-door": { label: "Pivot Door", material: "wood", thickness: 0.12, collision: "opening", system: "opening" },
  "garage-door": { label: "Garage Door", material: "brushed-aluminium", thickness: 0.12, collision: "opening", system: "opening" },
  window: { label: "Window", material: "tempered-glass", thickness: 0.08, collision: "opening", reflection: 1.2, system: "opening" },
  "curtain-wall": { label: "Curtain Wall", material: "tempered-glass", thickness: 0.12, collision: "opening", reflection: 1.4, system: "opening" },
  balustrade: { label: "Balustrade", material: "tempered-glass", thickness: 0.08, collision: "structure", reflection: 0.8, system: "enclosure", instanceEligible: true },
  balcony: { label: "Balcony", material: "travertine", thickness: 0.18, collision: "structure", system: "structure" },
  terrace: { label: "Terrace", material: "travertine", thickness: 0.12, collision: "structure", system: "structure" },
  "swimming-pool": { label: "Swimming Pool", material: "water", thickness: 0.42, collision: "water", reflection: 1.2, system: "water" },
  "water-feature": { label: "Water Feature", material: "water", thickness: 0.16, collision: "water", reflection: 1, system: "water" },
  staircase: { label: "Staircase", material: "marble", thickness: 0.14, collision: "structure", system: "vertical-circulation", instanceEligible: true },
  elevator: { label: "Elevator", material: "tempered-glass", thickness: 0.18, collision: "structure", reflection: 0.9, system: "vertical-circulation" },
  garden: { label: "Garden", material: "landscape", thickness: 0.08, collision: "terrain", system: "site" },
  fence: { label: "Fence", material: "black-steel", thickness: 0.12, collision: "structure", system: "site", instanceEligible: true },
  gate: { label: "Gate", material: "black-steel", thickness: 0.16, collision: "structure", system: "site" },
  driveway: { label: "Driveway", material: "concrete", thickness: 0.12, collision: "terrain", system: "site" },
  landscape: { label: "Landscape", material: "landscape", thickness: 0.08, collision: "terrain", system: "site" },
};

export const CONSTRUCTION_COMPONENT_KINDS = Object.keys(componentDefaults) as readonly ConstructionComponentKind[];

export function createConstructionParameters(
  kind: ConstructionComponentKind,
  overrides: Partial<ConstructionComponentParameters> = {},
): ConstructionComponentParameters {
  const defaults = componentDefaults[kind];
  const reflectionIntensity = defaults.reflection ?? 0;
  const lod = overrides.lod ?? {
    ...DEFAULT_LOD,
    instanceEligible: defaults.instanceEligible ?? DEFAULT_LOD.instanceEligible,
  };

  return {
    width: overrides.width ?? 1,
    height: overrides.height ?? 1,
    depth: overrides.depth ?? 1,
    thickness: overrides.thickness ?? defaults.thickness,
    material: overrides.material ?? defaults.material,
    rotation: overrides.rotation ?? [0, 0, 0],
    elevation: overrides.elevation ?? 0,
    visible: overrides.visible ?? true,
    lod,
    collision: overrides.collision ?? {
      ...DEFAULT_COLLISION,
      layer: defaults.collision,
    },
    shadow: overrides.shadow ?? DEFAULT_SHADOW,
    reflection: overrides.reflection ?? {
      ...DEFAULT_REFLECTION,
      enabled: reflectionIntensity > 0,
      intensity: reflectionIntensity,
    },
  };
}

export function createConstructionComponent({
  id,
  kind,
  position = [0, 0, 0],
  parameters,
  openings = [],
  children = [],
  label,
  roomId,
  floorId,
}: {
  readonly id: string;
  readonly kind: ConstructionComponentKind;
  readonly position?: ConstructionVector3;
  readonly parameters?: Partial<ConstructionComponentParameters>;
  readonly openings?: readonly ConstructionOpening[];
  readonly children?: readonly ConstructionComponentNode[];
  readonly label?: string;
  readonly roomId?: string;
  readonly floorId?: string;
}): ConstructionComponentNode {
  const defaults = componentDefaults[kind];

  return {
    id,
    kind,
    label: label ?? defaults.label,
    position,
    parameters: createConstructionParameters(kind, parameters),
    openings,
    children,
    metadata: {
      roomId,
      floorId,
      system: defaults.system,
      occlusionReady: true,
    },
  };
}

export function flattenConstructionComponents(nodes: readonly ConstructionComponentNode[]): readonly ConstructionComponentNode[] {
  return nodes.flatMap((node) => [node, ...flattenConstructionComponents(node.children)]);
}

export function getConstructionComponentDefaults(kind: ConstructionComponentKind) {
  return componentDefaults[kind];
}
