import type { SecurityNotificationSpec, SecurityNotificationType } from "@/types/experience";
import { SECURITY_NOTIFICATIONS } from "./security-catalog";

export interface SecurityNotificationFilters {
  readonly type: SecurityNotificationType | "all";
  readonly severity: SecurityNotificationSpec["severity"] | "all";
  readonly acknowledged: boolean | "all";
}

export const DEFAULT_SECURITY_NOTIFICATION_FILTERS: SecurityNotificationFilters = {
  type: "all",
  severity: "all",
  acknowledged: "all",
};

export function filterSecurityNotifications(
  notifications: readonly SecurityNotificationSpec[] = SECURITY_NOTIFICATIONS,
  filters: SecurityNotificationFilters = DEFAULT_SECURITY_NOTIFICATION_FILTERS,
) {
  return notifications.filter((notification) => {
    const matchesType = filters.type === "all" || notification.type === filters.type;
    const matchesSeverity = filters.severity === "all" || notification.severity === filters.severity;
    const matchesAcknowledged = filters.acknowledged === "all" || notification.acknowledged === filters.acknowledged;
    return matchesType && matchesSeverity && matchesAcknowledged;
  });
}

export function summarizeSecurityNotifications(notifications: readonly SecurityNotificationSpec[] = SECURITY_NOTIFICATIONS) {
  return {
    total: notifications.length,
    critical: notifications.filter((notification) => notification.severity === "critical").length,
    warning: notifications.filter((notification) => notification.severity === "warning").length,
    info: notifications.filter((notification) => notification.severity === "info").length,
    unacknowledged: notifications.filter((notification) => !notification.acknowledged).length,
  };
}
