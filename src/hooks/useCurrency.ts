import { useApp } from '@/context/AppContext';

export function useCurrency() {
  const { currencyCode, currencySymbol } = useApp();

  function format(amount: number): string {
    const abs = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(amount));
    return `${currencySymbol}${abs}`;
  }

  return { format, currencyCode, currencySymbol };
}
