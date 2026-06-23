import type { EventBus } from "./event-bus";
import { toExperienceError } from "./errors";
import type { ExperiencePlugin } from "@/types/experience";

export class PluginRegistry {
  private readonly plugins = new Map<string, ExperiencePlugin>();

  constructor(private readonly eventBus: EventBus) {}

  register(plugin: ExperiencePlugin): boolean {
    if (this.plugins.has(plugin.id)) return false;
    try {
      plugin.register();
      this.plugins.set(plugin.id, plugin);
      this.eventBus.emit("PLUGIN_REGISTERED", { plugin });
      return true;
    } catch (error) {
      const typedError = toExperienceError(
        error,
        "PLUGIN_REGISTRATION_FAILED",
        `Plugin:${plugin.id}`,
      );
      this.eventBus.emit("MANAGER_ERROR", {
        manager: typedError.manager,
        code: typedError.code,
        message: typedError.message,
      });
      return false;
    }
  }

  registerAll(plugins: readonly ExperiencePlugin[]): number {
    return plugins.reduce((count, plugin) => count + Number(this.register(plugin)), 0);
  }

  getAll(): readonly ExperiencePlugin[] {
    return Array.from(this.plugins.values());
  }

  dispose(): void {
    this.plugins.forEach((plugin) => {
      try {
        plugin.dispose();
      } catch (error) {
        const typedError = toExperienceError(
          error,
          "PLUGIN_REGISTRATION_FAILED",
          `Plugin:${plugin.id}`,
        );
        this.eventBus.emit("MANAGER_ERROR", {
          manager: typedError.manager,
          code: typedError.code,
          message: typedError.message,
        });
      }
    });
    this.plugins.clear();
  }
}
