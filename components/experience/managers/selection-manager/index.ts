import { BaseManager } from "@/lib/experience/base-manager";
import type { ManagerContext } from "@/types/experience";

type SelectionKind = "none" | "room" | "device";

export class SelectionManager extends BaseManager {
  private selection: { kind: SelectionKind; id: string | null } = { kind: "none", id: null };

  constructor(context: ManagerContext) {
    super("SelectionManager", context);
  }

  getSelection(): Readonly<{ kind: SelectionKind; id: string | null }> {
    return this.selection;
  }

  select(kind: SelectionKind, id: string | null): void {
    this.emit("SELECTION_CHANGED", { kind, id });
  }

  protected onInitialize(): void {
    try {
      this.subscribe("SELECTION_CHANGED", (selection) => {
        this.selection = selection;
      });
    } catch (error) {
      this.degrade(error, "MANAGER_INITIALIZATION_FAILED");
    }
  }
}
