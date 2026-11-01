
import React from 'react';
import { PhoneCall, Navigation, Clock, ShieldCheck, MapPin } from 'lucide-react';

export const ServiceCard = ({ service, onNavigateHere }) => {
  const isPolice = service.type === 'police';
  const isHospital = service.type === 'hospital';
  const isFire = service.type === 'fire_station';
  const isWomen = service.type === 'women_desk';

  const badgeColor = isPolice
    ? 'bg-blue-50 text-blue-700 border-blue-200'
    : isHospital
    ? 'bg-red-50 text-red-700 border-red-200'
    : isFire
    ? 'bg-orange-50 text-orange-700 border-orange-200'
    : isWomen
    ? 'bg-purple-50 text-purple-700 border-purple-200'
    : 'bg-emerald-50 text-emerald-700 border-emerald-200';

  const emoji = isPolice
    ? '\u{1F46E}'
    : isHospital
    ? '\u{1F3E5}'
    : isFire
    ? '\u{1F692}'
    : isWomen
    ? '\u{1F6E1}\u{FE0F}'
    : '\u{1F48A}';

  const distance = service.distanceKm ?? service.distance_km;
  const hasDistance = distance !== null &&
    distance !== undefined &&
    Number.isFinite(Number(distance));

  const hasEta = service.etaMinutes !== null &&
    service.etaMinutes !== undefined &&
    Number.isFinite(Number(service.etaMinutes));

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className={`text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${badgeColor} flex items-center gap-1`}>
            <span>{emoji}</span>
            <span>{service.categoryLabel}</span>
          </span>

          <div className="flex flex-col items-end gap-1 text-xs font-extrabold text-slate-800">
            {hasDistance && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                {Number(distance).toFixed(2)} km away
              </span>
            )}

            {hasEta && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                {Number(service.etaMinutes)} mins (Approx. walk)
              </span>
            )}
          </div>
        </div>

        <h3 className="font-bold text-slate-900 text-sm mb-1">{service.name}</h3>

        <p className="text-xs text-slate-500 mb-3 flex items-start gap-1">
          <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
          <span>{service.address}</span>
        </p>

        {service.badges && service.badges.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {service.badges.map((b, i) => (
              <span
                key={i}
                className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
              >
                {b}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
        <a
          href={service.phone ? `tel:${service.phone}` : undefined}
          className="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-blue-500/20"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>
            {service.phone
              ? `Call (${service.phone.split(' ').slice(0, 3).join(' ')})`
              : 'Phone unavailable'}
          </span>
        </a>

        <button
          onClick={() => onNavigateHere(service)}
          className="py-2.5 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1"
          title="Set as destination in Route Planner"
        >
          <Navigation className="w-3.5 h-3.5 text-blue-600" />
          <span>Navigate</span>
        </button>
      </div>
    </div>
  );
};

export default ServiceCard;



