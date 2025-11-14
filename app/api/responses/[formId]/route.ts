import { NextRequest, NextResponse } from "next/server";
import { getResponsesByFormId } from "@/lib/storage";

export async function GET(
  request: NextRequest,
  { params }: { params: { formId: string } }
) {
  try {
    const responses = await getResponsesByFormId(params.formId);
    return NextResponse.json(responses);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch responses" },
      { status: 500 }
    );
  }
}
