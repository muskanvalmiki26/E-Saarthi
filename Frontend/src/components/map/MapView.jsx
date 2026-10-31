import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Shield, AlertTriangle, Navigation, MapPin } from 'lucide-react';

// Create modern custom SVG DivIcons for Leaflet
const createPinIcon = (color, label, symbol = '●') => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
        <div style="
          background-color: ${color};
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid white;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        ">
          <div style="transform: rotate(45deg); font-size: 13px; font-weight: bold;">
            ${symbol}
          </div>
        </div>
        ${
          label
            ? `<div style="
                background: rgba(15, 23, 42, 0.85);
                backdrop-filter: blur(4px);
                color: white;
                font-size: 10px;
                font-weight: 700;
                padding: 2px 8px;
                border-radius: 999px;
                margin-top: 4px;
                white-space: nowrap;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
              ">${label}</div>`
            : ''
        }
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32]
  });
};

const createVehicleIcon = () => {
  return L.divIcon({
    className: 'custom-vehicle-marker',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px;">
        <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: rgba(37, 99, 235, 0.25); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="width: 28px; height: 28px; border-radius: 50%; background: #2563EB; border: 3px solid white; box-shadow: 0 4px 12px rgba(37,99,235,0.5); display: flex; align-items: center; justify-content: center; color: white;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
          </svg>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
};

// Component to dynamically fit map bounds to route
const MapBoundsAdjuster = ({ coordinates }) => {
  const map = useMap();

  useEffect(() => {
    if (coordinates && coordinates.length > 0) {
      try {
        const bounds = L.latLngBounds(coordinates);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      } catch (e) {
        console.warn('Could not fit bounds:', e);
      }
    }
  }, [coordinates, map]);

  return null;
};

export const MapView = ({
  routes = [],
  selectedRouteId = null,
  selectedCategory = 'safest',
  onSelectRoute = () => {},
  currentLocation = { lat: 28.6315, lng: 77.2167, name: 'Connaught Place' },
  destinationLocation = { lat: 28.5280, lng: 77.2050, name: 'Saket' },
  emergencyServices = [],
  vehiclePosition = null,
  showAllRoutes = true,
  height = "520px"
}) => {
  const centerPosition = currentLocation ? [currentLocation.lat, currentLocation.lng] : [28.6315, 77.2167];

  // Derive coordinates for bounds adjustment
  const activeRoute = routes.find(
    r => String(r.id) === String(selectedRouteId)
  ) || routes[0];
  console.log("MAP SELECTED ROUTE:", selectedRouteId, activeRoute?.id, activeRoute?.coordinates?.length);
  console.log("FIRST COORDINATE:", activeRoute?.coordinates?.[0]);
  console.log("MIDDLE COORDINATE:", activeRoute?.coordinates?.[Math.floor(activeRoute.coordinates.length / 2)]);
  
  const route2 = routes.find(r => String(r.id) === "2");
  const route3 = routes.find(r => String(r.id) === "3");

  const diffIndex = route2?.coordinates.findIndex((p, i) =>
    p[0] !== route3?.coordinates[i]?.[0] ||
    p[1] !== route3?.coordinates[i]?.[1]
  );

  console.log("ROUTE 2 VS 3 DIFFERENCE:", {
    diffIndex,
    route2Point: JSON.stringify(route2?.coordinates[diffIndex]),
    route3Point: JSON.stringify(route3?.coordinates[diffIndex])
  });

  console.log("LAST COORDINATE:", activeRoute?.coordinates?.[activeRoute.coordinates.length - 1]);
  const allCoordinates = activeRoute?.coordinates || [
    centerPosition,
    destinationLocation ? [destinationLocation.lat, destinationLocation.lng] : [28.5280, 77.2050]
  ];

  return (
    <div className="w-full relative rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm bg-slate-100 min-h-[320px]" style={{ height }}>
      {/* Map Legend Overlay */}
      <div className="absolute top-2.5 left-2.5 z-[1000] bg-white/95 backdrop-blur-md px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl shadow-md border border-slate-200/80 text-[10px] sm:text-xs font-semibold flex flex-wrap items-center gap-2 sm:gap-3 max-w-[calc(100%-20px)]">
        <div className="flex items-center gap-1 text-emerald-600">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Safe (Green)</span>
        </div>
        <div className="flex items-center gap-1 text-amber-600">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Balanced</span>
        </div>
        <div className="flex items-center gap-1 text-red-600">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span>Fastest / High Risk</span>
        </div>
      </div>

      <MapContainer
        center={centerPosition}
        zoom={12}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
      >
        {/* CartoDB Positron / OSM Tiles for modern clean navigation theme */}
        <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
       />

        <MapBoundsAdjuster coordinates={allCoordinates} />

        {/* Start / Origin Marker */}
        {currentLocation && (
          <Marker
            position={[currentLocation.lat, currentLocation.lng]}
            icon={createPinIcon('#10B981', 'Origin: ' + (currentLocation.name?.split(',')[0] || 'Start'), 'A')}
          >
            <Popup className="custom-leaflet-popup">
              <div className="p-3">
                <p className="text-xs font-bold text-slate-800">Starting Location</p>
                <p className="text-xs text-slate-600 mt-1">{currentLocation.name || 'Current GPS point'}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Destination Marker */}
        {destinationLocation && (
          <Marker
            position={[destinationLocation.lat, destinationLocation.lng]}
            icon={createPinIcon('#EF4444', 'Destination', 'B')}
          >
            <Popup className="custom-leaflet-popup">
              <div className="p-3">
                <p className="text-xs font-bold text-slate-800">Final Destination</p>
                <p className="text-xs text-slate-600 mt-1">{destinationLocation.name || 'Saket'}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Dynamic Vehicle Position during Live Navigation */}
        {vehiclePosition && (
          <Marker position={vehiclePosition} icon={createVehicleIcon()}>
            <Popup className="custom-leaflet-popup">
              <div className="p-2.5 text-center">
                <p className="text-xs font-bold text-blue-600">Live User Location</p>
                <p className="text-[11px] text-slate-500">Tracking safely en route</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Render Routes Polylines */}
        {showAllRoutes
          ? routes.map((route) => {
              const isSelected = String(route.id) === String(selectedRouteId);
              return (
                <Polyline
                  key={route.id}
                  positions={route.coordinates}
                  pathOptions={{
                    color: route.color || (route.tagType === 'safe' ? '#10B981' : route.tagType === 'balanced' ? '#F59E0B' : '#EF4444'),
                    weight: isSelected ? 7 : 4,
                    opacity: isSelected ? 0.95 : 0.45,
                    dashArray: isSelected ? undefined : '6, 6',
                    lineCap: 'round',
                    lineJoin: 'round'
                  }}
                  eventHandlers={{
                    click: () => onSelectRoute(route.id)
                  }}
                >
                  <Popup className="custom-leaflet-popup">
                    <div className="p-3">
                      <div className="flex items-center gap-1.5 font-bold text-xs" style={{ color: route.color }}>
                        <span>{route.name}</span>
                      </div>
                      <div className="mt-1 text-xs text-slate-600">
                        Safety Score: <strong className="text-slate-900">{route.safetyScore}/100</strong> • ETA: <strong>{route.etaMinutes} min</strong>
                      </div>
                    </div>
                  </Popup>
                </Polyline>
              );
            })
          : activeRoute && (
              <Polyline
                key={activeRoute.id}
                positions={activeRoute.coordinates}
                pathOptions={{
                  color:
                    selectedCategory === 'safest' ? '#10B981' :
                    selectedCategory === 'balanced' ? '#F97316' :
                    selectedCategory === 'fastest' ? '#DC2626' :
                    '#64748B',
                  weight: 7,
                  opacity: 0.95,
                  lineCap: 'round',
                  lineJoin: 'round'
                }}
              />
          )}

        {/* Emergency Services Pin Layer (Police, Hospital, Fire, Pharmacy) */}
        {emergencyServices.map((service) => {
          const color =
            service.type === 'police'
              ? '#2563EB'
              : service.type === 'hospital'
              ? '#EF4444'
              : service.type === 'fire'
              ? '#F97316'
              : '#10B981';

          const symbol =
            service.type === 'police'
              ? '👮'
              : service.type === 'hospital'
              ? '🏥'
              : service.type === 'fire'
              ? '🚒'
              : '💊';

          return (
            <Marker
              key={service.id}
              position={[service.lat, service.lng]}
              icon={createPinIcon(color, service.name?.split(' ')[0], symbol)}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-3 min-w-[180px]">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {service.categoryLabel}
                  </span>
                  <p className="text-xs font-bold text-slate-800 mt-1.5">{service.name}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{service.address}</p>
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">{service.distanceKm} km away</span>
                    <a
                      href={`tel:${service.phone}`}
                      className="text-blue-600 font-bold hover:underline"
                    >
                      Call Now
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapView;
