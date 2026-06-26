export type AiAssistantIntent =
  | "explain-room"
  | "explain-device"
  | "recommend-products"
  | "compare-products"
  | "estimate-installation"
  | "calculate-savings"
  | "explain-automation"
  | "find-devices"
  | "build-quote"
  | "visual-context";

export type AiKnowledgeDomain =
  | "rooms"
  | "devices"
  | "automation"
  | "lighting"
  | "security"
  | "energy"
  | "furniture"
  | "interior-design"
  | "quotes"
  | "packages";

export type AiVisualSelectionKind = "none" | "room" | "device";
export type AiRecommendationType = "missing-device" | "missing-sensor" | "missing-camera" | "missing-automation";
export type AiRecommendationPriority = "low" | "medium" | "high" | "critical";

export interface AiVisualContext {
  readonly kind: AiVisualSelectionKind;
  readonly id: string | null;
  readonly label: string;
}

export interface AiKnowledgeStats {
  readonly roomCount: number;
  readonly smartDeviceCount: number;
  readonly securityDeviceCount: number;
  readonly lightingEndpointCount: number;
  readonly automationEndpointCount: number;
  readonly automationRuleCount: number;
  readonly automationSceneCount: number;
  readonly automationScheduleCount: number;
  readonly furniturePlacementCount: number;
  readonly packageCount: number;
  readonly quotePackageCount: number;
  readonly knowledgeDomains: readonly AiKnowledgeDomain[];
}

export interface AiKnowledgePackage {
  readonly id: string;
  readonly name: string;
  readonly domain: AiKnowledgeDomain;
  readonly itemCount: number;
  readonly description: string;
  readonly quoteReady: boolean;
  readonly equipmentCost: number;
  readonly installationCost: number;
  readonly labourCost: number;
}

export interface AiProductRecommendation {
  readonly id: string;
  readonly type: AiRecommendationType;
  readonly title: string;
  readonly roomId: string | null;
  readonly roomName: string | null;
  readonly reason: string;
  readonly productCategory: string;
  readonly equipmentCost: number;
  readonly installationCost: number;
  readonly labourCost: number;
  readonly priority: AiRecommendationPriority;
}

export interface AiQuoteLineItem {
  readonly id: string;
  readonly name: string;
  readonly source: "package" | "ai-recommendation" | "room-context" | "device-context";
  readonly quantity: number;
  readonly equipmentCost: number;
  readonly installationCost: number;
  readonly labourCost: number;
  readonly totalCost: number;
  readonly reason: string;
}

export interface AiQuoteDraft {
  readonly id: string;
  readonly title: string;
  readonly currency: "USD";
  readonly lineItems: readonly AiQuoteLineItem[];
  readonly equipmentCost: number;
  readonly installationCost: number;
  readonly labourCost: number;
  readonly totalCost: number;
  readonly source: "experience-ai-internal-quote-builder";
  readonly existingQuotationEngineModified: false;
}

export interface AiSavingsEstimate {
  readonly baselineMonthlyCostUsd: number;
  readonly optimizedMonthlyCostUsd: number;
  readonly monthlySavingsUsd: number;
  readonly yearlySavingsUsd: number;
  readonly savingsPercent: number;
  readonly assumptions: readonly string[];
}

export interface AiAssistantResponse {
  readonly id: string;
  readonly query: string;
  readonly intent: AiAssistantIntent;
  readonly title: string;
  readonly summary: string;
  readonly bullets: readonly string[];
  readonly entities: readonly string[];
  readonly recommendations: readonly AiProductRecommendation[];
  readonly quoteDraft: AiQuoteDraft | null;
  readonly savingsEstimate: AiSavingsEstimate | null;
  readonly confidence: number;
  readonly visualContext: AiVisualContext;
  readonly voiceReady: true;
}

export interface AiAssistantReport {
  readonly knowledgeStats: AiKnowledgeStats;
  readonly recommendationCount: number;
  readonly quoteDraft: AiQuoteDraft;
  readonly savingsEstimate: AiSavingsEstimate;
  readonly capabilities: {
    readonly explainEveryRoom: true;
    readonly explainEveryDevice: true;
    readonly explainAutomation: true;
    readonly findDevices: true;
    readonly recommendProducts: true;
    readonly compareProducts: true;
    readonly estimateInstallation: true;
    readonly calculateSavings: true;
    readonly visualAiReady: true;
    readonly voiceReady: true;
    readonly aiQuoteBuilder: true;
  };
  readonly constraints: {
    readonly externalQuotationEngine: "untouched";
    readonly api: "untouched";
    readonly database: "untouched";
    readonly authentication: "untouched";
    readonly externalLlmProvider: "not-required";
  };
}
