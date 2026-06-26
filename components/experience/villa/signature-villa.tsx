"use client";

import type { BoxInstanceSpec } from "./generators/instanced-box-generator";
import { ColumnGenerator, type ColumnSpec } from "./generators/column-generator";
import { DoorGenerator, type DoorSpec } from "./generators/door-generator";
import { FenceGenerator, type FenceSpec } from "./generators/fence-generator";
import { FloorGenerator, type FloorSpec } from "./generators/floor-generator";
import { GlassGenerator, type GlassPanelSpec } from "./generators/glass-generator";
import { LandscapeGenerator, type PalmSpec, type PlantSpec } from "./generators/landscape-generator";
import { LightingGenerator, type ArchitecturalLightSpec } from "./generators/lighting-generator";
import { OutdoorAmenities, type OutdoorAmenitySpec } from "./generators/outdoor-amenities";
import { PoolGenerator, type PoolSpec } from "./generators/pool-generator";
import { RoofGenerator, type RoofSpec } from "./generators/roof-generator";
import { StairGenerator, type StairSpec } from "./generators/stair-generator";
import { WallGenerator, type WallSpec } from "./generators/wall-generator";
import { WindowGenerator, type WindowSpec } from "./generators/window-generator";

const walls = [
  { id: "ground-main-volume", position: [0, 2.05, 0.35], size: [18.2, 4.1, 8.7], material: "architecturalConcrete" },
  { id: "ground-stone-plinth", position: [0, 0.58, 5.05], size: [18.8, 1.16, 0.5], material: "naturalStone" },
  { id: "left-gallery-wing", position: [-12.7, 1.82, -0.85], size: [7.8, 3.64, 7.2], material: "travertine" },
  { id: "right-covered-garage", position: [13.1, 1.72, 3.55], size: [7.9, 3.44, 7.4], material: "charcoalStone" },
  { id: "upper-floating-volume", position: [-1.1, 6.05, -0.85], size: [15.6, 3.7, 8.3], material: "architecturalConcrete" },
  { id: "upper-black-service-band", position: [6.9, 6.18, -0.85], size: [1.3, 3.45, 8.5], material: "blackSteel" },
  { id: "front-entry-monolith", position: [-4.35, 2.2, 5.22], size: [1.05, 4.4, 0.72], material: "travertine" },
  { id: "garage-door-plane", position: [13.1, 1.6, 7.32], size: [5.7, 2.55, 0.16], material: "brushedAluminium" },
  { id: "security-house", position: [23.4, 0.98, 29.6], size: [3.6, 1.96, 2.7], material: "architecturalConcrete" },
  { id: "security-house-accent", position: [23.4, 1.2, 31.02], size: [3.72, 1.55, 0.16], material: "blackSteel" },
  { id: "pool-waterfall-wall", position: [8.2, 0.95, -25.2], size: [4.6, 1.9, 0.28], material: "naturalStone" },
] satisfies readonly WallSpec[];

const roofs = [
  { id: "main-roof", position: [0, 4.28, 0.35], size: [19.6, 0.34, 9.9], material: "blackSteel" },
  { id: "upper-roof", position: [-1.1, 8.08, -0.85], size: [16.8, 0.32, 9.35], material: "blackSteel" },
  { id: "gallery-roof", position: [-12.7, 3.78, -0.85], size: [8.8, 0.32, 8.15], material: "blackSteel" },
  { id: "garage-roof", position: [13.1, 3.62, 3.55], size: [9.1, 0.34, 8.7], material: "blackSteel" },
  { id: "entry-floating-canopy", position: [-1.95, 3.45, 7.08], size: [8.4, 0.28, 3.15], material: "blackSteel" },
  { id: "terrace-pergola", position: [-7.4, 7.45, -7.1], size: [6.8, 0.2, 3.4], material: "brushedAluminium" },
  { id: "security-house-roof", position: [23.4, 2.08, 29.6], size: [4.1, 0.2, 3.2], material: "blackSteel" },
] satisfies readonly RoofSpec[];

const floors = [
  { id: "driveway", position: [8.3, 0.02, 22.1], size: [8.4, 0.1, 23.5], material: "architecturalConcrete" },
  { id: "arrival-forecourt", position: [0, 0.045, 10.2], size: [19.6, 0.12, 8.1], material: "travertine" },
  { id: "front-walkway", position: [-8.6, 0.055, 17.2], size: [3.2, 0.12, 16.8], material: "naturalStone" },
  { id: "pool-deck", position: [0, 0.06, -19.4], size: [26.5, 0.12, 14.7], material: "travertine" },
  { id: "garden-path", position: [-20.6, 0.05, -10.4], size: [2.4, 0.1, 22.8], material: "naturalStone" },
  { id: "rear-terrace", position: [0.8, 4.34, -6.2], size: [12.2, 0.22, 4.8], material: "travertine" },
  { id: "front-balcony", position: [-1.8, 4.34, 4.52], size: [9.4, 0.2, 2.3], material: "travertine" },
  { id: "garage-court", position: [13.1, 0.06, 10.2], size: [8.8, 0.12, 5.4], material: "architecturalConcrete" },
  { id: "outdoor-dining-deck", position: [-10.7, 0.08, -17.9], size: [8.5, 0.12, 6.2], material: "travertine" },
] satisfies readonly FloorSpec[];

