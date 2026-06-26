"use client";

import { Html } from "@react-three/drei";
import { useModelAssetStore } from "@/lib/experience/stores";
import styles from "@/styles/experience/experience.module.css";

export function ProductionModelPlaceholder() {
  const setRenderMode = useModelAssetStore((state) => state.setRenderMode);

  return (
    <Html fullscreen>
      <div className="pointer-events-auto flex h-full items-center justify-center px-5 text-white">
        <div className={`${styles.glass} max-w-xl rounded-[2rem] border border-white/15 p-8 text-center shadow-2xl`}>
          <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl border border-sky-200/25 bg-sky-200/10 text-xs font-semibold tracking-[0.22em] text-sky-100">
            GLB
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">Production model missing</h2>
          <p className="mt-4 text-sm leading-6 text-white/72">
            Production 3D villa model not installed yet. Upload villa.glb to public/experience/models.
          </p>
          <p className="mt-3 text-xs leading-5 text-white/50">
            The loader checked the public asset path and did not attempt to parse a missing file. Room chunks stay lazy until the base villa is installed.
          </p>
          <button
            type="button"
            onClick={() => setRenderMode("procedural-fallback")}
            className="mt-6 rounded-2xl border border-white/15 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-950 transition hover:bg-sky-100"
          >
            Open Dev Fallback
          </button>
        </div>
      </div>
    </Html>
  );
}
