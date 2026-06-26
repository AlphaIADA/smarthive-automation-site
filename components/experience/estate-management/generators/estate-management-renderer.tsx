"use client";

import { useMemo } from "react";
import { ESTATE_MANAGEMENT_REPORT, ESTATE_MAP_POINTS } from "@/lib/experience/estate-management";
import { useEstateManagementStore } from "@/lib/experience/stores";
import type { EstateMapPoint, EstateOperationalStatus } from "@/types/experience";

const STATUS_COLORS: Record<EstateOperationalStatus, string> = {
  online: "#8ff0c7",
  warning: "#ffd36e",
  critical: "#ff6378",
  maintenance: "#79d8ff",
};

function mapPosition(index: number): readonly [number, number, number] {
  const column = index % 4;
  const row = Math.floor(index / 4);
  return [-25 + column * 1.18, 8.5 - row * 0.18, -12 + row * 1.05] as const;
}

function EstateMapMarker({ point, index }: { readonly point: EstateMapPoint; readonly index: number }) {
  const selectedPropertyId = useEstateManagementStore((state) => state.selectedPropertyId);
  const selectProperty = useEstateManagementStore((state) => state.selectProperty);
  const selected = selectedPropertyId === point.propertyId;
  const color = STATUS_COLORS[point.status];
  const [x, y, z] = mapPosition(index);

  return (
    <group
      name={`estate-map-point-${point.propertyId}`}
      position={[x, y, z]}
      userData={{
        milestone: 20,
        estateMapPoint: true,
        propertyId: point.propertyId,
        propertyType: point.propertyType,
        status: point.status,
        healthScore: point.healthScore,
        connectivityPercent: point.connectivityPercent,
      }}
    >
      <mesh onClick={() => selectProperty(point.propertyId)}>
        <boxGeometry args={[selected ? 0.22 : 0.15, selected ? 0.22 : 0.15, selected ? 0.22 : 0.15]} />
        <meshBasicMaterial color={color} transparent opacity={selected ? 0.95 : 0.62} toneMapped={false} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[selected ? 0.34 : 0.24, 0.01, 6, 36]} />
        <meshBasicMaterial color={color} transparent opacity={selected ? 0.48 : 0.24} toneMapped={false} />
      </mesh>
    </group>
  );
}

export function EstateManagementRenderer() {
  const visiblePoints = useMemo(() => ESTATE_MAP_POINTS.slice(0, 48), []);

  return (
    <group
      name="SmartHive Estate Management Map"
      userData={{
        milestone: 20,
        estateManagement: true,
        propertyCount: ESTATE_MANAGEMENT_REPORT.propertyCount,
        mapPointCount: ESTATE_MANAGEMENT_REPORT.mapPointCount,
        dashboardReady: true,
        roleManagementReady: true,
        crmLinksReady: true,
      }}
    >
      {visiblePoints.map((point, index) => (
        <EstateMapMarker key={point.id} point={point} index={index} />
      ))}
    </group>
  );
}
