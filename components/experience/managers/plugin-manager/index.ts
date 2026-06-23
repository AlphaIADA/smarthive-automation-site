import { BaseManager } from "@/lib/experience/base-manager";
import type { ManagerContext } from "@/types/experience";

export class PluginManager extends BaseManager {
  private readonly enabledPlugins = new Set<string>();

  constructor(context: ManagerContext) {
    super("PluginManager", context);
  }

  isEnabled(pluginId: string): boolean {
    return this.enabledPlugins.has(pluginId);
  }

  setEnabled(pluginId: string, enabled: boolean): void {
    this.emit("PLUGIN_TOGGLED", { pluginId, enabled });
  }

  protected onInitialize(): void {
    try {
      this.subscribe("PLUGIN_TOGGLED", ({ pluginId, enabled }) => {
        if (enabled) this.enabledPlugins.add(pluginId);
        else this.enabledPlugins.delete(pluginId);
      });
    } catch (error) {
      this.degrade(error, "MANAGER_INITIALIZATION_FAILED");
    }
  }
}
