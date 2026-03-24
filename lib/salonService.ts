
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
  const reason = params.reason;
  const requestParams = { ...params };
  delete requestParams.reason;

  const body = (params.action === 'suspend' || params.action === 'reject') && reason ? { reason } : {};
  
  const query = new URLSearchParams(requestParams).toString();
  try {
	const { data } = await axios.patch(`/api/salons?${query}`, body, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return data;
  } catch (error: any) {
    if (error?.response?.status !== 401) throw error;

    const nextAccessToken = await refreshAccessToken();
	const { data } = await axios.patch(`/api/salons?${query}`, body, {
      headers: { Authorization: `Bearer ${nextAccessToken}` },
    });
    return data;
  }
}

export const fetchAllSalons    = (token: string) => salonRequest({ type: "all" }, token);
export const fetchActiveSalons = (token: string) => salonRequest({ type: "active" }, token);
export const fetchPendingSalons = (token: string) => salonRequest({ type: "pending" }, token);
export const fetchSalonById    = (id: string, token: string) => salonRequest({ type: "by-id", id }, token);
export const fetchByOwner      = (token: string) => salonRequest({ type: "by-owner" }, token);


// Fetch full salon details by ID from the dedicated endpoint
export const fetchSalonDetails = async (id: string, accessToken: string) => {
  try {
    const { data } = await axios.get(`/api/salons/${id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return data;
  } catch (error: any) {
    if (error?.response?.status !== 401) throw error;

    const nextAccessToken = await refreshAccessToken();
    const { data } = await axios.get(`/api/salons/${id}`, {
      headers: { Authorization: `Bearer ${nextAccessToken}` },
    });
    return data;
  }
};


export async function createSalon(salonData: any) {
  const token = sessionStorage.getItem("accessToken");
  
  try {
    const { data } = await axios.post("/api/salons/create", salonData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (error: any) {
    // If token expired (401), refresh and retry
    if (error?.response?.status !== 401) throw error;

    const nextAccessToken = await refreshAccessToken();
    const { data } = await axios.post("/api/salons/create", salonData, {
      headers: { Authorization: `Bearer ${nextAccessToken}` },
    });
    return data;
  }
}


// export async function fetchByOwner(accessToken: string){
//   const client = axios.create(
//     {
//       baseURL: typeof window !== "undefined" ? window.location.origin : "",
//     }
//   );
//   const {data} = await client.get("/api/salon/owner",{
//     headers: { Authorization: `Bearer ${accessToken}` },
//   } );
//   return data;
// }

// Salon action endpoints
export const activateSalon = (id: string, token: string) => salonPatchRequest({ action: "activate", id }, token);
export const suspendSalon = (id: string, reason: string, token: string) =>
  salonPatchRequest({ action: "suspend", id, reason }, token);
export const rejectSalon = (id: string, reason: string, token: string) =>
  salonPatchRequest({ action: "reject", id, reason }, token);
export const unsuspendSalon = (id: string, token: string) => salonPatchRequest({ action: "unsuspend", id }, token);