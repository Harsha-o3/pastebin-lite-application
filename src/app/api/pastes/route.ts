export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { getCurrentTime } from "@/lib/utils/time";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, ttl_seconds, max_views } = body;

    if (!content || typeof content !== "string" || content.trim() === "") {
      return NextResponse.json(
        { error: "content is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    if (ttl_seconds !== undefined && (typeof ttl_seconds !== "number" || ttl_seconds < 1)) {
      return NextResponse.json(
        { error: "ttl_seconds must be an integer >= 1" },
        { status: 400 }
      );
    }

    if (max_views !== undefined && (typeof max_views !== "number" || max_views < 1)) {
      return NextResponse.json(
        { error: "max_views must be an integer >= 1" },
        { status: 400 }
      );
    }

    const now = await getCurrentTime();
    let expiresAt: Date | null = null;
    if (ttl_seconds) {
      expiresAt = new Date(now.getTime() + ttl_seconds * 1000);
    }

    const paste = await prisma.paste.create({
      data: {
        content,
        expires_at: expiresAt,
        max_views: max_views || null,
        created_at: now,
      },
    });

    const headersList = await headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const url = `${protocol}://${host}/p/${paste.id}`;

    return NextResponse.json({
      id: paste.id,
      url: url,
    });
  } catch (error) {
    console.error("Create paste error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
