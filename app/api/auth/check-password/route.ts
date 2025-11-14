import { NextRequest, NextResponse } from "next/server";
import { checkPassword, hashPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (checkPassword(password)) {
      // Create response with cookie
      const response = NextResponse.json({ success: true });

      // Set cookie that expires in 24 hours
      response.cookies.set("responses_auth", hashPassword(password), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 24 hours
      });

      return response;
    } else {
      return NextResponse.json(
        { error: "Incorrect password" },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
