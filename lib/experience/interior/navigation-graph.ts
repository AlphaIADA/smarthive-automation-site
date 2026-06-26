import type { InteriorNavigationEdge } from "@/types/experience";

export const INTERIOR_NAVIGATION_GRAPH: readonly InteriorNavigationEdge[] = [
  { from: "gf-foyer", to: "gf-formal-living", type: "open", distanceMeters: 4.2, walkModeReady: true },
  { from: "gf-foyer", to: "gf-staircase", type: "open", distanceMeters: 2.4, walkModeReady: true },
  { from: "gf-foyer", to: "gf-elevator-shaft", type: "elevator", distanceMeters: 2.2, walkModeReady: true },
  { from: "gf-foyer", to: "gf-wine-cellar", type: "hidden", distanceMeters: 2.7, walkModeReady: true },
  { from: "gf-formal-living", to: "gf-home-office", type: "door", distanceMeters: 3.6, walkModeReady: true },
  { from: "gf-family-lounge", to: "gf-dining", type: "open", distanceMeters: 4.6, walkModeReady: true },
  { from: "gf-family-lounge", to: "gf-patio-access", type: "sliding-glass", distanceMeters: 3.8, walkModeReady: true },
  { from: "gf-dining", to: "gf-open-kitchen", type: "open", distanceMeters: 3.2, walkModeReady: true },
  { from: "gf-open-kitchen", to: "gf-dirty-kitchen", type: "pocket", distanceMeters: 2.8, walkModeReady: true },
  { from: "gf-open-kitchen", to: "gf-pantry", type: "pocket", distanceMeters: 2.2, walkModeReady: true },
  { from: "gf-dirty-kitchen", to: "gf-garage-connection", type: "garage", distanceMeters: 4.5, walkModeReady: true },
  { from: "gf-guest-bedroom", to: "gf-guest-bathroom", type: "door", distanceMeters: 2.3, walkModeReady: true },
  { from: "gf-guest-bedroom", to: "gf-prayer-room", type: "door", distanceMeters: 3.4, walkModeReady: true },
  { from: "gf-cinema", to: "gf-gym", type: "door", distanceMeters: 3.8, walkModeReady: true },
  { from: "gf-laundry", to: "gf-storage", type: "door", distanceMeters: 3.1, walkModeReady: true },
  { from: "gf-smart-utility", to: "gf-storage", type: "hidden", distanceMeters: 2.2, walkModeReady: true },
  { from: "gf-staircase", to: "ff-circulation-bridge", type: "stair", distanceMeters: 6.8, walkModeReady: true },
  { from: "gf-elevator-shaft", to: "ff-circulation-bridge", type: "elevator", distanceMeters: 4.4, walkModeReady: true },
  { from: "ff-circulation-bridge", to: "ff-family-lounge", type: "open", distanceMeters: 2.5, walkModeReady: true },
  { from: "ff-family-lounge", to: "ff-private-lounge", type: "open", distanceMeters: 3.4, walkModeReady: true },
  { from: "ff-private-lounge", to: "ff-master-bedroom", type: "door", distanceMeters: 3.5, walkModeReady: true },
  { from: "ff-master-bedroom", to: "ff-walk-in-closet", type: "door", distanceMeters: 2.6, walkModeReady: true },
  { from: "ff-walk-in-closet", to: "ff-luxury-bathroom", type: "pocket", distanceMeters: 2.2, walkModeReady: true },
  { from: "ff-family-lounge", to: "ff-bedroom-2", type: "door", distanceMeters: 3.0, walkModeReady: true },
  { from: "ff-bedroom-2", to: "ff-bedroom-3", type: "door", distanceMeters: 3.7, walkModeReady: true },
  { from: "ff-bedroom-3", to: "ff-bedroom-4", type: "door", distanceMeters: 4.2, walkModeReady: true },
  { from: "ff-circulation-bridge", to: "ff-library", type: "open", distanceMeters: 3.9, walkModeReady: true },
  { from: "ff-library", to: "ff-study-area", type: "open", distanceMeters: 2.9, walkModeReady: true },
  { from: "ff-circulation-bridge", to: "ff-front-balcony", type: "sliding-glass", distanceMeters: 3.1, walkModeReady: true },
  { from: "ff-family-lounge", to: "ff-rear-terrace", type: "terrace", distanceMeters: 5.2, walkModeReady: true },
] as const;

export function getInteriorNavigationNeighbors(roomId: string): readonly string[] {
  return INTERIOR_NAVIGATION_GRAPH.flatMap((edge) => {
    if (edge.from === roomId) return [edge.to];
    if (edge.to === roomId) return [edge.from];
    return [];
  });
}
