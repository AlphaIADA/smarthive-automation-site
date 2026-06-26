export type Vector3Tuple = [number, number, number];

export const VILLA_MATERIALS = {
  architecturalConcrete: {
    color: "#d8d5cc",
    roughness: 0.78,
    metalness: 0.02,
  },
  travertine: {
    color: "#c9b896",
    roughness: 0.64,
    metalness: 0.01,
  },
  marble: {
    color: "#f1efe7",
    roughness: 0.32,
    metalness: 0.02,
  },
  warmWood: {
    color: "#8b5d36",
    roughness: 0.48,
    metalness: 0.02,
  },
  temperedGlass: {
    color: "#bde9ff",
    roughness: 0.035,
    metalness: 0,
    transparent: true,
    opacity: 0.54,
    transmission: 0.38,
    thickness: 0.18,
    ior: 1.45,
    envMapIntensity: 1.75,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
  },
  brushedAluminium: {
    color: "#bfc6c9",
    roughness: 0.28,
    metalness: 0.72,
  },
  blackSteel: {
    color: "#111820",
    roughness: 0.34,
    metalness: 0.62,
  },
  naturalStone: {
    color: "#6f756c",
    roughness: 0.82,
    metalness: 0.01,
  },
  charcoalStone: {
    color: "#303844",
    roughness: 0.72,
    metalness: 0.04,
  },
  gardenGreen: {
    color: "#31533c",
    roughness: 0.86,
    metalness: 0,
  },
  palmLeaf: {
    color: "#2d6b46",
    roughness: 0.78,
    metalness: 0,
  },
  water: {
    color: "#7ac8df",
    roughness: 0.08,
    metalness: 0,
    transparent: true,
    opacity: 0.68,
    transmission: 0.18,
    thickness: 0.28,
    envMapIntensity: 1.4,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
  },
  warmLight: {
    color: "#ffdca8",
    roughness: 0.2,
    metalness: 0.1,
    emissive: "#ffb45f",
    emissiveIntensity: 1.8,
  },
} as const;

export type VillaMaterialName = keyof typeof VILLA_MATERIALS;
