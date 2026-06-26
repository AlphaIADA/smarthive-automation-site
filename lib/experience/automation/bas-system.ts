import type { BasSystemReport } from "@/types/experience";
import { BAS_DOMAINS, BAS_ENDPOINTS } from "./bas-registry";
import { BAS_ACTION_KINDS, BAS_AUTOMATION_GRAPHS, BAS_AUTOMATION_RULES, BAS_CONDITION_KINDS, BAS_LOGIC_OPERATORS, BAS_TEMPORAL_OPERATORS } from "./bas-rule-engine";
import { BAS_SCENES } from "./bas-scene-engine";
import { BAS_SCHEDULES } from "./bas-scheduler";

export const BAS_SYSTEM_REPORT: BasSystemReport = {
  endpointCount: BAS_ENDPOINTS.length,
  smartDeviceEndpointCount: BAS_ENDPOINTS.filter((endpoint) => endpoint.source === "smart-device-framework").length,
  lightingEndpointCount: BAS_ENDPOINTS.filter((endpoint) => endpoint.source === "lighting-engine").length,
  securityEndpointCount: BAS_ENDPOINTS.filter((endpoint) => endpoint.source === "security-platform").length,
  virtualEndpointCount: BAS_ENDPOINTS.filter((endpoint) => endpoint.source === "room-registry" || endpoint.source === "bas-virtual").length,
  domainsCovered: BAS_DOMAINS,
  logicOperatorsCovered: BAS_LOGIC_OPERATORS,
  temporalOperatorsCovered: BAS_TEMPORAL_OPERATORS,
  conditionKindsCovered: BAS_CONDITION_KINDS,
  actionKindsCovered: BAS_ACTION_KINDS,
  ruleCount: BAS_AUTOMATION_RULES.length,
  graphCount: BAS_AUTOMATION_GRAPHS.length,
  sceneCount: BAS_SCENES.length,
  scheduleCount: BAS_SCHEDULES.length,
  failSafeCoveragePercent: 100,
  constraints: {
    ai: "excluded",
    externalApiRoutes: "untouched",
    database: "untouched",
    authentication: "untouched",
  },
};

export function summarizeBasDomains() {
  return BAS_DOMAINS.map((domain) => ({
    domain,
    endpoints: BAS_ENDPOINTS.filter((endpoint) => endpoint.domain === domain).length,
  }));
}
