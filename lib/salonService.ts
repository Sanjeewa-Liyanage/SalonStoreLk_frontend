
import axios from "axios";
import { refreshAccessToken } from "./authService";
import type { Salon, Service } from "./types";

const FALLBACK_SALON_IMAGE =
  "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1400&q=80";

const CATEGORY_LOOKUP: Record<string, Salon["category"]> = {
  "academy & salon": "ACADEMY & SALON",
  csi: "CSI",
  gampaha: "Gampaha",
};

interface SalonQueryOptions {
  page?: number;
  limit?: number;
}

function normalizeCategory(rawCategory?: string): Salon["category"] {
  const normalized = String(rawCategory || "")
    .trim()
    .toLowerCase();

  return CATEGORY_LOOKUP[normalized] ?? "ACADEMY & SALON";
}

function normalizeServices(rawServices: any): Service[] {
  if (!Array.isArray(rawServices)) return [];

  return rawServices
    .filter((service) => service && typeof service === "object")
    .map((service, index) => ({
      id: String(service.id ?? `${service.name || "service"}-${index}`),
      name: String(service.name ?? "Unnamed Service"),
      category: String(service.category ?? "General"),
      products: Array.isArray(service.products)
        ? service.products.filter((product: unknown) => typeof product === "string")
        : undefined,
    }));
}

function normalizeSalon(rawSalon: any): Salon {
  const gallery = Array.isArray(rawSalon?.gallery)
    ? rawSalon.gallery
    : Array.isArray(rawSalon?.images)
      ? rawSalon.images
      : [];

  const safeGallery = gallery.filter((image: unknown) => typeof image === "string");
  const primaryImage =
    (typeof rawSalon?.image === "string" && rawSalon.image) ||
    safeGallery[0] ||
    FALLBACK_SALON_IMAGE;

  const locationText =
    typeof rawSalon?.location === "string" && rawSalon.location.trim().length > 0
      ? rawSalon.location
      : "";

  const address =
    rawSalon?.contact?.address ||
    rawSalon?.address ||
    locationText ||
    rawSalon?.city ||
    "Location not provided";

  const phone =
    rawSalon?.contact?.phone ||
    rawSalon?.contactInfo?.phoneNumber ||
    rawSalon?.phoneNumber ||
    "Not provided";

  const whatsapp =
    rawSalon?.contact?.whatsapp ||
    rawSalon?.contactInfo?.whatsappNumber ||
    phone;

  const district = String(rawSalon?.district || rawSalon?.city || "Sri Lanka");

  const latitude = Number(rawSalon?.location?.latitude ?? rawSalon?.coordinates?.latitude);
  const longitude = Number(rawSalon?.location?.longitude ?? rawSalon?.coordinates?.longitude);
  const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);

  return {
    id: String(rawSalon?.id || ""),
    name: String(rawSalon?.name || rawSalon?.salonName || "Unnamed Salon"),
    salonCode: rawSalon?.salonCode ? String(rawSalon.salonCode) : undefined,
    overview: rawSalon?.overview ? String(rawSalon.overview) : undefined,
    category: normalizeCategory(rawSalon?.category),
    location: String(locationText || rawSalon?.city || district),
    city: rawSalon?.city ? String(rawSalon.city) : undefined,
    district,
    image: primaryImage,
    rating:
      typeof rawSalon?.rating === "number"
        ? rawSalon.rating
        : typeof rawSalon?.averageRating === "number"
          ? rawSalon.averageRating
          : 0,
    reviews:
      typeof rawSalon?.reviews === "number"
        ? rawSalon.reviews
        : typeof rawSalon?.reviewCount === "number"
          ? rawSalon.reviewCount
          : 0,
    description: String(rawSalon?.description || rawSalon?.overview || "No description available."),
    openingTime: rawSalon?.openingTime ? String(rawSalon.openingTime) : undefined,
    closingTime: rawSalon?.closingTime ? String(rawSalon.closingTime) : undefined,
    services: normalizeServices(rawSalon?.services),
    gallery: safeGallery.length ? safeGallery : [primaryImage],
    coordinates: hasCoordinates ? { latitude, longitude } : undefined,
    contact: {
      phone: String(phone),
      whatsapp: String(whatsapp),
      email: rawSalon?.contact?.email,
      address: String(address),
    },
    qualifications: Array.isArray(rawSalon?.qualifications)
      ? rawSalon.qualifications.filter((item: unknown) => typeof item === "string")
      : [],
    experience: Array.isArray(rawSalon?.experience)
      ? rawSalon.experience.filter((item: unknown) => typeof item === "string")
      : [],
    socialMedia: {
      facebook: rawSalon?.socialMedia?.facebook || rawSalon?.socialMediaLinks?.facebook,
      instagram: rawSalon?.socialMedia?.instagram || rawSalon?.socialMediaLinks?.instagram,
      tiktok: rawSalon?.socialMedia?.tiktok || rawSalon?.socialMediaLinks?.tiktok,
      youtube: rawSalon?.socialMedia?.youtube || rawSalon?.socialMediaLinks?.youtube,
    },
  };
}

