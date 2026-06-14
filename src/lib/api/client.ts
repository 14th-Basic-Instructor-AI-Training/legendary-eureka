import { auth } from "@/auth";

const API_BASE = process.env.NEXT_API_URL ?? "http://localhost:8080/api/v1";

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
