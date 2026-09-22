import { auth } from "./auth";

export async function getSession(headers: Headers) {
  return auth.api.getSession({
    headers: Object.fromEntries(headers.entries()),
  });
}

export async function getCurrentUser(headers: Headers) {
  const session = await getSession(headers);
  return session?.user ?? null;
}
