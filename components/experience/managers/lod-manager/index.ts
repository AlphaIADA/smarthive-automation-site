import { BaseManager } from "@/lib/experience/base-manager";
import type { ManagerContext } from "@/types/experience";

export class LODManager extends BaseManager {
  private level = 0;

  constructor(context: ManagerContext) {
    super("LODManager", context);
  }

  getLevel(): number {
    return this.level;
  }

  protected onInitialize(): void {
    try {
      this.subscribe("LOD_CHANGED", ({ level }) => {
        this.level = Math.max(0, Math.round(level));
      });
      this.subscribe("PERFORMANCE_UPDATED", ({ fps }) => {
        const nextLevel = fps > 0 && fps < 40 ? 2 : fps > 0 && fps < 52 ? 1 : 0;
        if (nextLevel !== this.level) this.emit("LOD_CHANGED", { level: nextLevel });
      });
    } catch (error) {
      this.degrade(error, "MANAGER_INITIALIZATION_FAILED");
    }
  }
}
