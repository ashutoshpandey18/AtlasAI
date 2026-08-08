// src/services/transportTruth.ts
// Standardized Transport & Proximity Truth Helper for Atlas Acquisition Agent
// Enforces mathematical & semantic truthfulness per Mireye /v1/proximity specifications.

export const FREIGHT_ACCESS_THRESHOLD_MINUTES = 15;

export type FreightAccessStatus =
  | 'Meets Freight-Access Threshold'
  | 'At Freight-Access Threshold'
  | 'Above Freight-Access Threshold'
  | 'Unavailable — No Mireye proximity result';

export interface TransportTruthResult {
  rawDriveTimeMinutes: number | null;
  displayDriveTime: string;
  status: FreightAccessStatus;
  statusText: string;
  source: 'Mireye /v1/proximity';
  provider: 'Mireye Routing Engine';
  isAvailable: boolean;
}

/**
 * Formats a raw numeric Mireye proximity drive time into a standardized, mathematically truthful result.
 * 
 * Rules:
 * - driveTimeMinutes < 15   => "Meets Freight-Access Threshold"
 * - driveTimeMinutes === 15  => "At Freight-Access Threshold"
 * - driveTimeMinutes > 15   => "Above Freight-Access Threshold"
 * - driveTimeMinutes == null => "Unavailable — No Mireye proximity result"
 * - Threshold evaluation strictly uses unrounded raw numeric value.
 */
export function formatTransportTruth(driveTimeMinutes: number | null | undefined): TransportTruthResult {
  if (driveTimeMinutes == null || isNaN(Number(driveTimeMinutes))) {
    return {
      rawDriveTimeMinutes: null,
      displayDriveTime: 'Transport time not returned by Mireye.',
      status: 'Unavailable — No Mireye proximity result',
      statusText: 'Transport time not returned by Mireye.',
      source: 'Mireye /v1/proximity',
      provider: 'Mireye Routing Engine',
      isAvailable: false,
    };
  }

  const raw = Number(driveTimeMinutes);
  let status: FreightAccessStatus;

  // Strict comparison using raw numeric value (without prior rounding)
  if (raw < FREIGHT_ACCESS_THRESHOLD_MINUTES) {
    status = 'Meets Freight-Access Threshold';
  } else if (raw === FREIGHT_ACCESS_THRESHOLD_MINUTES) {
    status = 'At Freight-Access Threshold';
  } else {
    status = 'Above Freight-Access Threshold';
  }

  const formattedValue = `${raw.toFixed(1)} min drive time`;

  return {
    rawDriveTimeMinutes: raw,
    displayDriveTime: formattedValue,
    status,
    statusText: `${formattedValue} (${status})`,
    source: 'Mireye /v1/proximity',
    provider: 'Mireye Routing Engine',
    isAvailable: true,
  };
}
