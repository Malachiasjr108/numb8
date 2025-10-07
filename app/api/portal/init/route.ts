
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// POST - Initialize portal echoes
export async function POST() {
  try {
    const echoes = [];
    for (let i = 1; i <= 800; i++) {
      echoes.push({
        echoNumber: i,
        unlocked: i <= 111, // First 111 unlocked
      });
    }

    // Use upsert to avoid duplicates
    for (const echo of echoes) {
      await prisma.portalEcho.upsert({
        where: { echoNumber: echo.echoNumber },
        update: { unlocked: echo.unlocked },
        create: echo,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Portal echoes initialized (800 total, first 111 unlocked)",
    });
  } catch (error) {
    console.error("Error initializing portal:", error);
    return NextResponse.json(
      { error: "Failed to initialize portal" },
      { status: 500 }
    );
  }
}
