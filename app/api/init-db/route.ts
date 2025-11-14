import { NextResponse } from "next/server";
import { initDatabase } from "@/lib/db";
import { seedDefaultForm } from "@/lib/seed";

export async function GET() {
  try {
    // Initialize database tables
    await initDatabase();

    // Seed the default form
    const seedResult = await seedDefaultForm();

    return NextResponse.json({
      ...seedResult,
      initialized: true,
    });
  } catch (error) {
    console.error("Database initialization error:", error);
    return NextResponse.json(
      { error: "Failed to initialize database" },
      { status: 500 }
    );
  }
}
