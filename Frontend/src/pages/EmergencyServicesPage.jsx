import React, { useState, useEffect } from 'react';
import { LifeBuoy, Filter, MapPin, PhoneCall, ShieldCheck } from 'lucide-react';
import ServiceCard from '../components/emergency/ServiceCard';
import MapView from '../components/map/MapView';
import apiService from '../api/apiService';

import { useRoute } from '../context/RouteContext';

export const EmergencyServicesPage = ({ onRouteChange }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [radiusKm, setRadiusKm] = useState(10);
  const { origin, setDestination, selectedRoute, calculateRoutes } = useRoute();
  const routeStart = selectedRoute?.coordinates?.[0];
  const serviceLocation = routeStart?.length >= 2 ? { lat: Number(routeStart[0]), lng: Number(routeStart[1]) } : null;

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
  { id: 'all', label: 'All Services', icon: '\u{1F4CD}' },
  { id: 'police', label: 'Police Stations', icon: '\u{1F46E}' },
  { id: 'hospital', label: 'Hospitals', icon: '\u{1F3E5}' },
  { id: 'fire_station', label: 'Fire Stations', icon: '\u{1F692}' },
  { id: 'pharmacy', label: 'Pharmacies', icon: '\u{1F48A}' },
  { id: 'ambulance', label: 'Ambulance Services', icon: '\u{1F691}' }
];
  useEffect(() => {
    let cancelled = false;
    
    const fetchServices = async () => {
      if (serviceLocation?.lat == null || serviceLocation?.lng == null) {
        setServices([]);
        setError('Please calculate a route first to find nearby emergency services.');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const result = await apiService.getNearbyServices({
          lat: serviceLocation.lat,
          lng: serviceLocation.lng,
          type: selectedCategory,
          radius: radiusKm,
        });

        if (!cancelled) {
          setServices(
            (result.services ?? []).map((service, index) => ({
              ...service,
              id: service.id ?? `${service.service_type}-${index}`,
              lat: service.latitude,
              lng: service.longitude,
              type: service.service_type,
              categoryLabel: service.service_type?.replace('_', ' '),
              address: service.address || null,
              distanceKm: Number(service.distanceKm ?? service.distance_km ?? 0),
              etaMinutes: Number.isFinite(Number(service.distanceKm ?? service.distance_km)) ? Math.max(1, Math.round((Number(service.distanceKm ?? service.distance_km) * 1.3 / 4.5) * 60)) : null,
           }))
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.detail ||
            err.message ||
            'Failed to load emergency services.'
          );
          setServices([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchServices();

    return () => {
      cancelled = true;
    };
  }, [serviceLocation?.lat, serviceLocation?.lng, radiusKm, selectedCategory]);

  const uniqueServices = services.filter((service, index) => services.findIndex((item) => item.type === service.type && String(item.name ?? '').trim().toLowerCase() === String(service.name ?? '').trim().toLowerCase()) === index);

  const filteredServices = uniqueServices.filter((service) => {
    const type = String(
      service.type ?? service.service_type ?? ''
    ).toLowerCase();

    if (
      selectedCategory !== 'all' &&
      type !== selectedCategory
    ) {
      return false;
    }

    const distance = service.distanceKm ?? service.distance_km;

    return distance == null || Number(distance) <= radiusKm;
  });
  const handleNavigateHere = async (service) => {
    const target = service.address || service.name;
    setDestination(target);

    try {
      await calculateRoutes(origin, target);
      onRouteChange('routes');
    } catch (err) {
      setError(err.message || 'Unable to calculate route to this facility.');
    }
  };


  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Emergency Services Directory
            <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
              Nearby Facilities
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Nearby hospitals, police stations, fire stations and pharmacies.
          </p>
        </div>

        {/* Distance Radius Filter */}
        <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-600">Search Radius:</span>
          <select
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
            className="font-bold text-blue-600 bg-transparent outline-none cursor-pointer"
          >
            <option value={5}>Within 5 km</option>
            <option value={10}>Within 10 km</option>
            <option value={25}>Within 25 km</option>
          </select>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
              selectedCategory === cat.id
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Main Grid: Directory Cards + Interactive Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Service Cards */}
        <div className="lg:col-span-7 space-y-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            Found {} Nearby Facilities
            {loading && (
              <p className="text-sm text-blue-600">
                Loading nearby emergency services...
              </p>
            )}

            {error && (
              <p className="text-sm text-red-600">
                {typeof error === 'string'
                  ? error
                  : error?.error || 'Failed to load emergency services.'}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onNavigateHere={handleNavigateHere}
              />
            ))}
          </div>
        </div>

        {/* Right Side: Map with Emergency Pins */}
        <div className="lg:col-span-5">
          <div className="sticky top-24">
            <MapView
              currentLocation={serviceLocation}
              emergencyServices={filteredServices}
              showAllRoutes={false}
              height="580px"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyServicesPage;







