// Minimal signed-cookie session: "<user>.<hmac>". Good enough for a party CRM, not for a bank.
export const SESSION_COOKIE = "pp_session";

const secret = () => process.env.AUTH_SECRET ?? "dev-secret-sandalwood-cheese";

async function hmac(value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function createSession(user: string): Promise<string> {
  return `${user}.${await hmac(user)}`;
}

export async function verifySession(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  const i = token.lastIndexOf(".");
  if (i < 1) return null;
  const user = token.slice(0, i);
  return (await hmac(user)) === token.slice(i + 1) ? user : null;
}

export function checkCredentials(user: string, password: string): boolean {
  return (
    user === (process.env.ADMIN_USER ?? "chef") &&
    password === (process.env.ADMIN_PASSWORD ?? "margherita-no-5")
  );
}
