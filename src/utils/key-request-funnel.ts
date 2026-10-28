import appointments from '@data/global/appointments.json';
import { buildAppointmentMessage, buildSmsUrl, getAppointmentToday, type AppointmentRequest } from './appointment-request';
import { initVehicleSelector } from './vehicle-selector';

const isAppleDevice = () => /iPad|iPhone|iPod/.test(navigator.userAgent)
  || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

export function initKeyRequestFunnels() {
  document.querySelectorAll<HTMLElement>('[data-key-funnel]').forEach((root) => {
    if (root.dataset.bound) return;
    root.dataset.bound = 'true';
    const copy = appointments.en;
    const flow = copy.funnel;
    const recipient = root.dataset.phone!;
    const form = root.querySelector<HTMLFormElement>('[data-funnel-form]')!;
    const panels = [...root.querySelectorAll<HTMLElement>('[data-funnel-step]')];
    const preview = root.querySelector<HTMLTextAreaElement>('[data-funnel-preview]')!;
    const status = root.querySelector<HTMLElement>('[data-funnel-status]')!;
    const phone = form.querySelector<HTMLInputElement>('[name="phone"]')!;
    const date = form.querySelector<HTMLInputElement>('[name="preferredDate"]')!;
    const vehicle = initVehicleSelector(root);
    const withPhone = (text: string) => text.replace('{phone}', recipient);
    let current = '0';

    root.querySelector<HTMLAnchorElement>('[data-urgent-sms]')!.href = buildSmsUrl(recipient, flow.urgentMessage, isAppleDevice());

    function showStep(step: string, focus = true) {
      current = step;
      const numericStep = Number(step);
      panels.forEach((panel) => { panel.hidden = panel.dataset.funnelStep !== step; });
      const inForm = numericStep >= 1;
      root.querySelector<HTMLElement>('[data-funnel-progress]')!.hidden = !inForm;
      root.querySelector<HTMLElement>('[data-funnel-navigation]')!.hidden = !inForm;
      root.querySelector<HTMLElement>('[data-funnel-privacy]')!.hidden = !inForm;
      root.querySelector<HTMLElement>('[data-funnel-next]')!.hidden = numericStep === 4;
      root.querySelectorAll('[data-funnel-next-label]').forEach((label) => {
        label.textContent = numericStep === 3 ? flow.review : flow.next;
      });
      root.querySelector<HTMLElement>('[data-funnel-counter]')!.textContent = flow.stepCount
        .replace('{current}', step).replace('{total}', String(flow.steps.length));
      root.querySelectorAll<HTMLElement>('[data-progress-step]').forEach((item) => {
        if (Number(item.dataset.progressStep) === numericStep) item.setAttribute('aria-current', 'step');
        else item.removeAttribute('aria-current');
        item.toggleAttribute('data-complete', Number(item.dataset.progressStep) < numericStep);
      });
      status.textContent = '';
      date.min = getAppointmentToday();
      if (focus) {
        const header = document.querySelector<HTMLElement>('[data-site-header-fixed]');
        const headerOffset = header ? (parseFloat(getComputedStyle(header).top) || 0) + header.offsetHeight : 0;
        const offset = root.closest('dialog') ? 16 : headerOffset + 16;
        root.style.setProperty('--funnel-scroll-offset', `${offset}px`);
        panels.find((panel) => !panel.hidden)?.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true });
        root.scrollIntoView({ block: 'start', behavior: 'instant' });
      }
    }

    function validate(steps: string[]): boolean {
      const digits = phone.value.replace(/\D/g, '');
      phone.setCustomValidity(phone.value && (digits.length < 7 || digits.length > 15) ? copy.phoneError : '');
      date.min = getAppointmentToday();
      date.setCustomValidity(date.value && date.value < date.min ? copy.dateError : '');
      for (const panel of panels.filter((panel) => steps.includes(panel.dataset.funnelStep!))) {
        for (const input of panel.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input, select, textarea')) {
          if (input.required && input instanceof HTMLInputElement && input.type !== 'radio' && !input.value.trim()) input.value = '';
          if (!input.checkValidity()) {
            if (panel.hidden) showStep(panel.dataset.funnelStep!);
            input.reportValidity();
            return false;
          }
        }
        if (panel.dataset.funnelStep === '1' && !vehicle.ready()) {
          if (panel.hidden) showStep('1');
          return false;
        }
      }
      return true;
    }

    function prepareMessage(): string | undefined {
      if (!validate(['1', '2', '3'])) return;
      const request = { ...Object.fromEntries(new FormData(form).entries()), ...vehicle.values() } as unknown as AppointmentRequest;
      const translated = { ...request };
      for (const [field, options] of [['workingKey', copy.workingKeys], ['service', copy.services], ['preferredTime', copy.times]] as const) {
        translated[field] = options.find((option) => option.value === request[field])?.label ?? request[field];
      }
      const message = buildAppointmentMessage(translated, copy);
      preview.value = message;
      return message;
    }

    function next() {
      if (!['1', '2', '3'].includes(current) || !validate([current])) return;
      if (current === '3' && !prepareMessage()) return;
      showStep(String(Number(current) + 1));
    }

    root.querySelectorAll<HTMLElement>('[data-funnel-go]').forEach((button) => {
      button.addEventListener('click', () => showStep(button.dataset.funnelGo!));
    });
    root.querySelector('[data-funnel-next]')!.addEventListener('click', next);
    root.querySelector('[data-funnel-back]')!.addEventListener('click', () => showStep(String(Math.max(0, Number(current) - 1))));
    form.addEventListener('input', (event) => {
      if (event.target instanceof HTMLInputElement) event.target.setCustomValidity('');
      status.textContent = '';
    });
    form.addEventListener('change', () => {
      root.querySelector<HTMLElement>('[data-no-key]')!.hidden = form.querySelector<HTMLInputElement>('[name="workingKey"]:checked')?.value !== 'No';
    });
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (current !== '4') { next(); return; }
      const message = prepareMessage();
      if (!message) return;
      const link = document.createElement('a');
      link.href = buildSmsUrl(recipient, message, isAppleDevice());
      link.hidden = true;
      root.appendChild(link);
      status.textContent = copy.ready;
      link.click();
      link.remove();
    });
    root.querySelector('[data-funnel-copy]')!.addEventListener('click', async () => {
      const message = prepareMessage();
      if (!message) return;
      try {
        await navigator.clipboard.writeText(message);
        status.textContent = withPhone(copy.copied);
      } catch {
        status.textContent = withPhone(copy.copyFallback);
        preview.focus();
        preview.select();
      }
    });
    showStep('0', false);
  });
}
