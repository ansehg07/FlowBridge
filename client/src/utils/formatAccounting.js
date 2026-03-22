const CURRENCY_CONFIG = {
  USD: { locale: 'en-US', currency: 'USD' },
  EUR: { locale: 'de-DE', currency: 'EUR' },
  GBP: { locale: 'en-GB', currency: 'GBP' },
  JPY: { locale: 'ja-JP', currency: 'JPY' },
  CNY: { locale: 'zh-CN', currency: 'CNY' },
  INR: { locale: 'en-IN', currency: 'INR' },
  CHF: { locale: 'de-CH', currency: 'CHF' },
  CAD: { locale: 'en-CA', currency: 'CAD' },
  AUD: { locale: 'en-AU', currency: 'AUD' },
};

export function formatValue(num, currencyCode = 'USD') {
  if (num === null || num === undefined || num === '') return '\u2014';
  const n = Number(num);
  if (isNaN(n)) return '\u2014';
  if (n === 0) return '\u2014';

  const config = CURRENCY_CONFIG[currencyCode] || CURRENCY_CONFIG.USD;
  const absValue = Math.abs(n);

  const formatted = new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(absValue);

  if (n < 0) {
    return `(${formatted})`;
  }
  return formatted;
}

export function isNegative(num) {
  return typeof num === 'number' && num < 0;
}

export function formatConfidence(score) {
  if (score >= 80) return { label: 'High', color: 'text-green-600 dark:text-green-400' };
  if (score >= 55) return { label: 'Medium', color: 'text-amber-600 dark:text-amber-400' };
  return { label: 'Low', color: 'text-red-600 dark:text-red-400' };
}
