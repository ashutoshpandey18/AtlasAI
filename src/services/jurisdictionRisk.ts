import type { JurisdictionRisk } from '../types/atlas';
import type { MireyeFieldValue } from '../types/mireye';

/**
 * Approximate RTO / ISO region by latitude and longitude in CONUS.
 */
export function getRtoRegion(lat: number, lng: number): string {
  // Texas - ERCOT
  if (lat >= 25.8 && lat <= 36.5 && lng >= -106.6 && lng <= -93.5) {
    if (lng > -103.0 && lat < 34.5) return 'ERCOT';
  }
  // WECC (Western Interconnection)
  if (lng <= -104.0) return 'WECC';

  // Upper Midwest / Gulf Coast - MISO
  if (
    (lat >= 36.5 && lat <= 49.0 && lng >= -97.0 && lng <= -87.0) ||
    (lat >= 29.0 && lat <= 35.0 && lng >= -94.0 && lng <= -88.0)
  ) {
    return 'MISO';
  }

  // PJM (Mid-Atlantic & Parts of Midwest - OH, PA, NJ, MD, WV, VA, etc.)
  if (lat >= 37.0 && lat <= 42.5 && lng >= -84.5 && lng <= -74.0) {
    return 'PJM';
  }

  // SPP (Great Plains)
  if (lat >= 33.0 && lat <= 49.0 && lng >= -104.0 && lng <= -94.5) {
    return 'SPP';
  }

  // NYISO
  if (lat >= 40.5 && lat <= 45.0 && lng >= -79.8 && lng <= -71.8) {
    return 'NYISO';
  }

  // ISO-NE
  if (lat >= 41.0 && lat <= 47.5 && lng >= -73.5 && lng <= -66.9) {
    return 'ISO-NE';
  }

  // SERC (Southeast non-RTO)
  return 'SERC';
}

/**
 * Check if a location has cross-RTO transmission seam risk or DFIRM panel vintage uncertainty.
 */
export function evaluateJurisdictionRisk(
  lat: number,
  lng: number,
  fieldName: string,
  fields?: Record<string, MireyeFieldValue> | null
): JurisdictionRisk | undefined {
  const safeFields = fields ?? {};
  const rto = getRtoRegion(lat, lng);

  // 1. Transmission line cross-RTO risk
  if (fieldName.includes('transmission_line')) {
    // Check if site is near a known RTO seam boundary (e.g. OH PJM/MISO boundary, TX ERCOT boundary)
    const isSeamArea =
      (lng >= -84.8 && lng <= -83.5 && lat >= 39.0 && lat <= 41.5) || // OH seam
      (lng >= -95.0 && lng <= -93.5 && lat >= 30.0 && lat <= 34.0) || // TX/LA seam
      (lng >= -104.5 && lng <= -103.0); // WECC/SPP seam

    if (isSeamArea) {
      const neighborRto = rto === 'PJM' ? 'MISO' : rto === 'ERCOT' ? 'MISO' : 'SPP';
      return {
        rtoRegion: rto,
        lineRtoRegion: neighborRto,
        crossRtoBoundary: true,
        note: `Site is in ${rto} territory near ${neighborRto} seam boundary. Physical line proximity does not imply interconnect access without cross-RTO queue application.`,
      };
    }

    return {
      rtoRegion: rto,
      crossRtoBoundary: false,
      note: `Governed under ${rto} Regional Transmission Organization interconnect tariff framework.`,
    };
  }

  // 2. FEMA Floodplain DFIRM panel vintage risk
  if (fieldName === 'within_floodplain_polygon') {
    const confidence = safeFields['within_floodplain_polygon']?.confidence;
    const isMediumOrLow = confidence === 'medium' || confidence === 'low';
    const vintage = safeFields['within_floodplain_polygon']?.dataset_vintage ?? '2018';

    if (isMediumOrLow || parseInt(vintage, 10) < 2020) {
      return {
        rtoRegion: rto,
        crossRtoBoundary: false,
        dfirmVintage: vintage,
        note: `FEMA DFIRM panel vintage (${vintage}) requires local surveyor verification — adjacent watershed studies in this county are actively under revision.`,
      };
    }
  }

  return undefined;
}
