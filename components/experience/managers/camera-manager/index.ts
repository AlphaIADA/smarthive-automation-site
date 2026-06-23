import { BaseManager } from "@/lib/experience/base-manager";
import type { CameraPresetId, ManagerContext } from "@/types/experience";

export class CameraManager extends BaseManager {
  private preset: CameraPresetId = "default";

  constructor(context: ManagerContext) {
    super("CameraManager", context);
  }

  getPreset(): CameraPresetId {
    return this.preset;
  }

  changePreset(preset: CameraPresetId): void {
    this.emit("CAMERA_CHANGED", { preset });
  }

  protected onInitialize(): void {
    try {
      this.subscribe("CAMERA_CHANGED", ({ preset }) => {
        this.preset = preset;
      });
    } catch (error) {
      this.degrade(error, "MANAGER_INITIALIZATION_FAILED");
    }
  }
}
