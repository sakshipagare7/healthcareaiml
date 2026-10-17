'use client';

import React, { useState, useEffect } from 'react';
import {
  api,
  MedicationItem,
  AdherenceSummary
} from '@/lib/api';
import {
  Pill,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Calendar,
  Flame,
  Award,
  AlertCircle,
  Clock,
  X,
  Loader2
} from 'lucide-react';

export default function MedicationTracker() {
  const [medications, setMedications] = useState<MedicationItem[]>([]);
  const [adherence, setAdherence] = useState<AdherenceSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Form state for new medication
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('Once Daily');
  const [timeOfDay, setTimeOfDay] = useState('Morning');
  const [instructions, setInstructions] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    loadMedications();
  }, []);

  const loadMedications = async () => {
    try {
      setLoading(true);
      const [medsData, adhData] = await Promise.all([
        api.getMedications(),
        api.getAdherence()
      ]);
      setMedications(medsData || []);
      setAdherence(adhData || null);
    } catch (err) {
      console.error('Failed to load medications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (medId: number) => {
    try {
      // Optimistic update
      setMedications((prev) =>
        prev.map((m) => (m.id === medId ? { ...m, taken_today: !m.taken_today } : m))
      );
      await api.toggleMedication(medId);
      // Refresh adherence summary
      const adh = await api.getAdherence();
      setAdherence(adh);
    } catch (err) {
      console.error('Toggle error:', err);
      loadMedications();
    }
  };

  const handleDelete = async (medId: number) => {
    if (!confirm('Remove this medication from your daily routine?')) return;
    try {
      await api.deleteMedication(medId);
      loadMedications();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleAddMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Medication name is required.');
      return;
    }
    if (!dosage.trim()) {
      setFormError('Dosage is required (e.g. 500mg, 1 tablet).');
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      await api.addMedication({
        name: name.trim(),
        dosage: dosage.trim(),
        frequency,
        time_of_day: timeOfDay,
        instructions: instructions.trim() || undefined
      });
      setShowAddModal(false);
      setName('');
      setDosage('');
      setInstructions('');
      loadMedications();
    } catch (err: any) {
      setFormError(err.message || 'Failed to add medication.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 mb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0B2545]">
              Medication & Daily Vitals Adherence Tracker
            </h3>
            <p className="text-xs text-slate-500">
              Track prescribed chronic therapy compliance and correlate with vitals stability
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0B2545] hover:bg-navy-800 text-white text-xs font-bold transition-all shadow-xs"
        >
          <Plus className="w-3.5 h-3.5 text-teal-400" />
          <span>Add Medication</span>
        </button>
      </div>

      {/* Adherence Statistics Bar */}
      {adherence && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">
                7-Day Adherence
              </span>
              <span className="text-lg font-black text-slate-900 font-mono">
                {adherence.adherence_rate_7d}%
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              <Award className="w-5 h-5 text-blue-600" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">
                Today&apos;s Compliance
              </span>
              <span className="text-lg font-black text-slate-900 font-mono">
                {adherence.taken_today_count} / {adherence.total_medications}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">
                Active Routine Streak
              </span>
              <span className="text-lg font-black text-amber-600 font-mono flex items-center gap-1">
                <span>{adherence.streak_days} Days</span>
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
              <Flame className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </div>
      )}

      {/* Medication Daily Checklist */}
      <div className="mt-5">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
          Today&apos;s Prescribed Dose Checklist
        </h4>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading medications...</div>
        ) : medications.length === 0 ? (
          <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Pill className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
            <p className="text-xs font-semibold text-slate-700">No active medications registered</p>
            <p className="text-[11px] text-slate-500 mt-0.5 mb-3">
              Add your daily prescriptions (e.g. Metformin, antihypertensives) to track your adherence routine.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register First Medication</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {medications.map((med) => (
              <div
                key={med.id}
                className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                  med.taken_today
                    ? 'bg-emerald-50/60 border-emerald-200'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggle(med.id)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                      med.taken_today
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'border border-slate-300 hover:border-teal-500 text-transparent hover:text-teal-600'
                    }`}
                    title={med.taken_today ? 'Mark as not taken' : 'Mark as taken today'}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-bold ${
                          med.taken_today ? 'text-emerald-950 line-through opacity-80' : 'text-slate-900'
                        }`}
                      >
                        {med.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {med.dosage}
                      </span>
                      <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                        {med.time_of_day}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                      <span>{med.frequency}</span>
                      {med.instructions && (
                        <>
                          <span>&bull;</span>
                          <span className="italic">{med.instructions}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      med.taken_today
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {med.taken_today ? 'Completed' : 'Pending'}
                  </span>

                  <button
                    onClick={() => handleDelete(med.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                    title="Delete medication"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Medication Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-teal-600" />
                <h4 className="font-bold text-slate-900 text-sm">Add New Prescription Medication</h4>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddMedication} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Medication Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Metformin, Telmisartan, Atorvastatin"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dosage *</label>
                  <input
                    type="text"
                    placeholder="e.g. 500mg, 1 tablet"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Time of Day</label>
                  <select
                    value={timeOfDay}
                    onChange={(e) => setTimeOfDay(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden bg-white"
                  >
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Evening">Evening</option>
                    <option value="Night">Night</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Frequency</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden bg-white"
                >
                  <option value="Once Daily">Once Daily</option>
                  <option value="Twice Daily">Twice Daily (Morning & Night)</option>
                  <option value="Thrice Daily">Thrice Daily</option>
                  <option value="As Needed (PRN)">As Needed (PRN)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Instructions / Food Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Take with water after breakfast"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#0B2545] hover:bg-navy-800 text-white font-bold transition-all disabled:opacity-60 flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Medication</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
