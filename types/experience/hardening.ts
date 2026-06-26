export type HardeningReportKind = "performance" | "security" | "accessibility" | "test-coverage" | "monitoring";
export type HardeningReadinessStatus = "ready" | "configured" | "needs-runtime-service" | "review-required";
export type HardeningSeverity = "info" | "medium" | "high" | "critical";
export type HardeningOptimizationKind =
  | "lod"
  | "occlusion-culling"
  | "geometry-instancing"
  | "texture-compression"
  | "lazy-loading"
  | "code-splitting"
  | "ssr-safety"
  | "memory-cleanup"
  | "shader-optimization"
  | "asset-streaming";

export interface HardeningPerformanceTarget {
  readonly id: string;
  readonly label: string;
  readonly targetFps: number;
  readonly minimumFps: number;
  readonly currentFps: number | null;
  readonly status: HardeningReadinessStatus;
}

export interface HardeningOptimizationControl {
  readonly id: HardeningOptimizationKind;
  readonly label: string;
  readonly implemented: boolean;
  readonly runtimeConfigurable: boolean;
  readonly reportLabel: string;
}

export interface HardeningQualityGate {
  readonly id: string;
  readonly label: string;
  readonly target: string;
  readonly current: string;
  readonly status: HardeningReadinessStatus;
  readonly severity: HardeningSeverity;
}

export interface HardeningSecurityControl {
  readonly id: string;
  readonly label: string;
  readonly status: HardeningReadinessStatus;
  readonly scope: "experience-engine" | "application-wide-review";
  readonly evidence: string;
  readonly recommendation: string;
}

export interface HardeningAccessibilityControl {
  readonly id: string;
  readonly label: string;
  readonly status: HardeningReadinessStatus;
  readonly evidence: string;
  readonly recommendation: string;
}

export interface HardeningTestControl {
  readonly id: string;
  readonly label: string;
  readonly status: HardeningReadinessStatus;
  readonly command: string;
  readonly coverageLabel: string;
}

export interface HardeningMonitoringControl {
  readonly id: string;
  readonly label: string;
  readonly status: HardeningReadinessStatus;
  readonly signal: string;
  readonly exportReady: boolean;
}

export interface HardeningReportArtifact {
  readonly id: string;
  readonly kind: HardeningReportKind;
  readonly title: string;
  readonly itemCount: number;
  readonly ready: true;
  readonly path: string;
}

export interface HardeningRuntimeSnapshot {
  readonly fps: number;
  readonly memoryMb: number | null;
  readonly drawCalls: number;
  readonly triangles: number;
  readonly textures: number;
  readonly geometries: number;
  readonly sceneObjects: number;
  readonly qualityTier: "high" | "balanced" | "performance";
  readonly reducedMotion: boolean;
  readonly pixelRatio: number;
}

export interface EnterpriseHardeningReport {
  readonly performanceTargets: readonly HardeningPerformanceTarget[];
  readonly optimizationControls: readonly HardeningOptimizationControl[];
  readonly qualityGates: readonly HardeningQualityGate[];
  readonly securityControls: readonly HardeningSecurityControl[];
  readonly accessibilityControls: readonly HardeningAccessibilityControl[];
  readonly testControls: readonly HardeningTestControl[];
  readonly monitoringControls: readonly HardeningMonitoringControl[];
  readonly reportArtifacts: readonly HardeningReportArtifact[];
  readonly readinessScore: number;
  readonly summary: {
    readonly performanceTargetCount: number;
    readonly optimizationCount: number;
    readonly securityControlCount: number;
    readonly accessibilityControlCount: number;
    readonly testControlCount: number;
    readonly monitoringControlCount: number;
    readonly reportCount: number;
    readonly readyCount: number;
    readonly reviewRequiredCount: number;
  };
  readonly constraints: {
    readonly api: "untouched";
    readonly database: "untouched";
    readonly authenticationImplementation: "reviewed-not-modified";
    readonly authorizationImplementation: "reviewed-not-modified";
    readonly globalHeaders: "report-only";
    readonly existingWebsiteFunctionality: "untouched";
  };
}
