import { BaseManager } from "@/lib/experience/base-manager";
import type { ManagerContext } from "@/types/experience";

type ExperienceTheme = "dark" | "light";

export class ThemeManager extends BaseManager {
  private theme: ExperienceTheme = "dark";

  constructor(context: ManagerContext) {
    super("ThemeManager", context);
  }

  getTheme(): ExperienceTheme {
    return this.theme;
  }

  protected onInitialize(): void {
    try {
      this.subscribe("THEME_CHANGED", ({ theme }) => {
        this.theme = theme;
      });
    } catch (error) {
      this.degrade(error, "MANAGER_INITIALIZATION_FAILED");
    }
  }
}
