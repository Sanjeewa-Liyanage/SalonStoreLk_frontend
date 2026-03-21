
import axios from "axios";
import { refreshAccessToken } from "./authService";

async function salonRequest(params: Record<string, string>, accessToken: string) {
  const query = new URLSearchParams(params).toString();
  try {
    const { data } = await axios.get(`/api/salons?${query}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return data;
  } catch (error: any) {
    if (error?.response?.status !== 401) throw error;

    const nextAccessToken = await refreshAccessToken();
    const { data } = await axios.get(`/api/salons?${query}`, {
      headers: { Authorization: `Bearer ${nextAccessToken}` },
    });
    return data;
  }
}

async function salonPatchRequest(params: Record<string, string>, accessToken: string) {
  const query = new URLSearchParams(params).toString();
  try {
    const { data } = await axios.patch(`/api/salons?${query}`, {}, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return data;
  } catch (error: any) {
    if (error?.response?.status !== 401) throw error;

    const nextAccessToken = await refreshAccessToken();
    const { data } = await axios.patch(`/api/salons?${query}`, {}, {
      headers: { Authorization: `Bearer ${nextAccessToken}` },
    });
    return data;
  }
}

export const fetchAllSalons    = (token: string) => salonRequest({ type: "all" }, token);
export const fetchActiveSalons = (token: string) => salonRequest({ type: "active" }, token);
export const fetchPendingSalons = (token: string) => salonRequest({ type: "pending" }, token);
export const fetchSalonById    = (id: string, token: string) => salonRequest({ type: "by-id", id }, token);

// Salon action endpoints
export const activateSalon = (id: string, token: string) => salonPatchRequest({ action: "activate", id }, token);
export const suspendSalon = (id: string, token: string) => salonPatchRequest({ action: "suspend", id }, token);
export const unsuspendSalon = (id: string, token: string) => salonPatchRequest({ action: "unsuspend", id }, token);