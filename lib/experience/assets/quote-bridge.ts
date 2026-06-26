import type { ExperienceQuoteItem } from "@/types/experience";

export const EXPERIENCE_QUOTE_STORAGE_KEY = "smarthive-experience-quote-v1";

interface PersistedExperienceQuoteState {
  readonly state?: {
    readonly items?: readonly ExperienceQuoteItem[];
  };
}

export function readPersistedExperienceQuoteItems(): readonly ExperienceQuoteItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(EXPERIENCE_QUOTE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PersistedExperienceQuoteState;
    return Array.isArray(parsed.state?.items) ? parsed.state.items : [];
  } catch {
    return [];
  }
}
