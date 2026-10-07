export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://draheloisaveiga.com.br').replace(/\/$/, '');
export const DENTIST_ID = `${SITE_URL}/#dentist`;
export const DEFAULT_ADDRESS = 'Rua Dr. César, 530 - Conj 106 - Santana, São Paulo - SP, 02013-002';
export const DEFAULT_PHONE = '5511987312961';

export function absoluteUrl(path = '/') {
  return path.startsWith('http') ? path : `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function phoneInternational(value?: string) {
  const digits = (value || DEFAULT_PHONE).replace(/\D/g, '');
  if (digits.startsWith('55') && digits.length >= 12) {
    return `+${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 9)}-${digits.slice(9)}`;
  }
  return digits;
}
