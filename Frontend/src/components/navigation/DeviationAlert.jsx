import React from 'react';
import { RefreshCw, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { useSafety } from '../../context/SafetyContext';

export const DeviationAlert = () => {
  const { deviationStatus, simulateDeviation, resetDeviation } = useSafety();

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl text-white ${
              deviationStatus.isDeviated
                ? 'bg-amber-500 animate-bounce'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {deviationStatus.isDeviated ? (
              <AlertOctagon className="w-5 h-5 text-white" />
            ) : (
              <RefreshCw className="w-5 h-5 text-slate-500" />
            )}
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Safe Route Deviation Monitor
            </h4>
            <p className="text-xs font-bold text-slate-800 mt-0.5">
              {deviationStatus.isDeviated
                ? deviationStatus.message
                : deviationStatus.message || 'Tracking active. Currently adhering 100% to safest corridor.'}
            </p>
          </div>
        </div>

        <div>
          {deviationStatus.isDeviated ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Rerouting to Safe Corridor...</span>
              </div>
              <button
                onClick={resetDeviation}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600"
              >
                Clear
              </button>
            </div>
          ) : (
            <button
              onClick={simulateDeviation}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-amber-500 hover:text-white text-slate-700 text-xs font-bold border border-slate-200 transition-all shadow-sm"
              title="Click to simulate an off-route deviation for academic evaluation demo"
            >
              Simulate Off-Route Deviation
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeviationAlert;
