"use client";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/shell/AppShell";
import { referralsApi, facilitiesApi } from "@/lib/api/client";
import type { Referral, Facility } from "@/types";
import { formatDateTime, getStatusColor, timeAgo } from "@/lib/utils";
import {
  Truck, AlertTriangle, Clock, CheckCircle, Search,
  Filter, ChevronRight, ArrowRight, Loader2, RefreshCw,
  XCircle, RotateCcw, MapPin
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type StatusFilter = "all" | "PENDING" | "ACCEPTED" | "EN_ROUTE" | "ARRIVED" | "COMPLETED" | "REROUTED";

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "EN_ROUTE", label: "En Route" },
  { value: "ARRIVED", label: "Arrived" },
  { value: "COMPLETED", label: "Completed" },
  { value: "REROUTED", label: "Rerouted" },
];

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [facilities, setFacilities] = useState<Record<string, Facility>>({});
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [loading, setLoading] = useState(true);
  const [stuckReferral, setStuckReferral] = useState<Referral | null>(null);
  const [rerouting, setRerouting] = useState(false);

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [refRes, facRes] = await Promise.all([
        referralsApi.list(statusFilter !== "all" ? { status: statusFilter } : {}),
        facilitiesApi.list(),
      ]);
      setReferrals(refRes.data);
      const facMap: Record<string, Facility> = {};
      facRes.data.forEach((f: Facility) => { facMap[f.id] = f; });
      setFacilities(facMap);
    } catch {
      setReferrals([]);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    if (urgency === "EMERGENCY") return "bg-red-50 text-red-700";
    if (urgency === "URGENT") return "bg-amber-50 text-amber-700";
    return "bg-gray-50 text-gray-700";
  };

  const isDelayed = (ref: Referral) => {
    if (!ref.expected_arrival) return false;
    return new Date(ref.expected_arrival) < new Date() && !["ARRIVED", "COMPLETED"].includes(ref.status);
  };

  const stuckCount = referrals.filter(r => isDelayed(r) || r.status === "PENDING").length;

  return (
    <AppShell title="Referral Guardian" subtitle="Active Referral Monitoring">
      <div className="p-6 max-w-[1200px] mx-auto">

        {/* Header metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            { label: "Total Active", value: referrals.filter(r => !["COMPLETED", "CANCELLED", "REROUTED"].includes(r.status)).length, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Pending Acceptance", value: referrals.filter(r => r.status === "PENDING").length, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Delayed", value: referrals.filter(r => isDelayed(r)).length, color: "text-red-600", bg: "bg-red-50" },
            { label: "Completed Today", value: referrals.filter(r => r.status === "COMPLETED").length, color: "text-emerald-600", bg: "bg-emerald-50" },
          ].map((m) => (
            <div key={m.label} className="card p-3">
              <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
              <p className="text-xs text-clinical-muted">{m.label}</p>
            </div>
          ))}
        </div>

        {/* Stuck alert */}
        {stuckCount > 0 && (
          <div className="alert-warning mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">{stuckCount} referrals need attention</p>
              <p className="text-xs text-amber-700">Overdue or pending acceptance for too long</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                statusFilter === f.value
                  ? "bg-teal-600 text-white"
                  : "bg-white border border-clinical-border text-clinical-muted hover:text-clinical-navy hover:border-clinical-border-strong"
              }`}
            >
              {f.label}
            </button>
          ))}
          <button onClick={loadData} className="ml-auto btn-ghost btn-sm">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Referrals list */}
        {loading ? (
          <div className="card flex items-center justify-center h-48">
            <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
          </div>
        ) : referrals.length === 0 ? (
          <div className="card flex flex-col items-center justify-center h-48 gap-3">
            <Truck className="w-10 h-10 text-gray-200" />
            <p className="text-clinical-muted text-sm">No referrals found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {referrals.map((ref, i) => {
              const delayed = isDelayed(ref);
              const origin = facilities[ref.origin_facility_id || ""];
              const dest = facilities[ref.destination_facility_id];

              return (
                <motion.div
                  key={ref.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`card ${delayed ? "border-amber-300 bg-amber-50/30" : ""}`}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Status icon */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        delayed ? "bg-amber-100" :
                        ref.status === "COMPLETED" ? "bg-emerald-100" :
                        ref.status === "EN_ROUTE" ? "bg-blue-100" :
                        "bg-gray-100"
                      }`}>
                        {delayed ? (
                          <Clock className="w-4 h-4 text-amber-600" />
                        ) : ref.status === "COMPLETED" ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                        ) : ref.status === "EN_ROUTE" ? (
                          <Truck className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Truck className="w-4 h-4 text-gray-500" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-semibold text-clinical-navy">{ref.referral_code}</span>
                          <span className={`badge text-xs ${getStatusColor(ref.status)}`}>{ref.status}</span>
                          <span className={`badge text-xs ${getUrgencyColor(ref.urgency)}`}>{ref.urgency}</span>
                          {delayed && <span className="badge text-xs bg-amber-100 text-amber-800">DELAYED</span>}
                          {ref.is_rerouted && <span className="badge text-xs bg-orange-50 text-orange-700">REROUTED</span>}
                        </div>

                        <p className="text-sm text-clinical-navy mb-2">{ref.reason}</p>

                        {/* Route visualization */}
                        <div className="flex items-center gap-1.5 text-xs text-clinical-muted">
                          <MapPin className="w-3 h-3" />
                          <span>{origin?.name || "Field"}</span>
                          <ArrowRight className="w-3 h-3" />
                          <span className="font-medium text-clinical-navy">{dest?.name || ref.destination_facility_id}</span>
                          {ref.required_specialty && (
                            <>
                              <span className="text-clinical-muted">·</span>
                              <span>{ref.required_specialty}</span>
                            </>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          <span className="text-xs text-clinical-muted">Created: {timeAgo(ref.created_at)}</span>
                          {ref.accepted_at && (
                            <span className="text-xs text-emerald-600">Accepted: {timeAgo(ref.accepted_at)}</span>
                          )}
                          {ref.expected_arrival && !["ARRIVED", "COMPLETED"].includes(ref.status) && (
                            <span className={`text-xs ${delayed ? "text-red-600 font-semibold" : "text-clinical-muted"}`}>
                              ETA: {new Date(ref.expected_arrival).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-1.5 flex-shrink-0">
                        <Link href={`/patients/${ref.patient_id}`} className="btn-secondary btn-sm">
                          Patient →
                        </Link>
                        {ref.status === "PENDING" && (
                          <button
                            onClick={async () => { await referralsApi.accept(ref.id); loadData(); }}
                            className="btn-primary btn-sm"
                          >
                            Accept
                          </button>
                        )}
                        {ref.status === "ACCEPTED" && (
                          <button
                            onClick={async () => { await referralsApi.arrive(ref.id); loadData(); }}
                            className="btn-primary btn-sm"
                          >
                            Arrived
                          </button>
                        )}
                        {delayed && (
                          <button
                            onClick={() => setStuckReferral(ref)}
                            className="btn-danger btn-sm"
                          >
                            Why stuck?
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* "Why Stuck?" Drawer */}
        <AnimatePresence>
          {stuckReferral && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-50 flex items-end sm:items-center justify-center p-4"
              onClick={() => setStuckReferral(null)}
            >
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-clinical-lg"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-clinical-navy">Why is this referral stuck?</h3>
                    <p className="text-xs text-clinical-muted font-mono">{stuckReferral.referral_code}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-5">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm font-semibold text-red-800 mb-1">Current Status: {stuckReferral.status}</p>
                    <p className="text-sm text-red-700">
                      {stuckReferral.status === "PENDING"
                        ? "Destination facility has not accepted the referral. This may indicate the facility is busy, understaffed, or unresponsive."
                        : "Referral is overdue. Patient has not arrived at the expected time."}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-clinical-muted uppercase tracking-wide">Recommended Actions</p>
                    <div className="flex items-start gap-2.5 text-sm">
                      <span className="w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 text-teal-700 text-xs font-bold">1</span>
                      <span>Contact receiving facility directly: {facilities[stuckReferral.destination_facility_id]?.phone || "Phone not available"}</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-sm">
                      <span className="w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 text-teal-700 text-xs font-bold">2</span>
                      <span>Check ambulance status and patient location</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-sm">
                      <span className="w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 text-teal-700 text-xs font-bold">3</span>
                      <span>If facility unavailable, reroute to alternative facility</span>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs font-semibold text-blue-800 mb-1">Alternative Facility Available</p>
                    <p className="text-sm text-blue-700">
                      <strong>Sassoon District Hospital</strong> — 92% readiness, ICU available, 25 km further
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      setRerouting(true);
                      try {
                        await referralsApi.reroute(stuckReferral.id, {
                          new_destination_facility_id: "fac-005",
                          reason: "Original facility did not respond within acceptable timeframe",
                        });
                        setStuckReferral(null);
                        loadData();
                      } finally {
                        setRerouting(false);
                      }
                    }}
                    disabled={rerouting}
                    className="btn-primary flex-1"
                  >
                    {rerouting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                    Reroute to Sassoon
                  </button>
                  <button onClick={() => setStuckReferral(null)} className="btn-secondary">
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
