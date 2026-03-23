import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

async function refreshTokens() {
  const refreshToken = sessionStorage.getItem("refreshToken");

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  // Create a temporary axios instance with baseURL for the refresh call
  const refreshClient = axios.create({
    baseURL: typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_BACKEND_URL,
  });

  const response = await refreshClient.post(
    "/api/auth/refresh",
    {},
    {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    }
  );

  const { accessToken, refreshToken: nextRefreshToken } = response.data;

  if (!accessToken || !nextRefreshToken) {
    throw new Error("Invalid refresh token response");
  }

  sessionStorage.setItem("accessToken", accessToken);
  sessionStorage.setItem("refreshToken", nextRefreshToken);

  return accessToken;
}

apiClient.interceptors.request.use((config) => {
  // Only access sessionStorage on the client side
  if (typeof window !== "undefined") {
    const token = sessionStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only handle token refresh on the client side
    if (typeof window !== "undefined" && error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshTokens();

        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);

      } catch (refreshErr) {
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;