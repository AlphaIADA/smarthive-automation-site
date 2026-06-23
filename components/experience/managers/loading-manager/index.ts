import { BaseManager } from "@/lib/experience/base-manager";
import type { ManagerContext } from "@/types/experience";

export class LoadingManager extends BaseManager {
  private state = { loading: false, progress: 100, label: "Ready" };

  constructor(context: ManagerContext) {
    super("LoadingManager", context);
  }

  getLoadingState(): Readonly<typeof this.state> {
    return this.state;
  }

  protected onInitialize(): void {
    try {
      this.subscribe("LOADING_CHANGED", (state) => {
        this.state = state;
      });
    } catch (error) {
      this.degrade(error, "MANAGER_INITIALIZATION_FAILED");
    }
  }
}
