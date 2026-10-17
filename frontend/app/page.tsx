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
  Calendar,
  Sparkles,
  ChevronRight,
  TrendingUp,
  FileText,
  AlertTriangle,
  Hospital,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      {/* Navigation Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#0B2545] text-teal-400 flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
              <HeartPulse className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <span className="font-extrabold text-[#0B2545] text-base sm:text-lg tracking-tight">PreventHealth</span>
              <span className="text-teal-600 font-mono text-xs font-bold ml-1">AI</span>
            </div>
          </Link>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-semibold text-slate-600">
            <Link href="/" className="text-teal-600 hover:text-teal-700 transition-colors">
              Home
            </Link>
            <a href="#features" className="hover:text-slate-900 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">
              How It Works
            </a>
            <Link href="/privacy" className="hover:text-slate-900 transition-colors">
              Privacy
            </Link>
            <Link href="/disclaimer" className="hover:text-slate-900 transition-colors">
              Medical Disclaimer
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-[#0B2545] hover:bg-navy-800 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
              >
                <span>Dashboard ({user.full_name.split(' ')[0]})</span>
                <ArrowRight className="w-3.5 h-3.5 text-teal-400" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:text-[#0B2545] hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
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
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        {/* Subtle pill tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-6">
          <Activity className="w-3.5 h-3.5 text-teal-600" />
          <span>Multimodal Machine Learning & Preventive Screening</span>
        </div>

        {/* Mandatory Exact Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#0B2545] tracking-tight leading-tight sm:leading-[1.15] mb-6">
          Understand Your Health.<br className="hidden sm:inline" />
          <span className="text-teal-600"> Act Earlier.</span>
        </h1>

        {/* Mandatory Exact Description & Supporting Text */}
        <p className="text-base sm:text-lg text-slate-700 max-w-2xl mx-auto mb-4 leading-relaxed font-medium">
          Take a proactive approach to your health with AI-assisted risk assessment, personal health tracking, and emergency guidance.
        </p>

        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed">
          Assess potential health risks, monitor your measurements, and make more informed decisions about your well-being with AI-assisted preventive healthcare.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-10">
          <Link
            href={user ? '/dashboard' : '/register'}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#0B2545] hover:bg-navy-800 text-white font-bold text-sm shadow-sm transition-all hover:scale-[1.01]"
          >
            <span>{user ? 'Go to Dashboard' : 'Get Started'}</span>
            <ArrowRight className="w-4 h-4 text-teal-400" />
          </Link>

          <a
            href="#features"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-800 font-semibold text-sm transition-colors"
          >
            <span>Explore Features</span>
          </a>

          <Link
            href="/emergency"
            className="inline-flex items-center gap-2 px-4 py-3.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold text-xs sm:text-sm transition-colors"
          >
            <ShieldAlert className="w-4 h-4 text-red-600" />
            <span>Emergency 112 Hub</span>
          </Link>
        </div>

        {/* Fast Trust Indicators */}
        <div className="pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-500">
          <div className="flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Holdout ML Validation</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Private User Isolation</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Zero Data Broker Sharing</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span>24x7 Emergency Protocols</span>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 sm:py-20 bg-slate-50/70 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">Simple, Transparent Process</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B2545] mt-1.5">How It Works</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Three clear steps to take control of your preventive wellness journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs relative">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center font-black text-sm mb-5">
                01
              </div>
              <h3 className="font-bold text-[#0B2545] text-base mb-2">
                Enter Your Health Data
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Provide the information required by the supported assessments or record your health measurements, including blood pressure, fasting glucose, and vital signs.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs relative">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-black text-sm mb-5">
                02
              </div>
              <h3 className="font-bold text-[#0B2545] text-base mb-2">
                Review Your Assessment
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Receive the output generated by the existing disease prediction models, accompanied by feature importance explanations and clear clinical screening limitations.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs relative">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center font-black text-sm mb-5">
                03
              </div>
              <h3 className="font-bold text-[#0B2545] text-base mb-2">
                Track and Take Action
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Review your history, monitor longitudinal health trends, explore &quot;What-If&quot; lifestyle simulations, and follow evidence-based medical guidance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section id="features" className="py-16 sm:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">Engineered for Reliability</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B2545] mt-1.5">
              Core Healthcare Features
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Integrated screening, personal monitoring, and emergency response built on authentic clinical algorithms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature 1: Disease Risk Prediction */}
            <div className="bg-slate-50/70 border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col justify-between hover:border-teal-300 transition-colors">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 border border-teal-200 flex items-center justify-center mb-5">
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-[#0B2545] text-lg mb-2">
                  Disease Risk Prediction
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  Multi-disease evaluation using Scikit-Learn Random Forest models trained on Pima Diabetes, UCI Heart Disease, and UCI CKD benchmark datasets.
                </p>
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-800 leading-relaxed mb-6">
                  <strong>Important Note:</strong> Model predictions are screening estimates and decision-support indicators, not confirmed diagnoses.
                </div>
              </div>

              <Link
                href="/prediction"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#0B2545] hover:bg-navy-800 text-white font-bold text-xs shadow-xs transition-colors"
              >
                <span>Run Disease Assessment</span>
                <ArrowRight className="w-3.5 h-3.5 text-teal-400" />
              </Link>
            </div>

            {/* Feature 2: Personal Health Monitoring */}
            <div className="bg-slate-50/70 border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col justify-between hover:border-blue-300 transition-colors">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 border border-blue-200 flex items-center justify-center mb-5">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-[#0B2545] text-lg mb-2">
                  Personal Health Monitoring
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  Record daily vitals including blood pressure, fasting glucose, heart rate, and BMI. Track trajectories over time with interactive Recharts graphs.
                </p>
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200/80 text-[11px] text-blue-800 leading-relaxed mb-6">
                  <strong>Clinical Thresholds:</strong> Vitals categorized against verified American Heart Association and American Diabetes Association standards.
                </div>
              </div>

              <Link
                href="/health/new"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                <span>Record Health Measurements</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature 3: Emergency Response */}
            <div className="bg-slate-50/70 border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col justify-between hover:border-red-300 transition-colors">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-600 border border-red-200 flex items-center justify-center mb-5">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-[#0B2545] text-lg mb-2">
                  Emergency Response
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  Immediate 112 red-flag symptom triage (chest crisis, FAST stroke), nearest 24x7 trauma hospital directory, offline first-aid protocols, and paramedic ICE QR card.
                </p>
                <div className="p-3 rounded-xl bg-red-50 border border-red-200/80 text-[11px] text-red-800 leading-relaxed mb-6">
                  <strong>Life-Saving Access:</strong> Clear, immediate offline instructions without delay or unnecessary forms.
                </div>
              </div>

              <Link
                href="/emergency"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                <span>Access Emergency Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Transparency Section */}
      <section className="py-14 bg-slate-50 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-xs">
            <div className="max-w-3xl">
              <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">Integrity & Governance</span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0B2545] mt-1 mb-3">
                Built on Verified Methodology & Absolute Privacy
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                PreventHealth AI was developed with strict software engineering and biomedical standards. We provide transparent documentation for every model, metric, and privacy practice.
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs font-bold">
                <Link
                  href="/models"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                >
                  <Cpu className="w-3.5 h-3.5 text-teal-600" />
                  <span>Model Methodology & Metrics</span>
                </Link>

                <Link
                  href="/privacy"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                >
                  <Lock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Privacy Policy</span>
                </Link>

                <Link
                  href="/disclaimer"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Medical Disclaimer</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Consistent Footer */}
      <footer className="mt-auto bg-[#0B2545] text-white py-12 border-t border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-white/10">
            {/* Col 1: Brand Info */}
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold border border-teal-500/30">
                  <HeartPulse className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-base tracking-tight text-white">PreventHealth AI</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                AI-assisted preventive healthcare, personal vitals monitoring, and emergency response system.
              </p>
            </div>

            {/* Col 2: Navigation */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-3">Navigation</h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/prediction" className="hover:text-white transition-colors">Run Assessment</Link></li>
                <li><Link href="/health/new" className="hover:text-white transition-colors">Record Health Vitals</Link></li>
                <li><Link href="/history" className="hover:text-white transition-colors">Assessment History</Link></li>
              </ul>
            </div>

            {/* Col 3: Emergency & Tools */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-3">Emergency & Tools</h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li><Link href="/emergency" className="hover:text-white transition-colors">Emergency 112 Protocol</Link></li>
                <li><Link href="/emergency" className="hover:text-white transition-colors">Nearby Trauma Hospitals</Link></li>
                <li><Link href="/emergency" className="hover:text-white transition-colors">Offline First-Aid Guides</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Paramedic Medical ID (ICE)</Link></li>
              </ul>
            </div>

            {/* Col 4: Trust & Transparency */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-3">Trust & Legal</h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li><Link href="/models" className="hover:text-white transition-colors">Model Methodology</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/disclaimer" className="hover:text-white transition-colors">Medical Disclaimer</Link></li>
                <li><Link href="/settings" className="hover:text-white transition-colors">Account Settings</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>© {new Date().getFullYear()} PreventHealth AI. Final Year Capstone Project. All rights reserved.</p>
            <p className="text-[11px] text-slate-400 text-center sm:text-right">
              Educational & Screening Prototype. Does not constitute a clinical medical diagnosis.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
