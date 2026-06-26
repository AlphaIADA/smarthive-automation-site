import type { LightingControlState, LightingFixtureSpec, ResolvedLightingFixture, RoomLightGroupName } from "@/types/experience";

export type LightingControlOverride = Partial<LightingControlState>;
export type LightingControlOverrides = Readonly<Record<string, LightingControlOverride>>;

export function clampBrightness(value: number) {
  return Math.round(Math.min(100, Math.max(0, value)));
}

export function clampTemperature(value: number) {
  return Math.round(Math.min(6500, Math.max(1800, value)));
}

export function normalizeHexColour(value: string) {
  if (/^#[0-9a-fA-F]{6}$/.test(value)) return value;
  return "#ffffff";
}

export function resolveLightingControls(fixture: LightingFixtureSpec, overrides: LightingControlOverrides = {}): LightingControlState {
  const override = overrides[fixture.id] ?? {};

  return {
    enabled: override.enabled ?? fixture.controls.enabled,
    displayName: override.displayName ?? fixture.controls.displayName,
    brightnessPercent: clampBrightness(override.brightnessPercent ?? fixture.controls.brightnessPercent),
    temperatureKelvin: clampTemperature(override.temperatureKelvin ?? fixture.controls.temperatureKelvin),
    colour: normalizeHexColour(override.colour ?? fixture.controls.colour),
    groupId: (override.groupId ?? fixture.controls.groupId) as RoomLightGroupName,
  };
}

export function resolveLightingFixture(fixture: LightingFixtureSpec, overrides: LightingControlOverrides = {}): ResolvedLightingFixture {
  const controls = resolveLightingControls(fixture, overrides);
  const activeMultiplier = controls.enabled ? controls.brightnessPercent / 100 : 0;
  const consumptionWatts = Number((fixture.powerWatts * activeMultiplier).toFixed(2));
  const estimatedMonthlyKwh = Number(((consumptionWatts * fixture.load.estimatedMonthlyHours) / 1000).toFixed(2));

  return {
    ...fixture,
    controls,
    load: {
      ...fixture.load,
      currentAmps: Number((consumptionWatts / fixture.load.voltage).toFixed(3)),
      consumptionWatts,
      estimatedMonthlyKwh,
    },
  };
}

export function resolveLightingFixtures(fixtures: readonly LightingFixtureSpec[], overrides: LightingControlOverrides = {}): readonly ResolvedLightingFixture[] {
  return fixtures.map((fixture) => resolveLightingFixture(fixture, overrides));
}
