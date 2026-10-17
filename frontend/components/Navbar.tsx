'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { ShieldAlert, LogOut, User as UserIcon, Menu } from 'lucide-react';
import EmergencyModal from './EmergencyModal';

interface NavbarProps {
  title?: string;
  subtitle?: string;
  onOpenMobileMenu?: () => void;
}

export default function Navbar({ title, subtitle, onOpenMobileMenu }: NavbarProps) {
  const { user, logout } = useAuth();
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          {/* Hamburger Menu for Mobile */}
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="p-2 -ml-1 text-slate-700 hover:text-[#0B2545] hover:bg-slate-100 rounded-xl md:hidden shrink-0 transition-colors cursor-pointer"
            aria-label="Open Navigation Menu"
            title="Open Menu"
          >
            <Menu className="w-5 h-5 text-[#0B2545]" />
          </button>

          <div className="min-w-0">
            <h1 className="text-sm sm:text-base md:text-lg font-bold text-[#0B2545] leading-tight truncate max-w-[170px] xs:max-w-[240px] sm:max-w-none">
              {title || 'Preventive Healthcare'}
            </h1>
            {subtitle && (
              <p className="text-[10px] sm:text-xs text-slate-500 truncate hidden xs:block">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Emergency Fast Access */}
          <button
            onClick={() => setShowEmergencyModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
            title="Open 112 Emergency Protocol"
          >
            <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 animate-pulse shrink-0" />
            <span className="hidden sm:inline">Emergency 112</span>
            <span className="sm:hidden font-extrabold text-[11px]">112</span>
          </button>

          {/* User Badge & Direct Logout Button */}
          {user && (
            <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-slate-200">
              <Link
                href="/settings"
                className="hidden sm:flex items-center gap-2 bg-slate-100/80 hover:bg-slate-200/80 px-2.5 py-1 rounded-lg border border-slate-200/80 transition-colors cursor-pointer group"
                title="Account Settings"
              >
                <span className="inline-block w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                <span className="text-xs font-bold text-slate-700 truncate max-w-[120px] group-hover:text-teal-700">{user.full_name}</span>
              </Link>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="flex items-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-red-700 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-all cursor-pointer shadow-2xs"
                title="Log out of account"
              >
                <LogOut className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Log Out</span>
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
