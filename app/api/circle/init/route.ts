
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// POST - Initialize circle echoes
export async function POST() {
  try {
    const echoes = [];
    for (let i = 1; i <= 80; i++) {
      echoes.push({
        echoNumber: i,
        unlocked: false,
      });
    }

    for (const echo of echoes) {
      await prisma.circleEcho.upsert({
        where: { echoNumber: echo.echoNumber },
        update: { unlocked: echo.unlocked },
        create: echo,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Circle echoes initialized (80 total, all locked)",
    });
  } catch (error) {
    console.error("Error initializing circle:", error);
    return NextResponse.json(
      { error: "Failed to initialize circle" },
      { status: 500 }
    );
  }
}
