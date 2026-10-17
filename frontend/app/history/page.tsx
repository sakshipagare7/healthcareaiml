'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import { api, Assessment } from '@/lib/api';
import {
  History,
  Activity,
  Calendar,
  ChevronRight,
  Loader2,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileText
} from 'lucide-react';

export default function HistoryPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadHistory() {
      try {
        setLoading(true);
        const data = await api.getAssessments();
        setAssessments(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load assessment history');
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  return (
    <AppShell
      title="Assessment History"
      subtitle="Immutable Historical Records of Your AI Health Evaluations"
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600 mb-3" />
            <p className="text-xs text-slate-500 font-medium">Loading assessment archives...</p>
          </div>
        ) : assessments.length === 0 ? (
          /* Empty History State */
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-12 text-center max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 border border-teal-200 flex items-center justify-center mx-auto mb-4">
              <History className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-[#0B2545] mb-2">No Historical Assessments</h3>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              You haven&apos;t run any health assessments yet. Whenever you execute an assessment, an immutable record is permanently archived here for longitudinal tracking.
            </p>
            <Link
              href="/prediction"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B2545] hover:bg-navy-800 text-white font-semibold text-xs shadow-xs transition-colors"
            >
              <Activity className="w-4 h-4 text-teal-400" />
              <span>Run First AI Assessment</span>
            </Link>
          </div>
        ) : (
          /* List of Historical Assessments */
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>Found <strong>{assessments.length}</strong> archived assessments</span>
              <span>All records cryptographically tied to your user ID</span>
            </div>

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
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{dateStr}</span>
                        </span>
                      </div>

                      {/* Pill badges for diseases */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {a.prediction_results.map((r) => (
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
                      <span>View Full Breakdown</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
