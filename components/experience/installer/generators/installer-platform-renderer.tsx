"use client";

import {
  INSTALLER_MATERIALS,
  INSTALLER_PLATFORM_REPORT,
  INSTALLER_ROOM_CHECKLISTS,
  INSTALLER_SCHEDULES,
  INSTALLER_WIRING_PLANS,
} from "@/lib/experience/installer";
import { useInstallerStore } from "@/lib/experience/stores";
import type { InstallerJobStatus, InstallerWarehouseStatus } from "@/types/experience";

const JOB_STATUS_COLORS: Record<InstallerJobStatus, string> = {
  scheduled: "#79d8ff",
  "in-progress": "#ffd36e",
  blocked: "#ff6378",
  "ready-for-testing": "#d4c1ff",
  "handover-ready": "#8ff0c7",
  maintenance: "#cdd5df",
};

const WAREHOUSE_COLORS: Record<InstallerWarehouseStatus, string> = {
  "in-stock": "#8ff0c7",
  "low-stock": "#ffd36e",
  ordered: "#79d8ff",
  backordered: "#ff6378",
};

function roomMarkerPosition(index: number, floorOffset: number): readonly [number, number, number] {
  const column = index % 8;
  const row = Math.floor(index / 8);
  return [-7.8 + column * 1.15, 8.8 + floorOffset, -9.6 + row * 1.1] as const;
}

function ScheduleBoard() {
  return (
    <group name="installer-schedule-board" position={[-10.4, 8.95, -10.6]}>
      {INSTALLER_SCHEDULES.map((schedule, index) => (
        <mesh
          key={schedule.id}
          name={`installer-schedule-${schedule.id}`}
          position={[0, index * 0.22, 0]}
          userData={{
            milestone: 23,
            installerSchedule: true,
            scheduleId: schedule.id,
            status: schedule.status,
            assignedTeam: schedule.assignedTeam,
            estimatedHours: schedule.estimatedHours,
          }}
        >
          <boxGeometry args={[1.2, 0.06, 0.12]} />
          <meshBasicMaterial color={JOB_STATUS_COLORS[schedule.status]} transparent opacity={0.62} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function RoomChecklistMarker({ checklistId, index }: { readonly checklistId: string; readonly index: number }) {
  const selectedRoomId = useInstallerStore((state) => state.selectedRoomId);
  const selectRoom = useInstallerStore((state) => state.selectRoom);
  const checklist = INSTALLER_ROOM_CHECKLISTS.find((candidate) => candidate.id === checklistId);
  if (!checklist) return null;

  const active = selectedRoomId === checklist.roomId;
  const completedCount = checklist.checklistItems.filter((item) => item.status === "complete").length;
  const color = completedCount > 2 ? "#8ff0c7" : active ? "#ffd36e" : "#79d8ff";
  const [x, y, z] = roomMarkerPosition(index, checklist.floorLevel === "first" ? 0.55 : 0);

  return (
    <group
      name={`installer-room-checklist-${checklist.roomId}`}
      position={[x, y, z]}
      userData={{
        milestone: 23,
        installerRoomChecklist: true,
        roomId: checklist.roomId,
        roomName: checklist.roomName,
        requiredDeviceCount: checklist.requiredDeviceCount,
        cableRuns: checklist.cableRuns,
        labourHours: checklist.labourHours,
      }}
    >
      <mesh onClick={() => selectRoom(checklist.roomId)}>
        <boxGeometry args={[active ? 0.32 : 0.22, active ? 0.32 : 0.22, active ? 0.32 : 0.22]} />
        <meshBasicMaterial color={color} transparent opacity={active ? 0.9 : 0.5} toneMapped={false} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[active ? 0.42 : 0.28, 0.01, 8, 36]} />
        <meshBasicMaterial color={color} transparent opacity={active ? 0.38 : 0.16} toneMapped={false} />
      </mesh>
    </group>
  );
}

function WiringPlannerRibbon() {
  return (
    <group name="installer-wiring-planner-ribbon" position={[0, 8.25, -13.2]}>
      {INSTALLER_WIRING_PLANS.slice(0, 24).map((plan, index) => (
        <mesh
          key={plan.id}
          name={`installer-wiring-${plan.type}-${index + 1}`}
          position={[-6.2 + (index % 12) * 1.08, Math.floor(index / 12) * 0.18, 0]}
          userData={{
            milestone: 23,
            wiringPlan: true,
            planType: plan.type,
            roomId: plan.roomId,
            lengthMeters: plan.lengthMeters,
            cableType: plan.cableType,
            powerWatts: plan.powerWatts,
          }}
        >
          <boxGeometry args={[0.78, 0.035, 0.06]} />
          <meshBasicMaterial color={plan.type === "power-requirement" ? "#ffd36e" : plan.type === "rack-layout" ? "#d4c1ff" : "#79d8ff"} transparent opacity={0.38} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function MaterialPlannerStack() {
  return (
    <group name="installer-material-planner-stack" position={[9.8, 8.8, -10.5]}>
      {INSTALLER_MATERIALS.map((materialLine, index) => (
        <mesh
          key={materialLine.id}
          name={`installer-material-${materialLine.sku}`}
          position={[0, index * 0.17, 0]}
          userData={{
            milestone: 23,
            materialPlanner: true,
            sku: materialLine.sku,
            category: materialLine.category,
            warehouseStatus: materialLine.warehouseStatus,
            purchaseRequired: materialLine.purchaseRequired,
            supplierCost: materialLine.supplierCost,
            retailCost: materialLine.retailCost,
          }}
        >
          <boxGeometry args={[1.1, 0.08, 0.16]} />
          <meshBasicMaterial color={WAREHOUSE_COLORS[materialLine.warehouseStatus]} transparent opacity={0.56} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

export function InstallerPlatformRenderer() {
  return (
    <group
      name="Installer Platform Renderer"
      userData={{
        milestone: 23,
        installerPlatform: true,
        projectCount: INSTALLER_PLATFORM_REPORT.dashboard.projectCount,
        scheduleCount: INSTALLER_PLATFORM_REPORT.dashboard.scheduleCount,
        taskCount: INSTALLER_PLATFORM_REPORT.dashboard.taskCount,
        roomChecklistCount: INSTALLER_PLATFORM_REPORT.roomChecklistCount,
        wiringPlanCount: INSTALLER_PLATFORM_REPORT.wiringPlanCount,
        materialLineCount: INSTALLER_PLATFORM_REPORT.materialLineCount,
        crmUpdate: "payload-only",
      }}
    >
      <ScheduleBoard />
      {INSTALLER_ROOM_CHECKLISTS.map((checklist, index) => (
        <RoomChecklistMarker key={checklist.id} checklistId={checklist.id} index={index} />
      ))}
      <WiringPlannerRibbon />
      <MaterialPlannerStack />
    </group>
  );
}
