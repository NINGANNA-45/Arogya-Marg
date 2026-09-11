"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { simulationApi } from "@/lib/api/client";
import type { Facility, Ambulance, Referral } from "@/types";
import { getFacilityMarkerColor, getFacilityMarkerScale, IS_DEMO_MAP, MAPS_API_KEY, DEFAULT_CENTER, DEFAULT_ZOOM } from "@/lib/maps/config";
import { AppShell } from "@/components/shell/AppShell";
import {
  Search, Filter, Layers, MapPin, Building2, Truck, Users,
  AlertTriangle, Activity, X, CheckCircle, XCircle, Loader2,
  Navigation, Maximize, ZoomIn, ZoomOut, Compass, RefreshCw
} from "lucide-react";
import { useNetworkStore } from "@/lib/stores/networkStore";
import { getStatusColor } from "@/lib/utils";

// Comprehensive fallback dataset for Haveli Taluka, Pune District
const FALLBACK_FACILITIES: Facility[] = [
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

const FALLBACK_AMBULANCES: Ambulance[] = [
  {
    id: "amb-001",
    vehicle_number: "MH12-AB-1234",
    vehicle_type: "BLS",
    status: "AVAILABLE",
    driver_name: "Suresh Patil",
    current_lat: 18.512,
    current_lng: 73.96,
    speed_kmph: 0,
    is_active: true,
  },
  {
    id: "amb-002",
    vehicle_number: "MH12-CD-5678",
    vehicle_type: "ALS",
    status: "EN_ROUTE",
    driver_name: "Ganesh Shinde",
    current_lat: 18.535,
    current_lng: 73.975,
    speed_kmph: 45,
    eta_minutes: 18,
    is_active: true,
  },
  {
    id: "amb-003",
    vehicle_number: "MH12-EF-9012",
    vehicle_type: "BLS",
    status: "AVAILABLE",
    driver_name: "Mahesh Jadhav",
    current_lat: 18.485,
    current_lng: 73.91,
    speed_kmph: 0,
    is_active: true,
  },
];

const FALLBACK_REFERRALS: Referral[] = [
  {
    id: "ref-001",
    referral_code: "REF-2026-00891",
    patient_id: "pat-rekha-001",
    origin_facility_id: "fac-007",
    destination_facility_id: "fac-003",
    referred_by: "usr-001",
    status: "ACCEPTED",
    urgency: "EMERGENCY",
    reason: "Pre-eclampsia in 3rd trimester requiring emergency OBGYN",
    required_specialty: "Obstetrics",
    created_at: new Date(Date.now() - 3600000).toISOString(),
    expected_arrival: new Date(Date.now() + 1800000).toISOString(),
    is_rerouted: false,
  },
  {
    id: "ref-002",
    referral_code: "REF-2026-00892",
    patient_id: "pat-005",
    origin_facility_id: "fac-004",
    destination_facility_id: "fac-005",
    referred_by: "usr-005",
    status: "EN_ROUTE",
    urgency: "EMERGENCY",
    reason: "Severe respiratory distress with oxygen desaturation",
    required_specialty: "Cardiology / ICU",
    created_at: new Date(Date.now() - 7200000).toISOString(),
    expected_arrival: new Date(Date.now() + 900000).toISOString(),
    is_rerouted: false,
  },
];

const FALLBACK_HIGH_RISK_PATIENTS = [
  { id: "pat-rekha-001", name: "Rekha Patil", risk_level: "HIGH", current_state: "EN_ROUTE", village: "Uruli Kanchan" },
  { id: "pat-005", name: "Ramesh Pawar", risk_level: "CRITICAL", current_state: "REFERRAL_CREATED", village: "Loni Kalbhor" },
  { id: "pat-004", name: "Sunita Jadhav", risk_level: "MEDIUM", current_state: "CONSULTATION_PENDING", village: "Kesnand" },
];

/**
 * Interactive Tactical Vector Map Fallback
 * Provides 100% reliable real-time visualization even when external map APIs are unreachable.
 */
function InteractiveTacticalMap({
  facilities,
  ambulances,
  referrals,
  selectedFacilityId,
  onSelectFacility,
}: {
  facilities: Facility[];
  ambulances: Ambulance[];
  referrals: Referral[];
  selectedFacilityId: string | null;
  onSelectFacility: (id: string) => void;
}) {
  const [zoom, setZoom] = useState(1);

  // Geographic projection for Pune/Haveli bounds
  // Longitude: 73.78 -> 74.05 (27km)
  // Latitude: 18.35 -> 18.58 (25km)
  const getCoords = (lat: number, lng: number) => {
    const x = ((lng - 73.78) / (74.06 - 73.78)) * 100;
    const y = ((18.58 - lat) / (18.58 - 18.35)) * 100;
    return {
      x: Math.max(8, Math.min(92, x)),
      y: Math.max(8, Math.min(92, y)),
    };
  };

  return (
    <div className="relative w-full h-full bg-slate-900 overflow-hidden select-none">
      {/* Top operational badge */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
        <div className="bg-slate-800/90 backdrop-blur-sm text-white border border-slate-700 px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-slate-200">Arogya Tactical GIS</span>
          <span className="text-slate-400 text-[10px] hidden sm:inline">Pune · Haveli Sector</span>
        </div>
      </div>

      {/* Map Zoom Controls */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1 bg-slate-800/90 border border-slate-700 rounded-lg p-1 shadow-lg backdrop-blur-sm">
        <button
          onClick={() => setZoom((z) => Math.min(1.4, z + 0.1))}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(0.8, z - 0.1))}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(1)}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded text-[10px] font-mono"
          title="Reset View"
        >
          1x
        </button>
      </div>

      {/* Scalable Tactical Map Surface */}
      <div
        className="w-full h-full relative transition-transform duration-200 origin-center"
        style={{ transform: `scale(${zoom})` }}
      >
        {/* Background GIS Grid & Roads */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="tac-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.5" strokeOpacity="0.4" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#tac-grid)" />

          {/* Simulated Highway NH-65 / Solapur Highway */}
          <path
            d="M 15% 42% Q 40% 50% 65% 55% T 92% 75%"
            fill="none"
            stroke="#475569"
            strokeWidth="3"
            strokeDasharray="4 2"
            opacity="0.6"
          />
          {/* Nagar Highway */}
          <path
            d="M 25% 38% Q 45% 30% 70% 25% T 90% 18%"
            fill="none"
            stroke="#475569"
            strokeWidth="2.5"
            opacity="0.5"
          />
          {/* Mula-Mutha River body */}
          <path
            d="M 10% 48% Q 30% 42% 55% 45% T 95% 62%"
            fill="none"
            stroke="#0284c7"
            strokeWidth="8"
            strokeOpacity="0.25"
            strokeLinecap="round"
          />

          {/* Active Referral Routes connecting facilities */}
          {referrals.map((ref) => {
            const origin = facilities.find((f) => f.id === ref.origin_facility_id);
            const dest = facilities.find((f) => f.id === ref.destination_facility_id);
            if (!origin || !dest) return null;

            const p1 = getCoords(origin.lat, origin.lng);
            const p2 = getCoords(dest.lat, dest.lng);

            return (
              <g key={ref.id}>
                <line
                  x1={`${p1.x}%`}
                  y1={`${p1.y}%`}
                  x2={`${p2.x}%`}
                  y2={`${p2.y}%`}
                  stroke={ref.urgency === "EMERGENCY" ? "#ef4444" : "#3b82f6"}
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                  strokeOpacity="0.8"
                />
              </g>
            );
          })}
        </svg>

        {/* Facility Markers */}
        {facilities.map((f) => {
          const { x, y } = getCoords(f.lat, f.lng);
          const color = getFacilityMarkerColor(f.status);
          const isSelected = selectedFacilityId === f.id;

          return (
            <div
              key={f.id}
              onClick={() => onSelectFacility(f.id)}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 group"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              {/* Pulse effect for selected or critical facility */}
              {(isSelected || f.status === "CRITICAL") && (
                <div
                  className="absolute inset-0 rounded-full animate-ping opacity-60"
                  style={{ backgroundColor: color }}
                />
              )}

              {/* Marker pin */}
              <div
                className={`relative rounded-full border-2 border-white shadow-xl flex items-center justify-center transition-transform hover:scale-125 ${
                  isSelected ? "ring-4 ring-teal-400 scale-125" : ""
                }`}
                style={{
                  width: isSelected ? 30 : 24,
                  height: isSelected ? 30 : 24,
                  backgroundColor: color,
                }}
              >
                <span className="text-[10px] font-black text-white">
                  {f.type === "DISTRICT_HOSPITAL" ? "DH" : f.type === "RURAL_HOSPITAL" ? "RH" : "PHC"}
                </span>
              </div>

              {/* Facility Label Tooltip */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded bg-slate-800/95 border border-slate-700 text-white text-[10px] font-medium pointer-events-none shadow-md">
                {f.name}
              </div>
            </div>
          );
        })}

        {/* Ambulances */}
        {ambulances.map((amb) => {
          if (!amb.current_lat || !amb.current_lng) return null;
          const { x, y } = getCoords(amb.current_lat, amb.current_lng);

          return (
            <div
              key={amb.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-15"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <div className="relative">
                <div className="w-7 h-7 bg-amber-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center animate-bounce">
                  <Truck className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.5 rounded bg-amber-950/90 text-amber-200 text-[9px] font-mono">
                  {amb.vehicle_number}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-xl p-3 shadow-2xl text-xs space-y-1.5 z-20">
        <p className="font-semibold text-slate-200 text-[11px] uppercase tracking-wider mb-2">Live Network</p>
        {[
          { color: "#10B981", label: "Ready" },
          { color: "#F59E0B", label: "Limited" },
          { color: "#EF4444", label: "Critical" },
          { color: "#6B7280", label: "Offline" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border border-white/50 shadow-sm" style={{ backgroundColor: color }} />
            <span className="text-slate-300 text-[11px]">{label}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-700 text-amber-400">
          <Truck className="w-3.5 h-3.5" />
          <span className="text-[11px]">Active Ambulance</span>
        </div>
        <div className="flex items-center gap-2 text-red-400 text-[11px]">
          <span className="w-3 h-0.5 bg-red-500" />
          <span>Emergency Route</span>
        </div>
      </div>
    </div>
  );
}

export default function NetworkMapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [forceTacticalMap, setForceTacticalMap] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [mobileTab, setMobileTab] = useState<"map" | "list">("map");

  const [layerFilters, setLayerFilters] = useState({
    facilities: true,
    patients: true,
    ambulances: true,
    referrals: false,
  });

  const {
    facilities, ambulances, activeReferrals, highRiskPatients,
    selectedFacilityId, selectedAmbulanceId,
    setFacilities, setAmbulances, setActiveReferrals, setHighRiskPatients,
    selectFacility, selectAmbulance,
  } = useNetworkStore();

  const loadNetworkData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await simulationApi.getNetwork();
      if (res.data?.facilities && res.data.facilities.length > 0) {
        setFacilities(res.data.facilities);
        setAmbulances(res.data.ambulances || FALLBACK_AMBULANCES);
        setActiveReferrals(res.data.active_referrals || FALLBACK_REFERRALS);
        setHighRiskPatients(res.data.high_risk_patients || FALLBACK_HIGH_RISK_PATIENTS);
      } else {
        // Fallback to comprehensive Pune/Haveli dataset
        setFacilities(FALLBACK_FACILITIES);
        setAmbulances(FALLBACK_AMBULANCES);
        setActiveReferrals(FALLBACK_REFERRALS);
        setHighRiskPatients(FALLBACK_HIGH_RISK_PATIENTS);
      }
    } catch {
      // Fallback to comprehensive Pune/Haveli dataset
      setFacilities(FALLBACK_FACILITIES);
      setAmbulances(FALLBACK_AMBULANCES);
      setActiveReferrals(FALLBACK_REFERRALS);
      setHighRiskPatients(FALLBACK_HIGH_RISK_PATIENTS);
    } finally {
      setLoading(false);
    }
  }, [setFacilities, setAmbulances, setActiveReferrals, setHighRiskPatients]);

  useEffect(() => {
    loadNetworkData();
  }, [loadNetworkData]);

  // Catch Google Maps auth failure globally
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).gm_authFailure = () => {
        console.warn("Google Maps auth failure encountered — switching to tactical vector map");
        setMapError(true);
      };
    }
  }, []);

  // Initialize Google Maps if key available
  useEffect(() => {
    if (IS_DEMO_MAP || forceTacticalMap || !mapRef.current) return;

    try {
      setOptions({
        key: MAPS_API_KEY,
        v: "weekly",
        libraries: ["places", "geometry"],
      });

      importLibrary("maps")
        .then(() => {
          if (!mapRef.current) return;
          const map = new google.maps.Map(mapRef.current, {
            center: DEFAULT_CENTER,
            zoom: DEFAULT_ZOOM,
            mapTypeControl: true,
            streetViewControl: false,
            fullscreenControl: true,
            zoomControl: true,
            styles: [
              { featureType: "poi.business", stylers: [{ visibility: "off" }] },
              { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9e8f5" }] },
            ],
          });
          googleMapRef.current = map;
          setMapLoaded(true);
        })
        .catch((err) => {
          console.warn("Google Maps importLibrary failed, using tactical map:", err);
          setMapError(true);
        });
    } catch (e) {
      console.warn("Google Maps setup failed:", e);
      setMapError(true);
    }
  }, [forceTacticalMap]);

  // Add Google Maps markers when ready
  useEffect(() => {
    if (!googleMapRef.current || !facilities.length) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    facilities.forEach((facility) => {
      const marker = new google.maps.Marker({
        position: { lat: facility.lat, lng: facility.lng },
        map: googleMapRef.current!,
        title: facility.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: getFacilityMarkerColor(facility.status),
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
          scale: getFacilityMarkerScale(facility.type),
        },
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px; max-width: 200px;">
            <p style="font-weight: 600; font-size: 13px; margin: 0 0 4px">${facility.name}</p>
            <p style="font-size: 11px; color: #64748b; margin: 0 0 4px">${facility.type.replace(/_/g, " ")}</p>
            <div style="display: flex; gap: 8px; font-size: 11px;">
              <span style="color: #0d9488">Beds: ${facility.total_beds - facility.occupied_beds} avail</span>
              <span style="color: ${facility.oxygen_available ? "#10b981" : "#ef4444"}">
                O₂: ${facility.oxygen_available ? "✓" : "✗"}
              </span>
            </div>
          </div>
        `,
      });

      marker.addListener("click", () => {
        selectFacility(facility.id);
        infoWindow.open(googleMapRef.current, marker);
      });

      markersRef.current.push(marker);
    });

    ambulances.forEach((amb) => {
      if (!amb.current_lat || !amb.current_lng) return;
      const marker = new google.maps.Marker({
        position: { lat: amb.current_lat, lng: amb.current_lng },
        map: googleMapRef.current!,
        title: `Ambulance ${amb.vehicle_number}`,
        icon: {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          fillColor: "#3b82f6",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 1.5,
          scale: 6,
        },
      });
      marker.addListener("click", () => selectAmbulance(amb.id));
      markersRef.current.push(marker);
    });
  }, [mapLoaded, facilities, ambulances, selectFacility, selectAmbulance]);

  const selectedFacility = facilities.find((f) => f.id === selectedFacilityId);
  const selectedAmbulance = ambulances.find((a) => a.id === selectedAmbulanceId);

  const filteredFacilities = facilities.filter(
    (f) =>
      !search ||
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.village?.toLowerCase().includes(search.toLowerCase())
  );

  const useFallbackView = IS_DEMO_MAP || mapError || forceTacticalMap;

  return (
    <AppShell title="Network Map" subtitle="Pune District · Haveli Sector">
      {/* Mobile Tab Switcher */}
      <div className="md:hidden flex border-b border-clinical-border bg-white sticky top-0 z-20">
        <button
          onClick={() => setMobileTab("map")}
          className={`flex-1 py-2.5 text-xs font-semibold text-center border-b-2 transition-colors ${
            mobileTab === "map"
              ? "border-teal-600 text-teal-700 bg-teal-50/50"
              : "border-transparent text-clinical-muted"
          }`}
        >
          🗺️ Operational Map
        </button>
        <button
          onClick={() => setMobileTab("list")}
          className={`flex-1 py-2.5 text-xs font-semibold text-center border-b-2 transition-colors ${
            mobileTab === "list"
              ? "border-teal-600 text-teal-700 bg-teal-50/50"
              : "border-transparent text-clinical-muted"
          }`}
        >
          🏢 Facilities ({filteredFacilities.length})
        </button>
      </div>

      <div className="flex flex-col md:flex-row h-[calc(100vh-100px)] md:h-[calc(100vh-56px)] relative">
        {/* Left panel */}
        <div
          className={`w-full md:w-72 flex-shrink-0 border-r border-clinical-border bg-white flex flex-col ${
            mobileTab === "list" ? "flex flex-1" : "hidden md:flex"
          }`}
        >
          {/* Search */}
          <div className="p-3 border-b border-clinical-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-clinical-muted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-8 text-xs py-2"
                placeholder="Search facility, village..."
              />
            </div>
          </div>

          {/* Map Mode Selector */}
          <div className="p-3 border-b border-clinical-border bg-slate-50/50">
            <p className="text-[10px] font-bold text-clinical-muted uppercase tracking-wider mb-2">Visualization Engine</p>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-gray-200/60 rounded-lg">
              <button
                onClick={() => setForceTacticalMap(true)}
                className={`py-1 text-xs font-medium rounded transition-all ${
                  useFallbackView ? "bg-white text-teal-700 shadow-sm font-semibold" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Tactical GIS
              </button>
              <button
                onClick={() => {
                  setForceTacticalMap(false);
                  setMapError(false);
                }}
                className={`py-1 text-xs font-medium rounded transition-all ${
                  !useFallbackView ? "bg-white text-teal-700 shadow-sm font-semibold" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Google Maps
              </button>
            </div>
          </div>

          {/* Layer filters */}
          <div className="p-3 border-b border-clinical-border">
            <p className="text-xs font-semibold text-clinical-muted uppercase tracking-wide mb-2">Layers</p>
            <div className="space-y-1.5">
              {(Object.keys(layerFilters) as Array<keyof typeof layerFilters>).map((key) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={layerFilters[key]}
                    onChange={(e) => setLayerFilters((p) => ({ ...p, [key]: e.target.checked }))}
                    className="w-3.5 h-3.5 accent-teal-600"
                  />
                  <span className="text-xs text-clinical-navy capitalize">{key}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Facility list */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-2">
              <p className="text-xs font-semibold text-clinical-muted uppercase tracking-wide px-2 py-1.5">
                Facilities ({filteredFacilities.length})
              </p>
              {filteredFacilities.map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    selectFacility(f.id);
                    setMobileTab("map");
                    if (googleMapRef.current) {
                      googleMapRef.current.panTo({ lat: f.lat, lng: f.lng });
                      googleMapRef.current.setZoom(13);
                    }
                  }}
                  className={`w-full flex items-start gap-2.5 p-2.5 rounded-lg text-left transition-all hover:bg-gray-50 ${
                    selectedFacilityId === f.id ? "bg-teal-50" : ""
                  }`}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: getFacilityMarkerColor(f.status) }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-clinical-navy truncate">{f.name}</p>
                    <p className="text-[10px] text-clinical-muted">{f.type.replace(/_/g, " ")} · {f.village}</p>
                    <p className="text-[10px] text-clinical-muted">{f.total_beds - f.occupied_beds} beds free</p>
                  </div>
                </button>
              ))}
            </div>

            {/* High-risk patients */}
            {highRiskPatients.length > 0 && (
              <div className="p-2 border-t border-clinical-border">
                <p className="text-xs font-semibold text-clinical-muted uppercase tracking-wide px-2 py-1.5">
                  High Risk Patients ({highRiskPatients.length})
                </p>
                {highRiskPatients.map((p) => (
                  <div key={p.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50">
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        p.risk_level === "CRITICAL" ? "bg-purple-500" : "bg-red-500"
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-clinical-navy truncate">{p.name}</p>
                      <p className="text-[10px] text-clinical-muted">
                        {p.current_state.replace(/_/g, " ")} · {p.village}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Map Visualization Viewport */}
        <div className={`flex-1 relative ${mobileTab === "map" ? "flex" : "hidden md:flex"}`}>
          {useFallbackView ? (
            <InteractiveTacticalMap
              facilities={filteredFacilities}
              ambulances={ambulances}
              referrals={activeReferrals}
              selectedFacilityId={selectedFacilityId}
              onSelectFacility={selectFacility}
            />
          ) : (
            <div ref={mapRef} className="w-full h-full" />
          )}

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-20">
              <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
            </div>
          )}
        </div>

        {/* Selected Details Sheet / Panel */}
        {(selectedFacility || selectedAmbulance) && (
          <div className="fixed bottom-0 left-0 right-0 max-h-[55vh] md:relative md:w-72 md:max-h-full md:h-auto flex-shrink-0 border-t md:border-t-0 md:border-l border-clinical-border bg-white overflow-y-auto z-30 shadow-2xl md:shadow-none animate-in slide-in-from-bottom duration-200">
            {selectedFacility && (
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-clinical-navy text-sm">{selectedFacility.name}</h3>
                    <p className="text-xs text-clinical-muted">
                      {selectedFacility.type.replace(/_/g, " ")} · {selectedFacility.village}
                    </p>
                  </div>
                  <button onClick={() => selectFacility(null)} className="text-clinical-muted hover:text-clinical-navy p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Status Badge */}
                <div
                  className={`inline-flex items-center gap-1.5 badge text-xs mb-3 ${
                    selectedFacility.status === "READY"
                      ? "badge-ready"
                      : selectedFacility.status === "LIMITED"
                      ? "badge-limited"
                      : selectedFacility.status === "CRITICAL"
                      ? "badge-critical"
                      : "badge-offline"
                  }`}
                >
                  <div
                    className={`status-dot ${
                      selectedFacility.status === "READY"
                        ? "status-dot-ready"
                        : selectedFacility.status === "LIMITED"
                        ? "status-dot-limited"
                        : "status-dot-critical"
                    }`}
                  />
                  {selectedFacility.status}
                </div>

                {/* Readiness score */}
                <div className="card p-3 mb-3 bg-gray-50/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-clinical-muted">Readiness Score</span>
                    <span className="text-sm font-bold text-clinical-navy">{selectedFacility.readiness_score}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${
                        selectedFacility.readiness_score >= 75
                          ? "bg-emerald-500"
                          : selectedFacility.readiness_score >= 50
                          ? "bg-amber-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${selectedFacility.readiness_score}%` }}
                    />
                  </div>
                </div>

                {/* Capacities */}
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-clinical-muted">General Beds</span>
                    <span className="font-semibold text-clinical-navy">
                      {selectedFacility.total_beds - selectedFacility.occupied_beds} free / {selectedFacility.total_beds}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-clinical-muted">ICU Beds</span>
                    <span className="font-semibold text-clinical-navy">
                      {selectedFacility.icu_beds - selectedFacility.icu_occupied} free / {selectedFacility.icu_beds}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-clinical-muted">Oxygen</span>
                    <span className={selectedFacility.oxygen_available ? "text-emerald-600 font-semibold" : "text-red-600"}>
                      {selectedFacility.oxygen_available ? "Available" : "Not Available"}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-clinical-muted">Blood Bank</span>
                    <span className={selectedFacility.blood_bank ? "text-emerald-600 font-semibold" : "text-clinical-muted"}>
                      {selectedFacility.blood_bank ? "On-site" : "None"}
                    </span>
                  </div>
                </div>

                {/* Specialists */}
                {selectedFacility.specialists?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-clinical-muted mb-1.5">Specialists on duty</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedFacility.specialists.map((s) => (
                        <span key={s} className="bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action button */}
                <div className="pt-2 border-t border-clinical-border">
                  <a
                    href={`/facilities/${selectedFacility.id}`}
                    className="btn-secondary btn-sm w-full justify-center text-center text-xs"
                  >
                    View Facility Details →
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
