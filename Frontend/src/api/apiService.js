import apiClient from './client';
import {
  MOCK_USER,
  MOCK_ROUTES,
  MOCK_EMERGENCY_SERVICES,
  MOCK_EMERGENCY_CONTACTS
} from './mockData';

// Simulated delay helper for realistic network feel during offline demos
const delay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));
export const apiService = {
  // 1. Authentication Endpoints
  async login({ email, password }) {
    try {
      const response = await apiClient.post('/login', { email, password });
      const data = response.data;

      return {
        token: data.access_token,
        user: {
          id: data.user_id,
          fullName: data.name,
          name: data.name,
          email: data.email
        }
      };
    } catch (err) {
      console.error('[E-Saarthi API] Login failed:', err.message);
      throw err;
    }
  },

  async register({ fullName, email, phone, password }) {
    try {
      const response = await apiClient.post('/create-user', {
        name: fullName,
        email,
        password
      });

      return {
        user: {
          id: response.data.user_id,
          fullName,
          name: fullName,
          email,
          phone
        },
        message: response.data.message
      };
    } catch (err) {
      console.error('[E-Saarthi API] Registration failed:', err.message);
      throw err;
    }
  },
  // 2. Route Calculation Endpoint
  async calculateRoutes({ origin, destination }) {
    try {
      const toCoordinates = async (location) => {
        // Already supplied as coordinates
        const lat = location?.latitude ?? location?.lat;
        const lng = location?.longitude ?? location?.lng ?? location?.lon;

        if (lat != null && lng != null && Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))) {
          return { latitude: Number(lat), longitude: Number(lng) };
        }

        // Accept coordinates entered as "latitude, longitude"
        if (typeof location === 'string') {
          const parts = location.split(',').map(value => Number(value.trim()));

          if (
            parts.length === 2 &&
            Number.isFinite(parts[0]) &&
            Number.isFinite(parts[1]) &&
            parts[0] >= -90 && parts[0] <= 90 &&
            parts[1] >= -180 && parts[1] <= 180
          ) {
            return {
              latitude: parts[0],
              longitude: parts[1]
            };
          }
        }

        // Convert a text address into coordinates
        const address = typeof location === 'string' ? location : location?.name;

        if (!address?.trim()) {
          throw new Error('Please enter a valid starting point and destination.');
        }

        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`
        );
        if (!response.ok) {
          throw new Error(`Location search failed: ${response.status}`);
        }

        const results = await response.json();
        if (!results.length) {
          throw new Error(`Location not found: ${address}`);
        }

        return {
          latitude: Number(results[0].lat),
          longitude: Number(results[0].lon)
        };
      };

      const [src, dst] = await Promise.all([
        toCoordinates(origin),
        toCoordinates(destination)
      ]);

      const response = await apiClient.post('/routes', {
        current_latitude: src.latitude,
        current_longitude: src.longitude,
        destination_latitude: dst.latitude,
        destination_longitude: dst.longitude
      }); 

      
      return {
        ...response.data,
        routeHistoryCoordinates: {
          current_latitude: src.latitude,
          current_longitude: src.longitude,
          destination_latitude: dst.latitude,
          destination_longitude: dst.longitude
        }
      };


    } catch (err) {
      console.error('[E-Saarthi API] Route calculation failed:', err.message);
      throw err;
    }
  },

  // Save selected route to history
  async saveRouteHistory(routeData) {
    try {
      const response = await apiClient.post('/route-history', routeData);
      return response.data;
    } catch (err) {
      console.error('[E-Saarthi API] Route history save failed:', err.message);
      throw err;
    }
  },


  // 3. Route Details & Safety Breakdown Endpoint
  async getRouteDetails(routeId) {
    try {
      const response = await apiClient.get(`/routes/details/${routeId}`);
      return response.data;
    } catch (err) {
      console.warn(`[E-Saarthi API] /routes/details/${routeId} using offline fallback:`, err.message);
      await delay(300);
      const foundRoute = MOCK_ROUTES.find(r => r.id === routeId) || MOCK_ROUTES[0];
      return {
        routeId: foundRoute.id,
        safetyBreakdown: foundRoute.safetyBreakdown,
        weather: foundRoute.weather,
        lightingScore: foundRoute.lightingScore,
        cctvCoverage: foundRoute.cctvCoverage,
        patrolFrequency: foundRoute.patrolFrequency,
        description: foundRoute.description
      };
    }
  },

  // 4. Nearby Emergency Services Endpoint
  async getNearbyServices({ lat = 28.6315, lng = 77.2167, type = 'all', radius = 10 } = {}) {
    try {
      const categories = type === 'all'
        ? ['hospital', 'police', 'fire_station', 'pharmacy', 'ambulance']
        : [type];

      const results = await Promise.allSettled(
        categories.map(async (category) => {
          const response = await apiClient.post('/emergency-services', {
            latitude: Number(lat),
            longitude: Number(lng),
            service_type: category
          });

          return response.data.services ?? [];
        })
      );

      const services = results
        .filter(result => result.status === 'fulfilled')
        .flatMap(result => result.value);

      return {
        location: { lat, lng },
        totalFound: services.length,
        services
      };

    } catch (err) {
      console.error('[E-Saarthi API] Emergency services failed:', err.message);
      throw err;
    }
  },
  // 5. Emergency SOS Trigger Endpoint
  async triggerSOS({
    lat = 28.6315,
    lng = 77.2167,
    timestamp = new Date().toISOString(),
    note = ''
  } = {}) {
    try {
      const response = await apiClient.post('/sos', {
        latitude: Number(lat),
        longitude: Number(lng),
        message: note || 'Emergency SOS triggered'
      });

      const data = response.data;

      return {
        ...data,
        success: true,
        sosId: data.sos_id ?? data.id,
        status: data.status ?? 'ACTIVE',
        timestamp: data.timestamp ?? timestamp,
        coordinates: { lat, lng }
      };
    } catch (err) {
      console.error('[E-Saarthi API] SOS request failed:', err.message);
      throw err;
    }
  },

  // 6. Emergency Contacts helper
  async getEmergencyContacts() {
    try {
      const response = await apiClient.get('/emergency-contacts');
      const data = response.data;

      return Array.isArray(data) ? data : data.contacts ?? [];
    } catch (err) {
      console.error('[E-Saarthi API] Emergency contacts failed:', err.message);
      throw err;
    }
  },

  async addEmergencyContact({ name, phone, relation }) {
    try {
      const response = await apiClient.post('/emergency-contacts', {
        name,
        phone,
        relation
      });
      return response.data;
    } catch (err) {
      console.error('[E-Saarthi API] Add contact failed:', err.message);
      throw err;
    }
  },

  async deleteEmergencyContact(contactId) {
    try {
      const response = await apiClient.delete(
        `/emergency-contact/${contactId}`
      );
      return response.data;
    } catch (err) {
      console.error('[E-Saarthi API] Delete contact failed:', err.message);
      throw err;
    }
  },

  async resolveSOS(sosId) {
    try {
      const response = await apiClient.put(
        `/sos/${sosId}/resolve`
      );
      return response.data;
    } catch (err) {
      console.error('[E-Saarthi API] SOS resolve failed:', err.message);
      throw err;
    }
  },

};

export default apiService;
