"use client";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/shell/AppShell";
import { analyticsApi } from "@/lib/api/client";
import type { AnalyticsSummary } from "@/types";
import {
  BarChart, Bar, LineChart, Line, FunnelChart, Funnel, LabelList,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
} from "recharts";
import { TrendingUp, TrendingDown, AlertTriangle, Activity, Loader2, RefreshCw } from "lucide-react";

const FUNNEL_DATA = [
  { name: "Identified", value: 42, fill: "#0d9488" },
  { name: "Consulted", value: 38, fill: "#0891b2" },
  { name: "Referred", value: 28, fill: "#0284c7" },
  { name: "Accepted", value: 24, fill: "#1d4ed8" },
  { name: "Arrived", value: 21, fill: "#4338ca" },
  { name: "Treated", value: 19, fill: "#7c3aed" },
  { name: "Follow-up", value: 14, fill: "#9333ea" },
  { name: "Closed", value: 11, fill: "#10b981" },
];

const VILLAGE_DATA = [
  { village: "Uruli Kanchan", high_risk: 8, total: 22 },
  { village: "Wagholi", high_risk: 5, total: 18 },
  { village: "Manjari", high_risk: 6, total: 15 },
  { village: "Kesnand", high_risk: 3, total: 12 },
  { village: "Nanded Fata", high_risk: 4, total: 10 },
  { village: "Loni Kalbhor", high_risk: 2, total: 8 },
];

const TREND_DATA = [
  { day: "Mon", referrals: 4, completed: 2 },
  { day: "Tue", referrals: 7, completed: 5 },
  { day: "Wed", referrals: 5, completed: 4 },
  { day: "Thu", referrals: 9, completed: 6 },
  { day: "Fri", referrals: 6, completed: 5 },
  { day: "Sat", referrals: 3, completed: 3 },
  { day: "Sun", referrals: 2, completed: 2 },
];

