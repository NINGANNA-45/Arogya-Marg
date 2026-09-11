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
  Navigation, Maximize, ZoomIn
} from "lucide-react";
import { useNetworkStore } from "@/lib/stores/networkStore";
import { getStatusColor } from "@/lib/utils";

const FACILITY_TYPE_COLORS: Record<string, string> = {
  DISTRICT_HOSPITAL: "#1e40af",
  RURAL_HOSPITAL: "#1d4ed8",
  CHC: "#0369a1",
  PHC: "#0284c7",
  AROGYA_MANDIR: "#0891b2",
  DIAGNOSTIC_CENTRE: "#7c3aed",
  BLOOD_BANK: "#dc2626",
  SUB_CENTRE: "#059669",
};

function DemoMapFallback({
  facilities, ambulances, referrals,
  selectedFacilityId, onSelectFacility
}: {
  facilities: Facility[];
  ambulances: Ambulance[];
  referrals: Referral[];
  selectedFacilityId: string | null;
  onSelectFacility: (id: string) => void;
}) {
  return (
    <div className="relative w-full h-full bg-slate-100 overflow-hidden">
      {/* Demo notice */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-amber-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md flex items-center gap-2">
        <AlertTriangle className="w-3 h-3" />
        DEMO MAP MODE — Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY for real Google Maps
      </div>

      {/* Grid overlay simulating map tiles */}
      <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#94a3b8" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        {/* Simulated roads */}
        <line x1="0" y1="40%" x2="100%" y2="45%" stroke="#cbd5e1" strokeWidth="2"/>
        <line x1="30%" y1="0" x2="35%" y2="100%" stroke="#cbd5e1" strokeWidth="1.5"/>
        <line x1="60%" y1="0" x2="65%" y2="100%" stroke="#cbd5e1" strokeWidth="2"/>
        <line x1="0" y1="70%" x2="100%" y2="68%" stroke="#cbd5e1" strokeWidth="1"/>
        {/* Water body */}
        <ellipse cx="20%" cy="75%" rx="8%" ry="5%" fill="#bfdbfe" opacity="0.5"/>
      </svg>

      {/* Facility markers */}
      {facilities.map((f, i) => {
        // Map geographic coords to screen position (rough)
        const screenX = ((f.lng - 73.80) / 0.30) * 100;
        const screenY = ((18.60 - f.lat) / 0.20) * 100;
        const color = getFacilityMarkerColor(f.status);
        const size = getFacilityMarkerScale(f.type);
        const isSelected = selectedFacilityId === f.id;

        return (
          <button
            key={f.id}
            onClick={() => onSelectFacility(f.id)}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group transition-transform hover:scale-110"
            style={{ left: `${Math.max(5, Math.min(95, screenX))}%`, top: `${Math.max(5, Math.min(95, screenY))}%` }}
          >
            <div
              className={`rounded-full border-2 border-white shadow-md flex items-center justify-center transition-all ${isSelected ? "ring-3 ring-offset-1" : ""}`}
              style={{ width: size * 2, height: size * 2, backgroundColor: color }}
            >
              {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
            </div>
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-semibold text-gray-700 bg-white/90 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
              {f.name.split(" ").slice(0, 2).join(" ")}
            </div>
          </button>
        );
      })}

      {/* Ambulance markers */}
      {ambulances.map((amb) => {
        if (!amb.current_lat || !amb.current_lng) return null;
        const screenX = ((amb.current_lng - 73.80) / 0.30) * 100;
        const screenY = ((18.60 - amb.current_lat) / 0.20) * 100;
        return (
          <div
            key={amb.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${Math.max(5, Math.min(95, screenX))}%`, top: `${Math.max(5, Math.min(95, screenY))}%` }}
          >
            <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-md flex items-center justify-center">
              <Truck className="w-3 h-3 text-white" />
            </div>
          </div>
        );
      })}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 rounded-xl p-3 shadow-clinical-md text-xs space-y-1.5">
        <p className="font-semibold text-clinical-navy mb-2">Facility Status</p>
        {[
          { color: "#10B981", label: "Ready" },
          { color: "#F59E0B", label: "Limited" },
          { color: "#EF4444", label: "Critical" },
          { color: "#6B7280", label: "Offline" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border border-white shadow-sm" style={{ backgroundColor: color }} />
            <span className="text-clinical-muted">{label}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
          <div className="w-3 h-3 bg-blue-500 rounded-full" />
          <span className="text-clinical-muted">Ambulance</span>
        </div>
      </div>

      {/* Pune label */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-300 text-6xl font-bold select-none pointer-events-none">
        Haveli
      </div>
    </div>
  );
}

export default function NetworkMapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
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

  useEffect(() => {
    loadNetworkData();
  }, []);

  const loadNetworkData = async () => {
    try {
      const res = await simulationApi.getNetwork();
      setFacilities(res.data.facilities);
      setAmbulances(res.data.ambulances);
      setActiveReferrals(res.data.active_referrals);
      setHighRiskPatients(res.data.high_risk_patients);
    } catch {
      // Use demo data for display
    } finally {
      setLoading(false);
    }
  };

  // Initialize Google Maps
  useEffect(() => {
    if (IS_DEMO_MAP || !mapRef.current) return;

    setOptions({
      key: MAPS_API_KEY,
      v: "weekly",
      libraries: ["places", "geometry"],
    });

    importLibrary("maps").then(() => {
      const map = new google.maps.Map(mapRef.current!, {
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
    });
  }, []);

  // Add markers when data + map ready
  useEffect(() => {
    if (!googleMapRef.current || !facilities.length) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.setMap(null));
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
            <p style="font-size: 10px; margin-top: 6px; background: ${
              facility.status === "READY" ? "#d1fae5" :
              facility.status === "LIMITED" ? "#fef3c7" :
              "#fee2e2"
            }; padding: 2px 6px; border-radius: 999px; display: inline-block; font-weight: 600; color: ${
              facility.status === "READY" ? "#065f46" :
              facility.status === "LIMITED" ? "#92400e" :
              "#991b1b"
            }">● ${facility.status}</p>
          </div>
        `,
      });

      marker.addListener("click", () => {
        selectFacility(facility.id);
        infoWindow.open(googleMapRef.current!, marker);
      });

      markersRef.current.push(marker);
    });

    // Ambulance markers
    ambulances.forEach((amb) => {
      if (!amb.current_lat || !amb.current_lng) return;
      const marker = new google.maps.Marker({
        position: { lat: amb.current_lat, lng: amb.current_lng },
        map: googleMapRef.current!,
        title: amb.vehicle_number,
        icon: {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          fillColor: "#3B82F6",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 1.5,
          scale: 6,
        },
      });
      marker.addListener("click", () => selectAmbulance(amb.id));
      markersRef.current.push(marker);
    });
  }, [mapLoaded, facilities, ambulances]);

  const selectedFacility = facilities.find(f => f.id === selectedFacilityId);
  const selectedAmbulance = ambulances.find(a => a.id === selectedAmbulanceId);

  const filteredFacilities = facilities.filter(f =>
    !search || f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.village?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell title="Network Map" subtitle="Pune District · Haveli">
      <div className="flex h-[calc(100vh-56px)]">
        {/* Left panel */}
        <div className="w-72 flex-shrink-0 border-r border-clinical-border bg-white flex flex-col">
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

          {/* Layer filters */}
          <div className="p-3 border-b border-clinical-border">
            <p className="text-xs font-semibold text-clinical-muted uppercase tracking-wide mb-2">Layers</p>
            <div className="space-y-1.5">
              {(Object.keys(layerFilters) as Array<keyof typeof layerFilters>).map((key) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={layerFilters[key]}
                    onChange={(e) => setLayerFilters(p => ({ ...p, [key]: e.target.checked }))}
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
                  High Risk Patients
                </p>
                {highRiskPatients.map((p) => (
                  <div key={p.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      p.risk_level === "CRITICAL" ? "bg-purple-500" : "bg-red-500"
                    }`} />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-clinical-navy truncate">{p.name}</p>
                      <p className="text-[10px] text-clinical-muted">{p.current_state.replace(/_/g, " ")} · {p.village}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          {IS_DEMO_MAP ? (
            <DemoMapFallback
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
            <div className="absolute inset-0 flex items-center justify-center bg-white/60">
              <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
            </div>
          )}
        </div>

        {/* Right context panel */}
        {(selectedFacility || selectedAmbulance) && (
          <div className="w-72 flex-shrink-0 border-l border-clinical-border bg-white overflow-y-auto">
            {selectedFacility && (
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-clinical-navy text-sm">{selectedFacility.name}</h3>
                    <p className="text-xs text-clinical-muted">{selectedFacility.type.replace(/_/g, " ")} · {selectedFacility.village}</p>
                  </div>
                  <button onClick={() => selectFacility(null)} className="text-clinical-muted hover:text-clinical-navy">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Status */}
                <div className={`inline-flex items-center gap-1.5 badge text-xs mb-3 ${
                  selectedFacility.status === "READY" ? "badge-ready" :
                  selectedFacility.status === "LIMITED" ? "badge-limited" :
                  selectedFacility.status === "CRITICAL" ? "badge-critical" :
                  "badge-offline"
                }`}>
                  <div className={`status-dot ${
                    selectedFacility.status === "READY" ? "status-dot-ready" :
                    selectedFacility.status === "LIMITED" ? "status-dot-limited" :
                    "status-dot-critical"
                  }`} />
                  {selectedFacility.status}
                </div>

                {/* Readiness score */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-clinical-muted font-medium">Readiness Score</span>
                    <span className="font-bold text-clinical-navy">{selectedFacility.readiness_score}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        selectedFacility.readiness_score >= 75 ? "bg-emerald-500" :
                        selectedFacility.readiness_score >= 50 ? "bg-amber-500" : "bg-red-500"
                      }`}
                      style={{ width: `${selectedFacility.readiness_score}%` }}
                    />
                  </div>
                </div>

                {/* Capacity */}
                <div className="space-y-2 mb-4">
                  <p className="text-xs font-semibold text-clinical-muted uppercase tracking-wide">Capacity</p>
                  {[
                    { label: "Beds", value: `${selectedFacility.occupied_beds}/${selectedFacility.total_beds}`, avail: selectedFacility.total_beds - selectedFacility.occupied_beds },
                    { label: "ICU", value: `${selectedFacility.icu_occupied}/${selectedFacility.icu_beds}`, avail: selectedFacility.icu_beds - selectedFacility.icu_occupied },
                  ].map(({ label, value, avail }) => (
                    <div key={label} className="flex justify-between items-center text-xs">
                      <span className="text-clinical-muted">{label}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-clinical-navy">{value}</span>
                        <span className={`text-[10px] font-medium ${avail > 0 ? "text-emerald-600" : "text-red-600"}`}>
                          {avail > 0 ? `${avail} free` : "Full"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Resources */}
                <div className="space-y-2 mb-4">
                  <p className="text-xs font-semibold text-clinical-muted uppercase tracking-wide">Resources</p>
                  <div className="flex justify-between text-xs">
                    <span className="text-clinical-muted">Oxygen</span>
                    {selectedFacility.oxygen_available ? (
                      <span className="flex items-center gap-1 text-emerald-600"><CheckCircle className="w-3 h-3" /> Available</span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-600"><XCircle className="w-3 h-3" /> Unavailable</span>
                    )}
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-clinical-muted">Blood Bank</span>
                    {selectedFacility.blood_bank ? (
                      <span className="flex items-center gap-1 text-emerald-600"><CheckCircle className="w-3 h-3" /> Available</span>
                    ) : (
                      <span className="flex items-center gap-1 text-gray-400"><XCircle className="w-3 h-3" /> Not available</span>
                    )}
                  </div>
                </div>

                {/* Diagnostics */}
                {selectedFacility.diagnostics.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-clinical-muted uppercase tracking-wide mb-1.5">Diagnostics</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedFacility.diagnostics.map(d => (
                        <span key={d} className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-full">{d}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Specialists */}
                {selectedFacility.specialists.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-clinical-muted uppercase tracking-wide mb-1.5">Specialists</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedFacility.specialists.map(s => (
                        <span key={s} className="text-[10px] bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-2">
                  <button className="btn-primary w-full text-xs">View Facility Detail</button>
                  <button className="btn-secondary w-full text-xs">Route Patient Here</button>
                  <button className="btn-secondary w-full text-xs">Create Referral</button>
                </div>
              </div>
            )}

            {selectedAmbulance && (
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-clinical-navy text-sm">{selectedAmbulance.vehicle_number}</h3>
                    <p className="text-xs text-clinical-muted">{selectedAmbulance.vehicle_type} Ambulance</p>
                  </div>
                  <button onClick={() => selectAmbulance(null)} className="text-clinical-muted hover:text-clinical-navy">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-clinical-muted">Status</span>
                    <span className={`badge ${getStatusColor(selectedAmbulance.status)}`}>{selectedAmbulance.status}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-clinical-muted">Driver</span>
                    <span className="text-clinical-navy font-medium">{selectedAmbulance.driver_name || "—"}</span>
                  </div>
                  {selectedAmbulance.eta_minutes && (
                    <div className="flex justify-between text-xs">
                      <span className="text-clinical-muted">ETA</span>
                      <span className="text-blue-600 font-medium">{selectedAmbulance.eta_minutes} min</span>
                    </div>
                  )}
                  {selectedAmbulance.speed_kmph && (
                    <div className="flex justify-between text-xs">
                      <span className="text-clinical-muted">Speed</span>
                      <span className="text-clinical-navy font-medium">{selectedAmbulance.speed_kmph} km/h</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
