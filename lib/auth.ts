import { cookies } from "next/headers";

export const AUTH_COOKIE = "wine_cellar_session";

export function getSessionSecret() {
  return process.env.SESSION_SECRET || "local-wine-cellar-session";
}

export function getAppPassword() {
  return process.env.APP_PASSWORD || "cellar-demo";
}

export async function isAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE)?.value === getSessionSecret();
}
