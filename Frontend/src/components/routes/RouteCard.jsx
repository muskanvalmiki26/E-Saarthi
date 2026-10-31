import React from 'react';
import { ShieldCheck, AlertTriangle, Clock, MapPin, ChevronRight, Eye, Sparkles } from 'lucide-react';

export const RouteCard = ({
  route,
  isSelected,
  onSelect,
  onInspectSafety,
  onStartNavigation
}) => {
  const isSafe = route.tagType === 'safe';
  const isBalanced = route.tagType === 'balanced';
  const isFastest = route.tagType === 'fastest';
  const isAlternative = !isSafe && !isBalanced && !isFastest;
  // Badge colors and border styling based on route type
  const badgeColors = isSafe
    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
    : isBalanced
    ? 'bg-orange-50 text-orange-700 border-orange-300'
    : isFastest
    ? 'bg-red-50 text-red-700 border-red-300'
    : 'bg-slate-50 text-slate-600 border-slate-300';

  const scoreBadgeBg = isSafe
    ? 'bg-emerald-600 text-white'
    : isBalanced
    ? 'bg-orange-500 text-white'
    : isFastest
    ? 'bg-red-600 text-white'
    : 'bg-slate-600 text-white';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect?.();
        }
      }}
      
      className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer bg-white ${
        isSelected
          ? isSafe
            ? 'border-emerald-500 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/20'
            : isBalanced
            ? 'border-orange-500 shadow-lg shadow-orange-500/10 ring-2 ring-orange-500/20'
            : isFastest
            ? 'border-red-500 shadow-lg shadow-red-500/10 ring-2 ring-red-500/20'
            : 'border-slate-400 shadow-lg shadow-slate-400/10 ring-2 ring-slate-400/20'
          : 'border-slate-200/90 hover:border-slate-300 shadow-sm hover:shadow'
      }`} 
    >
      {/* Top Header with Tag & Safety Score */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${badgeColors} flex items-center gap-1 tracking-wider`}>
            {isSafe && <Sparkles className="w-3 h-3 fill-emerald-600 text-emerald-600" />}
            {isFastest && <AlertTriangle className="w-3 h-3" />}
            {route.tag}
          </span>
          <span className="text-xs font-semibold text-slate-500">
            {route.riskLevel}
          </span>
        </div>

        {/* Safety Score Badge */}
        <div className={`px-2.5 py-1 rounded-xl font-extrabold text-xs flex items-center gap-1 shadow-sm ${scoreBadgeBg}`}>
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Safety {route.safetyScore}/100</span>
        </div>
      </div>

      {/* Route Name & Key Highlights */}
      <h4 className="font-bold text-slate-900 text-sm mb-1 leading-snug">
        {route.name}
      </h4>
      <p className="text-xs text-slate-500 mb-3.5 line-clamp-2">
        {route.description}
      </p>

      {/* Metrics Row: ETA, Distance, Street Lighting */}
      <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-slate-50 rounded-xl mb-3.5 text-center">
        <div>
          <span className="block text-[10px] uppercase font-bold text-slate-400">ETA</span>
          <div className="flex items-center justify-center gap-1 font-extrabold text-slate-800 text-sm">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>{route.etaMinutes} min</span>
          </div>
        </div>
        <div>
          <span className="block text-[10px] uppercase font-bold text-slate-400">Distance</span>
          <div className="flex items-center justify-center gap-1 font-extrabold text-slate-800 text-sm">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <span>{route.distanceKm} km</span>
          </div>
        </div>
        <div>
          <span className="block text-[10px] uppercase font-bold text-slate-400">Road Score</span>
          <div className="font-extrabold text-slate-800 text-sm">
            {route.safetyFactors?.road_score ??
            route.safetyFactors?.roadScore ??
            'N/A'}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onInspectSafety(route);
          }}
          className="flex-1 py-2 px-3 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex items-center justify-center gap-1.5"
        >
          <Eye className="w-3.5 h-3.5 text-slate-500" />
          <span>Inspect Safety Details</span>
        </button>

        {isSelected && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onStartNavigation(route);
            }}
            className={`py-2 px-4 text-xs font-bold text-white rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 ${
              isSafe
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                : isBalanced
                ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/30'
                : isFastest
                ? 'bg-red-600 hover:bg-red-700 shadow-red-600/30'
                : 'bg-slate-600 hover:bg-slate-700 shadow-slate-600/30'
            }`}
          >
            <span>Navigate</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default RouteCard;
