"use client";

import {
  ENTERPRISE_HARDENING_REPORT,
  HARDENING_ACCESSIBILITY_CONTROLS,
  HARDENING_MONITORING_CONTROLS,
  HARDENING_OPTIMIZATION_CONTROLS,
  HARDENING_SECURITY_CONTROLS,
  HARDENING_TEST_CONTROLS,
} from "@/lib/experience/hardening";
import { useHardeningStore } from "@/lib/experience/stores";
import type { HardeningReadinessStatus } from "@/types/experience";

const STATUS_COLORS: Record<HardeningReadinessStatus, string> = {
  ready: "#8ff0c7",
  configured: "#79d8ff",
  "needs-runtime-service": "#ffd36e",
  "review-required": "#ff6378",
};

function statusColor(status: HardeningReadinessStatus) {
  return STATUS_COLORS[status];
}

function controlPosition(index: number, y = 10.8): readonly [number, number, number] {
  const column = index % 8;
  const row = Math.floor(index / 8);
  return [-7.7 + column * 2.2, y - row * 0.22, -15.3 + row * 1.15] as const;
}

function PerformanceTargetNodes() {
  return (
    <group name="hardening-performance-targets" position={[-9.5, 10.35, -14.2]}>
      {ENTERPRISE_HARDENING_REPORT.performanceTargets.map((target, index) => (
        <mesh
          key={target.id}
          name={`hardening-performance-${target.id}`}
          position={[index * 0.55, 0, 0]}
          userData={{
            milestone: 24,
            performanceTarget: true,
            targetId: target.id,
            targetFps: target.targetFps,
            minimumFps: target.minimumFps,
            status: target.status,
          }}
        >
          <cylinderGeometry args={[0.16, 0.16, 0.08, 16]} />
          <meshBasicMaterial color={statusColor(target.status)} transparent opacity={0.68} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function OptimizationNodes() {
  const selectedOptimizationId = useHardeningStore((state) => state.selectedOptimizationId);
  const selectOptimization = useHardeningStore((state) => state.selectOptimization);

  return (
    <group name="hardening-optimization-controls">
      {HARDENING_OPTIMIZATION_CONTROLS.map((control, index) => {
        const active = selectedOptimizationId === control.id;
        const [x, y, z] = controlPosition(index);
        return (
          <group
            key={control.id}
            name={`hardening-optimization-${control.id}`}
            position={[x, y, z]}
            userData={{
              milestone: 24,
              optimizationControl: true,
              optimizationId: control.id,
              implemented: control.implemented,
              runtimeConfigurable: control.runtimeConfigurable,
            }}
          >
            <mesh onClick={() => selectOptimization(control.id)}>
              <boxGeometry args={[active ? 0.26 : 0.18, active ? 0.26 : 0.18, active ? 0.26 : 0.18]} />
              <meshBasicMaterial color={control.implemented ? "#8ff0c7" : "#ffd36e"} transparent opacity={active ? 0.9 : 0.5} toneMapped={false} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[active ? 0.36 : 0.24, 0.01, 8, 36]} />
              <meshBasicMaterial color={control.implemented ? "#8ff0c7" : "#ffd36e"} transparent opacity={active ? 0.35 : 0.14} toneMapped={false} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function ReportRail() {
  return (
    <group name="hardening-report-rail" position={[8.8, 10.15, -14.2]}>
      {ENTERPRISE_HARDENING_REPORT.reportArtifacts.map((report, index) => (
        <mesh
          key={report.id}
          name={`hardening-report-${report.kind}`}
          position={[0, index * 0.2, 0]}
          userData={{
            milestone: 24,
            hardeningReport: true,
            reportKind: report.kind,
            itemCount: report.itemCount,
            ready: report.ready,
          }}
        >
          <boxGeometry args={[1.15, 0.07, 0.14]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.45} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function StatusMatrix() {
  const controls = [
    ...HARDENING_SECURITY_CONTROLS,
    ...HARDENING_ACCESSIBILITY_CONTROLS,
    ...HARDENING_TEST_CONTROLS,
    ...HARDENING_MONITORING_CONTROLS,
  ];

  return (
    <group name="hardening-status-matrix" position={[-7.8, 9.65, -16.5]}>
      {controls.map((control, index) => (
        <mesh
          key={control.id}
          name={`hardening-status-${control.id}`}
          position={[(index % 10) * 0.34, -Math.floor(index / 10) * 0.24, 0]}
          userData={{
            milestone: 24,
            hardeningStatus: true,
            controlId: control.id,
            status: control.status,
          }}
        >
          <sphereGeometry args={[0.085, 10, 8]} />
          <meshBasicMaterial color={statusColor(control.status)} transparent opacity={0.66} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

export function ProductionHardeningRenderer() {
  return (
    <group
      name="Enterprise Production Hardening Renderer"
      userData={{
        milestone: 24,
        enterpriseProductionHardening: true,
        readinessScore: ENTERPRISE_HARDENING_REPORT.readinessScore,
        performanceTargets: ENTERPRISE_HARDENING_REPORT.summary.performanceTargetCount,
        optimizationControls: ENTERPRISE_HARDENING_REPORT.summary.optimizationCount,
        securityControls: ENTERPRISE_HARDENING_REPORT.summary.securityControlCount,
        accessibilityControls: ENTERPRISE_HARDENING_REPORT.summary.accessibilityControlCount,
        testControls: ENTERPRISE_HARDENING_REPORT.summary.testControlCount,
        monitoringControls: ENTERPRISE_HARDENING_REPORT.summary.monitoringControlCount,
        globalHeaders: "report-only",
      }}
    >
      <PerformanceTargetNodes />
      <OptimizationNodes />
      <ReportRail />
      <StatusMatrix />
    </group>
  );
}
