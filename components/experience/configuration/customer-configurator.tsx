"use client";

import type { EventBus } from "@/lib/experience/event-bus";
import { ConfigurationRenderer } from "./generators/configuration-renderer";

export function CustomerConfigurator({ eventBus }: { readonly eventBus: EventBus }) {
  return (
    <group
      name="SmartHive Customer Configuration Platform"
      userData={{
        milestone: 14,
        system: "customer-configuration-platform",
        clickDevicesToConfigure: true,
        realTimeCosting: true,
        packageComparison: true,
        saveDesignPayload: true,
        proposalReady: true,
        pdfPayloadReady: true,
        crmLeadPayloadReady: true,
        externalPdfEngine: "untouched",
        externalCrm: "untouched",
        api: "untouched",
        database: "untouched",
      }}
    >
      <ConfigurationRenderer eventBus={eventBus} />
    </group>
  );
}
