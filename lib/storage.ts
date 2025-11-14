import { sql } from "@vercel/postgres";
import { Form, Response } from "./types";

// Forms
export async function getAllForms(): Promise<Form[]> {
  try {
    const { rows } = await sql`
      SELECT id, title, description, questions, created_at, updated_at
      FROM forms
      ORDER BY created_at DESC
    `;

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      questions: row.questions,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  } catch (error) {
    console.error("Error getting forms:", error);
    return [];
  }
}

export async function getFormById(id: string): Promise<Form | null> {
  try {
    const { rows } = await sql`
      SELECT id, title, description, questions, created_at, updated_at
      FROM forms
      WHERE id = ${id}
    `;

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      questions: row.questions,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  } catch (error) {
    console.error("Error getting form by id:", error);
    return null;
  }
}

export async function saveForm(form: Form): Promise<void> {
  try {
    // Check if form exists
    const existing = await getFormById(form.id);

    if (existing) {
      // Update existing form
      await sql`
        UPDATE forms
        SET title = ${form.title},
            description = ${form.description},
            questions = ${JSON.stringify(form.questions)}::jsonb,
            updated_at = ${form.updatedAt}
        WHERE id = ${form.id}
      `;
    } else {
      // Insert new form
      await sql`
        INSERT INTO forms (id, title, description, questions, created_at, updated_at)
        VALUES (
          ${form.id},
          ${form.title},
          ${form.description},
          ${JSON.stringify(form.questions)}::jsonb,
          ${form.createdAt},
          ${form.updatedAt}
        )
      `;
    }
  } catch (error) {
    console.error("Error saving form:", error);
    throw error;
  }
}

export async function deleteForm(id: string): Promise<void> {
  try {
    // Delete form
    await sql`DELETE FROM forms WHERE id = ${id}`;

    // Delete associated responses
    await sql`DELETE FROM responses WHERE form_id = ${id}`;
  } catch (error) {
    console.error("Error deleting form:", error);
    throw error;
  }
}

// Responses
export async function getAllResponses(): Promise<Response[]> {
  try {
    const { rows } = await sql`
      SELECT id, form_id, answers, submitted_at
      FROM responses
      ORDER BY submitted_at DESC
    `;

    return rows.map((row) => ({
      id: row.id,
      formId: row.form_id,
      answers: row.answers,
      submittedAt: row.submitted_at,
    }));
  } catch (error) {
    console.error("Error getting responses:", error);
    return [];
  }
}

export async function getResponsesByFormId(
  formId: string
): Promise<Response[]> {
  try {
    const { rows } = await sql`
      SELECT id, form_id, answers, submitted_at
      FROM responses
      WHERE form_id = ${formId}
      ORDER BY submitted_at DESC
    `;

    return rows.map((row) => ({
      id: row.id,
      formId: row.form_id,
      answers: row.answers,
      submittedAt: row.submitted_at,
    }));
  } catch (error) {
    console.error("Error getting responses by form id:", error);
    return [];
  }
}

export async function saveResponse(response: Response): Promise<void> {
  try {
    await sql`
      INSERT INTO responses (id, form_id, answers, submitted_at)
      VALUES (
        ${response.id},
        ${response.formId},
        ${JSON.stringify(response.answers)}::jsonb,
        ${response.submittedAt}
      )
    `;
  } catch (error) {
    console.error("Error saving response:", error);
    throw error;
  }
}
