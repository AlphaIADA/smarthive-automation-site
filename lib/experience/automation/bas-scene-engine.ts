import type { BasAction, BasActionKind, BasScene, BasSceneType } from "@/types/experience";
import { BAS_ENDPOINTS } from "./bas-registry";

function endpoint(domain: string, index = 0) {
  return BAS_ENDPOINTS.filter((item) => item.domain === domain)[index]?.id ?? null;
}

function action(id: string, kind: BasActionKind, endpointId: string | null, label: string, payload: Readonly<Record<string, string | number | boolean>>): BasAction {
  return {
    id,
    kind,
    endpointId,
    label,
    payload,
    failSafeStrategy: kind === "notify" ? "notify-only" : "skip-action",
  };
}

function scene(id: string, name: string, type: BasSceneType, actions: readonly BasAction[], customEditable = type === "custom"): BasScene {
  return {
    id,
    name,
    type,
    actions,
    graphReady: true,
    customEditable,
  };
}

export const BAS_SCENES: readonly BasScene[] = [
  scene("bas-scene-movie", "Movie", "movie", [
    action("movie-lights", "set-lighting", endpoint("lighting", 0), "Dim lights to cinema level", { brightness: 18, temperature: 2400 }),
    action("movie-curtains", "set-curtains", endpoint("curtains", 0), "Close curtains", { position: 0 }),
    action("movie-audio", "set-audio", endpoint("audio", 0), "Set cinema audio", { volume: 42, mode: "cinema" }),
    action("movie-hvac", "set-hvac", endpoint("hvac", 0), "Comfort cooling", { setpoint: 23 }),
  ]),
  scene("bas-scene-party", "Party", "party", [
    action("party-lights", "set-lighting", endpoint("lighting", 1), "Set accent lighting", { brightness: 78, color: "warm" }),
    action("party-audio", "set-audio", endpoint("audio", 1), "Start party playlist", { volume: 54, playlist: "party" }),
    action("party-garden", "set-garden", endpoint("garden", 0), "Enable garden lighting", { enabled: true }),
    action("party-pool", "set-pool", endpoint("pool", 0), "Enable pool ambience", { mode: "ambient" }),
  ]),
  scene("bas-scene-dinner", "Dinner", "dinner", [
    action("dinner-lights", "set-lighting", endpoint("lighting", 2), "Warm dining lighting", { brightness: 62, temperature: 2700 }),
    action("dinner-curtains", "set-curtains", endpoint("curtains", 1), "Soft privacy", { position: 35 }),
    action("dinner-audio", "set-audio", endpoint("audio", 2), "Dinner music", { volume: 22, playlist: "dinner" }),
  ]),
  scene("bas-scene-morning", "Morning", "morning", [
    action("morning-curtains", "set-curtains", endpoint("curtains", 0), "Open curtains", { position: 100 }),
    action("morning-hvac", "set-hvac", endpoint("hvac", 0), "Morning comfort", { setpoint: 24 }),
    action("morning-appliance", "set-appliance", endpoint("appliances", 0), "Prepare coffee machine", { standby: true }),
  ]),
  scene("bas-scene-night", "Night", "night", [
    action("night-lights", "set-lighting", endpoint("lighting", 3), "Night pathway lighting", { brightness: 12 }),
    action("night-security", "set-security-mode", endpoint("security", 0), "Arm perimeter", { mode: "partial" }),
    action("night-water", "set-water", endpoint("water", 0), "Water safety monitor", { monitor: true }),
  ]),
  scene("bas-scene-away", "Away", "away", [
    action("away-security", "set-security-mode", endpoint("security", 1), "Arm away mode", { mode: "away" }),
    action("away-gate", "set-gate", endpoint("gate", 0), "Lock gate", { locked: true }),
    action("away-garage", "set-garage", endpoint("garage", 0), "Close garage", { closed: true }),
    action("away-energy", "notify", endpoint("energy", 0), "Energy saving active", { severity: "info" }),
  ]),
  scene("bas-scene-vacation", "Vacation", "vacation", [
    action("vacation-security", "set-security-mode", endpoint("security", 2), "Arm vacation mode", { mode: "vacation" }),
    action("vacation-garden", "set-garden", endpoint("garden", 0), "Irrigation schedule active", { schedule: "vacation" }),
    action("vacation-randomized", "set-lighting", endpoint("lighting", 4), "Randomized presence lighting", { randomized: true }),
  ]),
  scene("bas-scene-emergency", "Emergency", "emergency", [
    action("emergency-security", "set-security-mode", endpoint("security", 0), "Emergency security state", { mode: "emergency" }),
    action("emergency-water", "set-water", endpoint("water", 0), "Water fail-safe", { valve: "closed" }),
    action("emergency-notify", "notify", null, "Emergency notification", { severity: "critical" }),
  ]),
  scene("bas-scene-custom", "Custom Scene", "custom", [
    action("custom-placeholder", "notify", null, "Custom scene graph ready", { editable: true }),
  ], true),
] as const;

export function getBasScene(sceneId: string) {
  return BAS_SCENES.find((sceneItem) => sceneItem.id === sceneId) ?? null;
}
