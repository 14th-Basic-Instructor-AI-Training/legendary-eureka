import { UserSchema, type User } from "./schema";

/**
 * Seeded mock accounts — one per role. Static/hardcoded for the no-auth-API phase.
 * Each is parsed through UserSchema so the fixtures can't drift from the schema.
 *
 *   admin@jalat.test     / Admin@123
 *   agency@jalat.test    / Agency@123
 *   traveler@jalat.test  / Traveler@123
 */
export const MOCK_USERS: User[] = [
  {
    id: "u-admin",
    name: "Admin User",
    email: "admin@jalat.test",
    password: "Admin@123",
    role: "admin",
  },
  {
    id: "u-agency",
    name: "Angkor Trails Agency",
    email: "agency@jalat.test",
    password: "Agency@123",
    role: "agency",
  },
  {
    id: "u-traveler",
    name: "Dara Traveler",
    email: "traveler@jalat.test",
    password: "Traveler@123",
    role: "traveler",
  },
].map((u) => UserSchema.parse(u));

/** Public credential list shown on the login screen for easy previewing. */
export const DEMO_CREDENTIALS = MOCK_USERS.map((u) => ({
  role: u.role,
  email: u.email,
  password: u.password,
}));
