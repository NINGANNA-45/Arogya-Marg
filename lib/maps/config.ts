/**
 * Google Maps abstraction layer for Arogya Marg.
 * Swap the provider here without touching map components.
 *
 * Uses NEXT_PUBLIC_GOOGLE_MAPS_API_KEY from env.
 * Falls back to Demo Map Mode if key is missing.
 */

export const MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
export const IS_DEMO_MAP = !MAPS_API_KEY;

// Default center: Haveli Taluka, Pune District
export const DEFAULT_CENTER = { lat: 18.5089, lng: 73.9634 };
export const DEFAULT_ZOOM = 11;

export const MAP_STYLES_CLINICAL: google.maps.MapTypeStyle[] = [
  {
    featureType: "poi.business",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#c9e8f5" }],
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road.local",
    elementType: "geometry",
    stylers: [{ color: "#f5f5f5" }],
  },
];

// Marker colors per facility status
export function getFacilityMarkerColor(status: string): string {
  switch (status) {
    case "READY": return "#10B981";     // emerald
    case "LIMITED": return "#F59E0B";   // amber
    case "CRITICAL": return "#EF4444";  // red
    case "OFFLINE": return "#6B7280";   // gray
    default: return "#3B82F6";          // blue
  }
}

// Marker scale per facility type
export function getFacilityMarkerScale(type: string): number {
  switch (type) {
    case "DISTRICT_HOSPITAL": return 14;
    case "RURAL_HOSPITAL":
    case "CHC": return 12;
    case "PHC": return 10;
    case "AROGYA_MANDIR":
    case "SUB_CENTRE": return 8;
    default: return 8;
  }
}

export function getFacilityIcon(type: string, status: string): google.maps.Symbol {
  const color = getFacilityMarkerColor(status);
  const scale = getFacilityMarkerScale(type);
  return {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: color,
    fillOpacity: 1,
    strokeColor: "#ffffff",
    strokeWeight: 2,
    scale,
  };
}

export function getAmbulanceIcon(): google.maps.Symbol {
  return {
    path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
    fillColor: "#3B82F6",
    fillOpacity: 1,
    strokeColor: "#ffffff",
    strokeWeight: 1.5,
    scale: 6,
    rotation: 0,
  };
}

export interface LatLng {
  lat: number;
  lng: number;
}

export function toLatLng(lat: number, lng: number): LatLng {
  return { lat, lng };
}
