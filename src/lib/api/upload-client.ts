import { ApiError } from "./client";
import type { ApiEnvelope } from "./client";
import type { FileUploadResponse } from "./files";

/**
 * Browser-side file uploaders that report **real upload progress**. The server
 * actions in `actions/files.ts` can't surface progress (the file streams to the
 * Next server first, opaque to the client), so for the progress UI we POST the
 * multipart body straight to the backend via `XMLHttpRequest` — the same
 * browser→backend path `clientApiFetch` already uses — and read
 * `xhr.upload.onprogress`.
 */

const CLIENT_API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1";

export type ProgressFn = (percent: number) => void;

async function getToken(): Promise<string | undefined> {
  const { getSession } = await import("next-auth/react");
  const session = await getSession();
  return (session as unknown as Record<string, unknown>)?.accessToken as string | undefined;
}

function post<T>(
  path: string,
  form: FormData,
  token: string | undefined,
  onProgress?: ProgressFn,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${CLIENT_API_BASE}${path}`);
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const envelope = JSON.parse(xhr.responseText) as ApiEnvelope<T>;
          resolve(envelope.data);
        } catch {
          reject(new ApiError("Malformed response from upload", xhr.status));
        }
        return;
      }
      let message = `${xhr.status} ${xhr.statusText}`;
      try {
        const body = JSON.parse(xhr.responseText);
        if (typeof body?.message === "string") message = body.message;
      } catch {
        // ignore — use the status text
      }
      reject(new ApiError(message, xhr.status));
    };

    xhr.onerror = () =>
      reject(new ApiError("Network error during upload — is the backend running?", 0));

    xhr.send(form);
  });
}

/** POST /files/upload — single file, with progress. */
export async function uploadFileWithProgress(
  file: File,
  onProgress?: ProgressFn,
): Promise<FileUploadResponse> {
  const token = await getToken();
  const form = new FormData();
  form.append("file", file);
  return post<FileUploadResponse>("/files/upload", form, token, onProgress);
}

/** POST /files/upload-multiple — up to 10 files, with aggregate progress. */
export async function uploadFilesWithProgress(
  files: File[],
  onProgress?: ProgressFn,
): Promise<FileUploadResponse[]> {
  const token = await getToken();
  const form = new FormData();
  for (const file of files) form.append("files", file);
  return post<FileUploadResponse[]>("/files/upload-multiple", form, token, onProgress);
}
