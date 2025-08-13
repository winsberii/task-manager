import postgres from "postgres";

// Create PostgreSQL connection for database operations
export const db = postgres(process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/postgres");

// User management functions
export async function createUser(email: string, hashedPassword: string, fullName?: string) {
  const [user] = await db`
    INSERT INTO auth_user (email, hashed_password, full_name)
    VALUES (${email}, ${hashedPassword}, ${fullName || ''})
    RETURNING id, email, full_name
  `;
  return user;
}

export async function getUserByEmail(email: string) {
  const [user] = await db`
    SELECT id, email, hashed_password, full_name
    FROM auth_user
    WHERE email = ${email}
  `;
  return user;
}

export async function getUserById(id: string) {
  const [user] = await db`
    SELECT id, email, full_name
    FROM auth_user
    WHERE id = ${id}
  `;
  return user;
}