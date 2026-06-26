import { create } from "zustand";
import type {
  ExperienceHotspot,
  ExperienceModelAssetId,
  ExperienceModelAssetState,
  ExperienceModelAssetStatus,
  ExperienceRenderMode,
} from "@/types/experience";

type AssetStatusMap = Partial<Record<ExperienceModelAssetId, ExperienceModelAssetState>>;

interface ModelAssetStoreState {
  readonly renderMode: ExperienceRenderMode;
  readonly assetStatuses: AssetStatusMap;
  readonly selectedHotspotId: string | null;
  readonly guidedTourActive: boolean;
  readonly guidedTourIndex: number;
  readonly setRenderMode: (renderMode: ExperienceRenderMode) => void;
  readonly setAssetStatus: (assetId: ExperienceModelAssetId, status: ExperienceModelAssetStatus, progress?: number, message?: string | null) => void;
  readonly selectHotspot: (hotspot: ExperienceHotspot | null) => void;
  readonly setGuidedTour: (active: boolean, index?: number) => void;
  readonly advanceGuidedTour: (maxIndex: number) => void;
}

export const useModelAssetStore = create<ModelAssetStoreState>((set) => ({
  renderMode: "production-glb",
  assetStatuses: {},
  selectedHotspotId: null,
  guidedTourActive: false,
  guidedTourIndex: 0,
  setRenderMode: (renderMode) => set({ renderMode }),
  setAssetStatus: (assetId, status, progress = status === "available" ? 100 : 0, message = null) =>
    set((state) => ({
      assetStatuses: {
        ...state.assetStatuses,
        [assetId]: {
          assetId,
          status,
          progress,
          message,
        },
      },
    })),
  selectHotspot: (hotspot) => set({ selectedHotspotId: hotspot?.id ?? null }),
  setGuidedTour: (guidedTourActive, guidedTourIndex = 0) => set({ guidedTourActive, guidedTourIndex }),
  advanceGuidedTour: (maxIndex) =>
    set((state) => ({
      guidedTourIndex: maxIndex <= 0 ? 0 : (state.guidedTourIndex + 1) % maxIndex,
      guidedTourActive: true,
    })),
}));
