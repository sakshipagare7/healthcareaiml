'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import {
  AlertTriangle,
  ShieldAlert,
  PhoneCall,
  Activity,
  HeartPulse,
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  FileText
} from 'lucide-react';

export default function MedicalDisclaimerPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#0B2545] text-teal-400 flex items-center justify-center font-bold shadow-xs">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-[#0B2545] text-base tracking-tight">PreventHealth</span>
              <span className="text-teal-600 font-mono text-xs font-bold ml-1">AI</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0B2545] text-white text-xs font-semibold hover:bg-navy-800 transition-colors"
              >
                <span>Dashboard</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        {/* Emergency Alert Banner */}
        <div className="mb-8 p-5 sm:p-6 rounded-3xl bg-red-600 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wide">
                Immediate Emergency Warning
              </h2>
              <p className="text-xs text-red-100 mt-0.5 leading-relaxed">
                If you are experiencing acute chest pain, stroke symptoms (face drooping, arm weakness), or severe breathing crisis, <strong>do not wait for website analysis</strong>.
              </p>
            </div>
          </div>
          <a
            href="tel:112"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-red-700 font-extrabold text-xs shadow-sm hover:bg-red-50 transition-colors shrink-0"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Call 112 Immediately</span>
          </a>
        </div>

        {/* Title */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold mb-3">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Academic & Clinical Boundaries</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0B2545] tracking-tight">
            Medical Disclaimer
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Important regulatory and clinical guidance for all users of the PreventHealth AI platform
          </p>
        </div>

        {/* Disclaimer Content Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-10 space-y-8 text-slate-700 text-xs sm:text-sm leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-[#0B2545] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              1. Not a Substitute for Professional Medical Advice or Diagnosis
            </h2>
            <p>
              The content, risk scores, probability percentages, lifestyle simulations, and preventive recommendations provided by PreventHealth AI are for <strong>informational, educational, and screening purposes only</strong>.
            </p>
            <p>
              This application does not provide formal medical diagnoses, clinical prognoses, prescriptions, or individualized medical treatment plans. Always seek the advice of your physician, cardiologist, endocrinologist, nephrologist, or other qualified healthcare provider regarding any medical condition or health objectives.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <h2 className="text-base sm:text-lg font-bold text-[#0B2545] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-500"></span>
              2. Nature of Machine Learning Predictions
            </h2>
            <p>
              The disease risk estimates displayed on this platform are computed using <strong>Scikit-Learn Random Forest classifiers</strong> trained on historical benchmark datasets (Pima Indians Diabetes, UCI Heart Disease, and UCI Chronic Kidney Disease).
            </p>
            <p>
              While these models achieve strong benchmark validation (82.5% Diabetes, 86.8% Cardiovascular, 98.8% CKD), machine learning models are statistical estimators and:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600 text-xs sm:text-sm">
              <li>May yield false positive or false negative results.</li>
              <li>Cannot account for uncollected patient variables, unique genetics, active pharmaceutical regimens, or acute comorbidities.</li>
              <li>Do not constitute laboratory-grade diagnostic findings (e.g. coronary angiography, renal biopsy, oral glucose tolerance test).</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <h2 className="text-base sm:text-lg font-bold text-[#0B2545] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              3. Clinical Reference Ranges & Vitals Triage
            </h2>
            <p>
              All vital sign thresholds (Blood Pressure categories from the American Heart Association, Fasting Blood Glucose standards from the American Diabetes Association, and BMI metrics from the World Health Organization) reflect general population guidelines.
            </p>
            <p>
              Individual physiological targets may vary depending on patient age, pregnancy status, preexisting renal condition, or prescribed medications. Never alter or discontinue prescribed medication dosages based solely on readings logged in this application without consulting your prescribing physician.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <h2 className="text-base sm:text-lg font-bold text-[#0B2545] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              4. Emergency Services & 112 Triage Limitations
            </h2>
            <p>
              PreventHealth AI is <strong>not an automated dispatch service and does not contact emergency medical services or call ambulances on your behalf</strong>.
            </p>
            <p>
              If our emergency symptom triage flags red-flag warning signs or if you suspect you or someone around you is in life-threatening distress:
            </p>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-slate-800 text-xs">
              <p className="font-bold text-slate-900">• Immediately dial 112 (National Emergency Number in India) or your regional emergency helpline.</p>
              <p>• Have an accompanying person drive you to the nearest 24x7 trauma hospital or emergency department.</p>
              <p>• Do not attempt to drive a vehicle yourself if you are feeling dizzy, disoriented, or in severe pain.</p>
            </div>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <Link href="/privacy" className="text-teal-600 hover:text-teal-700 font-semibold underline">
            Read Privacy Policy →
          </Link>
          <Link href="/emergency" className="text-red-600 hover:text-red-700 font-semibold underline">
            Go to Emergency Hub →
          </Link>
        </div>
      </main>
    </div>
  );
}
