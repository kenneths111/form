import { NextRequest, NextResponse } from "next/server";
import { getFormById, saveForm, deleteForm } from "@/lib/storage";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const form = await getFormById(params.id);
    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }
    return NextResponse.json(form);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch form" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const existingForm = await getFormById(params.id);

    if (!existingForm) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const updatedForm = {
      ...existingForm,
      ...body,
      id: params.id,
      updatedAt: new Date().toISOString(),
    };

    await saveForm(updatedForm);
    return NextResponse.json(updatedForm);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update form" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteForm(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete form" },
      { status: 500 }
    );
  }
}
