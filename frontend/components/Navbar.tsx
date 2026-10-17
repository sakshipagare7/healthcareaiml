'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { ShieldAlert, LogOut, User as UserIcon } from 'lucide-react';
import EmergencyModal from './EmergencyModal';

export default function Navbar({ title, subtitle }: { title?: string; subtitle?: string }) {
  const { user, logout } = useAuth();
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs shrink-0">
        <div>
          <h1 className="text-lg font-bold text-[#0B2545] leading-tight">
            {title || 'Preventive Healthcare System'}
          </h1>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-4">
          {/* Emergency Fast Access */}
          <button
            onClick={() => setShowEmergencyModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-bold transition-all shadow-xs cursor-pointer"
            title="Open 112 Emergency Protocol"
          >
            <ShieldAlert className="w-4 h-4 text-red-600 animate-pulse" />
            <span>Emergency 112</span>
          </button>

          {/* User Badge & Direct Logout Button */}
          {user && (
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="flex items-center gap-2 bg-slate-100/80 px-3 py-1 rounded-lg border border-slate-200/80">
                <span className="inline-block w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                <span className="text-xs font-bold text-slate-700">{user.full_name}</span>
              </div>

              {/* Prominent Header Logout Button */}
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-red-700 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-all cursor-pointer shadow-2xs"
                title="Log out of account"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Emergency Dial Modal */}
      <EmergencyModal
        isOpen={showEmergencyModal}
        onClose={() => setShowEmergencyModal(false)}
      />
    </>
  );
}
