import { create } from "zustand";

type SelectionKind = "none" | "room" | "device";

interface SelectionState {
  kind: SelectionKind;
  selectedId: string | null;
  select: (kind: SelectionKind, selectedId: string | null) => void;
  clear: () => void;
}

export const useSelectionStore = create<SelectionState>((set) => ({
  kind: "none",
  selectedId: null,
  select: (kind, selectedId) => set({ kind, selectedId }),
  clear: () => set({ kind: "none", selectedId: null }),
}));
