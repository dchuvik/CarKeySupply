import appointments from '@data/global/appointments.json';
import { loadVehicleModels, vehicleMakes } from './vehicle-options';

export function initVehicleSelector(root: HTMLElement) {
  const copy = appointments.en.vehicleSelect;
  const year = root.querySelector<HTMLSelectElement>('[name="vehicleYear"]')!;
  const make = root.querySelector<HTMLSelectElement>('[name="vehicleMake"]')!;
  const model = root.querySelector<HTMLSelectElement>('[name="vehicleModel"]')!;
  const customMake = root.querySelector<HTMLInputElement>('[name="otherMake"]')!;
  const customModel = root.querySelector<HTMLInputElement>('[name="otherModel"]')!;
  const status = root.querySelector<HTMLElement>('[data-vehicle-status]')!;
  let activeRequest: AbortController | undefined;

  function toggleCustom(field: HTMLInputElement, show: boolean) {
    field.closest<HTMLElement>('[data-vehicle-custom]')!.hidden = !show;
    field.disabled = !show;
    field.required = show;
    if (!show) field.value = '';
  }

  function manualModel(message: string) {
    model.replaceChildren(new Option(copy.otherModel, '__other'));
    model.disabled = false;
    model.removeAttribute('aria-busy');
    toggleCustom(customModel, true);
    status.textContent = message;
  }

  async function updateModels() {
    activeRequest?.abort();
    toggleCustom(customMake, make.value === '__other');
    toggleCustom(customModel, false);
    model.replaceChildren(new Option(copy.chooseFirst, ''));
    model.disabled = true;
    model.removeAttribute('aria-busy');
    status.textContent = '';
    if (make.value === '__other') { manualModel(copy.manual); return; }
    if (!year.value || !make.value) return;
    const selectedMake = vehicleMakes.find((item) => item.name === make.value);
    if (!selectedMake?.id) { manualModel(copy.manual); return; }

    const request = new AbortController();
    activeRequest = request;
    model.replaceChildren(new Option(copy.loading, ''));
    model.setAttribute('aria-busy', 'true');
    status.textContent = copy.loading;
    try {
      const models = await loadVehicleModels(selectedMake.id, year.value, request.signal);
      if (activeRequest !== request || request.signal.aborted || !root.isConnected) return;
      if (!models.length) { manualModel(copy.empty); return; }
      model.replaceChildren(new Option(copy.model, ''), ...models.map((name) => new Option(name, name)), new Option(copy.otherModel, '__other'));
      model.disabled = false;
      status.textContent = copy.loaded;
    } catch {
      if (activeRequest !== request || request.signal.aborted || !root.isConnected) return;
      manualModel(copy.failed);
    } finally {
      if (activeRequest === request) model.removeAttribute('aria-busy');
    }
  }

  year.addEventListener('change', updateModels);
  make.addEventListener('change', updateModels);
  model.addEventListener('change', () => toggleCustom(customModel, model.value === '__other'));
  document.addEventListener('astro:before-swap', () => activeRequest?.abort(), { once: true });
  void updateModels();

  return {
    ready() {
      if (!model.disabled) return true;
      status.textContent = copy.notReady;
      status.focus();
      return false;
    },
    values() {
      return {
        vehicleYear: year.value,
        vehicleMake: make.value === '__other' ? customMake.value.trim() : make.value,
        vehicleModel: model.value === '__other' ? customModel.value.trim() : model.value,
      };
    },
  };
}
