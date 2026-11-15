import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import { Provider } from '../../types';
import { MapPin, Navigation, Phone, CheckCircle2, RefreshCw } from 'lucide-react';
import { TYPE_LABELS } from '../provider/ProviderCard';
import { track } from '../../utils/analytics';
import { useDemo } from '../../context/DemoContext';

interface DirectoryMapProps {
  providers: Provider[];
  hoveredId: string | null;
  onMarkerHover?: (id: string | null) => void;
  className?: string;
}

export const DirectoryMap: React.FC<DirectoryMapProps> = ({
  providers,
  hoveredId,
  onMarkerHover,
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const [showSearchThisArea, setShowSearchThisArea] = useState(false);
  const [hasMapError, setHasMapError] = useState(false);
  const { userCoords, networkState } = useDemo();

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current || networkState === 'offline') return;

    try {
      const initialCenter: [number, number] =
        providers.length > 0
          ? [providers[0].address.lat, providers[0].address.lng]
          : [userCoords.lat, userCoords.lng];

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: 12,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // OpenStreetMap Tiles with attribution
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      map.on('movestart', () => {
        setShowSearchThisArea(true);
      });

      mapInstanceRef.current = map;
    } catch (err) {
      console.warn('Leaflet map initialization fallback', err);
      setHasMapError(true);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [networkState]);

  // Update Markers whenever providers or map changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    if (providers.length === 0) return;

    const bounds = L.latLngBounds([]);

    providers.forEach((prov) => {
      if (!prov.address.lat || !prov.address.lng) return;

      const isHovered = prov.id === hoveredId;
      const isEmergency = prov.types.includes('ambulance') || prov.hours?.is24x7;

      // Custom HTML Pin icon matching Warm Clinical tokens
      const iconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer transition-transform duration-150 ${
          isHovered ? 'scale-125 z-50' : 'scale-100'
        }">
          <div class="w-8 h-8 rounded-full flex items-center justify-center shadow-floating border-2 ${
            isHovered
              ? 'bg-saffron-500 text-ink-900 border-ink-900 ring-2 ring-saffron-500'
              : isEmergency
              ? 'bg-alert-700 text-white border-white'
              : 'bg-moss-700 text-white border-white'
          }">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="2.5" fill="currentColor"/>
            </svg>
          </div>
          ${
            isHovered
              ? `<div class="absolute -bottom-1 w-2 h-2 bg-saffron-500 rotate-45 border-r border-b border-ink-900"></div>`
              : ''
          }
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-leaflet-pin',
        html: iconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([prov.address.lat, prov.address.lng], {
        icon: customIcon,
      }).addTo(map);

      // Popup content
      const popupHtml = `
        <div class="p-2 space-y-1.5 min-w-[200px]">
          <span class="text-[10px] font-bold uppercase tracking-wider text-moss-700">
            ${TYPE_LABELS[prov.types[0]]}
          </span>
          <h4 class="font-serif font-bold text-sm text-ink-900 leading-snug">
            ${prov.name}
          </h4>
          <p class="text-xs text-ink-500">${prov.address.area}, ${prov.address.city}</p>
          <div class="pt-2 flex items-center gap-2">
            <a href="/provider/${prov.slug}" class="text-xs font-semibold text-moss-700 hover:underline">
              View Profile &rarr;
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('mouseover', () => {
        onMarkerHover?.(prov.id);
      });
      marker.on('mouseout', () => {
        onMarkerHover?.(null);
      });

      markersRef.current[prov.id] = marker;
      bounds.extend([prov.address.lat, prov.address.lng]);
    });

    if (providers.length > 0 && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [providers, hoveredId]);

  // Handle Pan to Hovered Card
  useEffect(() => {
    if (!hoveredId || !markersRef.current[hoveredId] || !mapInstanceRef.current) return;
    const targetMarker = markersRef.current[hoveredId];
    targetMarker.openPopup();
  }, [hoveredId]);

  const handleSearchThisArea = () => {
    setShowSearchThisArea(false);
    track('filter_change', { action: 'search_this_area_click' });
  };

  // If network is simulated offline or error, render SVG Map
  if (networkState === 'offline' || hasMapError) {
    return (
      <div
        className={`relative w-full h-full min-h-[380px] rounded-card bg-sand-100 border border-sand-200 overflow-hidden flex flex-col items-center justify-center p-6 text-center ${className}`}
      >
        <div className="w-12 h-12 rounded-full bg-sand-200 text-ink-500 flex items-center justify-center mb-3">
          <MapPin className="w-6 h-6 text-moss-700" strokeWidth={1.5} />
        </div>
        <h4 className="font-serif text-lg font-bold text-ink-900 mb-1">
          {networkState === 'offline' ? 'Offline Mode Active' : 'Map View'}
        </h4>
        <p className="text-xs text-ink-500 max-w-xs mb-4">
          {networkState === 'offline'
            ? 'Interactive map tiles require internet connectivity. Cached results remain listed on the left.'
            : 'Showing pins for current providers.'}
        </p>

        {/* Vector SVG pin representation */}
        <div className="w-full max-w-sm h-48 bg-surface rounded-card border border-sand-200 p-4 relative overflow-hidden">
          <div className="absolute inset-0 opacity-15">
            <svg width="100%" height="100%">
              <pattern id="grid-offline" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#7C8985" strokeWidth="0.5" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid-offline)" />
            </svg>
          </div>
          <div className="relative z-10 flex flex-wrap gap-2 justify-center items-center h-full">
            {providers.slice(0, 8).map((p) => (
              <div
                key={p.id}
                className="bg-moss-50 border border-moss-700 text-moss-800 text-[11px] font-semibold px-2 py-1 rounded-pill flex items-center gap-1 shadow-subtle"
              >
                <MapPin className="w-3 h-3 text-moss-700" />
                <span className="truncate max-w-[120px]">{p.address.area}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full min-h-[380px] rounded-card overflow-hidden border border-sand-200 ${className}`}>
      {/* Leaflet root div */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[420px]" />

      {/* Floating "Search this area" button */}
      {showSearchThisArea && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] animate-in fade-in slide-in-from-top-2">
          <button
            type="button"
            onClick={handleSearchThisArea}
            className="flex items-center gap-1.5 bg-surface text-ink-900 border border-ink-400 font-semibold text-xs px-3.5 py-2 rounded-full shadow-floating hover:bg-sand-100 transition-colors focus-visible:ring-2 focus-visible:ring-moss-700"
          >
            <RefreshCw className="w-3.5 h-3.5 text-moss-700" strokeWidth={1.5} />
            <span>Search this area</span>
          </button>
        </div>
      )}
    </div>
  );
};
