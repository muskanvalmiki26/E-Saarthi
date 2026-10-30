import React, { useState } from 'react';
import {
  CornerUpRight,
  CornerUpLeft,
  ArrowUp,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  ShieldCheck,
  Compass,
  AlertTriangle
} from 'lucide-react';

export const NavigationHUD = ({
  currentStep = { instruction: "In 350m, Turn Right onto Janpath Arterial", distance: "350 m", turn: "right" },
  remainingDistanceKm = 11.4,
  remainingMinutes = 24,
  speedKmh = 38,
  progressPercent = 35,
  onExitNavigation = () => {}
}) => {
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [nightMode, setNightMode] = useState(false);

  // Turn icon selection
  const TurnIcon = currentStep.turn === 'right'
    ? CornerUpRight
    : currentStep.turn === 'left'
    ? CornerUpLeft
    : ArrowUp;

  return (
    <div className="space-y-3">
      {/* Top Turn HUD Card */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-2xl border border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 flex-shrink-0 animate-pulse">
            <TurnIcon className="w-8 h-8 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
              Next Action ({currentStep.distance})
            </span>
            <h2 className="text-base sm:text-lg font-black text-white leading-tight">
              {currentStep.instruction}
            </h2>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
              <span>Safe Corridor: Full CCTV & Street Lighting active</span>
            </div>
          </div>
        </div>

        {/* Quick Toggles */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`p-2.5 rounded-xl border transition-all ${
              voiceEnabled ? 'bg-slate-800 text-blue-400 border-slate-700' : 'bg-slate-800/50 text-slate-500 border-slate-800'
            }`}
            title={voiceEnabled ? 'Voice Guidance Active' : 'Voice Muted'}
          >
            {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          <button
            onClick={onExitNavigation}
            className="px-3.5 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white font-bold text-xs border border-red-500/30 transition-all"
          >
            End
          </button>
        </div>
      </div>

      {/* Bottom Telemetry HUD */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex items-center justify-between">
        <div className="grid grid-cols-3 gap-6 flex-1">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Remaining</span>
            <span className="text-lg font-black text-slate-900">{remainingDistanceKm} km</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">ETA</span>
            <span className="text-lg font-black text-emerald-600">{remainingMinutes} mins</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Live Speed</span>
            <span className="text-lg font-black text-blue-600">{speedKmh} km/h</span>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="hidden sm:block w-40 pl-4 border-l border-slate-100">
          <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
            <span>Route Progress</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavigationHUD;
