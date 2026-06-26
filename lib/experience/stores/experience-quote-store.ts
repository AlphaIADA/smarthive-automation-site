import { create } from "zustand";
import { persist } from "zustand/middleware";
import { EXPERIENCE_QUOTE_STORAGE_KEY } from "@/lib/experience/assets/quote-bridge";
import type { ExperienceHotspot, ExperienceQuoteItem } from "@/types/experience";

interface ExperienceQuoteStoreState {
  readonly items: readonly ExperienceQuoteItem[];
  readonly addHotspotToQuote: (hotspot: ExperienceHotspot) => void;
  readonly removeItem: (quoteItemId: string) => void;
  readonly clearQuote: () => void;
}

function quoteItemFromHotspot(hotspot: ExperienceHotspot): ExperienceQuoteItem {
  return {
    quoteItemId: hotspot.quoteMapping.quoteItemId,
    catalogSlug: hotspot.quoteMapping.catalogSlug,
    configurationItemId: hotspot.quoteMapping.configurationItemId,
    hotspotId: hotspot.id,
    label: hotspot.label,
    room: hotspot.room,
    deviceType: hotspot.type,
    unitPrice: hotspot.quoteMapping.equipmentPrice,
    installationCost: hotspot.quoteMapping.installationCost,
    labourCost: hotspot.quoteMapping.labourCost,
    quantity: 1,
    addedAt: new Date().toISOString(),
  };
}

export const useExperienceQuoteStore = create<ExperienceQuoteStoreState>()(
  persist(
    (set) => ({
      items: [],
      addHotspotToQuote: (hotspot) =>
        set((state) => {
          const existing = state.items.find((item) => item.quoteItemId === hotspot.quoteMapping.quoteItemId);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.quoteItemId === existing.quoteItemId
                  ? {
                      ...item,
                      quantity: item.quantity + 1,
                      addedAt: new Date().toISOString(),
                    }
                  : item,
              ),
            };
          }

          return { items: [...state.items, quoteItemFromHotspot(hotspot)] };
        }),
      removeItem: (quoteItemId) =>
        set((state) => ({
          items: state.items.filter((item) => item.quoteItemId !== quoteItemId),
        })),
      clearQuote: () => set({ items: [] }),
    }),
    {
      name: EXPERIENCE_QUOTE_STORAGE_KEY,
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
