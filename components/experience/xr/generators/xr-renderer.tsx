"use client";

import { XR_AR_PLACEMENT_ANCHORS, XR_FRAMEWORK_REPORT, XR_PRESENTATION_STEPS, XR_VR_CONTROLLER_PROFILES } from "@/lib/experience/xr";
import { useXrStore } from "@/lib/experience/stores";
import type { XrArPlacementCategory, XrControllerHand } from "@/types/experience";

const AR_CATEGORY_COLORS: Record<XrArPlacementCategory, string> = {
  "smart-switches": "#fff2cf",
  curtains: "#d8b35f",
  sensors: "#8ff0c7",
  cameras: "#ff6378",
  "door-locks": "#ffd36e",
  lighting: "#ffffff",
  panels: "#72d8ff",
  thermostats: "#70c2ff",
  "network-rack": "#b48cff",
  audio: "#d4c1ff",
};

const CONTROLLER_POSITIONS: Record<XrControllerHand, readonly [number, number, number]> = {
  left: [-1.1, 1.35, -4.4],
  right: [1.1, 1.35, -4.4],
};

function ArAnchorMarker({ anchorId }: { readonly anchorId: string }) {
  const selectedAnchorIds = useXrStore((state) => state.selectedAnchorIds);
  const toggleAnchor = useXrStore((state) => state.toggleAnchor);
  const anchor = XR_AR_PLACEMENT_ANCHORS.find((candidate) => candidate.id === anchorId);
  if (!anchor) return null;

  const selected = selectedAnchorIds.includes(anchor.id);
  const color = AR_CATEGORY_COLORS[anchor.category];
  const [x, y, z] = anchor.estimatedPosition;

  return (
    <group
      name={`xr-ar-anchor-${anchor.id}`}
      position={[x, y + 0.12, z]}
      userData={{
        milestone: 21,
        xrArPlacementAnchor: true,
        category: anchor.category,
        configurationItemId: anchor.configurationItemId,
        roomId: anchor.roomId,
        quotationUpdateReady: anchor.quotationUpdateReady,
      }}
    >
      <mesh onClick={() => toggleAnchor(anchor.id)}>
        <sphereGeometry args={[selected ? 0.12 : 0.075, 12, 8]} />
        <meshBasicMaterial color={color} transparent opacity={selected ? 0.9 : 0.45} toneMapped={false} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[anchor.installZoneRadiusMeters, 0.01, 8, 36]} />
        <meshBasicMaterial color={color} transparent opacity={selected ? 0.3 : 0.12} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}

function VrControllerRig() {
  const mode = useXrStore((state) => state.mode);
  const visible = mode === "vr" || mode === "client-demo" || mode === "presentation";

  if (!visible) return null;

  return (
    <group name="xr-vr-controller-system">
      {XR_VR_CONTROLLER_PROFILES.map((controller) => {
        const [x, y, z] = CONTROLLER_POSITIONS[controller.hand];
        return (
          <group
            key={controller.id}
            name={controller.id}
            position={[x, y, z]}
            userData={{
              milestone: 21,
              vrController: true,
              hand: controller.hand,
              locomotion: controller.locomotion,
              laserPointer: controller.laserPointer,
              voiceCommandsReady: controller.voiceCommandsReady,
            }}
          >
            <mesh>
              <boxGeometry args={[0.12, 0.26, 0.12]} />
              <meshBasicMaterial color={controller.hand === "left" ? "#8ff0c7" : "#72d8ff"} transparent opacity={0.72} toneMapped={false} />
            </mesh>
            <mesh position={[0, 0, -1.25]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.006, 0.016, 2.5, 8]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.35} toneMapped={false} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function PresentationMarkers() {
  const selectedPresentationStepId = useXrStore((state) => state.selectedPresentationStepId);
  const selectPresentationStep = useXrStore((state) => state.selectPresentationStep);

  return (
    <group name="xr-presentation-mode-hotspots">
      {XR_PRESENTATION_STEPS.slice(0, 10).map((step, index) => {
        const anchor = step.configurationItemId ? XR_AR_PLACEMENT_ANCHORS.find((candidate) => candidate.configurationItemId === step.configurationItemId) : null;
        const x = anchor?.estimatedPosition[0] ?? -4 + index * 0.75;
        const y = (anchor?.estimatedPosition[1] ?? 1.5) + 0.32;
        const z = anchor?.estimatedPosition[2] ?? -6.2;
        const active = step.id === selectedPresentationStepId;

        return (
          <mesh
            key={step.id}
            name={`xr-presentation-step-${step.id}`}
            position={[x, y, z]}
            onClick={() => selectPresentationStep(step.id)}
            userData={{
              milestone: 21,
              presentationStep: true,
              stepType: step.type,
              quotationUpdate: step.type === "quotation-update",
            }}
          >
            <boxGeometry args={[active ? 0.18 : 0.1, active ? 0.18 : 0.1, active ? 0.18 : 0.1]} />
            <meshBasicMaterial color={active ? "#ffffff" : "#ffd36e"} transparent opacity={active ? 0.88 : 0.52} toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
}

export function XrRenderer() {
  const mode = useXrStore((state) => state.mode);
  const visibleAnchorIds = XR_AR_PLACEMENT_ANCHORS.slice(0, 96).map((anchor) => anchor.id);

  return (
    <group
      name="SmartHive XR Renderer"
      userData={{
        milestone: 21,
        xrFramework: true,
        mode,
        arPlacementCount: XR_FRAMEWORK_REPORT.arPlacementCount,
        vrControllerCount: XR_FRAMEWORK_REPORT.vrControllerCount,
        targetVrFps: XR_FRAMEWORK_REPORT.performance.targetVrFps,
      }}
    >
      {visibleAnchorIds.map((anchorId) => (
        <ArAnchorMarker key={anchorId} anchorId={anchorId} />
      ))}
      <VrControllerRig />
      <PresentationMarkers />
    </group>
  );
}
