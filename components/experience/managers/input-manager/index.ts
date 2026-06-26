import { BaseManager } from "@/lib/experience/base-manager";
import type { ImmersiveInputSource, ManagerContext } from "@/types/experience";

type InputSource = "pointer" | ImmersiveInputSource;

export class InputManager extends BaseManager {
  private source: InputSource = "pointer";

  constructor(context: ManagerContext) {
    super("InputManager", context);
  }

  getLastInputSource(): InputSource {
    return this.source;
  }

  protected onInitialize(): void {
    try {
      this.subscribe("INPUT_CHANGED", ({ source }) => {
        this.source = source;
      });
    } catch (error) {
      this.degrade(error, "MANAGER_INITIALIZATION_FAILED");
    }
  }
}
