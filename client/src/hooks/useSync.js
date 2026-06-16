import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export const useSync = () => {
  const [online, setOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState(new Date());
  const queryClient = useQueryClient();

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
  }, []);

  const syncNow = () => {
    queryClient.invalidateQueries();
    setLastSync(new Date());
  };

  return { online, lastSync, syncNow };
};
