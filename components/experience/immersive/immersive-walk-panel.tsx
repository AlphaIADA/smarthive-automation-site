"use client";

import { GUIDED_TOUR_STOPS, IMMERSIVE_INPUT_MAPS, IMMERSIVE_MODES, IMMERSIVE_WALK_REPORT } from "@/lib/experience/immersive";
import { useImmersiveWalkStore } from "@/lib/experience/stores";
import type { EventBus } from "@/lib/experience/event-bus";
import type { ImmersiveInputSource, ImmersiveMode } from "@/types/experience";
import styles from "@/styles/experience/experience.module.css";

function formatLabel(value: string) {
  return value.replace(/-/g, " ");
}

function modeClass(mode: ImmersiveMode, activeMode: ImmersiveMode) {
  return mode === activeMode ? "border-lime-200/40 bg-lime-200/15 text-lime-100" : "border-white/10 bg-black/15 text-white/65 hover:bg-white/10";
}

export function ImmersiveWalkPanel({ eventBus }: { readonly eventBus: EventBus }) {
  const mode = useImmersiveWalkStore((state) => state.mode);
  const inputSource = useImmersiveWalkStore((state) => state.inputSource);
  const activeTourStop = useImmersiveWalkStore((state) => state.activeTourStop);
  const tourIndex = useImmersiveWalkStore((state) => state.tourIndex);
  const collisionEnabled = useImmersiveWalkStore((state) => state.collisionEnabled);
  const headBobEnabled = useImmersiveWalkStore((state) => state.headBobEnabled);
  const lastInteraction = useImmersiveWalkStore((state) => state.lastInteraction);
  const nextTourStop = useImmersiveWalkStore((state) => state.nextTourStop);
  const previousTourStop = useImmersiveWalkStore((state) => state.previousTourStop);
  const goToTourStop = useImmersiveWalkStore((state) => state.goToTourStop);
  const triggerInteraction = useImmersiveWalkStore((state) => state.triggerInteraction);

  const changeMode = (nextMode: ImmersiveMode) => {
    eventBus.emit("MODE_CHANGED", { mode: nextMode });
  };

  const changeInput = (nextInput: ImmersiveInputSource) => {
    eventBus.emit("INPUT_CHANGED", { source: nextInput });
  };

  return (
    <div className="mt-4 rounded-2xl border border-lime-300/20 bg-lime-300/10 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-medium">Immersive Walk</div>
          <div className={`${styles.muted} text-[10px]`}>
            {IMMERSIVE_WALK_REPORT.collision.volumeCount} collision volumes / {IMMERSIVE_WALK_REPORT.guidedTour.stopCount} tour stops
          </div>
        </div>
        <span className="rounded-full bg-emerald-300/15 px-2 py-1 text-[9px] font-semibold uppercase text-emerald-100">VR Ready</span>
      </div>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Modes</div>
        <div className="mt-2 grid grid-cols-2 gap-1">
          {IMMERSIVE_MODES.map((candidateMode) => (
            <button
              key={candidateMode}
              type="button"
              onClick={() => changeMode(candidateMode)}
              className={`rounded-xl border px-2 py-2 text-[9px] font-semibold uppercase transition ${modeClass(candidateMode, mode)}`}
            >
              {formatLabel(candidateMode)}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Movement Inputs</div>
        <div className="mt-2 grid grid-cols-2 gap-1">
          {IMMERSIVE_INPUT_MAPS.map((input) => (
            <button
              key={input.source}
              type="button"
              onClick={() => changeInput(input.source)}
              className={`rounded-xl border px-2 py-2 text-[9px] font-semibold uppercase transition ${inputSource === input.source ? "border-lime-200/40 bg-lime-200/15 text-lime-100" : "border-white/10 bg-black/15 text-white/65 hover:bg-white/10"}`}
            >
              {input.source}
            </button>
          ))}
        </div>
        <p className={`${styles.muted} mt-2 text-[10px] leading-relaxed`}>
          Keyboard uses WASD, arrows, Shift speed, Q/E vertical in fly mode, and Space reserved for interaction.
        </p>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Guided Tour</div>
          <span className={styles.muted}>{tourIndex + 1}/{GUIDED_TOUR_STOPS.length}</span>
        </div>
        <div className="mt-2 text-xs font-semibold">{activeTourStop.label}</div>
        <p className={`${styles.muted} mt-1 text-[10px] leading-relaxed`}>{activeTourStop.narrationPrompt}</p>
        <div className="mt-2 grid grid-cols-2 gap-1">
          <button type="button" onClick={previousTourStop} className="rounded-xl border border-white/10 bg-black/15 px-2 py-2 text-[9px] font-semibold uppercase hover:bg-white/10">Previous</button>
          <button type="button" onClick={nextTourStop} className="rounded-xl border border-white/10 bg-black/15 px-2 py-2 text-[9px] font-semibold uppercase hover:bg-white/10">Next</button>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-1">
          {GUIDED_TOUR_STOPS.map((stop, index) => (
            <button
              key={stop.id}
              type="button"
              onClick={() => goToTourStop(index)}
              className={`rounded-xl border px-2 py-2 text-left text-[9px] font-semibold uppercase transition ${index === tourIndex && mode === "guided-tour" ? "border-lime-200/40 bg-lime-200/15 text-lime-100" : "border-white/10 bg-black/15 text-white/65 hover:bg-white/10"}`}
            >
              {stop.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Collision / Camera</div>
        <dl className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
          <div><dt className={styles.muted}>Collision</dt><dd>{collisionEnabled ? "Enabled" : "Mode off"}</dd></div>
          <div><dt className={styles.muted}>Head Bob</dt><dd>{headBobEnabled ? "Enabled" : "Off"}</dd></div>
          <div><dt className={styles.muted}>Walls</dt><dd>{IMMERSIVE_WALK_REPORT.collision.wallCount}</dd></div>
          <div><dt className={styles.muted}>Furniture</dt><dd>{IMMERSIVE_WALK_REPORT.collision.furnitureCount}</dd></div>
          <div><dt className={styles.muted}>Glass</dt><dd>{IMMERSIVE_WALK_REPORT.collision.glassCount}</dd></div>
          <div><dt className={styles.muted}>Pool</dt><dd>{IMMERSIVE_WALK_REPORT.collision.poolCount}</dd></div>
        </dl>
      </section>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Interactions</div>
        <div className="mt-2 grid grid-cols-2 gap-1">
          <button type="button" onClick={() => triggerInteraction("door", "Nearest pivot or sliding door")} className="rounded-xl border border-white/10 bg-black/15 px-2 py-2 text-[9px] font-semibold uppercase hover:bg-white/10">Door</button>
          <button type="button" onClick={() => triggerInteraction("elevator", "Residential elevator")} className="rounded-xl border border-white/10 bg-black/15 px-2 py-2 text-[9px] font-semibold uppercase hover:bg-white/10">Elevator</button>
        </div>
        <p className={`${styles.muted} mt-2 text-[10px] leading-relaxed`}>
          {lastInteraction ? `Last interaction: ${lastInteraction}.` : "Door and elevator interactions are animation-ready."}
        </p>
      </section>
    </div>
  );
}
