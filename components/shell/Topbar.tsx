"use client";
import { Bell, Wifi, WifiOff, Globe, Search, Menu } from "lucide-react";
import { useAuthStore } from "@/lib/stores/authStore";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface TopbarProps {
  title: string;
  subtitle?: string;
  onOpenMobileNav?: () => void;
}

export function Topbar({ title, subtitle, onOpenMobileNav }: TopbarProps) {
  const { user } = useAuthStore();
  const [isOnline] = useState(true);
  const { i18n } = useTranslation();

  return (
    <header className="h-14 bg-white border-b border-clinical-border flex items-center px-3 sm:px-6 gap-2 sm:gap-4 sticky top-0 z-30">
      {/* Mobile hamburger menu */}
      <button
        onClick={onOpenMobileNav}
        className="md:hidden p-2 -ml-1 text-clinical-navy hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
        aria-label="Open navigation menu"
      >
        <Menu className="w-5 h-5 text-clinical-navy" />
      </button>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <h1 className="text-sm sm:text-base font-semibold text-clinical-navy truncate">{title}</h1>
          {subtitle && (
            <span className="text-xs sm:text-sm text-clinical-muted hidden md:inline truncate">{subtitle}</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Connectivity */}
        <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-full ${
          isOnline ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
        }`}>
          {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          <span className="hidden sm:inline">{isOnline ? "Online" : "Offline"}</span>
        </div>

        {/* Language */}
        <div className="relative group">
          <button className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-full bg-gray-100 text-clinical-muted hover:text-clinical-navy transition-colors">
            <Globe className="w-3 h-3" />
            <span className="hidden sm:inline">{i18n.language?.toUpperCase() || 'EN'}</span>
          </button>
          <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg hidden group-hover:block border border-clinical-border z-50">
            <button onClick={() => i18n.changeLanguage('en')} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50">English</button>
            <button onClick={() => i18n.changeLanguage('mr')} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50">मराठी</button>
            <button onClick={() => i18n.changeLanguage('hi')} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50">हिंदी</button>
          </div>
        </div>

        {/* Notifications */}
        <button className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
          <Bell className="w-4 h-4 text-clinical-muted" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User */}
        {user && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center">
              <span className="text-xs font-semibold text-teal-700">
                {user.name.charAt(0)}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
