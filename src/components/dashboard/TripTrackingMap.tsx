import React, { useEffect, useState, useRef } from 'react';
import { Map, AdvancedMarker, Pin, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { Navigation as LucideNavigation, MapPin, Compass } from 'lucide-react';
import { cn } from '../../lib/utils';

interface TripTrackingMapProps {
  origin: { city: string; detail: string; lat?: number; lng?: number };
  destination: { city: string; detail: string; lat?: number; lng?: number };
  ongoing?: boolean;
}

export function TripTrackingMap({ origin, destination, ongoing }: TripTrackingMapProps) {
  const map = useMap();
  const routesLibrary = useMapsLibrary('routes');
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [routes, setRoutes] = useState<google.maps.DirectionsRoute[]>([]);
  const [routeIndex, setRouteIndex] = useState(0);
  const selected = routes[routeIndex];
  const leg = selected?.legs[0];

  const [currentLocation, setCurrentLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt');

  useEffect(() => {
    if (!routesLibrary || !map) return;
    try {
      // DirectionsService usually exists on the main google.maps object if the library is loaded
      const g = (window as any).google;
      if (g && g.maps && g.maps.DirectionsService && g.maps.DirectionsRenderer) {
        setDirectionsService(new g.maps.DirectionsService());
        setDirectionsRenderer(new g.maps.DirectionsRenderer({ map }));
      } else if (routesLibrary.DirectionsService && routesLibrary.DirectionsRenderer) {
        setDirectionsService(new (routesLibrary.DirectionsService as any)());
        setDirectionsRenderer(new (routesLibrary.DirectionsRenderer as any)({ map }));
      }
    } catch (e) {
      console.error("Error initializing directions service:", e);
    }
  }, [routesLibrary, map]);

  useEffect(() => {
    if (!directionsService || !directionsRenderer) return;

    directionsService.route({
      origin: origin.detail || origin.city,
      destination: destination.detail || destination.city,
      travelMode: google.maps.TravelMode.DRIVING,
      provideRouteAlternatives: true
    }, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK && result) {
        directionsRenderer.setDirections(result);
        setRoutes(result.routes);
      }
    });
  }, [directionsService, directionsRenderer, origin, destination]);

  useEffect(() => {
    if (ongoing) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const latLng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCurrentLocation(latLng);
          setPermissionStatus('granted');
          if (map) {
             // map.panTo(latLng); // Don't pan automatically if user is interacting
          }
        },
        (err) => {
          console.error(err);
          if (err.code === 1) setPermissionStatus('denied');
        },
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [ongoing, map]);

  if (permissionStatus === 'denied') {
    return (
      <div className="w-full h-full bg-stone-100 flex flex-col items-center justify-center p-8 text-center">
        <MapPin className="w-12 h-12 text-stone-300 mb-4" />
        <h3 className="font-bold text-stone-900 mb-2">Akses Lokasi Ditolak</h3>
        <p className="text-sm text-stone-500">Mohon aktifkan izin lokasi di browser Anda untuk menggunakan fitur pelacakan perjalanan.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full group">
      <Map
        defaultCenter={{ lat: -6.2088, lng: 106.8456 }}
        defaultZoom={12}
        mapId="TRIP_TRACKING_MAP"
        disableDefaultUI={true}
        gestureHandling={'greedy'}
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
      >
        {currentLocation && (
          <AdvancedMarker position={currentLocation}>
            <div className="relative">
              <div className="absolute -inset-4 bg-blue-500/20 rounded-full animate-ping" />
              <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg relative z-10" />
            </div>
          </AdvancedMarker>
        )}
      </Map>

      {/* Map Overlays */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none">
        <div className="bg-white/90 backdrop-blur-md border-2 border-stone-900 p-3 rounded-2xl shadow-brutal pointer-events-auto">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-stone-900 rounded-xl flex items-center justify-center text-white">
                <LucideNavigation className="w-4 h-4" />
             </div>
             <div>
                <p className="text-[8px] font-black uppercase tracking-widest text-stone-400">Status Tracking</p>
                <p className="text-[10px] font-bold text-stone-900">
                  {ongoing ? 'Melacak Perjalanan...' : 'Offline'}
                </p>
             </div>
          </div>
        </div>

        <button 
          onClick={() => {
            if (currentLocation && map) {
              map.setCenter(currentLocation);
              map.setZoom(15);
            }
          }}
          className="w-12 h-12 bg-white border-2 border-stone-900 rounded-2xl shadow-brutal flex items-center justify-center hover:bg-stone-50 transition-all active:translate-y-1 pointer-events-auto"
        >
          <Compass className="w-6 h-6 text-stone-900" />
        </button>
      </div>

      {leg && (
        <div className="absolute top-4 left-4 right-4 bg-white/90 backdrop-blur-md border-2 border-stone-900 p-4 rounded-3xl shadow-brutal pointer-events-none">
           <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                 <p className="text-[8px] font-black uppercase tracking-widest text-stone-400">Estimasi Jarak</p>
                 <p className="text-lg font-black text-stone-900 font-mono">{leg.distance?.text}</p>
              </div>
              <div className="w-px h-8 bg-stone-200" />
              <div className="flex-1 text-right">
                 <p className="text-[8px] font-black uppercase tracking-widest text-stone-400">Sisa Waktu</p>
                 <p className="text-lg font-black text-stone-900 font-mono">{leg.duration?.text}</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
