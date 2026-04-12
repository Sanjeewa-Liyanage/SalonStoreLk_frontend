const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

const DEFAULT_COOKIE_DAYS = 7;

function isBrowser() {
  return typeof window !== "undefined";
}

function encode(value: string) {
  return encodeURIComponent(value);
}

function decode(value: string) {
  return decodeURIComponent(value);
}

function setCookie(name: string, value: string, days = DEFAULT_COOKIE_DAYS) {
  if (!isBrowser()) return;

  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encode(value)}; Expires=${expires}; Path=/; SameSite=Lax${secure}`;
}

function getCookie(name: string): string | null {
  if (!isBrowser()) return null;

  const target = `${name}=`;
  const all = document.cookie ? document.cookie.split(";") : [];

  for (const item of all) {
    const cookie = item.trim();
    if (cookie.startsWith(target)) {
      return decode(cookie.substring(target.length));
    }
  }

  return null;
}

function removeCookie(name: string) {
  if (!isBrowser()) return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; SameSite=Lax${secure}`;
}

export function setAccessToken(token: string) {
  if (isBrowser()) {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
  }
  setCookie(ACCESS_TOKEN_KEY, token);
}

export function setRefreshToken(token: string) {
  if (isBrowser()) {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
  }
  setCookie(REFRESH_TOKEN_KEY, token);
}

export function setAuthTokens(accessToken: string, refreshToken: string) {
  setAccessToken(accessToken);
  setRefreshToken(refreshToken);
}

export function getAccessToken(): string | null {
  if (!isBrowser()) return null;

  const fromSession = sessionStorage.getItem(ACCESS_TOKEN_KEY);
  if (fromSession) return fromSession;

  const fromCookie = getCookie(ACCESS_TOKEN_KEY);
  if (fromCookie) {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, fromCookie);
  }

  return fromCookie;
}

export function getRefreshToken(): string | null {
  if (!isBrowser()) return null;

  const fromSession = sessionStorage.getItem(REFRESH_TOKEN_KEY);
  if (fromSession) return fromSession;

  const fromCookie = getCookie(REFRESH_TOKEN_KEY);
  if (fromCookie) {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, fromCookie);
  }

  return fromCookie;
}

export function clearAuthTokens() {
  if (isBrowser()) {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  removeCookie(ACCESS_TOKEN_KEY);
  removeCookie(REFRESH_TOKEN_KEY);
}