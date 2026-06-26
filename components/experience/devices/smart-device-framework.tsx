"use client";

import type { EventBus } from "@/lib/experience/event-bus";
import { DevicePlaceholderRenderer } from "./generators/device-placeholder-renderer";

export function SmartDeviceFramework({ eventBus }: { readonly eventBus: EventBus }) {
  return (
    <group name="SmartHive Signature Villa Smart Device Framework">
      <DevicePlaceholderRenderer eventBus={eventBus} />
    </group>
  );
}
