import { BaseManager } from "@/lib/experience/base-manager";
import type { ManagerContext, PerformanceSnapshot } from "@/types/experience";

export class PerformanceManager extends BaseManager {
  private snapshot: PerformanceSnapshot | null = null;

  constructor(context: ManagerContext) {
    super("PerformanceManager", context);
  }

  getSnapshot(): PerformanceSnapshot | null {
    return this.snapshot;
  }

  protected onInitialize(): void {
    try {
      this.subscribe("PERFORMANCE_UPDATED", (snapshot) => {
        this.snapshot = snapshot;
      });
    } catch (error) {
      this.degrade(error, "MANAGER_INITIALIZATION_FAILED");
    }
  }
}
