"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/shell/AppShell";
import {
  AlertTriangle, Activity, Building2, Users, ArrowRight,
  Clock, TrendingUp, Wifi, RefreshCw, ChevronRight,
  Stethoscope, Truck, CheckCircle, XCircle, AlertCircle,
  MapPin, Heart
} from "lucide-react";
import { analyticsApi, simulationApi } from "@/lib/api/client";
import type { AnalyticsSummary, Facility, Referral } from "@/types";
import { formatDateTime, getCareStateColor, getStatusColor, timeAgo } from "@/lib/utils";
import Link from "next/link";

const CARE_STAGES = [
  { label: "Field", sub: "ASHA identified", count: 0, color: "bg-teal-500" },
  { label: "PHC", sub: "Consultation", count: 0, color: "bg-blue-500" },
  { label: "Rural Hospital", sub: "Referral/Treatment", count: 0, color: "bg-indigo-500" },
  { label: "District Hospital", sub: "Specialist care", count: 0, color: "bg-purple-500" },
  { label: "Treatment", sub: "Active treatment", count: 0, color: "bg-amber-500" },
  { label: "Follow-up", sub: "Recovery", count: 0, color: "bg-emerald-500" },
];

const DEMO_EVENTS = [
  { time: "2 min ago", type: "referral", msg: "Referral REF-2026-00891 accepted — Rural Hospital Wagholi", color: "bg-emerald-500" },
  { time: "8 min ago", type: "patient", msg: "High-risk patient Rekha Patil dispatched by ambulance MH12-AB-1234", color: "bg-blue-500" },
  { time: "22 min ago", type: "alert", msg: "PHC Kesnand oxygen stock below threshold (40% remaining)", color: "bg-amber-500" },
  { time: "1h ago", type: "referral", msg: "Referral REF-2026-00889 completed — Anita Kamble discharged", color: "bg-gray-400" },
  { time: "2h ago", type: "facility", msg: "Rural Hospital Loni Kalbhor moved to CRITICAL status — ICU full", color: "bg-red-500" },
];

const DEMO_PATIENTS = [
  { id: "pat-rekha-001", name: "Rekha Patil", risk: "HIGH", state: "EN_ROUTE", dest: "Rural Hospital Wagholi", eta: "25 min", owner: "Savita Mane" },
  { id: "pat-005", name: "Ramesh Pawar", risk: "CRITICAL", state: "REFERRAL_CREATED", dest: "Sassoon District Hospital", eta: "45 min", owner: "Dr. Anil Patil" },
  { id: "pat-004", name: "Sunita Jadhav", risk: "MEDIUM", state: "CONSULTATION_PENDING", dest: "PHC Kesnand", eta: "—", owner: "Priya Shinde" },
];

const DEMO_FACILITIES = [
  { name: "PHC Manjari", readiness: 87, beds: "12/30", oxygen: true, diag: true, status: "READY" },
  { name: "Rural Hospital Wagholi", readiness: 78, beds: "25/60", oxygen: true, diag: true, status: "READY" },
  { name: "Rural Hospital Loni Kalbhor", readiness: 34, beds: "39/40", oxygen: false, diag: false, status: "CRITICAL" },
  { name: "PHC Kesnand", readiness: 62, beds: "16/20", oxygen: true, diag: false, status: "LIMITED" },
  { name: "Sassoon District Hospital", readiness: 92, beds: "180/250", oxygen: true, diag: true, status: "READY" },
];

