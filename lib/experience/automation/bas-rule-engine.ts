import type {
  BasAction,
  BasActionKind,
  BasAutomationGraph,
  BasConditionExpression,
  BasConditionKind,
  BasExecutionResult,
  BasLogicOperator,
  BasRuntimeContext,
  BasRule,
  BasTemporalOperator,
} from "@/types/experience";
import { BAS_ENDPOINTS, getBasEndpoint } from "./bas-registry";

export const BAS_LOGIC_OPERATORS: readonly BasLogicOperator[] = ["if", "else", "and", "or", "not"] as const;
export const BAS_TEMPORAL_OPERATORS: readonly BasTemporalOperator[] = ["delay", "timer", "schedule", "sunrise", "sunset"] as const;
export const BAS_CONDITION_KINDS: readonly BasConditionKind[] = [
  "presence",
  "absence",
  "device-state",
  "sensor-state",
  "weather",
  "temperature",
  "humidity",
  "power-consumption",
  "battery-level",
  "internet-status",
  "time",
] as const;
export const BAS_ACTION_KINDS: readonly BasActionKind[] = [
  "set-device-state",
  "set-lighting",
  "set-curtains",
  "set-hvac",
  "set-audio",
  "set-security-mode",
  "set-pool",
  "set-garden",
  "set-garage",
  "set-gate",
  "set-water",
  "set-appliance",
  "notify",
  "fail-safe",
] as const;

export const DEFAULT_BAS_CONTEXT: BasRuntimeContext = {
  currentTime: "18:30",
  internetOnline: true,
  weather: "clear",
  temperatureC: 28,
  humidityPercent: 62,
  presence: ["gf-foyer", "gf-formal-living", "gf-family-lounge"],
  absentRooms: ["gf-cinema", "ff-master-bedroom"],
  powerConsumptionWatts: 1452,
};

function endpointByDomain(domain: string, index = 0) {
  return BAS_ENDPOINTS.filter((endpoint) => endpoint.domain === domain)[index]?.id ?? BAS_ENDPOINTS[0].id;
}

function endpointBySourcePrefix(prefix: string) {
  return BAS_ENDPOINTS.find((endpoint) => endpoint.id.includes(prefix))?.id ?? BAS_ENDPOINTS[0].id;
}

function action(id: string, kind: BasActionKind, endpointId: string | null, label: string, payload: Readonly<Record<string, string | number | boolean>>): BasAction {
  return {
    id,
    kind,
    endpointId,
    label,
    payload,
    failSafeStrategy: kind === "notify" ? "notify-only" : "skip-action",
  };
}

