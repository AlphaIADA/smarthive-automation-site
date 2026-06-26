import { create } from "zustand";
import {
  CONFIGURATION_ITEM_BY_ID,
  CONFIGURATION_PACKAGES,
  DEFAULT_CONFIGURATION_ITEM_IDS,
  DEFAULT_CONFIGURATION_PACKAGE_ID,
} from "@/lib/experience/configuration/configuration-catalog";
import type { ConfigurationCategory, ConfigurationPackageId } from "@/types/experience";

interface ConfigurationStoreState {
  selectedPackageId: ConfigurationPackageId;
  selectedItemIds: readonly string[];
  activeCategory: ConfigurationCategory | "all";
  selectedConfigurationItemId: string | null;
  selectPackage: (packageId: ConfigurationPackageId) => void;
  toggleItem: (itemId: string) => void;
  addItem: (itemId: string) => void;
  selectItem: (itemId: string | null) => void;
  setActiveCategory: (category: ConfigurationCategory | "all") => void;
  reset: () => void;
}

function itemIdsForPackage(packageId: ConfigurationPackageId) {
  return CONFIGURATION_PACKAGES.find((configurationPackage) => configurationPackage.id === packageId)?.itemIds ?? DEFAULT_CONFIGURATION_ITEM_IDS;
}

export const useConfigurationStore = create<ConfigurationStoreState>((set) => ({
  selectedPackageId: DEFAULT_CONFIGURATION_PACKAGE_ID,
  selectedItemIds: DEFAULT_CONFIGURATION_ITEM_IDS,
  activeCategory: "all",
  selectedConfigurationItemId: null,
  selectPackage: (selectedPackageId) =>
    set({
      selectedPackageId,
      selectedItemIds: itemIdsForPackage(selectedPackageId),
      selectedConfigurationItemId: null,
    }),
  toggleItem: (itemId) =>
    set((state) => {
      if (!CONFIGURATION_ITEM_BY_ID.has(itemId)) return state;
      const selected = state.selectedItemIds.includes(itemId);

      return {
        selectedItemIds: selected ? state.selectedItemIds.filter((candidate) => candidate !== itemId) : [...state.selectedItemIds, itemId],
        selectedConfigurationItemId: itemId,
      };
    }),
  addItem: (itemId) =>
    set((state) => {
      if (!CONFIGURATION_ITEM_BY_ID.has(itemId)) return state;
      if (state.selectedItemIds.includes(itemId)) return { selectedConfigurationItemId: itemId };
      return {
        selectedItemIds: [...state.selectedItemIds, itemId],
        selectedConfigurationItemId: itemId,
      };
    }),
  selectItem: (selectedConfigurationItemId) => set({ selectedConfigurationItemId }),
  setActiveCategory: (activeCategory) => set({ activeCategory }),
  reset: () =>
    set({
      selectedPackageId: DEFAULT_CONFIGURATION_PACKAGE_ID,
      selectedItemIds: DEFAULT_CONFIGURATION_ITEM_IDS,
      activeCategory: "all",
      selectedConfigurationItemId: null,
    }),
}));
