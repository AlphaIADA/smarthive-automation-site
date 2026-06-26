"use client";

import {
  COMMERCIAL_BUSINESS_PLANS,
  COMMERCIAL_DEPLOYMENT,
  COMMERCIAL_DOCUMENTATION,
  COMMERCIAL_LAUNCH_REPORT,
  COMMERCIAL_PORTALS,
  COMMERCIAL_SUCCESS_CRITERIA,
} from "@/lib/experience/commercial-launch";
import { useCommercialLaunchStore } from "@/lib/experience/stores";
import type { CommercialLaunchStatus } from "@/types/experience";

const STATUS_COLORS: Record<CommercialLaunchStatus, string> = {
  "production-ready": "#8ff0c7",
  "experience-ready": "#79d8ff",
  "integration-ready": "#ffd36e",
  "requires-platform-work": "#ff6378",
};

function surfacePosition(index: number): readonly [number, number, number] {
  const column = index % 5;
  const row = Math.floor(index / 5);
  return [-5.2 + column * 2.6, 11.65 - row * 0.28, -17.3 + row * 1.3] as const;
}

function SurfaceLaunchNode({ surfaceId, index }: { readonly surfaceId: string; readonly index: number }) {
  const selectedSurfaceId = useCommercialLaunchStore((state) => state.selectedSurfaceId);
  const selectSurface = useCommercialLaunchStore((state) => state.selectSurface);
  const surface = COMMERCIAL_LAUNCH_REPORT.surfaces.find((item) => item.id === surfaceId);
  if (!surface) return null;

  const active = selectedSurfaceId === surface.id;
  const color = STATUS_COLORS[surface.status];
  const [x, y, z] = surfacePosition(index);

  return (
    <group
      name={`commercial-launch-surface-${surface.id}`}
      position={[x, y, z]}
      userData={{
        milestone: 25,
        commercialLaunchSurface: true,
        surfaceId: surface.id,
        status: surface.status,
        completionPercent: surface.completionPercent,
        owner: surface.owner,
      }}
    >
      <mesh onClick={() => selectSurface(surface.id)}>
        <sphereGeometry args={[active ? 0.24 : 0.16, 16, 12]} />
        <meshBasicMaterial color={color} transparent opacity={active ? 0.92 : 0.58} toneMapped={false} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[active ? 0.45 : 0.32, 0.01, 8, 42]} />
        <meshBasicMaterial color={color} transparent opacity={active ? 0.38 : 0.16} toneMapped={false} />
      </mesh>
    </group>
  );
}

function PortalRail() {
  return (
    <group name="commercial-launch-portal-rail" position={[-9.6, 11.15, -17.8]}>
      {COMMERCIAL_PORTALS.map((portal, index) => (
        <mesh
          key={portal.id}
          name={`commercial-launch-portal-${portal.id}`}
          position={[0, index * 0.22, 0]}
          userData={{
            milestone: 25,
            commercialPortal: true,
            portalId: portal.id,
            moduleCount: portal.modules.length,
            payloadReady: portal.payloadReady,
          }}
        >
          <boxGeometry args={[1.25, 0.07, 0.14]} />
          <meshBasicMaterial color="#79d8ff" transparent opacity={0.52} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function BusinessStack() {
  return (
    <group name="commercial-launch-business-stack" position={[9.6, 10.95, -17.8]}>
      {COMMERCIAL_BUSINESS_PLANS.map((plan, index) => (
        <mesh
          key={plan.id}
          name={`commercial-launch-business-${plan.id}`}
          position={[0, index * 0.18, 0]}
          userData={{
            milestone: 25,
            commercialBusinessPlan: true,
            planId: plan.id,
            audience: plan.audience,
            billingModel: plan.billingModel,
            pricingPayloadReady: plan.pricingPayloadReady,
          }}
        >
          <boxGeometry args={[1.1, 0.08, 0.16]} />
          <meshBasicMaterial color="#d4c1ff" transparent opacity={0.52} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function DocumentationGrid() {
  return (
    <group name="commercial-launch-documentation-grid" position={[-6.7, 10.38, -18.55]}>
      {COMMERCIAL_DOCUMENTATION.map((doc, index) => (
        <mesh
          key={doc.id}
          name={`commercial-launch-doc-${doc.kind}`}
          position={[(index % 3) * 0.42, -Math.floor(index / 3) * 0.26, 0]}
          userData={{
            milestone: 25,
            commercialDocumentation: true,
            kind: doc.kind,
            sectionCount: doc.sectionCount,
            ready: doc.ready,
          }}
        >
          <boxGeometry args={[0.22, 0.16, 0.06]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.56} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function DeploymentChecklist() {
  return (
    <group name="commercial-launch-deployment-checklist" position={[5.7, 10.38, -18.55]}>
      {COMMERCIAL_DEPLOYMENT.map((item, index) => (
        <mesh
          key={item.id}
          name={`commercial-launch-deploy-${item.id}`}
          position={[(index % 3) * 0.42, -Math.floor(index / 3) * 0.26, 0]}
          userData={{
            milestone: 25,
            commercialDeployment: true,
            deploymentId: item.id,
            status: item.status,
          }}
        >
          <boxGeometry args={[0.22, 0.16, 0.06]} />
          <meshBasicMaterial color={item.status === "ready" ? "#8ff0c7" : item.status === "payload-ready" ? "#79d8ff" : "#ffd36e"} transparent opacity={0.58} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function SegmentRing() {
  return (
    <group name="commercial-launch-segment-ring" position={[0, 10.45, -18.85]}>
      {COMMERCIAL_SUCCESS_CRITERIA.map((criterion, index) => {
        const angle = (index / COMMERCIAL_SUCCESS_CRITERIA.length) * Math.PI * 2;
        return (
          <mesh
            key={criterion.id}
            name={`commercial-launch-segment-${criterion.id}`}
            position={[Math.cos(angle) * 1.05, Math.sin(index * 0.4) * 0.08, Math.sin(angle) * 1.05]}
            userData={{
              milestone: 25,
              commercialSuccessCriterion: true,
              segmentId: criterion.id,
              supported: criterion.supported,
            }}
          >
            <sphereGeometry args={[0.09, 10, 8]} />
            <meshBasicMaterial color="#8ff0c7" transparent opacity={0.58} toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
}

export function CommercialLaunchRenderer() {
  return (
    <group
      name="SmartHive OS Commercial Launch Renderer"
      userData={{
        milestone: 25,
        smartHiveOsVersion: COMMERCIAL_LAUNCH_REPORT.version,
        commercialLaunch: true,
        launchScore: COMMERCIAL_LAUNCH_REPORT.launchScore,
        surfaceCount: COMMERCIAL_LAUNCH_REPORT.metrics.surfaceCount,
        portalCount: COMMERCIAL_LAUNCH_REPORT.metrics.portalCount,
        businessPlanCount: COMMERCIAL_LAUNCH_REPORT.metrics.businessPlanCount,
        supportedSegmentCount: COMMERCIAL_LAUNCH_REPORT.metrics.supportedSegmentCount,
        finalDeliverable: COMMERCIAL_LAUNCH_REPORT.releaseLabel,
      }}
    >
      {COMMERCIAL_LAUNCH_REPORT.surfaces.map((surface, index) => (
        <SurfaceLaunchNode key={surface.id} surfaceId={surface.id} index={index} />
      ))}
      <PortalRail />
      <BusinessStack />
      <DocumentationGrid />
      <DeploymentChecklist />
      <SegmentRing />
    </group>
  );
}
