import { apiFetch, type PagedData, type PageParams } from "./client";

export interface BookmarkResponse {
  id: string;
  travelerId: string;
  destinationId: string;
  destinationName: string;
  destinationSlug: string;
  destinationImage: string;
  createdAt: string;
}

export interface CreateBookmarkRequest {
  destinationId: string;
}

export function getBookmarks(
  params?: PageParams,
): Promise<PagedData<BookmarkResponse>> {
  return apiFetch("/bookmarks", { params });
}

export function addBookmark(body: CreateBookmarkRequest): Promise<BookmarkResponse> {
  return apiFetch("/bookmarks", { method: "POST", body });
}

export function removeBookmark(id: string): Promise<void> {
  return apiFetch(`/bookmarks/${id}`, { method: "DELETE" });
}
