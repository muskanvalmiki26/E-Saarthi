import React from 'react';
import { AlertTriangle, Lightbulb, ShieldAlert, X } from 'lucide-react';

export const HazardAlertBanner = ({ hazards = [], onDismiss = () => {} }) => {
  if (!hazards || hazards.length === 0) return null;

  return (
    <div className="space-y-2">
      {hazards.map((hazard) => {
        const isLighting = hazard.type === 'lighting';

        return (
          <div
            key={hazard.id}
            className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 shadow-md animate-in slide-in-from-top-2 duration-300 ${
              isLighting
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-900'
                : 'bg-red-500/10 border-red-500/40 text-red-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-xl flex-shrink-0 text-white shadow-sm ${
                  isLighting ? 'bg-amber-500' : 'bg-red-500'
                }`}
              >
                {isLighting ? <Lightbulb className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider opacity-80">
                  Real-time Safety Alert
                </p>
                <h4 className="text-sm font-extrabold">{hazard.title}</h4>
                <p className="text-xs opacity-90 mt-0.5">{hazard.description}</p>
              </div>
            </div>

            <button
              onClick={() => onDismiss(hazard.id)}
              className="p-1 rounded-lg hover:bg-black/5 opacity-60 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default HazardAlertBanner;
