import { NextRequest, NextResponse } from "next/server";
import { getAllForms, saveForm } from "@/lib/storage";
import { Form } from "@/lib/types";
import { nanoid } from "nanoid";

export async function GET() {
  try {
    const forms = await getAllForms();
    return NextResponse.json(forms);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch forms" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const now = new Date().toISOString();

    const form: Form = {
      id: nanoid(),
      title: body.title,
      description: body.description,
      questions: body.questions.map((q: any) => ({
        ...q,
        id: q.id || nanoid(),
      })),
      createdAt: now,
      updatedAt: now,
    };

    await saveForm(form);
    return NextResponse.json(form, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create form" },
      { status: 500 }
    );
  }
}
