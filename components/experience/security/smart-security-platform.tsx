"use client";

import { SecurityRenderer } from "./generators/security-renderer";

export function SmartSecurityPlatform() {
  return (
    <group
      name="SmartHive Signature Villa Smart Security Platform"
      userData={{
        milestone: 9,
        system: "smart-security-platform",
        noAiAnalysis: true,
        noAutomationRules: true,
        noVoiceCommands: true,
        quotationEngine: "untouched",
        internalQuoteModel: true,
      }}
    >
      <SecurityRenderer />
    </group>
  );
}
