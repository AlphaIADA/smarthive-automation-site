import { BaseManager } from "@/lib/experience/base-manager";
import type { ManagerContext } from "@/types/experience";

export class AudioManager extends BaseManager {
  private muted = true;

  constructor(context: ManagerContext) {
    super("AudioManager", context);
  }

  isMuted(): boolean {
    return this.muted;
  }

  protected onInitialize(): void {
    try {
      this.subscribe("AUDIO_CHANGED", ({ muted }) => {
        this.muted = muted;
      });
    } catch (error) {
      this.degrade(error, "MANAGER_INITIALIZATION_FAILED");
    }
  }
}
