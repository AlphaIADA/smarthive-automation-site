import { create } from "zustand";
import {
  CloneScene,
  CompareTwinFrames,
  ExportTwin,
  ImportTwin,
  ReplayState,
  TWIN_OBJECT_GRAPH,
  UpdateState,
} from "@/lib/experience/digital-twin/twin-registry";
import type {
  TwinComparisonResult,
  TwinExportPayload,
  TwinHistoryFrame,
  TwinImportResult,
  TwinLifecycleState,
  TwinSceneClone,
  TwinTimelineSnapshot,
} from "@/types/experience";

interface DigitalTwinStoreState {
  selectedTwinUuid: string;
  timelineFrame: TwinHistoryFrame;
  timelineSnapshot: TwinTimelineSnapshot;
  comparison: TwinComparisonResult;
  clonedScene: TwinSceneClone | null;
  exportPayload: TwinExportPayload | null;
  importResult: TwinImportResult | null;
  selectTwinEntity: (uuid: string) => void;
  setTimelineFrame: (frame: TwinHistoryFrame) => void;
  updateSelectedState: (state: TwinLifecycleState) => void;
  cloneScene: () => void;
  exportTwin: () => void;
  importTwin: () => void;
}

const initialFrame: TwinHistoryFrame = "today";
const initialExport = ExportTwin();

export const useDigitalTwinStore = create<DigitalTwinStoreState>((set, get) => ({
  selectedTwinUuid: TWIN_OBJECT_GRAPH.rootUuid,
  timelineFrame: initialFrame,
  timelineSnapshot: ReplayState(initialFrame),
  comparison: CompareTwinFrames("yesterday", "today"),
  clonedScene: null,
  exportPayload: initialExport,
  importResult: null,
  selectTwinEntity: (selectedTwinUuid) => set({ selectedTwinUuid }),
  setTimelineFrame: (timelineFrame) =>
    set({
      timelineFrame,
      timelineSnapshot: ReplayState(timelineFrame),
    }),
  updateSelectedState: (state) => {
    const selected = UpdateState(get().selectedTwinUuid, state);
    if (!selected) return;
    set({
      timelineFrame: "today",
      timelineSnapshot: ReplayState("today"),
      comparison: CompareTwinFrames("yesterday", "today"),
    });
  },
  cloneScene: () => set({ clonedScene: CloneScene("time-machine-playback") }),
  exportTwin: () => set({ exportPayload: ExportTwin() }),
  importTwin: () => set({ importResult: ImportTwin(get().exportPayload ?? initialExport) }),
}));
