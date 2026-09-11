"use client";

import { useEffect, useState, useMemo } from "react";
import { AppShell } from "@/components/shell/AppShell";
import { facilitiesApi } from "@/lib/api/client";
import type { Facility, FacilityType, FacilityStatus } from "@/types";
import { FACILITY_TYPE_LABELS } from "@/types";
import {
  Building2, Search, Filter, Phone, MapPin, Activity, ShieldCheck,
  Zap, Stethoscope, AlertTriangle, CheckCircle2, XCircle, Grid, List,
  Info, ExternalLink, RefreshCw, ChevronRight, Layers, Eye
} from "lucide-react";
import Link from "next/link";

// Fallback demo facilities matching Pune/Haveli dataset
const DEMO_FACILITIES: Facility[] = [
  {
    id: "fac-001",
    facility_code: "PHC-MANJARI-01",
    name: "PHC Manjari",
    type: "PHC",
    status: "READY",
    village: "Manjari",
    taluka: "Haveli",
    district: "Pune",
    lat: 18.5089,
    lng: 73.9634,
    phone: "020-27451234",
    readiness_score: 87,
    total_beds: 30,
    occupied_beds: 18,
    icu_beds: 0,
    icu_occupied: 0,
    ventilators: 0,
    oxygen_available: true,
    blood_bank: false,
    diagnostics: ["CBC", "Urine", "Blood Sugar", "X-Ray"],
    specialists: ["Medicine", "Obstetrics"],
    is_active: true,
  },
  {
    id: "fac-002",
    facility_code: "PHC-KESNAND-01",
    name: "PHC Kesnand",
    type: "PHC",
    status: "LIMITED",
    village: "Kesnand",
    taluka: "Haveli",
    district: "Pune",
    lat: 18.5312,
    lng: 73.9891,
    phone: "020-27451235",
    readiness_score: 62,
    total_beds: 20,
    occupied_beds: 16,
    icu_beds: 0,
    icu_occupied: 0,
    ventilators: 0,
    oxygen_available: true,
    blood_bank: false,
    diagnostics: ["CBC", "Blood Sugar"],
    specialists: ["Medicine"],
    is_active: true,
  },
  {
    id: "fac-003",
    facility_code: "RH-WAGHOLI-01",
    name: "Rural Hospital Wagholi",
    type: "RURAL_HOSPITAL",
    status: "READY",
    village: "Wagholi",
    taluka: "Haveli",
    district: "Pune",
    lat: 18.5565,
    lng: 73.9841,
    phone: "020-27451236",
    readiness_score: 78,
    total_beds: 60,
    occupied_beds: 35,
    icu_beds: 4,
    icu_occupied: 2,
    ventilators: 2,
    oxygen_available: true,
    blood_bank: false,
    diagnostics: ["CBC", "X-Ray", "Ultrasound", "ECG"],
    specialists: ["Medicine", "Pediatrics", "Obstetrics"],
    is_active: true,
  },
  {
    id: "fac-004",
    facility_code: "RH-LONI-01",
    name: "Rural Hospital Loni Kalbhor",
    type: "RURAL_HOSPITAL",
    status: "CRITICAL",
    village: "Loni Kalbhor",
    taluka: "Haveli",
    district: "Pune",
    lat: 18.4789,
    lng: 73.9201,
    phone: "020-27451237",
    readiness_score: 34,
    total_beds: 40,
    occupied_beds: 39,
    icu_beds: 2,
    icu_occupied: 2,
    ventilators: 0,
    oxygen_available: false,
    blood_bank: false,
    diagnostics: ["CBC"],
    specialists: ["Medicine"],
    is_active: true,
  },
  {
    id: "fac-005",
    facility_code: "DH-SASSOON-01",
    name: "Sassoon District Hospital",
    type: "DISTRICT_HOSPITAL",
    status: "READY",
    village: "Pune City",
    taluka: "Pune",
    district: "Pune",
    lat: 18.5195,
    lng: 73.8553,
    phone: "020-26128000",
    readiness_score: 92,
    total_beds: 250,
    occupied_beds: 180,
    icu_beds: 30,
    icu_occupied: 22,
    ventilators: 15,
    oxygen_available: true,
    blood_bank: true,
    diagnostics: ["CBC", "X-Ray", "Ultrasound", "CT", "MRI", "ECG", "Pathology"],
    specialists: ["Medicine", "Pediatrics", "Obstetrics", "Surgery", "Cardiology", "Neurology", "Orthopedics"],
    is_active: true,
  },
  {
    id: "fac-006",
    facility_code: "CHC-KHED-01",
    name: "CHC Khed Shivapur",
    type: "CHC",
    status: "READY",
    village: "Khed Shivapur",
    taluka: "Haveli",
    district: "Pune",
    lat: 18.3789,
    lng: 73.8123,
    phone: "020-27451238",
    readiness_score: 71,
    total_beds: 50,
    occupied_beds: 28,
    icu_beds: 2,
    icu_occupied: 0,
    ventilators: 1,
    oxygen_available: true,
    blood_bank: false,
    diagnostics: ["CBC", "X-Ray", "Ultrasound", "Blood Sugar"],
    specialists: ["Medicine", "Pediatrics"],
    is_active: true,
  },
  {
    id: "fac-007",
    facility_code: "AM-URULI-01",
    name: "Arogya Mandir Uruli Kanchan",
    type: "AROGYA_MANDIR",
    status: "READY",
    village: "Uruli Kanchan",
    taluka: "Haveli",
    district: "Pune",
    lat: 18.4512,
    lng: 74.0123,
    phone: "020-27451239",
    readiness_score: 88,
    total_beds: 6,
    occupied_beds: 1,
    icu_beds: 0,
    icu_occupied: 0,
    ventilators: 0,
    oxygen_available: true,
    blood_bank: false,
    diagnostics: ["Blood Sugar", "Urine", "Hemoglobin"],
    specialists: [],
    is_active: true,
  },
  {
    id: "fac-008",
    facility_code: "AM-NANDED-01",
    name: "Arogya Mandir Nanded Fata",
    type: "AROGYA_MANDIR",
    status: "READY",
    village: "Nanded Fata",
    taluka: "Haveli",
    district: "Pune",
    lat: 18.4678,
    lng: 73.8456,
    phone: "020-27451240",
    readiness_score: 82,
    total_beds: 4,
    occupied_beds: 0,
    icu_beds: 0,
    icu_occupied: 0,
    ventilators: 0,
    oxygen_available: true,
    blood_bank: false,
    diagnostics: ["Blood Sugar", "Hemoglobin"],
    specialists: [],
    is_active: true,
  },
  {
    id: "fac-009",
    facility_code: "DC-HADAPSAR-01",
    name: "Diagnostic Centre Hadapsar",
    type: "DIAGNOSTIC_CENTRE",
    status: "READY",
    village: "Hadapsar",
    taluka: "Haveli",
    district: "Pune",
    lat: 18.5018,
    lng: 73.9254,
    phone: "020-27451241",
    readiness_score: 95,
    total_beds: 0,
    occupied_beds: 0,
    icu_beds: 0,
    icu_occupied: 0,
    ventilators: 0,
    oxygen_available: false,
    blood_bank: false,
    diagnostics: ["CBC", "X-Ray", "Ultrasound", "CT", "MRI", "Pathology"],
    specialists: [],
    is_active: true,
  },
  {
    id: "fac-010",
    facility_code: "BB-YERWADA-01",
    name: "Blood Bank Yerwada",
    type: "BLOOD_BANK",
    status: "READY",
    village: "Yerwada",
    taluka: "Pune",
    district: "Pune",
    lat: 18.5523,
    lng: 73.8901,
    phone: "020-27451242",
    readiness_score: 90,
    total_beds: 0,
    occupied_beds: 0,
    icu_beds: 0,
    icu_occupied: 0,
    ventilators: 0,
    oxygen_available: false,
    blood_bank: true,
    diagnostics: [],
    specialists: [],
    is_active: true,
  },
];

