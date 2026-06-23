export type PluginCategory =
  | "lighting"
  | "security"
  | "comfort"
  | "exterior"
  | "energy"
  | "access"
  | "utilities"
  | "assistant"
  | "camera"
  | "analytics";

export type PluginStatus = "planned" | "registered" | "enabled" | "disabled";

export interface ExperiencePluginManifest {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly category: PluginCategory;
  readonly description: string;
  readonly status: PluginStatus;
  readonly enabledByDefault: boolean;
}

export interface ExperiencePlugin extends ExperiencePluginManifest {
  register(): void;
  dispose(): void;
}
