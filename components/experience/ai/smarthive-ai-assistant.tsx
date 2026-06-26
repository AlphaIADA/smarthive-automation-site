"use client";

import { AiAssistantRenderer } from "./generators/ai-assistant-renderer";

export function SmartHiveAiAssistant() {
  return (
    <group
      name="SmartHive AI Assistant"
      userData={{
        milestone: 13,
        system: "smarthive-ai-assistant",
        understandsDigitalTwin: true,
        visualAiReady: true,
        voiceReady: true,
        quoteEngine: "untouched",
        internalAiQuoteBuilder: true,
        externalLlmProvider: "not-required",
      }}
    >
      <AiAssistantRenderer />
    </group>
  );
}
