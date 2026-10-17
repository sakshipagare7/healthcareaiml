'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import { api, HealthProfile, Assessment } from '@/lib/api';
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
  CreditCard
} from 'lucide-react';
import VitalsTrendChart from '@/components/VitalsTrendChart';
import MedicalIdCard from '@/components/MedicalIdCard';
import MedicationTracker from '@/components/MedicationTracker';

export default function DashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [latestAssessment, setLatestAssessment] = useState<Assessment | null>(null);
  const [showMedicalId, setShowMedicalId] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        // Load latest profile
        const prof = await api.getCurrentProfile();
        setProfile(prof);

        // Load assessment history
        const assessments = await api.getAssessments();
        if (assessments && assessments.length > 0) {
          setLatestAssessment(assessments[0]);
        }
      } catch (err: any) {
        console.error('Failed to load dashboard:', err);
        setError(err.message || 'Failed to load health metrics');
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const getBmiCategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    if (bmi < 25) return { label: 'Normal weight', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    return { label: 'Obese', color: 'text-red-700 bg-red-50 border-red-200' };
  };

  const getBpCategory = (sys: number, dia: number) => {
    if (sys >= 180 || dia >= 120) return { label: 'Crisis Range (Urgent)', color: 'text-red-700 bg-red-50 border-red-200' };
    if (sys >= 140 || dia >= 90) return { label: 'Stage 2 Hypertension', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    if (sys >= 130 || dia >= 80) return { label: 'Stage 1 Hypertension', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    return { label: 'Normal Blood Pressure', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  };

  return (
    <AppShell
      title={`Welcome, ${user?.full_name || 'Patient'}`}
      subtitle="Your Personal Preventive Health Command Center"
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-xs font-semibold text-slate-500 tracking-wide">Loading health profile...</p>
        </div>
      ) : !profile ? (
        /* Empty State UX - Mandatory requirement for new users */
        <div className="max-w-2xl mx-auto py-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 border border-teal-200 flex items-center justify-center mx-auto mb-6 shadow-xs">
            <HeartPulse className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-bold text-[#0B2545] mb-2">No Health Data Yet</h2>
          <p className="text-sm text-slate-600 mb-8 max-w-lg mx-auto leading-relaxed">
            Your dashboard is currently empty because no measurements have been recorded.
            Enter your vital signs and clinical laboratory tests to unlock AI risk assessments and preventive recommendations.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/health/new"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0B2545] hover:bg-navy-800 text-white font-semibold text-sm shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4 text-teal-400" />
              <span>Enter Health Information</span>
            </Link>

            <Link
              href="/emergency"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-semibold text-sm transition-all"
            >
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <span>Emergency Symptom Check</span>
            </Link>
          </div>

          <div className="mt-12 p-6 rounded-2xl bg-white border border-slate-200 text-left shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0B2545] uppercase tracking-wider mb-3">
              <Info className="w-4 h-4 text-teal-600" />
              <span>Strict Academic Integrity Notice</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              This system never shows fake, random, or pre-populated demo records. All vitals and risk calculations
              belong strictly to you and remain encrypted under your private account session.
            </p>
          </div>
        </div>
      ) : (
        /* Populated State with Real User Data */
        <div className="space-y-6 max-w-6xl mx-auto">
          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                <span>Profile Active</span>
              </span>
              <span className="text-xs text-slate-500">
                Last recorded: <strong>{profile.measured_on}</strong>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowMedicalId(!showMedicalId)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors shadow-xs"
              >
                <CreditCard className="w-3.5 h-3.5 text-red-600" />
                <span>{showMedicalId ? 'Close Medical ID' : 'Emergency Medical ID (ICE)'}</span>
              </button>

              <Link
                href={`/health/edit/${profile.id}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <FileEdit className="w-3.5 h-3.5 text-slate-600" />
                <span>Edit Measurements</span>
              </Link>

              <Link
                href="/prediction"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#0B2545] hover:bg-navy-800 shadow-xs transition-colors"
              >
                <Activity className="w-3.5 h-3.5 text-teal-400" />
                <span>Run AI Assessment</span>
              </Link>
            </div>
          </div>

          {/* Vitals Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Blood Pressure Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Blood Pressure</span>
                <HeartPulse className="w-4 h-4 text-red-500" />
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-2xl font-extrabold text-[#0B2545]">
                  {profile.systolic_bp} / {profile.diastolic_bp}
                </span>
                <span className="text-xs text-slate-400">mmHg</span>
              </div>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getBpCategory(profile.systolic_bp, profile.diastolic_bp).color}`}>
                {getBpCategory(profile.systolic_bp, profile.diastolic_bp).label}
              </span>
            </div>

            {/* Heart Rate Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Heart Rate</span>
                <Activity className="w-4 h-4 text-rose-500" />
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-2xl font-extrabold text-[#0B2545]">{profile.heart_rate}</span>
                <span className="text-xs text-slate-400">bpm</span>
              </div>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                profile.heart_rate > 100 ? 'text-amber-700 bg-amber-50 border-amber-200' :
                profile.heart_rate < 60 ? 'text-blue-700 bg-blue-50 border-blue-200' :
                'text-emerald-700 bg-emerald-50 border-emerald-200'
              }`}>
                {profile.heart_rate > 100 ? 'Tachycardia' : profile.heart_rate < 60 ? 'Bradycardia' : 'Resting Baseline'}
              </span>
            </div>

            {/* BMI Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Body Mass Index</span>
                <Scale className="w-4 h-4 text-teal-600" />
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-2xl font-extrabold text-[#0B2545]">{profile.bmi}</span>
                <span className="text-xs text-slate-400">kg/m²</span>
              </div>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getBmiCategory(profile.bmi).color}`}>
                {getBmiCategory(profile.bmi).label}
              </span>
            </div>

            {/* Blood Glucose Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fasting Glucose</span>
                <Droplets className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-2xl font-extrabold text-[#0B2545]">
                  {profile.blood_glucose !== null && profile.blood_glucose !== undefined ? profile.blood_glucose : '—'}
                </span>
                <span className="text-xs text-slate-400">mg/dL</span>
              </div>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                profile.blood_glucose === null || profile.blood_glucose === undefined
                  ? 'text-slate-500 bg-slate-100 border-slate-200'
                  : profile.blood_glucose >= 126
                  ? 'text-red-700 bg-red-50 border-red-200'
                  : profile.blood_glucose >= 100
                  ? 'text-amber-700 bg-amber-50 border-amber-200'
                  : 'text-emerald-700 bg-emerald-50 border-emerald-200'
              }`}>
                {profile.blood_glucose === null || profile.blood_glucose === undefined
                  ? 'Not Recorded'
                  : profile.blood_glucose >= 126
                  ? 'Elevated (Diagnostic Range)'
                  : profile.blood_glucose >= 100
                  ? 'Impaired Fasting'
                  : 'Normal Glycemic'}
              </span>
            </div>
          </div>

          {/* Secondary Clinical Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Renal Function Lab</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Serum Creatinine</span>
                  <span className="font-semibold text-slate-800">
                    {profile.serum_creatinine ? `${profile.serum_creatinine} mg/dL` : <span className="text-slate-400 italic">Unrecorded</span>}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Blood Urea Nitrogen</span>
                  <span className="font-semibold text-slate-800">
                    {profile.blood_urea ? `${profile.blood_urea} mg/dL` : <span className="text-slate-400 italic">Unrecorded</span>}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Lipid Profile Lab</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Total Cholesterol</span>
                  <span className="font-semibold text-slate-800">
                    {profile.total_cholesterol ? `${profile.total_cholesterol} mg/dL` : <span className="text-slate-400 italic">Unrecorded</span>}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">HbA1c Glycated</span>
                  <span className="font-semibold text-slate-800">
                    {profile.hba1c ? `${profile.hba1c}%` : <span className="text-slate-400 italic">Unrecorded</span>}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Lifestyle & Demographics</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Age / Sex</span>
                  <span className="font-semibold text-slate-800 capitalize">{profile.age} yrs / {profile.sex}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Physical Activity</span>
                  <span className="font-semibold text-slate-800 capitalize">{profile.physical_activity || 'Unspecified'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Medical ID (ICE) Card Section */}
          {showMedicalId && (
            <div className="mb-2 transition-all">
              <MedicalIdCard user={user} profile={profile} />
            </div>
          )}

          {/* Daily Medication & Routine Adherence Tracker */}
          <MedicationTracker />

          {/* Longitudinal Vitals Trends (Feature 4) */}
          <VitalsTrendChart />

          {/* Latest Assessment Showcase */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-[#0B2545]">Machine Learning Assessment Status</h3>
                <p className="text-xs text-slate-500">Multimodal risk estimation across chronic conditions</p>
              </div>

              {latestAssessment ? (
                <Link
                  href={`/prediction/results/${latestAssessment.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <span>View Full Assessment #{latestAssessment.id}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <Link
                  href="/prediction"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B2545] hover:bg-navy-800 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <span>Run Initial AI Assessment</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            {latestAssessment ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {latestAssessment.prediction_results.map((res) => (
                  <div
                    key={res.disease}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-[#0B2545] capitalize">{res.disease}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          res.status === 'ok'
                            ? res.risk_category === 'High'
                              ? 'bg-red-100 text-red-700 border border-red-200'
                              : res.risk_category === 'Moderate'
                              ? 'bg-amber-100 text-amber-700 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-200 text-slate-600'
                        }`}>
                          {res.status === 'ok' ? `${res.risk_category} Risk` : res.status.replace('_', ' ')}
                        </span>
                      </div>

                      {res.status === 'ok' ? (
                        <div className="mb-2">
                          <span className="text-2xl font-black text-[#0B2545]">
                            {res.risk_score !== null && res.risk_score !== undefined ? `${(res.risk_score * 100).toFixed(1)}%` : '—'}
                          </span>
                          <span className="text-[11px] text-slate-400 block">Model probability</span>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 mb-2">
                          {res.status === 'unavailable' ? 'Missing clinical inputs' : 'Model not trained'}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                      {res.status === 'ok' ? `${res.recommendations?.length || 0} preventive guidance items` : 'Click to update details'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Activity className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600 mb-1">No assessment generated for this profile yet</p>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto mb-4">
                  Run our trained Random Forest classifiers to generate individualized risk estimation and preventive rules.
                </p>
                <Link
                  href="/prediction"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-colors"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Execute First Assessment</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
