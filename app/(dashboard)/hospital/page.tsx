"use client";
import { AppShell } from "@/components/shell/AppShell";
import { Truck, Building2, Activity, AlertTriangle, ArrowRight, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";

const INCOMING = [
  { code: "REF-2026-00891", patient: "Rekha Patil", urgency: "URGENT", reason: "Pre-eclampsia, 36wk pregnant", eta: "8 min", from: "PHC Kesnand" },
  { code: "REF-2026-00895", patient: "Ramesh Pawar", urgency: "EMERGENCY", reason: "Suspected ACS", eta: "Arrived", from: "PHC Manjari" },
  { code: "REF-2026-00889", patient: "Sunita Jadhav", urgency: "ROUTINE", reason: "Appendicitis followup", eta: "Tomorrow", from: "PHC Kesnand" },
];

export default function HospitalPage() {
  return (
    <AppShell title="Hospital Overview" subtitle="Rural Hospital Wagholi">
      <div className="p-6 max-w-[1100px] mx-auto space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Beds Available", value: "35/60", icon: Building2, color: "text-teal-600", bg: "bg-teal-50" },
            { label: "ICU Available", value: "2/4", icon: Activity, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Incoming Referrals", value: 3, icon: Truck, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Emergency Cases", value: 1, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
          ].map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.label} className="card p-4">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg ${m.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${m.color}`} />
                  </div>
                  <div>
                    <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
                    <p className="text-xs text-clinical-muted">{m.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Incoming Referrals */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="font-semibold text-clinical-navy">Incoming Referrals</h3>
            <Link href="/referrals" className="text-xs text-teal-600 hover:underline">View all →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="table-clinical">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Patient</th>
                  <th>Reason</th>
                  <th>From</th>
                  <th>Urgency</th>
                  <th>ETA</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {INCOMING.map((r) => (
                  <tr key={r.code}>
                    <td><span className="font-mono text-xs text-clinical-muted">{r.code}</span></td>
                    <td className="font-medium text-clinical-navy text-sm">{r.patient}</td>
                    <td className="text-sm text-clinical-muted max-w-[180px] truncate">{r.reason}</td>
                    <td className="text-xs text-clinical-muted">{r.from}</td>
                    <td>
                      <span className={`badge text-xs ${
                        r.urgency === "EMERGENCY" ? "bg-red-50 text-red-700" :
                        r.urgency === "URGENT" ? "bg-amber-50 text-amber-700" :
                        "bg-gray-50 text-gray-700"
                      }`}>{r.urgency}</span>
                    </td>
                    <td>
                      <span className={`text-xs font-medium ${r.eta === "Arrived" ? "text-emerald-600" : "text-blue-600"}`}>
                        {r.eta === "Arrived" ? <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Arrived</span> : r.eta}
                      </span>
                    </td>
                    <td>
                      <button className={`btn-sm ${r.eta === "Arrived" ? "btn-primary" : "btn-secondary"}`}>
                        {r.eta === "Arrived" ? "Mark Admitted" : "Accept"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Facility details */}
        <div className="card p-5">
          <h3 className="font-semibold text-clinical-navy mb-3">Facility Status — Rural Hospital Wagholi</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: "Total beds", value: "60" },
              { label: "ICU beds", value: "4 (2 free)" },
              { label: "Oxygen", value: "Available" },
              { label: "Blood bank", value: "Available" },
              { label: "Specialists", value: "Gynaecologist, General Surgeon" },
              { label: "Readiness", value: "78%" },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-clinical-muted font-medium">{label}</p>
                <p className="text-sm font-semibold text-clinical-navy mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
