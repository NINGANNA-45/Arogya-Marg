"use client";
import { AppShell } from "@/components/shell/AppShell";

export default function SettingsPage() {
  return (
    <AppShell title="Settings" subtitle="System Configuration">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="card p-8 text-center">
          <h2 className="text-xl font-bold text-clinical-navy mb-2">Platform Settings</h2>
          <p className="text-clinical-muted">This module is under construction.</p>
        </div>
      </div>
    </AppShell>
  );
}
