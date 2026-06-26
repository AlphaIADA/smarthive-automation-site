"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import { Color, Euler, InstancedMesh, Matrix4, Quaternion, Vector3 } from "three";
import { LIGHTING_FIXTURE_COLORS, LIGHTING_FIXTURES, LIGHTING_REAL_LIGHTS } from "@/lib/experience/lighting/lighting-catalog";
import { resolveLightingFixture } from "@/lib/experience/lighting/lighting-controls";
import { useLightingStore, useSettingsStore } from "@/lib/experience/stores";
import type { LightingFixtureSpec, LightingPlaceholderShape, ResolvedLightingFixture } from "@/types/experience";

interface LightingBatch {
  readonly key: string;
  readonly shape: LightingPlaceholderShape;
  readonly type: LightingFixtureSpec["type"];
  readonly fixtures: readonly LightingFixtureSpec[];
}

function temperatureColor(kelvin: number) {
  const temperature = kelvin / 100;
  let red: number;
  let green: number;
  let blue: number;

  if (temperature <= 66) {
    red = 255;
    green = 99.4708025861 * Math.log(temperature) - 161.1195681661;
    blue = temperature <= 19 ? 0 : 138.5177312231 * Math.log(temperature - 10) - 305.0447927307;
  } else {
    red = 329.698727446 * (temperature - 60) ** -0.1332047592;
    green = 288.1221695283 * (temperature - 60) ** -0.0755148492;
    blue = 255;
  }

  return new Color(Math.min(255, Math.max(0, red)) / 255, Math.min(255, Math.max(0, green)) / 255, Math.min(255, Math.max(0, blue)) / 255);
}

function fixtureColor(fixture: ResolvedLightingFixture) {
  const base = new Color(fixture.controls.colour || LIGHTING_FIXTURE_COLORS[fixture.type]);
  const thermal = temperatureColor(fixture.controls.temperatureKelvin);
  const intensity = fixture.controls.enabled ? Math.max(0.1, fixture.controls.brightnessPercent / 100) : 0.08;

  return base.lerp(thermal, 0.42).multiplyScalar(intensity);
}

function composeFixtureMatrix(fixture: ResolvedLightingFixture) {
  const { position, rotation, size } = fixture.render;
  const visibleScale = fixture.controls.enabled ? Math.max(0.62, fixture.controls.brightnessPercent / 100) : 0.42;

  return new Matrix4().compose(
    new Vector3(position[0], position[1], position[2]),
    new Quaternion().setFromEuler(new Euler(rotation?.[0] ?? 0, rotation?.[1] ?? 0, rotation?.[2] ?? 0)),
    new Vector3(size[0] * visibleScale, size[1], size[2] * visibleScale),
  );
}

function createLightingBatches(fixtures: readonly LightingFixtureSpec[]): readonly LightingBatch[] {
  const batches = new Map<string, { shape: LightingPlaceholderShape; type: LightingFixtureSpec["type"]; fixtures: LightingFixtureSpec[] }>();

  fixtures.forEach((fixture) => {
    const key = `${fixture.render.shape}:${fixture.type}`;
    const batch = batches.get(key) ?? { shape: fixture.render.shape, type: fixture.type, fixtures: [] };
    batch.fixtures.push(fixture);
    batches.set(key, batch);
  });

  return Array.from(batches.entries()).map(([key, batch]) => ({ key, ...batch }));
}

function LightingGeometry({ shape }: { readonly shape: LightingPlaceholderShape }) {
  if (shape === "disc") return <cylinderGeometry args={[1, 1, 1, 20]} />;
  if (shape === "bar") return <boxGeometry args={[1, 1, 1]} />;
  if (shape === "pendant") return <sphereGeometry args={[1, 18, 12]} />;
  if (shape === "sphere") return <sphereGeometry args={[1, 16, 10]} />;
  if (shape === "panel") return <boxGeometry args={[1, 1, 1]} />;
  if (shape === "stake") return <cylinderGeometry args={[0.45, 0.7, 1, 10]} />;
  return <cylinderGeometry args={[1, 1, 1, 14]} />;
}

