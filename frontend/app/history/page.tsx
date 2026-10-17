'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import { api, Assessment, HealthProfile } from '@/lib/api';
import {
  History,
  Activity,
  Calendar,
  ChevronRight,
  Loader2,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileText,
  HeartPulse,
  Droplets,
  Scale,
  Trash2,
  FileEdit,
  Filter,
  ArrowUpDown,
  AlertTriangle,
  AlertCircle,
  PlusCircle,
  CheckCircle2
} from 'lucide-react';
import VitalsTrendChart from '@/components/VitalsTrendChart';

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState<'assessments' | 'vitals'>('vitals');
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [healthProfiles, setHealthProfiles] = useState<HealthProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Vitals filter and sort
  const [filterType, setFilterType] = useState<'all' | 'bp' | 'glucose' | 'bmi' | 'labs'>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Deletion modal state
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [assessList, profilesList] = await Promise.all([
        api.getAssessments().catch(() => []),
        api.getHealthHistory().catch(() => []),
      ]);
      setAssessments(assessList || []);
      setHealthProfiles(profilesList || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load historical health records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteProfile = async () => {
    if (!deletingId) return;
    try {
      setDeleting(true);
      await api.deleteProfile(deletingId);
      setDeleteSuccessMsg(`Health record #${deletingId} was successfully deleted.`);
      setTimeout(() => setDeleteSuccessMsg(null), 4000);
      setDeletingId(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete health record.');
    } finally {
      setDeleting(false);
    }
  };

  // Filtered and sorted health profiles
  const filteredProfiles = healthProfiles.filter((p) => {
    if (filterType === 'bp') return p.systolic_bp && p.diastolic_bp;
    if (filterType === 'glucose') return p.blood_glucose !== null && p.blood_glucose !== undefined;
    if (filterType === 'bmi') return p.bmi;
    if (filterType === 'labs') return p.serum_creatinine || p.total_cholesterol || p.blood_urea;
    return true;
  });

  filteredProfiles.sort((a, b) => {
    const timeA = new Date(a.measured_on || a.created_at).getTime();
    const timeB = new Date(b.measured_on || b.created_at).getTime();
    return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
  });

  // Clinical helper
  const getBpPill = (sys: number, dia: number) => {
    if (sys >= 180 || dia >= 120) return { label: 'Hypertensive Crisis (Urgent)', color: 'bg-red-50 text-red-700 border-red-200' };
    if (sys >= 140 || dia >= 90) return { label: 'Stage 2 Hypertension', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    if (sys >= 130 || dia >= 80) return { label: 'Stage 1 Hypertension', color: 'bg-amber-50 text-amber-600 border-amber-200' };
    return { label: 'Normal BP', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  };

  const getGlucosePill = (val: number | null | undefined) => {
    if (val === null || val === undefined) return null;
    if (val >= 126) return { label: 'Diabetes Range (≥126 mg/dL)', color: 'bg-red-50 text-red-700 border-red-200' };
    if (val >= 100) return { label: 'Impaired Fasting (100–125)', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    return { label: 'Normal Fasting (<100 mg/dL)', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  };

  return (
    <AppShell
      title="Historical Health Records & Assessments"
      subtitle="Track your clinical measurements, audit changes, and inspect trends over time"
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Switcher Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('vitals')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                activeTab === 'vitals'
                  ? 'bg-[#0B2545] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <HeartPulse className="w-4 h-4 text-teal-400" />
              <span>Vitals & Clinical Measurements ({healthProfiles.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('assessments')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                activeTab === 'assessments'
                  ? 'bg-[#0B2545] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Activity className="w-4 h-4 text-teal-400" />
              <span>AI Risk Assessments ({assessments.length})</span>
            </button>
          </div>

          <Link
            href="/health/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Add New Reading</span>
          </Link>
        </div>

        {deleteSuccessMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{deleteSuccessMsg}</span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-200">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600 mb-3" />
            <p className="text-xs text-slate-500 font-medium">Loading historical archives...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : activeTab === 'vitals' ? (
          /* TAB 1: HEALTH MEASUREMENTS HISTORY */
          <div className="space-y-6">
            {/* Filter & Sort Controls */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-slate-500 font-semibold flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <span>Filter:</span>
                </span>
                {(
                  [
                    { key: 'all', label: 'All Readings' },
                    { key: 'bp', label: 'Blood Pressure' },
                    { key: 'glucose', label: 'Blood Glucose' },
                    { key: 'bmi', label: 'Body Mass (BMI)' },
                    { key: 'labs', label: 'Lab Tests' },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setFilterType(f.key)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                      filterType === f.key
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                <span>Date: {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
              </button>
            </div>

            {/* Records List */}
            {filteredProfiles.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-12 text-center max-w-lg mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 border border-teal-200 flex items-center justify-center mx-auto mb-4">
                  <HeartPulse className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-[#0B2545] mb-2">No Health Readings Found</h3>
                <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                  {filterType === 'all'
                    ? 'You have not logged any health readings yet. Record your vitals to begin tracking stability and trends.'
                    : `No records found matching the "${filterType}" filter.`}
                </p>
                <Link
                  href="/health/new"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B2545] hover:bg-navy-800 text-white font-semibold text-xs shadow-xs transition-colors"
                >
                  <PlusCircle className="w-4 h-4 text-teal-400" />
                  <span>Enter First Reading</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                  <span>Showing <strong>{filteredProfiles.length}</strong> recorded health checkups</span>
                  <span>Strictly isolated under user ID #{healthProfiles[0]?.user_id}</span>
                </div>

                <div className="space-y-3">
                  {filteredProfiles.map((p) => {
                    const bpPill = getBpPill(p.systolic_bp, p.diastolic_bp);
                    const gluPill = getGlucosePill(p.blood_glucose);

                    return (
                      <div
                        key={p.id}
                        className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="font-extrabold text-[#0B2545] text-sm">
                              Checkup #{p.id}
                            </span>
                            <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{p.measured_on || 'Date not recorded'}</span>
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${bpPill.color}`}>
                              {bpPill.label}
                            </span>
                            {gluPill && (
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${gluPill.color}`}>
                                {gluPill.label}
                              </span>
                            )}
                          </div>

                          {/* Vital Sign Numbers Grid */}
                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-700">
                            <div>
                              <span className="text-slate-400 block text-[10px] font-semibold">Blood Pressure</span>
                              <span className="font-bold text-[#0B2545] text-sm">{p.systolic_bp} / {p.diastolic_bp} mmHg</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px] font-semibold">Heart Rate</span>
                              <span className="font-bold text-[#0B2545] text-sm">{p.heart_rate} bpm</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px] font-semibold">Computed BMI</span>
                              <span className="font-bold text-[#0B2545] text-sm">{p.bmi} kg/m²</span>
                            </div>
                            {p.blood_glucose !== null && p.blood_glucose !== undefined && (
                              <div>
                                <span className="text-slate-400 block text-[10px] font-semibold">Blood Glucose</span>
                                <span className="font-bold text-amber-700 text-sm">{p.blood_glucose} mg/dL</span>
                              </div>
                            )}
                            {p.serum_creatinine && (
                              <div>
                                <span className="text-slate-400 block text-[10px] font-semibold">Creatinine</span>
                                <span className="font-bold text-slate-800 text-sm">{p.serum_creatinine} mg/dL</span>
                              </div>
                            )}
                            {p.total_cholesterol && (
                              <div>
                                <span className="text-slate-400 block text-[10px] font-semibold">Cholesterol</span>
                                <span className="font-bold text-slate-800 text-sm">{p.total_cholesterol} mg/dL</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                          <Link
                            href={`/health/edit/${p.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                          >
                            <FileEdit className="w-3.5 h-3.5 text-slate-600" />
                            <span>Edit</span>
                          </Link>

                          <button
                            type="button"
                            onClick={() => setDeletingId(p.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-semibold text-xs transition-colors cursor-pointer"
                            title="Delete this record"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-600" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Embedded Longitudinal Chart Section */}
            <VitalsTrendChart />
          </div>
        ) : (
          /* TAB 2: AI RISK ASSESSMENTS HISTORY */
          <div className="space-y-4">
            {assessments.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-12 text-center max-w-lg mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 border border-teal-200 flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-[#0B2545] mb-2">No Historical Assessments</h3>
                <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                  You haven&apos;t run any disease assessments yet. When you run an assessment, an immutable archive record is generated here for longitudinal risk comparison.
                </p>
                <Link
                  href="/prediction"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B2545] hover:bg-navy-800 text-white font-semibold text-xs shadow-xs transition-colors"
                >
                  <Activity className="w-4 h-4 text-teal-400" />
                  <span>Run Initial AI Assessment</span>
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
                {assessments.map((a) => {
                  const dateStr = new Date(a.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <Link
                      key={a.id}
                      href={`/prediction/results/${a.id}`}
                      className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors group"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-[#0B2545] text-sm group-hover:text-teal-600 transition-colors">
                            Assessment #{a.id}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{dateStr}</span>
                          </span>
                        </div>

                        {/* Pill badges for diseases */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {a.prediction_results?.map((r) => (
                            <span
                              key={r.disease}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${
                                r.status === 'ok'
                                  ? r.risk_category === 'High'
                                    ? 'bg-red-50 text-red-700 border-red-200'
                                    : r.risk_category === 'Moderate'
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-slate-100 text-slate-500 border-slate-200'
                              }`}
                            >
                              <span className="capitalize">{r.disease}: </span>
                              <strong>
                                {r.status === 'ok'
                                  ? `${r.risk_category} (${((r.risk_score || 0) * 100).toFixed(0)}%)`
                                  : r.status.replace('_', ' ')}
                              </strong>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-semibold text-teal-600 shrink-0">
                        <span>View Breakdown</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-200 animate-in fade-in zoom-in duration-150">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-center text-slate-900 mb-2">
              Delete Health Checkup #{deletingId}?
            </h3>
            <p className="text-xs text-slate-600 text-center mb-6 leading-relaxed">
              Are you sure you want to delete this recorded health measurement? Past historical assessments based on this record will remain safely archived.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteProfile}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Record</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
