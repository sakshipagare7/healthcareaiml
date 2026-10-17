'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import { api, ModelStatusSummary, ModelMetricsSummary, SingleModelMetrics } from '@/lib/api';
import {
  Cpu,
  CheckCircle2,
  AlertCircle,
  Database,
  BarChart3,
  Layers,
  Loader2,
  Code2,
  Info,
  TrendingUp
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function ModelsPerformancePage() {
  const [statuses, setStatuses] = useState<ModelStatusSummary | null>(null);
  const [metrics, setMetrics] = useState<ModelMetricsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadModelsData() {
      try {
        setLoading(true);
        const [stat, met] = await Promise.all([
          api.getModelsStatus(),
          api.getModelsMetrics()
        ]);
        setStatuses(stat);
        setMetrics(met);
      } catch (err: any) {
        setError(err.message || 'Failed to load machine learning models data');
      } finally {
        setLoading(false);
      }
    }
    loadModelsData();
  }, []);

  return (
    <AppShell
      title="Machine Learning Models & Metrics"
      subtitle="Evaluated Strictly on Unseen Holdout Test Folds Without Data Leakage"
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Academic Note */}
        <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 flex items-start gap-3">
          <Info className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
          <div className="text-xs text-teal-900 leading-relaxed space-y-1">
            <p className="font-bold">Evaluation Protocol & Viva Context:</p>
            <p className="text-teal-800">
              In this system, all imputers, scalers, and Random Forest classifiers are fit <strong>strictly on training folds (80%)</strong>.
              The metrics displayed below (Accuracy, Precision, Recall, F1, ROC-AUC) were computed on holdout test sets (20%) only.
              No synthetic, fake, or pre-canned metrics are used.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600 mb-3" />
            <p className="text-xs text-slate-500 font-medium">Loading ML model metrics and feature importances...</p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs">
            {error}
          </div>
        ) : (
          <div className="space-y-8">
            {statuses && Object.entries(statuses.models).map(([key, modelStatus]) => {
              const modelMet = metrics?.metrics[key] as (SingleModelMetrics | undefined);
              const isTrained = modelStatus.is_trained && modelMet && modelMet.accuracy !== undefined;

              // Prepare feature importances data for chart
              const chartData = isTrained && modelMet.feature_importances
                ? Object.entries(modelMet.feature_importances)
                    .map(([name, imp]) => ({ name, importance: Math.round(imp * 1000) / 10 }))
                    .sort((a, b) => b.importance - a.importance)
                    .slice(0, 8)
                : [];

              return (
                <div
                  key={key}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Cpu className="w-5 h-5 text-[#0B2545]" />
                        <h3 className="text-base font-bold text-[#0B2545]">
                          {modelStatus.display_name}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500">
                        Benchmark: <strong>{modelStatus.dataset_name}</strong> | Algorithm: Random Forest (Scikit-Learn)
                      </p>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                      isTrained
                        ? 'bg-teal-50 text-teal-800 border-teal-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {isTrained ? 'Trained & Operational' : 'Not Trained'}
                    </span>
                  </div>

                  <div className="p-6 space-y-6">
                    {isTrained ? (
                      <>
                        {/* Metrics Badges Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                              Accuracy
                            </span>
                            <span className="text-xl font-black text-[#0B2545]">
                              {(modelMet.accuracy * 100).toFixed(1)}%
                            </span>
                          </div>

                          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                              Precision
                            </span>
                            <span className="text-xl font-black text-[#0B2545]">
                              {(modelMet.precision * 100).toFixed(1)}%
                            </span>
                          </div>

                          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                              Recall
                            </span>
                            <span className="text-xl font-black text-[#0B2545]">
                              {(modelMet.recall * 100).toFixed(1)}%
                            </span>
                          </div>

                          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                              F1 Score
                            </span>
                            <span className="text-xl font-black text-[#0B2545]">
                              {(modelMet.f1 * 100).toFixed(1)}%
                            </span>
                          </div>

                          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center col-span-2 sm:col-span-1">
                            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                              ROC-AUC
                            </span>
                            <span className="text-xl font-black text-teal-600">
                              {modelMet.roc_auc ? (modelMet.roc_auc * 100).toFixed(1) + '%' : 'N/A'}
                            </span>
                          </div>
                        </div>

                        {/* Holdout Samples Info */}
                        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 py-2 border-y border-slate-100">
                          <div>
                            Dataset split: <strong>{modelMet.train_samples}</strong> train / <strong>{modelMet.test_samples}</strong> holdout test samples
                          </div>
                          <div>
                            Trained at: {new Date(modelMet.trained_at).toLocaleString()}
                          </div>
                        </div>

                        {/* Feature Importance Breakdown */}
                        {chartData.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <TrendingUp className="w-4 h-4 text-teal-600" />
                              <h4 className="text-xs font-bold text-[#0B2545] uppercase tracking-wider">
                                Top Feature Importances (Random Forest Gini Impurity Reduction)
                              </h4>
                            </div>

                            <div className="h-60 w-full pt-2">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                  <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" />
                                  <YAxis tick={{ fontSize: 11 }} unit="%" />
                                  <Tooltip
                                    formatter={(val: any) => [`${val}%`, 'Importance Weight']}
                                    contentStyle={{ backgroundColor: '#0B2545', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                                  />
                                  <Bar dataKey="importance" fill="#14B8A6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      /* Not Trained State */
                      <div className="py-6 text-center max-w-md mx-auto">
                        <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                        <h4 className="text-sm font-bold text-[#0B2545] mb-1">Model Pipeline Not Trained</h4>
                        <p className="text-xs text-slate-500 mb-3">
                          {modelStatus.instructions || 'Run the training script in PowerShell to fit the Random Forest pipeline.'}
                        </p>
                        <div className="p-3 rounded-xl bg-slate-100 text-slate-800 text-xs font-mono text-left">
                          python ml/train_{key}.py
                        </div>
                      </div>
                    )}

                    {/* Features Contract */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <div className="font-semibold text-slate-700 mb-1">Input Feature Mapping Contract:</div>
                      <div className="text-slate-600 mb-1">
                        <strong>Required health inputs:</strong> {modelStatus.required_features.join(', ')}
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        Unentered optional fields are safely imputed using training-fold medians inside Scikit-Learn Pipelines.
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
