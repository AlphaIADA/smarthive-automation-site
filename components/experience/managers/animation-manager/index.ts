import { BaseManager } from "@/lib/experience/base-manager";
import type { ManagerContext } from "@/types/experience";

export class AnimationManager extends BaseManager {
  private lastAnimationId: string | null = null;

  constructor(context: ManagerContext) {
    super("AnimationManager", context);
  }

  getLastAnimationId(): string | null {
    return this.lastAnimationId;
  }

  protected onInitialize(): void {
    try {
      this.subscribe("ANIMATION_REQUESTED", ({ animationId }) => {
        this.lastAnimationId = animationId;
      });
    } catch (error) {
      this.degrade(error, "MANAGER_INITIALIZATION_FAILED");
    }
  }
}
