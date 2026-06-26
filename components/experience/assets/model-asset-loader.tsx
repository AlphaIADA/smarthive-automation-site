"use client";

import { Component, Suspense, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Html, useGLTF, useProgress } from "@react-three/drei";
import { Mesh } from "three";
import type { ExperienceModelAsset, ExperienceModelAssetStatus } from "@/types/experience";
import { useModelAssetStore } from "@/lib/experience/stores";
import styles from "@/styles/experience/experience.module.css";

interface ModelErrorBoundaryProps {
  readonly asset: ExperienceModelAsset;
  readonly children: ReactNode;
  readonly onError: (message: string) => void;
}

interface ModelErrorBoundaryState {
  readonly hasError: boolean;
  readonly message: string | null;
}

class ModelErrorBoundary extends Component<ModelErrorBoundaryProps, ModelErrorBoundaryState> {
  state: ModelErrorBoundaryState = { hasError: false, message: null };

  static getDerivedStateFromError(error: unknown): ModelErrorBoundaryState {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : "Model parsing failed.",
    };
  }

  componentDidCatch(error: unknown) {
    this.props.onError(error instanceof Error ? error.message : "Model parsing failed.");
  }

  render() {
    if (this.state.hasError) {
      return this.props.asset.required ? <ModelFailureNotice label={this.props.asset.label} message={this.state.message} /> : null;
    }

    return this.props.children;
  }
}

function ModelFailureNotice({ label, message }: { readonly label: string; readonly message: string | null }) {
  return (
    <Html center>
      <div className={`${styles.glass} w-72 rounded-3xl border border-red-300/25 p-4 text-center text-white shadow-2xl`}>
        <div className="text-sm font-semibold">{label} could not be loaded</div>
        <p className="mt-2 text-xs text-white/65">{message ?? "The GLB exists but could not be parsed. Re-export or optimize the model and reload."}</p>
      </div>
    </Html>
  );
}

function LoadingProgress({ label }: { readonly label: string }) {
  const { active, progress, item } = useProgress();
  if (!active) return null;

  return (
    <Html center>
      <div className={`${styles.glass} w-72 rounded-3xl border border-white/15 p-4 text-center text-white shadow-2xl`}>
        <div className="text-sm font-semibold">{label}</div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-sky-300 transition-all" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
        </div>
        <p className="mt-2 truncate text-[10px] text-white/55">{item || "Preparing production model"}</p>
      </div>
    </Html>
  );
}

function LoadedGlbModel({ asset }: { readonly asset: ExperienceModelAsset }) {
  const gltf = useGLTF(asset.url);
  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);
  const setAssetStatus = useModelAssetStore((state) => state.setAssetStatus);

  useEffect(() => {
    scene.traverse((object) => {
      if (object instanceof Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;
        object.frustumCulled = true;
      }
    });
    setAssetStatus(asset.id, "available", 100, `${asset.fileName} loaded`);
  }, [asset.fileName, asset.id, scene, setAssetStatus]);

  return (
    <group
      name={`glb-asset-${asset.id}`}
      position={asset.position ?? [0, 0, 0]}
      rotation={asset.rotation ?? [0, 0, 0]}
      scale={asset.scale ?? [1, 1, 1]}
    >
      <primitive object={scene} />
    </group>
  );
}

function statusFromResponse(response: Response): ExperienceModelAssetStatus {
  return response.ok ? "available" : "missing";
}

export function CheckedModelAsset({ asset }: { readonly asset: ExperienceModelAsset }) {
  const [localStatus, setLocalStatus] = useState<ExperienceModelAssetStatus>("idle");
  const setAssetStatus = useModelAssetStore((state) => state.setAssetStatus);

  useEffect(() => {
    const controller = new AbortController();

    async function checkAvailability() {
      setLocalStatus("checking");
      setAssetStatus(asset.id, "checking", 8, `Checking ${asset.fileName}`);

      try {
        const response = await fetch(asset.url, {
          method: "HEAD",
          cache: "no-store",
          signal: controller.signal,
        });
        const nextStatus = statusFromResponse(response);
        setLocalStatus(nextStatus);
        setAssetStatus(
          asset.id,
          nextStatus,
          nextStatus === "available" ? 35 : 0,
          nextStatus === "available" ? `${asset.fileName} found` : `${asset.fileName} is not installed`,
        );
      } catch (error) {
        if (controller.signal.aborted) return;
        setLocalStatus("error");
        setAssetStatus(asset.id, "error", 0, error instanceof Error ? error.message : `${asset.fileName} availability check failed`);
      }
    }

    void checkAvailability();

    return () => {
      controller.abort();
    };
  }, [asset.fileName, asset.id, asset.url, setAssetStatus]);

  if (localStatus === "idle" || localStatus === "checking") {
    return asset.required ? <LoadingProgress label={`Checking ${asset.label}`} /> : null;
  }

  if (localStatus !== "available") return null;

  return (
    <ModelErrorBoundary
      asset={asset}
      onError={(message) => {
        setLocalStatus("error");
        setAssetStatus(asset.id, "error", 0, message);
      }}
    >
      <Suspense fallback={<LoadingProgress label={`Loading ${asset.label}`} />}>
        <LoadedGlbModel asset={asset} />
      </Suspense>
    </ModelErrorBoundary>
  );
}
