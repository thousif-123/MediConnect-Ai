import React, { createContext, useContext, useState } from 'react';

export interface CityOption {
  name: string;
  lat: number;
  lng: number;
}

export const PRESET_CITIES: CityOption[] = [
  { name: 'San Francisco, CA', lat: 37.7749, lng: -122.4194 },
  { name: 'New York, NY', lat: 40.7128, lng: -74.006 },
  { name: 'Los Angeles, CA', lat: 34.0522, lng: -118.2437 },
  { name: 'Chicago, IL', lat: 41.8781, lng: -87.6298 },
  { name: 'Houston, TX', lat: 29.7604, lng: -95.3698 },
  { name: 'London, UK', lat: 51.5074, lng: -0.1278 },
  { name: 'Mumbai, IN', lat: 19.076, lng: 72.8777 },
];

interface LocationContextType {
  coords: { lat: number; lng: number } | null;
  cityName: string;
  isLocating: boolean;
  error: string | null;
  requestCurrentLocation: () => void;
  setManualLocation: (lat: number, lng: number, city: string) => void;
  clearError: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Default center: Downtown Medical District (SF Demo Coordinates)
const DEFAULT_COORDS = PRESET_CITIES[0];

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [coords, setCoords] = useState<{ lat: number; lng: number }>(() => {
    const saved = localStorage.getItem('mediconnect_coords');
    return saved ? JSON.parse(saved) : { lat: DEFAULT_COORDS.lat, lng: DEFAULT_COORDS.lng };
  });

  const [cityName, setCityName] = useState<string>(() => {
    return localStorage.getItem('mediconnect_city') || DEFAULT_COORDS.name;
  });

  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser. Using default city location.');
      return;
    }

    setIsLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newCoords = {
          lat: Math.round(pos.coords.latitude * 10000) / 10000,
          lng: Math.round(pos.coords.longitude * 10000) / 10000,
        };
        setCoords(newCoords);
        setCityName('Current GPS Location');
        localStorage.setItem('mediconnect_coords', JSON.stringify(newCoords));
        localStorage.setItem('mediconnect_city', 'Current GPS Location');
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation access blocked/denied:', err.message);
        setError('Location access was denied or blocked by browser settings. Switched to city preset.');
        setIsLocating(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const setManualLocation = (lat: number, lng: number, city: string) => {
    const newCoords = { lat, lng };
    setCoords(newCoords);
    setCityName(city);
    localStorage.setItem('mediconnect_coords', JSON.stringify(newCoords));
    localStorage.setItem('mediconnect_city', city);
    setError(null);
  };

  const clearError = () => setError(null);

  return (
    <LocationContext.Provider
      value={{
        coords,
        cityName,
        isLocating,
        error,
        requestCurrentLocation,
        setManualLocation,
        clearError,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

