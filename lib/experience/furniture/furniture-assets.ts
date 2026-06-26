import type { FurnitureAssetTemplate, FurnitureCategory, FurnitureMaterialName, FurniturePartSpec } from "@/types/experience";

function box(id: string, material: FurnitureMaterialName, position: [number, number, number], size: [number, number, number], rotation?: [number, number, number]): FurniturePartSpec {
  return { id, shape: "box", material, position, size, rotation, castShadow: true, receiveShadow: true };
}

function cylinder(id: string, material: FurnitureMaterialName, position: [number, number, number], size: [number, number, number], rotation?: [number, number, number]): FurniturePartSpec {
  return { id, shape: "cylinder", material, position, size, rotation, castShadow: true, receiveShadow: true };
}

function sphere(id: string, material: FurnitureMaterialName, position: [number, number, number], size: [number, number, number]): FurniturePartSpec {
  return { id, shape: "sphere", material, position, size, castShadow: true, receiveShadow: true };
}

function asset(
  id: string,
  label: string,
  category: FurnitureCategory,
  parts: readonly FurniturePartSpec[],
  lod: FurnitureAssetTemplate["lod"] = "standard",
): FurnitureAssetTemplate {
  return {
    id,
    label,
    category,
    reusable: true,
    pbr: true,
    shadowEnabled: true,
    futureInteractionReady: true,
    smartDevice: false,
    automation: false,
    ai: false,
    cctv: false,
    lightingLogic: false,
    lod,
    parts,
    approximateTriangleCount: parts.reduce((total, part) => total + (part.shape === "box" ? 12 : part.shape === "cylinder" ? 64 : 96), 0),
  };
}

