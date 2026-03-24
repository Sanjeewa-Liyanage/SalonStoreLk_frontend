const SELECTED_SALON_ID_KEY = "salon_owner_selected_salon_id";

export function getStoredSalonId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SELECTED_SALON_ID_KEY);
}

export function setStoredSalonId(salonId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SELECTED_SALON_ID_KEY, salonId);
}
