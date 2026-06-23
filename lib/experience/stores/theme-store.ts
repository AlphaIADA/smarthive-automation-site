import { create } from "zustand";

interface ThemeState {
  theme: "dark" | "light";
  setTheme: (theme: ThemeState["theme"]) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: "dark",
  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set((state) => ({ theme: state.theme === "dark" ? "light" : "dark" })),
}));
