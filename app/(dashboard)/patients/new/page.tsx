"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/shell/AppShell";
import { patientsApi } from "@/lib/api/client";
import { ArrowLeft, ArrowRight, CheckCircle, Loader2, User, Home, Heart, Activity, Shield } from "lucide-react";

const STEPS = ["Identity", "Household", "Health Profile", "Assessment", "Consent", "Review"];

const schema = z.object({
  // Step 1
  name: z.string().min(2, "Name required"),
  age: z.coerce.number().min(0).max(120),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  phone: z.string().optional(),
  village: z.string().min(2, "Village required"),
  // Step 3
  is_pregnant: z.boolean().default(false),
  trimester: z.coerce.number().optional(),
  prev_hospitalization: z.boolean().default(false),
  // Step 4
  temperature: z.coerce.number().optional(),
  pulse: z.coerce.number().optional(),
  resp_rate: z.coerce.number().optional(),
  spo2: z.coerce.number().optional(),
  bp_systolic: z.coerce.number().optional(),
  bp_diastolic: z.coerce.number().optional(),
  weight: z.coerce.number().optional(),
  risk_level: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("LOW"),
  // Step 5
  consent_given: z.boolean().refine(v => v === true, "Consent is required"),
});

type FormData = z.infer<typeof schema>;

