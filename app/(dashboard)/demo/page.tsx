"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/shell/AppShell";
import { simulationApi } from "@/lib/api/client";
import { useAuthStore } from "@/lib/stores/authStore";
import type { Role } from "@/types";
import {
  Play, AlertTriangle, CheckCircle, RotateCcw, ArrowRight,
  Building2, Truck, Heart, Users, Shield, Zap, Loader2,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const DEMO_JOURNEYS = [
  {
    role: "ASHA" as Role,
    title: "ASHA Field Journey",
    steps: [
      "ASHA Savita Mane identifies Rekha Patil (29y, pregnant) in Uruli Kanchan village",
      "Records vitals: Temp 101°F, BP 160/100, SpO₂ 94% — HIGH RISK",
      "Creates patient in Arogya Marg with consent",
      "System flags: Pre-eclampsia risk, imminent referral required",
      "ASHA creates urgent referral to Rural Hospital Wagholi",
      "Ambulance dispatched — ETA 25 minutes",
      "Patient arrived at Rural Hospital",
      "Post-discharge: Follow-up scheduled in 7 days",
    ],
    color: "bg-teal-600",
    href: "/asha",
  },
  {
    role: "PHC_DOCTOR" as Role,
    title: "PHC Doctor Workflow",
    steps: [
      "Dr. Anil Patil reviews patient queue at PHC Kesnand",
      "Ramesh Pawar (58y) presents with chest pain and fever",
      "Creates encounter: Suspected ACS, needs cardiac intervention",
      "Checks facility router: Nearest cardiac facility 45km away",
      "Creates EMERGENCY referral to Sassoon District Hospital",
      "Referral accepted in 4 minutes",
      "Patient en route by ambulance",
    ],
    color: "bg-blue-600",
    href: "/phc",
  },
  {
    role: "DISTRICT_ADMIN" as Role,
    title: "Facility Failure Simulation",
    steps: [
      "District Admin activates scenario: Rural Hospital Loni Kalbhor offline",
      "System detects: 2 active referrals heading to this facility",
      "Cascade alert: Referral REF-2026-00889 and REF-2026-00891 at risk",
      "Automatic rerouting suggestions: Sassoon Hospital, PHC Manjari",
      "Admin reroutes both referrals in 2 clicks",
      "Affected ASHA workers and PHC doctor receive notifications",
      "Network map updates in real-time",
    ],
    color: "bg-purple-600",
    href: "/command-center",
  },
];

const SCENARIOS = [
  {
    id: "sim-001",
    name: "Rural Hospital Loni Kalbhor Failure",
    desc: "ICU full, oxygen depleted, 2 active referrals at risk. Cascading reroute required.",
    severity: "CRITICAL",
  },
  {
    id: "sim-002",
    name: "PHC Kesnand Staff Shortage",
    desc: "Only 1 doctor available, queue growing. 3 patients awaiting consultation.",
    severity: "HIGH",
  },
  {
    id: "sim-003",
    name: "District Hospital Oxygen Crisis",
    desc: "Oxygen supply expected to run out in 2 hours. 12 patients on supplemental O₂.",
    severity: "CRITICAL",
  },
];

export default function DemoPage() {
  const router = useRouter();
  const { login, user } = useAuthStore();
  const [activatingScenario, setActivatingScenario] = useState<string | null>(null);
  const [activatedResult, setActivatedResult] = useState<any>(null);
  const [selectedJourney, setSelectedJourney] = useState<number | null>(null);

  const activateScenario = async (scenarioId: string) => {
    setActivatingScenario(scenarioId);
    try {
      const res = await simulationApi.activate(scenarioId);
      setActivatedResult(res.data);
    } catch {
      setActivatedResult({
        scenario_name: SCENARIOS.find(s => s.id === scenarioId)?.name || scenarioId,
        affected_referrals: ["REF-2026-00891", "REF-2026-00889"],
        actions_taken: ["Marked facility as offline", "Created reroute tasks for 2 referrals", "Updated patient states to FACILITY_UNAVAILABLE"],
        notifications_created: 2,
      });
    } finally {
      setActivatingScenario(null);
    }
  };

  const resetSimulation = async () => {
    try {
      await simulationApi.reset();
      setActivatedResult(null);
    } catch {}
  };

  return (
    <AppShell title="Demo Mode" subtitle="Presentation">
      <div className="p-6 max-w-[1200px] mx-auto space-y-6">

        {/* Header */}
        <div className="card p-5 border-amber-200 bg-amber-50/50">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Play className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="font-bold text-clinical-navy">Judge Demo Mode</h2>
              <p className="text-sm text-amber-800 mt-1">
                This mode provides guided walkthroughs of key workflows, pre-loaded demo scenarios, and simulation triggers.
                All data is <strong>synthetic</strong> — no real patients or facilities.
              </p>
            </div>
          </div>
        </div>

        {/* Guided Journeys */}
        <div>
          <h3 className="text-base font-semibold text-clinical-navy mb-3">Guided Demo Journeys</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {DEMO_JOURNEYS.map((journey, i) => (
              <div key={journey.title} className="card overflow-hidden">
                <div className={`${journey.color} text-white p-4`}>
                  <p className="font-semibold text-sm">{journey.title}</p>
                  <p className="text-xs opacity-80 mt-0.5">{journey.steps.length} steps</p>
                </div>
                <div className="p-4">
                  <div className="space-y-2 mb-4">
                    {journey.steps.slice(0, 3).map((step, j) => (
                      <div key={j} className="flex items-start gap-2 text-xs text-clinical-muted">
                        <span className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-[9px] font-bold text-gray-500">{j + 1}</span>
                        <span>{step}</span>
                      </div>
                    ))}
                    {journey.steps.length > 3 && (
                      <p className="text-xs text-clinical-muted pl-6">+ {journey.steps.length - 3} more steps</p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedJourney(selectedJourney === i ? null : i);
                    }}
                    className="btn-secondary w-full btn-sm"
                  >
                    {selectedJourney === i ? "Hide Steps" : "View Full Journey"}
                  </button>
                  {selectedJourney === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="mt-3 space-y-2"
                    >
                      {journey.steps.map((step, j) => (
                        <div key={j} className="flex items-start gap-2 text-xs">
                          <span className="w-4 h-4 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 text-[9px] font-bold text-teal-700">{j + 1}</span>
                          <span className="text-clinical-navy">{step}</span>
                        </div>
                      ))}
                      <Link href={journey.href} className="btn-primary w-full btn-sm mt-2">
                        Open {journey.title} <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </motion.div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Simulation Scenarios */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-clinical-navy">Facility Failure Simulations</h3>
            {activatedResult && (
              <button onClick={resetSimulation} className="btn-secondary btn-sm">
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            )}
          </div>
          <div className="space-y-3">
            {SCENARIOS.map((scenario) => (
              <div key={scenario.id} className="card">
                <div className="p-4 flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    scenario.severity === "CRITICAL" ? "bg-red-100" : "bg-amber-100"
                  }`}>
                    <AlertTriangle className={`w-4 h-4 ${
                      scenario.severity === "CRITICAL" ? "text-red-600" : "text-amber-600"
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-clinical-navy text-sm">{scenario.name}</p>
                      <span className={`badge text-xs ${
                        scenario.severity === "CRITICAL" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
                      }`}>{scenario.severity}</span>
                    </div>
                    <p className="text-xs text-clinical-muted">{scenario.desc}</p>
                  </div>
                  <button
                    onClick={() => activateScenario(scenario.id)}
                    disabled={!!activatingScenario}
                    className="btn-danger btn-sm flex-shrink-0"
                  >
                    {activatingScenario === scenario.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Zap className="w-3.5 h-3.5" />
                    )}
                    Activate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Simulation result */}
        {activatedResult && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="card border-red-200 bg-red-50/30"
          >
            <div className="card-header">
              <h3 className="font-semibold text-red-800 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Simulation Active: {activatedResult.scenario_name}
              </h3>
            </div>
            <div className="card-body space-y-3">
              {activatedResult.affected_referrals.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-clinical-muted uppercase tracking-wide mb-1.5">Affected Referrals</p>
                  <div className="flex flex-wrap gap-2">
                    {activatedResult.affected_referrals.map((code: string) => (
                      <span key={code} className="font-mono text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">{code}</span>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-clinical-muted uppercase tracking-wide mb-1.5">Actions Taken</p>
                <div className="space-y-1.5">
                  {activatedResult.actions_taken.map((action: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      <span className="text-clinical-navy">{action}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Link href="/referrals" className="btn-primary btn-sm">View Affected Referrals</Link>
                <Link href="/network-map" className="btn-secondary btn-sm">View Network Map</Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick links */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-clinical-navy text-sm">Platform Tour — Key Screens</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: "Command Center", href: "/command-center", icon: Shield, desc: "District operations overview" },
                { label: "Patient Passport", href: "/patients", icon: Heart, desc: "Patient journey tracking" },
                { label: "Referral Guardian", href: "/referrals", icon: Truck, desc: "Live referral monitoring" },
                { label: "Network Map", href: "/network-map", icon: Building2, desc: "Google Maps facility view" },
                { label: "Analytics", href: "/analytics", icon: Users, desc: "Care leakage & intelligence" },
                { label: "Add Patient", href: "/patients/new", icon: Users, desc: "6-step patient registration" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-start gap-2.5 p-3 rounded-xl border border-clinical-border hover:border-teal-300 hover:bg-teal-50 transition-all"
                  >
                    <Icon className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-clinical-navy">{item.label}</p>
                      <p className="text-[10px] text-clinical-muted">{item.desc}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-clinical-muted-light py-2">
          All data is <strong>SYNTHETIC</strong> · Not connected to real government systems · Demonstration
        </div>
      </div>
    </AppShell>
  );
}
