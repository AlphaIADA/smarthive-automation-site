import type { EventBus } from "@/lib/experience/event-bus";

export type ManagerStatus = "idle" | "initializing" | "ready" | "degraded" | "disposed";

export interface ManagerContext {
  readonly eventBus: EventBus;
}

export interface ManagerPublicApi {
  readonly name: string;
  initialize(): Promise<void>;
  dispose(): Promise<void>;
  getStatus(): ManagerStatus;
}
