import { BaseManager } from "@/lib/experience/base-manager";
import type { ManagerContext } from "@/types/experience";

export class EnvironmentManager extends BaseManager {
  private environmentId = "foundation-sky";

  constructor(context: ManagerContext) {
    super("EnvironmentManager", context);
  }

  getEnvironmentId(): string {
    return this.environmentId;
  }

  protected onInitialize(): void {
    try {
      this.subscribe("ENVIRONMENT_CHANGED", ({ environmentId }) => {
        this.environmentId = environmentId;
      });
    } catch (error) {
      this.degrade(error, "MANAGER_INITIALIZATION_FAILED");
    }
  }
}
