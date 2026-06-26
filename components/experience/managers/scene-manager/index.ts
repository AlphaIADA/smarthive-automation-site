import { BaseManager } from "@/lib/experience/base-manager";
import type { ManagerContext } from "@/types/experience";

export class SceneManager extends BaseManager {
  private sceneId = "signature-villa";

  constructor(context: ManagerContext) {
    super("SceneManager", context);
  }

  getActiveScene(): string {
    return this.sceneId;
  }

  changeScene(sceneId: string): void {
    this.emit("SCENE_CHANGED", { sceneId });
  }

  protected onInitialize(): void {
    try {
      this.subscribe("SCENE_CHANGED", ({ sceneId }) => {
        this.sceneId = sceneId;
      });
    } catch (error) {
      this.degrade(error, "MANAGER_INITIALIZATION_FAILED");
    }
  }
}
