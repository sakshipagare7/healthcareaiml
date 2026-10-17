'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import { api, HealthProfile, Assessment, PredictionResultItem } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import {
  HeartPulse,
  Activity,
  AlertTriangle,
  Scale,
  Droplets,
  Calendar,
  ArrowRight,
  PlusCircle,
  FileEdit,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertCircle,
  Info,
  CreditCard,
  TrendingUp,
  Cpu,
  Layers,
  ChevronRight,
  Sparkles,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import VitalsTrendChart from '@/components/VitalsTrendChart';
import MedicalIdCard from '@/components/MedicalIdCard';
import MedicationTracker from '@/components/MedicationTracker';

interface RecentActivityItem {
  id: string;
  type: 'assessment' | 'health_profile';
  title: string;
  subtitle: string;
  date: string;
  badgeText: string;
  badgeColor: string;
  link: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [healthHistory, setHealthHistory] = useState<HealthProfile[]>([]);
  const [showMedicalId, setShowMedicalId] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        setError(null);
        const [prof, assessList, historyList] = await Promise.all([
          api.getCurrentProfile().catch(() => null),
          api.getAssessments().catch(() => []),
          api.getHealthHistory().catch(() => [])
        ]);

        setProfile(prof);
        setAssessments(assessList || []);
        setHealthHistory(historyList || []);
      } catch (err: any) {
        console.error('Failed to load dashboard:', err);
        setError(err.message || 'Failed to load health metrics');
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const latestAssessment = assessments.length > 0 ? assessments[0] : null;

  // Formatted current date for Section A
  const formattedToday = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Clinical threshold helpers
  const getBmiCategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    if (bmi < 25) return { label: 'Normal weight (18.5–24.9)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (bmi < 30) return { label: 'Overweight (25–29.9)', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    return { label: 'Obese (≥30)', color: 'text-red-700 bg-red-50 border-red-200' };
  };

  const getBpCategory = (sys: number, dia: number) => {
    if (sys >= 180 || dia >= 120) return { label: 'Crisis Range (Urgent)', color: 'text-red-700 bg-red-50 border-red-200', urgent: true };
    if (sys >= 140 || dia >= 90) return { label: 'Stage 2 Hypertension', color: 'text-amber-700 bg-amber-50 border-amber-200', urgent: false };
    if (sys >= 130 || dia >= 80) return { label: 'Stage 1 Hypertension', color: 'text-amber-600 bg-amber-50 border-amber-200', urgent: false };
    if (sys >= 120 && dia < 80) return { label: 'Elevated BP', color: 'text-amber-600 bg-amber-50 border-amber-200', urgent: false };
    return { label: 'Normal Blood Pressure', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', urgent: false };
  };

  const getGlucoseCategory = (val: number | null | undefined) => {
    if (val === null || val === undefined) {
      return { label: 'No Reading Recorded', color: 'text-slate-500 bg-slate-100 border-slate-200', urgent: false };
    }
    if (val < 70) return { label: 'Hypoglycemia Alert (<70 mg/dL)', color: 'text-red-700 bg-red-50 border-red-200', urgent: true };
    if (val >= 200) return { label: 'Markedly Elevated (≥200 mg/dL)', color: 'text-red-700 bg-red-50 border-red-200', urgent: true };
    if (val >= 126) return { label: 'Diabetes Range (≥126 mg/dL)', color: 'text-red-700 bg-red-50 border-red-200', urgent: false };
    if (val >= 100) return { label: 'Impaired Fasting (100–125)', color: 'text-amber-700 bg-amber-50 border-amber-200', urgent: false };
    return { label: 'Normal Fasting (70–99 mg/dL)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', urgent: false };
  };

  const getHeartRateCategory = (hr: number) => {
    if (hr > 100) return { label: 'Tachycardia (>100 bpm)', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    if (hr < 60) return { label: 'Bradycardia (<60 bpm)', color: 'text-blue-700 bg-blue-50 border-blue-200' };
    return { label: 'Normal Resting (60–100 bpm)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  };

  // Build Recent Activity list (reverse chronological)
  const recentActivities: RecentActivityItem[] = [];

  assessments.forEach((a) => {
    const validCount = a.prediction_results?.filter((r) => r.status === 'ok').length || 0;
    const topRisk = a.prediction_results?.find((r) => r.risk_category === 'High')
      ? 'High Risk Detected'
      : a.prediction_results?.find((r) => r.risk_category === 'Moderate')
      ? 'Moderate Risk'
      : 'Low Risk Screening';

    recentActivities.push({
      id: `assess-${a.id}`,
      type: 'assessment',
      title: `AI Health Risk Assessment #${a.id}`,
      subtitle: `${validCount} models evaluated • ${topRisk}`,
      date: a.created_at,
      badgeText: 'ML Assessment',
      badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
      link: `/prediction/results/${a.id}`,
    });
  });

  healthHistory.forEach((h) => {
    recentActivities.push({
      id: `profile-${h.id}`,
      type: 'health_profile',
      title: `Health Checkup Entry #${h.id}`,
      subtitle: `BP: ${h.systolic_bp}/${h.diastolic_bp} mmHg • HR: ${h.heart_rate} bpm • BMI: ${h.bmi} kg/m²${
        h.blood_glucose ? ` • Glucose: ${h.blood_glucose} mg/dL` : ''
      }`,
      date: h.created_at || h.measured_on,
      badgeText: 'Vitals Recorded',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      link: `/health/edit/${h.id}`,
    });
  });

  // Sort by date descending
  recentActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const displayedActivities = recentActivities.slice(0, 5);

  // Models for Section C
  const supportedDiseases = [
    {
      key: 'diabetes',
      name: 'Type 2 Diabetes Mellitus',
      benchmark: 'Pima Indians Diabetes Benchmark',
      description: 'Screens probability of insulin resistance and impaired fasting blood glucose.',
    },
    {
      key: 'cardiovascular',
      name: 'Cardiovascular Disease (CVD)',
      benchmark: 'UCI Cleveland Heart Disease Benchmark',
      description: 'Evaluates ischemic and atherosclerotic cardiac risk across hemodynamic markers.',
    },
    {
      key: 'ckd',
      name: 'Chronic Kidney Disease (CKD)',
      benchmark: 'UCI Chronic Kidney Disease Benchmark',
      description: 'Evaluates filtration function, serum creatinine, and nephron stability indicators.',
    },
  ];

  const getModelInterpretation = (diseaseKey: string, result?: PredictionResultItem) => {
    if (!result || result.status !== 'ok') {
      return 'No active prediction computed. Record required clinical inputs and run assessment.';
    }
    const cat = result.risk_category;
    if (diseaseKey === 'diabetes') {
      if (cat === 'High') return 'Elevated probability of glycemic dysregulation. Clinical consultation and fasting lab check recommended.';
      if (cat === 'Moderate') return 'Borderline fasting glycemic parameters detected. Regular physical activity and dietary monitoring suggested.';
      return 'Low probability of diabetes based on current fasting glucose, age, and BMI parameters.';
    }
    if (diseaseKey === 'cardiovascular') {
      if (cat === 'High') return 'Elevated cardiovascular risk factors noted. Medical consultation and full lipid evaluation advised.';
      if (cat === 'Moderate') return 'Moderate risk profile indicated by blood pressure and resting vitals. Preventive exercise encouraged.';
      return 'Cardiovascular hemodynamic parameters and resting vitals are within favorable screening ranges.';
    }
    if (diseaseKey === 'ckd') {
      if (cat === 'High') return 'Elevated renal risk markers detected. Serum creatinine and kidney filtration review advised.';
      if (cat === 'Moderate') return 'Subtle variations in renal markers observed. Maintain adequate hydration and routine lab checks.';
      return 'Renal parameters and metabolic waste clearance markers are within expected clinical baselines.';
    }
    return `Model screening assessment: ${cat} Risk.`;
  };

  return (
    <AppShell
      title={`Welcome, ${user?.full_name || 'Patient'}`}
      subtitle="Your health, all in one place."
    >
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        {/* A. WELCOME SECTION */}
        <div className="bg-gradient-to-r from-[#0B2545] via-navy-900 to-[#134074] text-white rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-300 text-xs font-semibold backdrop-blur-xs">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formattedToday}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back, {user?.full_name?.split(' ')[0] || 'Patient'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                Your health, all in one place. Monitor your real-time vital readings, assess preventive disease risks, and track historical stability.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/prediction"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-md transition-all hover:scale-[1.02]"
              >
                <Activity className="w-4 h-4 text-slate-950" />
                <span>New Assessment</span>
              </Link>

              <Link
                href="/health/new"
                className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs sm:text-sm transition-all"
              >
                <PlusCircle className="w-4 h-4 text-teal-300" />
                <span>Record Vitals</span>
              </Link>

              <button
                type="button"
                onClick={() => setShowMedicalId(!showMedicalId)}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-red-600/80 hover:bg-red-600 text-white font-bold text-xs sm:text-sm transition-all shadow-xs"
                title="Open Emergency Medical ID (ICE)"
              >
                <CreditCard className="w-4 h-4" />
                <span className="hidden sm:inline">{showMedicalId ? 'Close Medical ID' : 'Emergency ID'}</span>
                <span className="sm:hidden">ICE</span>
              </button>
            </div>
          </div>
        </div>

        {/* Emergency Medical ID Card Dropdown */}
        {showMedicalId && (
          <div className="animate-in fade-in duration-200">
            <MedicalIdCard user={user} profile={profile} />
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200 shadow-xs">
            <div className="w-10 h-10 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-xs font-semibold text-slate-500">Loading personalized health command center...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : (
          <>
            {/* B. HEALTH OVERVIEW CARDS */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#0B2545]">
                    Health Overview & Vitals
                  </h2>
                  <p className="text-xs text-slate-500">
                    Real clinical measurements retrieved directly from your secure health history
                  </p>
                </div>
                {profile && (
                  <Link
                    href={`/health/edit/${profile.id}`}
                    className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                  >
                    <FileEdit className="w-3.5 h-3.5" />
                    <span>Edit Current Vitals</span>
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Disease Risk Assessment Status */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Latest Assessment
                      </span>
                      <Activity className="w-4 h-4 text-teal-600" />
                    </div>

                    {latestAssessment ? (
                      <div>
                        <div className="text-xl sm:text-2xl font-black text-[#0B2545] mb-1">
                          Assessment #{latestAssessment.id}
                        </div>
                        <p className="text-[11px] text-slate-500 mb-2 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{new Date(latestAssessment.created_at).toLocaleDateString()}</span>
                        </p>
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                          {assessments.length} Completed Total
                        </span>
                      </div>
                    ) : (
                      <div className="py-2">
                        <p className="text-xs font-semibold text-slate-700 mb-1">No Assessments Yet</p>
                        <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                          Run your first Random Forest screening evaluation.
                        </p>
                        <Link
                          href="/prediction"
                          className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 hover:text-teal-700 underline"
                        >
                          <span>Start Assessment</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    )}
                  </div>

                  {latestAssessment && (
                    <div className="pt-3 border-t border-slate-100 mt-2">
                      <Link
                        href={`/prediction/results/${latestAssessment.id}`}
                        className="text-[11px] font-bold text-teal-600 hover:text-teal-700 flex items-center justify-between"
                      >
                        <span>View Assessment Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}
                </div>

                {/* Card 2: Blood Glucose */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Fasting Glucose
                      </span>
                      <Droplets className="w-4 h-4 text-amber-500" />
                    </div>

                    {profile && profile.blood_glucose !== null && profile.blood_glucose !== undefined ? (
                      <div>
                        <div className="flex items-baseline gap-1 mb-1">
                          <span className="text-2xl font-black text-[#0B2545]">{profile.blood_glucose}</span>
                          <span className="text-xs text-slate-400 font-semibold">mg/dL</span>
                        </div>
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            getGlucoseCategory(profile.blood_glucose).color
                          }`}
                        >
                          {getGlucoseCategory(profile.blood_glucose).label}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-2">
                          Logged: {profile.measured_on || 'Recent'}
                        </p>
                      </div>
                    ) : (
                      <div className="py-2">
                        <p className="text-xs font-semibold text-slate-700 mb-1">No Glucose Logged</p>
                        <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                          Record your fasting laboratory reading to activate diabetes screening.
                        </p>
                        <Link
                          href="/health/new"
                          className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 hover:text-teal-700 underline"
                        >
                          <span>+ Add Reading</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                    ADA Target: 70–99 mg/dL
                  </div>
                </div>

                {/* Card 3: Blood Pressure */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Blood Pressure
                      </span>
                      <HeartPulse className="w-4 h-4 text-red-500" />
                    </div>

                    {profile ? (
                      <div>
                        <div className="flex items-baseline gap-1 mb-1">
                          <span className="text-2xl font-black text-[#0B2545]">
                            {profile.systolic_bp} / {profile.diastolic_bp}
                          </span>
                          <span className="text-xs text-slate-400 font-semibold">mmHg</span>
                        </div>
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            getBpCategory(profile.systolic_bp, profile.diastolic_bp).color
                          }`}
                        >
                          {getBpCategory(profile.systolic_bp, profile.diastolic_bp).label}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-2">
                          Logged: {profile.measured_on || 'Recent'}
                        </p>
                      </div>
                    ) : (
                      <div className="py-2">
                        <p className="text-xs font-semibold text-slate-700 mb-1">No BP Logged</p>
                        <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                          Enter your systolic and diastolic blood pressure.
                        </p>
                        <Link
                          href="/health/new"
                          className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 hover:text-teal-700 underline"
                        >
                          <span>+ Add BP Reading</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                    AHA Target: &lt;120 / &lt;80 mmHg
                  </div>
                </div>

                {/* Card 4: Resting Heart Rate & BMI */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Vitals & Body Mass
                      </span>
                      <Scale className="w-4 h-4 text-teal-600" />
                    </div>

                    {profile ? (
                      <div className="space-y-2">
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs text-slate-500 font-medium">Heart Rate</span>
                          <span className="font-extrabold text-[#0B2545] text-sm">
                            {profile.heart_rate} <span className="text-[10px] font-normal text-slate-400">bpm</span>
                          </span>
                        </div>
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs text-slate-500 font-medium">Computed BMI</span>
                          <span className="font-extrabold text-[#0B2545] text-sm">
                            {profile.bmi} <span className="text-[10px] font-normal text-slate-400">kg/m²</span>
                          </span>
                        </div>
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            getBmiCategory(profile.bmi).color
                          }`}
                        >
                          {getBmiCategory(profile.bmi).label}
                        </span>
                      </div>
                    ) : (
                      <div className="py-2">
                        <p className="text-xs font-semibold text-slate-700 mb-1">No Physical Vitals</p>
                        <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                          Enter height and weight to compute Body Mass Index.
                        </p>
                        <Link
                          href="/health/new"
                          className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 hover:text-teal-700 underline"
                        >
                          <span>+ Add Physical Vitals</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                    WHO Normal: 18.5–24.9 kg/m²
                  </div>
                </div>
              </div>
            </div>

            {/* C. DISEASE PREDICTION SECTION */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-200">
                      <Cpu className="w-4 h-4" />
                    </span>
                    <h2 className="text-base sm:text-lg font-bold text-[#0B2545]">
                      Supported Disease Prediction Models
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Multimodal machine learning screening evaluations based strictly on your authenticated clinical records
                  </p>
                </div>

                <Link
                  href="/prediction"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B2545] hover:bg-navy-800 text-white font-bold text-xs shadow-xs transition-colors shrink-0"
                >
                  <Activity className="w-3.5 h-3.5 text-teal-400" />
                  <span>Execute Assessment</span>
                </Link>
              </div>

              {/* Mandatory Medical Screening Notice */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2.5 mb-6 leading-relaxed">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong>Decision-Support Notice:</strong> Machine learning risk estimates provide preventive screening and clinical decision-support indicators. They do not constitute a confirmed diagnostic finding. Consult a licensed physician for diagnosis and medical guidance.
                </div>
              </div>

              {/* 3 Model Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {supportedDiseases.map((dis) => {
                  const modelResult = latestAssessment?.prediction_results?.find(
                    (r) => r.disease === dis.key
                  );
                  const interpretation = getModelInterpretation(dis.key, modelResult);

                  return (
                    <div
                      key={dis.key}
                      className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 flex flex-col justify-between hover:border-teal-300 transition-colors"
                    >
                      <div>
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-extrabold text-[#0B2545] text-sm leading-snug">
                            {dis.name}
                          </h3>
                          {modelResult && modelResult.status === 'ok' ? (
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 border ${
                                modelResult.risk_category === 'High'
                                  ? 'bg-red-50 text-red-700 border-red-200'
                                  : modelResult.risk_category === 'Moderate'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}
                            >
                              {modelResult.risk_category} Risk
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-200 text-slate-600 shrink-0">
                              {modelResult ? modelResult.status.replace('_', ' ') : 'Not Evaluated'}
                            </span>
                          )}
                        </div>

                        {/* Probability Score */}
                        {modelResult && modelResult.status === 'ok' ? (
                          <div className="my-3 p-3 rounded-xl bg-white border border-slate-100 shadow-2xs">
                            <div className="text-2xl font-black text-[#0B2545]">
                              {modelResult.risk_score !== null && modelResult.risk_score !== undefined
                                ? `${(modelResult.risk_score * 100).toFixed(1)}%`
                                : '—'}
                            </div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">
                              Random Forest Probability
                            </span>
                          </div>
                        ) : (
                          <div className="my-3 p-3 rounded-xl bg-white border border-dashed border-slate-200 text-center">
                            <span className="text-xs text-slate-400">Awaiting Assessment</span>
                          </div>
                        )}

                        {/* Clinical Interpretation */}
                        <p className="text-xs text-slate-600 leading-relaxed mb-4">
                          {interpretation}
                        </p>
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                        <span className="text-[10px] text-slate-400">
                          {latestAssessment ? `Date: ${new Date(latestAssessment.created_at).toLocaleDateString()}` : dis.benchmark.split(' ')[0]}
                        </span>

                        {latestAssessment ? (
                          <Link
                            href={`/prediction/results/${latestAssessment.id}`}
                            className="font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                          >
                            <span>Details</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        ) : (
                          <Link
                            href="/prediction"
                            className="font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                          >
                            <span>Assess</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* D. RECENT ACTIVITY TIMELINE */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#0B2545]">
                    Recent Health Activity & Logs
                  </h2>
                  <p className="text-xs text-slate-500">
                    Chronological audit trail of your recorded vitals and AI risk evaluations
                  </p>
                </div>
                <Link
                  href="/history"
                  className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                >
                  <span>View Full History</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {displayedActivities.length === 0 ? (
                <div className="py-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <h4 className="text-xs font-bold text-slate-700 mb-1">No Activity Logged Yet</h4>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto mb-4 leading-relaxed">
                    Once you record vital signs or run machine learning assessments, your activity timeline will appear here.
                  </p>
                  <Link
                    href="/health/new"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Begin by Recording Vitals</span>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {displayedActivities.map((act) => {
                    const formattedItemDate = new Date(act.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <Link
                        key={act.id}
                        href={act.link}
                        className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 px-3 -mx-3 rounded-xl transition-colors group"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${act.badgeColor}`}
                            >
                              {act.badgeText}
                            </span>
                            <span className="font-bold text-[#0B2545] text-xs sm:text-sm group-hover:text-teal-600 transition-colors">
                              {act.title}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-snug">{act.subtitle}</p>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 text-xs">
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{formattedItemDate}</span>
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* E. HEALTH TRENDS SECTION */}
            <VitalsTrendChart />

            {/* Additional Features: Daily Medication Tracker */}
            <MedicationTracker />
          </>
        )}
      </div>
    </AppShell>
  );
}
