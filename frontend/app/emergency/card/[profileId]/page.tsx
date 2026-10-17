'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api, PublicEmergencyCard } from '@/lib/api';
import {
  ShieldAlert,
  Phone,
  HeartPulse,
  Activity,
  Droplets,
  AlertTriangle,
  User,
  PhoneCall,
  Clock,
  Printer,
  ChevronRight,
  Hospital
} from 'lucide-react';
import Link from 'next/link';

export default function PublicEmergencyCardPage() {
  const params = useParams();
  const profileId = Number(params?.profileId);

  const [card, setCard] = useState<PublicEmergencyCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCard() {
      if (!profileId) return;
      try {
        setLoading(true);
        const data = await api.getPublicEmergencyCard(profileId);
        setCard(data);
      } catch (err: any) {
        console.error('Failed to load emergency card:', err);
        setError(err.message || 'Emergency record not found or inaccessible.');
      } finally {
        setLoading(false);
      }
    }
    loadCard();
  }, [profileId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-bold tracking-wide uppercase text-red-400">Loading Emergency Medical ID...</p>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-xl font-bold mb-2">Emergency Record Not Found</h1>
        <p className="text-sm text-slate-400 max-w-md mb-6">
          The requested emergency medical identifier is unavailable or has been removed.
        </p>
        <a
          href="tel:112"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-lg"
        >
          <PhoneCall className="w-4 h-4" />
          <span>Call Emergency 112</span>
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 max-w-2xl mx-auto">
      {/* Header Banner */}
      <div className="space-y-4">
        <div className="bg-red-700 text-white p-4 rounded-2xl shadow-lg border border-red-500 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white text-red-700 flex items-center justify-center font-black text-2xl shadow-inner">
              +
            </div>
            <div>
              <div className="text-[10px] uppercase font-black tracking-widest text-red-200">
                Paramedic & First Responder Alert
              </div>
              <h1 className="text-lg font-black tracking-tight">
                Emergency Medical ID
              </h1>
            </div>
          </div>
          <a
            href="tel:112"
            className="px-3.5 py-2 rounded-xl bg-white text-red-700 hover:bg-red-50 font-black text-xs shadow-xs flex items-center gap-1.5 transition-all"
          >
            <PhoneCall className="w-3.5 h-3.5 text-red-600" />
            <span>112</span>
          </a>
        </div>

        {/* Patient Demographics & Blood Group */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                Cardholder
              </span>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                {card.full_name}
              </h2>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-3 font-semibold">
                <span>{card.age} Years Old</span>
                <span>&bull;</span>
                <span className="capitalize">{card.sex}</span>
                <span>&bull;</span>
                <span>BMI: {card.bmi}</span>
              </div>
            </div>

            {/* Blood Group Badge */}
            <div className="text-center shrink-0">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-red-400 block mb-0.5">
                Blood Group
              </span>
              <div className="px-4 py-2 bg-red-600 text-white font-black text-2xl rounded-xl shadow-md border border-red-500">
                {card.blood_group}
              </div>
            </div>
          </div>

          {/* Critical Allergies Box */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/40 mb-4">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Known Drug & Food Allergies</span>
            </div>
            <p className="text-sm font-extrabold text-white pl-6">
              {card.allergies}
            </p>
          </div>

          {/* Emergency In Case of Emergency (ICE) Contact */}
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/40">
            <div className="flex items-center justify-between text-xs text-red-300 font-bold uppercase tracking-wider mb-1.5">
              <span>In Case of Emergency (ICE) Next-of-Kin</span>
              {card.emergency_contact_relation && (
                <span className="text-red-400 capitalize">({card.emergency_contact_relation})</span>
              )}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-base font-bold text-white">{card.emergency_contact_name}</div>
                <div className="text-sm font-mono text-red-200 font-semibold">{card.emergency_contact_phone}</div>
              </div>

              {card.emergency_contact_phone && card.emergency_contact_phone !== 'None' && (
                <a
                  href={`tel:${card.emergency_contact_phone.replace(/\s+/g, '')}`}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md transition-all"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Emergency Contact</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Baseline Vitals Record */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Last Recorded Baseline Vitals
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
              <span className="text-[10px] text-slate-400 block mb-1">Blood Pressure</span>
              <span className="font-extrabold text-base text-white font-mono">
                {card.systolic_bp}/{card.diastolic_bp}
              </span>
              <span className="text-[10px] text-slate-500 block">mmHg</span>
            </div>

            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
              <span className="text-[10px] text-slate-400 block mb-1">Heart Rate</span>
              <span className="font-extrabold text-base text-white font-mono">{card.heart_rate}</span>
              <span className="text-[10px] text-slate-500 block">bpm</span>
            </div>

            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
              <span className="text-[10px] text-slate-400 block mb-1">Fasting Glucose</span>
              <span className="font-extrabold text-base text-white font-mono">
                {card.blood_glucose ? card.blood_glucose : '—'}
              </span>
              <span className="text-[10px] text-slate-500 block">mg/dL</span>
            </div>

            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
              <span className="text-[10px] text-slate-400 block mb-1">Measured Date</span>
              <span className="font-bold text-xs text-white block mt-1">{card.measured_on}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 text-center">
        <span>Verified by AI Preventive Healthcare System &bull; Confidential Clinical Emergency Record</span>
        <span className="text-slate-400 font-semibold">National Emergency Helpline: 112</span>
      </div>
    </div>
  );
}
