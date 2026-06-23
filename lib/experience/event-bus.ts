import type {
  ExperienceEventMap,
  ExperienceEventName,
} from "@/types/experience";

type UnknownHandler = (payload: unknown) => void;
export type EventUnsubscribe = () => void;

export class EventBus {
  private readonly listeners = new Map<ExperienceEventName, Set<UnknownHandler>>();

  subscribe<EventName extends ExperienceEventName>(
    eventName: EventName,
    handler: (payload: ExperienceEventMap[EventName]) => void,
  ): EventUnsubscribe {
    const wrappedHandler: UnknownHandler = (payload) => {
      handler(payload as ExperienceEventMap[EventName]);
    };
    const handlers = this.listeners.get(eventName) ?? new Set<UnknownHandler>();
    handlers.add(wrappedHandler);
    this.listeners.set(eventName, handlers);

    return () => {
      handlers.delete(wrappedHandler);
      if (handlers.size === 0) this.listeners.delete(eventName);
    };
  }

  emit<EventName extends ExperienceEventName>(
    eventName: EventName,
    payload: ExperienceEventMap[EventName],
  ): void {
    const handlers = this.listeners.get(eventName);
    if (!handlers) return;
    handlers.forEach((handler) => handler(payload));
  }

  clear(): void {
    this.listeners.clear();
  }

  listenerCount(eventName?: ExperienceEventName): number {
    if (eventName) return this.listeners.get(eventName)?.size ?? 0;
    return Array.from(this.listeners.values()).reduce(
      (total, handlers) => total + handlers.size,
      0,
    );
  }
}
