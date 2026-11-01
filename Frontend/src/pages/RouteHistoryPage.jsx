import React, { useEffect, useState } from 'react';
import { History, ShieldCheck, Clock, MapPin, ChevronRight } from 'lucide-react';
import { apiService } from '../api/apiService';

export const RouteHistoryPage = ({ onRouteChange }) => {
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await apiService.getRouteHistory();
        setHistoryItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Route history fetch failed:', err);
        setError('Unable to load route history. Please login again or retry.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatLocation = (lat, lng) =>
    `${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}`;

  const getLocationLabel = (item) => {
    try {
      const key = [
        item.current_latitude,
        item.current_longitude,
        item.destination_latitude,
        item.destination_longitude
      ].map(value => Number(value).toFixed(5)).join(',');

      const names = JSON.parse(
        localStorage.getItem('esaarthi_route_names') || '{}'
      );

      const saved = names[key];

      if (saved?.origin && saved?.destination) {
        return `${saved.origin} to ${saved.destination}`;
      }
    } catch (error) {
      console.warn('Unable to read saved route names:', error);
    }

    return `${formatLocation(item.current_latitude, item.current_longitude)} to ${formatLocation(item.destination_latitude, item.destination_longitude)}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <History className="w-6 h-6 text-blue-600" />
          <span>Route History</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Your previously saved routes and their safety scores.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading route history...</p>
      ) : error ? (
        <p className="p-4 rounded-xl bg-red-50 text-red-700 text-sm">{error}</p>
      ) : historyItems.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
          <History className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="font-bold text-slate-700">No route history yet</p>
          <p className="text-sm text-slate-500 mt-1">
            Your saved routes will appear here after you start navigation.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {historyItems.map((item) => (
            <div
              key={item.id}
              className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-bold text-slate-400">
                    Route ID: {item.id}
                  </span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    Saved
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-sm">{getLocationLabel(item)}
                </h4>

                <p className="text-xs text-slate-500 mt-1">
                  {item.selected_route || 'Selected Route'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block">Score</span>
                  <span className="text-base font-black text-emerald-900">
                    {item.safety_score ?? 'N/A'}{item.safety_score != null ? '/100' : ''}
                  </span>
                </div>

                <button
                  onClick={() => onRouteChange('routes')}
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600"
                  title="Plan another route"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RouteHistoryPage;


