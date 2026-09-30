import Cookies from "js-cookie";
import {
  setSessionCookie,
  clearSessionCookie,
  getSessionCookie,
  SESSION_COOKIE_NAME,
} from "./session";
import { useGlobalAuthenticationStore } from "@/core/store/data";

jest.mock("js-cookie", () => ({
  set: jest.fn(),
  remove: jest.fn(),
  get: jest.fn(),
}));

describe("session helper", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useGlobalAuthenticationStore.getState().clearAuth();
  });

  it("sets session cookie and updates Zustand token store", () => {
    setSessionCookie("test-id-token-123");

    expect(Cookies.set).toHaveBeenCalledWith(
      SESSION_COOKIE_NAME,
      "test-id-token-123",
      expect.objectContaining({
        expires: 7,
        sameSite: "strict",
      }),
    );
    expect(useGlobalAuthenticationStore.getState().token).toBe(
      "test-id-token-123",
    );
  });

  it("clears session cookie and resets Zustand auth store", () => {
    useGlobalAuthenticationStore.getState().setToken("existing-token");
    expect(useGlobalAuthenticationStore.getState().token).toBe(
      "existing-token",
    );

    clearSessionCookie();

    expect(Cookies.remove).toHaveBeenCalledWith(SESSION_COOKIE_NAME);
    expect(useGlobalAuthenticationStore.getState().token).toBe("");
  });

  it("retrieves session cookie", () => {
    (Cookies.get as jest.Mock).mockReturnValue("cookie-token-val");

    const token = getSessionCookie();
    expect(Cookies.get).toHaveBeenCalledWith(SESSION_COOKIE_NAME);
    expect(token).toBe("cookie-token-val");
  });
});
