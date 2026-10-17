'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import {
  User as UserIcon,
  Mail,
  Calendar,
  ShieldCheck,
  Lock,
  LogOut,
  Trash2,
  AlertTriangle,
  FileText,
  Activity,
  HeartPulse,
  Pill,
  CheckCircle2,
  ChevronRight,
  Loader2
} from 'lucide-react';

export default function AccountSettingsPage() {
  const { user, logout, deleteAccount } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState({
    assessmentsCount: 0,
    profilesCount: 0,
    medicationsCount: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Deletion modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAccountStats() {
      try {
        setLoadingStats(true);
        const [assessments, profiles, meds] = await Promise.all([
          api.getAssessments().catch(() => []),
          api.getHealthHistory().catch(() => []),
          api.getMedications().catch(() => []),
        ]);
        setStats({
          assessmentsCount: assessments?.length || 0,
          profilesCount: profiles?.length || 0,
          medicationsCount: meds?.length || 0,
        });
      } catch (err) {
        console.error('Failed to load account stats:', err);
      } finally {
        setLoadingStats(false);
      }
    }
    loadAccountStats();
  }, []);

  const handleDeleteAccount = async () => {
    if (deleteConfirmationInput !== 'DELETE') {
      setDeleteError('Please type "DELETE" in capital letters to confirm.');
      return;
    }

    try {
      setDeleting(true);
      setDeleteError(null);
      await deleteAccount();
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete account. Please try again.');
      setDeleting(false);
    }
  };

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Active Session';

  return (
    <AppShell
      title="Account Settings & Security"
      subtitle="Manage your profile, data isolation, and privacy controls"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Identity Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center font-bold text-xl shrink-0">
                <UserIcon className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0B2545]">
                  {user?.full_name || 'Authenticated User'}
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user?.email || 'N/A'}</span>
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors shadow-xs shrink-0 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-red-600" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Account Metadata Grid */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                <span className="font-semibold uppercase tracking-wider text-[10px]">Member Since</span>
              </div>
              <span className="font-bold text-slate-900 text-sm">{memberSince}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-semibold uppercase tracking-wider text-[10px]">Security Status</span>
              </div>
              <span className="font-bold text-emerald-700 text-sm flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>JWT Protected</span>
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Lock className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-semibold uppercase tracking-wider text-[10px]">User Isolation</span>
              </div>
              <span className="font-bold text-slate-900 text-sm">
                ID #{user?.id || '—'} (Strict Ownership)
              </span>
            </div>
          </div>
        </div>

        {/* Stored Health Records Summary */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
            <div>
              <h3 className="text-base font-bold text-[#0B2545]">Your Stored Health Records</h3>
              <p className="text-xs text-slate-500">Summary of all personal data held under your private account session</p>
            </div>
            <Link
              href="/history"
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
            >
              <span>View History</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loadingStats ? (
            <div className="py-6 text-center text-xs text-slate-400">Loading data footprint...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                  <HeartPulse className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Health Checkups</span>
                  <span className="font-black text-slate-900 text-base">{stats.profilesCount} Records</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">ML Assessments</span>
                  <span className="font-black text-slate-900 text-base">{stats.assessmentsCount} Executed</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Pill className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Daily Medications</span>
                  <span className="font-black text-slate-900 text-base">{stats.medicationsCount} Active</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Legal, Privacy & Transparency Hub */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8">
          <h3 className="text-base font-bold text-[#0B2545] mb-1">
            Privacy, Compliance & Legal Notices
          </h3>
          <p className="text-xs text-slate-500 mb-5">
            Transparent documentation regarding how models operate, data retention, and medical limitations
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              href="/privacy"
              className="p-4 rounded-2xl border border-slate-200 hover:border-teal-300 bg-slate-50/60 hover:bg-white transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm group-hover:text-teal-600 transition-colors">
                  Privacy Policy
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  How we store your data, bcrypt hashing, zero third-party AI transmission.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-teal-600 mt-3 block">Read Policy →</span>
            </Link>

            <Link
              href="/disclaimer"
              className="p-4 rounded-2xl border border-slate-200 hover:border-amber-300 bg-slate-50/60 hover:bg-white transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm group-hover:text-amber-600 transition-colors">
                  Medical Disclaimer
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Clarification on screening estimates vs clinical physician diagnoses.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-amber-600 mt-3 block">Read Disclaimer →</span>
            </Link>

            <Link
              href="/models"
              className="p-4 rounded-2xl border border-slate-200 hover:border-blue-300 bg-slate-50/60 hover:bg-white transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                  <FileText className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                  Model Methodology
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Holdout validation test metrics, feature importances, and training benchmarks.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-blue-600 mt-3 block">View Metrics →</span>
            </Link>
          </div>
        </div>

        {/* Danger Zone: Account Deletion */}
        <div className="bg-red-50/50 rounded-3xl border border-red-200 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-red-800 font-bold text-sm mb-1">
                <Trash2 className="w-4 h-4 text-red-600" />
                <span>Permanently Delete Account</span>
              </div>
              <p className="text-xs text-red-700/80 leading-relaxed max-w-xl">
                Permanently deletes your user credentials and cascades to purge all your private health checkups, historical ML assessments, medication schedules, and paramedic emergency ID data. This action cannot be undone.
              </p>
            </div>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              Delete My Account
            </button>
          </div>
        </div>
      </div>

      {/* Account Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-200 animate-in fade-in zoom-in duration-150">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-center text-slate-900 mb-2">
              Confirm Permanent Account Deletion
            </h3>
            <p className="text-xs text-slate-600 text-center mb-4 leading-relaxed">
              This will permanently delete your account (<strong>{user?.email}</strong>) and erase all associated vitals, assessments, and medical history.
            </p>

            {deleteError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                {deleteError}
              </div>
            )}

            <div className="space-y-3 mb-5">
              <label className="block text-xs font-semibold text-slate-700">
                To confirm, please type <span className="text-red-600 font-mono font-bold">DELETE</span> below:
              </label>
              <input
                type="text"
                placeholder="Type DELETE to confirm"
                value={deleteConfirmationInput}
                onChange={(e) => setDeleteConfirmationInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-red-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmationInput('');
                  setDeleteError(null);
                }}
                disabled={deleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting || deleteConfirmationInput !== 'DELETE'}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Purging Account...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Permanently Purge Data</span>
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
