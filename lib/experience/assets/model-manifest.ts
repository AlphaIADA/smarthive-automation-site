import type { CameraPresetId, ExperienceModelAsset, ExperienceModelAssetId } from "@/types/experience";

const MODEL_BASE_PATH = "/experience/models";

function modelAsset(
  id: ExperienceModelAssetId,
  label: string,
  fileName: string,
  cameraPresets: readonly CameraPresetId[],
  options: Pick<ExperienceModelAsset, "kind" | "roomId" | "required" | "lazy">,
): ExperienceModelAsset {
  return {
    id,
    label,
    fileName,
    url: `${MODEL_BASE_PATH}/${fileName}`,
    cameraPresets,
    ...options,
  };
}

export const PRIMARY_VILLA_MODEL = modelAsset("villa", "Production Villa", "villa.glb", ["exterior-arrival", "front-arrival"], {
  kind: "primary",
  roomId: null,
  required: true,
  lazy: false,
});

export const ROOM_MODEL_CHUNKS: readonly ExperienceModelAsset[] = [
  modelAsset("exterior", "Exterior Shell", "exterior.glb", ["exterior-arrival", "driveway", "security-overview"], {
    kind: "room-chunk",
    roomId: "site-exterior",
    required: false,
    lazy: true,
  }),
  modelAsset("living-room", "Living Room", "living-room.glb", ["living-room"], {
    kind: "room-chunk",
    roomId: "gf-formal-living",
    required: false,
    lazy: true,
  }),
  modelAsset("kitchen", "Kitchen", "kitchen.glb", ["kitchen"], {
    kind: "room-chunk",
    roomId: "gf-open-kitchen",
    required: false,
    lazy: true,
  }),
  modelAsset("master-bedroom", "Master Bedroom", "master-bedroom.glb", ["master-bedroom"], {
    kind: "room-chunk",
    roomId: "ff-master-bedroom",
    required: false,
    lazy: true,
  }),
  modelAsset("cinema", "Cinema", "cinema.glb", ["cinema"], {
    kind: "room-chunk",
    roomId: "gf-cinema",
    required: false,
    lazy: true,
  }),
  modelAsset("gym", "Gym", "gym.glb", ["gym"], {
    kind: "room-chunk",
    roomId: "gf-gym",
    required: false,
    lazy: true,
  }),
  modelAsset("bathroom", "Bathroom", "bathroom.glb", ["master-bedroom"], {
    kind: "room-chunk",
    roomId: "ff-luxury-bathroom",
    required: false,
    lazy: true,
  }),
  modelAsset("pool-area", "Pool Area", "pool-area.glb", ["pool-area", "pool", "backyard"], {
    kind: "room-chunk",
    roomId: "gf-patio-access",
    required: false,
    lazy: true,
  }),
] as const;

export const EXPERIENCE_MODEL_ASSETS: readonly ExperienceModelAsset[] = [PRIMARY_VILLA_MODEL, ...ROOM_MODEL_CHUNKS] as const;

export function roomChunksForCameraPreset(preset: CameraPresetId): readonly ExperienceModelAsset[] {
  return ROOM_MODEL_CHUNKS.filter((asset) => asset.cameraPresets.includes(preset));
}

export function getExperienceModelAsset(assetId: ExperienceModelAssetId): ExperienceModelAsset | null {
  return EXPERIENCE_MODEL_ASSETS.find((asset) => asset.id === assetId) ?? null;
}
