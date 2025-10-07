
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// POST - Initialize infinite echoes
export async function POST() {
  try {
    const echoes = [];
    for (let i = 1; i <= 8; i++) {
      echoes.push({
        echoNumber: i,
        unlocked: false,
      });
    }

    for (const echo of echoes) {
      await prisma.infiniteEcho.upsert({
        where: { echoNumber: echo.echoNumber },
        update: { unlocked: echo.unlocked },
        create: echo,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Infinite echoes initialized (8 total, all locked)",
    });
  } catch (error) {
    console.error("Error initializing infinite:", error);
    return NextResponse.json(
      { error: "Failed to initialize infinite" },
      { status: 500 }
    );
  }
}
