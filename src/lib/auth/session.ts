import Cookies from "js-cookie";
import { useGlobalAuthenticationStore } from "@/core/store/data";

export const SESSION_COOKIE_NAME = "firebase-token";

/**
 * Sets the firebase-token session cookie and updates the global auth store.
 */
export function setSessionCookie(token: string) {
  Cookies.set(SESSION_COOKIE_NAME, token, {
    expires: 7,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  useGlobalAuthenticationStore.getState().setToken(token);
}

/**
 * Clears the firebase-token session cookie and resets the auth store.
 */
export function clearSessionCookie() {
  Cookies.remove(SESSION_COOKIE_NAME);
  useGlobalAuthenticationStore.getState().clearAuth();
}

/**
 * Retrieves the current session token cookie if present.
 */
export function getSessionCookie(): string | undefined {
  return Cookies.get(SESSION_COOKIE_NAME);
}
