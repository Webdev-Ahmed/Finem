export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', PKR: '₨', AED: 'د.إ',
  SAR: '﷼', CAD: 'CA$', AUD: 'A$', JPY: '¥', INR: '₹',
  SGD: 'S$', CHF: 'Fr', MYR: 'RM', NGN: '₦', BRL: 'R$',
  ZAR: 'R', CNY: '¥', KES: 'KSh',
};

export function getCurrencySymbol(code: string): string {
  return CURRENCY_SYMBOLS[code] ?? code;
}
