export type BasDomain =
  | "lighting"
  | "curtains"
  | "hvac"
  | "audio"
  | "security"
  | "energy"
  | "pool"
  | "garden"
  | "garage"
  | "gate"
  | "water"
  | "appliances"
  | "future-devices";

export type BasEndpointSource = "smart-device-framework" | "lighting-engine" | "security-platform" | "room-registry" | "bas-virtual";
export type BasEndpointStatus = "online" | "offline" | "degraded" | "virtual";
export type BasLogicOperator = "if" | "else" | "and" | "or" | "not";
export type BasTemporalOperator = "delay" | "timer" | "schedule" | "sunrise" | "sunset";
export type BasConditionKind =
  | "presence"
  | "absence"
  | "device-state"
  | "sensor-state"
  | "weather"
  | "temperature"
  | "humidity"
  | "power-consumption"
  | "battery-level"
  | "internet-status"
  | "time";
export type BasActionKind =
  | "set-device-state"
  | "set-lighting"
  | "set-curtains"
  | "set-hvac"
  | "set-audio"
  | "set-security-mode"
  | "set-pool"
  | "set-garden"
  | "set-garage"
  | "set-gate"
  | "set-water"
  | "set-appliance"
  | "notify"
  | "fail-safe";
export type BasGraphNodeType = "trigger" | "condition" | "logic" | "delay" | "timer" | "schedule" | "action" | "fail-safe";
export type BasRuleStatus = "enabled" | "disabled" | "degraded";
export type BasSceneType = "movie" | "party" | "dinner" | "morning" | "night" | "away" | "vacation" | "emergency" | "custom";
export type BasScheduleType = "cron" | "calendar" | "weekly" | "monthly" | "yearly" | "holiday" | "randomized";
export type BasFailSafeStrategy = "skip-action" | "fallback-state" | "notify-only" | "retry-once" | "disable-rule";
export type BasExecutionStatus = "success" | "skipped" | "failed-gracefully";

export interface BasEndpoint {
  readonly id: string;
  readonly name: string;
  readonly domain: BasDomain;
  readonly source: BasEndpointSource;
  readonly sourceId: string;
  readonly roomId: string | null;
  readonly roomName: string | null;
  readonly status: BasEndpointStatus;
  readonly capabilities: readonly BasActionKind[];
  readonly telemetry: {
    readonly powerWatts?: number;
    readonly batteryPercent?: number | null;
    readonly signalStrength?: number;
    readonly temperatureC?: number;
    readonly humidityPercent?: number;
  };
  readonly futureReady: true;
}

export interface BasTrigger {
  readonly id: string;
  readonly label: string;
  readonly kind: BasConditionKind | BasTemporalOperator;
  readonly endpointId?: string;
  readonly expression: string;
}

export interface BasConditionExpression {
  readonly id: string;
  readonly operator: BasLogicOperator | BasConditionKind | BasTemporalOperator;
  readonly label: string;
  readonly endpointId?: string;
  readonly comparator?: "equals" | "not-equals" | "greater-than" | "less-than" | "contains" | "online" | "offline";
  readonly value?: string | number | boolean;
  readonly children?: readonly BasConditionExpression[];
  readonly elseBranch?: readonly BasAction[];
}

export interface BasAction {
  readonly id: string;
  readonly kind: BasActionKind;
  readonly endpointId: string | null;
  readonly label: string;
  readonly payload: Readonly<Record<string, string | number | boolean>>;
  readonly failSafeStrategy: BasFailSafeStrategy;
}

export interface BasRule {
  readonly id: string;
  readonly name: string;
  readonly status: BasRuleStatus;
  readonly unlimitedRuleEngineReady: true;
  readonly trigger: BasTrigger;
  readonly condition: BasConditionExpression;
  readonly actions: readonly BasAction[];
  readonly failSafe: {
    readonly strategy: BasFailSafeStrategy;
    readonly fallbackActionId: string;
    readonly gracefulFailure: true;
  };
  readonly graphId: string;
}

export interface BasGraphNode {
  readonly id: string;
  readonly type: BasGraphNodeType;
  readonly label: string;
  readonly position: readonly [number, number];
  readonly endpointId?: string | null;
  readonly ruleId: string;
}

export interface BasGraphEdge {
  readonly id: string;
  readonly from: string;
  readonly to: string;
  readonly label: string;
}

export interface BasAutomationGraph {
  readonly id: string;
  readonly ruleId: string;
  readonly visualEditorReady: true;
  readonly nodes: readonly BasGraphNode[];
  readonly edges: readonly BasGraphEdge[];
}

export interface BasScene {
  readonly id: string;
  readonly name: string;
  readonly type: BasSceneType;
  readonly actions: readonly BasAction[];
  readonly graphReady: true;
  readonly customEditable: boolean;
}

export interface BasSchedule {
  readonly id: string;
  readonly name: string;
  readonly type: BasScheduleType;
  readonly expression: string;
  readonly targetRuleId: string | null;
  readonly targetSceneId: string | null;
  readonly randomizedWindowMinutes?: number;
  readonly holidayCalendarReady: boolean;
}

export interface BasRuntimeContext {
  readonly currentTime: string;
  readonly internetOnline: boolean;
  readonly weather: "clear" | "cloudy" | "rain" | "wind";
  readonly temperatureC: number;
  readonly humidityPercent: number;
  readonly presence: readonly string[];
  readonly absentRooms: readonly string[];
  readonly powerConsumptionWatts: number;
}

export interface BasExecutionResult {
  readonly ruleId: string;
  readonly status: BasExecutionStatus;
  readonly matched: boolean;
  readonly actionCount: number;
  readonly skippedActionIds: readonly string[];
  readonly failSafeApplied: boolean;
  readonly message: string;
}

export interface BasSystemReport {
  readonly endpointCount: number;
  readonly smartDeviceEndpointCount: number;
  readonly lightingEndpointCount: number;
  readonly securityEndpointCount: number;
  readonly virtualEndpointCount: number;
  readonly domainsCovered: readonly BasDomain[];
  readonly logicOperatorsCovered: readonly BasLogicOperator[];
  readonly temporalOperatorsCovered: readonly BasTemporalOperator[];
  readonly conditionKindsCovered: readonly BasConditionKind[];
  readonly actionKindsCovered: readonly BasActionKind[];
  readonly ruleCount: number;
  readonly graphCount: number;
  readonly sceneCount: number;
  readonly scheduleCount: number;
  readonly failSafeCoveragePercent: number;
  readonly constraints: {
    readonly ai: "excluded";
    readonly externalApiRoutes: "untouched";
    readonly database: "untouched";
    readonly authentication: "untouched";
  };
}