const STATUS_BADGES: Record<FacilityStatus, { label: string; bg: string; text: string; ring: string }> = {
  READY: { label: "Ready", bg: "bg-emerald-50 text-emerald-700 border-emerald-200", text: "text-emerald-700", ring: "stroke-emerald-500" },
  LIMITED: { label: "Limited", bg: "bg-amber-50 text-amber-700 border-amber-200", text: "text-amber-700", ring: "stroke-amber-500" },
  CRITICAL: { label: "Critical", bg: "bg-red-50 text-red-700 border-red-200", text: "text-red-700", ring: "stroke-red-500" },
  OFFLINE: { label: "Offline", bg: "bg-slate-100 text-slate-600 border-slate-200", text: "text-slate-600", ring: "stroke-slate-400" },
};

const TYPE_COLORS: Record<string, string> = {
  DISTRICT_HOSPITAL: "bg-blue-100 text-blue-800 border-blue-200",
  RURAL_HOSPITAL: "bg-indigo-100 text-indigo-800 border-indigo-200",
  CHC: "bg-sky-100 text-sky-800 border-sky-200",
  PHC: "bg-cyan-100 text-cyan-800 border-cyan-200",
  AROGYA_MANDIR: "bg-teal-100 text-teal-800 border-teal-200",
  DIAGNOSTIC_CENTRE: "bg-purple-100 text-purple-800 border-purple-200",
  BLOOD_BANK: "bg-rose-100 text-rose-800 border-rose-200",
  SUB_CENTRE: "bg-emerald-100 text-emerald-800 border-emerald-200",
  ASHA_WORKER: "bg-amber-100 text-amber-800 border-amber-200",
};