function LightingBatchMesh({ batch }: { readonly batch: LightingBatch }) {
  const meshRef = useRef<InstancedMesh>(null);
  const selectedLightId = useLightingStore((state) => state.selectedLightId);
  const overrides = useLightingStore((state) => state.overrides);
  const selectLight = useLightingStore((state) => state.selectLight);
  const selectedInBatch = selectedLightId ? batch.fixtures.some((fixture) => fixture.id === selectedLightId) : false;

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    batch.fixtures.forEach((fixture, index) => {
      const resolvedFixture = resolveLightingFixture(fixture, overrides);
      mesh.setMatrixAt(index, composeFixtureMatrix(resolvedFixture));
      mesh.setColorAt(index, fixtureColor(resolvedFixture));
    });

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [batch, overrides]);

  return (
    <instancedMesh
      ref={meshRef}
      name={`lighting-fixture-batch-${batch.key}`}
      args={[undefined, undefined, batch.fixtures.length]}
      castShadow={batch.type !== "emergency-lights"}
      receiveShadow
      onClick={(event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation();
        const fixture = typeof event.instanceId === "number" ? batch.fixtures[event.instanceId] : null;
        if (fixture) selectLight(fixture.id);
      }}
      userData={{
        batchKey: batch.key,
        fixtureType: batch.type,
        fixtureIds: batch.fixtures.map((fixture) => fixture.id),
        lightingEngine: true,
        pbr: true,
        reusable: true,
        controls: ["toggle", "brightness", "colour", "temperature", "group", "rename"],
        ai: false,
        scenes: false,
        voice: false,
      }}
    >
      <LightingGeometry shape={batch.shape} />
      <meshStandardMaterial
        vertexColors
        color="#ffffff"
        roughness={0.28}
        metalness={0.26}
        emissive={LIGHTING_FIXTURE_COLORS[batch.type]}
        emissiveIntensity={selectedInBatch ? 0.58 : 0.26}
        toneMapped={false}
      />
    </instancedMesh>
  );
}

function RealLightingLayer() {
  const shadows = useSettingsStore((state) => state.shadows);
  const overrides = useLightingStore((state) => state.overrides);

  return (
    <>
      {LIGHTING_REAL_LIGHTS.map((fixture, index) => {
        const resolvedFixture = resolveLightingFixture(fixture, overrides);
        if (!resolvedFixture.controls.enabled || resolvedFixture.controls.brightnessPercent <= 0) return null;

        const [x, y, z] = resolvedFixture.render.position;
        const intensity = resolvedFixture.intensity * (resolvedFixture.controls.brightnessPercent / 100);
        const color = fixtureColor(resolvedFixture);
        const castShadow = shadows && index < 4 && resolvedFixture.shadowQuality === "premium";

        if (resolvedFixture.type === "spotlights" || resolvedFixture.type === "track-lights" || resolvedFixture.type === "garden-lights") {
          return (
            <spotLight
              key={resolvedFixture.id}
              color={color}
              intensity={intensity * 3.2}
              position={[x, y, z]}
              angle={Math.max(0.18, (resolvedFixture.beamAngle * Math.PI) / 360)}
              penumbra={0.62}
              distance={resolvedFixture.type === "garden-lights" ? 9 : 6.4}
              decay={2}
              castShadow={castShadow}
              shadow-mapSize-width={512}
              shadow-mapSize-height={512}
            />
          );
        }

        return (
          <pointLight
            key={resolvedFixture.id}
            color={color}
            intensity={intensity * 1.85}
            position={[x, y, z]}
            distance={resolvedFixture.type === "pool-lights" ? 5.8 : 4.8}
            decay={2}
            castShadow={castShadow}
            shadow-mapSize-width={512}
            shadow-mapSize-height={512}
          />
        );
      })}
    </>
  );
}

function SelectedLightMarker() {
  const selectedLightId = useLightingStore((state) => state.selectedLightId);
  const fixture = selectedLightId ? LIGHTING_FIXTURES.find((candidate) => candidate.id === selectedLightId) : null;
  if (!fixture) return null;

  const [x, y, z] = fixture.render.position;

  return (
    <group name={`selected-light-marker-${fixture.id}`} position={[x, y + 0.1, z]}>
      <mesh>
        <sphereGeometry args={[0.1, 16, 10]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.78} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.24, 0.015, 8, 30]} />
        <meshBasicMaterial color="#ffd36e" toneMapped={false} />
      </mesh>
    </group>
  );
}

export function LightingRenderer() {
  const batches = useMemo(() => createLightingBatches(LIGHTING_FIXTURES), []);

  return (
    <group name="SmartHive Lighting and Electrical Engine">
      <RealLightingLayer />
      {batches.map((batch) => (
        <LightingBatchMesh key={batch.key} batch={batch} />
      ))}
      <SelectedLightMarker />
    </group>
  );
}
