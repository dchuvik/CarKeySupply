import { afterEach, describe, expect, it, vi } from 'vitest';
import { getVehicleYears, loadVehicleModels, parseVehicleModels, vehicleMakes } from './vehicle-options';

afterEach(() => vi.unstubAllGlobals());

describe('vehicle choices', () => {
  it('offers next model year through classic vehicles, newest first', () => {
    const years = getVehicleYears(2026);
    expect(years[0]).toBe('2027');
    expect(years.at(-1)).toBe('1900');
    expect(new Set(years).size).toBe(years.length);
  });

  it('keeps model names for the chosen make and removes empty, malformed and duplicate results', () => {
    expect(parseVehicleModels({ Results: [
      { Make_ID: 448, Model_Name: ' Camry ' },
      { Make_ID: 448, Model_Name: 'camry' },
      { Make_ID: 448, Model_Name: 'Corolla' },
      { Make_ID: 460, Model_Name: 'Mustang' },
      { Make_ID: 448, Model_Name: ' ' },
      { Make_ID: 448, Model_Name: null },
      null,
    ] }, 448)).toEqual(['Camry', 'Corolla']);
  });

  it('distinguishes a valid empty result from an invalid response', () => {
    expect(parseVehicleModels({ Results: [] }, 448)).toEqual([]);
    expect(() => parseVehicleModels({ error: 'Unavailable' }, 448)).toThrow();
  });

  it('keeps unique make names with valid identifiers or an explicit manual-entry fallback', () => {
    expect(new Set(vehicleMakes.map((make) => make.name)).size).toBe(vehicleMakes.length);
    expect(vehicleMakes.find((make) => make.name === 'Toyota')?.id).toBe(448);
    expect(vehicleMakes.find((make) => make.name === 'Scion')?.id).toBeNull();
    expect(vehicleMakes.every((make) => make.id === null || (Number.isInteger(make.id) && make.id > 0))).toBe(true);
  });

  it('reuses model results without sending contact data or credentials', async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ Results: [{ Make_ID: 460, Model_Name: 'Mustang' }] }) });
    vi.stubGlobal('fetch', fetcher);
    const signal = new AbortController().signal;
    expect(await loadVehicleModels(460, '2018', signal)).toEqual(['Mustang']);
    expect(await loadVehicleModels(460, '2018', signal)).toEqual(['Mustang']);
    expect(fetcher).toHaveBeenCalledTimes(1);
    const [url, options] = fetcher.mock.calls[0];
    expect(url).toBe('https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeIdYear/makeId/460/modelyear/2018?format=json');
    expect(options.credentials).toBe('omit');
    expect(options.referrerPolicy).toBe('no-referrer');
    expect(options.body).toBeUndefined();
  });

  it('rejects invalid or cancelled selections before requesting models', async () => {
    const fetcher = vi.fn();
    vi.stubGlobal('fetch', fetcher);
    const request = new AbortController();
    await expect(loadVehicleModels(448, '../../2020', request.signal)).rejects.toThrow('Invalid vehicle selection');
    request.abort();
    await expect(loadVehicleModels(448, '2020', request.signal)).rejects.toThrow('cancelled');
    expect(fetcher).not.toHaveBeenCalled();
  });
});
