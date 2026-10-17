'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import {
  LayoutDashboard,
  HeartPulse,
  Activity,
  History,
  AlertTriangle,
  Cpu,
  LogOut,
  ShieldAlert,
  User as UserIcon,
  PhoneCall
} from 'lucide-react';
import EmergencyModal from './EmergencyModal';

interface SidebarProps {
  hasHealthProfile?: boolean;
}

export default function Sidebar({ hasHealthProfile }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Health Info',
      href: '/health/new',
      icon: HeartPulse,
    },
    {
      name: 'Run Assessment',
      href: '/prediction',
      icon: Activity,
    },
    {
      name: 'History',
      href: '/history',
      icon: History,
    },
    {
      name: 'Emergency',
      href: '/emergency',
      icon: AlertTriangle,
      badge: '112',
    },
    {
      name: 'Models & Metrics',
      href: '/models',
      icon: Cpu,
    },
  ];

  return (
    <>
      <aside className="w-64 bg-[#0B2545] text-white flex flex-col h-screen border-r border-navy-800 shrink-0 select-none sticky top-0 z-20">
        {/* Brand Header */}
        <div className="p-5 border-b border-navy-800/80">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30 group-hover:bg-teal-500/30 transition-all">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-base leading-tight text-white tracking-wide">
                PreventHealth <span className="text-teal-400 font-mono text-xs">AI</span>
              </div>
              <div className="text-xs text-navy-300">Capstone Health System</div>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto">
          <div className="px-3 py-1.5 text-[11px] font-semibold tracking-wider text-navy-400 uppercase">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-teal-500 text-white shadow-sm shadow-teal-500/20 font-semibold'
                    : 'text-navy-200 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-teal-400'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-red-500/30 text-red-200 border border-red-500/40">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Emergency Quick Action Pill */}
        <div className="p-3.5 mx-3.5 mb-3 rounded-2xl bg-red-950/50 border border-red-800/60 text-xs">
          <div className="flex items-center gap-2 text-red-300 font-semibold mb-1">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
            <span>Emergency 112 Triage</span>
          </div>
          <p className="text-red-200/70 text-[11px] mb-2 leading-tight">
            Acute chest pain or breathing crisis?
          </p>
          <button
            type="button"
            onClick={() => setShowEmergencyModal(true)}
            className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs tracking-wide transition-colors cursor-pointer shadow-xs"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Dial / Copy 112</span>
          </button>
        </div>

        {/* Authenticated User & Logout */}
        <div className="p-4 border-t border-navy-800/80 bg-navy-950/60">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 text-xs font-bold shrink-0">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.full_name || 'Authenticated User'}</p>
              <p className="text-[11px] text-navy-300 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-red-200 bg-red-500/10 hover:bg-red-500/25 border border-red-500/20 hover:border-red-500/40 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <EmergencyModal
        isOpen={showEmergencyModal}
        onClose={() => setShowEmergencyModal(false)}
      />
    </>
  );
}
