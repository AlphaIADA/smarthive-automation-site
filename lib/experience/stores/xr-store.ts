import { create } from "zustand";
import {
  DEFAULT_XR_ANCHOR_IDS,
  XR_PRESENTATION_STEPS,
  calculateXrQuotationUpdate,
  getXrModeProfile,
} from "@/lib/experience/xr";
import type { XrDeviceClass, XrMode, XrModeProfile, XrPresentationStep, XrQualityLevel, XrQuotationUpdateSummary } from "@/types/experience";

interface XrStoreState {
  mode: XrMode;
  deviceClass: XrDeviceClass;
  qualityLevel: XrQualityLevel;
  selectedAnchorIds: readonly string[];
  selectedPresentationStepId: string;
  selectedPresentationStep: XrPresentationStep | null;
  quotationUpdate: XrQuotationUpdateSummary;
  modeProfile: XrModeProfile;
  setMode: (mode: XrMode) => void;
  setDeviceClass: (deviceClass: XrDeviceClass) => void;
  setQualityLevel: (qualityLevel: XrQualityLevel) => void;
  toggleAnchor: (anchorId: string) => void;
  selectPresentationStep: (stepId: string) => void;
  resetPlacement: () => void;
}

const initialMode = "desktop";
const initialPresentationStep = XR_PRESENTATION_STEPS[0] ?? null;

function findPresentationStep(stepId: string) {
  return XR_PRESENTATION_STEPS.find((step) => step.id === stepId) ?? null;
}

export const useXrStore = create<XrStoreState>((set, get) => ({
  mode: initialMode,
  deviceClass: "desktop",
  qualityLevel: "high",
  selectedAnchorIds: DEFAULT_XR_ANCHOR_IDS,
  selectedPresentationStepId: initialPresentationStep?.id ?? "",
  selectedPresentationStep: initialPresentationStep,
  quotationUpdate: calculateXrQuotationUpdate(DEFAULT_XR_ANCHOR_IDS),
  modeProfile: getXrModeProfile(initialMode),
  setMode: (mode) => set({ mode, modeProfile: getXrModeProfile(mode) }),
  setDeviceClass: (deviceClass) => set({ deviceClass }),
  setQualityLevel: (qualityLevel) => set({ qualityLevel }),
  toggleAnchor: (anchorId) => {
    const selectedAnchorIds = get().selectedAnchorIds.includes(anchorId)
      ? get().selectedAnchorIds.filter((candidate) => candidate !== anchorId)
      : [...get().selectedAnchorIds, anchorId];
    set({ selectedAnchorIds, quotationUpdate: calculateXrQuotationUpdate(selectedAnchorIds) });
  },
  selectPresentationStep: (selectedPresentationStepId) =>
    set({
      selectedPresentationStepId,
      selectedPresentationStep: findPresentationStep(selectedPresentationStepId),
    }),
  resetPlacement: () => set({ selectedAnchorIds: DEFAULT_XR_ANCHOR_IDS, quotationUpdate: calculateXrQuotationUpdate(DEFAULT_XR_ANCHOR_IDS) }),
}));
