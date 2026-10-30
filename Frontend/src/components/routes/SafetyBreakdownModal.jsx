import React from 'react';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  Sun,
  CloudRain,
  Eye,
  Wind,
  ShieldAlert,
  Lightbulb,
  Car,
  AlertCircle,
  Building2,
  Navigation,
  Sparkles
} from 'lucide-react';

export const SafetyBreakdownModal = ({
  isOpen,
  onClose,
  route,
  onStartNavigation
}) => {
  if (!isOpen || !route) return null;

  const { safetyBreakdown, weather } = route;

  const isSafe = route.tagType === 'safe';
  const isBalanced = route.tagType === 'balanced';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                isSafe
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : isBalanced
                  ? 'bg-amber-50 text-amber-700 border-amber-300'
                  : 'bg-red-50 text-red-700 border-red-300'
              }`}>
                {route.tag}
              </span>
              <span className="text-xs font-semibold text-slate-500">Detailed AI Safety Audit</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">{route.name}</h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Top Score Banner */}
          <div className={`p-5 rounded-2xl flex items-center justify-between border ${
            isSafe
              ? 'bg-emerald-50/70 border-emerald-200'
              : isBalanced
              ? 'bg-amber-50/70 border-amber-200'
              : 'bg-red-50/70 border-red-200'
          }`}>
            <div className="flex items-center gap-3.5">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md ${
                isSafe ? 'bg-emerald-600' : isBalanced ? 'bg-amber-500' : 'bg-red-500'
              }`}>
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Composite Safety Score</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900">{route.safetyScore}</span>
                  <span className="text-sm font-semibold text-slate-500">/ 100</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                    isSafe ? 'bg-emerald-200 text-emerald-900' : isBalanced ? 'bg-amber-200 text-amber-900' : 'bg-red-200 text-red-900'
                  }`}>
                    {route.riskLevel}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right hidden sm:block">
              <span className="text-xs text-slate-500 font-semibold block">ETA & Distance</span>
              <span className="text-base font-extrabold text-slate-900">{route.etaMinutes} mins • {route.distanceKm} km</span>
            </div>
          </div>

          {/* Breakdown Score Bars */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-blue-600" />
              Safety Parameter Breakdown
            </h4>

            <div className="space-y-3.5">
              {/* Street Lighting */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    Street Lighting & Active Lumens
                  </span>
                  <span className="text-slate-900">{safetyBreakdown.streetLightingScore}/100</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${safetyBreakdown.streetLightingScore}%` }}
                  />
                </div>
              </div>

              {/* Crime Risk (Lower is safer) */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <ShieldAlert className="w-4 h-4 text-red-500" />
                    Historical Crime Risk Incident Index (Lower is Better)
                  </span>
                  <span className={safetyBreakdown.crimeRiskScore < 25 ? 'text-emerald-600' : 'text-red-600'}>
                    {safetyBreakdown.crimeRiskScore}/100 {safetyBreakdown.crimeRiskScore < 25 ? '(Very Safe)' : '(Elevated Risk)'}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      safetyBreakdown.crimeRiskScore < 25 ? 'bg-emerald-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${safetyBreakdown.crimeRiskScore}%` }}
                  />
                </div>
              </div>

              {/* Live Traffic */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <Car className="w-4 h-4 text-blue-500" />
                    Live Traffic & Corridor Congestion
                  </span>
                  <span className="text-slate-900">{safetyBreakdown.liveTrafficScore}/100 (Flowing)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${safetyBreakdown.liveTrafficScore}%` }}
                  />
                </div>
              </div>

              {/* Accident Prone Score */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <AlertCircle className="w-4 h-4 text-purple-500" />
                    Accident Prone Blackspot Index (Lower is Better)
                  </span>
                  <span className="text-slate-900">{safetyBreakdown.accidentProneScore}/100</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${safetyBreakdown.accidentProneScore}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Safe Havens & Police Presence */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Police Patrol</span>
              <p className="text-xs font-extrabold text-slate-800 mt-1">{route.patrolFrequency}</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">CCTV Coverage</span>
              <p className="text-xs font-extrabold text-slate-800 mt-1">{route.cctvCoverage}</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Verified Havens</span>
              <p className="text-xs font-extrabold text-emerald-600 mt-1">{safetyBreakdown.verifiedSafeHavens} En Route</p>
            </div>
          </div>

          {/* Live Weather Card */}
          {weather && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-slate-800">Live Weather on Corridor</span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-200 text-blue-900">
                  {weather.condition}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold block">Temperature</span>
                  <span className="font-extrabold text-slate-800 text-sm">{weather.tempC}°C</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold block">Visibility</span>
                  <span className="font-extrabold text-slate-800 text-sm">{weather.visibilityKm} km</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold block">Precipitation</span>
                  <span className="font-extrabold text-slate-800 text-sm">{weather.precipitationChance}%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-all"
          >
            Close
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onStartNavigation(route);
            }}
            className="py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
          >
            <Navigation className="w-4 h-4" />
            <span>Select & Start Navigation</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SafetyBreakdownModal;
