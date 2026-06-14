import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import type { Role } from "@/features/auth/schema";

const API = process.env.NEXT_API_URL ?? "http://localhost:8080/api/v1";

// Backend serializes Role enum as lowercase strings ("admin", "agency", "traveler").
// Keep uppercase keys as a fallback in case any endpoint returns the enum name directly.
const ROLE_MAP: Record<string, Role> = {
  admin: "admin",
  agency: "agency",
  traveler: "traveler",
  ADMIN: "admin",
  TOUR_AGENCY: "agency",
  TRAVELER: "traveler",
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      // Field names are used internally only — the form submits via signIn().
      credentials: {
        email: {},
        password: {},
        // Internal fields for the post-OTP auto-sign-in path.
        _verifiedAccessToken: {},
        _refreshToken: {},
      },

      async authorize(credentials) {
        // ── Path A: post-OTP / post-register — token already obtained from backend ──
        if (credentials._verifiedAccessToken) {
          let res: Response;
          try {
            res = await fetch(`${API}/auth/me`, {
              headers: { Authorization: `Bearer ${credentials._verifiedAccessToken}` },
            });
          } catch {
            return null;
          }
          if (!res.ok) return null;

          const me = (await res.json()).data;
          return {
            id: String(me.id),
            name: me.name ?? credentials.email,
            email: String(me.email),
            role: ROLE_MAP[me.role] ?? "traveler",
            accessToken: String(credentials._verifiedAccessToken),
            refreshToken: String(credentials._refreshToken ?? ""),
          };
        }

        // ── Path B: normal email + password login ─────────────────────────────────
        let res: Response;
        try {
          res = await fetch(`${API}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });
        } catch {
          return null;
        }

        if (!res.ok) return null;

        const data = (await res.json()).data;

        // MFA required — cannot complete sign-in with credentials alone.
        if (!data || data.mfaRequired) return null;

        return {
          id: String(data.id),
          name: data.name,
          email: data.email,
          role: ROLE_MAP[data.role] ?? "traveler",
          accessToken: String(data.accessToken),
          refreshToken: String(data.refreshToken),
        };
      },
    }),
  ],
});

// ── TypeScript augmentation ───────────────────────────────────────────────────

declare module "next-auth" {
  interface Session {
    accessToken: string;
    role: Role;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    accessToken: string;
    refreshToken: string;
    role: string;
    userId: string;
  }
}
