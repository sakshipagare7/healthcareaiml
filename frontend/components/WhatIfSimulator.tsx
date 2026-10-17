'use client';

import React, { useState, useEffect } from 'react';
import {
  api,
  HealthProfile,
  CounterfactualSimulationResponse,
  DiseaseSimulationComparison
} from '@/lib/api';
import {
  Sliders,
  Sparkles,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertCircle,
  HeartPulse,
  Droplets,
  Scale,
  Activity,
  ArrowRight
} from 'lucide-react';

interface WhatIfSimulatorProps {
  profile?: HealthProfile | null;
}

export default function WhatIfSimulator({ profile }: WhatIfSimulatorProps) {
  // Slider states
  const [simBmi, setSimBmi] = useState<number>(profile?.bmi || 25.0);
  const [simSystolic, setSimSystolic] = useState<number>(profile?.systolic_bp || 120);
  const [simDiastolic, setSimDiastolic] = useState<number>(profile?.diastolic_bp || 80);
  const [simGlucose, setSimGlucose] = useState<number>(profile?.blood_glucose || 100);
  const [simCholesterol, setSimCholesterol] = useState<number>(profile?.total_cholesterol || 190);
  const [simSmoking, setSimSmoking] = useState<string>(profile?.smoking_status || 'never');
  const [simActivity, setSimActivity] = useState<string>(profile?.physical_activity || 'moderate');

  // Simulation response state
  const [simulation, setSimulation] = useState<CounterfactualSimulationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setSimBmi(profile.bmi);
      setSimSystolic(profile.systolic_bp);
      setSimDiastolic(profile.diastolic_bp);
      if (profile.blood_glucose) setSimGlucose(profile.blood_glucose);
      if (profile.total_cholesterol) setSimCholesterol(profile.total_cholesterol);
      if (profile.smoking_status) setSimSmoking(profile.smoking_status);
      if (profile.physical_activity) setSimActivity(profile.physical_activity);

      // Run initial baseline comparison
      runSimulation({
        health_profile_id: profile.id,
        simulated_bmi: profile.bmi,
        simulated_systolic_bp: profile.systolic_bp,
        simulated_diastolic_bp: profile.diastolic_bp,
        simulated_blood_glucose: profile.blood_glucose || undefined,
        simulated_total_cholesterol: profile.total_cholesterol || undefined,
        simulated_smoking_status: profile.smoking_status || 'never',
        simulated_physical_activity: profile.physical_activity || 'moderate',
      });
    }
  }, [profile?.id]);

  const runSimulation = async (overrideParams?: any) => {
    if (!profile) return;
    setLoading(true);
    setError(null);
    try {
      const payload = overrideParams || {
        health_profile_id: profile.id,
        simulated_bmi: Number(simBmi),
        simulated_systolic_bp: Number(simSystolic),
        simulated_diastolic_bp: Number(simDiastolic),
        simulated_blood_glucose: Number(simGlucose),
        simulated_total_cholesterol: Number(simCholesterol),
        simulated_smoking_status: simSmoking,
        simulated_physical_activity: simActivity,
      };
      const res = await api.simulateRisk(payload);
      setSimulation(res);
    } catch (err: any) {
      console.error('Simulation error:', err);
      setError(err.message || 'Simulation failed.');
    } finally {
      setLoading(false);
    }
  };

  const applyPresetOptimal = () => {
    setSimBmi(22.5);
    setSimSystolic(118);
    setSimDiastolic(76);
    setSimGlucose(90);
    setSimCholesterol(175);
    setSimSmoking('never');
    setSimActivity('active');

    runSimulation({
      health_profile_id: profile?.id,
      simulated_bmi: 22.5,
      simulated_systolic_bp: 118,
      simulated_diastolic_bp: 76,
      simulated_blood_glucose: 90,
      simulated_total_cholesterol: 175,
      simulated_smoking_status: 'never',
      simulated_physical_activity: 'active',
    });
  };

  const applyPresetModerate = () => {
    const targetBmi = profile ? Math.max(24.0, Math.round(profile.bmi * 0.9 * 10) / 10) : 24.0;
    const targetSys = profile ? Math.max(122, profile.systolic_bp - 15) : 122;
    const targetDia = profile ? Math.max(78, profile.diastolic_bp - 8) : 78;
    const targetGlu = profile?.blood_glucose ? Math.max(98, profile.blood_glucose - 20) : 100;

    setSimBmi(targetBmi);
    setSimSystolic(targetSys);
    setSimDiastolic(targetDia);
    setSimGlucose(targetGlu);

    runSimulation({
      health_profile_id: profile?.id,
      simulated_bmi: targetBmi,
      simulated_systolic_bp: targetSys,
      simulated_diastolic_bp: targetDia,
      simulated_blood_glucose: targetGlu,
      simulated_total_cholesterol: simCholesterol,
      simulated_smoking_status: simSmoking,
      simulated_physical_activity: 'moderate',
    });
  };

  const resetToBaseline = () => {
    if (!profile) return;
    setSimBmi(profile.bmi);
    setSimSystolic(profile.systolic_bp);
    setSimDiastolic(profile.diastolic_bp);
    setSimGlucose(profile.blood_glucose || 100);
    setSimCholesterol(profile.total_cholesterol || 190);
    setSimSmoking(profile.smoking_status || 'never');
    setSimActivity(profile.physical_activity || 'moderate');

    runSimulation({
      health_profile_id: profile.id,
      simulated_bmi: profile.bmi,
      simulated_systolic_bp: profile.systolic_bp,
      simulated_diastolic_bp: profile.diastolic_bp,
      simulated_blood_glucose: profile.blood_glucose || undefined,
      simulated_total_cholesterol: profile.total_cholesterol || undefined,
      simulated_smoking_status: profile.smoking_status || 'never',
      simulated_physical_activity: profile.physical_activity || 'moderate',
    });
  };

  if (!profile) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 mb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#0B2545]">
                &quot;What-If&quot; Lifestyle & Vital Risk Simulator
              </h3>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
                Counterfactual XAI
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Interactive counterfactual explainability: adjust hypothetical vitals to compute real Random Forest risk reduction deltas
            </p>
          </div>
        </div>

        {/* Preset Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={applyPresetOptimal}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            <span>Optimal Targets</span>
          </button>

          <button
            onClick={applyPresetModerate}
            className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <TrendingDown className="w-3.5 h-3.5 text-teal-600" />
            <span>Moderate -10%</span>
          </button>

          <button
            onClick={resetToBaseline}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3 text-slate-500" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Simulator Layout: Sliders (Left) & Risk Deltas (Right) */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders Panel */}
        <div className="lg:col-span-6 space-y-4 bg-slate-50/70 p-5 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Hypothetical Vital & Lifestyle Sliders
            </h4>
            <span className="text-[11px] text-slate-500">Live Simulation</span>
          </div>

          {/* BMI Slider */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-teal-600" />
                <span>Simulated BMI</span>
              </span>
              <span className="font-mono font-bold text-slate-900">
                {simBmi} kg/m²
                <span className="text-slate-400 font-normal ml-1">(Baseline: {profile.bmi})</span>
              </span>
            </div>
            <input
              type="range"
              min="18.0"
              max="38.0"
              step="0.5"
              value={simBmi}
              onChange={(e) => setSimBmi(Number(e.target.value))}
              onMouseUp={() => runSimulation()}
              onTouchEnd={() => runSimulation()}
              className="w-full accent-teal-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Blood Pressure Slider */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <HeartPulse className="w-3.5 h-3.5 text-rose-600" />
                <span>Systolic Blood Pressure</span>
              </span>
              <span className="font-mono font-bold text-slate-900">
                {simSystolic} mmHg
                <span className="text-slate-400 font-normal ml-1">(Baseline: {profile.systolic_bp})</span>
              </span>
            </div>
            <input
              type="range"
              min="95"
              max="180"
              step="2"
              value={simSystolic}
              onChange={(e) => setSimSystolic(Number(e.target.value))}
              onMouseUp={() => runSimulation()}
              onTouchEnd={() => runSimulation()}
              className="w-full accent-rose-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Diastolic BP Slider */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-semibold text-slate-700">Diastolic Blood Pressure</span>
              <span className="font-mono font-bold text-slate-900">
                {simDiastolic} mmHg
                <span className="text-slate-400 font-normal ml-1">(Baseline: {profile.diastolic_bp})</span>
              </span>
            </div>
            <input
              type="range"
              min="60"
              max="115"
              step="1"
              value={simDiastolic}
              onChange={(e) => setSimDiastolic(Number(e.target.value))}
              onMouseUp={() => runSimulation()}
              onTouchEnd={() => runSimulation()}
              className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Fasting Glucose Slider */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-amber-600" />
                <span>Fasting Blood Glucose</span>
              </span>
              <span className="font-mono font-bold text-slate-900">
                {simGlucose} mg/dL
                <span className="text-slate-400 font-normal ml-1">
                  (Baseline: {profile.blood_glucose || 'N/A'})
                </span>
              </span>
            </div>
            <input
              type="range"
              min="70"
              max="240"
              step="5"
              value={simGlucose}
              onChange={(e) => setSimGlucose(Number(e.target.value))}
              onMouseUp={() => runSimulation()}
              onTouchEnd={() => runSimulation()}
              className="w-full accent-amber-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Trigger button */}
          <div className="pt-2">
            <button
              onClick={() => runSimulation()}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Evaluating Model Ensembles...' : 'Re-calculate Model Counterfactuals'}</span>
            </button>
          </div>
        </div>

        {/* Real-Time Risk Deltas Output Panel */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Simulated Risk Outcomes & Deltas
            </h4>
            <span className="text-[11px] text-purple-700 font-semibold">Random Forest Ensembles</span>
          </div>

          {simulation?.comparisons.map((comp) => {
            const hasDelta = comp.risk_delta !== null && comp.risk_delta !== undefined;
            const isReduction = hasDelta && comp.risk_delta! < -0.01;
            const isElevation = hasDelta && comp.risk_delta! > 0.01;

            return (
              <div
                key={comp.disease}
                className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs transition-all hover:border-purple-300"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{comp.display_name}</h5>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>
                        Baseline: <strong>{comp.baseline_risk !== null ? `${(comp.baseline_risk * 100).toFixed(1)}%` : '—'}</strong>
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span>
                        Simulated: <strong>{comp.simulated_risk !== null ? `${(comp.simulated_risk * 100).toFixed(1)}%` : '—'}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Delta Badge */}
                  {hasDelta && (
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black ${
                        isReduction
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : isElevation
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {isReduction && <TrendingDown className="w-3.5 h-3.5 text-emerald-700" />}
                      {isElevation && <TrendingUp className="w-3.5 h-3.5 text-rose-700" />}
                      <span>
                        {comp.risk_delta! > 0 ? '+' : ''}
                        {(comp.risk_delta! * 100).toFixed(1)}%
                      </span>
                    </span>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-700">Driver: </span>
                  {comp.key_driver}
                </div>
              </div>
            );
          })}

          {simulation?.overall_summary && (
            <div className="p-3 rounded-xl bg-purple-50/80 border border-purple-200 text-xs text-purple-900 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
              <span>{simulation.overall_summary}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
