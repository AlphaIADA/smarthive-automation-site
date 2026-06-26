export type LuxuryInteriorMaterialName =
  | "italian-marble"
  | "travertine"
  | "granite"
  | "oak"
  | "walnut"
  | "teak"
  | "concrete"
  | "glass"
  | "brass"
  | "bronze"
  | "leather"
  | "fabric"
  | "microcement"
  | "natural-stone"
  | "premium-paint"
  | "quartz"
  | "rubber";

export type LuxuryInteriorMaterialCategory =
  | "stone"
  | "wood"
  | "mineral"
  | "glass"
  | "metal"
  | "soft-finish"
  | "paint"
  | "resilient";

export type LuxuryInteriorTexturePattern = "marble-vein" | "stone-grain" | "wood-grain" | "brushed-metal" | "woven" | "smooth" | "rubber";

export interface LuxuryInteriorPbrMaterial {
  readonly id: LuxuryInteriorMaterialName;
  readonly label: string;
  readonly category: LuxuryInteriorMaterialCategory;
  readonly color: string;
  readonly roughness: number;
  readonly metalness: number;
  readonly normalStrength: number;
  readonly aoIntensity: number;
  readonly reflectionIntensity: number;
  readonly texturePattern: LuxuryInteriorTexturePattern;
  readonly clearcoat?: number;
  readonly clearcoatRoughness?: number;
  readonly transparent?: boolean;
  readonly opacity?: number;
  readonly transmission?: number;
  readonly thickness?: number;
  readonly emissive?: string;
  readonly emissiveIntensity?: number;
}

export type LuxuryInteriorFinishKind =
  | "luxury-ceiling"
  | "led-ceiling-profile"
  | "wall-panel"
  | "feature-wall"
  | "tv-wall"
  | "floating-shelf"
  | "built-in-niche"
  | "glass-railing"
  | "hidden-lighting"
  | "fireplace-wall"
  | "kitchen-island"
  | "quartz-countertop"
  | "hidden-storage"
  | "pantry-finish"
  | "headboard-wall"
  | "wardrobe"
  | "closet-finish"
  | "bathroom-tile"
  | "floating-vanity"
  | "glass-shower"
  | "mirror-lighting"
  | "bookshelf-wall"
  | "acoustic-panel"
  | "cinema-acoustic-wall"
  | "floating-ceiling"
  | "rubber-floor"
  | "mirror-wall";

export interface LuxuryInteriorLightingReadiness {
  readonly naturalDaylight: boolean;
  readonly artificialLightingReady: boolean;
  readonly hiddenLight: boolean;
  readonly globalIlluminationReady: boolean;
  readonly hdrReady: boolean;
  readonly reflectionReady: boolean;
}

export interface LuxuryInteriorFinishSpec {
  readonly id: string;
  readonly roomId: string;
  readonly roomName: string;
  readonly kind: LuxuryInteriorFinishKind;
  readonly label: string;
  readonly material: LuxuryInteriorMaterialName;
  readonly position: [number, number, number];
  readonly size: [number, number, number];
  readonly rotation?: [number, number, number];
  readonly castShadow: boolean;
  readonly receiveShadow: boolean;
  readonly lod: "hero" | "standard" | "background";
  readonly pbr: {
    readonly normalMap: boolean;
    readonly roughnessMap: boolean;
    readonly aoMap: boolean;
    readonly reflection: boolean;
  };
  readonly lighting: LuxuryInteriorLightingReadiness;
}

export interface LuxuryInteriorDesignReport {
  readonly finishCount: number;
  readonly materialCount: number;
  readonly coveredRooms: readonly string[];
  readonly designLanguage: readonly string[];
  readonly constraints: {
    readonly furniture: "excluded";
    readonly smartDevices: "excluded";
    readonly automation: "excluded";
  };
  readonly pbrPipeline: {
    readonly proceduralNormalMaps: boolean;
    readonly proceduralRoughnessMaps: boolean;
    readonly proceduralAoMaps: boolean;
    readonly reflectionReadyMaterials: boolean;
  };
}
