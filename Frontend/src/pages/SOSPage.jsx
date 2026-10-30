import React from 'react';
import SOSModal from '../components/sos/SOSModal';
import { ShieldAlert, AlertTriangle, ShieldCheck } from 'lucide-react';

export const SOSPage = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2">
          <ShieldAlert className="w-8 h-8 text-red-600 animate-pulse" />
          <span>Emergency SOS Dispatch Center</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-lg mx-auto">
          Immediate telemetry broadcast to Police Central Control (112), Women Helpline (1091), and verified emergency guardians.
        </p>
      </div>

      <SOSModal />
    </div>
  );
};

export default SOSPage;
