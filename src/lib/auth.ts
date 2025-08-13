import { Lucia } from "lucia";
import { PostgresJsAdapter } from "@lucia-auth/adapter-postgresql";
import postgres from "postgres";

// Create PostgreSQL connection
const sql = postgres(process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/postgres");

// Create adapter
const adapter = new PostgresJsAdapter(sql, {
  user: "auth_user",
  session: "user_session"
});

// Initialize Lucia
export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === "production"
    }
  },
  getUserAttributes: (attributes) => {
    return {
      email: attributes.email,
      fullName: attributes.full_name
    };
  }
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: {
      email: string;
      full_name: string;
    };
  }
}

export type Auth = typeof lucia;