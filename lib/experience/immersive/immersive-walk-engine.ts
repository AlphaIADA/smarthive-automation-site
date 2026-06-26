import { INTERIOR_DOORS, INTERIOR_WINDOWS } from "@/lib/experience/interior/architectural-specs";
import { INTERIOR_ROOMS, getInteriorRoom } from "@/lib/experience/interior/room-registry";
import { FURNITURE_PLACEMENTS } from "@/lib/experience/furniture/furniture-registry";
import type {
  GuidedTourStop,
  ImmersiveCollisionKind,
  ImmersiveCollisionVolume,
  ImmersiveInputMap,
  ImmersiveInputSource,
  ImmersiveMode,
  ImmersiveMovementProfile,
  ImmersivePose,
  ImmersiveWalkReport,
  ImmersiveInteractionTarget,
  InteriorRoom,
} from "@/types/experience";

export const IMMERSIVE_MODES: readonly ImmersiveMode[] = ["orbit", "walk", "fly", "first-person", "guided-tour", "vr-ready"] as const;
export const IMMERSIVE_INPUT_SOURCES: readonly ImmersiveInputSource[] = ["mouse", "keyboard", "touch", "controller"] as const;

function round(value: number, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function vec(x: number, y: number, z: number) {
  return { x: round(x), y: round(y), z: round(z) };
}

function tuple(x: number, y: number, z: number): readonly [number, number, number] {
  return [round(x), round(y), round(z)] as const;
}

function roomCenter(room: InteriorRoom) {
  const { min, max } = room.boundingBox;
  return {
    x: (min.x + max.x) / 2,
    y: min.y + Math.min(1.72, room.ceilingHeight * 0.45),
    z: (min.z + max.z) / 2,
  };
}

function pose(roomId: string, offset: readonly [number, number, number] = [0, 1.72, 2.4], yaw = 0, pitch = 0): ImmersivePose {
  const room = getInteriorRoom(roomId) ?? INTERIOR_ROOMS[0];
  const center = roomCenter(room);
  const position = vec(center.x + offset[0], room.boundingBox.min.y + offset[1], center.z + offset[2]);
  const target = vec(center.x, room.boundingBox.min.y + 1.45, center.z);

  return {
    position,
    target,
    yaw,
    pitch,
  };
}

function collisionVolume(
  kind: ImmersiveCollisionKind,
  id: string,
  label: string,
  position: readonly [number, number, number],
  size: readonly [number, number, number],
  roomId: string | null,
  blocksFly = false,
): ImmersiveCollisionVolume {
  return {
    id,
    kind,
    label,
    position,
    size,
    roomId,
    active: true,
    blocksWalk: true,
    blocksFly,
  };
}

function roomWallVolumes(room: InteriorRoom): readonly ImmersiveCollisionVolume[] {
  if (room.futureEnergyConsumption.zone === "outdoor") return [];

  const { min, max } = room.boundingBox;
  const width = max.x - min.x;
  const depth = max.z - min.z;
  const height = Math.min(2.6, room.ceilingHeight);
  const centerY = min.y + height / 2;
  const thickness = 0.12;

  return [
    collisionVolume("wall", `collision-wall-${room.id}-north`, `${room.name} north wall`, tuple((min.x + max.x) / 2, centerY, min.z), tuple(width, height, thickness), room.id),
    collisionVolume("wall", `collision-wall-${room.id}-south`, `${room.name} south wall`, tuple((min.x + max.x) / 2, centerY, max.z), tuple(width, height, thickness), room.id),
    collisionVolume("wall", `collision-wall-${room.id}-west`, `${room.name} west wall`, tuple(min.x, centerY, (min.z + max.z) / 2), tuple(thickness, height, depth), room.id),
    collisionVolume("wall", `collision-wall-${room.id}-east`, `${room.name} east wall`, tuple(max.x, centerY, (min.z + max.z) / 2), tuple(thickness, height, depth), room.id),
  ];
}

function doorVolumes(): readonly ImmersiveCollisionVolume[] {
  return INTERIOR_DOORS.map((door) =>
    collisionVolume(
      "door",
      `collision-door-${door.id}`,
      `${door.type.replace(/-/g, " ")} door`,
      door.position,
      [Math.max(door.size[0], 0.24), Math.max(door.size[1], 1.9), Math.max(door.size[2], 0.18)],
      null,
    ),
  );
}

function glassVolumes(): readonly ImmersiveCollisionVolume[] {
  const windows = INTERIOR_WINDOWS.map((windowSpec) =>
    collisionVolume(
      "glass",
      `collision-glass-${windowSpec.id}`,
      `${windowSpec.type.replace(/-/g, " ")} glass`,
      windowSpec.position,
      [Math.max(windowSpec.size[0], 0.14), Math.max(windowSpec.size[1], 0.14), Math.max(windowSpec.size[2], 0.14)],
      null,
      true,
    ),
  );
  const slidingDoors = INTERIOR_DOORS.filter((door) => door.type === "sliding-glass").map((door) =>
    collisionVolume("glass", `collision-glass-door-${door.id}`, "sliding glass door", door.position, [door.size[0], door.size[1], Math.max(door.size[2], 0.16)], null, true),
  );

  return [...windows, ...slidingDoors];
}

function furnitureVolumes(): readonly ImmersiveCollisionVolume[] {
  return FURNITURE_PLACEMENTS.map((placement) =>
    collisionVolume(
      "furniture",
      `collision-furniture-${placement.id}`,
      placement.label,
      placement.position,
      tuple(0.9 * (placement.scale?.[0] ?? 1), 1.0 * (placement.scale?.[1] ?? 1), 0.9 * (placement.scale?.[2] ?? 1)),
      placement.roomId,
    ),
  );
}

function specialVolumes(): readonly ImmersiveCollisionVolume[] {
  return [
    collisionVolume("pool", "collision-pool-infinity-reflection", "Infinity reflection pool", [2.5, 0.35, -20.3], [15.8, 0.8, 6.4], "site-pool", true),
    collisionVolume("stairs", "collision-stairs-floating-main", "Luxury floating staircase", [-1.76, 2.45, 0.28], [3.9, 4.5, 3.8], "gf-staircase"),
    collisionVolume("elevator", "collision-elevator-shaft", "Residential elevator shaft", [-0.2, 3.9, -0.75], [1.7, 7.6, 2.1], "gf-elevator-shaft", true),
  ];
}

export const IMMERSIVE_COLLISION_VOLUMES: readonly ImmersiveCollisionVolume[] = [
  ...INTERIOR_ROOMS.flatMap((room) => roomWallVolumes(room)),
  ...doorVolumes(),
  ...glassVolumes(),
  ...furnitureVolumes(),
  ...specialVolumes(),
];

export const IMMERSIVE_INTERACTION_TARGETS: readonly ImmersiveInteractionTarget[] = [
  ...INTERIOR_DOORS.map((door) => ({
    id: `interaction-door-${door.id}`,
    kind: "door" as const,
    label: `${door.type.replace(/-/g, " ")} interaction`,
    roomId: null,
    position: door.position,
    radiusMeters: 1.25,
    enabled: true as const,
    animationReady: true as const,
  })),
  {
    id: "interaction-elevator-main",
    kind: "elevator",
    label: "Luxury residential elevator",
    roomId: "gf-elevator-shaft",
    position: [-0.2, 1.6, -0.75],
    radiusMeters: 1.6,
    enabled: true as const,
    animationReady: true as const,
  },
];

export const IMMERSIVE_MOVEMENT_PROFILES: readonly ImmersiveMovementProfile[] = [
  { mode: "orbit", label: "Orbit", enabled: true, speedMetersPerSecond: 0, verticalSpeedMetersPerSecond: 0, mouseLook: false, keyboard: false, touch: true, controller: false, collision: false, headBob: false, smoothTransitions: true, vrReady: false },
  { mode: "walk", label: "Walk", enabled: true, speedMetersPerSecond: 2.1, verticalSpeedMetersPerSecond: 0, mouseLook: true, keyboard: true, touch: true, controller: true, collision: true, headBob: true, smoothTransitions: true, vrReady: false },
  { mode: "fly", label: "Fly", enabled: true, speedMetersPerSecond: 4.8, verticalSpeedMetersPerSecond: 2.6, mouseLook: true, keyboard: true, touch: true, controller: true, collision: true, headBob: false, smoothTransitions: true, vrReady: false },
  { mode: "first-person", label: "First Person", enabled: true, speedMetersPerSecond: 2.35, verticalSpeedMetersPerSecond: 0, mouseLook: true, keyboard: true, touch: true, controller: true, collision: true, headBob: true, smoothTransitions: true, vrReady: false },
  { mode: "guided-tour", label: "Guided Tour", enabled: true, speedMetersPerSecond: 1.65, verticalSpeedMetersPerSecond: 0, mouseLook: false, keyboard: true, touch: true, controller: true, collision: true, headBob: false, smoothTransitions: true, vrReady: false },
  { mode: "vr-ready", label: "VR Ready", enabled: true, speedMetersPerSecond: 1.8, verticalSpeedMetersPerSecond: 0, mouseLook: true, keyboard: true, touch: true, controller: true, collision: true, headBob: false, smoothTransitions: true, vrReady: true },
];

export const IMMERSIVE_INPUT_MAPS: readonly ImmersiveInputMap[] = [
  { source: "mouse", enabled: true, bindings: ["drag look", "wheel dolly", "click interaction"] },
  { source: "keyboard", enabled: true, bindings: ["WASD move", "QE vertical in fly", "Space interact", "Shift speed"] },
  { source: "touch", enabled: true, bindings: ["one finger look", "two finger move", "tap interaction"] },
  { source: "controller", enabled: true, bindings: ["left stick move", "right stick look", "A interact", "B tour back"] },
];

export const GUIDED_TOUR_STOPS: readonly GuidedTourStop[] = [
  { id: "tour-living", label: "Living Room", roomId: "gf-family-lounge", order: 1, pose: pose("gf-family-lounge", [1.6, 1.68, 2.2], -0.5), narrationPrompt: "Explain the family lounge comfort, lighting, security, and entertainment readiness.", aiNarrationReady: true },
  { id: "tour-kitchen", label: "Kitchen", roomId: "gf-open-kitchen", order: 2, pose: pose("gf-open-kitchen", [-1.2, 1.68, 1.9], 0.2), narrationPrompt: "Explain the open kitchen smart appliance and power readiness.", aiNarrationReady: true },
  { id: "tour-dining", label: "Dining", roomId: "gf-dining", order: 3, pose: pose("gf-dining", [0.4, 1.68, 2.1], -0.15), narrationPrompt: "Explain the dining lighting, audio, and scene potential.", aiNarrationReady: true },
  { id: "tour-bedrooms", label: "Bedrooms", roomId: "ff-master-bedroom", order: 4, pose: pose("ff-master-bedroom", [1.1, 1.62, 2.0], -0.4), narrationPrompt: "Explain bedroom comfort, privacy, access, and curtain readiness.", aiNarrationReady: true },
  { id: "tour-cinema", label: "Cinema", roomId: "gf-cinema", order: 5, pose: pose("gf-cinema", [0.8, 1.58, 1.6], -0.2), narrationPrompt: "Explain cinema audio, lighting, and security context.", aiNarrationReady: true },
  { id: "tour-gym", label: "Gym", roomId: "gf-gym", order: 6, pose: pose("gf-gym", [0.7, 1.62, 1.6], -0.1), narrationPrompt: "Explain wellness, energy, safety, and occupancy readiness.", aiNarrationReady: true },
  { id: "tour-garden", label: "Garden", roomId: "gf-patio-access", order: 7, pose: { position: vec(-8.5, 1.72, -11.5), target: vec(-12.5, 1.5, -5.5), yaw: -0.8, pitch: 0 }, narrationPrompt: "Explain garden lighting, irrigation, perimeter security, and outdoor scene readiness.", aiNarrationReady: true },
  { id: "tour-pool", label: "Pool", roomId: "site-pool", order: 8, pose: { position: vec(8.8, 1.72, -15.4), target: vec(2.5, 1.1, -20.3), yaw: -1.2, pitch: 0 }, narrationPrompt: "Explain pool controls, lighting, safety, and lounge experience readiness.", aiNarrationReady: true },
];

function countVolumes(kind: ImmersiveCollisionKind) {
  return IMMERSIVE_COLLISION_VOLUMES.filter((volume) => volume.kind === kind).length;
}

export function getMovementProfile(mode: ImmersiveMode): ImmersiveMovementProfile {
  return IMMERSIVE_MOVEMENT_PROFILES.find((profile) => profile.mode === mode) ?? IMMERSIVE_MOVEMENT_PROFILES[0];
}

export function getGuidedTourStop(index: number): GuidedTourStop {
  const normalizedIndex = ((index % GUIDED_TOUR_STOPS.length) + GUIDED_TOUR_STOPS.length) % GUIDED_TOUR_STOPS.length;
  return GUIDED_TOUR_STOPS[normalizedIndex];
}

export function getInitialImmersivePose(): ImmersivePose {
  return pose("gf-foyer", [0.4, 1.72, 2.2]);
}

export const IMMERSIVE_WALK_REPORT: ImmersiveWalkReport = {
  modes: IMMERSIVE_MODES,
  inputSources: IMMERSIVE_INPUT_SOURCES,
  movementProfiles: IMMERSIVE_MOVEMENT_PROFILES,
  collision: {
    volumeCount: IMMERSIVE_COLLISION_VOLUMES.length,
    wallCount: countVolumes("wall"),
    doorCount: countVolumes("door"),
    furnitureCount: countVolumes("furniture"),
    glassCount: countVolumes("glass"),
    poolCount: countVolumes("pool"),
    stairsCount: countVolumes("stairs"),
    elevatorCount: countVolumes("elevator"),
  },
  interactions: {
    doorInteractionReady: true,
    elevatorInteractionReady: true,
    targetCount: IMMERSIVE_INTERACTION_TARGETS.length,
  },
  camera: {
    naturalMovement: true,
    headBob: true,
    smoothTransitions: true,
    firstPersonReady: true,
    flyReady: true,
    vrReady: true,
  },
  guidedTour: {
    stopCount: GUIDED_TOUR_STOPS.length,
    route: GUIDED_TOUR_STOPS.map((stop) => stop.label),
    aiNarrationReady: true,
  },
  constraints: {
    websiteFunctionality: "untouched",
    apiRoutes: "untouched",
    database: "untouched",
    existingGeometry: "preserved",
  },
};
