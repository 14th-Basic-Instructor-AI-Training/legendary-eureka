"use server";

import { updateMyTravelerProfile } from "@/services/profile.service";
import { uploadFile } from "@/services/files.service";
import { changePassword } from "@/services/auth.service";
import { cancelTrip } from "@/services/bookings.service";
import { ApiError } from "@/lib/api/client";
import { personalInfoToUpdateBody } from "@/features/traveler/mappers";

export interface SaveTravelerProfileInput {
  name: string;
  phone?: string;
  bio: string;
  avatarUrl?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export type ProfileActionResult = { ok: true } | { ok: false; error: string };

function toError(e: unknown): ProfileActionResult {
  if (e instanceof ApiError) return { ok: false, error: e.message };
  return { ok: false, error: "Something went wrong. Please try again." };
}

export async function saveTravelerProfileAction(
  input: SaveTravelerProfileInput,
): Promise<ProfileActionResult> {
  try {
    await updateMyTravelerProfile(personalInfoToUpdateBody(input));
    return { ok: true };
  } catch (e) {
    return toError(e);
  }
}

export async function uploadTravelerAvatarAction(
  formData: FormData,
): Promise<ProfileActionResult> {
  try {
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return { ok: false, error: "No file selected." };
    }
    const uploaded = await uploadFile(file);
    await updateMyTravelerProfile({ avatarUrl: uploaded.url });
    return { ok: true };
  } catch (e) {
    return toError(e);
  }
}

export async function changePasswordAction(
  input: ChangePasswordInput,
): Promise<ProfileActionResult> {
  try {
    await changePassword(input);
    return { ok: true };
  } catch (e) {
    return toError(e);
  }
}

export async function cancelBookingAction(tripId: string): Promise<ProfileActionResult> {
  try {
    await cancelTrip(tripId);
    return { ok: true };
  } catch (e) {
    return toError(e);
  }
}
