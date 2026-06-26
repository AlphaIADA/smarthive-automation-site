import { create } from "zustand";
import {
  GUIDED_TOUR_STOPS,
  getGuidedTourStop,
  getInitialImmersivePose,
  getMovementProfile,
} from "@/lib/experience/immersive";
import type { GuidedTourStop, ImmersiveInputSource, ImmersiveInteractionKind, ImmersiveMode, ImmersivePose } from "@/types/experience";

interface ImmersiveWalkState {
  mode: ImmersiveMode;
  inputSource: ImmersiveInputSource;
  pose: ImmersivePose;
  tourIndex: number;
  activeTourStop: GuidedTourStop;
  collisionEnabled: boolean;
  headBobEnabled: boolean;
  smoothTransitionActive: boolean;
  lastInteraction: string | null;
  setMode: (mode: ImmersiveMode) => void;
  setInputSource: (inputSource: ImmersiveInputSource) => void;
  setPose: (pose: ImmersivePose) => void;
  updatePose: (patch: Partial<ImmersivePose>) => void;
  nextTourStop: () => void;
  previousTourStop: () => void;
  goToTourStop: (index: number) => void;
  triggerInteraction: (kind: ImmersiveInteractionKind, label: string) => void;
}

const initialTourStop = GUIDED_TOUR_STOPS[0];
const initialPose = getInitialImmersivePose();

export const useImmersiveWalkStore = create<ImmersiveWalkState>((set, get) => ({
  mode: "orbit",
  inputSource: "mouse",
  pose: initialPose,
  tourIndex: 0,
  activeTourStop: initialTourStop,
  collisionEnabled: false,
  headBobEnabled: false,
  smoothTransitionActive: false,
  lastInteraction: null,
  setMode: (mode) => {
    const profile = getMovementProfile(mode);
    const nextTourStop = get().activeTourStop;
    set({
      mode,
      pose: mode === "guided-tour" ? nextTourStop.pose : get().pose,
      collisionEnabled: profile.collision,
      headBobEnabled: profile.headBob,
      smoothTransitionActive: profile.smoothTransitions,
    });
  },
  setInputSource: (inputSource) => set({ inputSource }),
  setPose: (pose) => set({ pose }),
  updatePose: (patch) => set({ pose: { ...get().pose, ...patch } }),
  nextTourStop: () => {
    const tourIndex = (get().tourIndex + 1) % GUIDED_TOUR_STOPS.length;
    const activeTourStop = getGuidedTourStop(tourIndex);
    set({
      tourIndex,
      activeTourStop,
      mode: "guided-tour",
      pose: activeTourStop.pose,
      collisionEnabled: true,
      headBobEnabled: false,
      smoothTransitionActive: true,
    });
  },
  previousTourStop: () => {
    const tourIndex = (get().tourIndex - 1 + GUIDED_TOUR_STOPS.length) % GUIDED_TOUR_STOPS.length;
    const activeTourStop = getGuidedTourStop(tourIndex);
    set({
      tourIndex,
      activeTourStop,
      mode: "guided-tour",
      pose: activeTourStop.pose,
      collisionEnabled: true,
      headBobEnabled: false,
      smoothTransitionActive: true,
    });
  },
  goToTourStop: (tourIndex) => {
    const activeTourStop = getGuidedTourStop(tourIndex);
    set({
      tourIndex,
      activeTourStop,
      mode: "guided-tour",
      pose: activeTourStop.pose,
      collisionEnabled: true,
      headBobEnabled: false,
      smoothTransitionActive: true,
    });
  },
  triggerInteraction: (kind, label) => set({ lastInteraction: `${kind}: ${label}`, smoothTransitionActive: true }),
}));
