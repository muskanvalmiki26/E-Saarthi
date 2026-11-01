import React from 'react';
import { Flame, ShieldAlert, AlertTriangle, Eye, ShieldCheck, MapPin } from 'lucide-react';
import MapView from '../components/map/MapView';
import { useRoute } from '../context/RouteContext';
import { useSafety } from '../context/SafetyContext';

export const CrimeRiskPage = () => {
  const { routes } = useRoute();
  const { currentLocation } = useSafety();

  const riskHotspots = [
    { name: "Sanjay Van Peripheral Bypass", level: "High Risk", time: "Demo Data", notes: "Illustrative high-risk hotspot for demonstration." },
    { name: "Ring Road Lajpat Nagar Underpass", level: "Moderate Risk", time: "Demo Data", notes: "Illustrative moderate-risk hotspot for demonstration." },
    { name: "Janpath Central Commercial Corridor", level: "Low / Safe", time: "Demo Data", notes: "Illustrative low-risk hotspot for demonstration." }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Flame className="w-6 h-6 text-red-500" />
          <span>Crime Risk & Safe Haven Heatmap</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Illustrative sample crime-risk data for demonstration only. These hotspots are not live reports or route-specific safety assessments.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <MapView
            routes={routes}
            selectedRouteId="rt_safe_01"
            currentLocation={currentLocation}
            height="500px"
          />
        </div>

        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Sample Hotspots (Delhi Demo Data)
          </h3>

          {riskHotspots.map((spot, i) => (
            <div key={i} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                  spot.level.includes('High') ? 'bg-red-100 text-red-800' : spot.level.includes('Moderate') ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {spot.level}
                </span>
                <span className="text-[11px] font-semibold text-slate-400">{spot.time}</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm mt-1">{spot.name}</h4>
              <p className="text-xs text-slate-500 mt-1">{spot.notes}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CrimeRiskPage;

