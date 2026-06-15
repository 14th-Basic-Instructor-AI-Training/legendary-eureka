import { auth } from "@/auth";
import { ApiError, type ApiEnvelope } from "./client";

const API_BASE = process.env.NEXT_API_URL ?? "http://localhost:8080/api/v1";

export interface FileUploadResponse {
  url: string;
  fileName: string;
  size: number;
  contentType: string;
}

async function getBearerToken(): Promise<string | null> {
  const session = await auth();
  return session?.accessToken ?? null;
}

/** Upload a single file via multipart POST /files/upload. */
export async function uploadFile(file: File): Promise<FileUploadResponse> {
  const token = await getBearerToken();
  const formData = new FormData();
  formData.append("file", file);

  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}/files/upload`, {
      method: "POST",
      headers,
      body: formData,
      cache: "no-store",
    });
  } catch (err) {
    throw new ApiError(
      `Network error reaching the API — is the backend running? (${err instanceof Error ? err.message : String(err)})`,
      0,
    );
  }

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

  const envelope: ApiEnvelope<FileUploadResponse> = await res.json();
  return envelope.data;
}
