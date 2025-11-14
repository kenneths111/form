import { sql } from "@vercel/postgres";

// Initialize database tables
export async function initDatabase() {
  try {
    // Create forms table
    await sql`
      CREATE TABLE IF NOT EXISTS forms (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        questions JSONB NOT NULL,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL
      )
    `;

    // Create responses table
    await sql`
      CREATE TABLE IF NOT EXISTS responses (
        id TEXT PRIMARY KEY,
        form_id TEXT NOT NULL,
        answers JSONB NOT NULL,
        submitted_at TIMESTAMP NOT NULL
      )
    `;

    // Create index on form_id for faster queries
    await sql`
      CREATE INDEX IF NOT EXISTS idx_responses_form_id 
      ON responses(form_id)
    `;

    console.log("Database tables initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

