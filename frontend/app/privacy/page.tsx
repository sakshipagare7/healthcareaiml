'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import {
  ShieldCheck,
  Lock,
  Database,
  Trash2,
  Cpu,
  Mail,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HeartPulse
} from 'lucide-react';

export default function PrivacyPolicyPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#0B2545] text-teal-400 flex items-center justify-center font-bold shadow-xs">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-[#0B2545] text-base tracking-tight">PreventHealth</span>
              <span className="text-teal-600 font-mono text-xs font-bold ml-1">AI</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0B2545] text-white text-xs font-semibold hover:bg-navy-800 transition-colors"
              >
                <span>Dashboard</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        {/* Title Badge */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>Transparency & Data Protection</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0B2545] tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Last updated: October 2026 • Effective immediately for all registered users
          </p>
        </div>

        {/* Policy Content Sections */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-10 space-y-8 text-slate-700 text-xs sm:text-sm leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-100">
                <Database className="w-4 h-4" />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-[#0B2545]">
                1. Information We Collect
              </h2>
            </div>
            <p>
              PreventHealth AI collects only the minimal personal and health-related information strictly necessary to provide AI-assisted preventive health screening and vital sign monitoring:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600 text-xs sm:text-sm">
              <li><strong>Account Credentials:</strong> Full name and email address for account authentication and session identification.</li>
              <li><strong>User-Entered Biometrics & Vitals:</strong> Age, biological sex, height, weight, computed BMI, systolic and diastolic blood pressure, and resting heart rate.</li>
              <li><strong>Clinical Laboratory Markers:</strong> Blood glucose, HbA1c, serum creatinine, blood urea nitrogen, total cholesterol, HDL, and LDL (when voluntarily submitted by the user).</li>
              <li><strong>Lifestyle Factors:</strong> Self-reported physical activity levels and smoking status.</li>
              <li><strong>Optional Emergency Contact (ICE):</strong> Emergency contact name, phone number, relationship, blood group, and known drug allergies for the paramedic emergency ID card.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
                <Cpu className="w-4 h-4" />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-[#0B2545]">
                2. How Your Information Is Used
              </h2>
            </div>
            <p>
              Your entered information is processed exclusively for the following transparent purposes:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600 text-xs sm:text-sm">
              <li>To execute our local Scikit-Learn Random Forest pipelines to calculate multimodal risk estimates for Type 2 Diabetes, Cardiovascular Disease, and Chronic Kidney Disease.</li>
              <li>To trigger rule-based, evidence-aligned preventive lifestyle and dietary recommendations.</li>
              <li>To render longitudinal trend charts of your historical blood pressure, blood glucose, and BMI trajectories.</li>
              <li>To generate your offline-ready Emergency Paramedic ID card when requested.</li>
            </ul>
            <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200 text-teal-900 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <span>We never sell, monetize, rent, or distribute your private medical information or contact details to data brokers, advertising networks, or third parties.</span>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-100">
                <Lock className="w-4 h-4" />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-[#0B2545]">
                3. Storage, Transmission & Security Controls
              </h2>
            </div>
            <p>
              We implement industry-standard software engineering security controls to protect your data:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600 text-xs sm:text-sm">
              <li><strong>Transport Security:</strong> All client-server communications are transmitted exclusively over encrypted HTTPS (TLS 1.3).</li>
              <li><strong>Password Protection:</strong> Passwords are never stored in plaintext. They are cryptographically hashed using <strong>bcrypt</strong> with individual random salts (12 work rounds).</li>
              <li><strong>Authentication:</strong> User sessions are managed via signed, HMAC-SHA256 JSON Web Tokens (JWT) with strict 24-hour expiration windows.</li>
              <li><strong>Strict User Data Isolation:</strong> Every database query on the backend verifies that records belong to the authenticated <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono text-slate-800">user_id</code>. User A cannot view, query, or modify User B&apos;s records.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-100">
                <AlertCircle className="w-4 h-4" />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-[#0B2545]">
                4. Third-Party Services & AI Providers Disclosure
              </h2>
            </div>
            <p>
              In strict adherence to academic and medical integrity standards:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600 text-xs sm:text-sm">
              <li><strong>No External LLM Data Sharing:</strong> Your private health vitals and lab numbers are <strong>never sent to external third-party AI APIs</strong> (such as OpenAI, Anthropic, or cloud LLM vendors).</li>
              <li><strong>100% In-House Model Inference:</strong> All three Random Forest screening models (Diabetes, Cardiovascular, CKD) run entirely inside our dedicated backend environment.</li>
              <li><strong>Hosting Infrastructure:</strong> The frontend is hosted on Vercel and the backend service runs on Render. Neither platform accesses your medical inputs beyond facilitating secure HTTP proxying.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-red-50 text-red-700 border border-red-100">
                <Trash2 className="w-4 h-4" />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-[#0B2545]">
                5. Data Retention & Permanent Account Deletion
              </h2>
            </div>
            <p>
              You maintain total ownership of your personal health data:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600 text-xs sm:text-sm">
              <li><strong>Individual Record Deletion:</strong> You can delete any individual health checkup entry directly from your <Link href="/history" className="text-teal-600 font-semibold underline">History</Link> page at any time.</li>
              <li><strong>Permanent Account Purge:</strong> You may unilaterally delete your entire account through <Link href="/settings" className="text-teal-600 font-semibold underline">Account Settings</Link>. Deleting your account immediately and irreversibly cascades to purge all stored health profiles, historical assessments, prediction results, and medications from our database.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-slate-100 text-slate-700">
                <Mail className="w-4 h-4" />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-[#0B2545]">
                6. Contact & Privacy Inquiries
              </h2>
            </div>
            <p>
              If you have any questions, security disclosures, or concerns regarding your data privacy, you can reach out to the project engineering team at:
            </p>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800">
              preventhealth.ai.project@gmail.com
            </div>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <Link href="/disclaimer" className="text-teal-600 hover:text-teal-700 font-semibold underline">
            Read Medical Disclaimer →
          </Link>
          <Link href="/models" className="text-teal-600 hover:text-teal-700 font-semibold underline">
            View Model Methodology & Metrics →
          </Link>
        </div>
      </main>
    </div>
  );
}
