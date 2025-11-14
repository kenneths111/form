import { NextRequest, NextResponse } from "next/server";
import { getResponsesByFormId } from "@/lib/storage";

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: { formId: string } }
) {
  try {
    const responses = await getResponsesByFormId(params.formId);
    return NextResponse.json(responses, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch responses" },
      { status: 500 }
    );
  }
}
