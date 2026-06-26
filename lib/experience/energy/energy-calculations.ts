import type { EnergyMetricSet } from "@/types/experience";

export const ENERGY_RATE_USD_PER_KWH = 0.18;

function round(value: number, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function metricsFromDailyUsage(dailyUsageKwh: number, peakDemandKw: number, powerFactor = 0.94): EnergyMetricSet {
  const monthlyUsageKwh = dailyUsageKwh * 30;
  const yearlyUsageKwh = dailyUsageKwh * 365;
  const costUsd = monthlyUsageKwh * ENERGY_RATE_USD_PER_KWH;
  const projectedCostUsd = yearlyUsageKwh * ENERGY_RATE_USD_PER_KWH;

  return {
    instantConsumptionWatts: round((dailyUsageKwh * 1000) / 24),
    dailyUsageKwh: round(dailyUsageKwh),
    monthlyUsageKwh: round(monthlyUsageKwh),
    yearlyUsageKwh: round(yearlyUsageKwh),
    costUsd: round(costUsd),
    projectedCostUsd: round(projectedCostUsd),
    peakDemandKw: round(peakDemandKw),
    powerFactor: round(powerFactor, 3),
  };
}

export function metricsFromWatts(instantConsumptionWatts: number, dailyHours: number, peakMultiplier = 1.35, powerFactor = 0.94): EnergyMetricSet {
  const dailyUsageKwh = (instantConsumptionWatts * dailyHours) / 1000;

  return {
    ...metricsFromDailyUsage(dailyUsageKwh, (instantConsumptionWatts * peakMultiplier) / 1000, powerFactor),
    instantConsumptionWatts: round(instantConsumptionWatts),
  };
}

export function combineEnergyMetrics(metrics: readonly EnergyMetricSet[]): EnergyMetricSet {
  const instantConsumptionWatts = metrics.reduce((total, metric) => total + metric.instantConsumptionWatts, 0);
  const dailyUsageKwh = metrics.reduce((total, metric) => total + metric.dailyUsageKwh, 0);
  const peakDemandKw = metrics.reduce((total, metric) => total + metric.peakDemandKw, 0);
  const weightedPowerFactor =
    metrics.reduce((total, metric) => total + metric.powerFactor * Math.max(1, metric.instantConsumptionWatts), 0) /
    Math.max(1, metrics.reduce((total, metric) => total + Math.max(1, metric.instantConsumptionWatts), 0));

  return {
    ...metricsFromDailyUsage(dailyUsageKwh, peakDemandKw, weightedPowerFactor),
    instantConsumptionWatts: round(instantConsumptionWatts),
  };
}
