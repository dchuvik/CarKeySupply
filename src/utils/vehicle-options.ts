import makes from '@data/global/vehicle-makes.json';
import { getAppointmentToday } from './appointment-request';

export const vehicleMakes = makes;
const modelCache = new Map<string, string[]>();

export function getVehicleYears(currentYear = Number(getAppointmentToday().slice(0, 4))): string[] {
  return Array.from({ length: currentYear + 2 - 1900 }, (_, index) => String(currentYear + 1 - index));
}

export function parseVehicleModels(payload: unknown, makeId: number): string[] {
  if (!payload || typeof payload !== 'object' || !('Results' in payload) || !Array.isArray(payload.Results)) {
    throw new Error('Invalid vehicle model response');
  }
  const unique = new Map<string, string>();
  for (const row of payload.Results) {
    if (!row || row.Make_ID !== makeId || typeof row.Model_Name !== 'string') continue;
    const name = row.Model_Name.trim();
    if (name && name.length <= 100 && !unique.has(name.toLowerCase())) unique.set(name.toLowerCase(), name);
  }
  return [...unique.values()].sort((left, right) => left.localeCompare(right, 'en', { numeric: true }));
}

export async function loadVehicleModels(makeId: number, year: string, signal: AbortSignal): Promise<string[]> {
  if (!Number.isInteger(makeId) || makeId <= 0 || !/^(19|20)\d{2}$/.test(year)) throw new Error('Invalid vehicle selection');
  if (signal.aborted) throw new DOMException('Vehicle lookup cancelled', 'AbortError');
  const key = `${makeId}:${year}`;
  const cached = modelCache.get(key);
  if (cached) return cached;
  const request = new AbortController();
  const cancel = () => request.abort();
  signal.addEventListener('abort', cancel, { once: true });
  const timeout = setTimeout(cancel, 10000);
  try {
    const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeIdYear/makeId/${makeId}/modelyear/${year}?format=json`, {
      signal: request.signal, credentials: 'omit', referrerPolicy: 'no-referrer', headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error('Vehicle models unavailable');
    const models = parseVehicleModels(await response.json(), makeId);
    modelCache.set(key, models);
    return models;
  } finally {
    clearTimeout(timeout);
    signal.removeEventListener('abort', cancel);
  }
}
