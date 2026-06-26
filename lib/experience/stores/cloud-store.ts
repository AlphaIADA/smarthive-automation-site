import { create } from "zustand";
import {
  CLOUD_BACKUP_PACKAGES,
  CLOUD_CLIENT_PROFILES,
  CLOUD_CONFLICTS,
  CLOUD_SYNC_TARGETS,
  ResolveCloudConflict,
  SyncCloudTarget,
} from "@/lib/experience/cloud";
import type {
  CloudBackupKind,
  CloudBackupPackage,
  CloudClientDevice,
  CloudClientProfile,
  CloudConflictRecord,
  CloudConflictStrategy,
  CloudEntityKind,
  CloudSyncResult,
  CloudSyncTarget,
} from "@/types/experience";

type CloudEntityFilter = CloudEntityKind | "all";

interface CloudStoreState {
  selectedTargetId: string;
  selectedBackupKind: CloudBackupKind;
  selectedClientDevice: CloudClientDevice;
  selectedConflictId: string;
  targetFilter: CloudEntityFilter;
  visibleTargets: readonly CloudSyncTarget[];
  selectedTarget: CloudSyncTarget | null;
  selectedBackup: CloudBackupPackage | null;
  selectedClient: CloudClientProfile | null;
  selectedConflict: CloudConflictRecord | null;
  syncResult: CloudSyncResult | null;
  resolvedConflict: CloudConflictRecord | null;
  selectTarget: (targetId: string) => void;
  setTargetFilter: (filter: CloudEntityFilter) => void;
  selectBackupKind: (kind: CloudBackupKind) => void;
  selectClientDevice: (device: CloudClientDevice) => void;
  selectConflict: (conflictId: string) => void;
  runSync: () => void;
  resolveConflict: (strategy: CloudConflictStrategy) => void;
}

const initialTarget = CLOUD_SYNC_TARGETS[0] ?? null;
const initialBackup = CLOUD_BACKUP_PACKAGES[0] ?? null;
const initialClient = CLOUD_CLIENT_PROFILES[0] ?? null;
const initialConflict = CLOUD_CONFLICTS[0] ?? null;

function targetsForFilter(filter: CloudEntityFilter) {
  if (filter === "all") return CLOUD_SYNC_TARGETS;
  return CLOUD_SYNC_TARGETS.filter((target) => target.kind === filter);
}

export const useCloudStore = create<CloudStoreState>((set, get) => ({
  selectedTargetId: initialTarget?.id ?? "",
  selectedBackupKind: initialBackup?.kind ?? "project",
  selectedClientDevice: initialClient?.device ?? "desktop",
  selectedConflictId: initialConflict?.id ?? "",
  targetFilter: "all",
  visibleTargets: CLOUD_SYNC_TARGETS,
  selectedTarget: initialTarget,
  selectedBackup: initialBackup,
  selectedClient: initialClient,
  selectedConflict: initialConflict,
  syncResult: null,
  resolvedConflict: null,
  selectTarget: (selectedTargetId) =>
    set({
      selectedTargetId,
      selectedTarget: CLOUD_SYNC_TARGETS.find((target) => target.id === selectedTargetId) ?? null,
    }),
  setTargetFilter: (targetFilter) => {
    const visibleTargets = targetsForFilter(targetFilter);
    const selectedTarget = visibleTargets[0] ?? get().selectedTarget;
    set({
      targetFilter,
      visibleTargets,
      selectedTarget,
      selectedTargetId: selectedTarget?.id ?? "",
    });
  },
  selectBackupKind: (selectedBackupKind) =>
    set({
      selectedBackupKind,
      selectedBackup: CLOUD_BACKUP_PACKAGES.find((backup) => backup.kind === selectedBackupKind) ?? null,
    }),
  selectClientDevice: (selectedClientDevice) =>
    set({
      selectedClientDevice,
      selectedClient: CLOUD_CLIENT_PROFILES.find((client) => client.device === selectedClientDevice) ?? null,
    }),
  selectConflict: (selectedConflictId) =>
    set({
      selectedConflictId,
      selectedConflict: CLOUD_CONFLICTS.find((conflict) => conflict.id === selectedConflictId) ?? null,
    }),
  runSync: () => set({ syncResult: SyncCloudTarget(get().selectedTargetId) }),
  resolveConflict: (strategy) => set({ resolvedConflict: ResolveCloudConflict(get().selectedConflictId, strategy) }),
}));
