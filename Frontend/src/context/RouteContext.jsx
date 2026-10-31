import React, { createContext, useContext, useState, useMemo } from 'react';
import apiService from '../api/apiService';
import polyline from '@mapbox/polyline';

const RouteContext = createContext(null);

export const RouteProvider = ({ children }) => {
  const [origin, setOrigin] = useState("Connaught Place, Central Delhi");
  const [destination, setDestination] = useState("Saket District Centre, South Delhi");
  const [routes, setRoutes] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [activeModalRoute, setActiveModalRoute] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [routeHistoryCoordinates, setRouteHistoryCoordinates] = useState(null);

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

      setRouteHistoryCoordinates(result.routeHistoryCoordinates);

      const backendRoutes = result?.routes;

      if (!Array.isArray(backendRoutes) || backendRoutes.length === 0) {
        throw new Error('No routes were returned for these locations.');
      }

      const recommendations = result?.recommended_routes || {};

      const formattedRoutes = backendRoutes.map((route, index) => {
        const routeId = Number(route.route_id ?? route.id ?? index + 1);

        const categories = Object.entries(recommendations)
          .filter(([category, recommendedId]) =>
            Number(recommendedId) === routeId
          )
          .map(([category]) => category);

        return {
          ...route,
          id: String(routeId),
          route_id: routeId,

          distanceKm: Number(route.distance_km ?? route.distanceKm ?? 0),
          etaMinutes: Number(route.duration_minutes ?? route.etaMinutes ?? 0),
          safetyScore: Number(route.safety_score ?? route.safetyScore ?? 0),
          balancedScore: Number(route.balanced_score ?? route.balancedScore ?? 0),

          riskLevel: route.risk_level ?? route.riskLevel ?? 'Unknown',

          name: categories.length
            ? categories.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(' â€¢ ') + ' Route'
            : `Alternative Route ${index + 1}`,

          tag: categories.length ? 'Recommended' : `Alternative ${index + 1}`,

          tagType: categories.includes('safest')
            ? 'safe'
            : categories.includes('balanced')
              ? 'balanced'
              : categories.includes('fastest')
                ? 'fastest'
                : 'alternative',

          recommendedCategories: categories,

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
          provisional: route.provisional ?? false,
          dataCoverage: route.data_coverage ?? null,

          safetyBreakdown: {
            streetLightingScore: null,
            crimeRiskScore:
              route.safety_factors?.crime_score == null
                ? null
                : Number(route.safety_factors.crime_score),

            liveTrafficScore:
              route.safety_factors?.traffic_score == null
                ? null
                : Number(route.safety_factors.traffic_score),

            accidentProneScore:
              route.safety_factors?.accident_score == null
                ? null
                : Number(route.safety_factors.accident_score),

            verifiedSafeHavens: 0,
          },

          safetyFactors: route.safety_factors ?? route.safetyFactors ?? {},
          weather: {
            condition: route.weather_info?.condition ?? 'Unknown',
            tempC: Number(route.weather_info?.temperature_c ?? 0),
            visibilityKm: Number(route.weather_info?.visibility_m ?? 0) / 1000,
            precipitationChance: Number(route.weather_info?.rain_1h_mm ?? 0),
          },
       };
      });

      const safestRouteId = recommendations.safest;

      setRoutes(formattedRoutes);

      setSelectedRouteId(
        safestRouteId != null
          ? String(safestRouteId)
          : formattedRoutes[0].id
      );

      return { ...result, routes: formattedRoutes };
    } catch (err) {
      console.error('Error fetching routes:', err);
      throw err;
    } finally {
      setIsCalculating(false);
    }
  };

  const saveSelectedRouteHistory = async (route) => {
    if (!routeHistoryCoordinates) {
      throw new Error('Route coordinates are not available.');
    }

    return await apiService.saveRouteHistory({
      ...routeHistoryCoordinates,
      selected_route: route.routeType || route.type || route.name || `Route ${route.id}`,
      safety_score: Number(route.safetyScore)
    });
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
        routeHistoryCoordinates,
        saveSelectedRouteHistory,
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