export default function CommandCenter() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const res = await analyticsApi.summary();
      setAnalytics(res.data);
      setLastRefresh(new Date());
    } catch {
      // use demo data
    } finally {
      setLoading(false);
    }
  };

  const alerts = [
    { type: "critical", icon: AlertTriangle, color: "text-red-600 bg-red-50 border-red-200", msg: `${analytics?.stuck_patients || 2} patients have stalled referrals`, action: "View in Referral Guardian", href: "/referrals" },
    { type: "warning", icon: Clock, color: "text-amber-600 bg-amber-50 border-amber-200", msg: `${analytics?.follow_ups_overdue || 5} high-risk follow-ups overdue today`, action: "View tasks", href: "/tasks" },
    { type: "info", icon: AlertCircle, color: "text-amber-500 bg-amber-50 border-amber-200", msg: "PHC Kesnand oxygen stock below threshold", action: "View facility", href: "/facilities/fac-002" },
    { type: "info", icon: Activity, color: "text-blue-600 bg-blue-50 border-blue-200", msg: `${analytics?.referrals_pending || 3} referrals awaiting facility acceptance`, action: "View referrals", href: "/referrals" },
  ];

  return (
    <AppShell title="Command Center" subtitle="Pune District / Haveli">
      <div className="p-6 max-w-[1400px] mx-auto space-y-6">

        {/* Header question */}
        <div>
          <h2 className="text-xl font-bold text-clinical-navy">What needs attention now?</h2>
          <p className="text-sm text-clinical-muted mt-0.5">
            Live operational status · Last updated {lastRefresh.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            <button onClick={loadData} className="ml-2 text-teal-600 hover:text-teal-700 inline-flex items-center gap-1">
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </p>
        </div>

        {/* Priority alerts */}
        <div className="grid gap-2.5">
          {alerts.map((a, i) => {
            const Icon = a.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${a.color}`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium flex-1">{a.msg}</span>
                <Link href={a.href} className="text-xs font-semibold flex items-center gap-1 hover:underline whitespace-nowrap">
                  {a.action} <ChevronRight className="w-3 h-3" />
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Active Journeys", value: analytics?.active_journeys ?? 18, icon: Heart, color: "text-teal-600", bg: "bg-teal-50" },
            { label: "High-Risk Patients", value: analytics?.high_risk_patients ?? 6, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
            { label: "Pending Referrals", value: analytics?.referrals_pending ?? 4, icon: Truck, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Completion Rate", value: `${analytics?.referral_completion_rate ?? 87}%`, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
          ].map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.label} className="card p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-2xl font-bold text-clinical-navy">{m.value}</p>
                    <p className="text-xs text-clinical-muted mt-0.5 font-medium">{m.label}</p>
                  </div>
                  <div className={`w-9 h-9 rounded-lg ${m.bg} flex items-center justify-center`}>
                    <Icon className={`w-4.5 h-4.5 ${m.color}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live care network */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="font-semibold text-clinical-navy">Live Care Network</h3>
            <span className="text-xs text-clinical-muted">Patients flowing through care stages</span>
          </div>
          <div className="card-body">
            <div className="flex flex-wrap items-center gap-2">
              {CARE_STAGES.map((stage, i) => (
                <div key={stage.label} className="flex items-center gap-2">
                  <div className="text-center min-w-[90px]">
                    <div className={`${stage.color} text-white rounded-lg px-3 py-2 text-xs font-semibold`}>
                      {stage.label}
                      <span className="block text-lg font-bold mt-0.5">
                        {i === 0 ? (analytics?.active_journeys ?? 18) :
                          i === 1 ? 4 : i === 2 ? 3 : i === 3 ? 2 : i === 4 ? 5 : (analytics?.follow_ups_due_today ?? 7)}
                      </span>
                    </div>
                    <p className="text-[10px] text-clinical-muted mt-1">{stage.sub}</p>
                  </div>
                  {i < CARE_STAGES.length - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Two-column section */}
        <div className="grid lg:grid-cols-2 gap-5">
          {/* Active Critical Journeys */}
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h3 className="font-semibold text-clinical-navy">Active Critical Journeys</h3>
              <Link href="/patients" className="text-xs text-teal-600 hover:underline">
                View all
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="table-clinical">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>State</th>
                    <th>Destination</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {DEMO_PATIENTS.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div>
                          <p className="text-sm font-medium text-clinical-navy">{p.name}</p>
                          <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                            p.risk === "CRITICAL" ? "bg-purple-50 text-purple-800" :
                            p.risk === "HIGH" ? "bg-red-50 text-red-800" : "bg-amber-50 text-amber-800"
                          }`}>{p.risk}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${getCareStateColor(p.state)}`}>
                          {p.state.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td>
                        <div>
                          <p className="text-xs text-clinical-navy">{p.dest}</p>
                          {p.eta !== "—" && <p className="text-xs text-clinical-muted">ETA: {p.eta}</p>}
                        </div>
                      </td>
                      <td>
                        <Link
                          href={`/patients/${p.id}`}
                          className="text-xs text-teal-600 font-medium hover:underline"
                        >
                          Open →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Events */}
          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold text-clinical-navy">Recent Events</h3>
            </div>
            <div className="card-body space-y-3">
              {DEMO_EVENTS.map((ev, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full ${ev.color} mt-1.5 flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-clinical-navy">{ev.msg}</p>
                    <p className="text-xs text-clinical-muted mt-0.5">{ev.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Facility Readiness */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="font-semibold text-clinical-navy">Facility Readiness</h3>
            <Link href="/facilities" className="text-xs text-teal-600 hover:underline">
              View all facilities
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="table-clinical">
              <thead>
                <tr>
                  <th>Facility</th>
                  <th>Readiness</th>
                  <th>Beds</th>
                  <th>Oxygen</th>
                  <th>Diagnostics</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {DEMO_FACILITIES.map((f) => (
                  <tr key={f.name}>
                    <td className="font-medium text-clinical-navy text-sm">{f.name}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5 w-16">
                          <div
                            className={`h-1.5 rounded-full ${
                              f.readiness >= 75 ? "bg-emerald-500" :
                              f.readiness >= 50 ? "bg-amber-500" : "bg-red-500"
                            }`}
                            style={{ width: `${f.readiness}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-clinical-navy w-8">{f.readiness}%</span>
                      </div>
                    </td>
                    <td className="text-xs text-clinical-navy font-mono">{f.beds}</td>
                    <td>
                      {f.oxygen ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </td>
                    <td>
                      {f.diag ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </td>
                    <td>
                      <span className={`badge text-xs ${
                        f.status === "READY" ? "badge-ready" :
                        f.status === "LIMITED" ? "badge-limited" :
                        f.status === "CRITICAL" ? "badge-critical" : "badge-offline"
                      }`}>
                        <span className={`status-dot ${
                          f.status === "READY" ? "status-dot-ready" :
                          f.status === "LIMITED" ? "status-dot-limited" :
                          f.status === "CRITICAL" ? "status-dot-critical" : "status-dot-offline"
                        }`} />
                        {f.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Care leakage funnel */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-clinical-navy">Care Leakage Funnel</h3>
            <p className="text-xs text-clinical-muted mt-0.5">Patients at each stage — where is the drop-off?</p>
          </div>
          <div className="card-body">
            <div className="flex flex-wrap gap-2 items-end">
              {[
                { label: "Identified", n: 42, pct: 100 },
                { label: "Consulted", n: 38, pct: 90 },
                { label: "Referred", n: 28, pct: 67 },
                { label: "Accepted", n: 24, pct: 57 },
                { label: "Arrived", n: 21, pct: 50 },
                { label: "Treated", n: 19, pct: 45 },
                { label: "Follow-up", n: 14, pct: 33 },
                { label: "Closed", n: 11, pct: 26 },
              ].map((stage) => (
                <div key={stage.label} className="flex flex-col items-center gap-1 flex-1 min-w-[60px]">
                  <span className="text-xs font-bold text-clinical-navy">{stage.n}</span>
                  <div className="w-full bg-gray-100 rounded-t-sm relative" style={{ height: "60px" }}>
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-teal-500 rounded-t-sm transition-all"
                      style={{ height: `${stage.pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-clinical-muted text-center">{stage.label}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-clinical-muted mt-3 text-center">
              Largest drop-off: Referred → Accepted (10 patients, 36% loss) ·{" "}
              <span className="text-red-600 font-medium">Action: Review pending referrals</span>
            </p>
          </div>
        </div>

        {/* Map preview link */}
        <div className="card overflow-hidden">
          <div className="relative h-32 bg-gradient-to-br from-teal-50 to-blue-50 border-b border-clinical-border flex items-center justify-center">
            <div className="absolute inset-0 opacity-10">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full border border-teal-400"
                  style={{
                    width: `${40 + i * 30}px`,
                    height: `${40 + i * 30}px`,
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                />
              ))}
            </div>
            <div className="text-center z-10">
              <MapPin className="w-8 h-8 text-teal-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-teal-700">Live Network Map</p>
              <p className="text-xs text-teal-600">10 facilities · 3 ambulances · 5 active referrals</p>
            </div>
          </div>
          <div className="px-5 py-3 flex items-center justify-between">
            <span className="text-sm text-clinical-muted">Haveli Taluka · Pune District</span>
            <Link href="/network-map" className="btn-primary btn-sm">
              Open Full Map <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="text-center text-xs text-clinical-muted-light py-2">
          <span className="font-semibold text-amber-600">SYNTHETIC DEMO DATA</span> · Not live government data
        </div>
      </div>
    </AppShell>
  );
}
