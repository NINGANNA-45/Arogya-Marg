import { create } from "zustand";
import type { Facility, Ambulance, Referral, Patient, SimulationResult } from "@/types";

interface NetworkState {
  facilities: Facility[];
  ambulances: Ambulance[];
  activeReferrals: Referral[];
  highRiskPatients: { id: string; name: string; risk_level: string; current_state: string; village: string }[];
  selectedFacilityId: string | null;
  selectedPatientId: string | null;
  selectedAmbulanceId: string | null;
  lastSimulationResult: SimulationResult | null;
  setFacilities: (f: Facility[]) => void;
  setAmbulances: (a: Ambulance[]) => void;
  setActiveReferrals: (r: Referral[]) => void;
  setHighRiskPatients: (p: NetworkState["highRiskPatients"]) => void;
  selectFacility: (id: string | null) => void;
  selectPatient: (id: string | null) => void;
  selectAmbulance: (id: string | null) => void;
  updateFacility: (id: string, updates: Partial<Facility>) => void;
  setSimulationResult: (r: SimulationResult | null) => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  facilities: [],
  ambulances: [],
  activeReferrals: [],
  highRiskPatients: [],
  selectedFacilityId: null,
  selectedPatientId: null,
  selectedAmbulanceId: null,
  lastSimulationResult: null,
  setFacilities: (facilities) => set({ facilities }),
  setAmbulances: (ambulances) => set({ ambulances }),
  setActiveReferrals: (activeReferrals) => set({ activeReferrals }),
  setHighRiskPatients: (highRiskPatients) => set({ highRiskPatients }),
  selectFacility: (id) => set({ selectedFacilityId: id, selectedPatientId: null, selectedAmbulanceId: null }),
  selectPatient: (id) => set({ selectedPatientId: id, selectedFacilityId: null, selectedAmbulanceId: null }),
  selectAmbulance: (id) => set({ selectedAmbulanceId: id, selectedFacilityId: null, selectedPatientId: null }),
  updateFacility: (id, updates) =>
    set((state) => ({
      facilities: state.facilities.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    })),
  setSimulationResult: (r) => set({ lastSimulationResult: r }),
}));
