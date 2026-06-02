import React, { useEffect, useState, useRef } from 'react';
import { Map, Marker, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { Navigation as LucideNavigation, MapPin, Compass, Search, Fuel, CreditCard, Home } from 'lucide-react';
import { cn } from '../../lib/utils';

interface TripTrackingMapProps {
  origin: { city: string; detail: string; lat?: number; lng?: number };
  destination: { city: string; detail: string; lat?: number; lng?: number };
  ongoing?: boolean;
}

export function TripTrackingMap({ origin, destination, ongoing }: TripTrackingMapProps) {
  const map = useMap();
  const routesLibrary = useMapsLibrary('routes');
  const placesLibrary = useMapsLibrary('places');
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [routes, setRoutes] = useState<google.maps.DirectionsRoute[]>([]);
  const [routeIndex, setRouteIndex] = useState(0);
  const selected = routes[routeIndex];
  const leg = selected?.legs[0];

  const [currentLocation, setCurrentLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  
  const [nearbyPlaces, setNearbyPlaces] = useState<any[]>([]);
  const [activePoiType, setActivePoiType] = useState<string | null>(null);

  useEffect(() => {
    if (!routesLibrary || !map) return;
    try {
      const g = (window as any).google;
      if (g && g.maps && g.maps.DirectionsService && g.maps.DirectionsRenderer) {
        setDirectionsService(new g.maps.DirectionsService());
        setDirectionsRenderer(new g.maps.DirectionsRenderer({ map }));
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

  const searchAlongRoute = (type: string) => {
    if (!map || !placesLibrary || !currentLocation) return;
    setActivePoiType(type);
    
    const service = new google.maps.places.PlacesService(map);
    service.nearbySearch({
      location: currentLocation,
      radius: 5000,
      keyword: type === 'gas' ? 'SPBU' : type === 'atm' ? 'ATM' : 'Masjid'
    }, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        setNearbyPlaces(results);
      }
    });
  };

  useEffect(() => {
    if (ongoing) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const latLng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCurrentLocation(latLng);
          setPermissionStatus('granted');
        },
        (err) => {
          if (err.code === 1) setPermissionStatus('denied');
        },
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [ongoing]);

  if (permissionStatus === 'denied') {
    return (
      <div className="w-full h-full bg-stone-100 flex flex-col items-center justify-center p-8 text-center rounded-[2.5rem]">
        <MapPin className="w-12 h-12 text-stone-300 mb-4" />
        <h3 className="font-bold text-stone-900 mb-2">Akses Lokasi Ditolak</h3>
        <p className="text-sm text-stone-500">Mohon aktifkan izin lokasi di browser Anda.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full group">
      <Map
        defaultCenter={{ lat: -6.2088, lng: 106.8456 }}
        defaultZoom={12}
        disableDefaultUI={true}
        gestureHandling={'greedy'}
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
      >
        {currentLocation && <Marker position={currentLocation} />}
        {nearbyPlaces.map((place, idx) => (
          <Marker 
            key={idx} 
            position={place.geometry.location} 
            title={place.name}
            icon={{
              url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
            }}
          />
        ))}
      </Map>

      {/* Places Toolbar */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
        {[
          { id: 'gas', icon: <Fuel className="w-4 h-4" />, label: 'SPBU' },
          { id: 'atm', icon: <CreditCard className="w-4 h-4" />, label: 'ATM' },
          { id: 'mosque', icon: <Home className="w-4 h-4" />, label: 'Masjid' }
        ].map(poi => (
          <button
            key={poi.id}
            onClick={() => searchAlongRoute(poi.id)}
            className={cn(
              "p-3 rounded-xl border-2 border-stone-900 shadow-brutal transition-all flex flex-col items-center gap-1",
              activePoiType === poi.id ? "bg-stone-900 text-white" : "bg-white text-stone-900 hover:bg-stone-50"
            )}
          >
            {poi.icon}
            <span className="text-[7px] font-black uppercase">{poi.label}</span>
          </button>
        ))}
      </div>

      {/* Map Overlays */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none">
        <div className="bg-white/90 backdrop-blur-md border-2 border-stone-900 p-3 rounded-2xl shadow-brutal pointer-events-auto">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-stone-900 rounded-xl flex items-center justify-center text-white">
                {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <LucideNavigation className="w-4 h-4" />}
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

const isScanning = false; // dummy for compilation fix if needed elsewhere
const Loader2 = ({className}: any) => <Compass className={className} />; // Fallback if icon missing