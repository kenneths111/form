import { config } from "dotenv";
import { sql } from "@vercel/postgres";
import { nanoid } from "nanoid";
import * as fs from "fs";
import * as path from "path";

// Load environment variables
config({ path: ".env.local" });

async function importResponses() {
  try {
    // First, get the form and its question IDs
    const formResult = await sql`
      SELECT id, questions 
      FROM forms 
      WHERE id = 'default-trip-form'
    `;

    if (formResult.rows.length === 0) {
      console.error("Form not found!");
      return;
    }

    const form = formResult.rows[0];
    const questions = form.questions; // Already an object from JSONB

    // Map question IDs
    const fullNameQuestionId = questions[0].id; // "Full Name"
    const rankedQuestionId = questions[1].id; // Ranked question
    const commentsQuestionId = questions[2].id; // Additional comments

    console.log("Question IDs:");
    console.log("- Full Name:", fullNameQuestionId);
    console.log("- Ranked:", rankedQuestionId);
    console.log("- Comments:", commentsQuestionId);
    console.log("\n");

    // Read and parse CSV
    const csvPath = path.join(process.cwd(), "scripts", "responses.csv");
    const csvContent = fs.readFileSync(csvPath, "utf-8");
    const lines = csvContent.split("\n").slice(1); // Skip header

    let imported = 0;
    let skipped = 0;

    for (const line of lines) {
      if (!line.trim()) continue;

      // Parse CSV line (handle escaped commas in ranked choices)
      const match = line.match(/^([^,]+),([^,]+),"([^"]+)",([^,]*),/);

      if (!match) {
        console.log("⚠️  Skipping malformed line");
        skipped++;
        continue;
      }

      const responseId = match[1];
      const fullName = match[2];
      const rankedChoicesRaw = match[3];
      const comments = match[4];

      // Parse ranked choices - split by comma but respect escaped commas
      const rankedChoices = rankedChoicesRaw
        .split(/,(?![^,]*\\)/)
        .map((choice) => choice.replace(/\\,/g, ",").trim());

      // Create answers object
      const answers = {
        [fullNameQuestionId]: fullName,
        [rankedQuestionId]: rankedChoices,
        [commentsQuestionId]: comments || "",
      };

      // Insert into database
      try {
        await sql`
          INSERT INTO responses (id, form_id, answers, submitted_at)
          VALUES (
            ${nanoid()},
            ${form.id},
            ${JSON.stringify(answers)}::jsonb,
            NOW()
          )
        `;

        console.log(`✅ Imported: ${fullName}`);
        imported++;
      } catch (error) {
        console.error(`❌ Failed to import ${fullName}:`, error);
        skipped++;
      }
    }

    console.log("\n=== Import Complete ===");
    console.log(`✅ Imported: ${imported}`);
    console.log(`⚠️  Skipped: ${skipped}`);
  } catch (error) {
    console.error("Error importing responses:", error);
    throw error;
  }
}

// Run the import
importResponses()
  .then(() => {
    console.log("\n✅ Import script completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Import script failed:", error);
    process.exit(1);
  });
