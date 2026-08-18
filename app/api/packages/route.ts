import { NextRequest, NextResponse } from "next/server";
import { handler } from "../../../lambda-packages/index.js";

export const runtime = "nodejs";

async function callLocalPackagesLambda(
    body: Record<string, unknown>,
    authHeader: string
) {
    const event = {
        headers: {
            "Content-Type": "application/json",
            Authorization: authHeader,
        },
        body: JSON.stringify(body),
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
            error: response.body || "Invalid response from local packages server.",
        };
    }

    return {
        data,
        status: response.statusCode || 200,
    };
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const authHeader = req.headers.get("authorization") || "";

        if (!body || typeof body !== "object") {
            return NextResponse.json(
                { error: "Invalid request body." },
                { status: 400 }
            );
        }

        if (!body.action) {
            return NextResponse.json(
                { error: "Missing package action." },
                { status: 400 }
            );
        }

        console.log("PACKAGES ROUTE ACTION:", body.action);
        console.log("PACKAGES ROUTE BODY:", body);

        const response = await callLocalPackagesLambda(body, authHeader);

        console.log("PACKAGES LOCAL LAMBDA STATUS:", response.status);
        console.log("PACKAGES LOCAL LAMBDA RESPONSE:", response.data);

        return NextResponse.json(response.data, { status: response.status });
    } catch (error) {
        console.error("PACKAGES ROUTE ERROR:", error);

        return NextResponse.json(
            { error: "Failed to process package request." },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const store_id = searchParams.get("store_id") || searchParams.get("storeId");
        const branch_id = searchParams.get("branch_id") || searchParams.get("branchId");
        const authHeader = req.headers.get("authorization") || "";

        const body: Record<string, unknown> = {
            action: "get_packages",
        };

        if (store_id) body.store_id = Number(store_id);
        if (branch_id) body.branch_id = Number(branch_id);

        console.log("PACKAGES GET BODY:", body);

        const response = await callLocalPackagesLambda(body, authHeader);

        console.log("PACKAGES GET LOCAL LAMBDA STATUS:", response.status);
        console.log("PACKAGES GET LOCAL LAMBDA RESPONSE:", response.data);

        return NextResponse.json(response.data, { status: response.status });
    } catch (error) {
        console.error("PACKAGES GET ROUTE ERROR:", error);

        return NextResponse.json(
            { error: "Failed to load packages." },
            { status: 500 }
        );
    }
}