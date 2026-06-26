"use client";

import { SecurityOperationsRenderer } from "./generators/security-operations-renderer";

export function SecurityOperationsCenter() {
  return (
    <group
      name="SmartHive Signature Villa Security Operations Center"
      userData={{
        milestone: 12,
        system: "security-operations-center",
        commandCenter: true,
        liveMap: true,
        everyEventBecomesIncident: true,
        quoteEngine: "untouched",
        internalSocRecommendations: true,
      }}
    >
      <SecurityOperationsRenderer />
    </group>
  );
}
