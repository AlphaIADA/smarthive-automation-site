import { BaseManager } from "@/lib/experience/base-manager";
import type { ManagerContext } from "@/types/experience";

export class LightingManager extends BaseManager {
  private readonly lightStates = new Map<string, boolean>();

  constructor(context: ManagerContext) {
    super("LightingManager", context);
  }

  isEnabled(lightId: string): boolean {
    return this.lightStates.get(lightId) ?? false;
  }

  toggle(lightId: string, enabled: boolean): void {
    this.emit("LIGHT_TOGGLE", { lightId, enabled });
  }

  protected onInitialize(): void {
    try {
      this.subscribe("LIGHT_TOGGLE", ({ lightId, enabled }) => {
        this.lightStates.set(lightId, enabled);
      });
    } catch (error) {
      this.degrade(error, "MANAGER_INITIALIZATION_FAILED");
    }
  }
}
