"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Heart, ArrowRight, MapPin, Users, Activity, Shield,
  Wifi, Globe, CheckCircle, ChevronRight, Play
} from "lucide-react";

const journey = [
  { label: "ASHA", sub: "Field identification", color: "bg-teal-600" },
  { label: "CHO", sub: "Community health", color: "bg-teal-500" },
  { label: "PHC", sub: "Consultation", color: "bg-blue-500" },
  { label: "Rural Hospital", sub: "Treatment", color: "bg-blue-600" },
  { label: "District Hospital", sub: "Specialist care", color: "bg-indigo-600" },
  { label: "Follow-up", sub: "Recovery", color: "bg-emerald-600" },
];

const features = [
  {
    icon: Heart,
    title: "CarePath Engine",
    desc: "A deterministic state machine tracking every patient through 12 care stages with automated next-best-action guidance.",
    color: "bg-red-50 text-red-600",
  },
  {
    icon: MapPin,
    title: "Smart Facility Router",
    desc: "Multi-factor facility matching — beds, ICU, oxygen, blood, specialty, distance — ranked with full transparency.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Shield,
    title: "Referral Guardian",
    desc: "Every referral monitored. Delayed referrals surface automatically. Alternative routing available in one click.",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: Globe,
    title: "Real Network Map",
    desc: "Google Maps operational view of the healthcare network — facilities, ambulances, referral routes and coverage.",
    color: "bg-teal-50 text-teal-600",
  },
  {
    icon: Wifi,
    title: "Offline-First ASHA",
    desc: "ASHA workers create patients and record vitals without connectivity. Syncs automatically when online.",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: Activity,
    title: "District Intelligence",
    desc: "Operational analytics answering real questions: where are referrals getting lost? Which villages need attention?",
    color: "bg-emerald-50 text-emerald-600",
  },
];

const problems = [
  "Long travel to wrong facilities",
  "Fragmented referral chain — no confirmation",
  "Specialist gaps without alternatives",
  "Follow-up dropout after discharge",
  "Facility overload invisible until too late",
  "Patients lost between care stages",
];

const stats = [
  { value: "12", label: "Care stages tracked", unit: "states" },
  { value: "42", label: "Avg referral accept time", unit: "min" },
  { value: "94%", label: "Referral completion rate", unit: "target" },
  { value: "5+", label: "Facility routing factors", unit: "criteria" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-teal-600 rounded-lg flex items-center justify-center">
              <Heart className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-gray-900">Arogya Marg</span>
              <span className="text-xs text-gray-400 ml-2 hidden sm:inline">आरोग्य मार्ग</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              Prototype
            </span>
            <Link
              href="/login"
              className="bg-teal-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
            >
              Enter Platform
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-teal-200 mb-6">
              <Shield className="w-3 h-3" />
              Health Tech Prototype
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-4 leading-tight">
              Arogya Marg
            </h1>
            <p className="text-xl sm:text-2xl text-teal-600 font-semibold mb-4">
              Right Care. Right Place. Right Time.
            </p>
            <p className="text-base text-gray-500 max-w-2xl mx-auto mb-8 leading-relaxed">
              An integrated care coordination platform connecting patients, frontline workers,
              clinicians and public-health facilities across the rural healthcare journey.
              <span className="block mt-2 text-gray-400 text-sm italic">
                Not a telemedicine app. Not a hospital dashboard. The coordination layer between them.
              </span>
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/login"
                className="flex items-center gap-2 bg-teal-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-teal-700 transition-all shadow-md hover:shadow-lg"
              >
                Enter Platform <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Patient Journey Visualization */}
      <section className="py-16 bg-gray-50 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-8">
            The Rural Healthcare Journey — Coordinated
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {journey.map((step, i) => (
              <div key={step.label} className="flex items-center gap-2">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex flex-col items-center"
                >
                  <div className={`${step.color} text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm`}>
                    {step.label}
                  </div>
                  <span className="text-xs text-gray-400 mt-1">{step.sub}</span>
                </motion.div>
                {i < journey.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 mt-6">
            Arogya Marg coordinates this journey — ensuring no patient falls through the gaps
          </p>
        </div>
      </section>

      {/* Problem */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-semibold text-teal-600 uppercase tracking-widest mb-3">The Problem</p>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Patients get lost between care stages
              </h2>
              <p className="text-gray-500 mb-6">
                Most healthcare systems record what happened.
                <strong className="text-gray-700"> Arogya Marg manages what should happen next.</strong>
              </p>
              <ul className="space-y-2.5">
                {problems.map((p) => (
                  <li key={p} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                    </div>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <p className="text-sm font-semibold text-gray-700 mb-4">At every stage, Arogya Marg answers:</p>
              <div className="space-y-3">
                {[
                  "Where is the patient now?",
                  "What should happen next?",
                  "Who is responsible?",
                  "Where should the patient go?",
                  "Is that facility actually ready?",
                  "Has the referral been accepted?",
                  "Has the patient arrived?",
                  "What happens after discharge?",
                ].map((q, i) => (
                  <div key={q} className="flex items-center gap-2.5 text-sm">
                    <div className="w-5 h-5 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-[9px] font-bold">{i + 1}</span>
                    </div>
                    <span className="text-gray-600">{q}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-teal-600 text-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-bold mb-1">{s.value}</div>
                <div className="text-teal-200 text-xs font-medium uppercase tracking-wide">{s.unit}</div>
                <div className="text-teal-100 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-teal-600 uppercase tracking-widest mb-2">Platform Capabilities</p>
            <h2 className="text-3xl font-bold text-gray-900">Built for every role in the care chain</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-white border border-gray-100 rounded-xl p-5 hover:border-gray-200 hover:shadow-clinical-md transition-all"
                >
                  <div className={`w-10 h-10 rounded-lg ${f.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Disclaimer + Footer */}
      <footer className="border-t border-gray-100 py-10 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 text-sm text-amber-800">
            <strong>Healthcare Disclaimer:</strong> This is a hackathon prototype using synthetic demonstration data.
            Clinical decision-support prototype — not a substitute for professional medical judgment.
            All facility data, patient data, and operational values are SYNTHETIC DEMO DATA. Not live government data.
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-teal-600 rounded-md flex items-center justify-center">
                <Heart className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-700">Arogya Marg</span>
              <span className="text-sm text-gray-400">Pune District Demo</span>
            </div>
            <p className="text-sm text-gray-400">Right Care. Right Place. Right Time.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
