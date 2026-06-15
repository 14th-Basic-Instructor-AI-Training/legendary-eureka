const API_BASE = process.env.NEXT_API_URL ?? "http://localhost:8080/api/v1";

/** Browser-safe API base — uses NEXT_PUBLIC_ so it's bundled into the client. */
const CLIENT_API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1";

// ── Shared response envelopes ────────────────────────────────────────────────

export interface ApiEnvelope<T> {
  status: number;
  message: string;
  data: T;
  timestamp: string;
}

export interface PagedData<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// ── Shared value types ───────────────────────────────────────────────────────

export type Province =
  | "PHNOM_PENH"
  | "SIEM_REAP"
  | "KAMPONG_THOM"
  | "BATTAMBANG"
  | "KAMPOT"
  | "KEP"
  | "SIHANOUKVILLE"
  | "KRATIE"
  | "MONDULKIRI"
  | "RATANAKIRI"
  | "PREAH_VIHEAR"
  | "KANDAL"
  | "TAKEO"
  | "PREY_VENG"
  | "SVAY_RIENG"
  | "KAMPONG_CHAM"
  | "KAMPONG_CHHNANG"
  | "KAMPONG_SPEU"
  | "PURSAT"
  | "PAILIN"
  | "STUNG_TRENG"
  | "ODDAR_MEANCHEY"
  | "BANTEAY_MEANCHEY"
  | "KOH_KONG"
  | "PREAH_SIHANOUK";

export type TravelType =
  | "CULTURAL"
  | "ADVENTURE"
  | "RELAXATION"
  | "NATURE"
  | "BEACH"
  | "HISTORICAL"
  | "FOOD"
  | "WILDLIFE"
  | "SPIRITUAL"
  | "URBAN";

// ── Error class ──────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ── Token helper ─────────────────────────────────────────────────────────────

async function getBearerToken(): Promise<string | null> {
  // Dynamic import keeps `next-auth` (and its `next/server` dependency) out of
  // module load — so importing this file in a non-server context (e.g. tests)
  // doesn't eagerly pull in the auth runtime.
  const { auth } = await import("@/auth");
  const session = await auth();
  return session?.accessToken ?? null;
}

// ── Core fetch wrapper ───────────────────────────────────────────────────────

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

/** Shared type for query-string params — index signature satisfies Record checks. */
export interface Params {
  [key: string]: string | number | boolean | undefined;
}

/** Common pagination query params. */
export interface PageParams extends Params {
  page?: number;
  size?: number;
}

interface FetchOptions {
  method?: HttpMethod;
  body?: unknown;
  params?: Params;
  /** Set to false for public endpoints that don't need a token. */
  auth?: boolean;
}

/** Browser-safe fetch for public endpoints — no auth token. Used in client components via useResource. */
export async function publicApiFetch<T>(
  path: string,
  { params }: { params?: Params } = {},
): Promise<T> {
  const url = new URL(`${CLIENT_API_BASE}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }

  let res: Response;
  try {
    res = await fetch(url.toString(), { cache: "no-store" });
  } catch (err) {
    throw new ApiError(
      `Network error reaching the API (${err instanceof Error ? err.message : String(err)})`,
      0,
    );
  }

  if (res.status === 204) return undefined as T;
  if (!res.ok) {
    let message = `${res.status} ${res.statusText}`;
    try {
      const errBody = await res.json();
      if (typeof errBody?.message === "string") message = errBody.message;
    } catch {
      // ignore
    }
    throw new ApiError(message, res.status);
  }

  const envelope: ApiEnvelope<T> = await res.json();
  return envelope.data;
}

/**
 * Browser-safe fetch for **authenticated** endpoints. Reads the access token
 * from the NextAuth session cookie via `getSession()`. Only call this from
 * client components or Zustand store actions.
 */
export async function clientApiFetch<T>(
  path: string,
  { method = "GET", body, params }: Omit<FetchOptions, "auth"> = {},
): Promise<T> {
  // Dynamic import keeps `next-auth/react` out of the server bundle.
  const { getSession } = await import("next-auth/react");
  const session = await getSession();
  const token = (session as unknown as Record<string, unknown>)?.accessToken as string | undefined;

  const url = new URL(`${CLIENT_API_BASE}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
  } catch (err) {
    throw new ApiError(
      `Network error reaching the API (${err instanceof Error ? err.message : String(err)})`,
      0,
    );
  }

  if (res.status === 204) return undefined as T;
  if (!res.ok) {
    let message = `${res.status} ${res.statusText}`;
    try {
      const errBody = await res.json();
      if (typeof errBody?.message === "string") message = errBody.message;
    } catch {
      // ignore
    }
    throw new ApiError(message, res.status);
  }

  const envelope: ApiEnvelope<T> = await res.json();
  return envelope.data;
}

export async function apiFetch<T>(
  path: string,
  { method = "GET", body, params, auth = true }: FetchOptions = {},
): Promise<T> {
  const url = new URL(`${API_BASE}${path}`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (auth) {
    const token = await getBearerToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
  } catch (err) {
    throw new ApiError(
      `Network error reaching the API — is the backend running? (${err instanceof Error ? err.message : String(err)})`,
      0,
    );
  }

  // 204 No Content — no body to parse
  if (res.status === 204) {
    return undefined as T;
  }

  if (!res.ok) {
    let message = `${res.status} ${res.statusText}`;
    try {
      const errBody = await res.json();
      if (typeof errBody?.message === "string") message = errBody.message;
    } catch {
      // ignore parse failure — use the status text
    }
    throw new ApiError(message, res.status);
  }

  const envelope: ApiEnvelope<T> = await res.json();
  return envelope.data;
}
