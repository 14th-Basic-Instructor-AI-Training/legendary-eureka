import { UserSchema, type User } from "./schema";

/**
 * Seeded demo accounts — one per role. Matches destination-api DataSeeder / seed.sql.
 *
 *   admin@jalat.com           / Admin@1234
 *   angkor.tours@jalat.com    / Agency@1234
 *   sophea@jalat.com          / Traveler@1234
 */
export const MOCK_USERS: User[] = [
  {
    id: "u-admin",
    name: "Jalat Admin",
    email: "admin@jalat.com",
    password: "Admin@1234",
    role: "admin",
  },
  {
    id: "u-agency",
    name: "Angkor Tours",
    email: "angkor.tours@jalat.com",
    password: "Agency@1234",
    role: "agency",
  },
  {
    id: "u-traveler",
    name: "Sophea Chan",
    email: "sophea@jalat.com",
    password: "Traveler@1234",
    role: "traveler",
  },
].map((u) => UserSchema.parse(u));

/** Public credential list shown on the login screen for easy previewing. */
export const DEMO_CREDENTIALS = MOCK_USERS.map((u) => ({
  role: u.role,
  email: u.email,
  password: u.password,
}));
