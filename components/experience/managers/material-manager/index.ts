import { BaseManager } from "@/lib/experience/base-manager";
import type { ManagerContext } from "@/types/experience";

export class MaterialManager extends BaseManager {
  private activeMaterialId = "signature-villa-pbr";

  constructor(context: ManagerContext) {
    super("MaterialManager", context);
  }

  getActiveMaterialId(): string {
    return this.activeMaterialId;
  }

  protected onInitialize(): void {
    try {
      this.subscribe("MATERIAL_CHANGED", ({ materialId }) => {
        this.activeMaterialId = materialId;
      });
    } catch (error) {
      this.degrade(error, "MANAGER_INITIALIZATION_FAILED");
    }
  }
}
