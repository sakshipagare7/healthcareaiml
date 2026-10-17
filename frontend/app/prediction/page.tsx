'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { api, HealthProfile, ModelStatusSummary } from '@/lib/api';
import {
  Activity,
  HeartPulse,
  Cpu,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  PlusCircle,
  FileEdit,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

export default function PredictionRunnerPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [modelsStatus, setModelsStatus] = useState<ModelStatusSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [prof, statusSummary] = await Promise.all([
          api.getCurrentProfile(),
          api.getModelsStatus()
        ]);
        setProfile(prof);
        setModelsStatus(statusSummary);
      } catch (err: any) {
        setError(err.message || 'Failed to load health profile or model statuses');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleRunAssessment = async () => {
    if (!profile) return;
    setError(null);
    setRunning(true);

    try {
      const assessment = await api.runAssessment(profile.id);
      router.push(`/prediction/results/${assessment.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to execute assessment.');
      setRunning(false);
    }
  };

  return (
    <AppShell
      title="Run Health Risk Assessment"
      subtitle="Multimodal Scikit-Learn Random Forest Pipeline Inference"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs text-red-700 font-medium">{error}</div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600 mb-3" />
            <p className="text-xs text-slate-500 font-medium">Checking health metrics and ML pipelines...</p>
          </div>
        ) : !profile ? (
          /* Missing Profile Guard */
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-8 text-center max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#0B2545] mb-2">No Health Profile on Record</h3>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              In accordance with project integrity rules, machine learning assessments cannot run on fabricated inputs.
              Please record your real health vitals before running an assessment.
            </p>
            <Link
              href="/health/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B2545] hover:bg-navy-800 text-white font-semibold text-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4 text-teal-400" />
              <span>Enter Health Information</span>
            </Link>
          </div>
        ) : (
          <>
            {/* Health Snapshot Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <HeartPulse className="w-5 h-5 text-teal-600" />
                  <h3 className="text-base font-bold text-[#0B2545]">Active Health Measurements Snapshot</h3>
                </div>
                <Link
                  href={`/health/edit/${profile.id}`}
                  className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                >
                  <FileEdit className="w-3.5 h-3.5" />
                  <span>Edit Values</span>
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Blood Pressure</span>
                  <span className="font-bold text-[#0B2545] text-sm">{profile.systolic_bp} / {profile.diastolic_bp} mmHg</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Heart Rate</span>
                  <span className="font-bold text-[#0B2545] text-sm">{profile.heart_rate} bpm</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Computed BMI</span>
                  <span className="font-bold text-[#0B2545] text-sm">{profile.bmi} kg/m²</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Blood Glucose</span>
                  <span className="font-bold text-[#0B2545] text-sm">
                    {profile.blood_glucose ? `${profile.blood_glucose} mg/dL` : <span className="text-slate-400 font-normal">Not entered</span>}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Total Cholesterol</span>
                  <span className="font-bold text-[#0B2545] text-sm">
                    {profile.total_cholesterol ? `${profile.total_cholesterol} mg/dL` : <span className="text-slate-400 font-normal">Not entered</span>}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Serum Creatinine</span>
                  <span className="font-bold text-[#0B2545] text-sm">
                    {profile.serum_creatinine ? `${profile.serum_creatinine} mg/dL` : <span className="text-slate-400 font-normal">Not entered</span>}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Blood Urea</span>
                  <span className="font-bold text-[#0B2545] text-sm">
                    {profile.blood_urea ? `${profile.blood_urea} mg/dL` : <span className="text-slate-400 font-normal">Not entered</span>}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Date Measured</span>
                  <span className="font-bold text-[#0B2545] text-sm">{profile.measured_on}</span>
                </div>
              </div>
            </div>

            {/* Model Readiness Overview */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
              <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
                <Cpu className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-[#0B2545]">Diagnostic Models Prepared for Execution</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {modelsStatus && Object.entries(modelsStatus.models).map(([key, m]) => (
                  <div key={key} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#0B2545]">{m.display_name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        m.is_trained ? 'bg-teal-100 text-teal-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {m.is_trained ? 'Trained' : 'Untrained'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-2">Dataset: {m.dataset_name}</p>
                    <div className="text-[10px] text-slate-400">
                      Req: {m.required_features.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Run Action */}
            <div className="bg-navy-900 text-white rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="text-base font-bold mb-1">Execute Random Forest Multi-Model Pipeline</h4>
                <p className="text-xs text-navy-300 max-w-xl leading-relaxed">
                  Generates calibrated risk probabilities across Type 2 Diabetes, Cardiovascular Disease, and CKD.
                  Extracts top decision factors from holdout-trained Random Forests and synthesizes rule-based preventive advice.
                </p>
              </div>

              <button
                onClick={handleRunAssessment}
                disabled={running}
                className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs tracking-wide shadow-md transition-all hover:scale-[1.02] disabled:opacity-60"
              >
                {running ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Running ML Pipelines...</span>
                  </>
                ) : (
                  <>
                    <Activity className="w-4 h-4" />
                    <span>Run AI Assessment</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
