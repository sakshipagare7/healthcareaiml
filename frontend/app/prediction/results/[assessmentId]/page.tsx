'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { api, Assessment, PredictionResultItem } from '@/lib/api';
import {
  Activity,
  HeartPulse,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ArrowLeft,
  FileEdit,
  ShieldAlert,
  Info,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import WhatIfSimulator from '@/components/WhatIfSimulator';

export default function AssessmentResultsPage() {
  const params = useParams();
  const assessmentId = Number(params?.assessmentId);

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAssessment() {
      if (!assessmentId) return;
      try {
        setLoading(true);
        const data = await api.getAssessmentById(assessmentId);
        setAssessment(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load assessment results.');
      } finally {
        setLoading(false);
      }
    }
    loadAssessment();
  }, [assessmentId]);

  if (loading) {
    return (
      <AppShell title="Assessment Results">
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600 mb-3" />
          <p className="text-xs text-slate-500 font-medium">Loading historical assessment #{assessmentId}...</p>
        </div>
      </AppShell>
    );
  }

  if (error || !assessment) {
    return (
      <AppShell title="Assessment Not Found">
        <div className="max-w-md mx-auto py-16 text-center bg-white p-8 rounded-2xl border border-slate-200">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#0B2545] mb-2">Assessment Unavailable</h3>
          <p className="text-xs text-slate-500 mb-6">{error || 'Could not locate this assessment record.'}</p>
          <Link
            href="/history"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to History</span>
          </Link>
        </div>
      </AppShell>
    );
  }

  const getDiseaseDisplayName = (key: string) => {
    switch (key) {
      case 'diabetes': return 'Type 2 Diabetes Mellitus';
      case 'cardiovascular': return 'Cardiovascular Disease';
      case 'ckd': return 'Chronic Kidney Disease (CKD)';
      default: return key.toUpperCase();
    }
  };

  return (
    <AppShell
      title={`Assessment Results #${assessment.id}`}
      subtitle={`Recorded on ${new Date(assessment.created_at).toLocaleString()}`}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Navigation & Mandatory Medical Disclaimer Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/history"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#0B2545] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Assessment History</span>
          </Link>

          <Link
            href="/prediction"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B2545] hover:bg-navy-800 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Activity className="w-3.5 h-3.5 text-teal-400" />
            <span>Run Another Assessment</span>
          </Link>
        </div>

        {/* Prominent Mandatory Academic/Medical Disclaimer */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3.5 shadow-xs">
          <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed space-y-1">
            <p className="font-bold">
              Important Clinical & Academic Disclaimer:
            </p>
            <p className="text-amber-800">
              This is a machine learning estimate generated for a college computer engineering capstone project, not a formal medical diagnosis.
              Risk categories (Low &lt;30%, Moderate 30–60%, High &gt;60%) are academic prototypes and not clinical diagnostic thresholds.
              Always discuss physiological findings and laboratory values with a licensed healthcare clinician.
            </p>
          </div>
        </div>

        {/* Associated Health Profile Snapshot */}
        {assessment.health_profile && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-[#0B2545] uppercase tracking-wider">
                Health Metrics Evaluated in this Assessment
              </span>
              <span className="text-xs text-slate-500">
                Measurement Date: <strong>{assessment.health_profile.measured_on}</strong>
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px]">Blood Pressure</span>
                <span className="font-bold text-slate-800">{assessment.health_profile.systolic_bp}/{assessment.health_profile.diastolic_bp} mmHg</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px]">Heart Rate</span>
                <span className="font-bold text-slate-800">{assessment.health_profile.heart_rate} bpm</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px]">Computed BMI</span>
                <span className="font-bold text-slate-800">{assessment.health_profile.bmi} kg/m²</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px]">Fasting Glucose</span>
                <span className="font-bold text-slate-800">{assessment.health_profile.blood_glucose ? `${assessment.health_profile.blood_glucose} mg/dL` : '—'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px]">Total Cholesterol</span>
                <span className="font-bold text-slate-800">{assessment.health_profile.total_cholesterol ? `${assessment.health_profile.total_cholesterol} mg/dL` : '—'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px]">Serum Creatinine</span>
                <span className="font-bold text-slate-800">{assessment.health_profile.serum_creatinine ? `${assessment.health_profile.serum_creatinine} mg/dL` : '—'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Prediction Results by Disease */}
        <div className="space-y-6">
          {assessment.prediction_results.map((result: PredictionResultItem) => (
            <div
              key={result.disease}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-[#0B2545]">
                    {getDiseaseDisplayName(result.disease)}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Engine: {result.model_version || 'Random Forest Classifier'}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {result.status === 'ok' ? (
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-2xl font-black text-[#0B2545] leading-none block">
                          {result.risk_score !== null && result.risk_score !== undefined
                            ? `${(result.risk_score * 100).toFixed(1)}%`
                            : '—'}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider">Probability</span>
                      </div>
                      <span className={`px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide uppercase border ${
                        result.risk_category === 'High'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : result.risk_category === 'Moderate'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {result.risk_category} Risk (Prototype)
                      </span>
                    </div>
                  ) : (
                    <span className="px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                      {result.status.replace('_', ' ')}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-6">
                {result.status === 'ok' ? (
                  <>
                    {/* Visual Risk Gauge Bar */}
                    <div>
                      <div className="flex justify-between text-xs text-slate-500 mb-2 font-medium">
                        <span>Low Risk (&lt;30%)</span>
                        <span>Moderate Risk (30–60%)</span>
                        <span>High Risk (&gt;60%)</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                        <div className="w-[30%] bg-emerald-300 h-full"></div>
                        <div className="w-[30%] bg-amber-300 h-full"></div>
                        <div className="w-[40%] bg-red-300 h-full"></div>
                      </div>
                      <div className="mt-2 text-[11px] text-slate-400 text-right">
                        Model score: {((result.risk_score || 0) * 100).toFixed(1)}% — Classified as {result.risk_category} Risk
                      </div>
                    </div>

                    {/* Top Contributing Features */}
                    {result.contributing_factors && result.contributing_factors.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingUp className="w-4 h-4 text-teal-600" />
                          <h4 className="text-xs font-bold text-[#0B2545] uppercase tracking-wider">
                            Top Model Decision Factors (Random Forest Feature Importances)
                          </h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {result.contributing_factors.map((factor, idx) => (
                            <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                              <div className="flex items-center justify-between font-semibold text-slate-800 mb-1">
                                <span>{factor.feature}</span>
                                <span className="text-teal-700">{(factor.importance * 100).toFixed(1)}% weight</span>
                              </div>
                              <p className="text-[11px] text-slate-500">
                                {factor.user_value !== null && factor.user_value !== undefined ? (
                                  <span>User reading: <strong>{factor.user_value}</strong></span>
                                ) : (
                                  <span>Imputed via median clinical baseline</span>
                                )}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Rule-Based Preventive Recommendations */}
                    {result.recommendations && result.recommendations.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="w-4 h-4 text-teal-600" />
                          <h4 className="text-xs font-bold text-[#0B2545] uppercase tracking-wider">
                            Rule-Based Preventive Recommendations (Triggered by Your Values)
                          </h4>
                        </div>
                        <div className="space-y-3">
                          {result.recommendations.map((rec, rIdx) => (
                            <div
                              key={rIdx}
                              className="p-4 rounded-xl bg-teal-50/50 border border-teal-100 text-xs text-slate-700"
                            >
                              <div className="font-bold text-[#0B2545] text-sm mb-1">{rec.title}</div>
                              <p className="text-slate-700 mb-2 leading-relaxed">{rec.advice}</p>
                              <div className="text-[11px] text-slate-500 pt-2 border-t border-teal-200/50">
                                <strong>Trigger Rule:</strong> {rec.trigger_rule}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : result.status === 'unavailable' ? (
                  /* Missing Inputs State */
                  <div className="py-6 text-center max-w-md mx-auto">
                    <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                    <h4 className="text-sm font-bold text-[#0B2545] mb-1">Inputs Missing for this Model</h4>
                    <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                      {result.instructions || 'Missing required clinical laboratory measurements to compute an authentic prediction.'}
                    </p>
                    {result.missing_fields && result.missing_fields.length > 0 && (
                      <div className="mb-4 inline-block px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono">
                        Missing: {result.missing_fields.join(', ')}
                      </div>
                    )}
                    <div>
                      {assessment.health_profile && (
                        <Link
                          href={`/health/edit/${assessment.health_profile.id}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-colors"
                        >
                          <FileEdit className="w-3.5 h-3.5" />
                          <span>Add Missing Measurements</span>
                        </Link>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Model Not Trained State */
                  <div className="py-6 text-center max-w-md mx-auto">
                    <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <h4 className="text-sm font-bold text-[#0B2545] mb-1">Model Not Trained</h4>
                    <p className="text-xs text-slate-500 mb-3">
                      {result.instructions || 'Train this model using the local training script.'}
                    </p>
                    <div className="p-2.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-mono mb-4 text-left">
                      python ml/train_{result.disease}.py
                    </div>
                    <Link
                      href="/models"
                      className="text-xs font-semibold text-teal-600 hover:text-teal-700 underline"
                    >
                      View Models & Metrics Page
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Interactive "What-If" Counterfactual Simulation Engine */}
        <WhatIfSimulator profile={assessment.health_profile || null} />
      </div>
    </AppShell>
  );
}
