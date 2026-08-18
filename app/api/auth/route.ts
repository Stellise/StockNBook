import { NextRequest, NextResponse } from "next/server";
import { handler } from "../../../lambda-auth/index.js";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const normalizedAction =
        body.action === "register" || body.action === "signup"
            ? "send_signup_otp"
            : body.action;

    const normalizedBody = {
      ...body,
      action: normalizedAction,
    };

    const event = {
      headers: {
        "Content-Type": "application/json",
        Authorization:
            req.headers.get("authorization") || "",
      },
      body: JSON.stringify(normalizedBody),
      requestContext: {
        http: {
          method: "POST",
        },
      },
    };

    const response = await handler(event);

    let data: unknown = {};

    try {
      data = response.body
          ? JSON.parse(response.body)
          : {};
    } catch {
      data = {
        error: response.body || "Invalid server response",
      };
    }

    return NextResponse.json(data, {
      status: response.statusCode || 200,
    });

  } catch (error: any) {
    console.error("Local Auth API Error:", error);

    return NextResponse.json(
        {
          error:
              error?.message ||
              "Authentication server error",
        },
        {
          status: 500,
        }
    );
  }
}