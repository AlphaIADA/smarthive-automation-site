"use client";

import { CLOUD_BACKUP_PACKAGES, CLOUD_OFFLINE_CACHE, CLOUD_SYNC_TARGETS, SMARTHIVE_CLOUD_REPORT } from "@/lib/experience/cloud";
import { useCloudStore } from "@/lib/experience/stores";
import type { CloudSyncStatus } from "@/types/experience";

const STATUS_COLORS: Record<CloudSyncStatus, string> = {
  synced: "#8ff0c7",
  pending: "#ffd36e",
  queued: "#79d8ff",
  conflict: "#ff6378",
  "offline-cached": "#d4c1ff",
};

function syncPosition(index: number): readonly [number, number, number] {
  const column = index % 6;
  const row = Math.floor(index / 6);
  return [-4.5 + column * 1.8, 10.2 - row * 0.2, -13.4 + row * 1.4] as const;
}

function CloudSyncNode({ targetId, index }: { readonly targetId: string; readonly index: number }) {
  const selectedTargetId = useCloudStore((state) => state.selectedTargetId);
  const selectTarget = useCloudStore((state) => state.selectTarget);
  const target = CLOUD_SYNC_TARGETS.find((candidate) => candidate.id === targetId);
  if (!target) return null;

  const active = selectedTargetId === target.id;
  const color = STATUS_COLORS[target.status];
  const [x, y, z] = syncPosition(index);

  return (
    <group
      name={`cloud-sync-node-${target.id}`}
      position={[x, y, z]}
      userData={{
        milestone: 22,
        cloudSyncTarget: true,
        targetId: target.id,
        entityKind: target.kind,
        sourceSystem: target.sourceSystem,
        status: target.status,
        encryptionEnabled: target.encryptionEnabled,
        offlineCacheEnabled: target.offlineCacheEnabled,
      }}
    >
      <mesh onClick={() => selectTarget(target.id)}>
        <sphereGeometry args={[active ? 0.18 : 0.1, 14, 10]} />
        <meshBasicMaterial color={color} transparent opacity={active ? 0.92 : 0.56} toneMapped={false} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[active ? 0.42 : 0.28, 0.01, 8, 42]} />
        <meshBasicMaterial color={color} transparent opacity={active ? 0.36 : 0.18} toneMapped={false} />
      </mesh>
    </group>
  );
}

function BackupRing() {
  return (
    <group name="smarthive-cloud-backup-ring" position={[8.2, 9.95, -12.4]}>
      {CLOUD_BACKUP_PACKAGES.map((backup, index) => (
        <mesh
          key={backup.id}
          name={`cloud-backup-${backup.kind}`}
          position={[Math.cos(index) * 0.9, Math.sin(index * 0.7) * 0.2, Math.sin(index) * 0.9]}
          userData={{
            cloudBackup: true,
            kind: backup.kind,
            itemCount: backup.itemCount,
            encrypted: backup.encrypted,
            restorable: backup.restorable,
          }}
        >
          <boxGeometry args={[0.12, 0.12, 0.12]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.46} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function OfflineCacheBand() {
  return (
    <group name="smarthive-cloud-offline-cache-band" position={[-8.2, 9.95, -12.4]}>
      {CLOUD_OFFLINE_CACHE.slice(0, 12).map((cache, index) => (
        <mesh
          key={cache.id}
          name={`cloud-cache-${cache.entityKind}`}
          position={[index * 0.16 - 0.88, cache.dirty ? 0.18 : 0, 0]}
          userData={{
            offlineCache: true,
            entityKind: cache.entityKind,
            dirty: cache.dirty,
            backgroundSyncQueued: cache.backgroundSyncQueued,
          }}
        >
          <boxGeometry args={[0.1, cache.backgroundSyncQueued ? 0.28 : 0.16, 0.1]} />
          <meshBasicMaterial color={cache.backgroundSyncQueued ? "#ffd36e" : "#8ff0c7"} transparent opacity={0.5} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

export function CloudSyncRenderer() {
  return (
    <group
      name="SmartHive Cloud Sync Renderer"
      userData={{
        milestone: 22,
        smarthiveCloud: true,
        syncTargetCount: SMARTHIVE_CLOUD_REPORT.targetCount,
        backupCount: SMARTHIVE_CLOUD_REPORT.backupCount,
        offlineCacheCount: SMARTHIVE_CLOUD_REPORT.offlineCacheCount,
        realCloudConnection: "not-created",
      }}
    >
      {CLOUD_SYNC_TARGETS.map((target, index) => (
        <CloudSyncNode key={target.id} targetId={target.id} index={index} />
      ))}
      <BackupRing />
      <OfflineCacheBand />
    </group>
  );
}
