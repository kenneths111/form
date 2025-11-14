import { NextRequest, NextResponse } from "next/server";
import { verifyHash } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const authCookie = request.cookies.get("responses_auth")?.value;

    if (authCookie && verifyHash(authCookie)) {
      return NextResponse.json({ authorized: true });
    } else {
      return NextResponse.json({ authorized: false }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ authorized: false }, { status: 401 });
  }
}

