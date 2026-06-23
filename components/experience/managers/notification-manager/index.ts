import { v4 as createId } from "uuid";
import { BaseManager } from "@/lib/experience/base-manager";
import type { ManagerContext } from "@/types/experience";

type NotificationTone = "info" | "success" | "warning" | "error";

export class NotificationManager extends BaseManager {
  private notificationCount = 0;

  constructor(context: ManagerContext) {
    super("NotificationManager", context);
  }

  getNotificationCount(): number {
    return this.notificationCount;
  }

  notify(message: string, tone: NotificationTone = "info"): void {
    this.emit("NOTIFICATION_PUSHED", { id: createId(), message, tone });
  }

  protected onInitialize(): void {
    try {
      this.subscribe("NOTIFICATION_PUSHED", () => {
        this.notificationCount += 1;
      });
    } catch (error) {
      this.degrade(error, "MANAGER_INITIALIZATION_FAILED");
    }
  }
}