function buildSalonParams(
  base: Record<string, string>,
  options?: SalonQueryOptions
) {
  return {
    ...base,
    ...(typeof options?.page === "number" ? { page: String(options.page) } : {}),
    ...(typeof options?.limit === "number" ? { limit: String(options.limit) } : {}),
  };
}

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

export const fetchAllSalons = (token: string, options?: SalonQueryOptions) =>
  salonRequest(buildSalonParams({ type: "all" }, options), token);
export const fetchActiveSalons = (token: string, options?: SalonQueryOptions) =>
  salonRequest(buildSalonParams({ type: "active" }, options), token);
export const fetchPendingSalons = (token: string, options?: SalonQueryOptions) =>
  salonRequest(buildSalonParams({ type: "pending" }, options), token);
export const fetchSuspendedSalons = (token: string, options?: SalonQueryOptions) =>
  salonRequest(buildSalonParams({ type: "suspended" }, options), token);
export const fetchRejectedSalons = (token: string, options?: SalonQueryOptions) =>
  salonRequest(buildSalonParams({ type: "rejected" }, options), token);
export const fetchSalonById = (id: string, token: string) => salonRequest({ type: "by-id", id }, token);
export const fetchByOwner = (token: string) => salonRequest({ type: "by-owner" }, token);

export async function getSalonById(id: string): Promise<Salon> {
  const token = typeof window !== "undefined" ? sessionStorage.getItem("accessToken") : null;
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

  try {
    const { data } = await axios.get(`/api/salons/${id}`, { headers });
    return normalizeSalon(data?.data ?? data);
  } catch (error: any) {
    const shouldRetryWithRefresh = error?.response?.status === 401 && !!token;
    if (!shouldRetryWithRefresh) throw error;

    const nextAccessToken = await refreshAccessToken();
    const { data } = await axios.get(`/api/salons/${id}`, {
      headers: { Authorization: `Bearer ${nextAccessToken}` },
    });
    return normalizeSalon(data?.data ?? data);
  }
}


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

export async function updateSalon(id: string, salonData: any, accessToken?: string) {
  const token = accessToken ?? (typeof window !== "undefined" ? sessionStorage.getItem("accessToken") : null);

  try {
    const { data } = await axios.patch(`/api/salons/${id}/update`, salonData, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return data;
  } catch (error: any) {
    if (error?.response?.status !== 401) throw error;

    const nextAccessToken = await refreshAccessToken();
    const { data } = await axios.patch(`/api/salons/${id}/update`, salonData, {
      headers: { Authorization: `Bearer ${nextAccessToken}` },
    });
    return data;
  }
}

export async function getByPrority(page = 1, limit = 10) {
  return axios.get("/api/salons/by-priority", {
    params: { page, limit },
  });
}
//todo need to change 

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