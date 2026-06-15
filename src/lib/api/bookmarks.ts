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
