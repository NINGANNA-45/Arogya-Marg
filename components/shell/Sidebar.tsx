"use client";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import { useTranslation } from "react-i18next";
import type { Role } from "@/types";
import {
  Home, Users, UserPlus, MapPin, ClipboardList, Building2,
  BarChart3, Settings, AlertTriangle, Stethoscope, Heart,
  Navigation, Activity, Bell, LogOut, ChevronRight, Shield,
  FileText, Truck, Play
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface NavItem {
  labelKey: string;
  defaultLabel: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
}

const roleNavigation: Record<Role, NavItem[]> = {
  ASHA: [
    { labelKey: "home", defaultLabel: "Home", href: "/asha", icon: Home },
    { labelKey: "patients", defaultLabel: "My Patients", href: "/patients", icon: Users },
    { labelKey: "add_patient", defaultLabel: "Add Patient", href: "/patients/new", icon: UserPlus },
    { labelKey: "follow_ups", defaultLabel: "Follow-ups", href: "/tasks", icon: ClipboardList },
    { labelKey: "referrals", defaultLabel: "Referrals", href: "/referrals", icon: Truck },
    { labelKey: "network", defaultLabel: "Map", href: "/network-map", icon: MapPin },
  ],
  CHO: [
    { labelKey: "home", defaultLabel: "Home", href: "/asha", icon: Home },
    { labelKey: "patients", defaultLabel: "Patients", href: "/patients", icon: Users },
    { labelKey: "follow_ups", defaultLabel: "Follow-ups", href: "/tasks", icon: ClipboardList },
    { labelKey: "referrals", defaultLabel: "Referrals", href: "/referrals", icon: Truck },
    { labelKey: "facilities", defaultLabel: "Facilities", href: "/facilities", icon: Building2 },
    { labelKey: "network", defaultLabel: "Map", href: "/network-map", icon: MapPin },
  ],
  PHC_DOCTOR: [
    { labelKey: "overview", defaultLabel: "Overview", href: "/phc", icon: Activity },
    { labelKey: "patients", defaultLabel: "Patient Queue", href: "/patients", icon: Users },
    { labelKey: "consultations", defaultLabel: "Consultations", href: "/patients", icon: Stethoscope },
    { labelKey: "referrals", defaultLabel: "Referrals", href: "/referrals", icon: Truck },
    { labelKey: "carepath", defaultLabel: "CarePath", href: "/carepath", icon: Heart },
    { labelKey: "network", defaultLabel: "Network", href: "/network-map", icon: Navigation },
  ],
  HOSPITAL_STAFF: [
    { labelKey: "hospital_overview", defaultLabel: "Hospital Overview", href: "/hospital", icon: Building2 },
    { labelKey: "referrals", defaultLabel: "Incoming Referrals", href: "/referrals", icon: Truck },
    { labelKey: "patients", defaultLabel: "Patients", href: "/patients", icon: Users },
    { labelKey: "network", defaultLabel: "Network", href: "/network-map", icon: MapPin },
    { labelKey: "facilities", defaultLabel: "Facilities", href: "/facilities", icon: Building2 },
    { labelKey: "tasks", defaultLabel: "Tasks", href: "/tasks", icon: ClipboardList },
  ],
  SPECIALIST: [
    { labelKey: "overview", defaultLabel: "Overview", href: "/specialist", icon: Stethoscope },
    { labelKey: "patients", defaultLabel: "Patients", href: "/patients", icon: Users },
    { labelKey: "referrals", defaultLabel: "Referrals", href: "/referrals", icon: Truck },
    { labelKey: "tasks", defaultLabel: "Tasks", href: "/tasks", icon: ClipboardList },
  ],
  DISTRICT_ADMIN: [
    { labelKey: "dashboard", defaultLabel: "Command Center", href: "/command-center", icon: Shield },
    { labelKey: "patients", defaultLabel: "Patients", href: "/patients", icon: Users },
    { labelKey: "referrals", defaultLabel: "Referrals", href: "/referrals", icon: Truck },
    { labelKey: "facilities", defaultLabel: "Facilities", href: "/facilities", icon: Building2 },
    { labelKey: "network", defaultLabel: "Network Map", href: "/network-map", icon: MapPin },
    { labelKey: "analytics", defaultLabel: "Analytics", href: "/analytics", icon: BarChart3 },
    { labelKey: "tasks", defaultLabel: "Tasks", href: "/tasks", icon: ClipboardList },
  ],
};

const roleLabels: Record<Role, string> = {
  ASHA: "ASHA Worker",
  CHO: "Community Health Officer",
  PHC_DOCTOR: "PHC Doctor",
  HOSPITAL_STAFF: "Hospital Staff",
  SPECIALIST: "Specialist",
  DISTRICT_ADMIN: "District Admin",
};

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { t } = useTranslation();

  if (!user) return null;
  const navItems = roleNavigation[user.role] || [];

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-[220px] bg-white border-r border-clinical-border flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-clinical-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Heart className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-clinical-navy leading-none">Arogya Marg</p>
            <p className="text-[10px] text-clinical-muted-light mt-0.5">आरोग्य मार्ग</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-3 border-b border-clinical-border bg-gray-50/50">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-teal-700">
              {user.name.charAt(0)}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-clinical-navy truncate">{user.name}</p>
            <p className="text-[10px] text-clinical-muted truncate">{roleLabels[user.role]}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-3 overflow-y-auto space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href + item.labelKey}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "text-teal-700 bg-teal-50"
                  : "text-clinical-muted hover:text-clinical-navy hover:bg-gray-100"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{t(item.labelKey, item.defaultLabel)}</span>
              {item.badge && (
                <span className="ml-auto bg-red-100 text-red-700 text-xs rounded-full px-1.5 py-0.5 font-semibold">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-3 border-t border-clinical-border mt-3">

          <Link
            href="/settings"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-clinical-muted hover:text-clinical-navy hover:bg-gray-100 transition-all mt-0.5"
          >
            <Settings className="w-4 h-4 flex-shrink-0" />
            <span>Settings</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-clinical-muted hover:text-red-600 hover:bg-red-50 transition-all mt-0.5"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>{t('logout', 'Sign Out')}</span>
          </button>
        </div>
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-clinical-border">
        <p className="text-[10px] text-clinical-muted-light">Pune District • Haveli</p>
        <p className="text-[10px] text-clinical-muted-light">
          <span className="text-amber-600 font-medium">DEMO DATA</span>
        </p>
      </div>
    </aside>
  );
}
