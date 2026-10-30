import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SafetyProvider } from './context/SafetyContext';
import { RouteProvider } from './context/RouteContext';
import AppLayout from './components/layout/AppLayout';

import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import RoutePlannerPage from './pages/RoutePlannerPage';
import LiveNavigationPage from './pages/LiveNavigationPage';
import EmergencyServicesPage from './pages/EmergencyServicesPage';
import SOSPage from './pages/SOSPage';
import EmergencyContactsPage from './pages/EmergencyContactsPage';
import CrimeRiskPage from './pages/CrimeRiskPage';
import RouteHistoryPage from './pages/RouteHistoryPage';
import ProfilePage from './pages/ProfilePage';

const MainAppContent = () => {
  const { isAuthenticated } = useAuth();
  const [currentRoute, setCurrentRoute] = useState('dashboard');

  if (!isAuthenticated) {
    return <AuthPage onAuthSuccess={() => setCurrentRoute('dashboard')} />;
  }

  const renderCurrentPage = () => {
    switch (currentRoute) {
      case 'dashboard':
        return <DashboardPage onRouteChange={setCurrentRoute} />;
      case 'routes':
        return <RoutePlannerPage onRouteChange={setCurrentRoute} />;
      case 'navigate':
        return <LiveNavigationPage onRouteChange={setCurrentRoute} />;
      case 'emergency-services':
        return <EmergencyServicesPage onRouteChange={setCurrentRoute} />;
      case 'sos':
        return <SOSPage />;
      case 'contacts':
        return <EmergencyContactsPage />;
      case 'crime-risk':
        return <CrimeRiskPage />;
      case 'history':
        return <RouteHistoryPage onRouteChange={setCurrentRoute} />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <DashboardPage onRouteChange={setCurrentRoute} />;
    }
  };

  return (
    <AppLayout currentRoute={currentRoute} onRouteChange={setCurrentRoute}>
      {renderCurrentPage()}
    </AppLayout>
  );
};

export function App() {
  return (
    <AuthProvider>
      <SafetyProvider>
        <RouteProvider>
          <MainAppContent />
        </RouteProvider>
      </SafetyProvider>
    </AuthProvider>
  );
}

export default App;
