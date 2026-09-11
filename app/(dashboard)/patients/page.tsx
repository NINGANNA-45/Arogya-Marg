"use client";
import { useEffect, useState, useCallback } from "react";
import { AppShell } from "@/components/shell/AppShell";
import { patientsApi } from "@/lib/api/client";
import type { Patient } from "@/types";
import { CAREPATH_LABELS, RISK_LABELS } from "@/types";
import { getRiskColor, getCareStateColor, formatDate } from "@/lib/utils";
import {
  Search, UserPlus, Loader2, AlertTriangle, Filter,
  ChevronRight, Users, Heart
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function PatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");

  const loadPatients = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (riskFilter) params.risk = riskFilter;
      if (stateFilter) params.state = stateFilter;
      const res = await patientsApi.list(params);
      setPatients(res.data);
    } catch {
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }, [search, riskFilter, stateFilter]);

  useEffect(() => {
    const t = setTimeout(loadPatients, 300);
    return () => clearTimeout(t);
  }, [loadPatients]);

  return (
    <AppShell title="Patients" subtitle="Registry">
      <div className="p-6 max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-clinical-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9"
              placeholder="Search patient, ID, village..."
            />
          </div>

          {/* Filters */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="input w-36"
          >
            <option value="">All Risk</option>
            {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="input w-44"
          >
            <option value="">All States</option>
            {Object.entries(CAREPATH_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>

          <Link href="/patients/new" className="btn-primary whitespace-nowrap">
            <UserPlus className="w-4 h-4" />
            Add Patient
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            { label: "Total", value: patients.length, color: "text-clinical-navy" },
            { label: "High Risk", value: patients.filter(p => ["HIGH","CRITICAL"].includes(p.risk_level)).length, color: "text-red-600" },
            { label: "Pregnant", value: patients.filter(p => p.is_pregnant).length, color: "text-pink-600" },
            { label: "Active", value: patients.filter(p => p.is_active).length, color: "text-teal-600" },
          ].map((s) => (
            <div key={s.label} className="card p-3">
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-clinical-muted">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Patient table */}
        {loading ? (
          <div className="card flex items-center justify-center h-48">
            <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
          </div>
        ) : patients.length === 0 ? (
          <div className="card flex flex-col items-center justify-center h-48 gap-3">
            <Users className="w-10 h-10 text-gray-200" />
            <p className="text-clinical-muted text-sm">No patients found</p>
            <Link href="/patients/new" className="btn-primary btn-sm">
              <UserPlus className="w-3.5 h-3.5" /> Add First Patient
            </Link>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table-clinical">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>ID</th>
                    <th>Age/Gender</th>
                    <th>Village</th>
                    <th>Risk</th>
                    <th>Care State</th>
                    <th>Registered</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((p, i) => (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="cursor-pointer"
                      onClick={() => router.push(`/patients/${p.id}`)}
                    >
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-semibold text-teal-700">{p.name.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-clinical-navy">{p.name}</p>
                            {p.is_pregnant && (
                              <span className="text-[10px] text-pink-600 flex items-center gap-0.5">
                                <Heart className="w-2.5 h-2.5" /> Pregnant {p.trimester ? `T${p.trimester}` : ""}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td><span className="font-mono text-xs text-clinical-muted">{p.patient_id}</span></td>
                      <td className="text-sm text-clinical-navy">{p.age}y · {p.gender.charAt(0)}</td>
                      <td className="text-sm text-clinical-muted">{p.village}</td>
                      <td>
                        <span className={`badge text-xs ${getRiskColor(p.risk_level)}`}>
                          {p.risk_level}
                        </span>
                      </td>
                      <td>
                        <span className={`badge text-xs ${getCareStateColor(p.current_state)}`}>
                          {CAREPATH_LABELS[p.current_state]}
                        </span>
                      </td>
                      <td className="text-xs text-clinical-muted">{formatDate(p.created_at)}</td>
                      <td>
                        <ChevronRight className="w-4 h-4 text-clinical-muted" />
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
