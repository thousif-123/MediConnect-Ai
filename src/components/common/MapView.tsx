import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface MapMarker {
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
  type?: 'pharmacy' | 'hospital' | 'user';
  onClick?: () => void;
}

interface MapViewProps {
  center: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  className?: string;
}

export const MapView: React.FC<MapViewProps> = ({
  center,
  zoom = 13,
  markers = [],
  className = 'h-72 w-full rounded-xl overflow-hidden shadow-inner border border-slate-200',
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current).setView(center, zoom);

      const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      });

      const cartoLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO & OpenStreetMap',
        maxZoom: 18,
      });

      osmLayer.on('tileerror', () => {
        if (mapInstanceRef.current && mapInstanceRef.current.hasLayer(osmLayer)) {
          mapInstanceRef.current.removeLayer(osmLayer);
          cartoLayer.addTo(mapInstanceRef.current);
        }
      });

      osmLayer.addTo(mapInstanceRef.current);
    } else {
      mapInstanceRef.current.setView(center, zoom);
    }

    const currentMap = mapInstanceRef.current;

    // Clear old markers except base tile layer
    currentMap.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
        currentMap.removeLayer(layer);
      }
    });

    // Custom SVG pins
    markers.forEach((m) => {
      let iconColor = '#059669'; // Emerald default
      if (m.type === 'hospital') iconColor = '#dc2626'; // Red
      if (m.type === 'user') iconColor = '#2563eb'; // Blue

      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="background-color: ${iconColor}; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px;">
            ${m.type === 'hospital' ? 'H' : m.type === 'user' ? '●' : 'Rx'}
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([m.lat, m.lng], { icon: customIcon }).addTo(currentMap);

      const popupContent = `
        <div style="font-family: sans-serif; padding: 4px;">
          <strong style="font-size: 13px; color: #0f172a;">${m.title}</strong>
          ${m.subtitle ? `<div style="font-size: 11px; color: #475569; margin-top: 2px;">${m.subtitle}</div>` : ''}
        </div>
      `;
      marker.bindPopup(popupContent);

      if (m.onClick) {
        marker.on('click', m.onClick);
      }
    });

    return () => {
      // Map instance cleaned up on unmount
    };
  }, [center[0], center[1], zoom, markers]);

  return <div ref={mapContainerRef} className={className} />;
};
