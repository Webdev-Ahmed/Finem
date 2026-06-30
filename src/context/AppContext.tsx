import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { getSetting } from '@/db/queries/settings';
import { getCurrencySymbol } from '@/constants/currencies';

interface AppState {
  userName: string;
  currencyCode: string;
  currencySymbol: string;
  refresh: () => void;
}

interface AppData {
  userName: string;
  currencyCode: string;
}

const AppContext = createContext<AppState>({
  userName: '',
  currencyCode: 'USD',
  currencySymbol: '$',
  refresh: () => {},
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>({ userName: '', currencyCode: 'USD' });

  const load = useCallback(() => {
    Promise.all([getSetting('user_name'), getSetting('currency')])
      .then(([name, currency]) => {
        setData({ userName: name ?? '', currencyCode: currency ?? 'USD' });
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <AppContext.Provider
      value={{
        userName: data.userName,
        currencyCode: data.currencyCode,
        currencySymbol: getCurrencySymbol(data.currencyCode),
        refresh: load,
      }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