export const BAS_AUTOMATION_RULES: readonly BasRule[] = [
  {
    id: "bas-rule-evening-arrival",
    name: "Evening Arrival Welcome",
    status: "enabled",
    unlimitedRuleEngineReady: true,
    trigger: {
      id: "trigger-motion-foyer",
      label: "Motion detected at foyer",
      kind: "presence",
      endpointId: endpointBySourcePrefix("presence-gf-foyer"),
      expression: "presence includes gf-foyer",
    },
    condition: {
      id: "condition-evening-arrival",
      operator: "and",
      label: "Presence and evening time",
      children: [
        { id: "condition-presence", operator: "presence", label: "Motion detected", endpointId: endpointBySourcePrefix("presence-gf-foyer"), comparator: "contains", value: "gf-foyer" },
        { id: "condition-time", operator: "time", label: "Time after 6PM", comparator: "greater-than", value: "18:00" },
      ],
    },
    actions: [
      action("action-living-lights-on", "set-lighting", endpointByDomain("lighting", 0), "Turn Living Room Lights ON", { enabled: true, brightness: 82 }),
      action("action-open-curtains", "set-curtains", endpointByDomain("curtains", 0), "Open Curtains", { position: 100 }),
      action("action-welcome-audio", "set-audio", endpointByDomain("audio", 0), "Play Welcome Music", { playlist: "welcome", volume: 28 }),
    ],
    failSafe: {
      strategy: "skip-action",
      fallbackActionId: "action-arrival-notify",
      gracefulFailure: true,
    },
    graphId: "bas-graph-evening-arrival",
  },
  {
    id: "bas-rule-away-security",
    name: "Away Mode Security",
    status: "enabled",
    unlimitedRuleEngineReady: true,
    trigger: {
      id: "trigger-away-scene",
      label: "Away scene selected",
      kind: "device-state",
      expression: "scene equals away",
    },
    condition: {
      id: "condition-away-security",
      operator: "and",
      label: "Absence and internet available",
      children: [
        { id: "condition-absence", operator: "absence", label: "No occupied bedrooms", comparator: "contains", value: "ff-master-bedroom" },
        { id: "condition-internet", operator: "internet-status", label: "Internet online", comparator: "equals", value: true },
      ],
    },
    actions: [
      action("action-arm-security", "set-security-mode", endpointByDomain("security", 0), "Set Security Away", { mode: "away" }),
      action("action-gate-lock", "set-gate", endpointByDomain("gate", 0), "Lock Gate", { locked: true }),
      action("action-garage-lock", "set-garage", endpointByDomain("garage", 0), "Close Garage", { closed: true }),
    ],
    failSafe: {
      strategy: "notify-only",
      fallbackActionId: "action-away-security-notify",
      gracefulFailure: true,
    },
    graphId: "bas-graph-away-security",
  },
  {
    id: "bas-rule-energy-peak",
    name: "Energy Peak Protection",
    status: "enabled",
    unlimitedRuleEngineReady: true,
    trigger: {
      id: "trigger-power-consumption",
      label: "Power consumption threshold",
      kind: "power-consumption",
      endpointId: endpointBySourcePrefix("total-power"),
      expression: "powerConsumptionWatts > 1200",
    },
    condition: {
      id: "condition-energy-peak",
      operator: "or",
      label: "Peak load or high temperature",
      children: [
        { id: "condition-peak-power", operator: "power-consumption", label: "Power above threshold", comparator: "greater-than", value: 1200 },
        { id: "condition-high-temp", operator: "temperature", label: "Temperature above 30C", comparator: "greater-than", value: 30 },
      ],
    },
    actions: [
      action("action-hvac-eco", "set-hvac", endpointByDomain("hvac", 0), "Set HVAC Eco", { mode: "eco", setpoint: 25 }),
      action("action-pool-delay", "set-pool", endpointByDomain("pool", 0), "Delay Pool Pump", { delayMinutes: 30 }),
      action("action-energy-notify", "notify", null, "Notify peak load", { severity: "warning" }),
    ],
    failSafe: {
      strategy: "retry-once",
      fallbackActionId: "action-energy-notify",
      gracefulFailure: true,
    },
    graphId: "bas-graph-energy-peak",
  },
  {
    id: "bas-rule-leak-response",
    name: "Water Leak Fail Safe",
    status: "enabled",
    unlimitedRuleEngineReady: true,
    trigger: {
      id: "trigger-water-leak",
      label: "Water leak sensor state",
      kind: "sensor-state",
      endpointId: endpointByDomain("water", 0),
      expression: "sensor-state equals leak",
    },
    condition: {
      id: "condition-water-leak",
      operator: "if",
      label: "Leak sensor active",
      endpointId: endpointByDomain("water", 0),
      comparator: "equals",
      value: true,
      elseBranch: [action("action-leak-standby-notify", "notify", null, "Water system normal", { severity: "info" })],
    },
    actions: [
      action("action-water-shutoff", "set-water", endpointByDomain("water", 1), "Close Water Valve", { valve: "closed" }),
      action("action-leak-security-notify", "notify", null, "Critical leak notification", { severity: "critical" }),
    ],
    failSafe: {
      strategy: "fallback-state",
      fallbackActionId: "action-leak-security-notify",
      gracefulFailure: true,
    },
    graphId: "bas-graph-leak-response",
  },
] as const;

function compareValues(actual: string | number | boolean, comparator: BasConditionExpression["comparator"], expected: string | number | boolean | undefined) {
  if (comparator === "greater-than") return Number(actual) > Number(expected);
  if (comparator === "less-than") return Number(actual) < Number(expected);
  if (comparator === "not-equals") return actual !== expected;
  if (comparator === "contains") return String(actual).includes(String(expected));
  if (comparator === "online") return actual === "online" || actual === true;
  if (comparator === "offline") return actual === "offline" || actual === false;
  return actual === expected;
}

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export function evaluateBasCondition(condition: BasConditionExpression, context: BasRuntimeContext = DEFAULT_BAS_CONTEXT): boolean {
  if (condition.operator === "and") return condition.children?.every((child) => evaluateBasCondition(child, context)) ?? false;
  if (condition.operator === "or") return condition.children?.some((child) => evaluateBasCondition(child, context)) ?? false;
  if (condition.operator === "not") return !(condition.children?.some((child) => evaluateBasCondition(child, context)) ?? false);
  if (condition.operator === "else") return true;
  if (condition.operator === "presence") return compareValues(context.presence.join(","), condition.comparator, condition.value);
  if (condition.operator === "absence") return compareValues(context.absentRooms.join(","), condition.comparator, condition.value);
  if (condition.operator === "weather") return compareValues(context.weather, condition.comparator, condition.value);
  if (condition.operator === "temperature") return compareValues(context.temperatureC, condition.comparator, condition.value);
  if (condition.operator === "humidity") return compareValues(context.humidityPercent, condition.comparator, condition.value);
  if (condition.operator === "power-consumption") return compareValues(context.powerConsumptionWatts, condition.comparator, condition.value);
  if (condition.operator === "internet-status") return compareValues(context.internetOnline, condition.comparator, condition.value);
  if (condition.operator === "time" && typeof condition.value === "string") return compareValues(timeToMinutes(context.currentTime), condition.comparator, timeToMinutes(condition.value));

  const endpoint = condition.endpointId ? getBasEndpoint(condition.endpointId) : null;
  if (!endpoint) return false;
  if (condition.operator === "battery-level") return compareValues(endpoint.telemetry.batteryPercent ?? 100, condition.comparator, condition.value);
  if (condition.operator === "device-state" || condition.operator === "sensor-state") return compareValues(endpoint.status, condition.comparator, condition.value);
  if (condition.operator === "schedule" || condition.operator === "sunrise" || condition.operator === "sunset" || condition.operator === "timer" || condition.operator === "delay" || condition.operator === "if") return true;

  return false;
}

