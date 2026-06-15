import { apiFetch } from "@/lib/api/client";
import type { PagedData, PageParams } from "@/lib/api/client";
import type { BookmarkResponse, CreateBookmarkRequest } from "@/lib/api/bookmarks";

export function getBookmarks(params?: PageParams): Promise<PagedData<BookmarkResponse>> {
  return apiFetch("/bookmarks", { params });
}

export function addBookmark(body: CreateBookmarkRequest): Promise<BookmarkResponse> {
  return apiFetch("/bookmarks", { method: "POST", body });
}

export function removeBookmark(id: string): Promise<void> {
  return apiFetch(`/bookmarks/${id}`, { method: "DELETE" });
}
