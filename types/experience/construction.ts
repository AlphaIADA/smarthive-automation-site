export type ConstructionVector3 = readonly [number, number, number];

export type ConstructionMaterial =
  | "concrete"
  | "travertine"
  | "marble"
  | "wood"
  | "tempered-glass"
  | "brushed-aluminium"
  | "black-steel"
  | "natural-stone"
  | "water"
  | "landscape";

export type ConstructionComponentKind =
  | "foundation"
  | "concrete-slab"
  | "wall"
  | "internal-wall"
  | "external-wall"
  | "glass-wall"
  | "column"
  | "beam"
  | "roof-panel"
  | "flat-roof"
  | "floating-roof"
  | "ceiling"
  | "ceiling-recess"
  | "floor"
  | "skirting"
  | "door"
  | "sliding-door"
  | "pivot-door"
  | "garage-door"
  | "window"
  | "curtain-wall"
  | "balustrade"
  | "balcony"
  | "terrace"
  | "swimming-pool"
  | "water-feature"
  | "staircase"
  | "elevator"
  | "garden"
  | "fence"
  | "gate"
  | "driveway"
  | "landscape";

export interface ConstructionLodPolicy {
  readonly enabled: boolean;
  readonly level: 0 | 1 | 2 | 3;
  readonly distances: readonly [number, number, number];
  readonly mergeEligible: boolean;
  readonly instanceEligible: boolean;
}

export interface ConstructionCollisionPolicy {
  readonly enabled: boolean;
  readonly layer: "structure" | "opening" | "room" | "terrain" | "water" | "none";
}

export interface ConstructionShadowPolicy {
  readonly cast: boolean;
  readonly receive: boolean;
}

export interface ConstructionReflectionPolicy {
  readonly enabled: boolean;
  readonly intensity: number;
}

export interface ConstructionComponentParameters {
  readonly width: number;
  readonly height: number;
  readonly depth: number;
  readonly thickness: number;
  readonly material: ConstructionMaterial;
  readonly rotation: ConstructionVector3;
  readonly elevation: number;
  readonly visible: boolean;
  readonly lod: ConstructionLodPolicy;
  readonly collision: ConstructionCollisionPolicy;
  readonly shadow: ConstructionShadowPolicy;
  readonly reflection: ConstructionReflectionPolicy;
}

export interface ConstructionOpening {
  readonly id: string;
  readonly kind: "door" | "window" | "skylight";
  readonly position: ConstructionVector3;
  readonly width: number;
  readonly height: number;
  readonly sillHeight?: number;
}

export interface ConstructionComponentNode {
  readonly id: string;
  readonly kind: ConstructionComponentKind;
  readonly label: string;
  readonly position: ConstructionVector3;
  readonly parameters: ConstructionComponentParameters;
  readonly openings: readonly ConstructionOpening[];
  readonly children: readonly ConstructionComponentNode[];
  readonly metadata: {
    readonly roomId?: string;
    readonly floorId?: string;
    readonly system: "structure" | "enclosure" | "opening" | "finish" | "site" | "vertical-circulation" | "water";
    readonly occlusionReady: boolean;
  };
}

export type ConstructionCeilingType = "standard" | "double-height" | "recessed" | "acoustic" | "bulkhead";

export interface ConstructionDoorPosition {
  readonly id: string;
  readonly wall: "north" | "south" | "east" | "west";
  readonly offset: number;
  readonly width: number;
  readonly height: number;
  readonly kind: "door" | "sliding-door" | "pivot-door" | "garage-door";
}

export interface ConstructionWindowPosition {
  readonly id: string;
  readonly wall: "north" | "south" | "east" | "west" | "ceiling";
  readonly offset: number;
  readonly width: number;
  readonly height: number;
  readonly sillHeight: number;
  readonly kind: "window" | "curtain-wall";
}

export interface ConstructionRoomBuilderInput {
  readonly roomId: string;
  readonly roomName: string;
  readonly length: number;
  readonly width: number;
  readonly height: number;
  readonly position: ConstructionVector3;
  readonly doorPositions: readonly ConstructionDoorPosition[];
  readonly windowPositions: readonly ConstructionWindowPosition[];
  readonly ceilingType: ConstructionCeilingType;
  readonly floorMaterial: ConstructionMaterial;
  readonly wallMaterial?: ConstructionMaterial;
}

export interface ConstructionRoomOutput {
  readonly roomId: string;
  readonly roomName: string;
  readonly areaSqm: number;
  readonly volumeCbm: number;
  readonly components: readonly ConstructionComponentNode[];
  readonly bounds: {
    readonly min: ConstructionVector3;
    readonly max: ConstructionVector3;
  };
}

export interface ConstructionFloorBuilderInput {
  readonly floorId: string;
  readonly level: number;
  readonly elevation: number;
  readonly slabThickness: number;
  readonly rooms: readonly ConstructionRoomBuilderInput[];
}

export interface ConstructionFloorOutput {
  readonly floorId: string;
  readonly level: number;
  readonly elevation: number;
  readonly rooms: readonly ConstructionRoomOutput[];
  readonly components: readonly ConstructionComponentNode[];
}

export type ConstructionBuildingProgram =
  | "2-bedroom"
  | "3-bedroom"
  | "4-bedroom"
  | "5-bedroom"
  | "duplex"
  | "bungalow"
  | "penthouse"
  | "office"
  | "mall"
  | "hospital";

export interface ConstructionVillaBuilderInput {
  readonly buildingId: string;
  readonly program: ConstructionBuildingProgram;
  readonly floors: readonly ConstructionFloorBuilderInput[];
  readonly siteComponents: readonly ConstructionComponentNode[];
}

export interface ConstructionBuildingOutput {
  readonly buildingId: string;
  readonly program: ConstructionBuildingProgram;
  readonly floors: readonly ConstructionFloorOutput[];
  readonly components: readonly ConstructionComponentNode[];
  readonly metrics: {
    readonly componentCount: number;
    readonly roomCount: number;
    readonly totalAreaSqm: number;
    readonly totalVolumeCbm: number;
    readonly instancingCandidates: number;
    readonly mergeCandidates: number;
    readonly occlusionGroups: number;
  };
}
