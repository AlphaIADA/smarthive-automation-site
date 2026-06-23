import { BaseManager } from "@/lib/experience/base-manager";
import type { ManagerContext } from "@/types/experience";

export class DebugManager extends BaseManager {
  private visible = false;

  constructor(context: ManagerContext) {
    super("DebugManager", context);
  }

  isVisible(): boolean {
    return this.visible;
  }

  protected onInitialize(): void {
    try {
      this.subscribe("DEBUG_TOGGLE", ({ visible }) => {
        this.visible = visible;
      });
    } catch (error) {
      this.degrade(error, "MANAGER_INITIALIZATION_FAILED");
    }
  }
}