export default function FacilitiesPage() {
  const [facilities, setFacilities] = useState<Facility[]>(DEMO_FACILITIES);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [oxygenOnly, setOxygenOnly] = useState<boolean>(false);
  const [bloodOnly, setBloodOnly] = useState<boolean>(false);
  const [icuOnly, setIcuOnly] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

  useEffect(() => {
    async function loadFacilities() {
      try {
        setLoading(true);
        const res = await facilitiesApi.list();
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setFacilities(res.data);
        }
      } catch (err) {
        console.warn("Failed to load facilities API, using seed demo dataset:", err);
      } finally {
        setLoading(false);
      }
    }
    loadFacilities();
  }, []);

  const filteredFacilities = useMemo(() => {
    return facilities.filter((f) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !search ||
        f.name.toLowerCase().includes(q) ||
        f.facility_code.toLowerCase().includes(q) ||
        (f.village && f.village.toLowerCase().includes(q)) ||
        (f.taluka && f.taluka.toLowerCase().includes(q));

      const matchesType = typeFilter === "ALL" || f.type === typeFilter;
      const matchesStatus = statusFilter === "ALL" || f.status === statusFilter;
      const matchesOxygen = !oxygenOnly || f.oxygen_available;
      const matchesBlood = !bloodOnly || f.blood_bank;
      const matchesIcu = !icuOnly || (f.icu_beds > 0 && f.icu_beds - f.icu_occupied > 0);

      return matchesSearch && matchesType && matchesStatus && matchesOxygen && matchesBlood && matchesIcu;
    });
  }, [facilities, search, typeFilter, statusFilter, oxygenOnly, bloodOnly, icuOnly]);

  // Aggregate Metrics
  const stats = useMemo(() => {
    const total = facilities.length;
    const ready = facilities.filter((f) => f.status === "READY").length;
    const totalBeds = facilities.reduce((acc, f) => acc + (f.total_beds || 0), 0);
    const occupiedBeds = facilities.reduce((acc, f) => acc + (f.occupied_beds || 0), 0);
    const availBeds = totalBeds - occupiedBeds;
    const totalIcu = facilities.reduce((acc, f) => acc + (f.icu_beds || 0), 0);
    const occupiedIcu = facilities.reduce((acc, f) => acc + (f.icu_occupied || 0), 0);
    const availIcu = totalIcu - occupiedIcu;

    return { total, ready, totalBeds, availBeds, totalIcu, availIcu };
  }, [facilities]);

  return (
    <AppShell title="Facilities Directory" subtitle="Comprehensive view of healthcare centers & readiness across Pune District">
      <div className="p-6 max-w-7xl mx-auto space-y-6">

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-4 flex items-center gap-3.5 border-l-4 border-l-teal-600 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 flex-shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-clinical-navy">{stats.total}</p>
              <p className="text-xs font-medium text-clinical-muted">Total Facilities Registered</p>
            </div>
          </div>

          <div className="card p-4 flex items-center gap-3.5 border-l-4 border-l-emerald-500 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-700">{stats.ready} / {stats.total}</p>
              <p className="text-xs font-medium text-clinical-muted">Full Operational Readiness</p>
            </div>
          </div>

          <div className="card p-4 flex items-center gap-3.5 border-l-4 border-l-blue-600 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-700">{stats.availBeds} <span className="text-sm font-normal text-clinical-muted">/ {stats.totalBeds}</span></p>
              <p className="text-xs font-medium text-clinical-muted">General Beds Available</p>
            </div>
          </div>

          <div className="card p-4 flex items-center gap-3.5 border-l-4 border-l-purple-600 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-700">{stats.availIcu} <span className="text-sm font-normal text-clinical-muted">/ {stats.totalIcu}</span></p>
              <p className="text-xs font-medium text-clinical-muted">ICU Beds Available</p>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="card p-4 space-y-3.5 bg-white border border-slate-200 shadow-sm rounded-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1 min-w-[260px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search facility name, code, village, taluka..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-slate-50/50"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600">
                  Clear
                </button>
              )}
            </div>

            {/* Dropdowns & Controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              
              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="ALL">All Facility Types</option>
                <option value="DISTRICT_HOSPITAL">District Hospital</option>
                <option value="RURAL_HOSPITAL">Rural Hospital</option>
                <option value="CHC">CHC</option>
                <option value="PHC">PHC</option>
                <option value="AROGYA_MANDIR">Arogya Mandir</option>
                <option value="DIAGNOSTIC_CENTRE">Diagnostic Centre</option>
                <option value="BLOOD_BANK">Blood Bank</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="ALL">All Operational Statuses</option>
                <option value="READY">Ready</option>
                <option value="LIMITED">Limited</option>
                <option value="CRITICAL">Critical</option>
                <option value="OFFLINE">Offline</option>
              </select>

              {/* View Toggle */}
              <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-all ${
                    viewMode === "grid" ? "bg-white text-teal-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Grid View"
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-all ${
                    viewMode === "table" ? "bg-white text-teal-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Table View"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Network Map Button */}
              <Link
                href="/network-map"
                className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5 border-teal-600/30 text-teal-700 hover:bg-teal-50"
              >
                <MapPin className="w-3.5 h-3.5" /> Map View
              </Link>
            </div>
          </div>

          {/* Capability Toggle Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" /> Capability Filters:
            </span>
            <button
              onClick={() => setOxygenOnly(!oxygenOnly)}
              className={`px-2.5 py-1 rounded-full border transition-all ${
                oxygenOnly ? "bg-cyan-600 text-white border-cyan-600 font-semibold" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              💨 Oxygen Available
            </button>
            <button
              onClick={() => setBloodOnly(!bloodOnly)}
              className={`px-2.5 py-1 rounded-full border transition-all ${
                bloodOnly ? "bg-rose-600 text-white border-rose-600 font-semibold" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              🩸 Blood Bank On-site
            </button>
            <button
              onClick={() => setIcuOnly(!icuOnly)}
              className={`px-2.5 py-1 rounded-full border transition-all ${
                icuOnly ? "bg-purple-600 text-white border-purple-600 font-semibold" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              🛏️ ICU Beds Available
            </button>

            {(search || typeFilter !== "ALL" || statusFilter !== "ALL" || oxygenOnly || bloodOnly || icuOnly) && (
              <button
                onClick={() => {
                  setSearch("");
                  setTypeFilter("ALL");
                  setStatusFilter("ALL");
                  setOxygenOnly(false);
                  setBloodOnly(false);
                  setIcuOnly(false);
                }}
                className="text-xs text-red-600 hover:underline ml-auto font-medium"
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>

        {/* Content Section */}
        {filteredFacilities.length === 0 ? (
          <div className="card p-12 text-center bg-white rounded-xl border border-slate-200">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-clinical-navy">No facilities found</h3>
            <p className="text-xs text-clinical-muted max-w-md mx-auto mt-1">
              No medical facilities matched your search or active capability filters. Try clearing your filters.
            </p>
          </div>
        ) : viewMode === "grid" ? (
          /* Grid Cards View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredFacilities.map((f) => {
              const statusCfg = STATUS_BADGES[f.status] || STATUS_BADGES.READY;
              const typeClass = TYPE_COLORS[f.type] || "bg-slate-100 text-slate-800 border-slate-200";
              const bedOccupancyPct = f.total_beds > 0 ? Math.round((f.occupied_beds / f.total_beds) * 100) : 0;
              const icuOccupancyPct = f.icu_beds > 0 ? Math.round((f.icu_occupied / f.icu_beds) * 100) : 0;

              return (
                <div
                  key={f.id}
                  className="card hover:shadow-md transition-all duration-200 border border-slate-200 hover:border-teal-500/30 flex flex-col justify-between overflow-hidden group"
                >
                  {/* Top Header */}
                  <div className="p-4 bg-slate-50/50 border-b border-slate-100">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${typeClass}`}>
                        {FACILITY_TYPE_LABELS[f.type] || f.type}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusCfg.bg}`}>
                        ● {statusCfg.label}
                      </span>
                    </div>
                    <h3 className="font-bold text-clinical-navy text-base group-hover:text-teal-700 transition-colors">
                      {f.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-clinical-muted mt-1">
                      <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px] text-slate-600">{f.facility_code}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {f.village ? `${f.village}, ${f.taluka}` : f.district}
                      </span>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-4 space-y-4 flex-1">
                    
                    {/* Readiness Score & Beds */}
                    <div className="grid grid-cols-2 gap-3 bg-white p-3 rounded-lg border border-slate-100">
                      <div>
                        <p className="text-[11px] text-slate-400 font-medium">Readiness Score</p>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className={`text-xl font-extrabold ${
                            f.readiness_score >= 80 ? "text-emerald-600" : f.readiness_score >= 60 ? "text-amber-600" : "text-red-600"
                          }`}>
                            {f.readiness_score}%
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-400 font-medium">Bed Availability</p>
                        <p className="text-sm font-semibold text-clinical-navy mt-0.5">
                          {f.total_beds > 0 ? `${f.total_beds - f.occupied_beds} free` : "N/A"}
                          <span className="text-xs font-normal text-slate-400"> ({f.total_beds} total)</span>
                        </p>
                      </div>
                    </div>

                    {/* Bed Capacity Progress Bar */}
                    {f.total_beds > 0 && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                          <span>General Occupancy ({bedOccupancyPct}%)</span>
                          <span>{f.occupied_beds} / {f.total_beds} beds</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              bedOccupancyPct > 90 ? "bg-red-500" : bedOccupancyPct > 70 ? "bg-amber-500" : "bg-emerald-500"
                            }`}
                            style={{ width: `${bedOccupancyPct}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* ICU Capacity Bar (if applicable) */}
                    {f.icu_beds > 0 && (
                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between text-[11px] text-purple-700 font-medium">
                          <span>ICU Occupancy ({icuOccupancyPct}%)</span>
                          <span>{f.icu_occupied} / {f.icu_beds} ICU beds</span>
                        </div>
                        <div className="w-full bg-purple-50 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              icuOccupancyPct >= 100 ? "bg-red-600" : icuOccupancyPct > 75 ? "bg-amber-500" : "bg-purple-600"
                            }`}
                            style={{ width: `${icuOccupancyPct}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Infrastructure Capabilities */}
                    <div className="flex items-center gap-2 pt-1">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${
                        f.oxygen_available ? "bg-cyan-50 text-cyan-700 border border-cyan-200" : "bg-slate-100 text-slate-400 line-through"
                      }`}>
                        {f.oxygen_available ? <CheckCircle2 className="w-3 h-3 text-cyan-600" /> : <XCircle className="w-3 h-3 text-slate-400" />}
                        Oxygen
                      </span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${
                        f.blood_bank ? "bg-rose-50 text-rose-700 border border-rose-200" : "bg-slate-100 text-slate-400 line-through"
                      }`}>
                        {f.blood_bank ? <CheckCircle2 className="w-3 h-3 text-rose-600" /> : <XCircle className="w-3 h-3 text-slate-400" />}
                        Blood Bank
                      </span>
                    </div>

                    {/* Diagnostics & Specialists Pills */}
                    <div className="space-y-1.5 pt-1 text-xs">
                      {f.specialists && f.specialists.length > 0 && (
                        <div>
                          <span className="text-[11px] text-slate-400 block mb-1 font-medium">Specialists On Duty:</span>
                          <div className="flex flex-wrap gap-1">
                            {f.specialists.map((s) => (
                              <span key={s} className="bg-indigo-50 text-indigo-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-indigo-100">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                    {f.phone ? (
                      <a href={`tel:${f.phone}`} className="text-slate-600 hover:text-teal-700 flex items-center gap-1 font-mono font-medium">
                        <Phone className="w-3.5 h-3.5 text-teal-600" />
                        {f.phone}
                      </a>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">No contact listed</span>
                    )}

                    <button
                      onClick={() => setSelectedFacility(f)}
                      className="btn-sm btn-secondary text-xs flex items-center gap-1 border-slate-300 hover:bg-teal-50 hover:text-teal-700"
                    >
                      <Eye className="w-3.5 h-3.5" /> Quick View
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className="card overflow-hidden border border-slate-200 shadow-sm rounded-xl">
            <div className="overflow-x-auto">
              <table className="table-clinical">
                <thead>
                  <tr>
                    <th>Facility Code</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Readiness</th>
                    <th>Beds (Avail/Total)</th>
                    <th>ICU Beds</th>
                    <th>Capabilities</th>
                    <th>Phone</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFacilities.map((f) => {
                    const statusCfg = STATUS_BADGES[f.status] || STATUS_BADGES.READY;
                    const typeClass = TYPE_COLORS[f.type] || "bg-slate-100 text-slate-800";
                    return (
                      <tr key={f.id} className="hover:bg-slate-50/80 transition-colors">
                        <td><span className="font-mono text-xs text-slate-600">{f.facility_code}</span></td>
                        <td>
                          <div>
                            <p className="font-bold text-clinical-navy text-sm">{f.name}</p>
                            <p className="text-xs text-clinical-muted">{f.village}, {f.taluka}</p>
                          </div>
                        </td>
                        <td>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${typeClass}`}>
                            {FACILITY_TYPE_LABELS[f.type] || f.type}
                          </span>
                        </td>
                        <td>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusCfg.bg}`}>
                            {statusCfg.label}
                          </span>
                        </td>
                        <td>
                          <span className={`font-extrabold text-sm ${
                            f.readiness_score >= 80 ? "text-emerald-600" : f.readiness_score >= 60 ? "text-amber-600" : "text-red-600"
                          }`}>
                            {f.readiness_score}%
                          </span>
                        </td>
                        <td className="text-xs font-medium">
                          {f.total_beds > 0 ? (
                            <span className="text-emerald-700 font-semibold">{f.total_beds - f.occupied_beds} <span className="text-slate-400 font-normal">/ {f.total_beds}</span></span>
                          ) : (
                            <span className="text-slate-400 italic">N/A</span>
                          )}
                        </td>
                        <td className="text-xs font-medium">
                          {f.icu_beds > 0 ? (
                            <span className="text-purple-700 font-semibold">{f.icu_beds - f.icu_occupied} <span className="text-slate-400 font-normal">/ {f.icu_beds}</span></span>
                          ) : (
                            <span className="text-slate-400">0</span>
                          )}
                        </td>
                        <td>
                          <div className="flex items-center gap-1.5 text-xs">
                            {f.oxygen_available && <span title="Oxygen Available" className="bg-cyan-50 text-cyan-700 px-1.5 py-0.5 rounded text-[10px] font-semibold border border-cyan-200">O2</span>}
                            {f.blood_bank && <span title="Blood Bank" className="bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded text-[10px] font-semibold border border-rose-200">Blood</span>}
                          </div>
                        </td>
                        <td className="font-mono text-xs text-slate-600">{f.phone || "—"}</td>
                        <td>
                          <button
                            onClick={() => setSelectedFacility(f)}
                            className="btn-sm btn-secondary text-xs flex items-center gap-1"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Detailed Modal Drawer */}
        {selectedFacility && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
              
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${TYPE_COLORS[selectedFacility.type] || "bg-slate-100"}`}>
                    {FACILITY_TYPE_LABELS[selectedFacility.type] || selectedFacility.type}
                  </span>
                  <h2 className="text-xl font-bold text-clinical-navy mt-1">{selectedFacility.name}</h2>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedFacility.facility_code} • {selectedFacility.village}, {selectedFacility.taluka}, {selectedFacility.district}</p>
                </div>
                <button
                  onClick={() => setSelectedFacility(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Status & Readiness */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <p className="text-xs text-slate-400 font-medium">Readiness Score</p>
                  <p className={`text-2xl font-extrabold mt-0.5 ${
                    selectedFacility.readiness_score >= 80 ? "text-emerald-600" : selectedFacility.readiness_score >= 60 ? "text-amber-600" : "text-red-600"
                  }`}>
                    {selectedFacility.readiness_score}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Operational Status</p>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border inline-block mt-1 ${STATUS_BADGES[selectedFacility.status]?.bg}`}>
                    ● {STATUS_BADGES[selectedFacility.status]?.label}
                  </span>
                </div>
              </div>

              {/* Capacities */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bed & Resource Capacity</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white border border-slate-200 rounded-lg">
                    <p className="text-slate-400">General Beds</p>
                    <p className="text-base font-bold text-clinical-navy mt-0.5">
                      {selectedFacility.total_beds > 0 ? `${selectedFacility.total_beds - selectedFacility.occupied_beds} Free / ${selectedFacility.total_beds} Total` : "N/A"}
                    </p>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-lg">
                    <p className="text-slate-400">ICU Beds</p>
                    <p className="text-base font-bold text-purple-700 mt-0.5">
                      {selectedFacility.icu_beds > 0 ? `${selectedFacility.icu_beds - selectedFacility.icu_occupied} Free / ${selectedFacility.icu_beds} Total` : "None"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Equipment */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Infrastructure & Life Support</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                    selectedFacility.oxygen_available ? "bg-cyan-50 border-cyan-200 text-cyan-800" : "bg-slate-50 border-slate-200 text-slate-400"
                  }`}>
                    <CheckCircle2 className="w-4 h-4 text-cyan-600" />
                    <span>Oxygen Supply: <strong>{selectedFacility.oxygen_available ? "Available" : "Unavailable"}</strong></span>
                  </div>
                  <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                    selectedFacility.blood_bank ? "bg-rose-50 border-rose-200 text-rose-800" : "bg-slate-50 border-slate-200 text-slate-400"
                  }`}>
                    <CheckCircle2 className="w-4 h-4 text-rose-600" />
                    <span>Blood Bank: <strong>{selectedFacility.blood_bank ? "On-site" : "No"}</strong></span>
                  </div>
                </div>
              </div>

              {/* Diagnostics & Medical Services */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Diagnostics Available</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedFacility.diagnostics && selectedFacility.diagnostics.length > 0 ? (
                    selectedFacility.diagnostics.map((d) => (
                      <span key={d} className="bg-slate-100 text-slate-700 text-xs font-medium px-2.5 py-1 rounded-md border border-slate-200">
                        {d}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">No diagnostics registered</span>
                  )}
                </div>
              </div>

              {/* Specialists */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Specialists On Duty</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedFacility.specialists && selectedFacility.specialists.length > 0 ? (
                    selectedFacility.specialists.map((s) => (
                      <span key={s} className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-md border border-indigo-200">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">No specialists assigned</span>
                  )}
                </div>
              </div>

              {/* Contact info */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs text-slate-600">
                  <span className="text-slate-400 block font-medium">Contact Hotline:</span>
                  <a href={`tel:${selectedFacility.phone}`} className="font-mono font-bold text-teal-700 hover:underline">
                    {selectedFacility.phone || "N/A"}
                  </a>
                </div>
                <Link
                  href="/network-map"
                  className="btn-primary text-xs flex items-center gap-1.5 py-2 px-4"
                  onClick={() => setSelectedFacility(null)}
                >
                  <MapPin className="w-3.5 h-3.5" /> Locate on Network Map
                </Link>
              </div>

            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}
