import React, { useState } from 'react';
import { MapPin, Navigation, Compass, Search, Sparkles, Check } from 'lucide-react';
import { MOCK_SEARCH_PRESETS } from '../../api/mockData';
import { useRoute } from '../../context/RouteContext';
import { useSafety } from '../../context/SafetyContext';

export const RoutePlannerInput = () => {
  const { origin, setOrigin, destination, setDestination, calculateRoutes, isCalculating } = useRoute();
  const { currentLocation } = useSafety();
  const [showPresets, setShowPresets] = useState(false);

  const handleUseCurrentLocation = () => {
    setOrigin(currentLocation.name);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!origin || !destination) return;
    calculateRoutes(origin, destination);
  };

  const handleSelectPreset = (presetLabel) => {
    setDestination(presetLabel);
    setShowPresets(false);
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Plan Safe Navigation</h3>
            <p className="text-xs text-slate-500">AI analyzes crime records, street lighting & live hazards</p>
          </div>
        </div>
        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60 flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Safe Routing Active
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Origin / Starting Point Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center justify-between">
            <span>Pickup / Starting Point</span>
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              className="text-blue-600 hover:text-blue-700 text-xs font-bold flex items-center gap-1 hover:underline"
            >
              <Navigation className="w-3 h-3" />
              Use GPS Location
            </button>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-600">
              <div className="w-3 h-3 rounded-full border-2 border-emerald-500 bg-white" />
            </div>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="Enter starting location or landmark..."
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-slate-800"
              required
            />
          </div>
        </div>

        {/* Destination Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center justify-between">
            <span>Destination Address</span>
            <button
              type="button"
              onClick={() => setShowPresets(!showPresets)}
              className="text-slate-500 hover:text-slate-700 text-xs font-semibold"
            >
              {showPresets ? 'Close Presets' : 'Quick Presets ▾'}
            </button>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-red-500">
              <MapPin className="w-4 h-4 fill-red-500 text-red-500" />
            </div>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Where do you want to safely travel?"
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-slate-800"
              required
            />
          </div>

          {/* Quick Destination Preset Chips */}
          {showPresets && (
            <div className="mt-2.5 p-2 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap gap-1.5">
              {MOCK_SEARCH_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(preset.label)}
                  className="text-xs bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 text-slate-700 font-medium px-2.5 py-1 rounded-lg border border-slate-200 transition-all flex items-center gap-1"
                >
                  <MapPin className="w-2.5 h-2.5 text-slate-400" />
                  {preset.label.split(',')[0]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={isCalculating}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        >
          {isCalculating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Analyzing Safe Corridors...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Find Safe Routes</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default RoutePlannerInput;
