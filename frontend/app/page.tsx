'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import {
  HeartPulse,
  Activity,
  ShieldAlert,
  Cpu,
  ArrowRight,
  CheckCircle2,
  Lock,
  Database,
  FileSpreadsheet
} from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B2545] text-teal-400 flex items-center justify-center font-bold">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-[#0B2545] text-base tracking-tight">PreventHealth</span>
              <span className="text-teal-600 font-mono text-xs font-bold ml-1">AI</span>
              <span className="hidden sm:inline-block ml-3 px-2 py-0.5 rounded-full bg-slate-100 text-[11px] font-medium text-slate-600 border border-slate-200">
                Capstone Project
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B2545] hover:bg-navy-800 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <span>Dashboard ({user.full_name})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-[#0B2545] hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-6 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-medium mb-6">
          <Cpu className="w-3.5 h-3.5 text-teal-600" />
          <span>Locally Runnable Computer Engineering Capstone</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0B2545] tracking-tight leading-tight mb-6">
          AI-Powered Preventive Healthcare & <br />
          <span className="text-teal-600">Emergency Response System</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed">
          A genuine, privacy-first personal health platform powered by Scikit-Learn Random Forest pipelines,
          clinical vital triage, and rule-based preventive recommendations. No demo data. No fabricated risk scores.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#0B2545] hover:bg-navy-800 text-white font-semibold text-sm shadow-md transition-all hover:scale-[1.02]"
          >
            <span>Create Health Account</span>
            <ArrowRight className="w-4 h-4 text-teal-400" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-semibold text-sm shadow-xs transition-all"
          >
            <span>Sign In to Your Dashboard</span>
          </Link>
          <Link
            href="/emergency"
            className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold text-sm shadow-xs transition-all"
          >
            <ShieldAlert className="w-4 h-4 text-red-600" />
            <span>Emergency 112 Protocol</span>
          </Link>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="py-12 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-bold text-[#0B2545]">Built for Real-World Capstone Rigor</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Designed according to strict academic and clinical software engineering standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center mb-4">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#0B2545] text-base mb-2">Real Scikit-Learn ML</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Trained on holdout folds of Pima Diabetes, UCI Heart Disease, and UCI CKD benchmark datasets. Zero data leakage.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-navy-100 text-[#0B2545] flex items-center justify-center mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#0B2545] text-base mb-2">Isolated User Data</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                HttpOnly JWT cookies and bcrypt hashing. Every database query strictly filters by authenticated user_id.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center mb-4">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#0B2545] text-base mb-2">Emergency Response</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Immediate red-flag symptom triage (FAST stroke, chest crisis) and critical vital warnings. Direct 112 calling protocol.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-slate-100 border-t border-slate-200 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-6 space-y-2">
          <p className="font-medium text-slate-700">
            AI-Powered Preventive Healthcare and Emergency Response System — Final Year Capstone Project
          </p>
          <p className="text-[11px] text-slate-500">
            Educational prototype only. Machine learning estimates do not constitute clinical diagnoses. Call 112 in medical emergencies.
          </p>
        </div>
      </footer>
    </div>
  );
}
