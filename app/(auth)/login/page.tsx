"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Heart, ArrowLeft, ArrowRight, User, Stethoscope, Building2,
  Shield, Eye, EyeOff, Loader2, UserCheck, ChevronRight
} from "lucide-react";
import { authApi } from "@/lib/api/client";
import { useAuthStore } from "@/lib/stores/authStore";
import type { Role } from "@/types";

interface RoleOption {
  role: Role;
  icon: React.ElementType;
  title: string;
  description: string;
  responsibilities: string;
  demoEmail: string;
  color: string;
  bgColor: string;
}

const roles: RoleOption[] = [
  {
    role: "ASHA",
    icon: User,
    title: "ASHA Worker",
    description: "Accredited Social Health Activist",
    responsibilities: "Field care, household visits and patient follow-up",
    demoEmail: "savita.mane@arogyamarg.gov.in",
    color: "text-teal-700",
    bgColor: "bg-teal-50 border-teal-200 hover:border-teal-400 hover:bg-teal-50",
  },
  {
    role: "CHO",
    icon: UserCheck,
    title: "CHO",
    description: "Community Health Officer",
    responsibilities: "Sub-centre operations and community health supervision",
    demoEmail: "savita.mane@arogyamarg.gov.in",
    color: "text-blue-700",
    bgColor: "bg-blue-50 border-blue-200 hover:border-blue-400 hover:bg-blue-50",
  },
  {
    role: "PHC_DOCTOR",
    icon: Stethoscope,
    title: "PHC Doctor",
    description: "Primary Health Centre Physician",
    responsibilities: "Clinical assessment, consultation and referral decisions",
    demoEmail: "anil.patil@arogyamarg.gov.in",
    color: "text-indigo-700",
    bgColor: "bg-indigo-50 border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50",
  },
  {
    role: "HOSPITAL_STAFF",
    icon: Building2,
    title: "Hospital Staff",
    description: "Rural / District Hospital",
    responsibilities: "Referral intake, facility coordination and patient management",
    demoEmail: "ravi.kulkarni@arogyamarg.gov.in",
    color: "text-purple-700",
    bgColor: "bg-purple-50 border-purple-200 hover:border-purple-400 hover:bg-purple-50",
  },
  {
    role: "SPECIALIST",
    icon: Stethoscope,
    title: "Specialist",
    description: "District Hospital Specialist",
    responsibilities: "Specialist consultation and treatment at district level",
    demoEmail: "meera.deshpande@arogyamarg.gov.in",
    color: "text-rose-700",
    bgColor: "bg-rose-50 border-rose-200 hover:border-rose-400 hover:bg-rose-50",
  },
  {
    role: "DISTRICT_ADMIN",
    icon: Shield,
    title: "District Admin",
    description: "District Health Administration",
    responsibilities: "Network operations, public-health intelligence and oversight",
    demoEmail: "rajesh.kale@arogyamarg.gov.in",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50",
  },
];

const roleRedirect: Record<Role, string> = {
  ASHA: "/asha",
  CHO: "/asha",
  PHC_DOCTOR: "/phc",
  HOSPITAL_STAFF: "/hospital",
  SPECIALIST: "/specialist",
  DISTRICT_ADMIN: "/command-center",
};

const loginSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(4, "Password required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState<RoleOption | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    setError(null);
    try {
      const res = await authApi.login(data.email, data.password);
      login(res.data.user, res.data.access_token);
      const redirect = roleRedirect[res.data.user.role as Role] || "/command-center";
      router.push(redirect);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      setError(err?.response?.data?.detail || "Login failed. Check credentials and try again.");
    }
  };

  const fillDemo = (role: RoleOption) => {
    setValue("email", role.demoEmail);
    setValue("password", "demo1234");
  };

  return (
    <div className="min-h-screen bg-clinical-bg flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-96 bg-teal-700 p-10 text-white flex-shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <Heart className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Arogya Marg</h1>
              <p className="text-teal-200 text-xs">आरोग्य मार्ग</p>
            </div>
          </div>
          <p className="text-3xl font-bold leading-tight mb-4">
            Right Care.<br />Right Place.<br />Right Time.
          </p>
          <p className="text-teal-200 text-sm leading-relaxed">
            Patient journey orchestration for rural India. Coordinating care from ASHA to specialist and back.
          </p>
        </div>

        <div className="space-y-3">
          {[
            "CarePath state machine — 12 stages",
            "Smart Facility Router",
            "Referral Guardian",
            "Real Google Maps network",
            "Offline ASHA workflow",
          ].map((f) => (
            <div key={f} className="flex items-center gap-2.5 text-sm text-teal-100">
              <ChevronRight className="w-3.5 h-3.5 text-teal-300 flex-shrink-0" />
              {f}
            </div>
          ))}
          <div className="pt-4 text-xs text-teal-300 border-t border-teal-600">
            Pune District Demo
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait">
            {!selectedRole ? (
              <motion.div
                key="role-select"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-clinical-navy mb-2">
                    How are you accessing Arogya Marg?
                  </h2>
                  <p className="text-clinical-muted text-sm">
                    Select your role to see the right workspace for your work
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {roles.map((role) => {
                    const Icon = role.icon;
                    return (
                      <button
                        key={role.role}
                        onClick={() => {
                          setSelectedRole(role);
                          fillDemo(role);
                        }}
                        className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all duration-150 ${role.bgColor}`}
                      >
                        <div className={`w-9 h-9 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm`}>
                          <Icon className={`w-4.5 h-4.5 ${role.color}`} />
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm font-semibold ${role.color}`}>{role.title}</p>
                          <p className="text-xs text-clinical-muted mt-0.5">{role.responsibilities}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <p className="text-center text-xs text-clinical-muted-light mt-6">
                  All accounts use{" "}
                  <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-clinical-muted">demo1234</span>{" "}
                  as the password for the hackathon demo
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="login-form"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <button
                  onClick={() => { setSelectedRole(null); setError(null); }}
                  className="flex items-center gap-1.5 text-sm text-clinical-muted hover:text-clinical-navy mb-6 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Change role
                </button>

                <div className="mb-8">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border-2 ${selectedRole.bgColor} ${selectedRole.color} mb-3`}>
                    <selectedRole.icon className="w-3 h-3" />
                    {selectedRole.title}
                  </div>
                  <h2 className="text-2xl font-bold text-clinical-navy">{selectedRole.description}</h2>
                  <p className="text-clinical-muted text-sm mt-1">{selectedRole.responsibilities}</p>
                </div>

                <div className="card p-6">
                  {/* Demo credentials notice */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5">
                    <p className="text-xs font-semibold text-amber-800 mb-1">Demo Credentials</p>
                    <p className="text-xs text-amber-700 font-mono">{selectedRole.demoEmail}</p>
                    <p className="text-xs text-amber-700 font-mono">Password: demo1234</p>
                    <button
                      type="button"
                      onClick={() => fillDemo(selectedRole)}
                      className="text-xs text-amber-700 font-semibold underline mt-1"
                    >
                      Auto-fill demo credentials
                    </button>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <label className="label">Email / Employee ID</label>
                      <input
                        {...register("email")}
                        type="email"
                        className="input"
                        placeholder="your@email.gov.in"
                        autoComplete="email"
                      />
                      {errors.email && (
                        <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="label">Password</label>
                      <div className="relative">
                        <input
                          {...register("password")}
                          type={showPassword ? "text" : "password"}
                          className="input pr-10"
                          placeholder="••••••••"
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-clinical-muted hover:text-clinical-navy"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
                      )}
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-sm text-red-700">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary w-full mb-3"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        <>
                          Sign In <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                    
                    <div className="text-center">
                      <p className="text-sm text-clinical-muted">
                        Don't have an account?{' '}
                        <a href="/signup" className="text-teal-600 font-semibold hover:underline">
                          Sign up here
                        </a>
                      </p>
                    </div>
                  </form>
                </div>

                <p className="text-center text-xs text-clinical-muted-light mt-4">
                  Synthetic demonstration data · Not live government systems
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
