import { BaseManager } from "@/lib/experience/base-manager";
import type { ManagerContext } from "@/types/experience";

export class DeviceManager extends BaseManager {
  private selectedDeviceId: string | null = null;

  constructor(context: ManagerContext) {
    super("DeviceManager", context);
  }

  getSelectedDeviceId(): string | null {
    return this.selectedDeviceId;
  }

  protected onInitialize(): void {
    try {
      this.subscribe("DEVICE_SELECTED", ({ deviceId }) => {
        this.selectedDeviceId = deviceId;
      });
    } catch (error) {
      this.degrade(error, "MANAGER_INITIALIZATION_FAILED");
    }
  }
}
