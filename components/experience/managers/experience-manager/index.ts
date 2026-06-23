import { BaseManager } from "@/lib/experience/base-manager";
import type { ManagerContext } from "@/types/experience";

export class ExperienceManager extends BaseManager {
  private runtimeErrors = 0;

  constructor(context: ManagerContext) {
    super("ExperienceManager", context);
  }

  getErrorCount(): number {
    return this.runtimeErrors;
  }

  protected onInitialize(): void {
    try {
      this.subscribe("MANAGER_ERROR", () => {
        this.runtimeErrors += 1;
      });
    } catch (error) {
      this.degrade(error, "MANAGER_INITIALIZATION_FAILED");
    }
  }
}
