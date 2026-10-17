'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import { api, EmergencySymptomsResponse, EmergencyMeasurementsResponse, HealthProfile } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import {
  ShieldAlert,
  AlertTriangle,
  PhoneCall,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
  Activity,
  HeartPulse,
  Droplets,
  HelpCircle,
  ArrowRight,
  Hospital,
  CreditCard
} from 'lucide-react';
import EmergencyModal from '@/components/EmergencyModal';
import HospitalLocator from '@/components/HospitalLocator';
import MedicalIdCard from '@/components/MedicalIdCard';
import FirstAidProtocols from '@/components/FirstAidProtocols';

const RED_FLAG_SYMPTOMS = [
  { id: 'chest pain/pressure', label: 'Chest pain, tightness, or radiating pressure to arm/jaw' },
  { id: 'severe breathing difficulty', label: 'Severe shortness of breath or inability to breathe while resting' },
  { id: 'stroke signs (FAST)', label: 'Stroke signs (FAST: Face drooping, Arm weakness, Speech difficulty)' },
  { id: 'loss of consciousness', label: 'Sudden loss of consciousness, fainting, or unresponsiveness' },
  { id: 'severe uncontrolled bleeding', label: 'Severe, uncontrolled bleeding or profuse blood loss' },
];

export default function EmergencyPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<HealthProfile | null>(null);

  // Modal state
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [copied112, setCopied112] = useState(false);

  // Active view tab in emergency hub: 'hospitals' | 'first-aid' | 'triage' | 'medical-id'
  const [emergencySection, setEmergencySection] = useState<'hospitals' | 'first-aid' | 'triage' | 'medical-id'>('hospitals');

  useEffect(() => {
    async function loadProfile() {
      try {
        const prof = await api.getCurrentProfile();
        setProfile(prof);
      } catch (err) {
        console.error('Failed to load profile for emergency card:', err);
      }
    }
    loadProfile();
  }, []);

  // Symptom state
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [symptomResult, setSymptomResult] = useState<EmergencySymptomsResponse | null>(null);
  const [loadingSymptoms, setLoadingSymptoms] = useState(false);

  // Measurement state
  const [systolic, setSystolic] = useState<number | ''>('');
  const [diastolic, setDiastolic] = useState<number | ''>('');
  const [glucose, setGlucose] = useState<number | ''>('');
  const [heartRate, setHeartRate] = useState<number | ''>('');
  const [measureResult, setMeasureResult] = useState<EmergencyMeasurementsResponse | null>(null);
  const [loadingMeasures, setLoadingMeasures] = useState(false);

  const toggleSymptom = (sym: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  };

  const copyToClipboard = (num: string = "112") => {
    navigator.clipboard.writeText(num);
    setCopied112(true);
    setTimeout(() => setCopied112(false), 2500);
  };

  const handleCheckSymptoms = async () => {
    setLoadingSymptoms(true);
    try {
      const res = await api.checkSymptoms(selectedSymptoms);
      setSymptomResult(res);
      if (res.severity === 'emergency') {
        // Automatically surface modal on emergency detection
        setShowEmergencyModal(true);
      }
    } catch (err) {
      console.error('Symptom triage error:', err);
    } finally {
      setLoadingSymptoms(false);
    }
  };

  const handleCheckMeasurements = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingMeasures(true);
    try {
      const res = await api.checkMeasurements({
        systolic_bp: systolic !== '' ? Number(systolic) : null,
        diastolic_bp: diastolic !== '' ? Number(diastolic) : null,
        blood_glucose: glucose !== '' ? Number(glucose) : null,
        heart_rate: heartRate !== '' ? Number(heartRate) : null,
      });
      setMeasureResult(res);
      if (res.severity === 'urgent') {
        setShowEmergencyModal(true);
      }
    } catch (err) {
      console.error('Measurement triage error:', err);
    } finally {
      setLoadingMeasures(false);
    }
  };

  return (
    <AppShell
      title="Emergency Triage & Vital Alerts"
      subtitle="Immediate Red-Flag Symptom Evaluation & Critical Vital Thresholds"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* NON-NEGOTIABLE CRITICAL DISCLAIMER */}
        <div className="p-5 rounded-2xl bg-red-950/90 text-white border-2 border-red-600 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-8 h-8 text-red-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-extrabold text-red-100 tracking-wide">
                  CRITICAL NOTICE: THIS APP DOES NOT CONTACT EMERGENCY SERVICES
                </h3>
                <p className="text-xs text-red-200 mt-1 leading-relaxed">
                  If you or someone around you is in immediate distress, do not wait for online analysis.
                  Call emergency services immediately or proceed to the nearest hospital emergency department.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowEmergencyModal(true)}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs tracking-wider shadow-lg transition-transform hover:scale-105 cursor-pointer"
              >
                <PhoneCall className="w-4 h-4 animate-bounce" />
                <span>CALL / DIAL 112</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
          <button
            type="button"
            onClick={() => setEmergencySection('hospitals')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
              emergencySection === 'hospitals'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Hospital className="w-4 h-4 text-red-600" />
            <span>Nearby 24x7 Trauma Centers</span>
          </button>

          <button
            type="button"
            onClick={() => setEmergencySection('first-aid')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
              emergencySection === 'first-aid'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>First-Aid Action Protocols</span>
          </button>

          <button
            type="button"
            onClick={() => setEmergencySection('triage')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
              emergencySection === 'triage'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-teal-600" />
            <span>Red-Flag Symptom & Vitals Triage</span>
          </button>

          <button
            type="button"
            onClick={() => setEmergencySection('medical-id')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
              emergencySection === 'medical-id'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-4 h-4 text-amber-600" />
            <span>Emergency Medical ID (ICE) Card</span>
          </button>
        </div>

        {/* View Section 1: Hospital Locator */}
        {emergencySection === 'hospitals' && (
          <div>
            <HospitalLocator />
          </div>
        )}

        {/* View Section 2: First-Aid Protocols */}
        {emergencySection === 'first-aid' && (
          <div>
            <FirstAidProtocols />
          </div>
        )}

        {/* View Section 3: Medical ID Card */}
        {emergencySection === 'medical-id' && (
          <div>
            <MedicalIdCard user={user} profile={profile} />
          </div>
        )}

        {/* View Section 3: Symptom & Vitals Triage */}
        {emergencySection === 'triage' && (
          <div className="space-y-8">
            {/* SECTION A: Symptom Evaluation */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-[#0B2545]">Section A: Red-Flag Symptom Checklist</h3>
                  <p className="text-xs text-slate-500">Evaluates high-acuity life threats instantaneously without ML delay</p>
                </div>
                <span className="text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-full uppercase">
                  Immediate Triage
                </span>
              </div>

          <div className="space-y-3 mb-6">
            {RED_FLAG_SYMPTOMS.map((sym) => {
              const checked = selectedSymptoms.includes(sym.id);
              return (
                <label
                  key={sym.id}
                  onClick={() => toggleSymptom(sym.id)}
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    checked
                      ? 'bg-red-50 border-red-300 text-red-950 font-semibold shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {}} // handled by parent label click
                      className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                    />
                    <span className="text-xs sm:text-sm">{sym.label}</span>
                  </div>
                  {checked && <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />}
                </label>
              );
            })}
          </div>

          <button
            onClick={handleCheckSymptoms}
            disabled={loadingSymptoms}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#0B2545] hover:bg-navy-800 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            {loadingSymptoms ? 'Evaluating...' : 'Evaluate Symptoms Checklist'}
          </button>

          {/* Symptom Result Banner */}
          {symptomResult && (
            <div className={`mt-6 p-6 rounded-2xl border ${
              symptomResult.severity === 'emergency'
                ? 'bg-red-50 border-red-300 text-red-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}>
              <div className="flex items-start gap-3">
                {symptomResult.severity === 'emergency' ? (
                  <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                )}
                <div className="space-y-3 flex-1">
                  <div>
                    <h4 className="font-extrabold text-sm uppercase tracking-wide">
                      {symptomResult.message}
                    </h4>
                    <p className="text-xs leading-relaxed mt-1">{symptomResult.disclaimer}</p>
                  </div>

                  <div className="pt-2">
                    <span className="font-bold text-xs block mb-1">Recommended Actions:</span>
                    <ul className="list-disc list-inside text-xs space-y-1">
                      {symptomResult.actions.map((act, idx) => (
                        <li key={idx}>{act}</li>
                      ))}
                    </ul>
                  </div>

                  {symptomResult.severity === 'emergency' && (
                    <div className="pt-3 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setShowEmergencyModal(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                      >
                        <PhoneCall className="w-4 h-4" />
                        <span>Dial 112 Protocol</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => copyToClipboard("112")}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-semibold text-xs shadow-xs cursor-pointer"
                      >
                        {copied112 ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Copied 112!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                            <span>Copy 112 to Dial on Phone</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION B: Measurement Warnings */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-[#0B2545]">Section B: Measurement Urgency Verification</h3>
              <p className="text-xs text-slate-500">
                Checks whether vital signs exceed critical crisis thresholds (e.g. Systolic ≥180 or ≤90, Glucose ≥300 or ≤50)
              </p>
            </div>
            <span className="text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full uppercase">
              Clinical Vitals
            </span>
          </div>

          <form onSubmit={handleCheckMeasurements} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Systolic BP (mmHg)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 185"
                  value={systolic}
                  onChange={(e) => setSystolic(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Urgent: ≥180 or ≤90</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Diastolic BP (mmHg)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 125"
                  value={diastolic}
                  onChange={(e) => setDiastolic(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Urgent: ≥120 or ≤60</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Blood Glucose (mg/dL)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 320"
                  value={glucose}
                  onChange={(e) => setGlucose(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Urgent: ≥300 or ≤50</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Heart Rate (bpm)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 140"
                  value={heartRate}
                  onChange={(e) => setHeartRate(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Urgent: ≥130 or ≤40</span>
              </div>
            </div>

            <div className="flex items-center justify-start pt-2">
              <button
                type="submit"
                disabled={loadingMeasures}
                className="px-6 py-2.5 rounded-xl bg-[#0B2545] hover:bg-navy-800 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                {loadingMeasures ? 'Verifying Vitals...' : 'Verify Measurement Safety'}
              </button>
            </div>
          </form>

          {/* Measurements Check Response */}
          {measureResult && (
            <div className={`mt-6 p-6 rounded-2xl border ${
              measureResult.severity === 'urgent'
                ? 'bg-red-50 border-red-300 text-red-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}>
              <div className="flex items-start gap-3">
                {measureResult.severity === 'urgent' ? (
                  <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                )}
                <div className="space-y-3 flex-1">
                  <div>
                    <h4 className="font-extrabold text-sm uppercase tracking-wide">
                      {measureResult.message}
                    </h4>
                    <p className="text-xs leading-relaxed mt-0.5">{measureResult.disclaimer}</p>
                  </div>

                  {measureResult.alerts.length > 0 && (
                    <div className="space-y-2 pt-2">
                      {measureResult.alerts.map((al, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-white/80 border border-red-200 text-xs">
                          <div className="flex items-center justify-between font-bold text-red-700 mb-1">
                            <span>{al.measurement}: {al.value}</span>
                            <span className="uppercase text-[10px] px-2 py-0.5 rounded-full bg-red-100">
                              {al.status}
                            </span>
                          </div>
                          <p className="text-slate-700 mb-1"><strong>Rule:</strong> {al.rule_triggered}</p>
                          <p className="text-slate-600"><strong>Advice:</strong> {al.advice}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {measureResult.severity === 'urgent' && (
                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setShowEmergencyModal(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Dial 112 Protocol</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => copyToClipboard("112")}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-semibold text-xs shadow-xs cursor-pointer"
                      >
                        {copied112 ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Copied 112!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                            <span>Copy 112</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
      )}
      </div>

      {/* Emergency Protocol Dialog */}
      <EmergencyModal
        isOpen={showEmergencyModal}
        onClose={() => setShowEmergencyModal(false)}
        identifiedSymptoms={symptomResult?.identified_symptoms}
      />
    </AppShell>
  );
}
