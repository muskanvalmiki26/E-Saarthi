import React, { useState, useEffect, useMemo } from 'react';
import { useRoute } from '../context/RouteContext';
import { useSafety } from '../context/SafetyContext';
import NavigationHUD from '../components/navigation/NavigationHUD';
import HazardAlertBanner from '../components/navigation/HazardAlertBanner';
import DeviationAlert from '../components/navigation/DeviationAlert';
import MapView from '../components/map/MapView';
import { ShieldAlert, ArrowLeft, Play, Pause, RotateCcw } from 'lucide-react';

const DEFAULT_COORDINATES = [
[28.6315, 77.2167],
[28.6250, 77.2185],
[28.6120, 77.2110],
[28.5950, 77.2090],
[28.5800, 77.2150],
[28.5670, 77.2080],
[28.5450, 77.2060],
[28.5280, 77.2050]
];

const DEFAULT_STEPS = [
{ id: 1, instruction: 'Head towards the next road', distance: '400 m', turn: 'straight' },
{ id: 2, instruction: 'Continue straight ahead', distance: '1.2 km', turn: 'straight' },
{ id: 3, instruction: 'Follow the selected route', distance: '3.5 km', turn: 'right' },
{ id: 4, instruction: 'Continue towards your destination', distance: '2.1 km', turn: 'straight' },
{ id: 5, instruction: 'Arrive at your destination', distance: '200 m', turn: 'destination' }
];

const isValidCoordinate = (point) =>
Array.isArray(point) &&
point.length >= 2 &&
Number.isFinite(Number(point[0])) &&
Number.isFinite(Number(point[1])) &&
Number(point[0]) >= -90 &&
Number(point[0]) <= 90 &&
Number(point[1]) >= -180 &&
Number(point[1]) <= 180;

export const LiveNavigationPage = ({ onRouteChange = () => {} }) => {
const { selectedRoute } = useRoute();

const {
activeHazards = [],
isSOSActive = false,
triggerSOS = () => {},
cancelSOS = () => {}
} = useSafety();

// Use route coordinates when valid; otherwise use demo coordinates.
const coordinates = useMemo(() => {
const routeCoordinates = selectedRoute?.coordinates;

if (
  Array.isArray(routeCoordinates) &&
  routeCoordinates.length > 0 &&
  routeCoordinates.every(isValidCoordinate)
) {
  return routeCoordinates.map(([lat, lng]) => [
    Number(lat),
    Number(lng)
  ]);
}

return DEFAULT_COORDINATES;

}, [selectedRoute]);

const steps = useMemo(() => {
const routeSteps = selectedRoute?.steps;

if (Array.isArray(routeSteps) && routeSteps.length > 0) {
  return routeSteps;
}

return DEFAULT_STEPS;

}, [selectedRoute]);

const [currentStepIndex, setCurrentStepIndex] = useState(0);
const [isPlaying, setIsPlaying] = useState(true);

// Reset simulation when the selected route changes.
useEffect(() => {
setCurrentStepIndex(0);
}, [selectedRoute?.id]);

// Keep the simulation index within the current coordinates.
useEffect(() => {
setCurrentStepIndex((previous) =>
Math.min(previous, Math.max(0, coordinates.length - 1))
);
}, [coordinates.length]);

// Demo simulation: move the marker along the route.
useEffect(() => {
if (!isPlaying || coordinates.length <= 1) {
return undefined;
}

const interval = setInterval(() => {
  setCurrentStepIndex((previous) =>
    (previous + 1) % coordinates.length
  );
}, 3500);

return () => clearInterval(interval);

}, [isPlaying, coordinates.length]);

const safeStepIndex = Math.min(
currentStepIndex,
coordinates.length - 1
);

const vehiclePosition = coordinates[safeStepIndex] ?? coordinates[0];
const activeStep =
steps[Math.min(safeStepIndex, steps.length - 1)] ??
DEFAULT_STEPS[0];

const totalDistance = Number(selectedRoute?.distanceKm);
const totalMinutes = Number(selectedRoute?.etaMinutes);

const distance = Number.isFinite(totalDistance) && totalDistance > 0
? totalDistance
: 14.2;

const duration = Number.isFinite(totalMinutes) && totalMinutes > 0
? totalMinutes
: 32;

const progressRatio = coordinates.length > 1
? safeStepIndex / (coordinates.length - 1)
: 0;

const remainingKm = Math.max(
0,
distance * (1 - progressRatio)
).toFixed(1);

const remainingMins = Math.max(
0,
Math.round(duration * (1 - progressRatio))
);

const progressPercent = Math.round(progressRatio * 100);

return (
<div className="space-y-4 relative">
{/* Top Controls Bar */}
<div className="flex items-center justify-between">
<button
onClick={() => onRouteChange('routes')}
className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm"
>
<ArrowLeft className="w-4 h-4" />
<span>Exit Navigation</span>
</button>

    {/* Demo Simulation Controls */}
    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
      <span className="text-[11px] font-bold text-slate-400">
        Simulation:
      </span>

      <button
        onClick={() => setIsPlaying((playing) => !playing)}
        className="p-1 rounded-lg text-blue-600 hover:bg-blue-50 font-bold text-xs flex items-center gap-1"
      >
        {isPlaying
          ? <Pause className="w-3.5 h-3.5" />
          : <Play className="w-3.5 h-3.5" />}
        <span>{isPlaying ? 'Pause' : 'Play'}</span>
      </button>

      <button
        onClick={() => {
          setCurrentStepIndex(0);
          setIsPlaying(false);
        }}
        className="p-1 rounded-lg text-slate-500 hover:bg-slate-100"
        title="Reset to origin"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>
    </div>
  </div>

  {/* Navigation HUD */}
  <NavigationHUD
    currentStep={activeStep}
    remainingDistanceKm={remainingKm}
    remainingMinutes={remainingMins}
    speedKmh={isPlaying ? 38 : 0}
    progressPercent={progressPercent}
    onExitNavigation={() => onRouteChange('routes')}
  />

  {/* Hazard Alerts */}
  <HazardAlertBanner hazards={activeHazards} />

  {/* Route Deviation Alerts */}
  <DeviationAlert />

  {/* Map and Vehicle Marker */}
  <div className="relative">
    <MapView
      routes={selectedRoute ? [selectedRoute] : []}
      selectedRouteId={selectedRoute?.id ?? null}
      showAllRoutes={false}
      vehiclePosition={vehiclePosition}
      height="420px"
    />

    {/* Emergency SOS Button */}
    <button
      onClick={() => {
        if (isSOSActive) {
          cancelSOS();
        } else {
          triggerSOS();
        }
      }}
      className={`absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-[1000] p-3 sm:p-4 rounded-2xl shadow-2xl flex items-center gap-2 font-black text-xs sm:text-sm uppercase tracking-wider text-white transition-all transform hover:scale-105 active:scale-95 ${
        isSOSActive
          ? 'bg-red-600 ring-4 ring-red-400 animate-pulse'
          : 'bg-red-600 hover:bg-red-700 shadow-red-600/40'
      }`}
    >
      <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6" />
      <span>{isSOSActive ? 'Disarm SOS' : 'Instant SOS'}</span>
    </button>
  </div>
</div>

);
};

export default LiveNavigationPage;