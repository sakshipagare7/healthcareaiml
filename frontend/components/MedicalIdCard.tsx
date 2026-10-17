'use client';

import React, { useState, useEffect } from 'react';
import { HealthProfile, User } from '@/lib/api';
import {
  ShieldAlert,
  HeartPulse,
  Phone,
  Copy,
  Check,
  Printer,
  AlertTriangle,
  User as UserIcon,
  Activity,
  Droplets,
  Calendar,
  AlertCircle,
  QrCode,
  ExternalLink
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface MedicalIdCardProps {
  user: User | null;
  profile: HealthProfile | null;
}

export default function MedicalIdCard({ user, profile }: MedicalIdCardProps) {
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && profile) {
      setQrUrl(`${window.location.origin}/emergency/card/${profile.id}`);
    }
  }, [profile]);

  const handlePrint = () => {
    window.print();
  };

  const copyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2500);
  };

  if (!profile) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center shadow-xs">
        <ShieldAlert className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <h4 className="text-sm font-bold text-slate-800">Emergency Medical ID Unavailable</h4>
        <p className="text-xs text-slate-500 mt-1">
          Complete your health profile to generate your official Emergency Medical ID (ICE) Card.
        </p>
      </div>
    );
  }

  const bloodGroup = profile.blood_group || 'Not Specified';
  const allergies = profile.allergies || 'No Known Drug / Food Allergies';
  const iceName = profile.emergency_contact_name || 'Not Listed';
  const icePhone = profile.emergency_contact_phone || 'None';
  const iceRelation = profile.emergency_contact_relation ? `(${profile.emergency_contact_relation})` : '';

  return (
    <div className="medical-id-container">
      {/* Action Bar (hidden on print) */}
      <div className="flex items-center justify-between mb-3 print:hidden">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-red-100 text-red-700">
            <ShieldAlert className="w-4 h-4" />
          </span>
          <h3 className="text-sm font-bold text-slate-900">
            Emergency Medical ID (ICE – In Case of Emergency)
          </h3>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all"
        >
          <Printer className="w-3.5 h-3.5 text-teal-400" />
          <span>Print / Save Card</span>
        </button>
      </div>

      {/* The Printable Medical ID Card */}
      <div className="medical-id-card relative bg-gradient-to-br from-slate-900 via-slate-800 to-[#0B2545] text-white rounded-2xl p-6 shadow-md border border-slate-700 overflow-hidden print:border-2 print:border-black print:text-black print:bg-white print:shadow-none">
        {/* Card Header Strip */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4 mb-4 print:border-b-2 print:border-black">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white font-black text-lg shadow-sm print:border print:border-black">
              +
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-red-400 print:text-red-700">
                Medical Alert & Emergency ID
              </div>
              <h2 className="text-lg font-extrabold tracking-tight text-white print:text-black">
                {user?.full_name || 'Cardholder'}
              </h2>
            </div>
          </div>

          {/* Paramedic QR Code & Blood Group */}
          <div className="flex items-center gap-3">
            {qrUrl && (
              <div className="bg-white p-1 rounded-lg shadow-sm print:border print:border-black shrink-0 text-center">
                <QRCodeSVG
                  value={qrUrl}
                  size={58}
                  level="M"
                  includeMargin={false}
                />
                <span className="text-[8px] font-black text-slate-900 block leading-tight mt-0.5 print:text-black">
                  PARAMEDIC
                </span>
              </div>
            )}

            <div className="text-right">
              <div className="text-[9px] uppercase tracking-wider text-slate-400 print:text-slate-700 font-semibold">
                Blood Group
              </div>
              <div className="inline-block mt-0.5 px-3 py-1 bg-red-600 text-white font-black text-base rounded-lg shadow-xs print:border print:border-black">
                {bloodGroup}
              </div>
              {profile && (
                <a
                  href={`/emergency/card/${profile.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[9px] text-teal-300 hover:text-teal-200 font-semibold flex items-center justify-end gap-0.5 mt-1 print:hidden"
                  title="Open Paramedic Emergency View"
                >
                  <span>Public View</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Card Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Left Column: Personal & Emergency Contact */}
          <div className="space-y-3">
            <div className="bg-white/5 rounded-xl p-3 border border-white/10 print:border-slate-300 print:bg-slate-50">
              <div className="text-[10px] text-teal-300 font-bold uppercase tracking-wider mb-1 print:text-teal-800">
                Patient Demographics
              </div>
              <div className="grid grid-cols-3 gap-2 text-slate-200 print:text-slate-900">
                <div>
                  <span className="text-[10px] text-slate-400 block print:text-slate-600">Age</span>
                  <span className="font-semibold">{profile.age} yrs</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block print:text-slate-600">Sex</span>
                  <span className="font-semibold capitalize">{profile.sex}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block print:text-slate-600">BMI</span>
                  <span className="font-semibold">{profile.bmi}</span>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-red-500/10 rounded-xl p-3 border border-red-500/30 print:border-red-400 print:bg-red-50">
              <div className="text-[10px] text-red-300 font-bold uppercase tracking-wider mb-1 print:text-red-700 flex items-center justify-between">
                <span>In Case of Emergency (ICE)</span>
                <span className="font-semibold">{iceRelation}</span>
              </div>
              <div className="font-bold text-white print:text-black text-sm">{iceName}</div>
              <div className="mt-1 flex items-center justify-between">
                <span className="font-mono text-xs text-red-200 print:text-red-900 font-semibold">
                  {icePhone}
                </span>
                {icePhone !== 'None' && (
                  <div className="flex items-center gap-1 print:hidden">
                    <a
                      href={`tel:${icePhone.replace(/\s+/g, '')}`}
                      className="p-1 rounded-md bg-red-600 hover:bg-red-700 text-white transition-all"
                      title="Call Contact"
                    >
                      <Phone className="w-3 h-3" />
                    </a>
                    <button
                      onClick={() => copyPhone(icePhone)}
                      className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-white transition-all"
                      title="Copy phone"
                    >
                      {copiedPhone ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Allergies & Clinical Vitals */}
          <div className="space-y-3">
            {/* Allergies Box */}
            <div className="bg-amber-500/10 rounded-xl p-3 border border-amber-500/30 print:border-amber-400 print:bg-amber-50">
              <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider mb-1 print:text-amber-800 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-amber-400 print:text-amber-700" />
                <span>Allergies & Medical Alerts</span>
              </div>
              <p className="font-medium text-slate-100 print:text-slate-900 leading-snug">
                {allergies}
              </p>
            </div>

            {/* Baseline Vitals */}
            <div className="bg-white/5 rounded-xl p-3 border border-white/10 print:border-slate-300 print:bg-slate-50">
              <div className="text-[10px] text-teal-300 font-bold uppercase tracking-wider mb-1 print:text-teal-800">
                Baseline Vitals Recorded
              </div>
              <div className="grid grid-cols-3 gap-2 text-slate-200 print:text-slate-900">
                <div>
                  <span className="text-[10px] text-slate-400 block print:text-slate-600">Blood Pressure</span>
                  <span className="font-semibold font-mono">
                    {profile.systolic_bp}/{profile.diastolic_bp}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block print:text-slate-600">Heart Rate</span>
                  <span className="font-semibold font-mono">{profile.heart_rate} bpm</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block print:text-slate-600">Fasting Glucose</span>
                  <span className="font-semibold font-mono">
                    {profile.blood_glucose ? `${profile.blood_glucose} mg/dL` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-4 pt-3 border-t border-white/10 print:border-t print:border-black flex items-center justify-between text-[10px] text-slate-400 print:text-slate-700">
          <span>First Responders: In an acute crisis, dial National Emergency Helpline 112.</span>
          <span>Last Vitals Update: {profile.measured_on}</span>
        </div>
      </div>
    </div>
  );
}