export default function NewPatientPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [conditions, setConditions] = useState<string[]>([]);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [conditionInput, setConditionInput] = useState("");
  const [symptomInput, setSymptomInput] = useState("");
  const [createdPatient, setCreatedPatient] = useState<{ patient_id: string; care_id: string; id: string } | null>(null);

  const { register, handleSubmit, watch, trigger, getValues, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: { risk_level: "LOW", is_pregnant: false, prev_hospitalization: false, consent_given: false },
  });

  const isPregnant = watch("is_pregnant");

  const nextStep = async () => {
    const fieldsToValidate: (keyof FormData)[][] = [
      ["name", "age", "gender", "village"],
      [],
      [],
      [],
      ["consent_given"],
      [],
    ];
    const valid = await trigger(fieldsToValidate[step] as any);
    if (valid) setStep(s => s + 1);
  };

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        ...data,
        known_conditions: conditions,
        symptoms,
        medications: [],
        allergies: [],
        risk_factors: conditions.filter(c => c),
      };
      const res = await patientsApi.create(payload);
      setCreatedPatient(res.data);
      setStep(6); // success
    } catch (e) {
      alert("Failed to create patient. Please try again.");
    }
  };

  const addCondition = () => {
    if (conditionInput.trim()) {
      setConditions(p => [...p, conditionInput.trim()]);
      setConditionInput("");
    }
  };

  const addSymptom = () => {
    if (symptomInput.trim()) {
      setSymptoms(p => [...p, symptomInput.trim()]);
      setSymptomInput("");
    }
  };

  if (createdPatient) {
    return (
      <AppShell title="Add Patient">
        <div className="p-6 max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-8 text-center"
          >
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-clinical-navy mb-2">Patient Registered</h2>
            <p className="text-clinical-muted text-sm mb-5">Care journey has been initiated</p>
            <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-clinical-muted">Patient ID</span>
                <span className="font-mono text-sm font-semibold text-clinical-navy">{createdPatient.patient_id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-clinical-muted">Care ID</span>
                <span className="font-mono text-sm font-semibold text-clinical-navy">{createdPatient.care_id}</span>
              </div>
            </div>
            <button
              onClick={() => router.push(`/patients/${createdPatient.id}`)}
              className="btn-primary w-full"
            >
              Open Patient Passport <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setCreatedPatient(null); setStep(0); }}
              className="btn-secondary w-full mt-2"
            >
              Add Another Patient
            </button>
          </motion.div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Add Patient">
      <div className="p-6 max-w-2xl mx-auto">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center gap-1 mb-3">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-1 flex-1">
                <div className={`h-1.5 flex-1 rounded-full transition-all ${
                  i <= step ? "bg-teal-500" : "bg-gray-200"
                }`} />
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            <span className="text-xs font-semibold text-teal-600">Step {step + 1} of {STEPS.length}</span>
            <span className="text-xs text-clinical-muted">{STEPS[step]}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="card p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 bg-teal-100 rounded-lg flex items-center justify-center">
                      <User className="w-4.5 h-4.5 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-clinical-navy">Basic Identity</h3>
                      <p className="text-xs text-clinical-muted">Patient personal information</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="label">Full Name *</label>
                      <input {...register("name")} className="input" placeholder="Patient full name" />
                      {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label">Age *</label>
                        <input {...register("age")} type="number" className="input" placeholder="Age in years" min="0" max="120" />
                        {errors.age && <p className="text-xs text-red-600 mt-1">{errors.age.message}</p>}
                      </div>
                      <div>
                        <label className="label">Gender *</label>
                        <select {...register("gender")} className="input">
                          <option value="">Select gender</option>
                          <option value="FEMALE">Female</option>
                          <option value="MALE">Male</option>
                          <option value="OTHER">Other</option>
                        </select>
                        {errors.gender && <p className="text-xs text-red-600 mt-1">{errors.gender.message}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label">Phone</label>
                        <input {...register("phone")} className="input" placeholder="10-digit mobile" type="tel" />
                      </div>
                      <div>
                        <label className="label">Village *</label>
                        <input {...register("village")} className="input" placeholder="Village name" />
                        {errors.village && <p className="text-xs text-red-600 mt-1">{errors.village.message}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="card p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Home className="w-4.5 h-4.5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-clinical-navy">Household Details</h3>
                      <p className="text-xs text-clinical-muted">Family and contact information</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                      Household linking is available after patient registration. You can search and link a household from the Patient Passport.
                    </div>
                    <p className="text-sm text-clinical-muted">Patient will be registered without a household link. This can be updated later.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="card p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 bg-pink-100 rounded-lg flex items-center justify-center">
                      <Heart className="w-4.5 h-4.5 text-pink-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-clinical-navy">Health Profile</h3>
                      <p className="text-xs text-clinical-muted">Medical history and conditions</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="label">Known Conditions</label>
                      <div className="flex gap-2 mb-2">
                        <input
                          value={conditionInput}
                          onChange={(e) => setConditionInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCondition())}
                          className="input flex-1"
                          placeholder="e.g. Hypertension, Diabetes"
                        />
                        <button type="button" onClick={addCondition} className="btn-secondary btn-sm">Add</button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {conditions.map((c) => (
                          <span key={c} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                            {c}
                            <button type="button" onClick={() => setConditions(p => p.filter(x => x !== c))} className="ml-0.5 text-blue-400 hover:text-blue-700">×</button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <input {...register("is_pregnant")} type="checkbox" id="pregnant" className="w-4 h-4 accent-teal-600" />
                      <label htmlFor="pregnant" className="text-sm font-medium text-clinical-navy cursor-pointer">Currently pregnant</label>
                    </div>

                    {isPregnant && (
                      <div>
                        <label className="label">Trimester</label>
                        <select {...register("trimester")} className="input">
                          <option value="">Select trimester</option>
                          <option value="1">First Trimester</option>
                          <option value="2">Second Trimester</option>
                          <option value="3">Third Trimester</option>
                        </select>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <input {...register("prev_hospitalization")} type="checkbox" id="prevhosp" className="w-4 h-4 accent-teal-600" />
                      <label htmlFor="prevhosp" className="text-sm font-medium text-clinical-navy cursor-pointer">Previous hospitalization</label>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="card p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Activity className="w-4.5 h-4.5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-clinical-navy">Assessment & Vitals</h3>
                      <p className="text-xs text-clinical-muted">Current symptoms and measurements</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="label">Symptoms</label>
                      <div className="flex gap-2 mb-2">
                        <input
                          value={symptomInput}
                          onChange={(e) => setSymptomInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSymptom())}
                          className="input flex-1"
                          placeholder="e.g. Fever, Headache"
                        />
                        <button type="button" onClick={addSymptom} className="btn-secondary btn-sm">Add</button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {symptoms.map((s) => (
                          <span key={s} className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                            {s}
                            <button type="button" onClick={() => setSymptoms(p => p.filter(x => x !== s))} className="ml-0.5 text-amber-400 hover:text-amber-700">×</button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="label">Temperature (°F)</label>
                        <input {...register("temperature")} type="number" step="0.1" className="input" placeholder="98.6" />
                      </div>
                      <div>
                        <label className="label">Pulse (bpm)</label>
                        <input {...register("pulse")} type="number" className="input" placeholder="72" />
                      </div>
                      <div>
                        <label className="label">SpO₂ (%)</label>
                        <input {...register("spo2")} type="number" className="input" placeholder="98" />
                      </div>
                      <div>
                        <label className="label">BP Systolic</label>
                        <input {...register("bp_systolic")} type="number" className="input" placeholder="120" />
                      </div>
                      <div>
                        <label className="label">BP Diastolic</label>
                        <input {...register("bp_diastolic")} type="number" className="input" placeholder="80" />
                      </div>
                      <div>
                        <label className="label">Weight (kg)</label>
                        <input {...register("weight")} type="number" step="0.1" className="input" placeholder="65" />
                      </div>
                    </div>

                    <div>
                      <label className="label">Risk Assessment</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const).map((r) => (
                          <label key={r} className={`flex items-center gap-2 p-2.5 rounded-lg border-2 cursor-pointer transition-all ${
                            watch("risk_level") === r ? (
                              r === "LOW" ? "border-emerald-400 bg-emerald-50" :
                              r === "MEDIUM" ? "border-amber-400 bg-amber-50" :
                              r === "HIGH" ? "border-red-400 bg-red-50" :
                              "border-purple-400 bg-purple-50"
                            ) : "border-gray-200 bg-white hover:border-gray-300"
                          }`}>
                            <input {...register("risk_level")} type="radio" value={r} className="sr-only" />
                            <span className={`text-xs font-semibold ${
                              r === "LOW" ? "text-emerald-700" :
                              r === "MEDIUM" ? "text-amber-700" :
                              r === "HIGH" ? "text-red-700" :
                              "text-purple-700"
                            }`}>{r}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="card p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-4.5 h-4.5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-clinical-navy">Consent</h3>
                      <p className="text-xs text-clinical-muted">Patient data usage consent</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed">
                      <p className="font-semibold mb-2">Data Usage Notice</p>
                      <p>Your health information will be securely stored and used to coordinate your care across the healthcare network. This includes sharing with your ASHA worker, PHC doctors, and referral hospitals as needed for your treatment.</p>
                      <p className="mt-2">Data is stored in compliance with applicable health data protection regulations. You may request access or deletion of your records at any time.</p>
                      <p className="mt-2 text-xs text-gray-500">This is a demonstration system using synthetic data.</p>
                    </div>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input {...register("consent_given")} type="checkbox" className="w-4 h-4 mt-0.5 accent-teal-600" />
                      <span className="text-sm text-clinical-navy">
                        I understand and consent to my health data being used for care coordination as described above.
                        <span className="text-red-500 ml-1">*</span>
                      </span>
                    </label>
                    {errors.consent_given && (
                      <p className="text-xs text-red-600">{errors.consent_given.message}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="card p-6">
                  <h3 className="font-semibold text-clinical-navy mb-4">Review Patient Details</h3>
                  <div className="space-y-3">
                    {[
                      ["Name", getValues("name")],
                      ["Age", `${getValues("age")} years`],
                      ["Gender", getValues("gender")],
                      ["Phone", getValues("phone") || "—"],
                      ["Village", getValues("village")],
                      ["Pregnant", getValues("is_pregnant") ? `Yes (Trimester ${getValues("trimester") || "?"})` : "No"],
                      ["Risk Level", getValues("risk_level")],
                      ["Known Conditions", conditions.join(", ") || "None"],
                      ["Symptoms", symptoms.join(", ") || "None"],
                      ["Consent", "Given"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between py-2 border-b border-clinical-border last:border-0">
                        <span className="text-xs text-clinical-muted">{k}</span>
                        <span className="text-sm font-medium text-clinical-navy">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-5">
            <button
              type="button"
              onClick={() => setStep(s => s - 1)}
              disabled={step === 0}
              className="btn-secondary"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            {step < STEPS.length - 1 ? (
              <button type="button" onClick={nextStep} className="btn-primary">
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button type="submit" disabled={isSubmitting} className="btn-primary">
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
                ) : (
                  <><CheckCircle className="w-4 h-4" /> Create Patient</>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </AppShell>
  );
}
