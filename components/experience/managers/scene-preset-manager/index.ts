import { BaseManager } from "@/lib/experience/base-manager";
import type { ManagerContext } from "@/types/experience";

export class ScenePresetManager extends BaseManager {
  private presetId = "signature-villa-day";

  constructor(context: ManagerContext) {
    super("ScenePresetManager", context);
  }

  getPresetId(): string {
    return this.presetId;
  }

  protected onInitialize(): void {
    try {
      this.subscribe("PRESET_CHANGED", ({ presetId }) => {
        this.presetId = presetId;
      });
    } catch (error) {
      this.degrade(error, "MANAGER_INITIALIZATION_FAILED");
    }
  }
}
