import { create } from "zustand";
import {
  CompleteInstallerTask,
  GenerateInstallationReport,
  INSTALLER_MATERIALS,
  INSTALLER_PROJECT_WORKFLOWS,
  INSTALLER_REPORTS,
  INSTALLER_ROOM_CHECKLISTS,
  INSTALLER_TASKS,
  RegisterInstallerDevice,
} from "@/lib/experience/installer";
import type {
  InstallerMaterialLineItem,
  InstallerProjectWorkflow,
  InstallerReportArtifact,
  InstallerReportType,
  InstallerRoomChecklist,
  InstallerTask,
  InstallerWarehouseStatus,
  InstallerQrRegistration,
} from "@/types/experience";

type InstallerMaterialFilter = InstallerWarehouseStatus | "all";

interface InstallerStoreState {
  selectedProjectId: string;
  selectedRoomId: string;
  selectedTaskId: string;
  selectedReportType: InstallerReportType;
  materialFilter: InstallerMaterialFilter;
  selectedWorkflow: InstallerProjectWorkflow | null;
  selectedRoomChecklist: InstallerRoomChecklist | null;
  selectedTask: InstallerTask | null;
  selectedReport: InstallerReportArtifact | null;
  visibleMaterials: readonly InstallerMaterialLineItem[];
  completedTask: InstallerTask | null;
  qrRegistration: InstallerQrRegistration | null;
  selectProject: (projectId: string) => void;
  selectRoom: (roomId: string) => void;
  selectTask: (taskId: string) => void;
  selectReportType: (reportType: InstallerReportType) => void;
  setMaterialFilter: (filter: InstallerMaterialFilter) => void;
  completeSelectedTask: () => void;
  registerFirstRoomDevice: () => void;
}

const initialWorkflow = INSTALLER_PROJECT_WORKFLOWS[0] ?? null;
const initialRoomChecklist = INSTALLER_ROOM_CHECKLISTS[0] ?? null;
const initialTask = INSTALLER_TASKS[0] ?? null;
const initialReport = INSTALLER_REPORTS[0] ?? null;

function materialsForFilter(filter: InstallerMaterialFilter) {
  if (filter === "all") return INSTALLER_MATERIALS;
  return INSTALLER_MATERIALS.filter((materialLine) => materialLine.warehouseStatus === filter);
}

export const useInstallerStore = create<InstallerStoreState>((set, get) => ({
  selectedProjectId: initialWorkflow?.projectId ?? "",
  selectedRoomId: initialRoomChecklist?.roomId ?? "",
  selectedTaskId: initialTask?.id ?? "",
  selectedReportType: initialReport?.type ?? "installation-report",
  materialFilter: "all",
  selectedWorkflow: initialWorkflow,
  selectedRoomChecklist: initialRoomChecklist,
  selectedTask: initialTask,
  selectedReport: initialReport,
  visibleMaterials: INSTALLER_MATERIALS,
  completedTask: null,
  qrRegistration: null,
  selectProject: (selectedProjectId) =>
    set({
      selectedProjectId,
      selectedWorkflow: INSTALLER_PROJECT_WORKFLOWS.find((workflow) => workflow.projectId === selectedProjectId) ?? null,
    }),
  selectRoom: (selectedRoomId) =>
    set({
      selectedRoomId,
      selectedRoomChecklist: INSTALLER_ROOM_CHECKLISTS.find((checklist) => checklist.roomId === selectedRoomId) ?? null,
      qrRegistration: null,
    }),
  selectTask: (selectedTaskId) =>
    set({
      selectedTaskId,
      selectedTask: INSTALLER_TASKS.find((task) => task.id === selectedTaskId) ?? null,
      completedTask: null,
    }),
  selectReportType: (selectedReportType) =>
    set({
      selectedReportType,
      selectedReport: GenerateInstallationReport(selectedReportType),
    }),
  setMaterialFilter: (materialFilter) =>
    set({
      materialFilter,
      visibleMaterials: materialsForFilter(materialFilter),
    }),
  completeSelectedTask: () => set({ completedTask: CompleteInstallerTask(get().selectedTaskId) }),
  registerFirstRoomDevice: () => {
    const selectedRoom = get().selectedRoomChecklist;
    const firstDeviceId = selectedRoom?.requiredDeviceIds[0];
    set({ qrRegistration: firstDeviceId ? RegisterInstallerDevice(firstDeviceId) : null });
  },
}));
