'use client';

import React, { useState } from 'react';
import {
  PhoneCall,
  Copy,
  Check,
  X,
  ShieldAlert,
  Smartphone,
  Laptop,
  AlertTriangle
} from 'lucide-react';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  identifiedSymptoms?: string[];
}

export default function EmergencyModal({
  isOpen,
  onClose,
  title = "Emergency Medical Response (112)",
  identifiedSymptoms = []
}: EmergencyModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyNumber = (num: string = "112") => {
    navigator.clipboard.writeText(num);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-red-300 shadow-2xl overflow-hidden">
        {/* Header Banner */}
        <div className="p-6 bg-red-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-wide uppercase">
                {title}
              </h3>
              <p className="text-xs text-red-100">National Emergency Support Protocol</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Why Edge / Browser did not dial notice */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs text-amber-900 leading-relaxed">
            <Laptop className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-950 mb-0.5">Desktop Browser Notice:</p>
              <p>
                Browsers on a PC/laptop (like Microsoft Edge or Chrome) cannot place phone calls by themselves.
                Please dial <strong>112</strong> directly on your mobile phone or landline.
              </p>
            </div>
          </div>

          {/* Big Number Display & One-Click Copy */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              India National Emergency Number
            </span>
            <div className="text-5xl font-black text-red-600 tracking-tight font-mono">
              112
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => handleCopyNumber("112")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B2545] hover:bg-navy-800 text-white font-semibold text-xs shadow-xs transition-all"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Copied 112 to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-teal-400" />
                    <span>Copy Emergency Number 112</span>
                  </>
                )}
              </button>

              <a
                href="tel:112"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-colors"
                title="If you have Microsoft Phone Link or a paired smartphone"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Launch Dial via Phone Link</span>
              </a>
            </div>
          </div>

          {/* Additional Emergency Helplines */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-slate-500 block text-[11px]">Ambulance / Medical</span>
                <span className="font-bold text-slate-900 text-sm">108 / 102</span>
              </div>
              <button
                onClick={() => handleCopyNumber("108")}
                className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200/60"
                title="Copy 108"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-slate-500 block text-[11px]">Police Helpline</span>
                <span className="font-bold text-slate-900 text-sm">100 / 112</span>
              </div>
              <button
                onClick={() => handleCopyNumber("100")}
                className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200/60"
                title="Copy 100"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Action guidance */}
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-xs text-red-900 space-y-1">
            <p className="font-bold">Immediate Safety Guidelines:</p>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-red-800">
              <li>Do NOT attempt to drive a vehicle yourself.</li>
              <li>Sit comfortably in a supported position while waiting for help.</li>
              <li>Keep doors unlocked so emergency responders can access your location.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors"
          >
            Close Dialog
          </button>
        </div>
      </div>
    </div>
  );
}
