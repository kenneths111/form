import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function GET() {
  try {
    // Get connection info (without exposing password)
    const connectionString =
      process.env.POSTGRES_URL || process.env.DATABASE_URL || "not set";

    // Parse the connection string to get host/database info (safely)
    let dbInfo: string | { host: string; database: string; user: string } =
      "Connection string not found";
    if (connectionString !== "not set") {
      try {
        const url = new URL(connectionString);
        dbInfo = {
          host: url.hostname,
          database: url.pathname.slice(1),
          user: url.username,
          // Don't expose password
        };
      } catch (e) {
        dbInfo = "Failed to parse connection string";
      }
    }

    // Query the database to confirm what we're connected to
    const formsCount = await sql`SELECT COUNT(*) as count FROM forms`;
    const responsesCount = await sql`SELECT COUNT(*) as count FROM responses`;

    return NextResponse.json({
      databaseInfo: dbInfo,
      formsCount: formsCount.rows[0].count,
      responsesCount: responsesCount.rows[0].count,
      environment: process.env.VERCEL_ENV || "local",
      envVarsPresent: {
        POSTGRES_URL: !!process.env.POSTGRES_URL,
        DATABASE_URL: !!process.env.DATABASE_URL,
        POSTGRES_HOST: !!process.env.POSTGRES_HOST,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
        environment: process.env.VERCEL_ENV || "local",
      },
      { status: 500 }
    );
  }
}
