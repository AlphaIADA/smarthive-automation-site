"use client";

import { useMemo } from "react";
import { ENTERPRISE_DEVICE_ALERTS, ENTERPRISE_DEVICE_INVENTORY, ENTERPRISE_PROPERTIES } from "@/lib/experience/device-management";
import { useEnterpriseDeviceManagementStore } from "@/lib/experience/stores";
import type { EnterpriseDeviceRecord, EnterpriseInstallationStatus } from "@/types/experience";

const INSTALL_COLORS: Record<EnterpriseInstallationStatus, string> = {
  installed: "#8ff0c7",
  pending: "#ffd36e",
  rejected: "#ff6378",
  replacement: "#ff9b72",
};

function propertyPosition(index: number): readonly [number, number, number] {
  return [22 + index * 1.35, 8.6, -10.5] as const;
}

function PropertyNode({ index }: { readonly index: number }) {
  const property = ENTERPRISE_PROPERTIES[index];
  const [x, y, z] = propertyPosition(index);
  const count = ENTERPRISE_DEVICE_INVENTORY.filter((record) => record.propertyId === property.id).length;

  return (
    <group
      name={`enterprise-property-${property.id}`}
      position={[x, y, z]}
      userData={{
        enterpriseProperty: true,
        propertyId: property.id,
        propertyName: property.name,
        customerName: property.customerName,
        inventoryCount: count,
      }}
    >
      <mesh>
        <boxGeometry args={[0.42, 0.42, 0.42]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.72} toneMapped={false} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.62, 0.012, 8, 48]} />
        <meshBasicMaterial color="#8ff0c7" transparent opacity={0.32} toneMapped={false} />
      </mesh>
    </group>
  );
}

function EnterpriseDeviceMarker({ record }: { readonly record: EnterpriseDeviceRecord }) {
  const selectedInventoryId = useEnterpriseDeviceManagementStore((state) => state.selectedInventoryId);
  const color = INSTALL_COLORS[record.installationStatus];
  const propertyIndex = ENTERPRISE_PROPERTIES.findIndex((property) => property.id === record.propertyId);
  const baseX = propertyPosition(Math.max(0, propertyIndex))[0];
  const x = baseX + ((record.connectivityPercent % 12) - 6) * 0.075;
  const y = 8.0 + (record.connectivityPercent % 10) * 0.035;
  const z = -9.2 + (record.id.length % 18) * 0.08;

  return (
    <mesh
      name={`enterprise-device-${record.id}`}
      position={[x, y, z]}
      userData={{
        enterpriseDevice: true,
        inventoryId: record.id,
        propertyId: record.propertyId,
        protocol: record.protocol,
        manufacturer: record.manufacturer,
        installationStatus: record.installationStatus,
        healthStatus: record.healthStatus,
      }}
    >
      <sphereGeometry args={[selectedInventoryId === record.id ? 0.1 : 0.052, 8, 6]} />
      <meshBasicMaterial color={color} transparent opacity={selectedInventoryId === record.id ? 0.9 : 0.46} toneMapped={false} />
    </mesh>
  );
}

export function EnterpriseDeviceManagementRenderer() {
  const alertInventoryIds = useMemo(() => new Set(ENTERPRISE_DEVICE_ALERTS.map((alert) => alert.inventoryId)), []);
  const visibleRecords = useMemo(() => ENTERPRISE_DEVICE_INVENTORY.filter((record, index) => index % 19 === 0 || alertInventoryIds.has(record.id)).slice(0, 220), [alertInventoryIds]);

  return (
    <group
      name="SmartHive Enterprise Device Management Renderer"
      userData={{
        milestone: 19,
        propertyCount: ENTERPRISE_PROPERTIES.length,
        inventoryCount: ENTERPRISE_DEVICE_INVENTORY.length,
        visibleMarkerCount: visibleRecords.length,
        safeCommandSimulation: true,
      }}
    >
      {ENTERPRISE_PROPERTIES.map((property, index) => (
        <PropertyNode key={property.id} index={index} />
      ))}
      {visibleRecords.map((record) => (
        <EnterpriseDeviceMarker key={record.id} record={record} />
      ))}
    </group>
  );
}
