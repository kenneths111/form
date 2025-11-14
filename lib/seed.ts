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
      return {
        message: "Default form already exists",
        formId: "default-trip-form",
      };
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
        question:
          "Please rank the following options according to your preference, with 1 being your top choice.",
        required: true,
        options: [
          "[SG] AI Panel: OpenAI, Monk Hill's Ventures, and Aolani Cloud",
          "[SG] EDB Semiconductor & EDBI Talk",
          "[SG] Former Chairman of Economic Development Board, Philip Yeo",
          "[SG] Keppel Data Center HQ Visit",
          "[SG] Manus AI",
          "[SG] Temasek, Emerging Technologies Team",
          "[SG] [TBC] Professor at Nanyang Technological University",
          "[TW] 7th President of Taiwan, Tsai Ing-Wen",
          "[TW] Chief Editor of Commonwealth Magazine, Chen Liang-guo",
          "[TW] Deputy Minister for Foreign Affairs, Chen Ming-chi",
          "[TW] Former EVP of ITRI, Professor Shih Chin-tay",
          "[TW] Former VP (R&D) at TSMC, Professor Burn Lin",
          "[TW] MediaTek Meeting",
          "[TW] [TBC] Speaker on Last Day of Taiwan GST",
          "Fun Manager (Trip Norms Czar) (3 pax)",
          "Gift Manager (3 pax)",
          "Social Media Manager (3 pax)",
        ],
      },
      {
        id: nanoid(),
        type: "long_text",
        question:
          "If you have anything else to add or share about the reasons for your ranked preferences :)",
        required: false,
      },
    ];

    await sql`
      INSERT INTO forms (id, title, description, questions, created_at, updated_at)
      VALUES (
        ${formId},
        ${"Sign up for GST roles"},
        ${"We will try to optimize for everyone's preferences."},
        ${JSON.stringify(questions)}::jsonb,
        ${now},
        ${now}
      )
    `;

    console.log("Default form seeded successfully!");
    return {
      message: "Default form created successfully",
      formId: formId,
      formUrl: `/f/${formId}`,
    };
  } catch (error) {
    console.error("Error seeding default form:", error);
    throw error;
  }
}
