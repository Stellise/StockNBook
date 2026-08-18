import { NextRequest, NextResponse } from "next/server";
import { handler } from "../../../lambda-auth/index.js";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
    try {
        const event = {
            headers: {
                "Content-Type": "application/json",
                Authorization: req.headers.get("authorization") || "",
            },
            body: JSON.stringify({
                action: "get_current_user",
            }),
            requestContext: {
                http: {
                    method: "POST",
                },
            },
        };

        const response = await handler(event);

        let data: unknown = {};

        try {
            data = response.body ? JSON.parse(response.body) : {};
        } catch {
            data = {
                error:
                    response.body ||
                    "Invalid response from current user server",
            };
        }

        return NextResponse.json(data, {
            status: response.statusCode || 200,
        });
    } catch (error) {
        console.error("Local current user route error:", error);
        return NextResponse.json(
            { error: "Current user server error" },
            { status: 500 }
        );
    }
}
