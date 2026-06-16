import { z } from "zod";

/**
 * Backend `PagedResponse<T>` (Spring) — the shape inside `data` for paginated list
 * endpoints: `{ content, page, size, totalElements, totalPages, hasNext, hasPrevious }`.
 * Mirrors `shared/common/PagedResponse` on the API. Use {@link pagedSchema} to build a
 * validator for a given item schema.
 */
export function pagedSchema<T extends z.ZodTypeAny>(item: T) {
  return z.object({
    content: z.array(item),
    page: z.number().int(),
    size: z.number().int(),
    totalElements: z.number().int(),
    totalPages: z.number().int(),
    hasNext: z.boolean(),
    hasPrevious: z.boolean(),
  });
}

export type Paged<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};
