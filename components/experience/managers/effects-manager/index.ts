import { BaseManager } from "@/lib/experience/base-manager";
import type { ManagerContext } from "@/types/experience";

export class EffectsManager extends BaseManager {
  private enabled = false;

  constructor(context: ManagerContext) {
    super("EffectsManager", context);
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  protected onInitialize(): void {
    try {
      this.subscribe("EFFECTS_CHANGED", ({ enabled }) => {
        this.enabled = enabled;
      });
    } catch (error) {
      this.degrade(error, "MANAGER_INITIALIZATION_FAILED");
    }
  }
}
