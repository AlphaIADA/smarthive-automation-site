"use client";

import { useMemo, useState } from "react";
import {
  ELECTRICAL_SOCKET_LABELS,
  ELECTRICAL_SOCKETS,
  ELECTRICAL_SWITCH_LABELS,
  ELECTRICAL_SWITCHES,
  LIGHTING_ENGINE_REPORT,
  LIGHTING_FIXTURE_LABELS,
  LIGHTING_FIXTURES,
  LIGHTING_GROUPS,
  LIGHTING_QUOTE_SUMMARY,
  ROOM_LIGHT_GROUP_LABELS,
  ROOM_LIGHT_GROUPS,
  getLightingFixture,
} from "@/lib/experience/lighting/lighting-catalog";
import { resolveLightingFixture } from "@/lib/experience/lighting/lighting-controls";
import { calculateLightingPowerSummary } from "@/lib/experience/lighting/lighting-power";
import { useLightingStore } from "@/lib/experience/stores";
import type { LightingFixtureType, RoomLightGroupName } from "@/types/experience";
import styles from "@/styles/experience/experience.module.css";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function formatNumber(value: number, maximumFractionDigits = 1) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits }).format(value);
}

function compactTypeCounts<T extends string>(items: readonly { readonly type: T }[]) {
  return items.reduce<Partial<Record<T, number>>>((counts, item) => {
    counts[item.type] = (counts[item.type] ?? 0) + 1;
    return counts;
  }, {});
}

