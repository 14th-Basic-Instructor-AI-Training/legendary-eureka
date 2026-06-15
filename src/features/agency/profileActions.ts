"use server";

import { updateMyAgencyProfile } from "@/lib/api/profile";
import { uploadFile } from "@/lib/api/files";
import { ApiError } from "@/lib/api/client";
import { formToBio } from "./mappers";

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
