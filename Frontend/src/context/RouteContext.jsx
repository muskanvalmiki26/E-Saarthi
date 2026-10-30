import React, { createContext, useContext, useState, useMemo } from 'react';
import apiService from '../api/apiService';
import { MOCK_ROUTES } from '../api/mockData';
import polyline from '@mapbox/polyline';

const RouteContext = createContext(null);

export const RouteProvider = ({ children }) => {
  const [origin, setOrigin] = useState("Connaught Place, Central Delhi");
  const [destination, setDestination] = useState("Saket District Centre, South Delhi");
  const [routes, setRoutes] = useState(MOCK_ROUTES);
  const [selectedRouteId, setSelectedRouteId] = useState("rt_safe_01");
  const [isCalculating, setIsCalculating] = useState(false);
  const [activeModalRoute, setActiveModalRoute] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Active selected route object
  const selectedRoute = useMemo(() => {
    return routes.find(r => r.id === selectedRouteId) || routes[0];
  }, [routes, selectedRouteId]);

  
  const calculateRoutes = async (sourceLoc, destLoc) => {
    const src = sourceLoc || origin;
    const dst = destLoc || destination;

    setIsCalculating(true);

    try {
      const result = await apiService.calculateRoutes({
        origin: src,
        destination: dst
      });

      console.log("ROUTE API RESPONSE:", result);

      const backendRoutes = result?.routes;

      if (!Array.isArray(backendRoutes) || backendRoutes.length === 0) {
        throw new Error('No routes were returned for these locations.');
      }

      const formattedRoutes = backendRoutes.map((route, index) => ({
        ...route,
        id: String(route.route_id ?? route.id ?? index + 1),
        route_id: route.route_id ?? index + 1,
        distanceKm: Number(route.distance_km ?? route.distanceKm ?? 0),
        etaMinutes: Number(route.duration_minutes ?? route.etaMinutes ?? 0),
        safetyScore: Number(route.safety_score ?? route.safetyScore ?? 0),
        balancedScore: Number(route.balanced_score ?? route.balancedScore ?? 0),
        riskLevel: route.risk_level ?? route.riskLevel ?? 'Unknown',
        name: ['Safest Route', 'Balanced Route', 'Fastest Route'][index],
        tag: `Route ${index + 1}`,
        tagType: index === 0 ? 'safe' : index === 1 ? 'balanced' : 'risky',
        coordinates: (() => {
          try {
            if (Array.isArray(route.coordinates) && route.coordinates.length > 0) {
              return route.coordinates;
            }

            if (route.geometry && typeof route.geometry === 'string') {
              return polyline.decode(route.geometry);
            }

            return [];
          } catch (error) {
            console.error('Route geometry decoding failed:', error);
            return [];
          }
        })(),
        geometry: route.geometry ?? null,
        safetyFactors: route.safety_factors ?? route.safetyFactors ?? {},
        weather: route.weather_info ?? route.weather ?? {},
      }));

      setRoutes(formattedRoutes);
      setSelectedRouteId(formattedRoutes[0].id);

      return { ...result, routes: formattedRoutes };
    } catch (err) {
      console.error('Error fetching routes:', err);
      throw err;
    } finally {
      setIsCalculating(false);
    }
  };

  const openRouteDetails = (route = null) => {
    setActiveModalRoute(route || selectedRoute);
    setIsModalOpen(true);
  };

  const closeRouteDetails = () => {
    setIsModalOpen(false);
  };

  return (
    <RouteContext.Provider
      value={{
        origin,
        setOrigin,
        destination,
        setDestination,
        routes,
        selectedRouteId,
        setSelectedRouteId,
        selectedRoute,
        isCalculating,
        calculateRoutes,
        isModalOpen,
        activeModalRoute: activeModalRoute || selectedRoute,
        openRouteDetails,
        closeRouteDetails
      }}
    >
      {children}
    </RouteContext.Provider>
  );
};

export const useRoute = () => {
  const context = useContext(RouteContext);
  if (!context) {
    throw new Error('useRoute must be used within a RouteProvider');
  }
  return context;
};

export default RouteContext;
