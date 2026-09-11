"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Heart, ArrowRight, Eye, EyeOff, Loader2, ChevronRight, CheckCircle
} from "lucide-react";

import { authApi } from "@/lib/api/client";

const signupSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  password: z.string().min(4, "Password required (min 4 chars)"),
  role: z.enum(["ASHA", "CHO", "PHC_DOCTOR", "HOSPITAL_STAFF", "SPECIALIST", "DISTRICT_ADMIN"]),
});

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm>({ resolver: zodResolver(signupSchema) });

  const onSubmit = async (data: SignupForm) => {
    setError(null);
    try {
      await authApi.signup({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } }; message?: string };
      setError(err?.response?.data?.detail || err?.message || "Registration failed. Try again.");
    }
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
            Join the Network.<br />Save Lives.
          </p>
          <p className="text-teal-200 text-sm leading-relaxed">
            Create an account to join the patient journey orchestration network for rural India.
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
      <div className="flex-1 flex items-center justify-center p-3.5 sm:p-6">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key="signup-form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <div className="mb-5 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-clinical-navy mb-1.5 sm:mb-2">Create an Account</h2>
                <p className="text-clinical-muted text-xs sm:text-sm mt-1">Register to access the Arogya Marg network</p>
              </div>

              {success ? (
                <div className="card p-6 sm:p-8 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-clinical-navy mb-2">Registration Successful!</h3>
                  <p className="text-clinical-muted">Redirecting you to the login page...</p>
                </div>
              ) : (
                <div className="card p-4 sm:p-6">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="label">Full Name</label>
                        <input
                          {...register("name")}
                          type="text"
                          className="input"
                          placeholder="Dr. John Doe"
                        />
                        {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
                      </div>

                      <div className="col-span-2">
                        <label className="label">Email Address</label>
                        <input
                          {...register("email")}
                          type="email"
                          className="input"
                          placeholder="your@email.gov.in"
                        />
                        {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
                      </div>

                      <div className="col-span-2">
                        <label className="label">Password</label>
                        <div className="relative">
                          <input
                            {...register("password")}
                            type={showPassword ? "text" : "password"}
                            className="input pr-10"
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-clinical-muted hover:text-clinical-navy"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
                      </div>

                      <div className="col-span-2">
                        <label className="label">Role</label>
                        <select {...register("role")} className="input">
                          <option value="ASHA">ASHA Worker</option>
                          <option value="CHO">CHO</option>
                          <option value="PHC_DOCTOR">PHC Doctor</option>
                          <option value="HOSPITAL_STAFF">Hospital Staff</option>
                          <option value="SPECIALIST">Specialist</option>
                          <option value="DISTRICT_ADMIN">District Admin</option>
                        </select>
                        {errors.role && <p className="text-xs text-red-600 mt-1">{errors.role.message}</p>}
                      </div>
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-sm text-red-700">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary w-full mt-4 mb-3"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Registering...
                        </>
                      ) : (
                        <>
                          Sign Up <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                    
                    <div className="text-center">
                      <p className="text-sm text-clinical-muted">
                        Already have an account?{' '}
                        <a href="/login" className="text-teal-600 font-semibold hover:underline">
                          Log in here
                        </a>
                      </p>
                    </div>
                  </form>
                </div>
              )}

              <p className="text-center text-xs text-clinical-muted-light mt-4">
                Synthetic demonstration data · Not live government systems
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
