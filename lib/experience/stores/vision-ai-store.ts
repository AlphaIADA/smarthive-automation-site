import { create } from "zustand";
import { AnalyzePhotoImport, GenerateVisionQuote, ScanRoom, StartCameraModeScan } from "@/lib/experience/vision-ai";
import type { VisionQuoteDraft, VisionRoomAnalysis, VisionScanMode } from "@/types/experience";

interface VisionAiStoreState {
  selectedRoomId: string;
  scanMode: VisionScanMode;
  activeAnalysis: VisionRoomAnalysis;
  quoteDraft: VisionQuoteDraft;
  lastScanLabel: string;
  scanRoom: (roomId: string, scanMode?: VisionScanMode) => void;
  startCameraModeScan: () => void;
  preparePhotoImport: () => void;
  generateQuote: () => void;
}

const initialRoomId = "gf-family-lounge";
const initialAnalysis = ScanRoom(initialRoomId);

export const useVisionAiStore = create<VisionAiStoreState>((set, get) => ({
  selectedRoomId: initialRoomId,
  scanMode: "room-click",
  activeAnalysis: initialAnalysis,
  quoteDraft: initialAnalysis.quoteDraft,
  lastScanLabel: initialAnalysis.scannedAtLabel,
  scanRoom: (roomId, scanMode = "room-click") => {
    const activeAnalysis = ScanRoom(roomId, scanMode);
    set({
      selectedRoomId: activeAnalysis.roomId,
      scanMode,
      activeAnalysis,
      quoteDraft: activeAnalysis.quoteDraft,
      lastScanLabel: activeAnalysis.scannedAtLabel,
    });
  },
  startCameraModeScan: () => {
    const activeAnalysis = StartCameraModeScan(get().selectedRoomId);
    set({
      scanMode: "camera-mode",
      activeAnalysis,
      quoteDraft: activeAnalysis.quoteDraft,
      lastScanLabel: activeAnalysis.scannedAtLabel,
    });
  },
  preparePhotoImport: () => {
    const activeAnalysis = AnalyzePhotoImport(get().selectedRoomId);
    set({
      scanMode: "photo-import",
      activeAnalysis,
      quoteDraft: activeAnalysis.quoteDraft,
      lastScanLabel: "Photo import contract ready",
    });
  },
  generateQuote: () => set({ quoteDraft: GenerateVisionQuote(get().selectedRoomId) }),
}));
