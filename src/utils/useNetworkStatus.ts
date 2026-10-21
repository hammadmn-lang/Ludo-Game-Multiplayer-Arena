import { useState, useEffect } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  lastOnlineChange: number;
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>(() => ({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    lastOnlineChange: Date.now(),
  }));

  useEffect(() => {
    const handleOnline = () => {
      setStatus({
        isOnline: true,
        lastOnlineChange: Date.now(),
      });
    };

    const handleOffline = () => {
      setStatus({
        isOnline: false,
        lastOnlineChange: Date.now(),
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    setStatus({
      isOnline: navigator.onLine,
      lastOnlineChange: Date.now(),
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return status;
}
