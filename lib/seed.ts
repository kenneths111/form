import { sql } from "@vercel/postgres";
import { nanoid } from "nanoid";

export async function seedDefaultForm() {
  try {
    // Check if default form already exists
    const { rows: existingForms } = await sql`
      SELECT id FROM forms WHERE id = 'default-trip-form'
    `;

    if (existingForms.length > 0) {
      console.log("Default form already exists, skipping seed");
      return { message: "Default form already exists", formId: "default-trip-form" };
    }

    // Create the default form with your specific questions
    const formId = "default-trip-form";
    const now = new Date().toISOString();

    const questions = [
      {
        id: nanoid(),
        type: "short_text",
        question: "Full Name",
        required: true,
      },
      {
        id: nanoid(),
        type: "ranked",
        question: "Please rank the following options according to your preference, with 1 being your top choice.",
        required: true,
        options: [
          "Social Media Manager (3 pax)",
          "Fun Manager (Trip Norms Czar) (3 pax)",
          "Gift Manager (3 pax)",
          "[SG] Former Chairman of Economic Development Board, Philip Yeo",
          "[SG] [TBC] Professor at Nanyang Technological University",
          "[SG] AI Panel: OpenAI, Monk Hill's Ventures, and Aolani Cloud",
          "[TW] Former VP (R&D) at TSMC, Professor Burn Lin",
          "[TW] Former EVP of ITRI, Professor Shih Chin-tay",
          "[TW] Deputy Minister for Foreign Affairs, Chen Ming-chi",
          "[TW] 7th President of Taiwan, Tsai Ing-Wen",
          "[TW] Chief Editor of Commonwealth Magazine, Chen Liang-guo",
          "[TW] [TBC] Speaker on Last Day of Taiwan GST",
          "[SG] EDB Semiconductor & EDBI Talk",
          "[SG] Keppel Data Center HQ Visit",
          "[SG] Manus AI",
          "[TW] MediaTek Meeting",
          "[SG] Temasek, Emerging Technologies Team",
        ],
      },
      {
        id: nanoid(),
        type: "long_text",
        question: "If you have anything else to add or share about the reasons for your ranked preferences :)",
        required: false,
      },
    ];

    await sql`
      INSERT INTO forms (id, title, description, questions, created_at, updated_at)
      VALUES (
        ${formId},
        ${"Trip Preferences Survey"},
        ${"Please help us understand your preferences for the upcoming trip activities and sessions."},
        ${JSON.stringify(questions)}::jsonb,
        ${now},
        ${now}
      )
    `;

    console.log("Default form seeded successfully!");
    return { 
      message: "Default form created successfully", 
      formId: formId,
      formUrl: `/f/${formId}`
    };
  } catch (error) {
    console.error("Error seeding default form:", error);
    throw error;
  }
}

