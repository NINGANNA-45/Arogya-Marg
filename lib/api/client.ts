import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

// Attach JWT token to every request
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("am_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
apiClient.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const url = error.config?.url || "";
      const isAuthUrl = url.includes("/auth/login") || url.includes("/auth/signup");
      if (!isAuthUrl) {
        localStorage.removeItem("am_token");
        localStorage.removeItem("am_user");
        if (window.location.pathname !== "/login" && window.location.pathname !== "/signup") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth ────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post("/auth/login", { email, password }),
  signup: (data: { name: string; email: string; password: string; role: string; facility_id?: string | null }) =>
    apiClient.post("/auth/signup", data),
  me: () => apiClient.get("/auth/me"),
};

// ── Patients ────────────────────────────────────────────────────
export const patientsApi = {
  list: (params?: Record<string, string | number>) =>
    apiClient.get("/patients", { params }),
  get: (id: string) => apiClient.get(`/patients/${id}`),
  create: (data: Record<string, unknown>) => apiClient.post("/patients", data),
  getCarePath: (id: string) => apiClient.get(`/patients/${id}/carepath`),
  transition: (id: string, data: Record<string, unknown>) =>
    apiClient.post(`/patients/${id}/carepath/transition`, data),
  addObservation: (id: string, data: Record<string, unknown>) =>
    apiClient.post(`/patients/${id}/observations`, data),
  getObservations: (id: string) => apiClient.get(`/patients/${id}/observations`),
  createEncounter: (id: string, data: Record<string, unknown>) =>
    apiClient.post(`/patients/${id}/encounters`, data),
};

// ── Referrals ───────────────────────────────────────────────────
export const referralsApi = {
  list: (params?: Record<string, string | number>) =>
    apiClient.get("/referrals", { params }),
  get: (id: string) => apiClient.get(`/referrals/${id}`),
  create: (data: Record<string, unknown>) => apiClient.post("/referrals", data),
  accept: (id: string) => apiClient.post(`/referrals/${id}/accept`),
  arrive: (id: string) => apiClient.post(`/referrals/${id}/arrive`),
  complete: (id: string) => apiClient.post(`/referrals/${id}/complete`),
  reroute: (id: string, data: { new_destination_facility_id: string; reason: string }) =>
    apiClient.post(`/referrals/${id}/reroute`, data),
};

// ── Facilities ──────────────────────────────────────────────────
export const facilitiesApi = {
  list: (params?: Record<string, string>) => apiClient.get("/facilities", { params }),
  get: (id: string) => apiClient.get(`/facilities/${id}`),
  update: (id: string, data: Record<string, unknown>) =>
    apiClient.patch(`/facilities/${id}`, data),
  readiness: (id: string) => apiClient.get(`/facilities/${id}/readiness`),
};

// ── Network / Router ────────────────────────────────────────────
export const networkApi = {
  route: (params: {
    origin_lat: number;
    origin_lng: number;
    needs_icu?: boolean;
    needs_oxygen?: boolean;
    needs_blood?: boolean;
    specialty?: string;
    diagnostics?: string;
    facility_type?: string;
  }) => apiClient.get("/network/route", { params }),
};

// ── Analytics ───────────────────────────────────────────────────
export const analyticsApi = {
  summary: () => apiClient.get("/analytics/summary"),
  careLeakage: () => apiClient.get("/analytics/care-leakage"),
  facilityUtilization: () => apiClient.get("/analytics/facility-utilization"),
};

// ── Simulation ──────────────────────────────────────────────────
export const simulationApi = {
  getNetwork: () => apiClient.get("/simulation/network"),
  getScenarios: () => apiClient.get("/simulation/scenarios"),
  activate: (scenarioId: string) =>
    apiClient.post(`/simulation/scenarios/${scenarioId}/activate`),
  reset: () => apiClient.post("/simulation/scenarios/reset"),
};

// ── Tasks / Ops ─────────────────────────────────────────────────
export const opsApi = {
  getTasks: (params?: { status?: string }) =>
    apiClient.get("/ops/tasks", { params }),
  completeTask: (id: string) => apiClient.patch(`/ops/tasks/${id}/complete`),
  getNotifications: () => apiClient.get("/ops/notifications"),
  markNotifRead: (id: string) => apiClient.patch(`/ops/notifications/${id}/read`),
  getFollowUps: (params?: { status?: string }) =>
    apiClient.get("/ops/follow-ups", { params }),
  completeFollowUp: (id: string, data: Record<string, unknown>) =>
    apiClient.post(`/ops/follow-ups/${id}/complete`, data),
};