const windows = [
  { id: "front-left-glass-wall", position: [-7.1, 2.28, 4.78], size: [4.45, 3.2, 0.14], mullions: 2 },
  { id: "front-center-glass-wall", position: [1.75, 2.28, 4.78], size: [4.6, 3.2, 0.14], mullions: 2 },
  { id: "front-right-glass-wall", position: [6.0, 2.28, 4.78], size: [2.8, 3.2, 0.14], mullions: 1 },
  { id: "upper-front-panorama", position: [-2.25, 6.25, 3.48], size: [9.4, 2.65, 0.14], mullions: 3 },
  { id: "upper-rear-panorama", position: [-1.8, 6.2, -5.12], size: [9.9, 2.55, 0.14], mullions: 3 },
  { id: "rear-living-glass", position: [2.2, 2.25, -4.12], size: [8.4, 3.05, 0.14], mullions: 3 },
  { id: "left-wing-window", position: [-16.66, 2.0, -0.85], size: [4.2, 2.65, 0.14], rotation: [0, Math.PI / 2, 0], mullions: 2 },
  { id: "garage-side-window", position: [17.12, 1.88, 3.45], size: [3.7, 2.25, 0.14], rotation: [0, Math.PI / 2, 0], mullions: 1 },
  { id: "security-house-window", position: [23.4, 1.27, 31.16], size: [1.5, 0.92, 0.1], mullions: 1 },
] satisfies readonly WindowSpec[];

const doors = [
  { id: "signature-pivot-entry", position: [-1.85, 1.7, 5.25], size: [2.2, 3.15, 0.18] },
  { id: "gallery-side-service", position: [-12.7, 1.3, 2.84], size: [1.25, 2.35, 0.14] },
  { id: "security-house-door", position: [22.2, 0.94, 31.18], size: [0.78, 1.68, 0.12] },
] satisfies readonly DoorSpec[];

const columns = [
  { id: "entry-left", position: [-5.85, 1.7, 6.8], height: 3.4, radius: 0.16, square: true, material: "blackSteel" },
  { id: "entry-right", position: [1.9, 1.7, 6.8], height: 3.4, radius: 0.16, square: true, material: "blackSteel" },
  { id: "garage-front-left", position: [9.25, 1.8, 7.7], height: 3.6, radius: 0.17, square: true, material: "blackSteel" },
  { id: "garage-front-right", position: [16.95, 1.8, 7.7], height: 3.6, radius: 0.17, square: true, material: "blackSteel" },
  { id: "terrace-pergola-1", position: [-10.3, 5.9, -8.4], height: 3.05, radius: 0.11, square: true, material: "brushedAluminium" },
  { id: "terrace-pergola-2", position: [-4.7, 5.9, -8.4], height: 3.05, radius: 0.11, square: true, material: "brushedAluminium" },
  { id: "terrace-pergola-3", position: [-10.3, 5.9, -5.8], height: 3.05, radius: 0.11, square: true, material: "brushedAluminium" },
  { id: "terrace-pergola-4", position: [-4.7, 5.9, -5.8], height: 3.05, radius: 0.11, square: true, material: "brushedAluminium" },
] satisfies readonly ColumnSpec[];

const glassPanels = [
  { id: "front-balcony-rail", position: [-1.8, 5.02, 5.74], size: [9.5, 1.02, 0.12] },
  { id: "rear-terrace-rail", position: [0.8, 5.02, -8.74], size: [12.0, 1.02, 0.12] },
  { id: "rear-terrace-left-rail", position: [-5.35, 5.02, -6.2], size: [4.9, 1.02, 0.12], rotation: [0, Math.PI / 2, 0] },
  { id: "pool-safety-glass", position: [13.7, 0.78, -19.3], size: [0.12, 1.05, 10.2] },
  { id: "garden-stair-glass", position: [-19.1, 1.5, -9.6], size: [0.12, 1.0, 7.6] },
] satisfies readonly GlassPanelSpec[];

const stairs = [
  { id: "front-arrival-steps", position: [-1.85, 0.04, 8.75], steps: 5, stepSize: [4.4, 0.16, 0.58], rise: 0.075, run: 0.48, axis: "z", direction: -1, material: "travertine" },
  { id: "garden-terrace-stairs", position: [-18.7, 0.18, -3.6], steps: 14, stepSize: [2.05, 0.16, 0.52], rise: 0.22, run: 0.54, axis: "z", direction: -1, material: "naturalStone" },
] satisfies readonly StairSpec[];

