import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import { useSafety } from '../../context/SafetyContext';
import {
  LayoutDashboard,
  MapPin,
  LifeBuoy,
  User,
  ShieldAlert,
  Flame,
  PhoneCall
} from 'lucide-react';

export const AppLayout = ({ children, currentRoute, onRouteChange }) => {
  const { isSOSActive } = useSafety();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div
      className={`min-h-screen flex bg-slate-50 relative overflow-x-hidden ${
        isSOSActive ? 'screen-emergency-active' : ''
      }`}
    >
      {/* Sidebar (Desktop persistent + Mobile overlay drawer) */}
      <Sidebar
        currentRoute={currentRoute}
        onRouteChange={onRouteChange}
        isMobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <TopHeader
          onRouteChange={onRouteChange}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-28 lg:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Visible only on mobile/tablet < 1024px) */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-lg border-t border-slate-200 z-40 px-2 py-1.5 flex items-center justify-around shadow-2xl safe-area-pb"
        aria-label="Mobile Bottom Navigation"
      >
        {/* 1. Dashboard */}
        <button
          onClick={() => onRouteChange('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            currentRoute === 'dashboard'
              ? 'text-blue-600 font-bold scale-105'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Home</span>
        </button>

        {/* 2. Routes Planner */}
        <button
          onClick={() => onRouteChange('routes')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            currentRoute === 'routes' || currentRoute === 'navigate'
              ? 'text-blue-600 font-bold scale-105'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <MapPin className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Routes</span>
        </button>

        {/* 3. Center Elevated Emergency SOS Button */}
        <button
          onClick={() => onRouteChange('sos')}
          className={`-mt-5 p-3.5 rounded-full bg-red-600 text-white shadow-xl shadow-red-600/40 border-4 border-slate-50 flex items-center justify-center transition-transform active:scale-95 ${
            isSOSActive ? 'animate-bounce ring-4 ring-red-400' : 'hover:bg-red-700'
          }`}
          title="Emergency SOS Dispatch"
          aria-label="Emergency SOS"
        >
          <ShieldAlert className="w-6 h-6 animate-pulse" />
        </button>

        {/* 4. Emergency Services */}
        <button
          onClick={() => onRouteChange('emergency-services')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            currentRoute === 'emergency-services'
              ? 'text-blue-600 font-bold scale-105'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <LifeBuoy className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Services</span>
        </button>

        {/* 5. Profile */}
        <button
          onClick={() => onRouteChange('profile')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            currentRoute === 'profile'
              ? 'text-blue-600 font-bold scale-105'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Profile</span>
        </button>
      </nav>

      {/* Emergency Active Alert Toast Banner */}
      {isSOSActive && (
        <div className="fixed bottom-20 lg:bottom-4 right-4 sm:right-6 z-50 bg-red-600 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2.5 border-2 border-white animate-pulse">
          <div className="w-2.5 h-2.5 rounded-full bg-white animate-ping flex-shrink-0" />
          <span className="font-bold text-xs tracking-wide truncate max-w-[200px] sm:max-w-none">
            🚨 ACTIVE SOS TELEMETRY BROADCAST
          </span>
          <button
            onClick={() => onRouteChange('sos')}
            className="ml-1 bg-white text-red-600 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase hover:bg-red-50 flex-shrink-0"
          >
            Manage
          </button>
        </div>
      )}
    </div>
  );
};

export default AppLayout;
