import React from 'react';
import {
  Compass,
  ShieldAlert,
  LifeBuoy,
  PhoneCall,
  MapPin,
  ShieldCheck,
  Radio,
  Clock,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSafety } from '../context/SafetyContext';
import { useRoute } from '../context/RouteContext';
import MapView from '../components/map/MapView';
import { MOCK_EMERGENCY_SERVICES } from '../api/mockData';

export const DashboardPage = ({ onRouteChange }) => {
  const { user } = useAuth();
  const { currentLocation, isLocationSharingActive, isSOSActive } = useSafety();
  const { routes } = useRoute();

  return (
    <div className="space-y-6">
      {/* Welcome Banner with Safety Score and Radar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-700/60">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center">
          <ShieldCheck className="w-80 h-80 text-white" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] uppercase font-extrabold tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2.5 py-0.5 rounded-full">
              Live Protection Active
            </span>
            <span className="text-xs text-slate-400">• New Delhi Safe Transit Grid</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Safe travels, {user?.fullName?.split(' ')[0] || 'Priya'}.
          </h2>
          <p className="text-sm text-slate-300 mt-2 font-normal leading-relaxed">
            Your corridor is actively monitored with verified police patrol routes, street lumen analysis, and instant one-touch SOS telemetry.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onRouteChange('routes')}
              className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-600/30"
            >
              <Compass className="w-4 h-4" />
              <span>Plan Safe Route</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onRouteChange('sos')}
              className="py-2.5 px-4 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
            >
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>Emergency SOS</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Quick Action 1: Route Planner */}
        <div
          onClick={() => onRouteChange('routes')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-blue-400 transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
            Plan a Safe Route
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Compare 3 AI corridors ranked by crime, lighting & police presence.
          </p>
        </div>

        {/* Quick Action 2: Emergency SOS */}
        <div
          onClick={() => onRouteChange('sos')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-red-400 transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm group-hover:text-red-600 transition-colors">
            Emergency SOS
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Instant broadcast of live telemetry to Police 112 and contacts.
          </p>
        </div>

        {/* Quick Action 3: Emergency Services */}
        <div
          onClick={() => onRouteChange('emergency-services')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-emerald-400 transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <LifeBuoy className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-600 transition-colors">
            Nearby Services
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Police stations, emergency hospitals, and 24x7 pharmacies.
          </p>
        </div>

        {/* Quick Action 4: Contacts */}
        <div
          onClick={() => onRouteChange('contacts')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-purple-400 transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <PhoneCall className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm group-hover:text-purple-600 transition-colors">
            Manage Contacts
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            3 verified guardians ready to receive instant SOS telemetry.
          </p>
        </div>
      </div>

      {/* Current Location Card & Interactive Map Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Location Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Current Location Telemetry
              </span>
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Live GPS Locked
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 mb-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-md">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">{currentLocation.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Lat: {currentLocation.lat.toFixed(4)}°N, Lng: {currentLocation.lng.toFixed(4)}°E
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Accuracy Radius: ±{currentLocation.accuracy} meters • High Precision
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-center">
                <span className="text-[10px] uppercase font-bold text-emerald-800">Verified Havens</span>
                <p className="text-lg font-extrabold text-emerald-900">14 Active</p>
              </div>
              <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-center">
                <span className="text-[10px] uppercase font-bold text-blue-800">PCR Frequency</span>
                <p className="text-lg font-extrabold text-blue-900">Every 12 min</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => onRouteChange('routes')}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Compass className="w-4 h-4 text-blue-600" />
            <span>Launch Interactive Route Planner</span>
          </button>
        </div>

        {/* Live Overview Map Preview */}
        <div className="lg:col-span-2">
          <MapView
            routes={routes}
            selectedRouteId="rt_safe_01"
            currentLocation={currentLocation}
            emergencyServices={MOCK_EMERGENCY_SERVICES.slice(0, 4)}
            height="360px"
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
