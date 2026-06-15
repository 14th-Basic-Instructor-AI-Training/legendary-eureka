"use server";

import { updateMyAgencyProfile } from "@/services/profile.service";
import { uploadFile } from "@/services/files.service";
import { ApiError } from "@/lib/api/client";
import { formToBio } from "@/features/agency/mappers";

export interface SaveProfileInput {
  agencyName?: string;
  tagline?: string;
  bio?: string;
  description?: string;
  contactPhone?: string;
  website?: string;
  address?: string;
  avatarUrl?: string;
}

export type ProfileActionResult = { ok: true } | { ok: false; error: string };

function toError(e: unknown): ProfileActionResult {
  if (e instanceof ApiError) return { ok: false, error: e.message };
  return { ok: false, error: "Failed to save profile. Please try again." };
}

export async function saveProfileAction(input: SaveProfileInput): Promise<ProfileActionResult> {
  try {
    const bio =
      input.bio ??
      formToBio(input.tagline ?? "", input.description ?? "");

    await updateMyAgencyProfile({
      agencyName: input.agencyName || undefined,
      bio,
      contactPhone: input.contactPhone || undefined,
      website: input.website || undefined,
      address: input.address || undefined,
      avatarUrl: input.avatarUrl,
    });
    return { ok: true };
  } catch (e) {
    return toError(e);
  }
}

export async function uploadAvatarAction(formData: FormData): Promise<ProfileActionResult> {
  try {
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return { ok: false, error: "No file selected." };
    }

    const uploaded = await uploadFile(file);
    await updateMyAgencyProfile({ avatarUrl: uploaded.url });
    return { ok: true };
  } catch (e) {
    return toError(e);
  }
}

export type UploadResult = { ok: true; url: string } | { ok: false; error: string };

/** Generic upload — returns the MinIO URL without updating any profile. */
export async function uploadFileAction(formData: FormData): Promise<UploadResult> {
  try {
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return { ok: false, error: "No file selected." };
    }
    const uploaded = await uploadFile(file);
    return { ok: true, url: uploaded.url };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, error: e.message };
    return { ok: false, error: "Upload failed. Please try again." };
  }
}
