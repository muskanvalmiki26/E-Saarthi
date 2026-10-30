import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import apiService from '../api/apiService';
import { MOCK_USER, MOCK_EMERGENCY_CONTACTS } from '../api/mockData';

const SafetyContext = createContext(null);

export const SafetyProvider = ({ children }) => {
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [sosAlertData, setSosAlertData] = useState(null);
  const [isLocationSharingActive, setIsLocationSharingActive] = useState(true);
  const [currentLocation, setCurrentLocation] = useState(MOCK_USER.currentLocation);
  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation((prev) => ({
          ...prev,
          name: "Current Location",
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString(),
        }));
      },
      (error) => {
        console.warn("Location access failed:", error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, []);
  const [contacts, setContacts] = useState(MOCK_EMERGENCY_CONTACTS);

  // Live navigation hazards & deviations
  const [activeHazards, setActiveHazards] = useState([
    {
      id: "hzd_1",
      type: "lighting",
      level: "warning",
      title: "Poorly lit stretch ahead (500m)",
      description: "Street lights reported inactive on Janpath service lane. Stay on the central carriageway."
    },
    {
      id: "hzd_2",
      type: "crime",
      level: "caution",
      title: "Moderate crime risk pocket detected",
      description: "Underpass sector with low footfall after 8 PM. Police PCR van stationed 300m away."
    }
  ]);

  const [deviationStatus, setDeviationStatus] = useState({
    isDeviated: false,
    message: "",
    rerouting: false
  });

  // Audio Siren generator using Web Audio API
  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);

  const startSirenSound = () => {
    try {
      if (!audioCtxRef.current) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtxRef.current = new AudioContext();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      gain.gain.value = 0.15; // Pleasant audible volume

      // Frequency modulation for siren effect (700Hz to 1100Hz)
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(750, now);
      osc.frequency.linearRampToValueAtTime(1100, now + 0.6);
      osc.frequency.linearRampToValueAtTime(750, now + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      oscRef.current = osc;
    } catch (e) {
      console.warn('Audio siren could not start automatically:', e);
    }
  };

  const stopSirenSound = () => {
    if (oscRef.current) {
      try {
        oscRef.current.stop();
        oscRef.current.disconnect();
      } catch (e) {}
      oscRef.current = null;
    }
  };

  const triggerSOS = async () => {
    setIsSOSActive(true);
    startSirenSound();
    try {
      const response = await apiService.triggerSOS({
        lat: currentLocation.lat,
        lng: currentLocation.lng,
        timestamp: new Date().toISOString()
      });
      setSosAlertData(response);
      return response;
    } catch (err) {
      console.error('Failed to trigger SOS:', err);
    }
  };

  const cancelSOS = () => {
    setIsSOSActive(false);
    setSosAlertData(null);
    stopSirenSound();
  };

  const toggleLocationSharing = () => {
    setIsLocationSharingActive(prev => !prev);
  };

  const simulateDeviation = () => {
    setDeviationStatus({
      isDeviated: true,
      message: "⚠️ Off-Route Detected! Diverged 180m from Safest Recommended Corridor.",
      rerouting: true
    });

    // Auto resolve reroute back to safest corridor after 4 seconds
    setTimeout(() => {
      setDeviationStatus({
        isDeviated: false,
        message: "✅ Safest alternate route recalculation complete. Merged back to Janpath Arterial.",
        rerouting: false
      });
    }, 4500);
  };

  const resetDeviation = () => {
    setDeviationStatus({
      isDeviated: false,
      message: "",
      rerouting: false
    });
  };

  return (
    <SafetyContext.Provider
      value={{
        isSOSActive,
        sosAlertData,
        triggerSOS,
        cancelSOS,
        isLocationSharingActive,
        toggleLocationSharing,
        currentLocation,
        setCurrentLocation,
        contacts,
        setContacts,
        activeHazards,
        deviationStatus,
        simulateDeviation,
        resetDeviation
      }}
    >
      {children}
    </SafetyContext.Provider>
  );
};

export const useSafety = () => {
  const context = useContext(SafetyContext);
  if (!context) {
    throw new Error('useSafety must be used within a SafetyProvider');
  }
  return context;
};

export default SafetyContext;
