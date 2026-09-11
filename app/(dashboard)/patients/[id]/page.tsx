"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AppShell } from "@/components/shell/AppShell";
import { CarePathTimeline } from "@/components/carepath/CarePathTimeline";
import {
  AlertTriangle, Clock, User, MapPin, Stethoscope, FileText,
  Activity, Truck, ChevronRight, ArrowLeft, Heart,
  Pill, CheckCircle, Shield, Loader2, Edit
} from "lucide-react";
import { patientsApi, referralsApi } from "@/lib/api/client";
import type { Patient, CarePath, Referral, Observation } from "@/types";
import { formatDate, formatDateTime, getRiskColor, getCareStateColor, getStatusColor, timeUntil } from "@/lib/utils";
import Link from "next/link";

const TABS = ["Overview", "Clinical", "Vitals", "Referrals", "CarePath", "Consent & Audit"] as const;
type Tab = (typeof TABS)[number];

const NBA_ICONS: Record<string, React.ElementType> = {
  "confirm": CheckCircle,
  "arrange": Truck,
  "complete": Activity,
  "escalate": AlertTriangle,
  "review": FileText,
  "close": CheckCircle,
  "schedule": Clock,
};

export default function PatientPassport() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [carepath, setCarepath] = useState<CarePath | null>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [tab, setTab] = useState<Tab>("Overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAll();
  }, [id]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [pRes, cpRes, obsRes, refRes] = await Promise.all([
        patientsApi.get(id),
        patientsApi.getCarePath(id),
        patientsApi.getObservations(id),
        referralsApi.list({ patient_id: id } as any),
      ]);
      setPatient(pRes.data);
      setCarepath(cpRes.data);
      setObservations(obsRes.data);
      setReferrals(refRes.data.filter((r: Referral) => r.patient_id === id));
    } catch (e) {
      setError("Could not load patient data.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppShell title="Patient Passport">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
        </div>
      </AppShell>
    );
  }

  if (error || !patient) {
    return (
      <AppShell title="Patient Passport">
        <div className="p-6">
          <div className="card p-8 text-center">
            <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-clinical-navy font-semibold">{error || "Patient not found"}</p>
            <button onClick={() => router.push("/patients")} className="btn-secondary btn-sm mt-4">
              <ArrowLeft className="w-4 h-4" /> Back to Patients
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  const latestObs = observations[0];
  const activeReferral = referrals.find((r) =>
    ["PENDING", "ACCEPTED", "EN_ROUTE"].includes(r.status)
  );

  return (
    <AppShell title="Patient Passport" subtitle={patient.name}>
      <div className="p-6 max-w-[1200px] mx-auto">
        {/* Back */}
        <button
          onClick={() => router.push("/patients")}
          className="flex items-center gap-1.5 text-sm text-clinical-muted hover:text-clinical-navy mb-5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Patients
        </button>

        {/* Patient Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="card mb-5"
        >
          <div className="p-5">
            <div className="flex flex-col lg:flex-row lg:items-start gap-5">
              {/* Identity */}
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-bold text-teal-700">
                    {patient.name.charAt(0)}
                  </span>
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl font-bold text-clinical-navy">{patient.name}</h1>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-xs text-clinical-muted">{patient.age}y · {patient.gender}</span>
                    <span className="text-clinical-muted">·</span>
                    <span className="font-mono text-xs text-clinical-muted">{patient.patient_id}</span>
                    <span className="text-clinical-muted">·</span>
                    <span className="font-mono text-xs text-clinical-muted">{patient.care_id}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className={`badge text-xs font-semibold ${getRiskColor(patient.risk_level)}`}>
                      <AlertTriangle className="w-3 h-3" />
                      {patient.risk_level} RISK
                    </span>
                    <span className={`badge text-xs ${getCareStateColor(patient.current_state)}`}>
                      {patient.current_state.replace(/_/g, " ")}
                    </span>
                    {patient.is_pregnant && (
                      <span className="badge text-xs bg-pink-50 text-pink-700">
                        <Heart className="w-3 h-3" />
                        Pregnant {patient.trimester ? `(T${patient.trimester})` : ""}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Next Best Action */}
              {carepath?.next_best_action && (
                <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 lg:w-72 flex-shrink-0">
                  <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-1.5">
                    Next Best Action
                  </p>
                  <p className="text-sm font-semibold text-teal-800">{carepath.next_best_action}</p>
                  {carepath.deadline && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-teal-600">
                      <Clock className="w-3 h-3" />
                      Deadline: {timeUntil(carepath.deadline)}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Risk factors */}
            {patient.risk_factors.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-clinical-border">
                {patient.risk_factors.map((rf) => (
                  <span key={rf} className="text-xs bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full">
                    {rf}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-0.5 border-b border-clinical-border mb-5 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap border-b-2 -mb-px ${
                tab === t
                  ? "border-teal-600 text-teal-700"
                  : "border-transparent text-clinical-muted hover:text-clinical-navy"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="grid lg:grid-cols-3 gap-5">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">

            {tab === "Overview" && (
              <>
                {/* Location */}
                <div className="card">
                  <div className="card-header">
                    <h3 className="font-semibold text-clinical-navy text-sm">Location & Care</h3>
                  </div>
                  <div className="card-body grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-clinical-muted font-medium mb-1">Village</p>
                      <p className="text-sm font-semibold text-clinical-navy flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-teal-500" /> {patient.village}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-clinical-muted font-medium mb-1">ASHA Worker</p>
                      <p className="text-sm font-semibold text-clinical-navy flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-teal-500" /> Savita Mane
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-clinical-muted font-medium mb-1">Phone</p>
                      <p className="text-sm font-semibold text-clinical-navy">{patient.phone || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-clinical-muted font-medium mb-1">Registered</p>
                      <p className="text-sm font-semibold text-clinical-navy">{formatDate(patient.created_at)}</p>
                    </div>
                  </div>
                </div>

                {/* Known conditions */}
                <div className="card">
                  <div className="card-header">
                    <h3 className="font-semibold text-clinical-navy text-sm">Health Profile</h3>
                  </div>
                  <div className="card-body space-y-3">
                    <div>
                      <p className="text-xs text-clinical-muted font-medium mb-1.5">Known Conditions</p>
                      <div className="flex flex-wrap gap-1.5">
                        {patient.known_conditions.length > 0 ? (
                          patient.known_conditions.map((c) => (
                            <span key={c} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                              {c}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-clinical-muted">None recorded</span>
                        )}
                      </div>
                    </div>
                    {patient.medications.length > 0 && (
                      <div>
                        <p className="text-xs text-clinical-muted font-medium mb-1.5">Current Medications</p>
                        <div className="flex flex-wrap gap-1.5">
                          {patient.medications.map((m) => (
                            <span key={m} className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Pill className="w-2.5 h-2.5" /> {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {patient.allergies.length > 0 && (
                      <div>
                        <p className="text-xs text-clinical-muted font-medium mb-1.5">Allergies</p>
                        <div className="flex flex-wrap gap-1.5">
                          {patient.allergies.map((a) => (
                            <span key={a} className="text-xs bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full">
                              {a}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Active referral */}
                {activeReferral && (
                  <div className="card border-blue-200 bg-blue-50/30">
                    <div className="card-header">
                      <h3 className="font-semibold text-blue-700 text-sm flex items-center gap-2">
                        <Truck className="w-4 h-4" /> Active Referral
                      </h3>
                    </div>
                    <div className="card-body">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-mono text-xs text-clinical-muted">{activeReferral.referral_code}</p>
                          <p className="text-sm font-semibold text-clinical-navy mt-1">{activeReferral.reason}</p>
                          <div className="flex gap-2 mt-2">
                            <span className={`badge text-xs ${getStatusColor(activeReferral.status)}`}>
                              {activeReferral.status}
                            </span>
                            <span className={`badge text-xs ${
                              activeReferral.urgency === "EMERGENCY" ? "bg-red-50 text-red-700" :
                              activeReferral.urgency === "URGENT" ? "bg-amber-50 text-amber-700" :
                              "bg-gray-50 text-gray-700"
                            }`}>
                              {activeReferral.urgency}
                            </span>
                          </div>
                        </div>
                        <Link href={`/referrals`} className="btn-secondary btn-sm">
                          View <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {tab === "Vitals" && (
              <div className="card">
                <div className="card-header flex items-center justify-between">
                  <h3 className="font-semibold text-clinical-navy text-sm">Vitals History</h3>
                </div>
                <div className="card-body">
                  {observations.length === 0 ? (
                    <div className="text-center py-8">
                      <Activity className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-clinical-muted">No vitals recorded yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {observations.map((obs) => (
                        <div key={obs.id} className="border border-clinical-border rounded-lg p-4">
                          <p className="text-xs text-clinical-muted mb-3">{formatDateTime(obs.recorded_at)}</p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {obs.temperature && (
                              <div className="bg-orange-50 rounded-lg p-2.5 text-center">
                                <p className="text-lg font-bold text-orange-700">{obs.temperature}°F</p>
                                <p className="text-xs text-orange-500">Temperature</p>
                              </div>
                            )}
                            {obs.pulse && (
                              <div className="bg-red-50 rounded-lg p-2.5 text-center">
                                <p className="text-lg font-bold text-red-700">{obs.pulse}</p>
                                <p className="text-xs text-red-500">Pulse (bpm)</p>
                              </div>
                            )}
                            {obs.spo2 && (
                              <div className={`${obs.spo2 < 95 ? "bg-red-50" : "bg-blue-50"} rounded-lg p-2.5 text-center`}>
                                <p className={`text-lg font-bold ${obs.spo2 < 95 ? "text-red-700" : "text-blue-700"}`}>{obs.spo2}%</p>
                                <p className="text-xs text-blue-500">SpO₂</p>
                              </div>
                            )}
                            {obs.bp_systolic && (
                              <div className={`${obs.bp_systolic > 140 ? "bg-red-50" : "bg-emerald-50"} rounded-lg p-2.5 text-center`}>
                                <p className={`text-lg font-bold ${obs.bp_systolic > 140 ? "text-red-700" : "text-emerald-700"}`}>
                                  {obs.bp_systolic}/{obs.bp_diastolic}
                                </p>
                                <p className="text-xs text-emerald-500">BP (mmHg)</p>
                              </div>
                            )}
                            {obs.resp_rate && (
                              <div className="bg-purple-50 rounded-lg p-2.5 text-center">
                                <p className="text-lg font-bold text-purple-700">{obs.resp_rate}</p>
                                <p className="text-xs text-purple-500">Resp Rate</p>
                              </div>
                            )}
                            {obs.weight && (
                              <div className="bg-teal-50 rounded-lg p-2.5 text-center">
                                <p className="text-lg font-bold text-teal-700">{obs.weight}kg</p>
                                <p className="text-xs text-teal-500">Weight</p>
                              </div>
                            )}
                          </div>
                          {obs.symptoms.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-clinical-border">
                              <p className="text-xs text-clinical-muted mb-1.5">Symptoms</p>
                              <div className="flex flex-wrap gap-1">
                                {obs.symptoms.map((s) => (
                                  <span key={s} className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">{s}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {tab === "Referrals" && (
              <div className="space-y-3">
                {referrals.length === 0 ? (
                  <div className="card p-8 text-center">
                    <Truck className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-clinical-muted">No referrals for this patient</p>
                  </div>
                ) : (
                  referrals.map((ref) => (
                    <div key={ref.id} className="card">
                      <div className="card-body">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-mono text-xs text-clinical-muted">{ref.referral_code}</p>
                            <p className="text-sm font-semibold text-clinical-navy mt-0.5">{ref.reason}</p>
                            <div className="flex gap-2 mt-1.5">
                              <span className={`badge text-xs ${getStatusColor(ref.status)}`}>{ref.status}</span>
                              <span className={`badge text-xs ${
                                ref.urgency === "EMERGENCY" ? "bg-red-50 text-red-700" :
                                ref.urgency === "URGENT" ? "bg-amber-50 text-amber-700" :
                                "bg-gray-50 text-gray-700"
                              }`}>{ref.urgency}</span>
                              {ref.is_rerouted && <span className="badge text-xs bg-orange-50 text-orange-700">REROUTED</span>}
                            </div>
                          </div>
                          <div className="text-right text-xs text-clinical-muted">
                            <p>{formatDateTime(ref.created_at)}</p>
                            {ref.accepted_at && <p className="text-emerald-600">Accepted: {formatDateTime(ref.accepted_at)}</p>}
                          </div>
                        </div>
                        {ref.clinical_notes && (
                          <p className="text-xs text-clinical-muted mt-2 border-t border-clinical-border pt-2">
                            {ref.clinical_notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === "CarePath" && carepath && (
              <div className="card">
                <div className="card-header">
                  <h3 className="font-semibold text-clinical-navy text-sm">Care Journey</h3>
                </div>
                <div className="card-body">
                  <CarePathTimeline
                    currentState={carepath.current_state}
                    events={carepath.events}
                  />
                </div>
              </div>
            )}

            {tab === "Consent & Audit" && (
              <div className="card">
                <div className="card-header">
                  <h3 className="font-semibold text-clinical-navy text-sm">Consent & Audit Trail</h3>
                </div>
                <div className="card-body">
                  <div className={`flex items-center gap-2 p-3 rounded-lg mb-4 ${
                    patient.consent_given ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                  }`}>
                    {patient.consent_given ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <AlertTriangle className="w-4 h-4" />
                    )}
                    <span className="text-sm font-medium">
                      {patient.consent_given
                        ? `Consent given on ${formatDate(patient.created_at)}`
                        : "Consent not recorded"}
                    </span>
                  </div>
                  {carepath?.events && carepath.events.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-clinical-muted uppercase tracking-wide mb-3">Audit Events</p>
                      {carepath.events.map((ev) => (
                        <div key={ev.id} className="flex items-start gap-2.5 text-xs">
                          <div className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 flex-shrink-0" />
                          <div>
                            <span className="font-semibold text-clinical-navy">{ev.event_type.replace(/_/g, " ")}</span>
                            {ev.description && <span className="text-clinical-muted"> — {ev.description}</span>}
                            <span className="text-clinical-muted-light ml-1">· {formatDateTime(ev.created_at)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar: CarePath always visible */}
          <div className="space-y-4">
            {carepath && (
              <div className="card">
                <div className="card-header">
                  <h3 className="font-semibold text-clinical-navy text-sm">Care Journey</h3>
                </div>
                <div className="card-body">
                  <CarePathTimeline
                    currentState={carepath.current_state}
                    events={carepath.events}
                    compact={false}
                  />
                </div>
              </div>
            )}

            {/* Quick actions */}
            <div className="card">
              <div className="card-header">
                <h3 className="font-semibold text-clinical-navy text-sm">Actions</h3>
              </div>
              <div className="card-body space-y-2">
                <Link href={`/referrals`} className="btn-primary w-full">
                  <Truck className="w-4 h-4" /> Create Referral
                </Link>
                <button className="btn-secondary w-full">
                  <Stethoscope className="w-4 h-4" /> Record Consultation
                </button>
                <button className="btn-secondary w-full">
                  <Activity className="w-4 h-4" /> Add Vitals
                </button>
                <Link href="/network-map" className="btn-secondary w-full">
                  <MapPin className="w-4 h-4" /> Route Patient
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
