"use client";

import { useMemo } from "react";
import { BAS_DOMAINS, summarizeBasDomains } from "@/lib/experience/automation";
import type { BasDomain } from "@/types/experience";

const DOMAIN_COLORS: Record<BasDomain, string> = {
  lighting: "#ffd36e",
  curtains: "#c6a36d",
  hvac: "#70c2ff",
  audio: "#b48cff",
  security: "#ff6378",
  energy: "#8fe388",
  pool: "#61d7ff",
  garden: "#6edb8f",
  garage: "#a8b4c2",
  gate: "#99c27f",
  water: "#5fc9ff",
  appliances: "#ffb26b",
  "future-devices": "#d5e1ea",
};

function domainPosition(index: number, total: number): [number, number, number] {
  const angle = (index / total) * Math.PI * 2;
  return [Math.cos(angle) * 2.1, Math.sin(index * 0.83) * 0.18, Math.sin(angle) * 2.1];
}

export function BasNetworkRenderer() {
  const domainSummaries = useMemo(() => summarizeBasDomains(), []);

  return (
    <group
      name="SmartHive BAS network graph"
      position={[-2.25, 2.1, -2.45]}
      userData={{
        system: "building-automation-system",
        visualEditorReady: true,
        noAi: true,
      }}
    >
      <mesh name="bas-central-brain" castShadow>
        <sphereGeometry args={[0.32, 24, 16]} />
        <meshStandardMaterial color="#0f1a22" roughness={0.24} metalness={0.62} emissive="#6be4ff" emissiveIntensity={0.28} />
      </mesh>
      <mesh>
        <torusGeometry args={[0.46, 0.012, 8, 48]} />
        <meshBasicMaterial color="#6be4ff" transparent opacity={0.72} />
      </mesh>
      {domainSummaries.map(({ domain, endpoints }, index) => {
        const [x, y, z] = domainPosition(index, BAS_DOMAINS.length);
        const scale = Math.min(0.22, 0.08 + endpoints / 900);

        return (
          <group key={domain} name={`bas-domain-${domain}`} position={[x, y, z]}>
            <mesh castShadow>
              <sphereGeometry args={[scale, 14, 10]} />
              <meshStandardMaterial color={DOMAIN_COLORS[domain]} roughness={0.32} metalness={0.28} emissive={DOMAIN_COLORS[domain]} emissiveIntensity={0.16} />
            </mesh>
            <mesh position={[-x / 2, -y / 2, -z / 2]} rotation={[0, Math.atan2(x, z), Math.PI / 2]}>
              <cylinderGeometry args={[0.008, 0.008, Math.hypot(x, y, z), 8]} />
              <meshBasicMaterial color={DOMAIN_COLORS[domain]} transparent opacity={0.3} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
