'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { api, HealthProfile } from '@/lib/api';
import { Activity, HeartPulse, Droplets, Scale, TrendingUp, Info } from 'lucide-react';

export default function VitalsTrendChart() {
  const [history, setHistory] = useState<HealthProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'bp' | 'glucose' | 'bmi'>('bp');

  useEffect(() => {
    async function loadHistory() {
      try {
        setLoading(true);
        const data = await api.getHealthHistory();
        setHistory(data || []);
      } catch (err) {
        console.error('Failed to load health history:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex items-center justify-center py-16">
        <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-xs text-slate-500 font-medium">Loading longitudinal vitals trends...</span>
      </div>
    );
  }

  // If user has less than 2 entries, render informative empty/single-record state
  if (history.length < 2) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
              <TrendingUp className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Longitudinal Vitals Trends & Time-Series Analytics
              </h3>
              <p className="text-xs text-slate-500">
                Tracking vitals stability and clinical trajectories across checkups
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
            {history.length} Record Logged
          </span>
        </div>

        <div className="py-10 text-center max-w-md mx-auto">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Activity className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-slate-800 mb-1">
            Additional Checkups Needed For Trend Curves
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            You currently have {history.length === 1 ? '1 recorded health entry' : 'no recorded health entries'}.
            As you perform subsequent checkups and save your updated vitals, this graph will automatically plot
            your longitudinal Blood Pressure, Fasting Glucose, and BMI trajectories.
          </p>
        </div>
      </div>
    );
  }

  // Format data for Recharts
  const chartData = history.map((p, idx) => ({
    date: p.measured_on || `Checkup #${idx + 1}`,
    systolic: p.systolic_bp,
    diastolic: p.diastolic_bp,
    glucose: p.blood_glucose !== null ? p.blood_glucose : undefined,
    bmi: p.bmi,
    heartRate: p.heart_rate,
  }));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs mb-8">
      {/* Header with Switcher Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
            <TrendingUp className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Longitudinal Vitals Trends & Trajectories
            </h3>
            <p className="text-xs text-slate-500">
              Comparative time-series tracking across {history.length} recorded checkups
            </p>
          </div>
        </div>

        {/* Metric Selector Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('bp')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'bp'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5 text-rose-600" />
            <span>Blood Pressure</span>
          </button>

          <button
            onClick={() => setActiveTab('glucose')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'glucose'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Droplets className="w-3.5 h-3.5 text-amber-600" />
            <span>Glucose</span>
          </button>

          <button
            onClick={() => setActiveTab('bmi')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'bmi'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-teal-600" />
            <span>BMI</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === 'bp' ? (
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis domain={[50, 200]} tick={{ fontSize: 11, fill: '#64748b' }} unit=" mmHg" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '10px',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <ReferenceLine y={120} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: 'Systolic Normal (120)', fill: '#f43f5e', fontSize: 10 }} />
              <ReferenceLine y={80} stroke="#3b82f6" strokeDasharray="3 3" label={{ value: 'Diastolic Normal (80)', fill: '#3b82f6', fontSize: 10 }} />
              <Line
                type="monotone"
                dataKey="systolic"
                name="Systolic BP"
                stroke="#e11d48"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#e11d48' }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="diastolic"
                name="Diastolic BP"
                stroke="#2563eb"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#2563eb' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          ) : activeTab === 'glucose' ? (
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis domain={[50, 250]} tick={{ fontSize: 11, fill: '#64748b' }} unit=" mg/dL" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '10px',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <ReferenceLine y={100} stroke="#eab308" strokeDasharray="3 3" label={{ value: 'Fasting Normal (<100)', fill: '#ca8a04', fontSize: 10 }} />
              <ReferenceLine y={126} stroke="#dc2626" strokeDasharray="3 3" label={{ value: 'Diabetes Threshold (126)', fill: '#dc2626', fontSize: 10 }} />
              <Line
                type="monotone"
                dataKey="glucose"
                name="Fasting Glucose"
                stroke="#d97706"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#d97706' }}
                connectNulls
              />
            </LineChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis domain={[15, 40]} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '10px',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <ReferenceLine y={25.0} stroke="#f97316" strokeDasharray="3 3" label={{ value: 'Overweight Cutoff (25.0)', fill: '#ea580c', fontSize: 10 }} />
              <ReferenceLine y={18.5} stroke="#0ea5e9" strokeDasharray="3 3" label={{ value: 'Underweight Cutoff (18.5)', fill: '#0284c7', fontSize: 10 }} />
              <Line
                type="monotone"
                dataKey="bmi"
                name="Body Mass Index (BMI)"
                stroke="#0d9488"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#0d9488' }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Reference dashed lines indicate standard clinical guidelines.</span>
        </span>
        <span>Dates ordered chronologically</span>
      </div>
    </div>
  );
}
