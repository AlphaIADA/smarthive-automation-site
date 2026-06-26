"use client";

import { motion } from "framer-motion";
import { AiAssistantPanel } from "@/components/experience/ai/ai-assistant-panel";
import { BasDashboardPanel } from "@/components/experience/automation/bas-dashboard-panel";
import { HotspotInspectorPanel } from "@/components/experience/assets/hotspot-inspector-panel";
import { CloudSyncPanel } from "@/components/experience/cloud/cloud-sync-panel";
import { CommercialLaunchPanel } from "@/components/experience/commercial-launch/commercial-launch-panel";
import { CommunicationLayerPanel } from "@/components/experience/communication/communication-layer-panel";
import { ConfigurationPanel } from "@/components/experience/configuration/configuration-panel";
import { EnterpriseDeviceManagementPanel } from "@/components/experience/device-management/enterprise-device-management-panel";
import { DeviceInspectorPanel } from "@/components/experience/devices/device-inspector-panel";
import { DigitalTwinPanel } from "@/components/experience/digital-twin/digital-twin-panel";
import { EnergyDashboardPanel } from "@/components/experience/energy/energy-dashboard-panel";
import { EstateManagementPanel } from "@/components/experience/estate-management/estate-management-panel";
import { ProductionHardeningPanel } from "@/components/experience/hardening/production-hardening-panel";
import { ImmersiveWalkPanel } from "@/components/experience/immersive/immersive-walk-panel";
import { InstallerDashboardPanel } from "@/components/experience/installer/installer-dashboard-panel";
import { LightingControlPanel } from "@/components/experience/lighting/lighting-control-panel";
import { SecurityDashboardPanel } from "@/components/experience/security/security-dashboard-panel";
import { SecurityOperationsCenterPanel } from "@/components/experience/security/security-operations-center-panel";
import { VisionAiPanel } from "@/components/experience/vision-ai/vision-ai-panel";
import { XrPlatformPanel } from "@/components/experience/xr/xr-platform-panel";
import type { EventBus } from "@/lib/experience/event-bus";
import { useExperienceStore, usePluginStore, useSelectionStore, useSettingsStore } from "@/lib/experience/stores";
import styles from "@/styles/experience/experience.module.css";

export function RightInspector({ eventBus }: { readonly eventBus: EventBus }) {
  const managerCount = useExperienceStore((state) => state.managerCount);
  const status = useExperienceStore((state) => state.status);
  const plugins = usePluginStore((state) => state.plugins);
  const selection = useSelectionStore((state) => state.kind);
  const shadows = useSettingsStore((state) => state.shadows);
  const setShadows = useSettingsStore((state) => state.setShadows);

  return (
    <motion.aside
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.12 }}
      className={`${styles.glass} absolute bottom-16 right-5 top-20 z-10 hidden w-64 overflow-y-auto rounded-3xl p-4 lg:block`}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">Inspector</div>
          <div className={`${styles.muted} text-[10px] uppercase tracking-[0.18em]`}>Digital twin</div>
        </div>
        <span className={`rounded-full px-2 py-1 text-[10px] font-medium uppercase ${status === "ready" ? "bg-emerald-300/15 text-emerald-200" : "bg-amber-300/15 text-amber-100"}`}>{status}</span>
      </div>
      <div className="my-4 h-px bg-white/10" />
      <dl className="space-y-3 text-xs">
        <div className="flex justify-between"><dt className={styles.muted}>Scene</dt><dd>Signature Villa</dd></div>
        <div className="flex justify-between"><dt className={styles.muted}>Selection</dt><dd className="capitalize">{selection}</dd></div>
        <div className="flex justify-between"><dt className={styles.muted}>Managers</dt><dd>{managerCount}/24</dd></div>
        <div className="flex justify-between"><dt className={styles.muted}>Plugins</dt><dd>{plugins.length} planned</dd></div>
      </dl>
      <div className="my-4 h-px bg-white/10" />
      <div className="text-[10px] font-medium uppercase tracking-[0.18em]">Rendering</div>
      <label className="mt-3 flex cursor-pointer items-center justify-between rounded-2xl border border-white/10 bg-black/10 px-3 py-3 text-xs">
        Soft shadows
        <input className="sr-only" type="checkbox" checked={shadows} onChange={(event) => setShadows(event.target.checked)} />
        <span aria-hidden className={`relative h-5 w-9 rounded-full transition ${shadows ? "bg-sky-400" : "bg-white/15"}`}><span className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition ${shadows ? "left-[18px]" : "left-0.5"}`} /></span>
      </label>
      <div className="mt-4 rounded-2xl border border-white/10 bg-black/10 p-3">
        <div className="text-xs font-medium">Scene contents</div>
        <ul className={`${styles.muted} mt-2 space-y-1 text-[11px]`}>
          <li>SmartHive OS 1.0 ready</li><li>Production hardening ready</li><li>Installer platform ready</li><li>SmartHive Cloud ready</li>
        </ul>
      </div>
      <HotspotInspectorPanel />
      <CommercialLaunchPanel />
      <ProductionHardeningPanel />
      <InstallerDashboardPanel />
      <CloudSyncPanel />
      <XrPlatformPanel />
      <EstateManagementPanel />
      <EnterpriseDeviceManagementPanel />
      <CommunicationLayerPanel />
      <ImmersiveWalkPanel eventBus={eventBus} />
      <VisionAiPanel />
      <DigitalTwinPanel />
      <ConfigurationPanel />
      <AiAssistantPanel />
      <SecurityOperationsCenterPanel />
      <EnergyDashboardPanel />
      <BasDashboardPanel />
      <SecurityDashboardPanel />
      <LightingControlPanel />
      <DeviceInspectorPanel eventBus={eventBus} />
    </motion.aside>
  );
}
