'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { api } from '@/lib/api';
import {
  HeartPulse,
  Scale,
  Activity,
  Droplets,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Info
} from 'lucide-react';

export default function NewHealthProfilePage() {
  const router = useRouter();

  // Form State
  const [age, setAge] = useState<number | ''>('');
  const [sex, setSex] = useState<'male' | 'female' | 'other'>('male');
  const [heightCm, setHeightCm] = useState<number | ''>('');
  const [weightKg, setWeightKg] = useState<number | ''>('');
  const [systolicBp, setSystolicBp] = useState<number | ''>('');
  const [diastolicBp, setDiastolicBp] = useState<number | ''>('');
  const [heartRate, setHeartRate] = useState<number | ''>('');
  const [measuredOn, setMeasuredOn] = useState<string>(new Date().toISOString().split('T')[0]);

  // Optional Clinical Measurements
  const [bloodGlucose, setBloodGlucose] = useState<number | ''>('');
  const [hba1c, setHba1c] = useState<number | ''>('');
  const [serumCreatinine, setSerumCreatinine] = useState<number | ''>('');
  const [bloodUrea, setBloodUrea] = useState<number | ''>('');
  const [totalCholesterol, setTotalCholesterol] = useState<number | ''>('');
  const [hdl, setHdl] = useState<number | ''>('');
  const [ldl, setLdl] = useState<number | ''>('');

  // Optional Lifestyle & History
  const [smokingStatus, setSmokingStatus] = useState<string>('never');
  const [physicalActivity, setPhysicalActivity] = useState<string>('moderate');
  const [familyDiabetes, setFamilyDiabetes] = useState<boolean>(false);
  const [familyKidney, setFamilyKidney] = useState<boolean>(false);
  const [familyCardio, setFamilyCardio] = useState<boolean>(false);
  const [symptoms, setSymptoms] = useState<string>('');

  // Emergency Medical ID & ICE State
  const [bloodGroup, setBloodGroup] = useState<string>('');
  const [allergies, setAllergies] = useState<string>('');
  const [emergencyName, setEmergencyName] = useState<string>('');
  const [emergencyPhone, setEmergencyPhone] = useState<string>('');
  const [emergencyRelation, setEmergencyRelation] = useState<string>('');

  // UI state
  const [liveBmi, setLiveBmi] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Live BMI calculation
  useEffect(() => {
    if (typeof heightCm === 'number' && heightCm > 0 && typeof weightKg === 'number' && weightKg > 0) {
      const heightM = heightCm / 100.0;
      const bmiCalc = Math.round((weightKg / (heightM * heightM)) * 10) / 10;
      setLiveBmi(bmiCalc);
    } else {
      setLiveBmi(null);
    }
  }, [heightCm, weightKg]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic range validation
    if (!age || age < 1 || age > 120) {
      setError('Age must be between 1 and 120 years.');
      return;
    }
    if (!heightCm || heightCm < 50 || heightCm > 250) {
      setError('Height must be between 50 and 250 cm.');
      return;
    }
    if (!weightKg || weightKg < 10 || weightKg > 400) {
      setError('Weight must be between 10 and 400 kg.');
      return;
    }
    if (!systolicBp || systolicBp < 40 || systolicBp > 300) {
      setError('Systolic BP must be between 40 and 300 mmHg.');
      return;
    }
    if (!diastolicBp || diastolicBp < 40 || diastolicBp > 300) {
      setError('Diastolic BP must be between 40 and 300 mmHg.');
      return;
    }
    if (!heartRate || heartRate < 30 || heartRate > 250) {
      setError('Resting Heart Rate must be between 30 and 250 bpm.');
      return;
    }

    setLoading(true);

    const payload = {
      age: Number(age),
      sex,
      height_cm: Number(heightCm),
      weight_kg: Number(weightKg),
      systolic_bp: Number(systolicBp),
      diastolic_bp: Number(diastolicBp),
      heart_rate: Number(heartRate),
      measured_on: measuredOn,

      // Stored as null if empty, NEVER 0
      blood_glucose: bloodGlucose !== '' ? Number(bloodGlucose) : null,
      hba1c: hba1c !== '' ? Number(hba1c) : null,
      serum_creatinine: serumCreatinine !== '' ? Number(serumCreatinine) : null,
      blood_urea: bloodUrea !== '' ? Number(bloodUrea) : null,
      total_cholesterol: totalCholesterol !== '' ? Number(totalCholesterol) : null,
      hdl: hdl !== '' ? Number(hdl) : null,
      ldl: ldl !== '' ? Number(ldl) : null,

      smoking_status: smokingStatus,
      physical_activity: physicalActivity,
      family_history_diabetes: familyDiabetes,
      family_history_kidney: familyKidney,
      family_history_cardio: familyCardio,
      symptoms: symptoms.trim() || null,

      blood_group: bloodGroup || null,
      allergies: allergies.trim() || null,
      emergency_contact_name: emergencyName.trim() || null,
      emergency_contact_phone: emergencyPhone.trim() || null,
      emergency_contact_relation: emergencyRelation.trim() || null,
    };

    try {
      await api.createProfile(payload);
      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to save health information. Please check all fields.');
      setLoading(false);
    }
  };

  return (
    <AppShell
      title="Enter Health Information"
      subtitle="Manual Vitals & Clinical Laboratory Entry"
    >
      <div className="max-w-4xl mx-auto">
        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs text-red-700 font-medium">{error}</div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="text-xs text-emerald-800 font-semibold">
              Health profile saved successfully! Redirecting to dashboard...
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECTION 1: Required Core Vitals */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-[#0B2545]">Core Vital Signs</h3>
              </div>
              <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                Required Fields
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Age (years) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  required
                  placeholder="e.g. 45"
                  value={age}
                  onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Biological Sex <span className="text-red-500">*</span>
                </label>
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 bg-white"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Height (cm) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="50"
                  max="250"
                  step="0.1"
                  required
                  placeholder="e.g. 175"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Weight (kg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="10"
                  max="400"
                  step="0.1"
                  required
                  placeholder="e.g. 72"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                />
              </div>
            </div>

            {/* Live BMI Banner */}
            <div className="mt-4 p-3.5 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-teal-700" />
                <span className="text-xs font-semibold text-teal-900">Live Computed BMI:</span>
              </div>
              <div className="text-sm font-bold text-teal-800">
                {liveBmi !== null ? `${liveBmi} kg/m²` : <span className="text-slate-400 font-normal">Enter height & weight</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Systolic BP (mmHg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="40"
                  max="300"
                  required
                  placeholder="e.g. 120"
                  value={systolicBp}
                  onChange={(e) => setSystolicBp(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Upper blood pressure reading</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Diastolic BP (mmHg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="40"
                  max="300"
                  required
                  placeholder="e.g. 80"
                  value={diastolicBp}
                  onChange={(e) => setDiastolicBp(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Lower blood pressure reading</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Resting Heart Rate (bpm) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="30"
                  max="250"
                  required
                  placeholder="e.g. 72"
                  value={heartRate}
                  onChange={(e) => setHeartRate(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Pulse rate in beats per minute</span>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date of Measurement <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={measuredOn}
                onChange={(e) => setMeasuredOn(e.target.value)}
                className="w-full sm:w-64 px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
              />
            </div>
          </div>

          {/* SECTION 2: Optional Clinical Lab Tests */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-[#0B2545]">Laboratory Tests</h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                Optional (Stored as NULL if unmeasured)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fasting Glucose (mg/dL)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="20"
                  max="800"
                  placeholder="e.g. 95 (for Diabetes model)"
                  value={bloodGlucose}
                  onChange={(e) => setBloodGlucose(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  HbA1c (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="2"
                  max="20"
                  placeholder="e.g. 5.4"
                  value={hba1c}
                  onChange={(e) => setHba1c(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Total Cholesterol (mg/dL)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="50"
                  max="600"
                  placeholder="e.g. 190 (for Cardio model)"
                  value={totalCholesterol}
                  onChange={(e) => setTotalCholesterol(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Serum Creatinine (mg/dL)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  max="30"
                  placeholder="e.g. 0.9 (for CKD model)"
                  value={serumCreatinine}
                  onChange={(e) => setSerumCreatinine(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Blood Urea (mg/dL)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="300"
                  placeholder="e.g. 24 (for CKD model)"
                  value={bloodUrea}
                  onChange={(e) => setBloodUrea(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  HDL Cholesterol (mg/dL)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="10"
                  max="150"
                  placeholder="e.g. 50"
                  value={hdl}
                  onChange={(e) => setHdl(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Lifestyle & Medical History */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <div className="pb-4 mb-6 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#0B2545]">Lifestyle & Family History</h3>
              <p className="text-xs text-slate-500">Helps refine rule-based preventive health recommendations</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Smoking Status</label>
                <select
                  value={smokingStatus}
                  onChange={(e) => setSmokingStatus(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 bg-white"
                >
                  <option value="never">Never Smoked</option>
                  <option value="former">Former Smoker</option>
                  <option value="current">Current Smoker</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Physical Activity</label>
                <select
                  value={physicalActivity}
                  onChange={(e) => setPhysicalActivity(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 bg-white"
                >
                  <option value="sedentary">Sedentary (Little or no exercise)</option>
                  <option value="light">Light (1-2 days/week)</option>
                  <option value="moderate">Moderate (3-5 days/week)</option>
                  <option value="active">Active (6-7 days/week)</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-2">Family Medical History</label>
              <div className="flex flex-wrap gap-4 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={familyDiabetes}
                    onChange={(e) => setFamilyDiabetes(e.target.checked)}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>Family History of Diabetes</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={familyCardio}
                    onChange={(e) => setFamilyCardio(e.target.checked)}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>Family History of Heart Disease</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={familyKidney}
                    onChange={(e) => setFamilyKidney(e.target.checked)}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>Family History of Kidney Disease</span>
                </label>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reported Non-Emergency Symptoms (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Occasional fatigue, mild dizziness after workout"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* SECTION 4: Emergency Medical ID & ICE Contacts */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 mb-6">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-[#0B2545]">Section 4: Emergency Medical ID & ICE Contact</h3>
                <p className="text-xs text-slate-500">Vital information displayed on your digital and printable Emergency Card</p>
              </div>
              <span className="text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full uppercase">
                Emergency Care
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Blood Group
                </label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 bg-white"
                >
                  <option value="">Select Blood Group (Optional)</option>
                  <option value="O+">O Positive (O+)</option>
                  <option value="O-">O Negative (O-)</option>
                  <option value="A+">A Positive (A+)</option>
                  <option value="A-">A Negative (A-)</option>
                  <option value="B+">B Positive (B+)</option>
                  <option value="B-">B Negative (B-)</option>
                  <option value="AB+">AB Positive (AB+)</option>
                  <option value="AB-">AB Negative (AB-)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Known Drug & Food Allergies
                </label>
                <input
                  type="text"
                  placeholder="e.g. Penicillin, Sulfa drugs, Peanuts, Latex"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Emergency Contact Name (ICE)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jane Doe / Relative"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Emergency Contact Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 placeholder:text-slate-400"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Relationship to Cardholder
                </label>
                <input
                  type="text"
                  placeholder="e.g. Spouse, Parent, Sibling, Friend"
                  value={emergencyRelation}
                  onChange={(e) => setEmergencyRelation(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0B2545] hover:bg-navy-800 text-white font-semibold text-xs shadow-sm transition-all disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
                  <span>Saving Health Profile...</span>
                </>
              ) : (
                <>
                  <span>Save Measurements</span>
                  <ArrowRight className="w-4 h-4 text-teal-400" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
