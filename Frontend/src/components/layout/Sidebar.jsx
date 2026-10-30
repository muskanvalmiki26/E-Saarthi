import React, { useState } from 'react';
import {
  Shield,
  LayoutDashboard,
  MapPin,
  Navigation,
  LifeBuoy,
  PhoneCall,
  Flame,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  History,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSafety } from '../../context/SafetyContext';

export const Sidebar = ({ currentRoute, onRouteChange, isMobileOpen = false, onCloseMobile = () => {} }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { isSOSActive } = useSafety();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'routes', label: 'Live Map / Routes', icon: MapPin },
    { id: 'navigate', label: 'Live Navigation', icon: Navigation },
    { id: 'emergency-services', label: 'Emergency Services', icon: LifeBuoy },
    { id: 'sos', label: 'SOS Emergency', icon: AlertTriangle, isAlert: true },
    { id: 'contacts', label: 'Emergency Contacts', icon: PhoneCall },
    { id: 'crime-risk', label: 'Crime Risk Map', icon: Flame },
    { id: 'history', label: 'Route History', icon: History },
  ];

  const handleNavClick = (id) => {
    onRouteChange(id);
    onCloseMobile();
  };

  const handleLogout = () => {
    onCloseMobile();
    logout();
  };

  const sidebarContent = (isMobile = false) => (
    <div className="h-full flex flex-col justify-between select-none">
      {/* Brand Logo Header */}
      <div>
        <div className="flex items-center justify-between p-4 border-b border-slate-800/80">
          <div
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            {(!collapsed || isMobile) && (
              <div className="overflow-hidden">
                <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  E-Saarthi
                  <span className="text-[10px] bg-blue-500/20 text-blue-400 font-semibold px-1.5 py-0.5 rounded-full border border-blue-500/30">
                    Live
                  </span>
                </h1>
                <p className="text-xs text-slate-400 font-medium truncate">Safe Citizen Transit</p>
              </div>
            )}
          </div>

          {isMobile ? (
            <button
              onClick={onCloseMobile}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close Navigation"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Active SOS Warning Alert Banner */}
        {isSOSActive && (!collapsed || isMobile) && (
          <div className="mx-3 mt-3 p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 animate-pulse">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping flex-shrink-0" />
            <span className="text-xs font-semibold text-red-400 tracking-wide truncate">
              EMERGENCY SOS ACTIVE
            </span>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5 mt-2 overflow-y-auto max-h-[calc(100vh-220px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            const isSOS = item.id === 'sos';

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all relative ${
                  isActive
                    ? isSOS
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 font-bold'
                      : 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 font-bold'
                    : isSOS
                    ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                }`}
                title={collapsed && !isMobile ? item.label : undefined}
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 ${
                    isActive
                      ? 'text-white'
                      : isSOS
                      ? 'text-red-400'
                      : 'text-slate-400 group-hover:text-white'
                  }`}
                />
                {(!collapsed || isMobile) && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}
                {isSOS && (!collapsed || isMobile) && isSOSActive && (
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-ping flex-shrink-0" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Info & Logout footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/90">
        <div
          onClick={() => handleNavClick('profile')}
          className={`flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/70 cursor-pointer transition-colors ${
            currentRoute === 'profile' ? 'bg-slate-800 text-white' : ''
          }`}
          title={collapsed && !isMobile ? user?.fullName || 'Profile' : undefined}
        >
          <div className="relative flex-shrink-0">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName || 'User'}
                className="w-9 h-9 rounded-full object-cover border border-slate-700 shadow-md"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                {user?.fullName?.charAt(0) || 'P'}
              </div>
            )}
            {user?.provider === 'github' && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-black rounded-full border border-slate-700 flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              </div>
            )}
          </div>
          {(!collapsed || isMobile) && (
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate leading-tight">
                {user?.fullName || 'Priya Sharma'}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {user?.provider === 'github' ? `@${user?.username || 'github'}` : 'Citizen Guardian'}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className={`w-full mt-2 flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 text-xs font-medium transition-colors ${
            collapsed && !isMobile ? 'justify-center' : ''
          }`}
          title="Sign out of E-Saarthi"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {(!collapsed || isMobile) && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar (Hidden on mobile) */}
      <aside
        className={`hidden lg:flex h-screen bg-slate-900 border-r border-slate-800 text-slate-300 flex-col justify-between transition-all duration-300 ease-in-out z-30 select-none flex-shrink-0 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent(false)}
      </aside>

      {/* Mobile Slide-Over Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity"
            aria-hidden="true"
          />

          {/* Drawer container */}
          <aside className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-slate-900 border-r border-slate-800 shadow-2xl z-50 flex flex-col animate-slideIn">
            {sidebarContent(true)}
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
