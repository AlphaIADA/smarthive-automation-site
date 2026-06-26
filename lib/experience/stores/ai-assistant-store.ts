import { create } from "zustand";
import { AI_WELCOME_RESPONSE, answerSmartHiveAiQuery } from "@/lib/experience/ai/query-engine";
import type { AiAssistantResponse, AiVisualSelectionKind } from "@/types/experience";

interface AiAssistantStoreState {
  messages: readonly AiAssistantResponse[];
  lastQuery: string;
  ask: (query: string, selection: { readonly kind: AiVisualSelectionKind; readonly id: string | null }) => void;
  explainSelection: (selection: { readonly kind: AiVisualSelectionKind; readonly id: string | null }) => void;
  clear: () => void;
}

export const useAiAssistantStore = create<AiAssistantStoreState>((set) => ({
  messages: [AI_WELCOME_RESPONSE],
  lastQuery: "",
  ask: (query, selection) =>
    set((state) => {
      const response = answerSmartHiveAiQuery(query, selection);
      return {
        lastQuery: query,
        messages: [response, ...state.messages].slice(0, 12),
      };
    }),
  explainSelection: (selection) =>
    set((state) => {
      const response = answerSmartHiveAiQuery(selection.kind === "none" ? "Explain the digital twin" : `Explain this ${selection.kind}`, selection);
      return {
        lastQuery: response.query,
        messages: [response, ...state.messages].slice(0, 12),
      };
    }),
  clear: () => set({ messages: [AI_WELCOME_RESPONSE], lastQuery: "" }),
}));
