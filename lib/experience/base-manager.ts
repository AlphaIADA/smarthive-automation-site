import type { EventUnsubscribe } from "./event-bus";
import { toExperienceError } from "./errors";
import type {
  ExperienceEventMap,
  ExperienceEventName,
  ManagerContext,
  ManagerPublicApi,
  ManagerStatus,
} from "@/types/experience";

export abstract class BaseManager implements ManagerPublicApi {
  private status: ManagerStatus = "idle";
  private readonly unsubscribers: EventUnsubscribe[] = [];

  protected constructor(
    public readonly name: string,
    protected readonly context: ManagerContext,
  ) {}

  async initialize(): Promise<void> {
    if (this.status === "ready") return;
    this.status = "initializing";
    try {
      await this.onInitialize();
      if (this.getStatus() !== "degraded") this.status = "ready";
      this.context.eventBus.emit("MANAGER_READY", { manager: this.name });
    } catch (error) {
      this.degrade(error, "MANAGER_INITIALIZATION_FAILED");
    }
  }

  async dispose(): Promise<void> {
    try {
      await this.onDispose();
      this.unsubscribers.splice(0).forEach((unsubscribe) => unsubscribe());
      this.status = "disposed";
    } catch (error) {
      this.degrade(error, "MANAGER_DISPOSAL_FAILED");
    }
  }

  getStatus(): ManagerStatus {
    return this.status;
  }

  protected subscribe<EventName extends ExperienceEventName>(
    eventName: EventName,
    handler: (payload: ExperienceEventMap[EventName]) => void,
  ): void {
    this.unsubscribers.push(this.context.eventBus.subscribe(eventName, (payload) => {
      try {
        handler(payload);
      } catch (error) {
        this.degrade(error, "MANAGER_INITIALIZATION_FAILED");
      }
    }));
  }

  protected emit<EventName extends ExperienceEventName>(
    eventName: EventName,
    payload: ExperienceEventMap[EventName],
  ): void {
    this.context.eventBus.emit(eventName, payload);
  }

  protected degrade(
    error: unknown,
    code: "MANAGER_INITIALIZATION_FAILED" | "MANAGER_DISPOSAL_FAILED",
  ): void {
    const typedError = toExperienceError(error, code, this.name);
    this.status = "degraded";
    this.context.eventBus.emit("MANAGER_ERROR", {
      manager: this.name,
      code: typedError.code,
      message: typedError.message,
    });
  }

  protected abstract onInitialize(): void | Promise<void>;

  protected onDispose(): void | Promise<void> {}
}
