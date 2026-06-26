export type FurnitureMaterialName =
  | "premium-leather"
  | "boucle-fabric"
  | "walnut"
  | "oak"
  | "teak"
  | "travertine"
  | "italian-marble"
  | "quartz"
  | "bronze"
  | "brushed-aluminium"
  | "black-steel"
  | "tempered-glass"
  | "screen-glass"
  | "acoustic-fabric"
  | "rubber"
  | "ceramic"
  | "premium-paint"
  | "plant-green"
  | "warm-shade";

export type FurnitureMaterialCategory = "soft" | "wood" | "stone" | "metal" | "glass" | "display" | "rubber" | "ceramic" | "paint" | "organic" | "emissive";

export interface FurniturePbrMaterial {
  readonly id: FurnitureMaterialName;
  readonly label: string;
  readonly category: FurnitureMaterialCategory;
  readonly color: string;
  readonly roughness: number;
  readonly metalness: number;
  readonly normalStrength: number;
  readonly aoIntensity: number;
  readonly reflectionIntensity: number;
  readonly clearcoat?: number;
  readonly clearcoatRoughness?: number;
  readonly transparent?: boolean;
  readonly opacity?: number;
  readonly transmission?: number;
  readonly thickness?: number;
  readonly emissive?: string;
  readonly emissiveIntensity?: number;
}

export type FurnitureCategory =
  | "seating"
  | "table"
  | "storage"
  | "bed"
  | "media"
  | "audio"
  | "rug"
  | "lighting-object"
  | "decor"
  | "plant"
  | "appliance"
  | "kitchen"
  | "office"
  | "cinema"
  | "fitness"
  | "outdoor"
  | "bathroom"
  | "utility"
  | "spiritual"
  | "circulation";

export type FurniturePartShape = "box" | "cylinder" | "sphere";

export interface FurniturePartSpec {
  readonly id: string;
  readonly shape: FurniturePartShape;
  readonly material: FurnitureMaterialName;
  readonly position: [number, number, number];
  readonly size: [number, number, number];
  readonly rotation?: [number, number, number];
  readonly castShadow?: boolean;
  readonly receiveShadow?: boolean;
}

export interface FurnitureAssetTemplate {
  readonly id: string;
  readonly label: string;
  readonly category: FurnitureCategory;
  readonly reusable: true;
  readonly pbr: true;
  readonly shadowEnabled: true;
  readonly futureInteractionReady: true;
  readonly smartDevice: false;
  readonly automation: false;
  readonly ai: false;
  readonly cctv: false;
  readonly lightingLogic: false;
  readonly lod: "hero" | "standard" | "background";
  readonly parts: readonly FurniturePartSpec[];
  readonly approximateTriangleCount: number;
}

export interface FurniturePlacementSpec {
  readonly id: string;
  readonly assetId: string;
  readonly roomId: string;
  readonly roomName: string;
  readonly label: string;
  readonly category: FurnitureCategory;
  readonly position: [number, number, number];
  readonly rotation?: [number, number, number];
  readonly scale?: [number, number, number];
  readonly interaction: {
    readonly selectable: true;
    readonly futureDragReady: boolean;
    readonly futureConfigureReady: boolean;
    readonly futureQuoteReady: boolean;
  };
  readonly constraints: {
    readonly smartDevice: false;
    readonly automation: false;
    readonly ai: false;
    readonly cctv: false;
    readonly lightingLogic: false;
  };
}

export interface FurnitureAssetStatistics {
  readonly materialCount: number;
  readonly assetTemplateCount: number;
  readonly placementCount: number;
  readonly populatedRoomCount: number;
  readonly reusableAssetCount: number;
  readonly totalApproximateTriangles: number;
  readonly categories: readonly FurnitureCategory[];
}

export interface LuxuryFurnitureReport {
  readonly library: FurnitureAssetStatistics;
  readonly populatedRooms: readonly string[];
  readonly deliverables: readonly string[];
  readonly constraints: {
    readonly smartDevices: "excluded";
    readonly ai: "excluded";
    readonly automation: "excluded";
    readonly cctv: "excluded";
    readonly lightingLogic: "excluded";
  };
  readonly performance: {
    readonly reusableAssets: boolean;
    readonly sharedMaterials: boolean;
    readonly shadowEnabled: boolean;
    readonly lodReady: boolean;
    readonly futureInteractionReady: boolean;
    readonly externalAssets: "none";
  };
}