function FixtureControls() {
  const selectedLightId = useLightingStore((state) => state.selectedLightId);
  const overrides = useLightingStore((state) => state.overrides);
  const toggleLight = useLightingStore((state) => state.toggleLight);
  const setBrightness = useLightingStore((state) => state.setBrightness);
  const setColour = useLightingStore((state) => state.setColour);
  const setTemperature = useLightingStore((state) => state.setTemperature);
  const renameLight = useLightingStore((state) => state.renameLight);
  const setGroup = useLightingStore((state) => state.setGroup);
  const fixture = selectedLightId ? getLightingFixture(selectedLightId) : null;
  const resolvedFixture = fixture ? resolveLightingFixture(fixture, overrides) : null;

  if (!fixture || !resolvedFixture) {
    return (
      <div className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3 text-[10px] leading-relaxed">
        <div className="font-medium">No lighting fixture selected</div>
        <p className={`${styles.muted} mt-1`}>Click a light in the villa or choose one from the list below to adjust power, brightness, colour, temperature, grouping, or name.</p>
      </div>
    );
  }

  return (
    <section className="mt-3 rounded-2xl border border-amber-200/20 bg-amber-200/10 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-xs font-semibold">{resolvedFixture.controls.displayName}</div>
          <div className={`${styles.muted} text-[10px]`}>
            {LIGHTING_FIXTURE_LABELS[resolvedFixture.type]} / {resolvedFixture.roomName}
          </div>
        </div>
        <button
          type="button"
          onClick={() => toggleLight(resolvedFixture.id, !resolvedFixture.controls.enabled)}
          className={`rounded-full px-2 py-1 text-[9px] font-semibold uppercase transition ${resolvedFixture.controls.enabled ? "bg-emerald-300/15 text-emerald-100" : "bg-white/10 text-white/55"}`}
        >
          {resolvedFixture.controls.enabled ? "On" : "Off"}
        </button>
      </div>

      <div className="mt-3 space-y-3 text-[10px]">
        <label className="block">
          <span className={`${styles.muted} mb-1 block`}>Rename</span>
          <input
            value={resolvedFixture.controls.displayName}
            onChange={(event) => renameLight(resolvedFixture.id, event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/20 px-2 py-2 text-[10px] outline-none focus:border-amber-200/40"
          />
        </label>
        <label className="block">
          <span className={`${styles.muted} mb-1 flex justify-between`}>
            Brightness <span>{resolvedFixture.controls.brightnessPercent}%</span>
          </span>
          <input
            type="range"
            min={0}
            max={100}
            value={resolvedFixture.controls.brightnessPercent}
            onChange={(event) => setBrightness(resolvedFixture.id, Number(event.target.value))}
            className="w-full accent-amber-200"
          />
        </label>
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <label className="block">
            <span className={`${styles.muted} mb-1 block`}>Colour</span>
            <input
              type="color"
              value={resolvedFixture.controls.colour}
              onChange={(event) => setColour(resolvedFixture.id, event.target.value)}
              className="h-9 w-full rounded-xl border border-white/10 bg-black/20 p-1"
            />
          </label>
          <label className="block">
            <span className={`${styles.muted} mb-1 block`}>Group</span>
            <select
              value={resolvedFixture.controls.groupId}
              onChange={(event) => setGroup(resolvedFixture.id, event.target.value as RoomLightGroupName)}
              className="h-9 rounded-xl border border-white/10 bg-black/20 px-2 text-[10px] outline-none"
            >
              {ROOM_LIGHT_GROUPS.map((group) => (
                <option key={group} value={group}>
                  {ROOM_LIGHT_GROUP_LABELS[group]}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="block">
          <span className={`${styles.muted} mb-1 flex justify-between`}>
            Temperature <span>{resolvedFixture.controls.temperatureKelvin}K</span>
          </span>
          <input
            type="range"
            min={1800}
            max={6500}
            step={50}
            value={resolvedFixture.controls.temperatureKelvin}
            onChange={(event) => setTemperature(resolvedFixture.id, Number(event.target.value))}
            className="w-full accent-sky-200"
          />
        </label>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
        <div><dt className={styles.muted}>Power</dt><dd>{resolvedFixture.powerWatts}W</dd></div>
        <div><dt className={styles.muted}>Current</dt><dd>{resolvedFixture.load.currentAmps}A</dd></div>
        <div><dt className={styles.muted}>Beam</dt><dd>{resolvedFixture.beamAngle} deg</dd></div>
        <div><dt className={styles.muted}>Shadow</dt><dd className="capitalize">{resolvedFixture.shadowQuality}</dd></div>
        <div><dt className={styles.muted}>Equipment</dt><dd>{formatCurrency(resolvedFixture.pricing.equipmentCost)}</dd></div>
        <div><dt className={styles.muted}>Install</dt><dd>{formatCurrency(resolvedFixture.pricing.installationCost + resolvedFixture.pricing.labourCost)}</dd></div>
      </dl>
    </section>
  );
}

export function LightingControlPanel() {
  const selectedLightId = useLightingStore((state) => state.selectedLightId);
  const selectLight = useLightingStore((state) => state.selectLight);
  const overrides = useLightingStore((state) => state.overrides);
  const [groupFilter, setGroupFilter] = useState<RoomLightGroupName | "all">("all");
  const [typeFilter, setTypeFilter] = useState<LightingFixtureType | "all">("all");
  const powerSummary = useMemo(() => calculateLightingPowerSummary(LIGHTING_FIXTURES, ELECTRICAL_SWITCHES, ELECTRICAL_SOCKETS, overrides), [overrides]);
  const visibleFixtures = useMemo(
    () =>
      LIGHTING_FIXTURES.filter((fixture) => {
        const resolvedFixture = resolveLightingFixture(fixture, overrides);
        const matchesGroup = groupFilter === "all" || resolvedFixture.controls.groupId === groupFilter;
        const matchesType = typeFilter === "all" || fixture.type === typeFilter;
        return matchesGroup && matchesType;
      }),
    [groupFilter, overrides, typeFilter],
  );
  const switchCounts = useMemo(() => compactTypeCounts(ELECTRICAL_SWITCHES), []);
  const socketCounts = useMemo(() => compactTypeCounts(ELECTRICAL_SOCKETS), []);

  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-black/10 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-medium">Lighting Engine</div>
          <div className={`${styles.muted} text-[10px]`}>
            {LIGHTING_ENGINE_REPORT.fixtureCount} lights / {LIGHTING_ENGINE_REPORT.switchCount} switches / {LIGHTING_ENGINE_REPORT.socketCount} sockets
          </div>
        </div>
        <span className="rounded-full bg-amber-200/15 px-2 py-1 text-[9px] font-semibold uppercase text-amber-100">Live Load</span>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
        <div><dt className={styles.muted}>Wattage</dt><dd>{formatNumber(powerSummary.totalWattage)}W</dd></div>
        <div><dt className={styles.muted}>Current</dt><dd>{formatNumber(powerSummary.currentConsumptionAmps, 2)}A</dd></div>
        <div><dt className={styles.muted}>Monthly</dt><dd>{formatNumber(powerSummary.estimatedMonthlyUsageKwh)} kWh</dd></div>
        <div><dt className={styles.muted}>Peak Load</dt><dd>{formatNumber(powerSummary.peakLoadWatts)}W</dd></div>
        <div><dt className={styles.muted}>Quote</dt><dd>{formatCurrency(LIGHTING_QUOTE_SUMMARY.totalCost)}</dd></div>
        <div><dt className={styles.muted}>Real Lights</dt><dd>{LIGHTING_ENGINE_REPORT.actualLightCount}</dd></div>
      </dl>

      <FixtureControls />

      <div className="mt-3 grid grid-cols-2 gap-2">
        <select value={groupFilter} onChange={(event) => setGroupFilter(event.target.value as RoomLightGroupName | "all")} className="rounded-xl border border-white/10 bg-black/20 px-2 py-2 text-[10px] outline-none">
          <option value="all">All groups</option>
          {LIGHTING_GROUPS.map((group) => (
            <option key={group.id} value={group.id}>{group.name}</option>
          ))}
        </select>
        <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as LightingFixtureType | "all")} className="rounded-xl border border-white/10 bg-black/20 px-2 py-2 text-[10px] outline-none">
          <option value="all">All lights</option>
          {LIGHTING_ENGINE_REPORT.lightTypesCovered.map((type) => (
            <option key={type} value={type}>{LIGHTING_FIXTURE_LABELS[type]}</option>
          ))}
        </select>
      </div>

      <div className="mt-3 max-h-56 space-y-1 overflow-y-auto pr-1">
        {visibleFixtures.slice(0, 36).map((fixture) => {
          const resolvedFixture = resolveLightingFixture(fixture, overrides);

          return (
            <button
              key={fixture.id}
              type="button"
              onClick={() => selectLight(fixture.id)}
              className={`flex w-full items-center gap-2 rounded-xl border px-2 py-2 text-left text-[10px] transition ${selectedLightId === fixture.id ? "border-amber-200/40 bg-amber-200/15" : "border-white/10 bg-black/10 hover:bg-white/10"}`}
            >
              <span className={`size-2 shrink-0 rounded-full ${resolvedFixture.controls.enabled ? "bg-amber-200" : "bg-white/25"}`} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{resolvedFixture.controls.displayName}</span>
                <span className={`${styles.muted} block truncate`}>
                  {ROOM_LIGHT_GROUP_LABELS[resolvedFixture.controls.groupId]} / {LIGHTING_FIXTURE_LABELS[fixture.type]}
                </span>
              </span>
              <span className={styles.muted}>{resolvedFixture.controls.brightnessPercent}%</span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Electrical Hardware</div>
        <div className={`${styles.muted} mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]`}>
          {Object.entries(switchCounts).map(([type, count]) => (
            <div key={type}>{ELECTRICAL_SWITCH_LABELS[type as keyof typeof ELECTRICAL_SWITCH_LABELS]}: {count}</div>
          ))}
          {Object.entries(socketCounts).map(([type, count]) => (
            <div key={type}>{ELECTRICAL_SOCKET_LABELS[type as keyof typeof ELECTRICAL_SOCKET_LABELS]}: {count}</div>
          ))}
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Internal Quote Model</div>
        <p className={`${styles.muted} mt-1 text-[10px] leading-relaxed`}>
          Equipment {formatCurrency(LIGHTING_QUOTE_SUMMARY.equipmentCost)}, installation {formatCurrency(LIGHTING_QUOTE_SUMMARY.installationCost)}, labour {formatCurrency(LIGHTING_QUOTE_SUMMARY.labourCost)}. Existing quotation engine untouched.
        </p>
      </div>
    </div>
  );
}
