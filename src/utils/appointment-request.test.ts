import { describe, expect, it } from 'vitest';
import appointments from '@data/global/appointments.json';
import { buildAppointmentMessage, buildSmsUrl, getAppointmentToday, normalizeSmsNumber, type AppointmentRequest } from './appointment-request';

const request: AppointmentRequest = {
  name: 'Alex & Sam', phone: '(315) 555-0123', vehicleYear: '2020', vehicleMake: 'Toyota', vehicleModel: 'Camry',
  service: 'Spare key', workingKey: 'Yes', preferredDate: '2026-11-02', preferredTime: 'Afternoon',
  location: 'Elbridge, NY', notes: 'Need a spare + remote. Available after 1:00.',
};

describe('appointment text requests', () => {
  it('addresses the provided US number consistently', () => {
    expect(normalizeSmsNumber('315-552-1553')).toBe('+13155521553');
    expect(normalizeSmsNumber('+1 (315) 552-1553')).toBe('+13155521553');
    expect(() => normalizeSmsNumber('(315) XXX-XXXX')).toThrow();
    expect(() => normalizeSmsNumber('315')).toThrow();
  });

  it('includes vehicle, contact, service and appointment details without claiming a booking', () => {
    const body = buildAppointmentMessage(request, appointments.en);
    expect(body).toContain('Alex & Sam');
    expect(body).toContain('2020');
    expect(body).toContain('Make: Toyota');
    expect(body).toContain('Model: Camry');
    expect(body).toContain('Spare key');
    expect(body).toContain('(315) 555-0123');
    expect(body).toContain('2026-11-02');
    expect(body).toContain('Afternoon (Eastern)');
    expect(body).toContain('Please confirm availability and pricing');
  });

  it('keeps multiline content and reserved characters intact through an SMS URL', () => {
    const body = buildAppointmentMessage(request, appointments.en);
    const url = buildSmsUrl('315-552-1553', body);
    expect(url).toMatch(/^sms:\+13155521553\?body=/);
    expect(decodeURIComponent(url.split('?body=')[1])).toBe(body);
    expect(url).not.toContain('Alex & Sam');
  });

  it('uses the Apple Messages body separator when requested', () => {
    const body = 'Appointment for José & family\nKey + fob';
    const url = buildSmsUrl('315-552-1553', body, true);
    expect(url).toMatch(/^sms:\+13155521553&body=/);
    expect(decodeURIComponent(url.split('&body=')[1])).toBe(body);
  });

  it('omits empty optional notes', () => {
    expect(buildAppointmentMessage({ ...request, notes: ' ' }, appointments.en)).not.toContain('Anything else?');
  });

  it('supports a request without a preferred appointment date or time', () => {
    const body = buildAppointmentMessage({ ...request, preferredDate: '', preferredTime: '' }, appointments.en);
    expect(body).not.toContain(appointments.en.labels.preferredDate);
    expect(body).not.toContain(appointments.en.labels.preferredTime);
    expect(body).toContain('Please confirm availability and pricing');
  });

  it('uses the Elbridge date around midnight instead of the execution host timezone', () => {
    expect(getAppointmentToday(new Date('2026-10-23T03:30:00Z'))).toBe('2026-10-22');
    expect(getAppointmentToday(new Date('2026-10-23T04:30:00Z'))).toBe('2026-10-23');
  });
});