export function executeBasRule(rule: BasRule, context: BasRuntimeContext = DEFAULT_BAS_CONTEXT): BasExecutionResult {
  if (rule.status !== "enabled") {
    return {
      ruleId: rule.id,
      status: "skipped",
      matched: false,
      actionCount: 0,
      skippedActionIds: rule.actions.map((actionItem) => actionItem.id),
      failSafeApplied: false,
      message: "Rule is disabled or degraded.",
    };
  }

  const matched = evaluateBasCondition(rule.condition, context);
  const executableActions = matched ? rule.actions : rule.condition.elseBranch ?? [];
  const skippedActionIds = executableActions.filter((actionItem) => actionItem.endpointId && !getBasEndpoint(actionItem.endpointId)).map((actionItem) => actionItem.id);
  const failSafeApplied = skippedActionIds.length > 0;

  return {
    ruleId: rule.id,
    status: failSafeApplied ? "failed-gracefully" : matched ? "success" : "skipped",
    matched,
    actionCount: executableActions.length - skippedActionIds.length,
    skippedActionIds,
    failSafeApplied,
    message: failSafeApplied ? `Applied ${rule.failSafe.strategy} fail-safe.` : matched ? "Rule evaluated and actions are ready." : "Condition did not match; else branch evaluated if present.",
  };
}

export function buildAutomationGraph(rule: BasRule): BasAutomationGraph {
  const conditionNodes = rule.condition.children?.map((condition, index) => ({
    id: `${rule.id}-condition-${index}`,
    type: "condition" as const,
    label: condition.label,
    position: [190, 70 + index * 58] as const,
    endpointId: condition.endpointId ?? null,
    ruleId: rule.id,
  })) ?? [
    {
      id: `${rule.id}-condition-0`,
      type: "condition" as const,
      label: rule.condition.label,
      position: [190, 90] as const,
      endpointId: rule.condition.endpointId ?? null,
      ruleId: rule.id,
    },
  ];
  const actionNodes = rule.actions.map((actionItem, index) => ({
    id: `${rule.id}-action-${index}`,
    type: "action" as const,
    label: actionItem.label,
    position: [420, 70 + index * 58] as const,
    endpointId: actionItem.endpointId,
    ruleId: rule.id,
  }));
  const nodes = [
    { id: `${rule.id}-trigger`, type: "trigger" as const, label: rule.trigger.label, position: [24, 90] as const, endpointId: rule.trigger.endpointId ?? null, ruleId: rule.id },
    { id: `${rule.id}-logic`, type: "logic" as const, label: rule.condition.operator.toUpperCase(), position: [310, 90] as const, endpointId: null, ruleId: rule.id },
    ...conditionNodes,
    ...actionNodes,
    { id: `${rule.id}-failsafe`, type: "fail-safe" as const, label: `Fail Safe: ${rule.failSafe.strategy}`, position: [420, 260] as const, endpointId: null, ruleId: rule.id },
  ];
  const edges = [
    ...conditionNodes.map((node) => ({ id: `${rule.id}-edge-trigger-${node.id}`, from: `${rule.id}-trigger`, to: node.id, label: "IF" })),
    ...conditionNodes.map((node) => ({ id: `${rule.id}-edge-${node.id}-logic`, from: node.id, to: `${rule.id}-logic`, label: rule.condition.operator.toUpperCase() })),
    ...actionNodes.map((node) => ({ id: `${rule.id}-edge-logic-${node.id}`, from: `${rule.id}-logic`, to: node.id, label: "THEN" })),
    { id: `${rule.id}-edge-logic-failsafe`, from: `${rule.id}-logic`, to: `${rule.id}-failsafe`, label: "ON ERROR" },
  ];

  return {
    id: rule.graphId,
    ruleId: rule.id,
    visualEditorReady: true,
    nodes,
    edges,
  };
}

export const BAS_AUTOMATION_GRAPHS: readonly BasAutomationGraph[] = BAS_AUTOMATION_RULES.map((rule) => buildAutomationGraph(rule));
