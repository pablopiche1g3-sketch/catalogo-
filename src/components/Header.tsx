/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Settings, Eye, Palette } from 'lucide-react';

interface HeaderProps {
  isAdminMode: boolean;
  onToggleAdminMode: () => void;
  productCount: number;
}

export default function Header({ isAdminMode, onToggleAdminMode, productCount }: HeaderProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="h-16 bg-slate-900 flex items-center justify-between px-6 sm:px-8 shadow-md flex-shrink-0 sticky top-0 z-40">
      {/* Brand logo & name with Geometric Balance styling */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-tr from-red-500 via-green-500 to-blue-500 rounded-lg flex items-center justify-center font-bold text-white text-lg sm:text-xl shadow-sm">
          T
        </div>
        <h1 className="text-white font-bold tracking-tight text-base sm:text-xl">
          PINTURAS <span className="text-blue-400">TECNICOLOR</span>
        </h1>
      </div>

      {/* Connection state, Agent & Admin triggers */}
      <div className="flex items-center gap-3 sm:gap-6">
        {/* Offline Support Status */}
        <div className="hidden md:flex items-center gap-2 bg-slate-800 px-3.5 py-1.5 rounded-full border border-slate-700/50">
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
          <span className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">
            {isOnline ? 'Base de Datos Local: OK' : 'MODO OFFLINE ACTIVO'}
          </span>
        </div>


        {/* Action button */}
        <button
          onClick={onToggleAdminMode}
          className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md active:scale-95 transition-all cursor-pointer select-none ${
            isAdminMode 
              ? 'bg-blue-600 text-white hover:bg-blue-500' 
              : 'bg-slate-800 text-slate-200 hover:bg-slate-750 border border-slate-700'
          }`}
        >
          {isAdminMode ? (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span>Catálogo</span>
            </>
          ) : (
            <>
              <Settings className="w-3.5 h-3.5" />
              <span>Gestionar</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
