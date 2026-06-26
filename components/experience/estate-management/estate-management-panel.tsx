"use client";

import {
  ESTATE_CUSTOMERS,
  ESTATE_GLOBAL_DASHBOARD,
  ESTATE_MANAGEMENT_REPORT,
  ESTATE_PROPERTY_TYPES,
  ESTATE_REPORT_TYPES,
  ESTATE_ROLES,
} from "@/lib/experience/estate-management";
import { useEstateManagementStore } from "@/lib/experience/stores";
import type { EstateOperationalStatus } from "@/types/experience";
import styles from "@/styles/experience/experience.module.css";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function formatNumber(value: number, maximumFractionDigits = 0) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits }).format(value);
}

function formatLabel(value: string) {
  return value.replace(/-/g, " ");
}

function statusClass(status: EstateOperationalStatus) {
  if (status === "online") return "bg-emerald-300/15 text-emerald-100";
  if (status === "maintenance") return "bg-sky-300/15 text-sky-100";
  if (status === "warning") return "bg-amber-300/15 text-amber-100";
  return "bg-rose-300/15 text-rose-100";
}

export function EstateManagementPanel() {
  const selectedPropertyType = useEstateManagementStore((state) => state.selectedPropertyType);
  const visibleProperties = useEstateManagementStore((state) => state.visibleProperties);
  const selectedProperty = useEstateManagementStore((state) => state.selectedProperty);
  const selectedRole = useEstateManagementStore((state) => state.selectedRole);
  const selectedRolePolicy = useEstateManagementStore((state) => state.selectedRolePolicy);
  const selectedReportType = useEstateManagementStore((state) => state.selectedReportType);
  const selectedReports = useEstateManagementStore((state) => state.selectedReports);
  const selectProperty = useEstateManagementStore((state) => state.selectProperty);
  const setPropertyType = useEstateManagementStore((state) => state.setPropertyType);
  const setRole = useEstateManagementStore((state) => state.setRole);
  const setReportType = useEstateManagementStore((state) => state.setReportType);

  return (
    <div className="mt-4 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-medium">Estate Management</div>
          <div className={`${styles.muted} text-[10px]`}>
            {ESTATE_MANAGEMENT_REPORT.propertyCount} properties / {ESTATE_MANAGEMENT_REPORT.customerCount} customers
          </div>
        </div>
        <span className="rounded-full bg-cyan-300/15 px-2 py-1 text-[9px] font-semibold uppercase text-cyan-100">Portfolio</span>
      </div>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Global Dashboard</div>
        <dl className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
          <div><dt className={styles.muted}>Power</dt><dd>{formatNumber(ESTATE_GLOBAL_DASHBOARD.powerKw, 1)}kW</dd></div>
          <div><dt className={styles.muted}>Energy</dt><dd>{formatNumber(ESTATE_GLOBAL_DASHBOARD.monthlyEnergyKwh)}kWh/mo</dd></div>
          <div><dt className={styles.muted}>Security</dt><dd>{ESTATE_GLOBAL_DASHBOARD.securityScore}/100</dd></div>
          <div><dt className={styles.muted}>Automation</dt><dd>{ESTATE_GLOBAL_DASHBOARD.automationScore}/100</dd></div>
          <div><dt className={styles.muted}>Alerts</dt><dd>{ESTATE_GLOBAL_DASHBOARD.alertCount}</dd></div>
          <div><dt className={styles.muted}>Critical</dt><dd>{ESTATE_GLOBAL_DASHBOARD.criticalAlertCount}</dd></div>
          <div><dt className={styles.muted}>Maintenance</dt><dd>{formatCurrency(ESTATE_GLOBAL_DASHBOARD.maintenanceCost)}</dd></div>
          <div><dt className={styles.muted}>Asset Value</dt><dd>{formatCurrency(ESTATE_GLOBAL_DASHBOARD.assetValue)}</dd></div>
        </dl>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Property Types</div>
        <div className="mt-2 grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => setPropertyType("all")}
            className={`rounded-xl border px-2 py-2 text-[9px] font-semibold uppercase transition ${selectedPropertyType === "all" ? "border-cyan-200/40 bg-cyan-200/15 text-cyan-100" : "border-white/10 bg-black/15 text-white/65 hover:bg-white/10"}`}
          >
            All
          </button>
          {ESTATE_PROPERTY_TYPES.map((propertyType) => (
            <button
              key={propertyType}
              type="button"
              onClick={() => setPropertyType(propertyType)}
              className={`rounded-xl border px-2 py-2 text-[9px] font-semibold uppercase transition ${selectedPropertyType === propertyType ? "border-cyan-200/40 bg-cyan-200/15 text-cyan-100" : "border-white/10 bg-black/15 text-white/65 hover:bg-white/10"}`}
            >
              {formatLabel(propertyType)}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Map View</div>
        <div className="mt-2 max-h-36 space-y-1 overflow-y-auto pr-1">
          {visibleProperties.slice(0, 16).map((property) => (
            <button
              key={property.id}
              type="button"
              onClick={() => selectProperty(property.id)}
              className={`w-full rounded-xl border px-2 py-2 text-left text-[10px] transition ${selectedProperty?.id === property.id ? "border-cyan-200/40 bg-cyan-200/15" : "border-white/10 bg-black/10 hover:bg-white/10"}`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="truncate font-medium">{property.name}</span>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[8px] uppercase ${statusClass(property.status)}`}>{property.status}</span>
              </span>
              <span className={`${styles.muted} mt-1 flex justify-between gap-2`}>
                <span>{property.location.label}</span>
                <span>{property.connectivityPercent}% signal</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      {selectedProperty ? (
        <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
          <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Selected Property</div>
          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-xs font-semibold">{selectedProperty.name}</div>
              <div className={`${styles.muted} text-[10px] capitalize`}>{formatLabel(selectedProperty.propertyType)} / {selectedProperty.customerName}</div>
            </div>
            <span className={`rounded-full px-2 py-1 text-[9px] font-semibold uppercase ${statusClass(selectedProperty.status)}`}>{selectedProperty.status}</span>
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
            <div><dt className={styles.muted}>Blocks</dt><dd>{selectedProperty.blocks.length}</dd></div>
            <div><dt className={styles.muted}>Buildings</dt><dd>{selectedProperty.buildings.length}</dd></div>
            <div><dt className={styles.muted}>Floors</dt><dd>{selectedProperty.floors.length}</dd></div>
            <div><dt className={styles.muted}>Rooms</dt><dd>{selectedProperty.rooms.length}</dd></div>
            <div><dt className={styles.muted}>Devices</dt><dd>{selectedProperty.devices.length}</dd></div>
            <div><dt className={styles.muted}>Health</dt><dd>{selectedProperty.scores.health}/100</dd></div>
            <div><dt className={styles.muted}>Security</dt><dd>{selectedProperty.scores.security}/100</dd></div>
            <div><dt className={styles.muted}>Energy</dt><dd>{selectedProperty.scores.energy}/100</dd></div>
          </dl>
        </section>
      ) : null}

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Role Management</div>
        <div className="mt-2 grid grid-cols-2 gap-1">
          {ESTATE_ROLES.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setRole(role)}
              className={`rounded-xl border px-2 py-2 text-[9px] font-semibold uppercase transition ${selectedRole === role ? "border-cyan-200/40 bg-cyan-200/15 text-cyan-100" : "border-white/10 bg-black/15 text-white/65 hover:bg-white/10"}`}
            >
              {formatLabel(role)}
            </button>
          ))}
        </div>
        <p className={`${styles.muted} mt-2 text-[10px] leading-relaxed`}>
          {selectedRolePolicy ? `${selectedRolePolicy.label}: ${selectedRolePolicy.permissions.slice(0, 4).join(", ")}. Scope ${selectedRolePolicy.propertyScope}; ${selectedRolePolicy.propertyIds.length} properties.` : "No role policy selected."}
        </p>
      </section>

      {selectedProperty ? (
        <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
          <div className="text-[10px] font-medium uppercase tracking-[0.14em]">CRM Link</div>
          <dl className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
            <div><dt className={styles.muted}>Profile</dt><dd className="truncate">{selectedProperty.crm.customerProfileId}</dd></div>
            <div><dt className={styles.muted}>Projects</dt><dd>{selectedProperty.crm.projectHistory.length}</dd></div>
            <div><dt className={styles.muted}>Service</dt><dd>{selectedProperty.crm.serviceHistory.length}</dd></div>
            <div><dt className={styles.muted}>Warranty</dt><dd>{selectedProperty.crm.warranty.active ? "Active" : "Expired"}</dd></div>
            <div><dt className={styles.muted}>Contract</dt><dd className="capitalize">{selectedProperty.crm.maintenanceContract.level}</dd></div>
            <div><dt className={styles.muted}>SLA</dt><dd>{selectedProperty.crm.maintenanceContract.responseSlaHours}h</dd></div>
          </dl>
          <div className={`${styles.muted} mt-2 text-[10px] leading-relaxed`}>
            {ESTATE_CUSTOMERS.length} customer profiles are represented as internal Experience Engine CRM links. External CRM remains untouched.
          </div>
        </section>
      ) : null}

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Reports</div>
        <div className="mt-2 grid grid-cols-2 gap-1">
          {ESTATE_REPORT_TYPES.map((reportType) => (
            <button
              key={reportType}
              type="button"
              onClick={() => setReportType(reportType)}
              className={`rounded-xl border px-2 py-2 text-[9px] font-semibold uppercase transition ${selectedReportType === reportType ? "border-cyan-200/40 bg-cyan-200/15 text-cyan-100" : "border-white/10 bg-black/15 text-white/65 hover:bg-white/10"}`}
            >
              {formatLabel(reportType)}
            </button>
          ))}
        </div>
        <div className="mt-2 space-y-1">
          {selectedReports.map((report) => (
            <div key={report.id} className="rounded-xl border border-white/10 bg-black/15 p-2 text-[10px]">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{report.title}</span>
                <span>{report.valueLabel}</span>
              </div>
              <div className={styles.muted}>{report.trendLabel}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
