import { BaseManager } from "@/lib/experience/base-manager";
import type { ManagerContext } from "@/types/experience";

type MemoryPressure = "normal" | "warning" | "critical";

export class MemoryManager extends BaseManager {
  private pressure: MemoryPressure = "normal";

  constructor(context: ManagerContext) {
    super("MemoryManager", context);
  }

  getPressure(): MemoryPressure {
    return this.pressure;
  }

  protected onInitialize(): void {
    try {
      this.subscribe("MEMORY_PRESSURE", ({ level }) => {
        this.pressure = level;
      });
      this.subscribe("PERFORMANCE_UPDATED", ({ memoryMb }) => {
        if (memoryMb === null) return;
        const level: MemoryPressure = memoryMb >= 600 ? "critical" : memoryMb >= 350 ? "warning" : "normal";
        if (level !== this.pressure) this.emit("MEMORY_PRESSURE", { level });
      });
    } catch (error) {
      this.degrade(error, "MANAGER_INITIALIZATION_FAILED");
    }
  }
}