export const FURNITURE_ASSETS: readonly FurnitureAssetTemplate[] = [
  asset("luxury-sofa", "Luxury modular sofa", "seating", [
    box("base", "premium-leather", [0, 0.32, 0], [2.35, 0.36, 0.92]),
    box("back", "premium-leather", [0, 0.72, -0.42], [2.42, 0.72, 0.16]),
    box("left-arm", "premium-leather", [-1.22, 0.58, 0], [0.18, 0.56, 0.94]),
    box("right-arm", "premium-leather", [1.22, 0.58, 0], [0.18, 0.56, 0.94]),
    box("seat-cushion", "boucle-fabric", [0, 0.55, 0.12], [2.12, 0.14, 0.72]),
  ], "hero"),
  asset("accent-chair", "Designer accent chair", "seating", [
    box("seat", "boucle-fabric", [0, 0.42, 0], [0.72, 0.18, 0.68]),
    box("back", "boucle-fabric", [0, 0.84, -0.28], [0.78, 0.68, 0.12]),
    cylinder("leg-a", "black-steel", [-0.26, 0.19, -0.22], [0.035, 0.38, 0.035]),
    cylinder("leg-b", "black-steel", [0.26, 0.19, -0.22], [0.035, 0.38, 0.035]),
    cylinder("leg-c", "black-steel", [-0.26, 0.19, 0.22], [0.035, 0.38, 0.035]),
    cylinder("leg-d", "black-steel", [0.26, 0.19, 0.22], [0.035, 0.38, 0.035]),
  ]),
  asset("coffee-table", "Travertine coffee table", "table", [
    box("top", "travertine", [0, 0.42, 0], [1.28, 0.13, 0.78]),
    box("base", "bronze", [0, 0.2, 0], [0.72, 0.34, 0.38]),
  ], "hero"),
  asset("side-table", "Bronze side table", "table", [
    cylinder("top", "bronze", [0, 0.52, 0], [0.34, 0.08, 0.34]),
    cylinder("stem", "black-steel", [0, 0.28, 0], [0.055, 0.44, 0.055]),
    cylinder("base", "travertine", [0, 0.06, 0], [0.28, 0.08, 0.28]),
  ]),
  asset("tv-console", "Walnut media console", "storage", [
    box("case", "walnut", [0, 0.38, 0], [1.88, 0.38, 0.34]),
    box("shadow-gap", "black-steel", [0, 0.58, 0.18], [1.72, 0.035, 0.04]),
    box("feet", "black-steel", [0, 0.14, 0], [1.68, 0.08, 0.18]),
  ]),
  asset("tv-85", "85-inch passive display panel", "media", [
    box("screen", "screen-glass", [0, 0.95, 0], [1.88, 1.06, 0.045]),
    box("frame", "black-steel", [0, 0.95, -0.035], [2.0, 1.18, 0.05]),
    box("stand", "black-steel", [0, 0.29, 0.02], [0.62, 0.08, 0.16]),
  ], "hero"),
  asset("soundbar", "Passive sound system soundbar", "audio", [
    box("bar", "black-steel", [0, 0.18, 0], [1.32, 0.12, 0.12]),
    box("mesh", "acoustic-fabric", [0, 0.19, 0.065], [1.2, 0.07, 0.025]),
  ]),
  asset("speaker-tower", "Passive surround speaker tower", "audio", [
    box("cabinet", "black-steel", [0, 0.54, 0], [0.22, 1.0, 0.24]),
    cylinder("driver-high", "acoustic-fabric", [0, 0.78, 0.13], [0.06, 0.03, 0.06], [Math.PI / 2, 0, 0]),
    cylinder("driver-low", "acoustic-fabric", [0, 0.44, 0.13], [0.08, 0.03, 0.08], [Math.PI / 2, 0, 0]),
  ]),
  asset("area-rug", "Large designer area rug", "rug", [
    box("rug", "boucle-fabric", [0, 0.035, 0], [2.5, 0.035, 1.65]),
  ]),
  asset("designer-floor-lamp", "Passive designer floor lamp", "lighting-object", [
    cylinder("base", "bronze", [0, 0.05, 0], [0.22, 0.06, 0.22]),
    cylinder("stem", "bronze", [0, 0.78, 0], [0.026, 1.44, 0.026]),
    sphere("shade", "warm-shade", [0, 1.55, 0], [0.22, 0.22, 0.22]),
  ]),
  asset("plant-pot", "Architectural indoor plant", "plant", [
    cylinder("pot", "ceramic", [0, 0.18, 0], [0.2, 0.34, 0.2]),
    sphere("leaf-a", "plant-green", [-0.08, 0.55, 0], [0.2, 0.28, 0.14]),
    sphere("leaf-b", "plant-green", [0.11, 0.64, 0.04], [0.18, 0.26, 0.12]),
    sphere("leaf-c", "plant-green", [0.02, 0.75, -0.08], [0.16, 0.22, 0.12]),
  ]),
  asset("decor-vase", "Minimal decor vase", "decor", [
    cylinder("vase", "ceramic", [0, 0.22, 0], [0.12, 0.4, 0.12]),
    sphere("top", "ceramic", [0, 0.45, 0], [0.12, 0.08, 0.12]),
  ]),
  asset("dining-table", "Luxury eight-seat dining table", "table", [
    box("top", "italian-marble", [0, 0.78, 0], [2.6, 0.12, 1.08]),
    box("base-a", "bronze", [-0.62, 0.4, 0], [0.22, 0.7, 0.54]),
    box("base-b", "bronze", [0.62, 0.4, 0], [0.22, 0.7, 0.54]),
  ], "hero"),
  asset("dining-chair", "Luxury dining chair", "seating", [
    box("seat", "premium-leather", [0, 0.46, 0], [0.48, 0.12, 0.48]),
    box("back", "premium-leather", [0, 0.82, -0.2], [0.52, 0.56, 0.1]),
    cylinder("leg-a", "black-steel", [-0.18, 0.24, -0.16], [0.025, 0.42, 0.025]),
    cylinder("leg-b", "black-steel", [0.18, 0.24, -0.16], [0.025, 0.42, 0.025]),
    cylinder("leg-c", "black-steel", [-0.18, 0.24, 0.16], [0.025, 0.42, 0.025]),
    cylinder("leg-d", "black-steel", [0.18, 0.24, 0.16], [0.025, 0.42, 0.025]),
  ]),
  asset("pendant-light", "Passive pendant lighting object", "lighting-object", [
    cylinder("cord", "black-steel", [0, 1.18, 0], [0.012, 0.84, 0.012]),
    sphere("shade", "warm-shade", [0, 0.68, 0], [0.18, 0.14, 0.18]),
  ]),
  asset("buffet-console", "Luxury buffet console", "storage", [
    box("case", "walnut", [0, 0.48, 0], [1.75, 0.62, 0.38]),
    box("top", "travertine", [0, 0.82, 0], [1.82, 0.08, 0.42]),
    cylinder("pull-left", "bronze", [-0.45, 0.55, 0.22], [0.025, 0.16, 0.025], [Math.PI / 2, 0, 0]),
    cylinder("pull-right", "bronze", [0.45, 0.55, 0.22], [0.025, 0.16, 0.025], [Math.PI / 2, 0, 0]),
  ]),
  asset("bar-chair", "Kitchen bar chair", "seating", [
    cylinder("seat", "premium-leather", [0, 0.72, 0], [0.22, 0.1, 0.22]),
    cylinder("stem", "black-steel", [0, 0.38, 0], [0.03, 0.62, 0.03]),
    cylinder("base", "black-steel", [0, 0.08, 0], [0.22, 0.06, 0.22]),
  ]),
  asset("kitchen-cabinet", "Reusable premium kitchen cabinet", "kitchen", [
    box("case", "walnut", [0, 0.5, 0], [1.1, 0.85, 0.42]),
    box("counter", "quartz", [0, 0.96, 0], [1.16, 0.08, 0.48]),
  ]),
  asset("refrigerator", "Integrated refrigerator", "appliance", [
    box("case", "brushed-aluminium", [0, 0.95, 0], [0.72, 1.78, 0.55]),
    cylinder("handle", "black-steel", [0.37, 1.0, 0.3], [0.018, 1.18, 0.018]),
  ]),
  asset("wine-cooler", "Wine cooler cabinet", "appliance", [
    box("case", "black-steel", [0, 0.5, 0], [0.55, 0.88, 0.42]),
    box("glass-door", "screen-glass", [0, 0.52, 0.23], [0.47, 0.72, 0.04]),
  ]),
  asset("microwave", "Built-in microwave", "appliance", [
    box("case", "brushed-aluminium", [0, 0.26, 0], [0.58, 0.34, 0.36]),
    box("door", "screen-glass", [0, 0.26, 0.2], [0.48, 0.24, 0.04]),
  ]),
  asset("oven", "Built-in oven", "appliance", [
    box("case", "black-steel", [0, 0.36, 0], [0.62, 0.55, 0.42]),
    box("door", "screen-glass", [0, 0.36, 0.23], [0.5, 0.38, 0.04]),
  ]),
  asset("dishwasher", "Integrated dishwasher", "appliance", [
    box("case", "brushed-aluminium", [0, 0.42, 0], [0.58, 0.72, 0.44]),
    box("toe-kick", "black-steel", [0, 0.08, 0.24], [0.5, 0.08, 0.04]),
  ]),
  asset("coffee-machine", "Countertop coffee machine", "appliance", [
    box("body", "black-steel", [0, 0.28, 0], [0.38, 0.42, 0.32]),
    cylinder("portafilter", "brushed-aluminium", [0, 0.18, 0.19], [0.05, 0.18, 0.05], [Math.PI / 2, 0, 0]),
  ]),
  asset("sink", "Inset kitchen sink", "kitchen", [
    box("basin", "brushed-aluminium", [0, 0.05, 0], [0.54, 0.08, 0.38]),
    cylinder("tap", "bronze", [0.2, 0.34, -0.08], [0.025, 0.52, 0.025]),
  ]),
  asset("extractor", "Minimal extractor hood", "kitchen", [
    box("hood", "black-steel", [0, 1.65, 0], [0.88, 0.16, 0.44]),
    cylinder("flue", "brushed-aluminium", [0, 2.02, 0], [0.12, 0.62, 0.12]),
  ]),
  asset("king-bed", "King bed", "bed", [
    box("base", "premium-leather", [0, 0.32, 0], [2.1, 0.34, 2.12]),
    box("mattress", "boucle-fabric", [0, 0.62, 0.08], [1.94, 0.28, 1.92]),
    box("headboard", "walnut", [0, 0.98, -1.08], [2.24, 1.15, 0.12]),
  ], "hero"),
  asset("queen-bed", "Queen bed", "bed", [
    box("base", "premium-leather", [0, 0.3, 0], [1.72, 0.32, 1.98]),
    box("mattress", "boucle-fabric", [0, 0.58, 0.08], [1.58, 0.26, 1.78]),
    box("headboard", "oak", [0, 0.92, -1.02], [1.9, 1.0, 0.12]),
  ], "hero"),
  asset("night-stand", "Luxury night stand", "storage", [
    box("case", "walnut", [0, 0.36, 0], [0.46, 0.45, 0.38]),
    box("top", "travertine", [0, 0.62, 0], [0.5, 0.06, 0.42]),
  ]),
  asset("reading-lamp", "Passive reading lamp object", "lighting-object", [
    cylinder("stem", "bronze", [0, 0.34, 0], [0.016, 0.6, 0.016]),
    sphere("shade", "warm-shade", [0, 0.7, 0], [0.12, 0.1, 0.12]),
  ]),
  asset("wardrobe", "Freestanding wardrobe module", "storage", [
    box("case", "walnut", [0, 1.0, 0], [1.2, 1.9, 0.42]),
    box("trim", "bronze", [0, 1.0, 0.23], [1.08, 1.72, 0.035]),
  ]),
  asset("dressing-table", "Dressing table", "table", [
    box("desk", "walnut", [0, 0.55, 0], [1.15, 0.22, 0.42]),
    box("mirror", "tempered-glass", [0, 1.22, -0.18], [0.84, 0.84, 0.04]),
    cylinder("leg-a", "bronze", [-0.44, 0.27, 0.14], [0.022, 0.5, 0.022]),
    cylinder("leg-b", "bronze", [0.44, 0.27, 0.14], [0.022, 0.5, 0.022]),
  ]),
  asset("bed-bench", "End-of-bed bench", "seating", [
    box("seat", "premium-leather", [0, 0.38, 0], [1.12, 0.22, 0.42]),
    cylinder("leg-a", "black-steel", [-0.42, 0.18, -0.14], [0.025, 0.32, 0.025]),
    cylinder("leg-b", "black-steel", [0.42, 0.18, -0.14], [0.025, 0.32, 0.025]),
    cylinder("leg-c", "black-steel", [-0.42, 0.18, 0.14], [0.025, 0.32, 0.025]),
    cylinder("leg-d", "black-steel", [0.42, 0.18, 0.14], [0.025, 0.32, 0.025]),
  ]),
  asset("study-desk", "Study desk", "office", [
    box("top", "walnut", [0, 0.74, 0], [1.2, 0.1, 0.58]),
    box("side", "black-steel", [-0.52, 0.38, 0], [0.08, 0.66, 0.48]),
    box("drawer", "walnut", [0.38, 0.46, 0.05], [0.36, 0.42, 0.46]),
  ]),
  asset("task-chair", "Task chair", "seating", [
    box("seat", "premium-leather", [0, 0.48, 0], [0.56, 0.14, 0.52]),
    box("back", "premium-leather", [0, 0.9, -0.2], [0.58, 0.64, 0.1]),
    cylinder("stem", "black-steel", [0, 0.26, 0], [0.035, 0.44, 0.035]),
    cylinder("base", "black-steel", [0, 0.08, 0], [0.28, 0.06, 0.28]),
  ]),
  asset("executive-desk", "Executive desk", "office", [
    box("top", "walnut", [0, 0.78, 0], [1.85, 0.12, 0.82]),
    box("modesty", "walnut", [0, 0.45, -0.28], [1.7, 0.54, 0.1]),
    box("side-storage", "bronze", [0.66, 0.42, 0.18], [0.38, 0.58, 0.42]),
  ], "hero"),
  asset("bookshelf", "Reusable bookshelf", "storage", [
    box("case", "walnut", [0, 1.0, 0], [1.15, 1.9, 0.28]),
    box("shelf-a", "bronze", [0, 0.58, 0.16], [1.06, 0.04, 0.08]),
    box("shelf-b", "bronze", [0, 1.02, 0.16], [1.06, 0.04, 0.08]),
    box("shelf-c", "bronze", [0, 1.46, 0.16], [1.06, 0.04, 0.08]),
  ]),
  asset("meeting-table", "Small meeting table", "table", [
    box("top", "travertine", [0, 0.72, 0], [1.18, 0.1, 0.72]),
    cylinder("base", "bronze", [0, 0.36, 0], [0.16, 0.62, 0.16]),
  ]),
  asset("cinema-recliner", "Luxury cinema recliner", "cinema", [
    box("seat", "premium-leather", [0, 0.42, 0], [0.72, 0.24, 0.74]),
    box("back", "premium-leather", [0, 0.92, -0.24], [0.74, 0.9, 0.16]),
    box("footrest", "premium-leather", [0, 0.28, 0.55], [0.7, 0.18, 0.42]),
    box("arms", "black-steel", [0, 0.54, 0], [0.86, 0.3, 0.78]),
  ], "hero"),
  asset("projector", "Passive cinema projector", "cinema", [
    box("body", "black-steel", [0, 1.9, 0], [0.45, 0.18, 0.32]),
    cylinder("lens", "screen-glass", [0, 1.9, 0.19], [0.07, 0.08, 0.07], [Math.PI / 2, 0, 0]),
  ]),
  asset("projector-screen", "Large cinema screen", "cinema", [
    box("screen", "screen-glass", [0, 1.25, 0], [2.1, 1.18, 0.04]),
    box("frame", "black-steel", [0, 1.25, -0.03], [2.24, 1.32, 0.04]),
  ], "hero"),
  asset("treadmill", "Treadmill", "fitness", [
    box("deck", "rubber", [0, 0.2, 0], [0.72, 0.16, 1.28]),
    box("console", "black-steel", [0, 1.05, -0.52], [0.62, 0.22, 0.14]),
    cylinder("rail-left", "black-steel", [-0.42, 0.68, -0.28], [0.022, 0.96, 0.022], [0.45, 0, 0]),
    cylinder("rail-right", "black-steel", [0.42, 0.68, -0.28], [0.022, 0.96, 0.022], [0.45, 0, 0]),
  ], "hero"),
  asset("exercise-bike", "Exercise bike", "fitness", [
    cylinder("wheel", "black-steel", [0, 0.42, 0.12], [0.28, 0.08, 0.28], [Math.PI / 2, 0, 0]),
    box("seat", "premium-leather", [0, 0.85, -0.28], [0.28, 0.1, 0.22]),
    cylinder("frame", "brushed-aluminium", [0, 0.54, -0.08], [0.025, 0.82, 0.025], [0.75, 0, 0]),
    cylinder("handle", "black-steel", [0, 0.98, 0.32], [0.025, 0.48, 0.025], [Math.PI / 2, 0, 0]),
  ]),
  asset("bench-press", "Bench press", "fitness", [
    box("bench", "premium-leather", [0, 0.42, 0.12], [0.48, 0.14, 1.1]),
    cylinder("bar", "black-steel", [0, 1.18, -0.38], [0.025, 1.18, 0.025], [0, 0, Math.PI / 2]),
    box("rack-left", "black-steel", [-0.5, 0.72, -0.38], [0.06, 0.92, 0.06]),
    box("rack-right", "black-steel", [0.5, 0.72, -0.38], [0.06, 0.92, 0.06]),
  ]),
  asset("weights-rack", "Weights rack", "fitness", [
    box("rack", "black-steel", [0, 0.48, 0], [0.94, 0.72, 0.28]),
    cylinder("plate-a", "rubber", [-0.32, 0.66, 0.18], [0.14, 0.05, 0.14], [Math.PI / 2, 0, 0]),
    cylinder("plate-b", "rubber", [0, 0.66, 0.18], [0.14, 0.05, 0.14], [Math.PI / 2, 0, 0]),
    cylinder("plate-c", "rubber", [0.32, 0.66, 0.18], [0.14, 0.05, 0.14], [Math.PI / 2, 0, 0]),
  ]),
  asset("yoga-mat", "Yoga area mat", "fitness", [
    box("mat", "rubber", [0, 0.035, 0], [0.72, 0.035, 1.58]),
  ]),
  asset("outdoor-lounger", "Pool lounger", "outdoor", [
    box("base", "premium-leather", [0, 0.28, 0], [0.72, 0.14, 1.52]),
    box("back", "premium-leather", [0, 0.58, -0.52], [0.72, 0.58, 0.16], [-0.35, 0, 0]),
    cylinder("leg-a", "black-steel", [-0.28, 0.14, -0.48], [0.025, 0.24, 0.025]),
    cylinder("leg-b", "black-steel", [0.28, 0.14, 0.48], [0.025, 0.24, 0.025]),
  ]),
  asset("outdoor-dining-table", "Outdoor dining table", "outdoor", [
    box("top", "teak", [0, 0.72, 0], [1.75, 0.1, 0.9]),
    box("base", "black-steel", [0, 0.36, 0], [0.92, 0.62, 0.38]),
  ]),
  asset("outdoor-chair", "Outdoor dining chair", "outdoor", [
    box("seat", "boucle-fabric", [0, 0.42, 0], [0.48, 0.12, 0.46]),
    box("back", "oak", [0, 0.78, -0.18], [0.5, 0.5, 0.09]),
    cylinder("leg-a", "black-steel", [-0.18, 0.22, -0.14], [0.025, 0.38, 0.025]),
    cylinder("leg-b", "black-steel", [0.18, 0.22, -0.14], [0.025, 0.38, 0.025]),
  ]),
  asset("fire-pit", "Outdoor fire pit object", "outdoor", [
    cylinder("bowl", "black-steel", [0, 0.28, 0], [0.48, 0.32, 0.48]),
    cylinder("stone-ring", "travertine", [0, 0.24, 0], [0.62, 0.16, 0.62]),
  ]),
  asset("outdoor-kitchen", "Outdoor kitchen module", "outdoor", [
    box("base", "black-steel", [0, 0.48, 0], [1.7, 0.82, 0.56]),
    box("counter", "quartz", [0, 0.92, 0], [1.82, 0.08, 0.62]),
    box("grill", "screen-glass", [0.42, 0.98, 0.04], [0.58, 0.04, 0.36]),
  ]),
  asset("garden-bench", "Garden bench", "outdoor", [
    box("seat", "oak", [0, 0.42, 0], [1.24, 0.12, 0.42]),
    box("back", "oak", [0, 0.76, -0.16], [1.28, 0.48, 0.1]),
    cylinder("leg-a", "black-steel", [-0.46, 0.22, 0.12], [0.025, 0.38, 0.025]),
    cylinder("leg-b", "black-steel", [0.46, 0.22, 0.12], [0.025, 0.38, 0.025]),
  ]),
  asset("bathroom-stool", "Bathroom stool", "bathroom", [
    cylinder("seat", "travertine", [0, 0.42, 0], [0.22, 0.12, 0.22]),
    cylinder("base", "bronze", [0, 0.2, 0], [0.12, 0.34, 0.12]),
  ]),
  asset("laundry-counter", "Laundry counter", "utility", [
    box("case", "oak", [0, 0.46, 0], [1.3, 0.72, 0.48]),
    box("top", "quartz", [0, 0.86, 0], [1.36, 0.08, 0.52]),
  ]),
  asset("storage-rack", "Storage rack", "utility", [
    box("frame", "black-steel", [0, 0.82, 0], [1.0, 1.46, 0.34]),
    box("shelf-a", "oak", [0, 0.42, 0], [0.92, 0.06, 0.32]),
    box("shelf-b", "oak", [0, 0.82, 0], [0.92, 0.06, 0.32]),
    box("shelf-c", "oak", [0, 1.22, 0], [0.92, 0.06, 0.32]),
  ]),
  asset("utility-cabinet", "Utility cabinet without devices", "utility", [
    box("case", "premium-paint", [0, 0.88, 0], [0.9, 1.56, 0.42]),
    box("toe", "black-steel", [0, 0.08, 0.22], [0.78, 0.08, 0.04]),
  ]),
  asset("foyer-console", "Foyer console", "table", [
    box("top", "travertine", [0, 0.78, 0], [1.38, 0.1, 0.36]),
    box("base", "bronze", [0, 0.38, 0], [0.9, 0.62, 0.18]),
  ]),
  asset("prayer-rug", "Minimal prayer rug", "spiritual", [
    box("rug", "boucle-fabric", [0, 0.035, 0], [0.86, 0.035, 1.42]),
  ]),
  asset("elevator-bench", "Circulation bench", "circulation", [
    box("seat", "premium-leather", [0, 0.42, 0], [0.95, 0.16, 0.36]),
    box("base", "bronze", [0, 0.22, 0], [0.72, 0.28, 0.18]),
  ]),
] as const;

export const FURNITURE_ASSET_BY_ID = new Map(FURNITURE_ASSETS.map((assetTemplate) => [assetTemplate.id, assetTemplate]));
