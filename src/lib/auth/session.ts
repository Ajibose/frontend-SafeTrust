import Cookies from "js-cookie";
import { getRememberMe } from "./persistence";

export const SESSION_COOKIE = "firebase-token";

export function setSessionCookie(idToken: string): void {
  const remember = getRememberMe();
  Cookies.set(SESSION_COOKIE, idToken, {
    ...(remember ? { expires: 1 / 24 } : {}), // omit expires -> browser-session cookie
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export function clearSessionCookie(): void {
  Cookies.remove(SESSION_COOKIE, { path: "/" });
}

export function getSessionCookie(): string | undefined {
  return Cookies.get(SESSION_COOKIE);
}
