/**
 * API boundary barrel. Import the backend wire types + role/envelope helpers from
 * `@/types`. Domain (Zod-derived) types are re-exported from each entity file
 * for convenience, but their source of truth stays in the feature `schema.ts`.
 */
export * from "./response";
export * from "./enums";
export * from "./destination";
export * from "./tour";
export * from "./agency";
export * from "./booking";
export * from "./traveler";
export * from "./review";
export * from "./tripPlan";
