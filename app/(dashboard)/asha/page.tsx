"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/shell/AppShell";
import { useAuthStore } from "@/lib/stores/authStore";
import { opsApi } from "@/lib/api/client";
import {
  UserPlus, ClipboardList, Truck, MapPin, AlertTriangle,
  Clock, CheckCircle, Heart, Activity, Wifi, WifiOff,
  ChevronRight, Star
} from "lucide-react";
import Link from "next/link";

const QUICK_ACTIONS = [
  { label: "Add Patient", href: "/patients/new", icon: UserPlus, color: "bg-teal-600 text-white", desc: "Register new patient" },
  { label: "Start Visit", href: "/patients", icon: Activity, color: "bg-blue-50 text-blue-700 border border-blue-200", desc: "Record field visit" },
  { label: "Follow-up", href: "/tasks", icon: ClipboardList, color: "bg-amber-50 text-amber-700 border border-amber-200", desc: "Complete follow-up" },
  { label: "Referral", href: "/referrals", icon: Truck, color: "bg-indigo-50 text-indigo-700 border border-indigo-200", desc: "Create/view referral" },
  { label: "Emergency", href: "/network-map", icon: AlertTriangle, color: "bg-red-50 text-red-700 border border-red-200", desc: "Find nearest facility" },
  { label: "Map", href: "/network-map", icon: MapPin, color: "bg-emerald-50 text-emerald-700 border border-emerald-200", desc: "Network map" },
];

export default function AshaPage() {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState<any[]>([]);
  const [isOnline] = useState(true);

  useEffect(() => {
    opsApi.getTasks({ status: "OPEN" }).then(res => setTasks(res.data)).catch(() => {});
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <AppShell title="My Workspace" subtitle="ASHA Field Workspace">
      <div className="p-4 max-w-2xl mx-auto space-y-4">

        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-5"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-clinical-muted">{greeting},</p>
              <h1 className="text-xl font-bold text-clinical-navy">{user?.name?.split(" ")[0] || "Worker"}</h1>
              <p className="text-xs text-clinical-muted mt-1">
                {user?.village} · {user?.taluka} · {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
              </p>
            </div>
            <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-full ${
              isOnline ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
            }`}>
              {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {isOnline ? "Online" : "Offline"}
            </div>
          </div>
        </motion.div>

        {/* Today's work summary */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Tasks Due", value: tasks.length || 3, color: "text-amber-600", bg: "bg-amber-50", icon: Clock },
            { label: "High Risk", value: 2, color: "text-red-600", bg: "bg-red-50", icon: AlertTriangle },
            { label: "Follow-ups", value: tasks.filter((t: any) => t.task_type === "FOLLOW_UP").length || 4, color: "text-blue-600", bg: "bg-blue-50", icon: ClipboardList },
            { label: "Active Referrals", value: 1, color: "text-teal-600", bg: "bg-teal-50", icon: Truck },
          ].map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.label} className={`${m.bg} rounded-xl p-4 flex items-center gap-3`}>
                <Icon className={`w-5 h-5 ${m.color} flex-shrink-0`} />
                <div>
                  <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
                  <p className="text-xs text-clinical-muted">{m.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="text-sm font-semibold text-clinical-navy mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ACTIONS.map((a) => {
              const Icon = a.icon;
              return (
                <Link
                  key={a.label}
                  href={a.href}
                  className={`flex items-center gap-3 p-4 rounded-xl ${a.color} transition-all active:scale-95 min-h-[64px]`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">{a.label}</p>
                    <p className="text-[10px] opacity-70">{a.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Open tasks */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="font-semibold text-clinical-navy text-sm">Open Tasks</h3>
            <Link href="/tasks" className="text-xs text-teal-600 hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-clinical-border">
            {tasks.slice(0, 5).map((task: any) => (
              <div key={task.id} className="px-5 py-3 flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  task.priority === "URGENT" || task.priority === "HIGH" ? "bg-red-500" : "bg-amber-400"
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-clinical-navy truncate">{task.title}</p>
                  {task.due_at && (
                    <p className="text-xs text-clinical-muted">
                      {new Date(task.due_at) < new Date()
                        ? <span className="text-red-600">Overdue</span>
                        : `Due: ${new Date(task.due_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`}
                    </p>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-clinical-muted flex-shrink-0" />
              </div>
            ))}
            {tasks.length === 0 && (
              <div className="px-5 py-8 text-center">
                <CheckCircle className="w-8 h-8 text-emerald-300 mx-auto mb-2" />
                <p className="text-sm text-clinical-muted">All caught up!</p>
              </div>
            )}
          </div>
        </div>

        {/* Offline indicator */}
        {!isOnline && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <WifiOff className="w-4 h-4 text-amber-600" />
              <p className="text-sm font-semibold text-amber-800">Working Offline</p>
            </div>
            <p className="text-xs text-amber-700">
              You can create patients and record visits. Data will sync when you're back online.
            </p>
            <div className="bg-amber-100 rounded-lg px-3 py-2 mt-2 text-xs text-amber-800 font-medium">
              3 records waiting to sync
            </div>
          </div>
        )}

        <p className="text-center text-[10px] text-clinical-muted-light pb-4">
          SYNTHETIC DEMO DATA · Arogya Marg
        </p>
      </div>
    </AppShell>
  );
}
