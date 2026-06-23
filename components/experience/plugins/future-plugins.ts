import type { ExperiencePlugin, PluginCategory } from "@/types/experience";

interface PlannedPluginDefinition {
  readonly id: string;
  readonly name: string;
  readonly category: PluginCategory;
  readonly description: string;
}

function createPlannedPlugin(definition: PlannedPluginDefinition): ExperiencePlugin {
  return {
    ...definition,
    version: "0.0.0-foundation",
    status: "planned",
    enabledByDefault: false,
    register: () => undefined,
    dispose: () => undefined,
  };
}

const PLANNED_PLUGIN_DEFINITIONS: readonly PlannedPluginDefinition[] = [
  { id: "lighting", name: "Lighting", category: "lighting", description: "Smart lighting orchestration." },
  { id: "security", name: "Security", category: "security", description: "Security zones and alarm state." },
  { id: "curtains", name: "Curtains", category: "comfort", description: "Curtain and blind positioning." },
  { id: "hvac", name: "HVAC", category: "comfort", description: "Heating and cooling control." },
  { id: "pool", name: "Pool", category: "exterior", description: "Pool systems and telemetry." },
  { id: "garden", name: "Garden", category: "exterior", description: "Garden lighting and irrigation." },
  { id: "solar", name: "Solar", category: "energy", description: "Solar production monitoring." },
  { id: "energy", name: "Energy", category: "energy", description: "Whole-home energy analytics." },
  { id: "garage", name: "Garage", category: "access", description: "Garage access and state." },
  { id: "gate", name: "Gate", category: "access", description: "Gate access and automation." },
  { id: "water", name: "Water", category: "utilities", description: "Water use and leak detection." },
  { id: "voice-assistant", name: "Voice Assistant", category: "assistant", description: "Voice interface integration." },
  { id: "ai-assistant", name: "AI Assistant", category: "assistant", description: "Future intelligent assistance." },
  { id: "camera-system", name: "Camera System", category: "camera", description: "Camera feeds and viewpoints." },
  { id: "analytics", name: "Analytics", category: "analytics", description: "Experience and system analytics." },
] as const;

export const FUTURE_PLUGINS: readonly ExperiencePlugin[] =
  PLANNED_PLUGIN_DEFINITIONS.map(createPlannedPlugin);
