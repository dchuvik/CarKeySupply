export interface AppointmentRequest {
  name: string;
  phone: string;
  vehicleYear: string;
  vehicleMake: string;
  vehicleModel: string;
  service: string;
  workingKey: string;
  preferredDate: string;
  preferredTime: string;
  location: string;
  notes: string;
}

interface AppointmentMessageCopy {
  messageHeading: string;
  messageFooter: string;
  labels: Record<keyof AppointmentRequest, string>;
}

export function normalizeSmsNumber(phone: string): string {
  if (!/^[+\d\s().-]+$/.test(phone)) throw new Error('Invalid SMS recipient');
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  if (phone.trim().startsWith('+') && digits.length >= 7 && digits.length <= 15) return `+${digits}`;
  throw new Error('Invalid SMS recipient');
}

export function buildSmsUrl(phone: string, message: string, appleDevice = false): string {
  // RFC 5724 defines ?body=. Apple Messages also uses the &body= convention.
  const separator = appleDevice ? '&' : '?';
  return `sms:${normalizeSmsNumber(phone)}${separator}body=${encodeURIComponent(message)}`;
}

export function buildAppointmentMessage(request: AppointmentRequest, copy: AppointmentMessageCopy): string {
  const fields: (keyof AppointmentRequest)[] = [
    'name', 'phone', 'vehicleYear', 'vehicleMake', 'vehicleModel', 'service', 'workingKey',
    'preferredDate', 'preferredTime', 'location', 'notes',
  ];
  return [
    copy.messageHeading,
    '',
    ...fields.flatMap((field) => {
      const value = request[field].trim();
      return value ? [`${copy.labels[field]}: ${value}${field === 'preferredTime' ? ' (Eastern)' : ''}`] : [];
    }),
    '',
    copy.messageFooter,
  ].join('\n');
}

export function getAppointmentToday(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((value) => value.type === type)?.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}
