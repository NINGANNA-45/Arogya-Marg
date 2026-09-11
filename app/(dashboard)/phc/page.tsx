"use client";
import { AppShell } from "@/components/shell/AppShell";
import { Activity, Users, Truck, Stethoscope, ArrowRight, Clock, AlertTriangle } from "lucide-react";
import Link from "next/link";

const QUEUE = [
  { name: "Ramesh Pawar", age: 58, chief: "Chest pain, fever 3 days", risk: "HIGH", wait: "Waiting" },
  { name: "Anita Kamble", age: 34, chief: "Abdominal pain, 32wk pregnant", risk: "MEDIUM", wait: "In consultation" },
  { name: "Suresh Gaikwad", age: 72, chief: "Breathlessness, cough", risk: "HIGH", wait: "Waiting" },
  { name: "Meera Shinde", age: 28, chief: "High fever, rash", risk: "LOW", wait: "Waiting" },
];

export default function PHCPage() {
  return (
    <AppShell title="PHC Workspace" subtitle="Primary Health Centre · Kesnand">
      <div className="p-6 max-w-[1100px] mx-auto space-y-5">

        {/* Header metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Waiting", value: 3, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "In Consultation", value: 1, icon: Stethoscope, color: "text-teal-600", bg: "bg-teal-50" },
            { label: "Active Referrals", value: 2, icon: Truck, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "High Risk", value: 2, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
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

        {/* Patient queue */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="font-semibold text-clinical-navy">Patient Queue</h3>
            <Link href="/patients/new" className="btn-primary btn-sm">
              Walk-in <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="table-clinical">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Chief Complaint</th>
                  <th>Risk</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {QUEUE.map((p) => (
                  <tr key={p.name}>
                    <td>
                      <div>
                        <p className="font-medium text-clinical-navy text-sm">{p.name}</p>
                        <p className="text-xs text-clinical-muted">{p.age}y</p>
                      </div>
                    </td>
                    <td className="text-sm text-clinical-muted max-w-[200px] truncate">{p.chief}</td>
                    <td>
                      <span className={`badge text-xs ${
                        p.risk === "HIGH" ? "bg-red-50 text-red-700" :
                        p.risk === "MEDIUM" ? "bg-amber-50 text-amber-700" :
                        "bg-emerald-50 text-emerald-700"
                      }`}>{p.risk}</span>
                    </td>
                    <td className="text-sm text-clinical-muted">{p.wait}</td>
                    <td>
                      <div className="flex gap-1.5">
                        <Link href="/patients" className="btn-secondary btn-sm">View</Link>
                        <Link href="/referrals" className="btn-primary btn-sm">Refer</Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Facility status card */}
        <div className="card p-5">
          <h3 className="font-semibold text-clinical-navy mb-3">PHC Kesnand Status</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: "Beds available", value: "4/20" },
              { label: "Oxygen", value: "Available" },
              { label: "Readiness", value: "62%" },
              { label: "Lab", value: "Functional" },
              { label: "Pharmacy", value: "Stocked" },
              { label: "Ambulance", value: "1 available" },
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
