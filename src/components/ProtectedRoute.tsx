import React from 'react';
import { Shield, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AuthPortal } from './AuthPortal';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthReady } = useAuth();

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-sm w-full text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/20">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-slate-100">Initializing Secure Session</h2>
            <p className="text-xs text-slate-400">
              Verifying Guardian Stack authentication &amp; encrypted vault access...
            </p>
          </div>
          <div className="flex items-center justify-center space-x-2 text-cyan-400 text-xs font-semibold">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Loading session state</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPortal />;
  }

  return <>{children}</>;
};
