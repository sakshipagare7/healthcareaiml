'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { api, HealthProfile } from '@/lib/api';
import {
  HeartPulse,
  Scale,
  Droplets,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
} from 'lucide-react';

export default function EditHealthProfilePage() {
  const router = useRouter();
  const params = useParams();
  const profileId = Number(params?.id);

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form State
  const [age, setAge] = useState<number | ''>('');
  const [sex, setSex] = useState<'male' | 'female' | 'other'>('male');
  const [heightCm, setHeightCm] = useState<number | ''>('');
  const [weightKg, setWeightKg] = useState<number | ''>('');
  const [systolicBp, setSystolicBp] = useState<number | ''>('');
  const [diastolicBp, setDiastolicBp] = useState<number | ''>('');
  const [heartRate, setHeartRate] = useState<number | ''>('');
  const [measuredOn, setMeasuredOn] = useState<string>('');

  // Optional Labs
  const [bloodGlucose, setBloodGlucose] = useState<number | ''>('');
  const [hba1c, setHba1c] = useState<number | ''>('');
  const [serumCreatinine, setSerumCreatinine] = useState<number | ''>('');
  const [bloodUrea, setBloodUrea] = useState<number | ''>('');
  const [totalCholesterol, setTotalCholesterol] = useState<number | ''>('');
  const [hdl, setHdl] = useState<number | ''>('');
  const [ldl, setLdl] = useState<number | ''>('');

  // Lifestyle & History
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

  const [liveBmi, setLiveBmi] = useState<number | null>(null);

  // Fetch initial profile
  useEffect(() => {
    async function fetchProfile() {
      if (!profileId) return;
      try {
        setLoadingInitial(true);
        const p = await api.getProfileById(profileId);
        setAge(p.age);
        setSex(p.sex);
        setHeightCm(p.height_cm);
        setWeightKg(p.weight_kg);
        setSystolicBp(p.systolic_bp);
        setDiastolicBp(p.diastolic_bp);
        setHeartRate(p.heart_rate);
        setMeasuredOn(p.measured_on);

        setBloodGlucose(p.blood_glucose ?? '');
        setHba1c(p.hba1c ?? '');
        setSerumCreatinine(p.serum_creatinine ?? '');
        setBloodUrea(p.blood_urea ?? '');
        setTotalCholesterol(p.total_cholesterol ?? '');
        setHdl(p.hdl ?? '');
        setLdl(p.ldl ?? '');

        setSmokingStatus(p.smoking_status || 'never');
        setPhysicalActivity(p.physical_activity || 'moderate');
        setFamilyDiabetes(!!p.family_history_diabetes);
        setFamilyKidney(!!p.family_history_kidney);
        setFamilyCardio(!!p.family_history_cardio);
        setSymptoms(p.symptoms || '');

        setBloodGroup(p.blood_group || '');
        setAllergies(p.allergies || '');
        setEmergencyName(p.emergency_contact_name || '');
        setEmergencyPhone(p.emergency_contact_phone || '');
        setEmergencyRelation(p.emergency_contact_relation || '');
      } catch (err: any) {
        setError(err.message || 'Failed to load profile for editing');
      } finally {
        setLoadingInitial(false);
      }
    }
    fetchProfile();
  }, [profileId]);

  // Live BMI calculation
  useEffect(() => {
    if (typeof heightCm === 'number' && heightCm > 0 && typeof weightKg === 'number' && weightKg > 0) {
      const heightM = heightCm / 100.0;
      setLiveBmi(Math.round((weightKg / (heightM * heightM)) * 10) / 10);
    } else {
      setLiveBmi(null);
    }
  }, [heightCm, weightKg]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
      await api.updateProfile(profileId, payload);
      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to update health metrics.');
      setLoading(false);
    }
  };

  if (loadingInitial) {
    return (
      <AppShell title="Edit Health Information">
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600 mb-3" />
          <p className="text-xs text-slate-500 font-medium">Loading health profile #{profileId}...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={`Edit Health Profile #${profileId}`}
      subtitle="Modify Measurements while Preserving Past Assessment History"
    >
      <div className="max-w-4xl mx-auto">
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
              Health profile updated successfully! Redirecting...
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Core Vitals */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-[#0B2545]">Core Vital Signs</h3>
              </div>
              <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                Required
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Age (years)</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  required
                  value={age}
                  onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Sex</label>
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Height (cm)</label>
                <input
                  type="number"
                  min="50"
                  max="250"
                  step="0.1"
                  required
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  min="10"
                  max="400"
                  step="0.1"
                  required
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                />
              </div>
            </div>

            <div className="mt-4 p-3.5 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-teal-700" />
                <span className="text-xs font-semibold text-teal-900">Computed BMI:</span>
              </div>
              <div className="text-sm font-bold text-teal-800">
                {liveBmi !== null ? `${liveBmi} kg/m²` : '—'}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Systolic BP (mmHg)</label>
                <input
                  type="number"
                  min="40"
                  max="300"
                  required
                  value={systolicBp}
                  onChange={(e) => setSystolicBp(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Diastolic BP (mmHg)</label>
                <input
                  type="number"
                  min="40"
                  max="300"
                  required
                  value={diastolicBp}
                  onChange={(e) => setDiastolicBp(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Heart Rate (bpm)</label>
                <input
                  type="number"
                  min="30"
                  max="250"
                  required
                  value={heartRate}
                  onChange={(e) => setHeartRate(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Optional Labs */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <div className="pb-4 mb-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-[#0B2545]">Laboratory Tests</h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-500">Optional</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Fasting Glucose (mg/dL)</label>
                <input
                  type="number"
                  step="0.1"
                  min="20"
                  max="800"
                  value={bloodGlucose}
                  onChange={(e) => setBloodGlucose(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Total Cholesterol (mg/dL)</label>
                <input
                  type="number"
                  step="0.1"
                  min="50"
                  max="600"
                  value={totalCholesterol}
                  onChange={(e) => setTotalCholesterol(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Serum Creatinine (mg/dL)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  max="30"
                  value={serumCreatinine}
                  onChange={(e) => setSerumCreatinine(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Urea (mg/dL)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="300"
                  value={bloodUrea}
                  onChange={(e) => setBloodUrea(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">HbA1c (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="2"
                  max="20"
                  value={hba1c}
                  onChange={(e) => setHba1c(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Section: Emergency Medical ID & ICE Contacts */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 mb-6">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-[#0B2545]">Emergency Medical ID & In Case of Emergency (ICE)</h3>
                <p className="text-xs text-slate-500">Update vital emergency identifiers for first responders</p>
              </div>
              <span className="text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full uppercase">
                Emergency ID
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Known Drug & Food Allergies</label>
                <input
                  type="text"
                  placeholder="e.g. Penicillin, Sulfa drugs, Peanuts, Latex"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Contact Name (ICE)</label>
                <input
                  type="text"
                  placeholder="e.g. Jane Doe / Relative"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Contact Phone Number</label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 placeholder:text-slate-400"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Relationship to Cardholder</label>
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
                  <span>Updating Profile...</span>
                </>
              ) : (
                <>
                  <span>Save Changes</span>
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
