import React from 'react';
import { History, ShieldCheck, Clock, MapPin, ChevronRight } from 'lucide-react';

export const RouteHistoryPage = ({ onRouteChange }) => {
  const historyItems = [
    {
      id: "hist_1",
      date: "Today, 4:30 PM",
      from: "Connaught Place, Central Delhi",
      to: "Saket District Centre, South Delhi",
      safetyScore: 94,
      duration: "31 mins",
      distance: "14.2 km",
      status: "Safely Arrived"
    },
    {
      id: "hist_2",
      date: "Yesterday, 8:45 PM",
      from: "Delhi University North Campus",
      to: "Rohini Sector 15",
      safetyScore: 88,
      duration: "22 mins",
      distance: "9.6 km",
      status: "Safely Arrived"
    },
    {
      id: "hist_3",
      date: "24 Oct 2026, 9:15 PM",
      from: "Cyber City DLF Phase 2",
      to: "Hauz Khas Village",
      safetyScore: 91,
      duration: "38 mins",
      distance: "18.5 km",
      status: "Safely Arrived"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <History className="w-6 h-6 text-blue-600" />
          <span>Completed Route History & Safety Audits</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Archived trips and post-transit telemetry confirmation receipts.
        </p>
      </div>

      <div className="space-y-3">
        {historyItems.map((item) => (
          <div
            key={item.id}
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-bold text-slate-400">{item.date}</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {item.status}
                </span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">
                {item.from} → {item.to}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {item.distance} • {item.duration} transit
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">Score</span>
                <span className="text-base font-black text-emerald-900">{item.safetyScore}/100</span>
              </div>

              <button
                onClick={() => onRouteChange('routes')}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600"
                title="Rerun this safe route"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RouteHistoryPage;
