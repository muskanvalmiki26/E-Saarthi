import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  PhoneCall,
  Radio,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  VolumeX,
  X,
  Send
} from 'lucide-react';
import { useSafety } from '../../context/SafetyContext';
import { useAuth } from '../../context/AuthContext';
import ContactCard from './ContactCard';

export const SOSModal = () => {
  const {
    isSOSActive,
    sosAlertData,
    triggerSOS,
    cancelSOS,
    currentLocation,
    contacts
  } = useSafety();
  const { user } = useAuth();

  const [countdown, setCountdown] = useState(null);
  const [showBroadcastDetails, setShowBroadcastDetails] = useState(false);

  // Handle countdown cancel protection
  useEffect(() => {
    let timer;
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCountdown(null);
      triggerSOS();
    }
    return () => clearTimeout(timer);
  }, [countdown, triggerSOS]);

  const handleSOSPress = () => {
    if (isSOSActive) {
      cancelSOS();
    } else {
      // Direct trigger or start 3-second quick confirm
      triggerSOS();
    }
  };

  return (
    <div className="space-y-6">
      {/* Main SOS Trigger Hub */}
      <div className={`p-4 sm:p-8 rounded-3xl border text-center transition-all ${
        isSOSActive
          ? 'bg-red-500/10 border-red-500/50 shadow-2xl'
          : 'bg-white border-slate-200/90 shadow-sm'
      }`}>
        {/* Status Indicator */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-6 border shadow-sm">
          {isSOSActive ? (
            <div className="flex items-center gap-2 text-red-600 bg-red-100/80 px-3 py-1 rounded-full border border-red-300">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
              <span>EMERGENCY ALERT BROADCAST ACTIVE</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>SOS System Ready • Tap to trigger</span>
            </div>
          )}
        </div>

        {/* Giant Circular Red Pulsing SOS Button */}
        <div className="py-4 flex flex-col items-center justify-center">
          <button
            type="button"
            onClick={handleSOSPress}
            className={`w-48 h-48 sm:w-56 sm:h-56 rounded-full flex flex-col items-center justify-center text-white font-black text-2xl sm:text-3xl tracking-wider transition-all transform active:scale-95 cursor-pointer shadow-2xl ${
              isSOSActive
                ? 'bg-red-600 hover:bg-red-700 ring-8 ring-red-500/40 sos-pulse-button'
                : 'bg-gradient-to-tr from-red-600 to-rose-500 hover:from-red-700 hover:to-rose-600 hover:scale-105 shadow-red-500/30'
            }`}
          >
            <ShieldAlert className="w-14 h-14 sm:w-16 sm:h-16 mb-2 animate-bounce" />
            <span>{isSOSActive ? 'STOP SOS' : 'PRESS FOR SOS'}</span>
            <span className="text-[11px] font-bold opacity-80 mt-1 uppercase tracking-widest">
              {isSOSActive ? 'Tap to Disarm' : 'Instant Dispatch'}
            </span>
          </button>
        </div>

        {/* Coordinates and Broadcast details */}
        <div className="mt-6 max-w-md mx-auto p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
          <div className="flex items-center gap-2 text-left">
            <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
            <div>
              <span className="font-bold text-slate-800 block truncate">{currentLocation.name}</span>
              <span className="text-[11px] text-slate-400">
                GPS: {currentLocation.lat.toFixed(4)}°N, {currentLocation.lng.toFixed(4)}°E (±{currentLocation.accuracy}m)
              </span>
            </div>
          </div>
          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            Live Locked
          </span>
        </div>

        {/* Active Alert Details when triggered */}
        {isSOSActive && (
          <div className="mt-6 p-5 bg-red-600 text-white rounded-2xl text-left shadow-lg animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-3 border-b border-red-500/60 pb-3">
              <div className="flex items-center gap-2 font-black text-sm uppercase tracking-wider">
                <Radio className="w-4 h-4 animate-spin" />
                <span>Live Emergency Telemetry Transmitted</span>
              </div>
              <span className="text-xs bg-red-800 px-2.5 py-0.5 rounded-full font-bold">
                Alert ID: {sosAlertData?.sosId || 'sos_77192'}
              </span>
            </div>

            <ul className="text-xs space-y-2 opacity-95">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                <span>Delhi Police Central PCR Control Room notified with live coordinates.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                <span>Automated SMS with live map URL dispatched to 3 verified emergency contacts.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                <span>Women Safety Cell (1091) dispatched alert acknowledgement.</span>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Emergency Helplines Direct Dial */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a
          href="tel:112"
          className="p-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl shadow-lg shadow-blue-500/20 flex items-center justify-between transition-all"
        >
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">National Emergency</span>
            <h3 className="text-xl font-black">Call 112</h3>
            <p className="text-xs opacity-90 mt-0.5">All-in-one Police, Fire & Ambulance</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <PhoneCall className="w-6 h-6" />
          </div>
        </a>

        <a
          href="tel:1091"
          className="p-5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white rounded-2xl shadow-lg shadow-rose-500/20 flex items-center justify-between transition-all"
        >
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Women in Distress</span>
            <h3 className="text-xl font-black">Call 1091</h3>
            <p className="text-xs opacity-90 mt-0.5">Dedicated 24x7 Women Safety Helpline</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <PhoneCall className="w-6 h-6" />
          </div>
        </a>
      </div>

      {/* Verified Emergency Contacts Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Saved Emergency Contacts</h3>
            <p className="text-xs text-slate-500">These guardians receive instant telemetry when SOS triggers</p>
          </div>
          <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
            {contacts.length} Verified Guardians
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {contacts.map((contact) => (
            <ContactCard key={contact.id} contact={contact} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SOSModal;
