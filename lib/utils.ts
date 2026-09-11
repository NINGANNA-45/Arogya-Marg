import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string | undefined, options?: Intl.DateTimeFormatOptions): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", options || {
    day: "numeric", month: "short", year: "numeric"
  });
}

export function formatTime(dateStr: string | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit"
  });
}

export function formatDateTime(dateStr: string | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
  });
}

export function timeAgo(dateStr: string | undefined): string {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function timeUntil(dateStr: string | undefined): string {
  if (!dateStr) return "—";
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff < 0) return "overdue";
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m`;
}

export function getRiskColor(risk: string): string {
  switch (risk) {
    case "LOW": return "text-emerald-700 bg-emerald-50";
    case "MEDIUM": return "text-amber-700 bg-amber-50";
    case "HIGH": return "text-red-700 bg-red-50";
    case "CRITICAL": return "text-purple-900 bg-purple-50";
    default: return "text-gray-700 bg-gray-100";
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "READY": return "text-emerald-700 bg-emerald-50";
    case "LIMITED": return "text-amber-700 bg-amber-50";
    case "CRITICAL": return "text-red-700 bg-red-50";
    case "OFFLINE": return "text-gray-700 bg-gray-100";
    case "PENDING": return "text-blue-700 bg-blue-50";
    case "ACCEPTED": return "text-emerald-700 bg-emerald-50";
    case "EN_ROUTE": return "text-blue-700 bg-blue-50";
    case "ARRIVED": return "text-teal-700 bg-teal-50";
    case "COMPLETED": return "text-gray-700 bg-gray-100";
    case "REROUTED": return "text-amber-700 bg-amber-50";
    default: return "text-gray-700 bg-gray-100";
  }
}

export function getCareStateColor(state: string): string {
  const active = ["REFERRAL_CREATED", "FACILITY_ACCEPTED", "EN_ROUTE", "ARRIVED"];
  const warning = ["CONSULTATION_PENDING", "FOLLOW_UP_DUE", "BACK_REFERRED"];
  const danger = ["STUCK", "FACILITY_UNAVAILABLE", "ESCALATED", "NO_SHOW"];
  const success = ["TREATED", "CLOSED"];
  if (active.includes(state)) return "text-blue-700 bg-blue-50";
  if (warning.includes(state)) return "text-amber-700 bg-amber-50";
  if (danger.includes(state)) return "text-red-700 bg-red-50";
  if (success.includes(state)) return "text-emerald-700 bg-emerald-50";
  return "text-teal-700 bg-teal-50";
}
