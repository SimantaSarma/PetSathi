import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Provider } from '../types';

interface DemoContextType {
  // Clock Override (2 am, 10 am, 9 pm, live)
  clockOverride: string | null;
  setClockOverride: (clock: string | null) => void;
  // Location
  locationState: 'granted' | 'denied' | 'prompt' | 'timeout';
  setLocationState: (state: 'granted' | 'denied' | 'prompt' | 'timeout') => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  userCoords: { lat: number; lng: number };
  setUserCoords: (coords: { lat: number; lng: number }) => void;
  // Network simulation
  networkState: 'online' | 'offline';
  setNetworkState: (net: 'online' | 'offline') => void;
  latencyMs: number;
  setLatencyMs: (ms: number) => void;
  // Saved providers (localStorage)
  savedIds: string[];
  toggleSave: (id: string) => void;
  isSaved: (id: string) => boolean;
  // Submit a Correction Modal global trigger
  correctionTarget: Provider | null;
  openCorrection: (provider: Provider) => void;
  closeCorrection: () => void;
  // Toast notifications
  toast: { message: string; type: 'info' | 'success' | 'alert'; id: number } | null;
  showToast: (message: string, type?: 'info' | 'success' | 'alert') => void;
}

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  'Bengaluru': { lat: 12.9352, lng: 77.6245 },
  'Mumbai': { lat: 19.0596, lng: 72.8295 },
  'Delhi NCR': { lat: 28.5244, lng: 77.1557 },
};

const DemoContext = createContext<DemoContextType | undefined>(undefined);

const SAVED_STORAGE_KEY = 'practo_animals_saved_v1';

export const DemoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [clockOverride, setClockOverride] = useState<string | null>(null);
  const [locationState, setLocationState] = useState<'granted' | 'denied' | 'prompt' | 'timeout'>('granted');
  const [selectedCity, setSelectedCity] = useState<string>('Bengaluru');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>(CITY_COORDS['Bengaluru']);
  const [networkState, setNetworkState] = useState<'online' | 'offline'>('online');
  const [latencyMs, setLatencyMs] = useState<number>(0);
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(SAVED_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [correctionTarget, setCorrectionTarget] = useState<Provider | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'success' | 'alert'; id: number } | null>(null);

  // Sync city change with coords
  useEffect(() => {
    if (CITY_COORDS[selectedCity]) {
      setUserCoords(CITY_COORDS[selectedCity]);
    }
  }, [selectedCity]);

  // Persist saved IDs
  useEffect(() => {
    try {
      localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(savedIds));
    } catch {
      // quota or private mode
    }
  }, [savedIds]);

  const toggleSave = (id: string) => {
    setSavedIds((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((item) => item !== id) : [...prev, id];
      showToast(exists ? 'Removed from saved' : 'Saved to your list', 'info');
      return next;
    });
  };

  const isSaved = (id: string) => savedIds.includes(id);

  const openCorrection = (provider: Provider) => {
    setCorrectionTarget(provider);
  };

  const closeCorrection = () => {
    setCorrectionTarget(null);
  };

  const showToast = (message: string, type: 'info' | 'success' | 'alert' = 'info') => {
    const id = Date.now();
    setToast({ message, type, id });
    setTimeout(() => {
      setToast((cur) => (cur?.id === id ? null : cur));
    }, 3800);
  };

  return (
    <DemoContext.Provider
      value={{
        clockOverride,
        setClockOverride,
        locationState,
        setLocationState,
        selectedCity,
        setSelectedCity,
        userCoords,
        setUserCoords,
        networkState,
        setNetworkState,
        latencyMs,
        setLatencyMs,
        savedIds,
        toggleSave,
        isSaved,
        correctionTarget,
        openCorrection,
        closeCorrection,
        toast,
        showToast,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = () => {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
};
