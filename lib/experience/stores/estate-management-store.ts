import { create } from "zustand";
import {
  ESTATE_PROPERTIES,
  ESTATE_REPORTS,
  getEstateProperty,
  getEstateReports,
  getEstateRolePolicy,
} from "@/lib/experience/estate-management";
import type { EstatePropertyRecord, EstatePropertyType, EstateReportCard, EstateReportType, EstateRole, EstateRolePolicy } from "@/types/experience";

type EstatePropertyTypeFilter = EstatePropertyType | "all";

interface EstateManagementStoreState {
  selectedPropertyId: string;
  selectedPropertyType: EstatePropertyTypeFilter;
  selectedRole: EstateRole;
  selectedReportType: EstateReportType;
  visibleProperties: readonly EstatePropertyRecord[];
  selectedProperty: EstatePropertyRecord | null;
  selectedRolePolicy: EstateRolePolicy | null;
  selectedReports: readonly EstateReportCard[];
  selectProperty: (propertyId: string) => void;
  setPropertyType: (propertyType: EstatePropertyTypeFilter) => void;
  setRole: (role: EstateRole) => void;
  setReportType: (reportType: EstateReportType) => void;
}

const initialProperty = ESTATE_PROPERTIES[0] ?? null;
const initialRolePolicy = getEstateRolePolicy("owner");

function propertiesForType(propertyType: EstatePropertyTypeFilter) {
  if (propertyType === "all") return ESTATE_PROPERTIES;
  return ESTATE_PROPERTIES.filter((property) => property.propertyType === propertyType);
}

export const useEstateManagementStore = create<EstateManagementStoreState>((set, get) => ({
  selectedPropertyId: initialProperty?.id ?? "",
  selectedPropertyType: "all",
  selectedRole: "owner",
  selectedReportType: "building-health",
  visibleProperties: ESTATE_PROPERTIES,
  selectedProperty: initialProperty,
  selectedRolePolicy: initialRolePolicy,
  selectedReports: initialProperty ? getEstateReports(initialProperty.id, "building-health") : [],
  selectProperty: (selectedPropertyId) => {
    const selectedProperty = getEstateProperty(selectedPropertyId);
    set({
      selectedPropertyId,
      selectedProperty,
      selectedReports: selectedProperty ? getEstateReports(selectedProperty.id, get().selectedReportType) : [],
    });
  },
  setPropertyType: (selectedPropertyType) => {
    const visibleProperties = propertiesForType(selectedPropertyType);
    const selectedProperty = visibleProperties[0] ?? get().selectedProperty;
    set({
      selectedPropertyType,
      visibleProperties,
      selectedProperty,
      selectedPropertyId: selectedProperty?.id ?? "",
      selectedReports: selectedProperty ? getEstateReports(selectedProperty.id, get().selectedReportType) : [],
    });
  },
  setRole: (selectedRole) => set({ selectedRole, selectedRolePolicy: getEstateRolePolicy(selectedRole) }),
  setReportType: (selectedReportType) => {
    const selectedPropertyId = get().selectedPropertyId;
    set({
      selectedReportType,
      selectedReports: ESTATE_REPORTS.filter((report) => report.propertyId === selectedPropertyId && report.type === selectedReportType),
    });
  },
}));
