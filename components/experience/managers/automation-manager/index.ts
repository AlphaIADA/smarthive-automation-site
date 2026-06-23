import { BaseManager } from "@/lib/experience/base-manager";
import type { ManagerContext } from "@/types/experience";

export class AutomationManager extends BaseManager {
  private lastRequestId: string | null = null;

  constructor(context: ManagerContext) {
    super("AutomationManager", context);
  }

  getLastRequestId(): string | null {
    return this.lastRequestId;
  }

  protected onInitialize(): void {
    try {
      this.subscribe("AUTOMATION_REQUESTED", ({ automationId }) => {
        this.lastRequestId = automationId;
      });
    } catch (error) {
      this.degrade(error, "MANAGER_INITIALIZATION_FAILED");
    }
  }
}