const FACILITY_DATA = [
  { name: "PHC Manjari", beds_used: 60, capacity: 100 },
  { name: "RH Wagholi", beds_used: 58, capacity: 100 },
  { name: "RH Loni", beds_used: 98, capacity: 100 },
  { name: "PHC Kesnand", beds_used: 80, capacity: 100 },
  { name: "Sassoon DH", beds_used: 72, capacity: 100 },
];

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.summary().then(res => setSummary(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <AppShell title="District Intelligence" subtitle="Pune District Analytics">
      <div className="p-6 max-w-[1400px] mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-clinical-navy">Operational Analytics</h2>
            <p className="text-sm text-clinical-muted">What is happening in the district right now?</p>
          </div>
          <button
            onClick={() => analyticsApi.summary().then(r => setSummary(r.data))}
            className="btn-secondary btn-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        {/* KPI cards */}
        {loading ? (
          <div className="flex items-center justify-center h-24">
            <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Patients", value: summary?.total_patients ?? 42, trend: "+5 this week", up: true, color: "text-teal-600", bg: "bg-teal-50" },
              { label: "Active Journeys", value: summary?.active_journeys ?? 18, trend: "4 high risk", up: false, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Completion Rate", value: `${summary?.referral_completion_rate ?? 87}%`, trend: "+3% vs last week", up: true, color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "Stuck Patients", value: summary?.stuck_patients ?? 2, trend: "Needs attention", up: false, color: "text-red-600", bg: "bg-red-50" },
            ].map((m) => (
              <div key={m.label} className="card p-4">
                <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
                <p className="text-xs text-clinical-muted mt-0.5">{m.label}</p>
                <div className={`flex items-center gap-1 mt-2 text-xs ${m.up ? "text-emerald-600" : "text-amber-600"}`}>
                  {m.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {m.trend}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-5">
          {/* Care leakage funnel */}
          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold text-clinical-navy text-sm">Care Leakage</h3>
              <p className="text-xs text-clinical-muted mt-0.5">Where are patients dropping out of the care journey?</p>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={FUNNEL_DATA} layout="vertical" margin={{ top: 0, right: 30, left: 70, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
                  <Tooltip
                    contentStyle={{ fontSize: "11px", borderRadius: "8px", border: "1px solid #e2e8f0" }}
                    formatter={(val) => [`${val} patients`, "Count"]}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {FUNNEL_DATA.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-center text-red-600 font-medium mt-2">
                ⚠ Largest drop: Referred → Accepted (28→24, 14% loss)
              </p>
            </div>
          </div>

          {/* Referral trends */}
          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold text-clinical-navy text-sm">Referral Trend (This Week)</h3>
              <p className="text-xs text-clinical-muted mt-0.5">Daily referrals created vs completed</p>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={TREND_DATA} margin={{ top: 0, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                  <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Line
                    type="monotone"
                    dataKey="referrals"
                    stroke="#0d9488"
                    strokeWidth={2}
                    dot={{ fill: "#0d9488", r: 3 }}
                    name="Created"
                  />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: "#10b981", r: 3 }}
                    strokeDasharray="5 5"
                    name="Completed"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Village risk heatmap */}
          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold text-clinical-navy text-sm">High-Risk by Village</h3>
              <p className="text-xs text-clinical-muted mt-0.5">Which villages have rising high-risk cases?</p>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={VILLAGE_DATA} margin={{ top: 0, right: 20, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="village" tick={{ fontSize: 10, fill: "#64748b" }} angle={-30} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                  <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                  <Bar dataKey="total" fill="#e2e8f0" radius={[4, 4, 0, 0]} name="Total" />
                  <Bar dataKey="high_risk" fill="#ef4444" radius={[4, 4, 0, 0]} name="High Risk" />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-center text-amber-600 font-medium mt-2">
                ⚠ Uruli Kanchan highest high-risk concentration (36%)
              </p>
            </div>
          </div>

          {/* Facility utilization */}
          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold text-clinical-navy text-sm">Facility Utilization</h3>
              <p className="text-xs text-clinical-muted mt-0.5">Which facilities are overloaded?</p>
            </div>
            <div className="card-body space-y-3">
              {FACILITY_DATA.map((f) => (
                <div key={f.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-clinical-navy font-medium">{f.name}</span>
                    <span className={`font-semibold ${
                      f.beds_used >= 90 ? "text-red-600" :
                      f.beds_used >= 70 ? "text-amber-600" :
                      "text-emerald-600"
                    }`}>{f.beds_used}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        f.beds_used >= 90 ? "bg-red-500" :
                        f.beds_used >= 70 ? "bg-amber-400" :
                        "bg-emerald-500"
                      }`}
                      style={{ width: `${f.beds_used}%` }}
                    />
                  </div>
                </div>
              ))}
              <p className="text-xs text-center text-red-600 font-medium pt-1">
                ⚠ Rural Hospital Loni Kalbhor at 98% — immediate action needed
              </p>
            </div>
          </div>
        </div>

        {/* Facility status summary */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-clinical-navy text-sm">Facility Network Status</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              {[
                { label: "Ready", value: summary?.facilities_ready ?? 6, color: "text-emerald-600", bg: "bg-emerald-50" },
                { label: "Limited", value: summary?.facilities_limited ?? 2, color: "text-amber-600", bg: "bg-amber-50" },
                { label: "Critical", value: summary?.facilities_critical ?? 1, color: "text-red-600", bg: "bg-red-50" },
                { label: "Offline", value: summary?.facilities_offline ?? 0, color: "text-gray-600", bg: "bg-gray-50" },
              ].map((s) => (
                <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
                  <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-clinical-muted mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-clinical-muted-light py-2">
          <span className="font-semibold text-amber-600">SYNTHETIC DEMO DATA</span> · Not live government data
        </p>
      </div>
    </AppShell>
  );
}
