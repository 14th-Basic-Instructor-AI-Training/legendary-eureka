"use server";

import {
  createDestination,
  deleteDestination,
  type CreateDestinationRequest,
  type DestinationResponse,
} from "@/lib/api/destinations";
import {
  createPackage,
  publishPackage,
  archivePackage,
  deletePackage,
  type TourPackageRequest,
  type TourPackageResponse,
} from "@/lib/api/packages";

export async function createDestinationAction(
  body: CreateDestinationRequest,
): Promise<DestinationResponse> {
  return createDestination(body);
}

export async function deleteDestinationAction(id: string): Promise<void> {
  return deleteDestination(id);
}

export async function createPackageAction(
  body: TourPackageRequest,
): Promise<TourPackageResponse> {
  return createPackage(body);
}

export async function publishPackageAction(id: string): Promise<TourPackageResponse> {
  return publishPackage(id);
}

export async function archivePackageAction(id: string): Promise<TourPackageResponse> {
  return archivePackage(id);
}

export async function deletePackageAction(id: string): Promise<void> {
  return deletePackage(id);
}
