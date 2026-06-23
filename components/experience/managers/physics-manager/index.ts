import { BaseManager } from "@/lib/experience/base-manager";
import type { ManagerContext } from "@/types/experience";

export class PhysicsManager extends BaseManager {
  private enabled = false;

  constructor(context: ManagerContext) {
    super("PhysicsManager", context);
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  protected onInitialize(): void {
    try {
      this.subscribe("PHYSICS_CHANGED", ({ enabled }) => {
        this.enabled = enabled;
      });
    } catch (error) {
      this.degrade(error, "MANAGER_INITIALIZATION_FAILED");
    }
  }
}
