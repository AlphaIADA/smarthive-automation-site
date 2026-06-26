"use client";

import { Environment, Lightformer, Sky, SoftShadows } from "@react-three/drei";
import { Bloom, EffectComposer, N8AO } from "@react-three/postprocessing";
import type { EventBus } from "@/lib/experience/event-bus";
import { useModelAssetStore, useSettingsStore } from "@/lib/experience/stores";
import { SmartHiveAiAssistant } from "@/components/experience/ai/smarthive-ai-assistant";
import { ProductionGlbExperience } from "@/components/experience/assets/production-glb-experience";
import { BuildingAutomationSystem } from "@/components/experience/automation/building-automation-system";
import { SmartHiveCloud } from "@/components/experience/cloud/smarthive-cloud";
import { SmartHiveOsCommercialLaunch } from "@/components/experience/commercial-launch/smarthive-os-commercial-launch";
import { UniversalCommunicationLayer } from "@/components/experience/communication/universal-communication-layer";
import { CustomerConfigurator } from "@/components/experience/configuration/customer-configurator";
import { SmartDeviceFramework } from "@/components/experience/devices/smart-device-framework";
import { EnterpriseDeviceManagementPlatform } from "@/components/experience/device-management/enterprise-device-management-platform";
import { LuxuryInteriorDesignSystem } from "@/components/experience/design/luxury-interior-design-system";
import { DigitalTwinIntelligenceEngine } from "@/components/experience/digital-twin/digital-twin-intelligence-engine";
import { EnterpriseEnergyManagementSystem } from "@/components/experience/energy/enterprise-energy-management-system";
import { EstateManagementPlatform } from "@/components/experience/estate-management/estate-management-platform";
import { LuxuryFurnitureSystem } from "@/components/experience/furniture/luxury-furniture-system";
import { EnterpriseProductionHardening } from "@/components/experience/hardening/enterprise-production-hardening";
import { ImmersiveWalkExperience } from "@/components/experience/immersive/immersive-walk-experience";
import { InstallerPlatform } from "@/components/experience/installer/installer-platform";
import { InteriorArchitecture } from "@/components/experience/interior/interior-architecture";
import { SmartLightingEngine } from "@/components/experience/lighting/smart-lighting-engine";
import { SecurityOperationsCenter } from "@/components/experience/security/security-operations-center";
import { SmartSecurityPlatform } from "@/components/experience/security/smart-security-platform";
import { SignatureVilla } from "@/components/experience/villa/signature-villa";
import { SmartHiveVisionAi } from "@/components/experience/vision-ai/smarthive-vision-ai";
import { ExtendedRealityPlatform } from "@/components/experience/xr/extended-reality-platform";
import { CameraRig } from "./camera-rig";
import { PerformanceProbe } from "./performance-probe";

export function SignatureVillaScene({ eventBus }: { readonly eventBus: EventBus }) {
  const shadows = useSettingsStore((state) => state.shadows);
  const renderMode = useModelAssetStore((state) => state.renderMode);

  return (
    <>
      <color attach="background" args={["#a7c5dc"]} />
      <fog attach="fog" args={["#a7c5dc", 44, 92]} />
      <Sky distance={450000} sunPosition={[14, 10, 7]} turbidity={5.8} rayleigh={1.45} mieCoefficient={0.006} mieDirectionalG={0.72} />
      <Environment resolution={192} background={false}>
        <Lightformer intensity={2.3} position={[0, 12, -8]} scale={[24, 7, 1]} />
        <Lightformer intensity={1.15} position={[-16, 5, 5]} scale={[8, 8, 1]} />
        <Lightformer intensity={0.95} position={[18, 4, 4]} scale={[6, 8, 1]} />
      </Environment>
      <ambientLight intensity={0.42} color="#dceeff" />
      <hemisphereLight args={["#dcefff", "#6f7f6b", 0.62]} />
      <directionalLight
        castShadow={shadows}
        color="#fff2d7"
        intensity={2.45}
        position={[18, 18, 11]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={96}
        shadow-camera-left={-42}
        shadow-camera-right={42}
        shadow-camera-top={42}
        shadow-camera-bottom={-42}
        shadow-bias={-0.00018}
      />
      {shadows ? <SoftShadows size={18} samples={10} focus={0.48} /> : null}
      <ProductionGlbExperience eventBus={eventBus} />
      {renderMode === "procedural-fallback" ? (
        <>
          <SignatureVilla />
          <InteriorArchitecture eventBus={eventBus} />
          <LuxuryInteriorDesignSystem />
          <LuxuryFurnitureSystem />
          <SmartDeviceFramework eventBus={eventBus} />
          <SmartLightingEngine />
          <SmartSecurityPlatform />
          <SecurityOperationsCenter />
          <BuildingAutomationSystem />
          <EnterpriseEnergyManagementSystem />
          <SmartHiveAiAssistant />
          <CustomerConfigurator eventBus={eventBus} />
          <DigitalTwinIntelligenceEngine />
          <SmartHiveVisionAi />
          <ImmersiveWalkExperience />
          <UniversalCommunicationLayer />
          <EnterpriseDeviceManagementPlatform />
          <EstateManagementPlatform />
          <ExtendedRealityPlatform />
          <SmartHiveCloud />
          <InstallerPlatform />
          <EnterpriseProductionHardening />
          <SmartHiveOsCommercialLaunch />
        </>
      ) : null}
      <EffectComposer multisampling={shadows ? 4 : 0} enableNormalPass={false}>
        <N8AO aoRadius={4.2} distanceFalloff={1.6} intensity={0.42} />
        <Bloom mipmapBlur luminanceThreshold={1.35} luminanceSmoothing={0.18} intensity={0.16} />
      </EffectComposer>
      <CameraRig />
      <PerformanceProbe eventBus={eventBus} />
    </>
  );
}
