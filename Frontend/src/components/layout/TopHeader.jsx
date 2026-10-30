import React from 'react';
import {
  ShieldAlert,
  Radio,
  Sparkles,
  PhoneCall,
  MapPin,
  Menu
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSafety } from '../../context/SafetyContext';

export const TopHeader = ({ onRouteChange, onOpenMobileMenu = () => {} }) => {
  const { user } = useAuth();
  const {
    isSOSActive,
    isLocationSharingActive,
    toggleLocationSharing,
    currentLocation
  } = useSafety();

  // Dynamic greeting based on current local hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const firstName = user?.fullName?.split(' ')[0] || 'Priya';
  const safetyScore = user?.safetyScore || 78;

  return (
    <header className="h-16 sm:h-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-20 transition-all">
      {/* Left: Mobile Menu Button + Avatar + Greeting */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        {/* Mobile Hamburger Drawer Trigger */}
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors flex-shrink-0"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {user?.avatarUrl && (
          <img
            src={user.avatarUrl}
            alt={user.fullName || 'User'}
            onClick={() => onRouteChange('profile')}
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl object-cover border-2 border-slate-200 shadow-sm cursor-pointer hover:scale-105 transition-transform flex-shrink-0"
            title="View Profile"
          />
        )}

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h2 className="text-sm sm:text-lg lg:text-xl font-extrabold tracking-tight text-slate-900 truncate">
              {getGreeting()}, {firstName}!
            </h2>
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500 flex-shrink-0 hidden xs:inline" />
          </div>
          <div className="flex items-center gap-1 text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">
            <MapPin className="w-3 h-3 text-blue-600 flex-shrink-0" />
            <span className="font-medium text-slate-700 truncate">{currentLocation.name?.split(',')[0]}</span>
            <span className="text-slate-400 hidden md:inline">• GPS (±{currentLocation.accuracy}m)</span>
          </div>
        </div>
      </div>

      {/* Right: Quick Action Controls (Optimized for Mobile) */}
      <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
        {/* Safety Score Badge (Tablet & Desktop) */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <div className="text-xs font-semibold">
            Safety Score: <span className="font-extrabold text-emerald-900">{safetyScore}/100</span>
          </div>
        </div>

        {/* Live Location Sharing Toggle */}
        <button
          onClick={toggleLocationSharing}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            isLocationSharingActive
              ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm hover:bg-blue-100'
              : 'bg-slate-100 border-slate-300 text-slate-600 hover:bg-slate-200'
          }`}
          title={isLocationSharingActive ? 'Live GPS broadcast active to emergency cloud' : 'Location sharing paused'}
        >
          <Radio
            className={`w-3.5 h-3.5 ${
              isLocationSharingActive ? 'text-blue-600 animate-pulse' : 'text-slate-400'
            }`}
          />
          <span className="hidden sm:inline">
            {isLocationSharingActive ? 'Sharing On' : 'Paused'}
          </span>
          <div
            className={`w-2 h-2 rounded-full ${
              isLocationSharingActive ? 'bg-blue-600' : 'bg-slate-400'
            }`}
          />
        </button>

        {/* Active SOS Status / Trigger Button */}
        {isSOSActive ? (
          <button
            onClick={() => onRouteChange('sos')}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full bg-red-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-500/40 animate-pulse-fast hover:bg-red-700 transition-all"
          >
            <ShieldAlert className="w-3.5 h-3.5 animate-bounce" />
            <span className="text-[11px] sm:text-xs">SOS Active</span>
          </button>
        ) : (
          <button
            onClick={() => onRouteChange('sos')}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white font-bold text-xs transition-all shadow-sm"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">SOS</span>
          </button>
        )}

        {/* National Helpline 112 Direct Call Button */}
        <a
          href="tel:112"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold border border-slate-200 transition-all"
          title="Direct call to National Emergency 112"
        >
          <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
          <span>Call 112</span>
        </a>
      </div>
    </header>
  );
};

export default TopHeader;
