import { describe, it, expect } from 'vitest';
import { formatTransportTruth } from '../transportTruth';

describe('formatTransportTruth — Transport & Proximity Truthfulness Verification', () => {
  it('handles 7.2 -> Meets Freight-Access Threshold', () => {
    const res = formatTransportTruth(7.2);
    expect(res.rawDriveTimeMinutes).toBe(7.2);
    expect(res.displayDriveTime).toBe('7.2 min drive time');
    expect(res.status).toBe('Meets Freight-Access Threshold');
    expect(res.statusText).toBe('7.2 min drive time (Meets Freight-Access Threshold)');
    expect(res.isAvailable).toBe(true);
  });

  it('handles 13.7 -> Meets Freight-Access Threshold', () => {
    const res = formatTransportTruth(13.7);
    expect(res.rawDriveTimeMinutes).toBe(13.7);
    expect(res.displayDriveTime).toBe('13.7 min drive time');
    expect(res.status).toBe('Meets Freight-Access Threshold');
  });

  it('handles 14.99 -> Meets Freight-Access Threshold without pre-rounding error', () => {
    const res = formatTransportTruth(14.99);
    expect(res.rawDriveTimeMinutes).toBe(14.99);
    expect(res.displayDriveTime).toBe('15.0 min drive time');
    expect(res.status).toBe('Meets Freight-Access Threshold');
    expect(res.statusText).toBe('15.0 min drive time (Meets Freight-Access Threshold)');
  });

  it('handles 15.0 -> At Freight-Access Threshold', () => {
    const res = formatTransportTruth(15.0);
    expect(res.rawDriveTimeMinutes).toBe(15.0);
    expect(res.displayDriveTime).toBe('15.0 min drive time');
    expect(res.status).toBe('At Freight-Access Threshold');
    expect(res.statusText).toBe('15.0 min drive time (At Freight-Access Threshold)');
  });

  it('handles 15.01 -> Above Freight-Access Threshold', () => {
    const res = formatTransportTruth(15.01);
    expect(res.rawDriveTimeMinutes).toBe(15.01);
    expect(res.displayDriveTime).toBe('15.0 min drive time');
    expect(res.status).toBe('Above Freight-Access Threshold');
    expect(res.statusText).toBe('15.0 min drive time (Above Freight-Access Threshold)');
  });

  it('handles 20.9 -> Above Freight-Access Threshold', () => {
    const res = formatTransportTruth(20.9);
    expect(res.rawDriveTimeMinutes).toBe(20.9);
    expect(res.displayDriveTime).toBe('20.9 min drive time');
    expect(res.status).toBe('Above Freight-Access Threshold');
  });

  it('handles null -> Unavailable — No Mireye proximity result', () => {
    const res = formatTransportTruth(null);
    expect(res.rawDriveTimeMinutes).toBeNull();
    expect(res.displayDriveTime).toBe('Transport time not returned by Mireye.');
    expect(res.status).toBe('Unavailable — No Mireye proximity result');
    expect(res.isAvailable).toBe(false);
  });
});