const pools = [
  { id: "infinity-reflection-pool", position: [2.5, 0.02, -20.3], size: [15.8, 0.42, 6.4] },
] satisfies readonly PoolSpec[];

const fences = [
  { id: "signature-site", width: 72, depth: 70, height: 1.35 },
] satisfies readonly FenceSpec[];

const palms = [
  { id: "front-palm-left", position: [-22.5, 0, 18.5], scale: 1.15 },
  { id: "front-palm-right", position: [24.2, 0, 18.8], scale: 1.1 },
  { id: "pool-palm-left", position: [-14.5, 0, -24.8], scale: 1.2 },
  { id: "pool-palm-right", position: [15.7, 0, -25.6], scale: 1.12 },
  { id: "garden-palm", position: [-25.6, 0, -8.8], scale: 0.98 },
  { id: "gate-palm", position: [-17.4, 0, 30.5], scale: 0.92 },
] satisfies readonly PalmSpec[];

const plants = [
  { id: "entry-planter-1", position: [-6.8, 0, 8.6], scale: 0.9 },
  { id: "entry-planter-2", position: [2.8, 0, 8.4], scale: 0.86 },
  { id: "garage-planter", position: [18.1, 0, 9.6], scale: 0.78 },
  { id: "pool-planter-1", position: [-10.5, 0, -15.0], scale: 0.95 },
  { id: "pool-planter-2", position: [12.2, 0, -15.6], scale: 0.88 },
  { id: "garden-cluster-1", position: [-24.1, 0, -2.2], scale: 1.05 },
  { id: "garden-cluster-2", position: [-24.3, 0, -15.8], scale: 1.0 },
  { id: "security-planter", position: [27.0, 0, 30.1], scale: 0.72 },
] satisfies readonly PlantSpec[];

const pathLights = [
  ...Array.from({ length: 7 }, (_, index): BoxInstanceSpec => ({ id: `driveway-left-${index}`, position: [3.7, 0.24, 13 + index * 3.1] })),
  ...Array.from({ length: 7 }, (_, index): BoxInstanceSpec => ({ id: `driveway-right-${index}`, position: [12.9, 0.24, 13 + index * 3.1] })),
  ...Array.from({ length: 6 }, (_, index): BoxInstanceSpec => ({ id: `pool-edge-${index}`, position: [-8.6 + index * 3.4, 0.24, -13.1] })),
  ...Array.from({ length: 5 }, (_, index): BoxInstanceSpec => ({ id: `garden-path-${index}`, position: [-22.5, 0.24, -1.5 - index * 4.0] })),
] satisfies readonly BoxInstanceSpec[];

const facadeLights = [
  { id: "entry-wash-left", position: [-5.2, 3.1, 5.65], intensity: 1.45, distance: 9 },
  { id: "entry-wash-right", position: [2.2, 3.05, 5.65], intensity: 1.35, distance: 9 },
  { id: "upper-glow-left", position: [-7.8, 7.75, 3.8], intensity: 1.1, distance: 10 },
  { id: "upper-glow-right", position: [3.8, 7.75, 3.8], intensity: 1.1, distance: 10 },
  { id: "pool-wall-graze", position: [8.2, 1.9, -24.8], color: "#b9f2ff", intensity: 1.0, distance: 7 },
  { id: "garage-wash", position: [13.1, 3.0, 7.85], intensity: 1.0, distance: 8 },
] satisfies readonly ArchitecturalLightSpec[];

const amenities = [
  { id: "pool-lounge", type: "lounge", position: [-6.7, 0.28, -14.8], rotation: [0, 0.22, 0] },
  { id: "fire-pit", type: "fire-pit", position: [10.7, 0.26, -16.0] },
  { id: "outdoor-dining", type: "dining", position: [-10.7, 0.3, -18.0], rotation: [0, Math.PI / 2, 0] },
  { id: "bbq-station", type: "bbq", position: [-14.4, 0.55, -21.3], rotation: [0, Math.PI / 2, 0] },
  { id: "rear-water-feature", type: "water-feature", position: [8.2, 0.95, -25.0] },
] satisfies readonly OutdoorAmenitySpec[];

export function SignatureVilla() {
  return (
    <group name="SmartHive Signature Villa">
      <LandscapeGenerator palms={palms} plants={plants} />
      <FloorGenerator floors={floors} />
      <FenceGenerator fences={fences} />
      <WallGenerator walls={walls} />
      <RoofGenerator roofs={roofs} />
      <ColumnGenerator columns={columns} />
      <WindowGenerator windows={windows} />
      <DoorGenerator doors={doors} />
      <GlassGenerator panels={glassPanels} />
      <StairGenerator stairs={stairs} />
      <PoolGenerator pools={pools} />
      <OutdoorAmenities amenities={amenities} />
      <LightingGenerator facadeLights={facadeLights} pathLights={pathLights} />
    </group>
  );
}
